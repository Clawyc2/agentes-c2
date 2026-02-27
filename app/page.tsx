'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Zap, Clock, CheckCircle, XCircle,
  Settings, Trash2, Edit, Eye, ChevronRight, Search,
  AlertCircle, TrendingUp, Calendar, MessageSquare, Menu, X
} from 'lucide-react';

// Datos mock para demo
const MOCK_AGENTS = [
  {
    id: '1',
    name: 'Clawy',
    rank: 'lider' as const,
    specialty: 'general' as const,
    status: 'active' as const,
    model: 'zai/glm-5',
    rules: 'Líder del swarm. Coordina agentes, evalúa trabajo, asigna tareas.',
    tasks_completed: 47,
    tasks_failed: 2,
    total_tokens: 125430,
    last_active: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Researcher',
    rank: 'senior' as const,
    specialty: 'research' as const,
    status: 'working' as const,
    model: 'zai/glm-5',
    rules: 'Especialista en investigación web, APIs y tendencias crypto.',
    tasks_completed: 23,
    tasks_failed: 1,
    total_tokens: 89250,
    last_active: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Designer',
    rank: 'mid' as const,
    specialty: 'design' as const,
    status: 'sleeping' as const,
    model: 'zai/glm-5',
    rules: 'Diseño UI/UX, branding y assets visuales.',
    tasks_completed: 15,
    tasks_failed: 0,
    total_tokens: 67840,
    last_active: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '4',
    name: 'Coder',
    rank: 'senior' as const,
    specialty: 'code' as const,
    status: 'active' as const,
    model: 'zai/glm-5',
    rules: 'Desarrollo de código, debugging y refactoring.',
    tasks_completed: 38,
    tasks_failed: 3,
    total_tokens: 98320,
    last_active: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'DocWriter',
    rank: 'junior' as const,
    specialty: 'docs' as const,
    status: 'sleeping' as const,
    model: 'zai/glm-5',
    rules: 'Documentación técnica y whitepapers.',
    tasks_completed: 12,
    tasks_failed: 1,
    total_tokens: 45210,
    last_active: new Date(Date.now() - 7200000).toISOString(),
  },
];

const MOCK_TASKS = [
  {
    id: '1',
    agent_id: '2',
    agent_name: 'Researcher',
    title: 'Investigar oráculos DeFi más confiables',
    status: 'in_progress' as const,
    priority: 'high' as const,
    project: 'Sati Academy',
    tokens_used: 1250,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '2',
    agent_id: '4',
    agent_name: 'Coder',
    title: 'Mejorar performance del timeline',
    status: 'completed' as const,
    priority: 'medium' as const,
    project: 'Sati Academy',
    tokens_used: 890,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '3',
    agent_id: '3',
    agent_name: 'Designer',
    title: 'Diseñar dashboard de métricas',
    status: 'pending' as const,
    priority: 'medium' as const,
    project: 'Agentes C2',
    tokens_used: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    agent_id: '2',
    agent_name: 'Researcher',
    title: 'Analizar competencia de apps Bitcoin',
    status: 'completed' as const,
    priority: 'low' as const,
    project: 'Sati Academy',
    tokens_used: 2100,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 5400000).toISOString(),
  },
];

