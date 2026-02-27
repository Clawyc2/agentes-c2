// ============ DESPACHO CONTABLE ============
import { supabase } from './supabase';

export async function getContableAgents() {
  const { data, error } = await supabase
    .from('conta_agentes')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching contable agents:', error)
    return []
  }
  return data || []
}

export async function getContableClientes() {
  const { data, error } = await supabase
    .from('conta_clientes')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  
  if (error) {
    console.error('Error fetching clientes:', error)
    return []
  }
  return data || []
}

export async function getContableTareas(limit = 50) {
  const { data, error } = await supabase
    .from('conta_tareas')
    .select('*, conta_clientes(nombre), conta_agentes(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching tareas:', error)
    return []
  }
  return data || []
}

export async function getContableAlertas(limit = 20) {
  const { data, error } = await supabase
    .from('conta_alertas')
    .select('*, conta_clientes(nombre), conta_tareas(descripcion)')
    .eq('revisado', false)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching alertas:', error)
    return []
  }
  return data || []
}

export async function getContableStats() {
  // Clientes activos
  const { count: totalClientes } = await supabase
    .from('conta_clientes')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true)
  
  // Facturas pendientes
  const { count: facturasPendientes } = await supabase
    .from('conta_facturas_proveedores')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente')
  
  // Tareas pendientes
  const { count: tareasPendientes } = await supabase
    .from('conta_tareas')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pending')
  
  // Alertas sin revisar
  const { count: alertasPendientes } = await supabase
    .from('conta_alertas')
    .select('*', { count: 'exact', head: true })
    .eq('revisado', false)
  
  // Agentes activos
  const { count: agentesActivos } = await supabase
    .from('conta_agentes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  return {
    totalClientes: totalClientes || 0,
    facturasPendientes: facturasPendientes || 0,
    tareasPendientes: tareasPendientes || 0,
    alertasPendientes: alertasPendientes || 0,
    agentesActivos: agentesActivos || 0,
  }
}

// Crear nuevo cliente
export async function createContableCliente(cliente: {
  nombre: string;
  rfc: string;
  regimen_fiscal?: string;
  email?: string;
  banco_principal?: string;
}) {
  const { data, error } = await supabase
    .from('conta_clientes')
    .insert(cliente)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating cliente:', error)
    return null
  }
  return data
}

// Crear nueva tarea
export async function createContableTarea(tarea: {
  cliente_id: string;
  agente_id: string;
  tipo: string;
  descripcion?: string;
  archivo_s3?: string;
  prioridad?: string;
}) {
  const { data, error } = await supabase
    .from('conta_tareas')
    .insert(tarea)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating tarea:', error)
    return null
  }
  return data
}
