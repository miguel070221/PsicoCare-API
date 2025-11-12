-- Script para adicionar campos de links de comunicação na tabela pacientes
-- Execute este script no MySQL
-- Se alguma coluna já existir, você receberá um erro - isso é normal, apenas continue com as outras

-- Adicionar coluna link_whatsapp (ignorar erro se já existir)
ALTER TABLE pacientes 
ADD COLUMN link_whatsapp VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna link_telegram (ignorar erro se já existir)
ALTER TABLE pacientes 
ADD COLUMN link_telegram VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna link_discord (ignorar erro se já existir)
ALTER TABLE pacientes 
ADD COLUMN link_discord VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna link_email (ignorar erro se já existir)
ALTER TABLE pacientes 
ADD COLUMN link_email VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna telefone (ignorar erro se já existir)
ALTER TABLE pacientes 
ADD COLUMN telefone VARCHAR(20) DEFAULT NULL;

-- Manter contato_preferido para compatibilidade, mas agora podemos usar os links específicos

