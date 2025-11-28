-- Script SIMPLES para adicionar colunas de links de comunicação
-- Execute este script no MySQL
-- Se alguma coluna já existir, você receberá um erro - isso é normal, apenas ignore

USE psicocare;

-- Adicionar coluna link_whatsapp
ALTER TABLE pacientes ADD COLUMN link_whatsapp VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna link_telegram
ALTER TABLE pacientes ADD COLUMN link_telegram VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna link_discord
ALTER TABLE pacientes ADD COLUMN link_discord VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna link_email
ALTER TABLE pacientes ADD COLUMN link_email VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna telefone
ALTER TABLE pacientes ADD COLUMN telefone VARCHAR(20) DEFAULT NULL;














