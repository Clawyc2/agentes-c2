import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Funciones de agentes
export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getAgent(id: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function updateAgent(id: string, updates: Partial<Agent>) {
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAgent(id: string) {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Funciones de tareas
export async function getTasks(limit = 50) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, agents(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getTasksByAgent(agentId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Funciones de conversaciones
export async function getConversations(taskId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('task_id', taskId)
    .order('timestamp', { ascending: true })
  
  if (error) throw error
  return data
}

// Funciones de stats
export async function getStats() {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .order('date', { ascending: false })
    .limit(7)
  
  if (error) throw error
  return data
}

// Type import
import type { Agent } from '@/types/database'
