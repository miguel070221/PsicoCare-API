-- Script para criar a tabela horarios_disponiveis
-- Execute este script no phpMyAdmin ou outro cliente MySQL

USE psicocare;

-- Criar tabela de horários disponíveis do psicólogo
CREATE TABLE IF NOT EXISTS horarios_disponiveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_psicologo INT NOT NULL,
  dia_semana TINYINT NOT NULL COMMENT '0=Domingo, 1=Segunda, ..., 6=Sábado',
  hora_inicio TIME NOT NULL COMMENT 'Horário de início (ex: 09:00)',
  hora_fim TIME NOT NULL COMMENT 'Horário de fim (ex: 18:00)',
  duracao_minutos INT DEFAULT 60 COMMENT 'Duração de cada consulta em minutos',
  ativo TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_horario_psicologo FOREIGN KEY (id_psicologo) REFERENCES psicologos(id) ON DELETE CASCADE,
  INDEX idx_psicologo_dia (id_psicologo, dia_semana)
);

-- Verificar se a tabela foi criada corretamente
SELECT 'Tabela horarios_disponiveis criada com sucesso!' AS status;




