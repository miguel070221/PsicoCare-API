-- Script para verificar e corrigir agendamentos órfãos
-- Execute este script ANTES de corrigir as foreign keys

-- ============================================
-- VERIFICAR AGENDAMENTOS COM PACIENTES INVÁLIDOS
-- ============================================

-- Agendamentos onde id_usuario não existe em pacientes
SELECT 
    a.id as agendamento_id,
    a.id_usuario,
    a.id_profissional,
    a.data,
    a.horario,
    a.status,
    'PACIENTE NÃO ENCONTRADO EM pacientes' as problema
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = a.id_usuario
WHERE p.id IS NULL;

-- Verificar se esses IDs existem em usuarios
SELECT 
    a.id as agendamento_id,
    a.id_usuario,
    u.nome as usuario_nome,
    u.email as usuario_email,
    'ID existe em usuarios mas não em pacientes' as observacao
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = a.id_usuario
INNER JOIN usuarios u ON u.id = a.id_usuario
WHERE p.id IS NULL;

-- ============================================
-- VERIFICAR AGENDAMENTOS COM PSICÓLOGOS INVÁLIDOS
-- ============================================

-- Agendamentos onde id_profissional não existe em psicologos
SELECT 
    a.id as agendamento_id,
    a.id_usuario,
    a.id_profissional,
    a.data,
    a.horario,
    a.status,
    'PSICÓLOGO NÃO ENCONTRADO EM psicologos' as problema
FROM agendamentos a
LEFT JOIN psicologos ps ON ps.id = a.id_profissional
WHERE ps.id IS NULL;

-- Verificar se esses IDs existem em profissionais
SELECT 
    a.id as agendamento_id,
    a.id_profissional,
    p.nome as profissional_nome,
    p.email as profissional_email,
    'ID existe em profissionais mas não em psicologos' as observacao
FROM agendamentos a
LEFT JOIN psicologos ps ON ps.id = a.id_profissional
INNER JOIN profissionais p ON p.id = a.id_profissional
WHERE ps.id IS NULL;

-- ============================================
-- SUGESTÃO DE CORREÇÃO PARA AGENDAMENTOS ÓRFÃOS
-- ============================================

-- Se houver agendamentos com id_usuario que existe em usuarios mas não em pacientes,
-- você pode tentar criar registros correspondentes em pacientes ou deletar os agendamentos

-- OPÇÃO 1: Deletar agendamentos órfãos (CUIDADO!)
-- DELETE FROM agendamentos 
-- WHERE id_usuario NOT IN (SELECT id FROM pacientes)
--    OR id_profissional NOT IN (SELECT id FROM psicologos);

-- OPÇÃO 2: Criar pacientes correspondentes (se fizer sentido)
-- INSERT INTO pacientes (id, nome, email, senha, preferencia_comunicacao)
-- SELECT id, nome, email, senha, 'WhatsApp'
-- FROM usuarios
-- WHERE id IN (
--     SELECT DISTINCT id_usuario 
--     FROM agendamentos 
--     WHERE id_usuario NOT IN (SELECT id FROM pacientes)
-- )
-- ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- ============================================
-- RESUMO
-- ============================================

SELECT 
    'Total de agendamentos' as metrica,
    COUNT(*) as valor
FROM agendamentos
UNION ALL
SELECT 
    'Agendamentos com paciente válido' as metrica,
    COUNT(*) as valor
FROM agendamentos a
INNER JOIN pacientes p ON p.id = a.id_usuario
UNION ALL
SELECT 
    'Agendamentos com psicólogo válido' as metrica,
    COUNT(*) as valor
FROM agendamentos a
INNER JOIN psicologos ps ON ps.id = a.id_profissional
UNION ALL
SELECT 
    'Agendamentos órfãos (sem paciente ou psicólogo)' as metrica,
    COUNT(*) as valor
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = a.id_usuario
LEFT JOIN psicologos ps ON ps.id = a.id_profissional
WHERE p.id IS NULL OR ps.id IS NULL;







