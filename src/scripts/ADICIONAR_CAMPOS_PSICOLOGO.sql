-- Script para adicionar campos de telefone e redes sociais na tabela psicologos
-- Execute este script no phpMyAdmin ou cliente MySQL
-- Se os campos já existirem, você verá um erro, mas pode ignorá-lo

USE psicocare;

-- Adicionar campo telefone (se não existir)
-- Se der erro "Duplicate column name", significa que o campo já existe e pode ignorar
ALTER TABLE psicologos 
ADD COLUMN telefone VARCHAR(20) DEFAULT NULL;

-- Adicionar campo redes_sociais (JSON para armazenar múltiplos links)
-- Se der erro "Duplicate column name", significa que o campo já existe e pode ignorar
ALTER TABLE psicologos 
ADD COLUMN redes_sociais TEXT DEFAULT NULL COMMENT 'JSON com links de redes sociais: {"instagram": "...", "linkedin": "...", "facebook": "...", "outros": [...]}';

-- Verificar se os campos foram adicionados
DESCRIBE psicologos;

