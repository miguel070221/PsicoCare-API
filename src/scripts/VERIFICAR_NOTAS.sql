-- ============================================
-- SCRIPT DE DIAGNÓSTICO PARA TABELA notas_sessoes
-- Execute este script para verificar se a tabela existe e está correta
-- ============================================

USE psicocare;

-- 1. Verificar se a tabela existe
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Tabela notas_sessoes EXISTE'
    ELSE '❌ Tabela notas_sessoes NÃO EXISTE - Execute o schema.sql'
  END AS status_tabela
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'notas_sessoes';

-- 2. Verificar estrutura da tabela (se existir)
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_KEY,
  EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'notas_sessoes'
ORDER BY ORDINAL_POSITION;

-- 3. Verificar foreign keys
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'notas_sessoes'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 4. Verificar se existem psicólogos e pacientes no banco
SELECT 
  (SELECT COUNT(*) FROM psicologos) AS total_psicologos,
  (SELECT COUNT(*) FROM pacientes) AS total_pacientes;

-- 5. Tentar inserir uma nota de teste (será revertida)
-- DESCOMENTE AS LINHAS ABAIXO PARA TESTAR INSERÇÃO
-- IMPORTANTE: Substitua os IDs pelos IDs reais do seu banco

/*
-- Primeiro, pegue os IDs de um psicólogo e paciente existentes
SELECT id, nome FROM psicologos LIMIT 1;
SELECT id, nome FROM pacientes LIMIT 1;

-- Depois, teste a inserção (substitua os IDs):
INSERT INTO notas_sessoes (id_psicologo, id_paciente, titulo, conteudo)
VALUES (1, 1, 'Teste', 'Esta é uma nota de teste');

-- Verifique se foi inserida:
SELECT * FROM notas_sessoes WHERE titulo = 'Teste';

-- Limpe o teste (se necessário):
-- DELETE FROM notas_sessoes WHERE titulo = 'Teste';
*/

-- 6. Verificar última nota inserida (se houver)
SELECT 
  id,
  id_psicologo,
  id_paciente,
  titulo,
  LEFT(conteudo, 50) AS conteudo_preview,
  created_at
FROM notas_sessoes
ORDER BY created_at DESC
LIMIT 5;

-- 7. Verificar permissões (se possível)
SHOW GRANTS FOR CURRENT_USER();

