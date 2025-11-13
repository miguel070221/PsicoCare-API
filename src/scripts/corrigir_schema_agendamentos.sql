-- Script para corrigir o schema da tabela agendamentos
-- PROBLEMA: A tabela agendamentos usa id_usuario que referencia usuarios,
-- mas os pacientes estão na tabela pacientes, não em usuarios.

-- IMPORTANTE: Faça backup do banco antes de executar este script!

-- 1. Verificar estrutura atual
SHOW CREATE TABLE agendamentos;

-- 2. Verificar se há dados na tabela
SELECT COUNT(*) as total FROM agendamentos;

-- 3. Verificar foreign keys atuais
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'agendamentos'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 4. OPÇÃO 1: Alterar a foreign key para referenciar pacientes
-- (Recomendado se id_usuario sempre referenciar pacientes)
-- 
-- Passo 4.1: Remover a foreign key antiga
-- ALTER TABLE agendamentos DROP FOREIGN KEY agendamentos_ibfk_1;
-- 
-- Passo 4.2: Adicionar nova foreign key que referencia pacientes
-- ALTER TABLE agendamentos 
-- ADD CONSTRAINT agendamentos_ibfk_usuario 
-- FOREIGN KEY (id_usuario) 
-- REFERENCES pacientes(id) 
-- ON DELETE CASCADE;

-- 5. OPÇÃO 2: Criar registros na tabela usuarios para cada paciente
-- (Não recomendado, mas pode ser uma solução temporária)
-- INSERT INTO usuarios (id, nome, email, senha)
-- SELECT id, nome, email, senha FROM pacientes
-- ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email);

-- 6. OPÇÃO 3: Se a tabela agendamentos tem ambos id_usuario E usuario_id,
-- usar usuario_id que referencia pacientes (se existir)
-- ALTER TABLE agendamentos 
-- DROP FOREIGN KEY agendamentos_ibfk_1;
-- 
-- ALTER TABLE agendamentos 
-- ADD CONSTRAINT agendamentos_ibfk_usuario 
-- FOREIGN KEY (usuario_id) 
-- REFERENCES pacientes(id) 
-- ON DELETE CASCADE;

-- 7. Verificar avaliações vinculadas
SELECT COUNT(*) as total FROM avaliacoes WHERE id_agendamento IS NOT NULL;

-- 8. Se necessário, alterar foreign key de avaliações para ON DELETE CASCADE
-- ALTER TABLE avaliacoes 
-- DROP FOREIGN KEY avaliacoes_ibfk_1;
-- 
-- ALTER TABLE avaliacoes 
-- ADD CONSTRAINT avaliacoes_ibfk_1 
-- FOREIGN KEY (id_agendamento) 
-- REFERENCES agendamentos(id) 
-- ON DELETE CASCADE;









