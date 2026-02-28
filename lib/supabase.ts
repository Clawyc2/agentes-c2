import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// ============ AGENTS ============

export async function getAgents() {
  const { data, error } = await supabase
    .from('c2_agents')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching agents:', error)
    return []
  }
  return data || []
}

export async function getAgent(id: string) {
  const { data, error } = await supabase
    .from('c2_agents')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching agent:', error)
    return null
  }
  return data
}

export async function createAgent(agent: {
  name: string;
  rank: string;
  specialty: string;
  model?: string;
  rules?: string;
}) {
  const { data, error } = await supabase
    .from('c2_agents')
    .insert({
      ...agent,
      status: 'sleeping',
      model: agent.model || 'zai/glm-5',
      rules: agent.rules || '',
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating agent:', error)
    return null
  }
  return data
}

export async function updateAgent(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('c2_agents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating agent:', error)
    return null
  }
  return data
}

export async function deleteAgent(id: string) {
  const { error } = await supabase
    .from('c2_agents')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting agent:', error)
    return false
  }
  return true
}

// ============ TASKS ============

export async function getTasks(limit = 50) {
  const { data, error } = await supabase
    .from('c2_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
  return data || []
}

export async function getTasksByAgent(agentId: string) {
  const { data, error } = await supabase
    .from('c2_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching agent tasks:', error)
    return []
  }
  return data || []
}

export async function createTask(task: {
  agent_id: string;
  title: string;
  description?: string;
  priority?: string;
  project?: string;
}) {
  const { data, error } = await supabase
    .from('c2_tasks')
    .insert({
      ...task,
      status: 'pending',
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating task:', error)
    return null
  }
  return data
}

export async function updateTask(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('c2_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating task:', error)
    return null
  }
  return data
}

// ============ STATS ============

export async function getStats() {
  const { data, error } = await supabase
    .from('c2_daily_stats')
    .select('*')
    .order('date', { ascending: false })
    .limit(7)
  
  if (error) {
    console.error('Error fetching stats:', error)
    return []
  }
  return data || []
}

export async function getDashboardStats() {
  // Get agents count
  const { count: totalAgents } = await supabase
    .from('c2_agents')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeAgents } = await supabase
    .from('c2_agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  // Get tasks count
  const { count: totalTasks } = await supabase
    .from('c2_tasks')
    .select('*', { count: 'exact', head: true })
  
  const { count: completedTasks } = await supabase
    .from('c2_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
  
  const { count: pendingTasks } = await supabase
    .from('c2_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  // Get total tokens from all agents
  const { data: agents } = await supabase
    .from('c2_agents')
    .select('total_tokens')
  
  const totalTokens = agents?.reduce((sum, agent) => sum + (agent.total_tokens || 0), 0) || 0
  
  return {
    totalAgents: totalAgents || 0,
    activeAgents: activeAgents || 0,
    totalTasks: totalTasks || 0,
    completedTasks: completedTasks || 0,
    pendingTasks: pendingTasks || 0,
    totalTokens: totalTokens,
  }
}

// ============ CONVERSATIONS ============

export async function getConversations(agentId: string, limit = 100) {
  const { data, error } = await supabase
    .from('c2_conversations')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
  return data || []
}

export async function createConversation(conv: {
  agent_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
}) {
  const { data, error } = await supabase
    .from('c2_conversations')
    .insert({
      ...conv,
      tokens_used: conv.tokens_used || 0,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }
  return data
}

export async function getAllConversations(limit = 50) {
  const { data, error } = await supabase
    .from('c2_conversations')
    .select('*, c2_agents(name, specialty)')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching all conversations:', error)
    return []
  }
  return data || []
}
