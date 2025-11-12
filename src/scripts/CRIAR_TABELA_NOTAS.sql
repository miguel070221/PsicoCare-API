-- ============================================
-- SCRIPT PARA CRIAR A TABELA notas_sessoes
-- Execute este script no MySQL/phpMyAdmin
-- ============================================

USE psicocare;

-- Criar tabela de notas/sessões (anotações do psicólogo sobre sessões)
CREATE TABLE IF NOT EXISTS notas_sessoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_psicologo INT NOT NULL,
  id_paciente INT NOT NULL,
  id_agendamento INT,
  titulo VARCHAR(255),
  conteudo TEXT NOT NULL,
  data_sessao DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_nota_psicologo FOREIGN KEY (id_psicologo) REFERENCES psicologos(id) ON DELETE CASCADE,
  CONSTRAINT fk_nota_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_nota_agendamento FOREIGN KEY (id_agendamento) REFERENCES agendamentos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar se a tabela foi criada
SELECT 'Tabela notas_sessoes criada com sucesso!' AS status;

-- Verificar estrutura da tabela
DESCRIBE notas_sessoes;

-- Verificar se há índices
SHOW INDEX FROM notas_sessoes;









