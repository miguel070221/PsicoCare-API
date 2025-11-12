-- ============================================
-- COPIE TODO ESTE CONTEUDO E COLE NO phpMyAdmin
-- Para criar o usuario administrador
-- ============================================

USE psicocare;

SELECT * FROM administradores WHERE email = 'admin@psicocare.com';

INSERT INTO administradores (nome, email, senha, data_criacao)
VALUES (
    'Administrador',
    'admin@psicocare.com',
    '$2b$10$WGyzMfgPJUG4mdXbU0.L4eE36F.eqQjajMiPJGLPlUhGy1XANmoxa',
    NOW()
);

SELECT id, nome, email, data_criacao FROM administradores WHERE email = 'admin@psicocare.com';

-- ============================================
-- CREDENCIAIS PARA LOGIN:
-- Email: admin@psicocare.com
-- Senha: admin123
-- ============================================



