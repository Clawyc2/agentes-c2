-- Insertar 3 agentes nuevos para Clawy
INSERT INTO c2_agents (name, rank, specialty, status, model, rules, tasks_completed) VALUES
('Researcher', 'senior', 'research', 'sleeping', 'zai/glm-5', 'Especialista en investigación web, APIs, tendencias crypto y mejores prácticas. Busca información actualizada, compara tecnologías, analiza competencia y provee insights. Trabaja en español con Clawy.', 0),
('Coder', 'senior', 'code', 'sleeping', 'zai/glm-5', 'Especialista en desarrollo, debugging y optimización. Revisa código de proyectos existentes (Sati Academy, Agentes C2), sugiere mejoras, arregla bugs y mejora performance. Trabaja en español con Clawy.', 0),
('DocWriter', 'mid', 'docs', 'sleeping', 'zai/glm-5', 'Especialista en documentación técnica, READMEs y guías. Convierte proyectos en docs claros. Mantiene actualizados todos los proyectos. Trabaja en español con Clawy.', 0);

-- Verificar agentes creados
SELECT name, rank, specialty, status FROM c2_agents ORDER BY created_at;
