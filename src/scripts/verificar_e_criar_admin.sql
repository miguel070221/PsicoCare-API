-- Script para verificar e criar admin se não existir
-- Execute este script no MySQL

-- ============================================
-- VERIFICAR SE ADMIN JÁ EXISTE
-- ============================================
SELECT * FROM administradores WHERE email = 'admin@psicocare.com';

-- ============================================
-- CRIAR ADMIN (se não existir)
-- ============================================
-- Email: admin@psicocare.com
-- Senha: admin123
-- Hash da senha já criptografada com bcrypt

INSERT INTO administradores (nome, email, senha, data_criacao)
SELECT 
    'Administrador',
    'admin@psicocare.com',
    '$2b$10$WGyzMfgPJUG4mdXbU0.L4eE36F.eqQjajMiPJGLPlUhGy1XANmoxa',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM administradores WHERE email = 'admin@psicocare.com'
);

-- ============================================
-- VERIFICAR RESULTADO
-- ============================================
SELECT id, nome, email, data_criacao 
FROM administradores 
WHERE email = 'admin@psicocare.com';

-- ============================================
-- LISTAR TODOS OS ADMINS
-- ============================================
SELECT id, nome, email, data_criacao FROM administradores;







