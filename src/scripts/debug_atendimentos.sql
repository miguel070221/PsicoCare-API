-- Script de diagnóstico para verificar atendimentos e psicólogos vinculados
-- Execute este script no phpMyAdmin ou MySQL para verificar os dados

-- 1. Ver todos os atendimentos (substitua o ID pelo ID do seu paciente)
SELECT 
    a.id,
    a.id_paciente,
    a.id_psicologo,
    a.status,
    a.data_inicio,
    p.nome as paciente_nome,
    ps.nome as psicologo_nome
FROM atendimentos a
LEFT JOIN pacientes p ON p.id = a.id_paciente
LEFT JOIN psicologos ps ON ps.id = a.id_psicologo
ORDER BY a.data_inicio DESC;

-- 2. Ver apenas atendimentos ativos (substitua o ID pelo ID do seu paciente)
SELECT 
    a.id,
    a.id_paciente,
    a.id_psicologo,
    a.status,
    p.nome as paciente_nome,
    ps.nome as psicologo_nome
FROM atendimentos a
LEFT JOIN pacientes p ON p.id = a.id_paciente
LEFT JOIN psicologos ps ON ps.id = a.id_psicologo
WHERE a.status = 'ativo'
ORDER BY a.data_inicio DESC;

-- 3. Ver psicólogos vinculados a um paciente específico (SUBSTITUA X pelo ID do seu paciente)
SELECT 
    ps.id,
    ps.nome,
    ps.disponivel,
    a.id as atendimento_id,
    a.status as atendimento_status
FROM psicologos ps
INNER JOIN atendimentos a ON a.id_psicologo = ps.id
WHERE a.id_paciente = X AND a.status = 'ativo';

-- 4. Verificar se há atendimentos sem status ou com status diferente de 'ativo'
SELECT 
    id,
    id_paciente,
    id_psicologo,
    status,
    data_inicio,
    CASE 
        WHEN status IS NULL THEN 'SEM STATUS'
        WHEN status != 'ativo' THEN 'STATUS: ' + status
        ELSE 'OK'
    END as problema
FROM atendimentos
WHERE status IS NULL OR status != 'ativo';



















