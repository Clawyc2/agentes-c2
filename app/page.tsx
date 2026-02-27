'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Zap, Clock, CheckCircle, XCircle,
  Settings, Trash2, Edit, Eye, ChevronRight, Search,
  AlertCircle, TrendingUp, Calendar, MessageSquare, Menu, X, Loader2,
  Calculator, FileSpreadsheet
} from 'lucide-react';
import { getAgents, getTasks, getDashboardStats, deleteAgent } from '@/lib/supabase';
import { EditAgentModal, ViewAgentModal } from '@/components/AgentModals';
import { ConversationModal } from '@/components/ConversationModal';

// Tipos
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

type Task = {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project: string;
  tokens_used: number;
  created_at: string;
};

// Componente de Sidebar
function Sidebar({ activeTab, onTabChange, collapsed, onClose }: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onClose: () => void;
}) {
  const tabs = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'agents', icon: Users, label: 'Agentes' },
    { id: 'tasks', icon: CheckCircle, label: 'Tareas' },
    { id: 'conversations', icon: MessageSquare, label: 'Conversaciones' },
    { id: 'stats', icon: TrendingUp, label: 'Estadísticas' },
    { id: 'divider', icon: null, label: '───' },
    { id: 'contable', icon: Calculator, label: 'Despacho Contable' },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={onClose}
      />
      
      <aside className={`fixed left-0 top-0 h-screen bg-[var(--bg2)] border-r border-[var(--gray)] flex flex-col z-40 transition-all duration-300 ${
        collapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'
      } md:relative`}>
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-[var(--gray)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-xl md:text-2xl shrink-0">
                🐾
              </div>
              {!collapsed && (
                <div>
                  <h1 className="font-bold text-sm md:text-lg" style={{ fontFamily: 'Syne' }}>Agentes C2</h1>
                  <p className="text-xs text-[var(--text2)] hidden md:block">Command Center</p>
                </div>
              )}
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-2 hover:bg-[var(--bg3)] rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 md:py-4 overflow-y-auto">
          {tabs.map((tab) => {
            if (tab.id === 'divider') {
              return (
                <div key={tab.id} className="px-4 py-2">
                  <div className="border-t border-[var(--gray)]" />
                </div>
              );
            }
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 md:px-6 py-3 transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500/10 border-l-4 border-orange-500 text-orange-400'
                    : 'text-[var(--text)] hover:bg-[var(--bg3)]'
                } ${collapsed ? 'md:justify-center' : ''}`}
                title={collapsed ? tab.label : undefined}
              >
                {tab.icon && <tab.icon className="w-5 h-5 shrink-0" />}
                {(!collapsed || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                  <span className="font-medium text-sm md:text-base">{tab.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 md:p-4 border-t border-[var(--gray)]">
            <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-[var(--bg3)]">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-sm md:text-base shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs md:text-sm truncate">Luis</p>
                <p className="text-xs text-[var(--text2)]">👑 Owner</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// Componente de Header Stats
function HeaderStats({ stats }: { stats: { totalAgents: number; activeAgents: number; totalTasks: number; completedTasks: number } }) {
  const statItems = [
    { label: 'Agentes', value: stats.activeAgents || 0, icon: Users, color: 'text-green-400' },
    { label: 'Tareas', value: stats.totalTasks || 0, icon: CheckCircle, color: 'text-orange-400' },
    { label: 'Completadas', value: stats.completedTasks || 0, icon: Zap, color: 'text-purple-400' },
    { label: 'Total Agentes', value: stats.totalAgents || 0, icon: TrendingUp, color: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
      {statItems.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="card flex items-center gap-2 md:gap-4 p-3 md:p-4"
        >
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--bg3)] flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs md:text-sm text-[var(--text2)]">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Componente de Card de Agente
function AgentCard({ agent, onEdit, onDelete, onView, onChat }: { 
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onView: (agent: Agent) => void;
  onChat: (agent: Agent) => void;
}) {
  const rankIcons: Record<string, string> = {
    lider: '👑',
    senior: '⭐⭐⭐',
    mid: '⭐⭐',
    junior: '⭐',
    especialista: '🔷',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    working: 'bg-orange-500 animate-pulse',
    sleeping: 'bg-gray-500',
    error: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    working: 'Trabajando',
    sleeping: 'Durmiendo',
    error: 'Error',
  };

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card hover:border-orange-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-2xl relative">
            {specialtyIcons[agent.specialty] || '🤖'}
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusColors[agent.status]} border-2 border-[var(--bg2)]`} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{agent.name}</h3>
            <p className="text-sm text-[var(--text2)]">{rankIcons[agent.rank] || '⭐'} {agent.rank}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
          agent.status === 'working' ? 'bg-orange-500/20 text-orange-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {statusLabels[agent.status] || agent.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 md:mb-4 text-center">
        <div className="p-2 rounded-lg bg-[var(--bg3)]">
          <p className="text-base md:text-lg font-bold text-green-400">{agent.tasks_completed}</p>
          <p className="text-[10px] md:text-xs text-[var(--text2)]">Completadas</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg3)]">
          <p className="text-base md:text-lg font-bold text-red-400">{agent.tasks_failed}</p>
          <p className="text-[10px] md:text-xs text-[var(--text2)]">Fallidas</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg3)]">
          <p className="text-base md:text-lg font-bold text-purple-400">{(agent.total_tokens / 1000).toFixed(1)}K</p>
          <p className="text-[10px] md:text-xs text-[var(--text2)]">Tokens</p>
        </div>
      </div>

      {/* Model */}
      <p className="text-xs text-[var(--text2)] mb-4">
        Modelo: <span className="text-[var(--text)]">{agent.model}</span>
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onView(agent)} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1">
          <Eye className="w-4 h-4" /> Info
        </button>
        <button onClick={() => onChat(agent)} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1">
          📋 Logs
        </button>
        <button onClick={() => onEdit(agent)} className="px-3 py-2 border border-[var(--gray)] rounded-lg hover:bg-[var(--bg3)] transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(agent)} className="px-3 py-2 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Componente de Tarea
