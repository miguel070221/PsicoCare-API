-- Script de diagnóstico para verificar por que não é possível criar agendamentos para "Miguel fulano"
-- Execute este script no MySQL para diagnosticar o problema

-- 1. Verificar se o paciente "Miguel fulano" existe
SELECT id, nome, email, data_criacao 
FROM pacientes 
WHERE nome LIKE '%Miguel%' OR id = 2;

-- 2. Verificar se há atendimentos para este paciente
SELECT 
    a.id as atendimento_id,
    a.id_paciente,
    a.id_psicologo,
    a.status as atendimento_status,
    p.nome as paciente_nome,
    ps.nome as psicologo_nome
FROM atendimentos a
LEFT JOIN pacientes p ON p.id = a.id_paciente
LEFT JOIN psicologos ps ON ps.id = a.id_psicologo
WHERE a.id_paciente = 2;

-- 3. Verificar TODOS os atendimentos (para ver qual psicólogo está vinculado)
SELECT 
    a.id as atendimento_id,
    a.id_paciente,
    a.id_psicologo,
    a.status as atendimento_status,
    p.nome as paciente_nome,
    ps.nome as psicologo_nome,
    ps.id as psicologo_id
FROM atendimentos a
LEFT JOIN pacientes p ON p.id = a.id_paciente
LEFT JOIN psicologos ps ON ps.id = a.id_psicologo
ORDER BY a.id_paciente, a.id_psicologo;

-- 4. Verificar agendamentos existentes para o paciente ID 2
SELECT 
    ag.id,
    ag.usuario_id,
    ag.id_usuario,
    ag.profissional_id,
    ag.id_profissional,
    ag.data,
    ag.data_hora,
    ag.horario,
    ag.status
FROM agendamentos ag
WHERE ag.usuario_id = 2 OR ag.id_usuario = 2;

-- 5. Verificar estrutura da tabela atendimentos
DESCRIBE atendimentos;

-- 6. Verificar estrutura da tabela agendamentos
DESCRIBE agendamentos;

-- 7. Verificar todos os psicólogos cadastrados
SELECT id, nome, email, aprovado, disponivel 
FROM psicologos;

-- 8. Verificar todos os pacientes cadastrados
SELECT id, nome, email, data_criacao 
FROM pacientes;







