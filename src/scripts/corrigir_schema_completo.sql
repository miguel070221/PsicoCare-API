-- Script para corrigir o schema do banco de dados baseado no dump real
-- Este script corrige as foreign keys que estão incorretas

-- IMPORTANTE: Faça backup do banco antes de executar!

-- ============================================
-- PROBLEMA 1: agendamentos.id_usuario referencia usuarios, mas pacientes estão em pacientes
-- ============================================

-- 1. Verificar estrutura atual
SHOW CREATE TABLE agendamentos;

-- 2. Verificar foreign keys atuais
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

-- 3. Remover foreign key antiga (que referencia usuarios)
ALTER TABLE agendamentos DROP FOREIGN KEY agendamentos_ibfk_1;

-- 4. Adicionar nova foreign key que referencia pacientes
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_ibfk_usuario 
FOREIGN KEY (id_usuario) 
REFERENCES pacientes(id) 
ON DELETE CASCADE;

-- ============================================
-- PROBLEMA 2: agendamentos.id_profissional referencia profissionais, mas psicólogos estão em psicologos
-- ============================================

-- 1. Verificar se há registros em agendamentos que referenciam profissionais
SELECT COUNT(*) as total_agendamentos_profissionais
FROM agendamentos a
INNER JOIN profissionais p ON p.id = a.id_profissional;

-- 2. Verificar se há registros em agendamentos que referenciam psicologos
SELECT COUNT(*) as total_agendamentos_psicologos
FROM agendamentos a
INNER JOIN psicologos ps ON ps.id = a.id_profissional;

-- 3. Se houver agendamentos referenciando profissionais, precisamos migrar
-- Primeiro, vamos verificar se os IDs de profissionais correspondem a psicólogos
SELECT 
    a.id as agendamento_id,
    a.id_profissional,
    p.nome as profissional_nome,
    ps.id as psicologo_id,
    ps.nome as psicologo_nome
FROM agendamentos a
LEFT JOIN profissionais p ON p.id = a.id_profissional
LEFT JOIN psicologos ps ON ps.email = p.email OR ps.crp = p.crp;

-- 4. Remover foreign key antiga (que referencia profissionais)
ALTER TABLE agendamentos DROP FOREIGN KEY agendamentos_ibfk_2;

-- 5. Adicionar nova foreign key que referencia psicologos
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_ibfk_profissional 
FOREIGN KEY (id_profissional) 
REFERENCES psicologos(id) 
ON DELETE CASCADE;

-- ============================================
-- PROBLEMA 3: avaliacoes.id_agendamento não tem ON DELETE CASCADE
-- ============================================

-- 1. Verificar estrutura atual
SHOW CREATE TABLE avaliacoes;

-- 2. Remover foreign key antiga
ALTER TABLE avaliacoes DROP FOREIGN KEY avaliacoes_ibfk_1;

-- 3. Adicionar nova foreign key com ON DELETE CASCADE
ALTER TABLE avaliacoes 
ADD CONSTRAINT avaliacoes_ibfk_1 
FOREIGN KEY (id_agendamento) 
REFERENCES agendamentos(id) 
ON DELETE CASCADE;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar todas as foreign keys de agendamentos
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

-- Verificar foreign keys de avaliacoes
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'psicocare' 
  AND TABLE_NAME = 'avaliacoes'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verificar se há agendamentos órfãos (sem paciente ou psicólogo correspondente)
SELECT 
    a.id,
    a.id_usuario,
    a.id_profissional,
    CASE WHEN p.id IS NULL THEN 'SEM PACIENTE' ELSE 'OK' END as status_paciente,
    CASE WHEN ps.id IS NULL THEN 'SEM PSICÓLOGO' ELSE 'OK' END as status_psicologo
FROM agendamentos a
LEFT JOIN pacientes p ON p.id = a.id_usuario
LEFT JOIN psicologos ps ON ps.id = a.id_profissional
WHERE p.id IS NULL OR ps.id IS NULL;

-- ============================================
-- NOTA: Se houver agendamentos órfãos, você precisará:
-- 1. Corrigir manualmente os IDs ou
-- 2. Deletar os agendamentos órfãos
-- ============================================












