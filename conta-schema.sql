-- ============================================
-- DESPACHO CONTABLE - TABLAS EN SUPABASE
-- Ejecutar en: https://supabase.com/dashboard/project/teatlhtnhzoovhuykymq/sql/new
-- ============================================

-- 1. CLIENTES DEL DESPACHO
CREATE TABLE conta_clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  rfc TEXT UNIQUE NOT NULL,
  regimen_fiscal TEXT,
  email TEXT,
  banco_principal TEXT,
  activo BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROVEEDORES CONOCIDOS
CREATE TABLE conta_proveedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  nombre TEXT NOT NULL,
  rfc TEXT NOT NULL,
  es_recurrente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FACTURAS DE PROVEEDORES (CUENTAS POR PAGAR)
CREATE TABLE conta_facturas_proveedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  proveedor_rfc TEXT,
  proveedor_nombre TEXT,
  uuid_sat TEXT UNIQUE,
  fecha DATE NOT NULL,
  subtotal DECIMAL(12,2),
  iva DECIMAL(12,2),
  total DECIMAL(12,2) NOT NULL,
  concepto TEXT,
  cuenta_contable TEXT,
  estado TEXT DEFAULT 'pendiente',
  archivo_s3 TEXT,
  agente_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pagada_at TIMESTAMPTZ
);

-- 4. FACTURAS A CLIENTES (CUENTAS POR COBRAR)
CREATE TABLE conta_facturas_clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  uuid_sat TEXT UNIQUE,
  fecha DATE NOT NULL,
  subtotal DECIMAL(12,2),
  iva DECIMAL(12,2),
  total DECIMAL(12,2) NOT NULL,
  concepto TEXT,
  estado TEXT DEFAULT 'pendiente',
  archivo_s3 TEXT,
  agente_id TEXT,
  timbrada_at TIMESTAMPTZ,
  enviada_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cobrada_at TIMESTAMPTZ
);

-- 5. MOVIMIENTOS BANCARIOS
CREATE TABLE conta_movimientos_bancarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  fecha DATE NOT NULL,
  descripcion TEXT,
  referencia TEXT,
  cargo DECIMAL(12,2) DEFAULT 0,
  abono DECIMAL(12,2) DEFAULT 0,
  saldo DECIMAL(12,2),
  banco TEXT,
  cuenta TEXT,
  archivo_s3 TEXT,
  agente_id TEXT,
  conciliado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONCILIACIONES
CREATE TABLE conta_conciliaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  factura_id UUID,
  movimiento_id UUID REFERENCES conta_movimientos_bancarios(id),
  confianza DECIMAL(3,2),
  tipo_match TEXT,
  creado_por_agente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AGENTES CONTABLES
CREATE TABLE conta_agentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  status TEXT DEFAULT 'sleeping',
  model TEXT DEFAULT 'zai/glm-5',
  rules TEXT,
  tasks_completed INT DEFAULT 0,
  tasks_failed INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TAREAS CONTABLES
CREATE TABLE conta_tareas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  agente_id UUID REFERENCES conta_agentes(id),
  tipo TEXT NOT NULL,
  descripcion TEXT,
  archivo_s3 TEXT,
  estado TEXT DEFAULT 'pending',
  prioridad TEXT DEFAULT 'normal',
  resultado JSONB,
  tokens_usados INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completada_at TIMESTAMPTZ
);

-- 9. ALERTAS
CREATE TABLE conta_alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  tarea_id UUID REFERENCES conta_tareas(id),
  nivel TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  revisado BOOLEAN DEFAULT false,
  revisado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDITORÍA
CREATE TABLE conta_auditoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES conta_clientes(id),
  agente_id TEXT,
  accion TEXT NOT NULL,
  tabla TEXT,
  registro_id UUID,
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_conta_clientes_rfc ON conta_clientes(rfc);
CREATE INDEX idx_conta_fact_prov_cliente ON conta_facturas_proveedores(cliente_id);
CREATE INDEX idx_conta_fact_prov_fecha ON conta_facturas_proveedores(fecha);
CREATE INDEX idx_conta_fact_cli_cliente ON conta_facturas_clientes(cliente_id);
CREATE INDEX idx_conta_mov_cliente ON conta_movimientos_bancarios(cliente_id);
CREATE INDEX idx_conta_mov_fecha ON conta_movimientos_bancarios(fecha);
CREATE INDEX idx_conta_tareas_agente ON conta_tareas(agente_id);
CREATE INDEX idx_conta_tareas_estado ON conta_tareas(estado);
CREATE INDEX idx_conta_alertas_nivel ON conta_alertas(nivel);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE conta_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_facturas_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_facturas_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_movimientos_bancarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_conciliaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (ajustar según necesidades)
CREATE POLICY "Allow all for anon" ON conta_clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_facturas_proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_facturas_clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_movimientos_bancarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_conciliaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_agentes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_tareas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_alertas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON conta_auditoria FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INSERTAR AGENTES CONTABLES
-- ============================================
INSERT INTO conta_agentes (name, specialty, status, model, rules) VALUES
('Facturador', 'proveedores', 'sleeping', 'zai/glm-5', 'Especialista en procesar facturas de proveedores (XML CFDI y PDF). Extrae RFC, UUID, fecha, subtotal, IVA, total y concepto. Valida estructura CFDI 4.0. Clasifica cuenta contable según concepto. Trabaja en español.'),
('Cobrador', 'clientes', 'sleeping', 'zai/glm-5', 'Especialista en generar facturas a clientes y cuentas por cobrar. Crea borradores con datos del cliente, timbra CFDI vía PAC, envía PDF+XML por correo. Detecta saldos vencidos. Trabaja en español.'),
('Conciliador', 'bancos', 'sleeping', 'blackboxai/google/gemini-2.0-flash-lite-001', 'Especialista en leer estados de cuenta bancarios en PDF. Extrae tabla de movimientos con fecha, descripción, cargo, abono y saldo. Empareja con facturas por monto y fecha. Detecta movimientos no conciliados. Trabaja en español.'),
('Alertador', 'alertas', 'sleeping', 'zai/glm-5', 'Especialista en detectar anomalías contables. Monitorea IVA no coincidente, RFC desconocidos, montos inusuales, discrepancias contables. Genera alertas por nivel de severidad. Trabaja en español.'),
('Registrador', 'registro', 'sleeping', 'zai/glm-5', 'Especialista en guardar y recuperar datos en Supabase. Opera como capa de abstracción entre agentes y base de datos. Registra auditoría de cada operación. Trabaja en español.');

-- ============================================
-- VERIFICAR
-- ============================================
SELECT '✅ Tablas creadas correctamente' as status;
SELECT * FROM conta_agentes;