// Componente de Sidebar
function Sidebar({ activeTab, onTabChange, collapsed }: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  collapsed: boolean;
}) {
  const tabs = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'agents', icon: Users, label: 'Agentes' },
    { id: 'tasks', icon: CheckCircle, label: 'Tareas' },
    { id: 'conversations', icon: MessageSquare, label: 'Conversaciones' },
    { id: 'stats', icon: TrendingUp, label: 'Estadísticas' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[var(--bg2)] border-r border-[var(--gray)] flex flex-col z-40 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-[var(--gray)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-2xl shrink-0">
            🐾
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg" style={{ fontFamily: 'Syne' }}>Agentes C2</h1>
              <p className="text-xs text-[var(--text2)]">Command Center</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500/10 border-l-4 border-orange-500 text-orange-400'
                : 'text-[var(--text)] hover:bg-[var(--bg3)]'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? tab.label : undefined}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium">{tab.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-[var(--gray)]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg3)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">Luis</p>
              <p className="text-xs text-[var(--text2)]">👑 Owner</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// Componente de Header Stats
function HeaderStats() {
  const stats = [
    { label: 'Agentes Activos', value: '3', icon: Users, color: 'text-green-400' },
    { label: 'Tareas Hoy', value: '12', icon: CheckCircle, color: 'text-orange-400' },
    { label: 'Tokens Hoy', value: '125K', icon: Zap, color: 'text-purple-400' },
    { label: 'Tasa Éxito', value: '94%', icon: TrendingUp, color: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="card flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-xl bg-[var(--bg3)] flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-[var(--text2)]">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Componente de Card de Agente
function AgentCard({ agent, onEdit, onDelete, onView }: { 
  agent: typeof MOCK_AGENTS[0];
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const rankIcons = {
    lider: '👑',
    senior: '⭐⭐⭐',
    mid: '⭐⭐',
    junior: '⭐',
    especialista: '🔷',
  };

  const statusColors = {
    active: 'bg-green-500',
    working: 'bg-orange-500 animate-pulse',
    sleeping: 'bg-gray-500',
    error: 'bg-red-500',
  };

  const statusLabels = {
    active: 'Activo',
    working: 'Trabajando',
    sleeping: 'Durmiendo',
    error: 'Error',
  };

  const specialtyIcons = {
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
            {specialtyIcons[agent.specialty]}
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusColors[agent.status]} border-2 border-[var(--bg2)]`} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{agent.name}</h3>
            <p className="text-sm text-[var(--text2)]">{rankIcons[agent.rank]} {agent.rank}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
          agent.status === 'working' ? 'bg-orange-500/20 text-orange-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {statusLabels[agent.status]}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="p-2 rounded-lg bg-[var(--bg3)]">
          <p className="text-lg font-bold text-green-400">{agent.tasks_completed}</p>
          <p className="text-xs text-[var(--text2)]">Completadas</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg3)]">
          <p className="text-lg font-bold text-red-400">{agent.tasks_failed}</p>
          <p className="text-xs text-[var(--text2)]">Fallidas</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg3)]">
          <p className="text-lg font-bold text-purple-400">{(agent.total_tokens / 1000).toFixed(1)}K</p>
          <p className="text-xs text-[var(--text2)]">Tokens</p>
        </div>
      </div>

      {/* Model */}
      <p className="text-xs text-[var(--text2)] mb-4">
        Modelo: <span className="text-[var(--text)]">{agent.model}</span>
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onView} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1">
          <Eye className="w-4 h-4" /> Ver
        </button>
        <button onClick={onEdit} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1">
          <Edit className="w-4 h-4" /> Editar
        </button>
        <button onClick={onDelete} className="px-3 py-2 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Componente de Tarea
function TaskItem({ task }: { task: typeof MOCK_TASKS[0] }) {
  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-gray-400" />,
    in_progress: <Activity className="w-4 h-4 text-orange-400 animate-pulse" />,
    completed: <CheckCircle className="w-4 h-4 text-green-400" />,
    failed: <XCircle className="w-4 h-4 text-red-400" />,
  };

  const priorityColors = {
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
    <div className={`p-4 bg-[var(--bg2)] rounded-lg border-l-4 ${priorityColors[task.priority]} hover:bg-[var(--bg3)] transition-colors cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {statusIcons[task.status]}
            <span className="font-semibold text-sm">{task.title}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text2)]">
            <span>🤖 {task.agent_name}</span>
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
function DashboardView() {
  return (
    <div>
      <HeaderStats />
      
      {/* Agentes */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
          <Users className="w-5 h-5 text-orange-400" />
          Agentes Activos
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {MOCK_AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => console.log('Edit:', agent.id)}
              onDelete={() => console.log('Delete:', agent.id)}
              onView={() => console.log('View:', agent.id)}
            />
          ))}
        </div>
      </div>

      {/* Tareas Recientes */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
          <Activity className="w-5 h-5 text-orange-400" />
          Tareas Recientes
        </h2>
        <div className="space-y-2">
          {MOCK_TASKS.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Vista de Agentes
function AgentsView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Gestión de Agentes</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text2)]" />
            <input
              type="text"
              placeholder="Buscar agente..."
              className="pl-10 pr-4 py-2 bg-[var(--bg3)] border border-[var(--gray)] rounded-lg focus:border-orange-500 outline-none"
            />
          </div>
          <button className="btn-primary">+ Nuevo Agente</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MOCK_AGENTS.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onEdit={() => console.log('Edit:', agent.id)}
            onDelete={() => console.log('Delete:', agent.id)}
            onView={() => console.log('View:', agent.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Vista de Tareas
function TasksView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Tareas</h2>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">Todas</button>
          <button className="btn-secondary">Pendientes</button>
          <button className="btn-secondary">En Progreso</button>
          <button className="btn-secondary">Completadas</button>
        </div>
      </div>

      <div className="space-y-2">
        {[...MOCK_TASKS, ...MOCK_TASKS].map((task, i) => (
          <TaskItem key={`${task.id}-${i}`} task={task} />
        ))}
      </div>
    </div>
  );
}

// Main Page
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'agents':
        return <AgentsView />;
      case 'tasks':
        return <TasksView />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">En construcción</h2>
              <p className="text-[var(--text2)]">Esta sección estará disponible pronto</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} collapsed={sidebarCollapsed} />
      
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed top-4 z-50 p-2 bg-[var(--bg2)] border border-[var(--gray)] rounded-lg hover:bg-[var(--bg3)] transition-colors"
        style={{ left: sidebarCollapsed ? '5rem' : '16rem' }}
      >
        {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>
      
      <main 
        className="p-6 pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '5rem' : '16rem' }}
      >
        {renderView()}
      </main>
    </div>
  );
}
