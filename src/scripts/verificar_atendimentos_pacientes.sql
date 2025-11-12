-- ============================================
-- VERIFICAR ATENDIMENTOS E PACIENTES
-- ============================================
-- Este script ajuda a diagnosticar por que alguns pacientes
-- não aparecem na lista de agendamentos

-- 1. Ver TODOS os atendimentos (com status)
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
ORDER BY a.id_psicologo, a.id_paciente;

-- 2. Ver atendimentos por psicólogo (substitua 1 pelo ID do seu psicólogo)
SELECT 
    a.id,
    a.id_paciente,
    a.id_psicologo,
    a.status,
    p.nome as paciente_nome,
    CASE 
        WHEN a.status = 'ativo' OR a.status IS NULL THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END as status_display
FROM atendimentos a
LEFT JOIN pacientes p ON p.id = a.id_paciente
WHERE a.id_psicologo = 1  -- SUBSTITUA PELO ID DO SEU PSICÓLOGO
ORDER BY a.status, p.nome;

-- 3. Ver apenas atendimentos ATIVOS para um psicólogo
SELECT 
    a.id,
    a.id_paciente,
    a.id_psicologo,
    a.status,
    p.nome as paciente_nome
FROM atendimentos a
LEFT JOIN pacientes p ON p.id = a.id_paciente
WHERE a.id_psicologo = 1  -- SUBSTITUA PELO ID DO SEU PSICÓLOGO
  AND (a.status = 'ativo' OR a.status IS NULL)
ORDER BY p.nome;

-- 4. Ver pacientes que NÃO têm atendimento ativo com um psicólogo
SELECT 
    p.id,
    p.nome,
    p.email
FROM pacientes p
WHERE p.id NOT IN (
    SELECT DISTINCT a.id_paciente
    FROM atendimentos a
    WHERE a.id_psicologo = 1  -- SUBSTITUA PELO ID DO SEU PSICÓLOGO
      AND (a.status = 'ativo' OR a.status IS NULL)
)
ORDER BY p.nome;

-- 5. Ativar atendimentos inativos (CUIDADO: Execute apenas se necessário)
-- UPDATE atendimentos 
-- SET status = 'ativo'
-- WHERE id_psicologo = 1  -- SUBSTITUA PELO ID DO SEU PSICÓLOGO
--   AND status != 'ativo'
--   AND status IS NOT NULL;







