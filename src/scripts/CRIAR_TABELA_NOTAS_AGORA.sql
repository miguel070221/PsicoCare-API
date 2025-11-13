-- ============================================
-- CRIAR TABELA notas_sessoes - EXECUTE ESTE SCRIPT
-- ============================================

USE psicocare;

-- Remover tabela se existir (CUIDADO: isso apagará dados existentes)
-- DROP TABLE IF EXISTS notas_sessoes;

-- Criar tabela de notas/sessões
CREATE TABLE IF NOT EXISTS notas_sessoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_psicologo INT NOT NULL,
  id_paciente INT NOT NULL,
  id_agendamento INT DEFAULT NULL,
  titulo VARCHAR(255) DEFAULT NULL,
  conteudo TEXT NOT NULL,
  data_sessao DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_psicologo) REFERENCES psicologos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_agendamento) REFERENCES agendamentos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar se foi criada
SELECT 'Tabela notas_sessoes criada!' AS resultado;

-- Ver estrutura
DESCRIBE notas_sessoes;

-- Verificar se há dados
SELECT COUNT(*) AS total_notas FROM notas_sessoes;











