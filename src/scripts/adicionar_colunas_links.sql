-- Script para adicionar colunas de links de comunicação na tabela pacientes
-- Execute este script no MySQL
-- Este script é seguro para executar múltiplas vezes (não dará erro se as colunas já existirem)

USE psicocare;

-- Adicionar coluna link_whatsapp (ignorar erro se já existir)
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

-- Adicionar coluna link_telegram (ignorar erro se já existir)
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

-- Adicionar coluna link_discord (ignorar erro se já existir)
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

-- Adicionar coluna link_email (ignorar erro se já existir)
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

-- Adicionar coluna telefone (ignorar erro se já existir)
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

-- Verificar se as colunas foram adicionadas
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'pacientes'
  AND COLUMN_NAME IN ('link_whatsapp', 'link_telegram', 'link_discord', 'link_email', 'telefone')
ORDER BY COLUMN_NAME;

-- Mensagem de conclusão
SELECT 'Script executado com sucesso! Verifique as colunas acima.' AS resultado;

