'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, User, Bot, Clock } from 'lucide-react';
import { getConversations, createConversation } from '@/lib/supabase';

type Message = {
  id: string;
  agent_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number;
  created_at: string;
};

type Agent = {
  id: string;
  name: string;
  model: string;
  specialty: string;
};

// Modal de Conversación
export function ConversationModal({ 
  agent, 
  isOpen, 
  onClose 
}: { 
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Cargar conversaciones
  useEffect(() => {
    if (agent && isOpen) {
      loadMessages();
    }
  }, [agent, isOpen]);

  const loadMessages = async () => {
    if (!agent) return;
    setLoading(true);
    try {
      const convs = await getConversations(agent.id);
      setMessages(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !agent) return;
    
    const userMessage = input.trim();
    setInput('');
    setSending(true);

    try {
      // Guardar mensaje del usuario
      await createConversation({
        agent_id: agent.id,
        role: 'user',
        content: userMessage,
      });

      // Aquí iría la lógica para enviar al modelo del agente
      // Por ahora solo guardamos el mensaje del usuario
      
      // Recargar mensajes
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    return `hace ${minutes}m`;
  };

  if (!isOpen || !agent) return null;

  const specialtyIcons: Record<string, string> = {
    research: '🔍',
    design: '🎨',
    code: '💻',
    docs: '📝',
    analysis: '📊',
    botmaker: '🤖',
    testing: '🧪',
    general: '🤖',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--bg2)] rounded-3xl max-w-2xl w-full border border-[var(--gray)] relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--gray)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-xl">
              {specialtyIcons[agent.specialty] || '🤖'}
            </div>
            <div>
              <h2 className="font-bold">📋 Historial - {agent.name}</h2>
              <p className="text-xs text-[var(--text2)]">{agent.model}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg3)] rounded-lg">
            <X className="w-5 h-5 text-[var(--text2)]" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-[var(--text2)]">Sin actividad registrada</p>
              <p className="text-xs text-[var(--text2)] mt-1">Las tareas delegadas aparecerán aquí</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-500/20 text-right'
                    : 'bg-[var(--bg3)]'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text2)]">
                    <Clock className="w-3 h-3" />
                    {timeAgo(msg.created_at)}
                    {msg.tokens_used > 0 && (
                      <span className="text-purple-400">⚡ {msg.tokens_used} tokens</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input - READ ONLY, no escribir */}
        <div className="p-4 border-t border-[var(--gray)] bg-[var(--bg3)]/50">
          <div className="text-center text-xs text-[var(--text2)]">
            🔒 <span className="text-orange-400 font-medium">Solo lectura</span> - Las conversaciones se generan cuando Clawy delega tareas a los agentes
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
