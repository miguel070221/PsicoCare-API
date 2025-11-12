-- ============================================
-- DIAGNÓSTICO COMPLETO - VERIFICAR TUDO
-- Execute este script para verificar o estado do banco
-- ============================================

USE psicocare;

-- 1. Verificar se a tabela notas_sessoes existe
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Tabela notas_sessoes EXISTE'
    ELSE '❌ Tabela notas_sessoes NÃO EXISTE'
  END AS status_notas_sessoes
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'notas_sessoes';

-- 2. Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS notas_sessoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_psicologo INT NOT NULL,
  id_paciente INT NOT NULL,
  id_agendamento INT DEFAULT NULL,
  titulo VARCHAR(255) DEFAULT NULL,
  conteudo TEXT NOT NULL,
  data_sessao DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_psicologo) REFERENCES psicologos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_agendamento) REFERENCES agendamentos(id) ON DELETE SET NULL
);

-- 3. Verificar estrutura da tabela
DESCRIBE notas_sessoes;

-- 4. Verificar se as tabelas relacionadas existem
SELECT 
  'psicologos' AS tabela,
  CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'psicocare' AND TABLE_NAME = 'psicologos'
UNION ALL
SELECT 
  'pacientes' AS tabela,
  CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'psicocare' AND TABLE_NAME = 'pacientes'
UNION ALL
SELECT 
  'agendamentos' AS tabela,
  CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'psicocare' AND TABLE_NAME = 'agendamentos';

-- 5. Verificar se há psicólogos e pacientes no banco
SELECT 
  (SELECT COUNT(*) FROM psicologos) AS total_psicologos,
  (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
  (SELECT COUNT(*) FROM agendamentos) AS total_agendamentos;

-- 6. Verificar se há notas existentes
SELECT COUNT(*) AS total_notas FROM notas_sessoes;

-- 7. Testar inserção (será revertida)
-- DESCOMENTE AS LINHAS ABAIXO PARA TESTAR
/*
-- Primeiro, pegue os IDs reais
SELECT id, nome FROM psicologos LIMIT 1;
SELECT id, nome FROM pacientes LIMIT 1;

-- Depois teste a inserção (substitua os IDs):
INSERT INTO notas_sessoes (id_psicologo, id_paciente, titulo, conteudo)
VALUES (1, 1, 'Teste', 'Nota de teste');

-- Verificar se foi inserida
SELECT * FROM notas_sessoes WHERE titulo = 'Teste';

-- Limpar teste
DELETE FROM notas_sessoes WHERE titulo = 'Teste';
*/

-- 8. Verificar permissões (se possível)
SHOW GRANTS FOR CURRENT_USER();









