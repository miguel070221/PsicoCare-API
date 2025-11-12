-- Script para criar um usuário administrador
-- Execute este script no MySQL para criar um admin

-- ============================================
-- MÉTODO 1: Criar admin via API (RECOMENDADO)
-- ============================================
-- Use o endpoint de registro que já criptografa a senha automaticamente:
-- 
-- POST http://localhost:3000/api/admin/register
-- Content-Type: application/json
-- 
-- {
--   "nome": "Administrador",
--   "email": "admin@psicocare.com",
--   "senha": "admin123"
-- }
-- 
-- Este é o método mais seguro pois a senha será criptografada corretamente.
-- ============================================

-- ============================================
-- MÉTODO 2: Criar admin diretamente no SQL
-- ============================================
-- ATENÇÃO: Você precisa gerar a hash da senha primeiro!
-- 
-- Para gerar a hash, execute no terminal (na pasta PsicoCare-API):
-- node src/scripts/gerar_hash_senha.js admin123
--
-- Depois copie a hash gerada e use no INSERT abaixo
-- ============================================

-- Verificar se já existe um admin
SELECT * FROM administradores WHERE email = 'admin@psicocare.com';

-- Criar administrador
-- Email: admin@psicocare.com
-- Senha: admin123
-- 
-- IMPORTANTE: Substitua a hash abaixo pela hash gerada pelo script gerar_hash_senha.js
-- A hash abaixo é apenas um exemplo e NÃO funcionará!
INSERT INTO administradores (nome, email, senha, data_criacao)
VALUES (
    'Administrador',
    'admin@psicocare.com',
    'SUBSTITUA_PELA_HASH_GERADA', -- Execute: node src/scripts/gerar_hash_senha.js admin123
    NOW()
)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Verificar se o admin foi criado
SELECT id, nome, email, data_criacao FROM administradores;

-- ============================================
-- CREDENCIAIS PADRÃO
-- ============================================
-- Email: admin@psicocare.com
-- Senha: admin123
-- 
-- ⚠️ IMPORTANTE: Altere a senha após o primeiro login!
-- ============================================

