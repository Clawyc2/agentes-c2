'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { updateAgent } from '@/lib/supabase';

type Agent = {
  id: string;
  name: string;
  rank: string;
  specialty: string;
  status: string;
  model: string;
  rules: string;
  tasks_completed: number;
  tasks_failed: number;
  total_tokens: number;
  last_active: string;
};

// Modal de Editar Agente
export function EditAgentModal({ 
  agent, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    rank: 'mid',
    specialty: 'general',
    status: 'sleeping',
    model: 'zai/glm-5',
    rules: '',
  });
  const [saving, setSaving] = useState(false);

  // Actualizar formData cuando cambia agent
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        rank: agent.rank,
        specialty: agent.specialty,
        status: agent.status,
        model: agent.model,
        rules: agent.rules,
      });
    }
  }, [agent]);

  const handleSave = async () => {
    if (!agent) return;
    
    setSaving(true);
    try {
      await updateAgent(agent.id, formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <AnimatePresence>
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
          className="bg-[var(--bg2)] rounded-3xl p-6 max-w-lg w-full border border-[var(--gray)] relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-[var(--bg3)] rounded-lg">
            <X className="w-5 h-5 text-[var(--text2)]" />
          </button>

          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Syne' }}>
            ✏️ Editar Agente
          </h2>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm text-[var(--text2)] mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none"
              />
            </div>

            {/* Rango */}
            <div>
              <label className="block text-sm text-[var(--text2)] mb-1">Rango</label>
              <select
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none"
              >
                <option value="lider">👑 Líder</option>
                <option value="senior">⭐⭐⭐ Senior</option>
                <option value="mid">⭐⭐ Mid</option>
                <option value="junior">⭐ Junior</option>
                <option value="especialista">🔷 Especialista</option>
              </select>
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm text-[var(--text2)] mb-1">Especialidad</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none"
              >
                <option value="general">🤖 General</option>
                <option value="research">🔍 Research</option>
                <option value="design">🎨 Design</option>
                <option value="code">💻 Code</option>
                <option value="docs">📝 Docs</option>
                <option value="analysis">📊 Analysis</option>
                <option value="botmaker">🤖 BotMaker</option>
                <option value="testing">🧪 Testing</option>
                <option value="security">🔒 Security</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm text-[var(--text2)] mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none"
              >
                <option value="active">🟢 Activo</option>
                <option value="working">🟠 Trabajando</option>
                <option value="sleeping">⚫ Durmiendo</option>
                <option value="error">🔴 Error</option>
              </select>
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm text-[var(--text2)] mb-1">Modelo</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none"
              />
            </div>

            {/* Reglas */}
            <div>
              <div className="flex flex-col gap-2 mb-1">
                <label className="block text-sm text-[var(--text2)]">Reglas / Comportamiento</label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-colors text-orange-400 font-medium w-fit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  📄 Subir archivo .MD
                  <input
                    type="file"
                    accept=".md,.markdown"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setFormData({ ...formData, rules: content });
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none resize-none font-mono text-xs"
                placeholder="Pega aquí las reglas del agente o sube un archivo .MD..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Modal de Ver Agente (con historial)
export function ViewAgentModal({ 
  agent, 
  isOpen, 
  onClose 
}: { 
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}) {
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

  const rankLabels: Record<string, string> = {
    lider: '👑 Líder',
    senior: '⭐⭐⭐ Senior',
    mid: '⭐⭐ Mid',
    junior: '⭐ Junior',
    especialista: '🔷 Especialista',
  };

  const statusLabels: Record<string, string> = {
    active: '🟢 Activo',
    working: '🟠 Trabajando',
    sleeping: '⚫ Durmiendo',
    error: '🔴 Error',
  };

  return (
    <AnimatePresence>
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
          className="bg-[var(--bg2)] rounded-3xl p-6 max-w-lg w-full border border-[var(--gray)] relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-[var(--bg3)] rounded-lg">
            <X className="w-5 h-5 text-[var(--text2)]" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-3xl">
              {specialtyIcons[agent.specialty] || '🤖'}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>{agent.name}</h2>
              <p className="text-sm text-[var(--text2)]">{rankLabels[agent.rank]}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[var(--bg3)] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{agent.tasks_completed}</p>
              <p className="text-xs text-[var(--text2)]">Completadas</p>
            </div>
            <div className="bg-[var(--bg3)] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{agent.tasks_failed}</p>
              <p className="text-xs text-[var(--text2)]">Fallidas</p>
            </div>
            <div className="bg-[var(--bg3)] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{(agent.total_tokens / 1000).toFixed(1)}K</p>
              <p className="text-xs text-[var(--text2)]">Tokens</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b border-[var(--gray)]">
              <span className="text-[var(--text2)]">Estado</span>
              <span>{statusLabels[agent.status]}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--gray)]">
              <span className="text-[var(--text2)]">Modelo</span>
              <span className="text-xs">{agent.model}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--gray)]">
              <span className="text-[var(--text2)]">Especialidad</span>
              <span>{specialtyIcons[agent.specialty]} {agent.specialty}</span>
            </div>
          </div>

          {/* Reglas */}
          <div>
            <h3 className="font-semibold mb-2">📜 Reglas / Comportamiento</h3>
            <p className="text-sm text-[var(--text2)] bg-[var(--bg3)] rounded-xl p-3">
              {agent.rules || 'Sin reglas definidas'}
            </p>
          </div>

          {/* Botón cerrar */}
          <button onClick={onClose} className="w-full btn-secondary mt-6">
            Cerrar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
