import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/agents/tasks
 * Crea una nueva tarea para un agente
 * 
 * Body:
 * - agent_id: string
 * - title: string
 * - description?: string
 * - priority?: 'low' | 'medium' | 'high' | 'critical'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, title, description, priority = 'medium' } = body;

    if (!agent_id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_id, title' },
        { status: 400 }
      );
    }

    // Verificar que el agente existe
    const { data: agent, error: agentError } = await supabase
      .from('c2_agents')
      .select('id, name, status')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Crear tarea
    const { data: task, error: taskError } = await supabase
      .from('c2_tasks')
      .insert({
        agent_id,
        title,
        description: description || null,
        priority,
        status: 'pending'
      })
      .select()
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError);
      return NextResponse.json(
        { error: 'Failed to create task', details: taskError },
        { status: 500 }
      );
    }

    // Actualizar agente a "working"
    await supabase
      .from('c2_agents')
      .update({ status: 'working' })
      .eq('id', agent_id);

    // Actualizar tarea a "in_progress"
    await supabase
      .from('c2_tasks')
      .update({ status: 'in_progress' })
      .eq('id', task.id);

    return NextResponse.json({
      success: true,
      task_id: task.id,
      agent_name: agent.name,
      status: 'in_progress'
    });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/tasks?agent_id=xxx
 * Obtiene las tareas de un agente
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent_id = searchParams.get('agent_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('c2_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (agent_id) {
      query = query.eq('agent_id', agent_id);
    }

    const { data: tasks, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
