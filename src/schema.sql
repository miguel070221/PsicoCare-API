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
CREATE INDEX idx_psicologos_disponiveis ON psicologos (disponivel, perfil_completo, aprovado);






