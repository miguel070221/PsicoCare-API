# Como Criar a Tabela horarios_disponiveis no phpMyAdmin

## Passos para executar:

1. **Acesse o phpMyAdmin**
   - Abra seu navegador e acesse o phpMyAdmin (geralmente em `http://localhost/phpmyadmin`)

2. **Selecione o banco de dados**
   - No lado esquerdo, clique no banco de dados `psicocare`
   - Se não existir, crie-o primeiro

3. **Abra a aba SQL**
   - Clique na aba "SQL" no topo da página

4. **Cole o script SQL abaixo:**

```sql
USE psicocare;

CREATE TABLE IF NOT EXISTS horarios_disponiveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_psicologo INT NOT NULL,
  dia_semana TINYINT NOT NULL COMMENT '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado',
  hora_inicio TIME NOT NULL COMMENT 'Horário de início (ex: 09:00)',
  hora_fim TIME NOT NULL COMMENT 'Horário de fim (ex: 18:00)',
  duracao_minutos INT DEFAULT 60 COMMENT 'Duração de cada consulta em minutos',
  ativo TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_horario_psicologo FOREIGN KEY (id_psicologo) REFERENCES psicologos(id) ON DELETE CASCADE,
  INDEX idx_psicologo_dia (id_psicologo, dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. **Execute o script**
   - Clique no botão "Executar" ou pressione Ctrl+Enter

6. **Verificar se funcionou**
   - Você deve ver uma mensagem de sucesso
   - A tabela `horarios_disponiveis` deve aparecer na lista de tabelas do banco `psicocare`

## Se der erro:

- **Erro de Foreign Key**: Certifique-se de que a tabela `psicologos` existe
- **Erro de Banco**: Verifique se o banco `psicocare` existe
- **Erro de Permissão**: Verifique se o usuário MySQL tem permissão para criar tabelas

## Verificar se a tabela foi criada:

Execute este comando no phpMyAdmin:

```sql
SHOW TABLES LIKE 'horarios_disponiveis';
```

Ou verifique a estrutura:

```sql
DESCRIBE horarios_disponiveis;
```



















