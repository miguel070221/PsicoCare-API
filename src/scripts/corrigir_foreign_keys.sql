-- Script para corrigir problemas de foreign keys nos agendamentos
-- Execute este script no MySQL para corrigir os problemas

-- 1. Verificar estrutura atual da tabela agendamentos
SHOW CREATE TABLE agendamentos;

-- 2. Verificar se existe tabela de avaliações
SHOW TABLES LIKE 'avaliacoes';

-- 3. Se existir tabela de avaliações, verificar sua estrutura
-- DESCRIBE avaliacoes;
-- SHOW CREATE TABLE avaliacoes;

-- 4. Opção 1: Alterar foreign key de avaliacoes para ON DELETE CASCADE
-- (Isso permitirá que as avaliações sejam deletadas automaticamente quando o agendamento for deletado)
-- ALTER TABLE avaliacoes 
-- DROP FOREIGN KEY avaliacoes_ibfk_1;
-- 
-- ALTER TABLE avaliacoes 
-- ADD CONSTRAINT avaliacoes_ibfk_1 
-- FOREIGN KEY (id_agendamento) 
-- REFERENCES agendamentos(id) 
-- ON DELETE CASCADE;

-- 5. Opção 2: Verificar se id_usuario referencia a tabela correta
-- Se id_usuario referencia usuarios mas deveria referenciar pacientes:
-- ALTER TABLE agendamentos 
-- DROP FOREIGN KEY agendamentos_ibfk_1;
-- 
-- ALTER TABLE agendamentos 
-- ADD CONSTRAINT agendamentos_ibfk_1 
-- FOREIGN KEY (id_usuario) 
-- REFERENCES pacientes(id) 
-- ON DELETE CASCADE;

-- 6. Verificar todos os agendamentos e seus relacionamentos
SELECT 
    a.id,
    a.id_usuario,
    a.usuario_id,
    a.id_profissional,
    a.profissional_id,
    p.id as paciente_id,
    p.nome as paciente_nome,
    u.id as usuario_id_tabela,
    u.nome as usuario_nome
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = a.id_usuario OR p.id = a.usuario_id
LEFT JOIN usuarios u ON u.id = a.id_usuario OR u.id = a.usuario_id
LIMIT 10;

-- 7. Verificar se o paciente ID 2 existe
SELECT id, nome, email FROM pacientes WHERE id = 2;
SELECT id, nome, email FROM usuarios WHERE id = 2;

-- 8. Verificar avaliações vinculadas ao agendamento ID 1
SELECT * FROM avaliacoes WHERE id_agendamento = 1;







