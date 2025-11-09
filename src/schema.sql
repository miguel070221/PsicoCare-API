-- Criar banco (se ainda não existir)
CREATE DATABASE IF NOT EXISTS psicocare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE psicocare;

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha VARCHAR(200) NOT NULL,
  idade INT,
  genero ENUM('masculino','feminino','outro') DEFAULT 'outro',
  preferencia_comunicacao ENUM('WhatsApp','Telegram','Discord') DEFAULT 'WhatsApp',
  contato_preferido VARCHAR(160),
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de psicologos
CREATE TABLE IF NOT EXISTS psicologos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha VARCHAR(200) NOT NULL,
  crp VARCHAR(50),
  especializacoes TEXT, -- JSON de strings
  bio TEXT,
  foto_perfil VARCHAR(255),
  disponivel TINYINT(1) DEFAULT 0,
  perfil_completo TINYINT(1) DEFAULT 0,
  aprovado TINYINT(1) DEFAULT 1,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS administradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha VARCHAR(200) NOT NULL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de solicitacoes
CREATE TABLE IF NOT EXISTS solicitacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL,
  id_psicologo INT NOT NULL,
  status ENUM('pendente','aceita','recusada') DEFAULT 'pendente',
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_solic_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_solic_psicologo FOREIGN KEY (id_psicologo) REFERENCES psicologos(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_solicitacao (id_paciente, id_psicologo)
);

-- Tabela de atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL,
  id_psicologo INT NOT NULL,
  data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('ativo','finalizado') DEFAULT 'ativo',
  link_consulta VARCHAR(255),
  CONSTRAINT fk_atend_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_atend_psicologo FOREIGN KEY (id_psicologo) REFERENCES psicologos(id) ON DELETE CASCADE
);

-- Índices auxiliares
-- Nota: Se o índice já existir, use DROP INDEX antes ou ignore o erro
CREATE INDEX idx_psicologos_disponiveis ON psicologos (disponivel, perfil_completo, aprovado);

-- Tabela de agendamentos (caso ainda não exista)
CREATE TABLE IF NOT EXISTS agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  profissional_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  status VARCHAR(20) DEFAULT 'agendado',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_agend_usuario FOREIGN KEY (usuario_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_agend_prof FOREIGN KEY (profissional_id) REFERENCES psicologos(id) ON DELETE CASCADE
);

-- Tabela de acompanhamentos (autoavaliações do paciente)
CREATE TABLE IF NOT EXISTS acompanhamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  texto TEXT,
  qualidade_sono TINYINT,
  humor VARCHAR(120),
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_acomp_usuario FOREIGN KEY (id_usuario) REFERENCES pacientes(id) ON DELETE CASCADE
);

-- Tabela de notas/sessões (anotações do psicólogo sobre sessões)
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
);

-- Tabela de horários disponíveis do psicólogo
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










