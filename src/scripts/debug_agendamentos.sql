-- ============================================
-- SCRIPT DE DIAGNÓSTICO - AGENDAMENTOS
-- ============================================
-- Execute estas queries no MySQL/phpMyAdmin e me envie os resultados

-- 1. Ver TODOS os agendamentos com detalhes
SELECT 
    a.id,
    a.usuario_id,
    a.id_usuario,
    a.profissional_id,
    a.id_profissional,
    a.data_hora,
    a.data,
    a.horario,
    a.status,
    a.created_at,
    '---' as separador,
    p.id as paciente_id_tabela,
    p.nome as paciente_nome,
    p.email as paciente_email,
    '---' as separador2,
    ps.id as psicologo_id_tabela,
    ps.nome as psicologo_nome,
    ps.email as psicologo_email
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = COALESCE(a.usuario_id, a.id_usuario)
LEFT JOIN psicologos ps ON ps.id = COALESCE(a.profissional_id, a.id_profissional)
ORDER BY a.id DESC
LIMIT 20;

-- 2. Ver estrutura da tabela agendamentos
DESCRIBE agendamentos;

-- 3. Contar agendamentos por status
SELECT 
    status,
    COUNT(*) as total
FROM agendamentos
GROUP BY status;

-- 4. Ver agendamentos de um paciente específico
-- SUBSTITUA X pelo ID do paciente que você está usando
SELECT 
    a.*,
    p.nome as paciente_nome,
    ps.nome as psicologo_nome
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = COALESCE(a.usuario_id, a.id_usuario)
LEFT JOIN psicologos ps ON ps.id = COALESCE(a.profissional_id, a.id_profissional)
WHERE (a.usuario_id = X OR a.id_usuario = X)
ORDER BY a.id DESC;

-- 5. Ver agendamentos de um psicólogo específico
-- SUBSTITUA X pelo ID do psicólogo que você está usando
SELECT 
    a.*,
    p.nome as paciente_nome,
    ps.nome as psicologo_nome
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = COALESCE(a.usuario_id, a.id_usuario)
LEFT JOIN psicologos ps ON ps.id = COALESCE(a.profissional_id, a.id_profissional)
WHERE (a.profissional_id = X OR a.id_profissional = X)
ORDER BY a.id DESC;

-- 6. Ver todos os pacientes e seus IDs
SELECT id, nome, email FROM pacientes ORDER BY id;

-- 7. Ver todos os psicólogos e seus IDs
SELECT id, nome, email FROM psicologos ORDER BY id;

-- 8. Ver agendamentos com problemas (NULLs ou valores inconsistentes)
SELECT 
    id,
    usuario_id,
    id_usuario,
    profissional_id,
    id_profissional,
    data_hora,
    data,
    horario,
    status,
    CASE 
        WHEN usuario_id IS NULL AND id_usuario IS NULL THEN '❌ Sem usuario_id'
        WHEN profissional_id IS NULL AND id_profissional IS NULL THEN '❌ Sem profissional_id'
        WHEN data_hora IS NULL AND (data IS NULL OR horario IS NULL) THEN '❌ Sem data/hora'
        ELSE '✅ OK'
    END as problema
FROM agendamentos
WHERE usuario_id IS NULL AND id_usuario IS NULL
   OR profissional_id IS NULL AND id_profissional IS NULL
   OR (data_hora IS NULL AND (data IS NULL OR horario IS NULL));

-- 9. Testar a query exata que o backend usa (para paciente)
-- SUBSTITUA X pelo ID do paciente que você está usando
SELECT a.id,
       COALESCE(a.usuario_id, a.id_usuario) AS usuario_id,
       COALESCE(a.profissional_id, a.id_profissional) AS profissional_id,
       a.id_usuario,
       a.usuario_id,
       a.id_profissional,
       a.profissional_id,
       COALESCE(a.data_hora, CONCAT(a.data, ' ', a.horario)) AS data_hora,
       a.status,
       COALESCE(
         DATE_FORMAT(a.data_hora, '%d-%m-%Y'),
         DATE_FORMAT(a.data, '%d-%m-%Y')
       ) AS data,
       COALESCE(
         DATE_FORMAT(a.data_hora, '%H:%i'),
         DATE_FORMAT(a.horario, '%H:%i')
       ) AS horario,
       COALESCE(ps.nome, prof.nome) AS psicologo_nome,
       COALESCE(p.nome, u.nome) AS paciente_nome
FROM agendamentos a
LEFT JOIN psicologos ps ON ps.id = COALESCE(a.profissional_id, a.id_profissional)
LEFT JOIN profissionais prof ON prof.id = COALESCE(a.profissional_id, a.id_profissional)
LEFT JOIN pacientes p ON p.id = COALESCE(a.usuario_id, a.id_usuario)
LEFT JOIN usuarios u ON u.id = COALESCE(a.usuario_id, a.id_usuario) AND p.id IS NULL
WHERE (a.usuario_id = X OR a.id_usuario = X)
ORDER BY COALESCE(a.data_hora, CONCAT(a.data, ' ', a.horario)) DESC;

-- 10. Testar a query exata que o backend usa (para psicólogo)
-- SUBSTITUA X pelo ID do psicólogo que você está usando
SELECT a.id,
       COALESCE(a.usuario_id, a.id_usuario) AS usuario_id,
       COALESCE(a.profissional_id, a.id_profissional) AS profissional_id,
       a.id_usuario,
       a.usuario_id,
       a.id_profissional,
       a.profissional_id,
       COALESCE(a.data_hora, CONCAT(a.data, ' ', a.horario)) AS data_hora,
       a.status,
       COALESCE(
         DATE_FORMAT(a.data_hora, '%d-%m-%Y'),
         DATE_FORMAT(a.data, '%d-%m-%Y')
       ) AS data,
       COALESCE(
         DATE_FORMAT(a.data_hora, '%H:%i'),
         DATE_FORMAT(a.horario, '%H:%i')
       ) AS horario,
       COALESCE(ps.nome, prof.nome) AS psicologo_nome,
       COALESCE(p.nome, u.nome) AS paciente_nome
FROM agendamentos a
LEFT JOIN psicologos ps ON ps.id = COALESCE(a.profissional_id, a.id_profissional)
LEFT JOIN profissionais prof ON prof.id = COALESCE(a.profissional_id, a.id_profissional)
LEFT JOIN pacientes p ON p.id = COALESCE(a.usuario_id, a.id_usuario)
LEFT JOIN usuarios u ON u.id = COALESCE(a.usuario_id, a.id_usuario) AND p.id IS NULL
WHERE (a.profissional_id = X OR a.id_profissional = X)
ORDER BY COALESCE(a.data_hora, CONCAT(a.data, ' ', a.horario)) DESC;