function TaskItem({ task }: { task: Task }) {
  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4 text-gray-400" />,
    in_progress: <Activity className="w-4 h-4 text-orange-400 animate-pulse" />,
    completed: <CheckCircle className="w-4 h-4 text-green-400" />,
    failed: <XCircle className="w-4 h-4 text-red-400" />,
  };

  const priorityColors: Record<string, string> = {
    low: 'border-l-gray-400',
    medium: 'border-l-orange-400',
    high: 'border-l-red-400',
    urgent: 'border-l-red-500',
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `hace ${hours}h`;
    return `hace ${minutes}m`;
  };

  return (
    <div className={`p-4 bg-[var(--bg2)] rounded-lg border-l-4 ${priorityColors[task.priority] || 'border-l-gray-400'} hover:bg-[var(--bg3)] transition-colors cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {statusIcons[task.status]}
            <span className="font-semibold text-sm">{task.title}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text2)]">
            {task.project && <span>📁 {task.project}</span>}
            <span>🕐 {timeAgo(task.created_at)}</span>
            {task.tokens_used > 0 && <span>⚡ {task.tokens_used} tokens</span>}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--text2)]" />
      </div>
    </div>
  );
}

// Dashboard Principal
function DashboardView({ agents, tasks, stats, onEdit, onDelete, onView, onChat }: { 
  agents: Agent[]; 
  tasks: Task[];
  stats: { totalAgents: number; activeAgents: number; totalTasks: number; completedTasks: number };
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onView: (agent: Agent) => void;
  onChat: (agent: Agent) => void;
}) {
  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-400" />
          <p className="text-[var(--text2)]">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeaderStats stats={stats} />
      
      {/* Agentes */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
          <Users className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
          Agentes Activos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onChat={onChat}
            />
          ))}
        </div>
      </div>

      {/* Tareas Recientes */}
      {tasks.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
            Tareas Recientes
          </h2>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Vista de Agentes
function AgentsView({ agents, onEdit, onDelete, onView, onChat }: { 
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onView: (agent: Agent) => void;
  onChat: (agent: Agent) => void;
}) {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
        <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Gestión de Agentes</h2>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text2)]" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full md:w-auto pl-9 md:pl-10 pr-4 py-2 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none text-sm"
            />
          </div>
          <button className="btn-primary text-sm whitespace-nowrap">+ Nuevo</button>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-[var(--text2)]">No hay agentes aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onChat={onChat}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Vista de Tareas
function TasksView({ tasks }: { tasks: Task[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Tareas</h2>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs md:text-sm">Todas</button>
          <button className="btn-secondary text-xs md:text-sm">Pendientes</button>
          <button className="btn-secondary text-xs md:text-sm">Completadas</button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-[var(--text2)]">No hay tareas aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

// Vista Despacho Contable (NUEVO)
function ContableView() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
            <Calculator className="w-6 h-6 text-green-400" />
            Despacho Contable
          </h2>
          <p className="text-sm text-[var(--text2)] mt-1">Automatización contable con agentes especializados</p>
        </div>
      </div>

      {/* Estado vacío por ahora */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-5xl mb-6">
          🧮
        </div>
        <h3 className="text-xl font-bold mb-2">Sección en construcción</h3>
        <p className="text-[var(--text2)] text-center max-w-md mb-6">
          Aquí vivirán los agentes especializados en contabilidad:<br />
          Facturador, Cobrador, Conciliador, Alertador y Registrador.
        </p>
        
        {/* Preview de lo que vendrá */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-6">
          <div className="card p-4 text-center border-dashed border-2 border-[var(--gray)]">
            <div className="text-3xl mb-2">📥</div>
            <p className="font-semibold">Facturador</p>
            <p className="text-xs text-[var(--text2)]">Proveedores</p>
          </div>
          <div className="card p-4 text-center border-dashed border-2 border-[var(--gray)]">
            <div className="text-3xl mb-2">📤</div>
            <p className="font-semibold">Cobrador</p>
            <p className="text-xs text-[var(--text2)]">Clientes</p>
          </div>
          <div className="card p-4 text-center border-dashed border-2 border-[var(--gray)]">
            <div className="text-3xl mb-2">🏦</div>
            <p className="font-semibold">Conciliador</p>
            <p className="text-xs text-[var(--text2)]">Bancos</p>
          </div>
          <div className="card p-4 text-center border-dashed border-2 border-[var(--gray)]">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="font-semibold">Alertador</p>
            <p className="text-xs text-[var(--text2)]">Anomalías</p>
          </div>
          <div className="card p-4 text-center border-dashed border-2 border-[var(--gray)]">
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold">Registrador</p>
            <p className="text-xs text-[var(--text2)]">Supabase</p>
          </div>
          <div className="card p-4 text-center border-dashed border-2 border-[var(--gray)]">
            <div className="text-3xl mb-2">👑</div>
            <p className="font-semibold">Clawy</p>
            <p className="text-xs text-[var(--text2)]">Orquestador</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ totalAgents: 0, activeAgents: 0, totalTasks: 0, completedTasks: 0 });
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);
  const [chattingAgent, setChattingAgent] = useState<Agent | null>(null);

  // Cargar datos de Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [agentsData, tasksData, statsData] = await Promise.all([
          getAgents(),
          getTasks(),
          getDashboardStats(),
        ]);
        
        setAgents(agentsData);
        setTasks(tasksData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Handlers para acciones de agentes
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
  };

  const handleViewAgent = (agent: Agent) => {
    setViewingAgent(agent);
  };

  const handleChatAgent = (agent: Agent) => {
    setChattingAgent(agent);
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (confirm(`¿Eliminar a ${agent.name}?`)) {
      await deleteAgent(agent.id);
      window.location.reload();
    }
  };

  const handleSaveAgent = () => {
    setEditingAgent(null);
    window.location.reload();
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-400" />
            <p className="text-[var(--text2)]">Conectando con Supabase...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            agents={agents} 
            tasks={tasks} 
            stats={stats}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
            onView={handleViewAgent}
            onChat={handleChatAgent}
          />
        );
      case 'agents':
        return (
          <AgentsView 
            agents={agents}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
            onView={handleViewAgent}
            onChat={handleChatAgent}
          />
        );
      case 'tasks':
        return <TasksView tasks={tasks} />;
      case 'contable':
        return <ContableView />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">En construcción</h2>
              <p className="text-sm md:text-base text-[var(--text2)]">Esta sección estará disponible pronto</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        collapsed={!sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Header móvil */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg2)] border-b border-[var(--gray)] z-20 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-[var(--bg3)] rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-lg">
            🐾
          </div>
          <span className="font-bold" style={{ fontFamily: 'Syne' }}>Agentes C2</span>
        </div>
      </header>
      
      <main className="pt-16 md:pt-0 p-4 md:p-6 md:ml-64">
        {renderView()}
      </main>

      {/* Modales */}
      <EditAgentModal
        agent={editingAgent}
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        onSave={handleSaveAgent}
      />
      
      <ViewAgentModal
        agent={viewingAgent}
        isOpen={!!viewingAgent}
        onClose={() => setViewingAgent(null)}
      />
      
      <ConversationModal
        agent={chattingAgent}
        isOpen={!!chattingAgent}
        onClose={() => setChattingAgent(null)}
      />
    </div>
  );
}
