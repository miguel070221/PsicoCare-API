-- ============================================
-- SCRIPT SIMPLES PARA CRIAR A TABELA notas_sessoes
-- Execute este script no MySQL/phpMyAdmin
-- ============================================

USE psicocare;

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
);

-- Verificar se foi criada
SHOW TABLES LIKE 'notas_sessoes';

-- Ver estrutura
DESCRIBE notas_sessoes;














