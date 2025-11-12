-- Script para adicionar campos de links de comunicação na tabela pacientes
-- Este script verifica se as colunas já existem antes de adicioná-las
-- Execute este script no MySQL

USE psicocare;

-- Verificar e adicionar coluna link_whatsapp
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'psicocare' 
                   AND TABLE_NAME = 'pacientes' 
                   AND COLUMN_NAME = 'link_whatsapp');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE pacientes ADD COLUMN link_whatsapp VARCHAR(255) DEFAULT NULL',
              'SELECT "Coluna link_whatsapp já existe" AS mensagem');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar coluna link_telegram
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'psicocare' 
                   AND TABLE_NAME = 'pacientes' 
                   AND COLUMN_NAME = 'link_telegram');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE pacientes ADD COLUMN link_telegram VARCHAR(255) DEFAULT NULL',
              'SELECT "Coluna link_telegram já existe" AS mensagem');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar coluna link_discord
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'psicocare' 
                   AND TABLE_NAME = 'pacientes' 
                   AND COLUMN_NAME = 'link_discord');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE pacientes ADD COLUMN link_discord VARCHAR(255) DEFAULT NULL',
              'SELECT "Coluna link_discord já existe" AS mensagem');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar coluna link_email
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'psicocare' 
                   AND TABLE_NAME = 'pacientes' 
                   AND COLUMN_NAME = 'link_email');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE pacientes ADD COLUMN link_email VARCHAR(255) DEFAULT NULL',
              'SELECT "Coluna link_email já existe" AS mensagem');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar coluna telefone
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'psicocare' 
                   AND TABLE_NAME = 'pacientes' 
                   AND COLUMN_NAME = 'telefone');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE pacientes ADD COLUMN telefone VARCHAR(20) DEFAULT NULL',
              'SELECT "Coluna telefone já existe" AS mensagem');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mensagem de conclusão
SELECT 'Script executado com sucesso! Verifique se as colunas foram adicionadas.' AS resultado;









