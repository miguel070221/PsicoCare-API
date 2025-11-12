-- ============================================
-- COMANDO SQL PARA CRIAR ADMIN - COPIE E COLE
-- ============================================

-- Primeiro, verificar se já existe
SELECT * FROM administradores WHERE email = 'admin@psicocare.com';

-- Se não existir, criar o admin
INSERT INTO administradores (nome, email, senha, data_criacao)
VALUES (
    'Administrador',
    'admin@psicocare.com',
    '$2b$10$WGyzMfgPJUG4mdXbU0.L4eE36F.eqQjajMiPJGLPlUhGy1XANmoxa',
    NOW()
);

-- Verificar se foi criado
SELECT id, nome, email, data_criacao FROM administradores WHERE email = 'admin@psicocare.com';

-- ============================================
-- CREDENCIAIS PARA LOGIN:
-- Email: admin@psicocare.com
-- Senha: admin123
-- ============================================


