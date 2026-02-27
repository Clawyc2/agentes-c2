// Tipos para Agentes C2

export type AgentRank = 'lider' | 'senior' | 'mid' | 'junior' | 'especialista';
export type AgentStatus = 'active' | 'sleeping' | 'working' | 'error';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Specialty = 
  | 'research' 
  | 'design' 
  | 'code' 
  | 'docs' 
  | 'analysis' 
  | 'botmaker'
  | 'testing'
  | 'general';

export interface Agent {
  id: string;
  name: string;
  rank: AgentRank;
  specialty: Specialty;
  status: AgentStatus;
  model: string; // glm-5, etc
  rules: string; // Comportamiento editable por Luis
  tasks_completed: number;
  tasks_failed: number;
  total_tokens: number;
  created_at: string;
  last_active: string;
  avatar?: string;
}

export interface Task {
  id: string;
  agent_id: string;
  agent_name?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project?: string;
  result?: string;
  tokens_used: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  task_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number;
  timestamp: string;
}

export interface DailyStats {
  id: string;
  date: string;
  total_tokens: number;
  tasks_completed: number;
  tasks_failed: number;
  agents_active: number;
  conversations: number;
}

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_tokens_today: number;
  total_tokens_week: number;
}
