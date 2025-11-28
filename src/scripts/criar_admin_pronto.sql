-- Script PRONTO para criar um usuário administrador
-- Execute este script diretamente no MySQL

-- ============================================
-- CRIAR ADMINISTRADOR
-- ============================================
-- Email: admin@psicocare.com
-- Senha: admin123
-- ============================================

-- Verificar se já existe um admin com este email
SELECT * FROM administradores WHERE email = 'admin@psicocare.com';

-- Criar administrador
-- A senha "admin123" já está criptografada com bcrypt
INSERT INTO administradores (nome, email, senha, data_criacao)
VALUES (
    'Administrador',
    'admin@psicocare.com',
    '$2b$10$WGyzMfgPJUG4mdXbU0.L4eE36F.eqQjajMiPJGLPlUhGy1XANmoxa',
    NOW()
)
ON DUPLICATE KEY UPDATE 
    nome = VALUES(nome),
    senha = VALUES(senha);

-- Verificar se o admin foi criado
SELECT id, nome, email, data_criacao FROM administradores WHERE email = 'admin@psicocare.com';

-- ============================================
-- CREDENCIAIS PARA LOGIN
-- ============================================
-- Email: admin@psicocare.com
-- Senha: admin123
-- 
-- ⚠️ IMPORTANTE: Altere a senha após o primeiro login!
-- ============================================












