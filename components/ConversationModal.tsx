'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, User, Bot, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getConversations, createConversation, getTasksByAgent } from '@/lib/supabase';

type Message = {
  id: string;
  agent_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number;
  created_at: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tokens_used: number;
  created_at: string;
};

type Agent = {
  id: string;
  name: string;
  model: string;
  specialty: string;
  total_tokens: number;
  tasks_completed: number;
  tasks_failed: number;
};

// Modal de Conversación/Logs
export function ConversationModal({ 
  agent, 
  isOpen, 
  onClose 
}: { 
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar tareas del agente
  useEffect(() => {
    if (agent && isOpen) {
      loadTasks();
    }
  }, [agent, isOpen]);

  const loadTasks = async () => {
    if (!agent) return;
    setLoading(true);
    try {
      const agentTasks = await getTasksByAgent(agent.id);
      setTasks(agentTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500/30 bg-green-500/10';
      case 'in_progress': return 'border-orange-500/30 bg-orange-500/10';
      case 'failed': return 'border-red-500/30 bg-red-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
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
    security: '🔒',
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
              <h2 className="font-bold">📋 Actividad - {agent.name}</h2>
              <p className="text-xs text-[var(--text2)]">{agent.model} • {agent.total_tokens.toLocaleString()} tokens totales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg3)] rounded-lg">
            <X className="w-5 h-5 text-[var(--text2)]" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-[var(--gray)]">
          <div className="bg-[var(--bg3)] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{agent.tasks_completed}</p>
            <p className="text-xs text-[var(--text2)]">Completadas</p>
          </div>
          <div className="bg-[var(--bg3)] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{agent.tasks_failed}</p>
            <p className="text-xs text-[var(--text2)]">Fallidas</p>
          </div>
          <div className="bg-[var(--bg3)] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{tasks.length}</p>
            <p className="text-xs text-[var(--text2)]">Total Tareas</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-[var(--text2)]">Sin tareas registradas</p>
              <p className="text-xs text-[var(--text2)] mt-1">Las tareas delegadas por Clawy aparecerán aquí</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`border rounded-xl p-4 ${getStatusColor(task.status)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(task.status)}
                      <h3 className="font-semibold text-sm">{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="text-xs text-[var(--text2)] mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[var(--text2)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(task.created_at)}
                      </span>
                      {task.tokens_used > 0 && (
                        <span className="text-purple-400">⚡ {task.tokens_used.toLocaleString()} tokens</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--gray)] bg-[var(--bg3)]/50">
          <div className="text-center text-xs text-[var(--text2)]">
            🐾 <span className="text-orange-400 font-medium">Mission Control</span> - Sistema de monitoreo de agentes
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
