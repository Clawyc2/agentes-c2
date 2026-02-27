-- ==========================================
-- AGENTES C2 - TABLAS PARA SUPABASE
-- Ejecutar en SQL Editor de Supabase
-- ==========================================

-- Tabla de Agentes
CREATE TABLE IF NOT EXISTS c2_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rank TEXT NOT NULL CHECK (rank IN ('lider', 'senior', 'mid', 'junior', 'especialista')),
  specialty TEXT NOT NULL CHECK (specialty IN ('research', 'design', 'code', 'docs', 'analysis', 'botmaker', 'testing', 'general')),
  status TEXT NOT NULL DEFAULT 'sleeping' CHECK (status IN ('active', 'sleeping', 'working', 'error')),
  model TEXT DEFAULT 'zai/glm-5',
  rules TEXT DEFAULT '',
  tasks_completed INT DEFAULT 0,
  tasks_failed INT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar TEXT
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS c2_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES c2_agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  project TEXT DEFAULT '',
  result TEXT DEFAULT '',
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de Conversaciones
CREATE TABLE IF NOT EXISTS c2_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES c2_agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES c2_tasks(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Estadísticas Diarias
CREATE TABLE IF NOT EXISTS c2_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_tokens BIGINT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  tasks_failed INT DEFAULT 0,
  agents_active INT DEFAULT 0,
  conversations INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE c2_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE c2_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE c2_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE c2_daily_stats ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para anon key)
CREATE POLICY "Allow public read access" ON c2_agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON c2_agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON c2_agents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON c2_agents FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON c2_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON c2_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON c2_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON c2_tasks FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON c2_conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON c2_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON c2_daily_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON c2_daily_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON c2_daily_stats FOR UPDATE USING (true);

-- Insertar agente LÍDER (Clawy)
INSERT INTO c2_agents (name, rank, specialty, status, model, rules, tasks_completed)
VALUES (
  'Clawy',
  'lider',
  'general',
  'active',
  'zai/glm-5',
  'Líder del swarm. Coordinador de agentes, evaluador de trabajo, asignador de tareas. Habla español con Luis. Es técnico, directo y honesto.',
  1
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_c2_tasks_agent ON c2_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_c2_tasks_status ON c2_tasks(status);
CREATE INDEX IF NOT EXISTS idx_c2_conversations_task ON c2_conversations(task_id);
CREATE INDEX IF NOT EXISTS idx_c2_conversations_agent ON c2_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_c2_daily_stats_date ON c2_daily_stats(date);
