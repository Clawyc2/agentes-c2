import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/agents/sync
 * Sincroniza el estado de un agente después de completar una tarea
 * 
 * Body:
 * - agent_id: string
 * - task_id: string
 * - result: string (resultado completo del subagent)
 * - status?: 'completed' | 'failed'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, task_id, result, status = 'completed' } = body;

    if (!agent_id || !task_id || !result) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_id, task_id, result' },
        { status: 400 }
      );
    }

    // 1. Extraer tokens del resultado
    const tokensUsed = extractTokens(result);
    
    console.log(`Syncing agent ${agent_id}, task ${task_id}, tokens: ${tokensUsed}`);

    // 2. Obtener estado actual del agente
    const { data: agent, error: agentError } = await supabase
      .from('c2_agents')
      .select('total_tokens, tasks_completed, tasks_failed')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found', details: agentError },
        { status: 404 }
      );
    }

    // 3. Actualizar agente
    const agentUpdate: any = {
      status: 'sleeping',
      total_tokens: agent.total_tokens + tokensUsed,
    };

    if (status === 'completed') {
      agentUpdate.tasks_completed = agent.tasks_completed + 1;
    } else {
      agentUpdate.tasks_failed = agent.tasks_failed + 1;
    }

    const { error: updateAgentError } = await supabase
      .from('c2_agents')
      .update(agentUpdate)
      .eq('id', agent_id);

    if (updateAgentError) {
      console.error('Error updating agent:', updateAgentError);
      return NextResponse.json(
        { error: 'Failed to update agent', details: updateAgentError },
        { status: 500 }
      );
    }

    // 4. Actualizar tarea
    const { error: updateTaskError } = await supabase
      .from('c2_tasks')
      .update({
        status,
        tokens_used: tokensUsed,
        completed_at: new Date().toISOString()
      })
      .eq('id', task_id);

    if (updateTaskError) {
      console.error('Error updating task:', updateTaskError);
      return NextResponse.json(
        { error: 'Failed to update task', details: updateTaskError },
        { status: 500 }
      );
    }

    // 5. Guardar vulnerabilidades si es Locky (security agent)
    if (result.includes('VULN-')) {
      await saveVulnerabilities(agent_id, task_id, result);
    }

    // 6. Guardar bugs si es Flowy (QoS agent)
    if (result.includes('BUG-')) {
      await saveBugs(agent_id, task_id, result);
    }

    return NextResponse.json({
      success: true,
      tokens_used: tokensUsed,
      agent_status: 'sleeping',
      task_status: status
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

/**
 * Extrae los tokens del resultado del subagent
 * Formato: "tokens X.Xk (in Y.Yk / out Z.Zk)"
 */
function extractTokens(result: string): number {
  // Buscar patrón: "tokens X.Xk"
  const match = result.match(/tokens\s+([\d.]+)k/i);
  if (match) {
    return Math.round(parseFloat(match[1]) * 1000);
  }
  
  // Fallback: buscar "X.Xk tokens"
  const match2 = result.match(/([\d.]+)k\s+tokens/i);
  if (match2) {
    return Math.round(parseFloat(match2[1]) * 1000);
  }

  // Si no encuentra, retornar 0
  return 0;
}

/**
 * Guarda vulnerabilidades en agent_vulnerabilities
 */
async function saveVulnerabilities(agentId: string, taskId: string, result: string) {
  const vulns = parseVulnerabilities(result);
  
  for (const vuln of vulns) {
    await supabase
      .from('agent_vulnerabilities')
      .insert({
        agent_id: agentId,
        task_id: taskId,
        vuln_id: vuln.id,
        type: vuln.type,
        description: vuln.description,
        severity: vuln.severity,
        cvss_score: vuln.cvss,
        remediation: vuln.remediation,
        location: vuln.location
      });
  }
}

/**
 * Parsea vulnerabilidades del resultado
 */
function parseVulnerabilities(result: string) {
  const vulns: any[] = [];
  const regex = /ID:\s*(VULN-\d+)[\s\S]*?TIPO:\s*([^\n]+)[\s\S]*?DESCRIPCIÓN:\s*([^\n]+)[\s\S]*?SEVERIDAD:\s*([^\n]+)[\s\S]*?CVSS:\s*([\d.]+)[\s\S]*?REMEDIACIÓN:\s*([^\n]+)[\s\S]*?UBICACIÓN:\s*([^\n]+)/gi;
  
  let match;
  while ((match = regex.exec(result)) !== null) {
    vulns.push({
      id: match[1].trim(),
      type: match[2].trim(),
      description: match[3].trim(),
      severity: match[4].trim(),
      cvss: parseFloat(match[5]),
      remediation: match[6].trim(),
      location: match[7].trim()
    });
  }
  
  return vulns;
}

/**
 * Guarda bugs en agent_bugs
 */
async function saveBugs(agentId: string, taskId: string, result: string) {
  const bugs = parseBugs(result);
  
  for (const bug of bugs) {
    await supabase
      .from('agent_bugs')
      .insert({
        agent_id: agentId,
        task_id: taskId,
        bug_id: bug.id,
        type: bug.type,
        description: bug.description,
        severity: bug.severity,
        steps_to_reproduce: bug.steps,
        expected_behavior: bug.expected,
        actual_behavior: bug.actual,
        impact: bug.impact
      });
  }
}

/**
 * Parsea bugs del resultado
 */
function parseBugs(result: string) {
  const bugs: any[] = [];
  const regex = /ID:\s*(BUG-\d+)[\s\S]*?TIPO:\s*([^\n]+)[\s\S]*?DESCRIPCIÓN:\s*([^\n]+)[\s\S]*?SEVERIDAD:\s*([^\n]+)[\s\S]*?PASOS REPRODUCIR:\s*([^\n]+)[\s\S]*?COMPORTAMIENTO ESPERADO:\s*([^\n]+)[\s\S]*?COMPORTAMIENTO ACTUAL:\s*([^\n]+)[\s\S]*?IMPACTO:\s*([^\n]+)/gi;
  
  let match;
  while ((match = regex.exec(result)) !== null) {
    bugs.push({
      id: match[1].trim(),
      type: match[2].trim(),
      description: match[3].trim(),
      severity: match[4].trim(),
      steps: match[5].trim(),
      expected: match[6].trim(),
      actual: match[7].trim(),
      impact: match[8].trim()
    });
  }
  
  return bugs;
}
