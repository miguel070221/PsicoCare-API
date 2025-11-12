-- ============================================
-- SCRIPT CONSOLIDADO PARA ATUALIZAR O BANCO
-- Execute este script no MySQL/phpMyAdmin
-- Este script é seguro para executar múltiplas vezes
-- ============================================

USE psicocare;

-- ============================================
-- 1. ADICIONAR COLUNAS DE LINKS DE COMUNICAÇÃO
-- ============================================
-- Adicionar coluna link_whatsapp (se não existir)
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'psicocare' 
   AND TABLE_NAME = 'pacientes' 
   AND COLUMN_NAME = 'link_whatsapp') = 0,
  'ALTER TABLE pacientes ADD COLUMN link_whatsapp VARCHAR(255) DEFAULT NULL',
  'SELECT "Coluna link_whatsapp já existe" AS mensagem'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna link_telegram (se não existir)
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'psicocare' 
   AND TABLE_NAME = 'pacientes' 
   AND COLUMN_NAME = 'link_telegram') = 0,
  'ALTER TABLE pacientes ADD COLUMN link_telegram VARCHAR(255) DEFAULT NULL',
  'SELECT "Coluna link_telegram já existe" AS mensagem'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna link_discord (se não existir)
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'psicocare' 
   AND TABLE_NAME = 'pacientes' 
   AND COLUMN_NAME = 'link_discord') = 0,
  'ALTER TABLE pacientes ADD COLUMN link_discord VARCHAR(255) DEFAULT NULL',
  'SELECT "Coluna link_discord já existe" AS mensagem'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna link_email (se não existir)
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'psicocare' 
   AND TABLE_NAME = 'pacientes' 
   AND COLUMN_NAME = 'link_email') = 0,
  'ALTER TABLE pacientes ADD COLUMN link_email VARCHAR(255) DEFAULT NULL',
  'SELECT "Coluna link_email já existe" AS mensagem'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna telefone (se não existir)
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = 'psicocare' 
   AND TABLE_NAME = 'pacientes' 
   AND COLUMN_NAME = 'telefone') = 0,
  'ALTER TABLE pacientes ADD COLUMN telefone VARCHAR(20) DEFAULT NULL',
  'SELECT "Coluna telefone já existe" AS mensagem'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. VERIFICAR SE AS COLUNAS FORAM ADICIONADAS
-- ============================================
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'pacientes'
  AND COLUMN_NAME IN ('link_whatsapp', 'link_telegram', 'link_discord', 'link_email', 'telefone')
ORDER BY COLUMN_NAME;

-- ============================================
-- 3. VERIFICAR SE A TABELA horarios_disponiveis EXISTE
-- ============================================
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Tabela horarios_disponiveis já existe'
    ELSE 'Tabela horarios_disponiveis NÃO existe - execute o schema.sql'
  END AS status_horarios
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'horarios_disponiveis';

-- ============================================
-- 4. VERIFICAR SE A TABELA notas_sessoes EXISTE
-- ============================================
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Tabela notas_sessoes já existe'
    ELSE 'Tabela notas_sessoes NÃO existe - execute o schema.sql'
  END AS status_notas
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'notas_sessoes';

-- ============================================
-- MENSAGEM DE CONCLUSÃO
-- ============================================
SELECT 'Script executado com sucesso! Verifique os resultados acima.' AS resultado;









