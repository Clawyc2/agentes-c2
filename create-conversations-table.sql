-- Crear tabla de conversaciones para Agentes C2
-- Ejecutar en: https://supabase.com/dashboard/project/teatlhtnhzoovhuykymq/sql

CREATE TABLE IF NOT EXISTS c2_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES c2_agents(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' o 'assistant'
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON c2_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON c2_conversations(created_at DESC);

-- Habilitar RLS
ALTER TABLE c2_conversations ENABLE ROW LEVEL SECURITY;

-- Política para permitir todo (ajustar según necesidades)
CREATE POLICY "Allow all for anon" ON c2_conversations
  FOR ALL USING (true) WITH CHECK (true);

-- Verificar que se creó
SELECT * FROM c2_conversations LIMIT 1;
