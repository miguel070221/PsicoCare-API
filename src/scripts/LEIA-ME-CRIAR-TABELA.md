# 🚨 URGENTE: Criar Tabela notas_sessoes

## ❌ PROBLEMA
A tabela `notas_sessoes` **NÃO EXISTE** no banco de dados, por isso as notas não estão salvando.

## ✅ SOLUÇÃO

### Passo 1: Abrir o script SQL
Abra o arquivo: `PsicoCare-API/src/scripts/CRIAR_TABELA_NOTAS_AGORA.sql`

### Passo 2: Executar no phpMyAdmin

1. **Abra o phpMyAdmin** no navegador
   - Geralmente em: `http://localhost/phpmyadmin`

2. **Selecione o banco `psicocare`**
   - No menu lateral esquerdo, clique em `psicocare`

3. **Vá na aba "SQL"**
   - Clique na aba "SQL" no topo

4. **Cole o conteúdo do script**
   - Abra o arquivo `CRIAR_TABELA_NOTAS_AGORA.sql`
   - Copie TODO o conteúdo
   - Cole no phpMyAdmin

5. **Execute o script**
   - Clique em "Executar" ou pressione `Ctrl+Enter`

6. **Verifique se funcionou**
   - Você deve ver: "Tabela notas_sessoes criada!"
   - A tabela deve aparecer na lista de tabelas

### Passo 3: Reiniciar o Backend
Após criar a tabela, **reinicie o servidor backend**:
```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente
cd PsicoCare-API
npm run dev
```

### Passo 4: Testar
Tente salvar uma nota novamente. Agora deve funcionar! ✅

## 🔍 Verificar se a Tabela Existe

Execute este comando no phpMyAdmin:
```sql
SHOW TABLES LIKE 'notas_sessoes';
```

Se retornar resultados, a tabela existe! ✅

## ❌ Se Der Erro

### Erro de Foreign Key
Se der erro de foreign key, verifique se estas tabelas existem:
- `psicologos`
- `pacientes`
- `agendamentos`

Se não existirem, execute primeiro o `schema.sql` completo.

### Erro de Permissão
Se der erro de permissão, verifique se o usuário MySQL tem permissão para criar tabelas.

## 📝 Conteúdo do Script

O script contém:
```sql
USE psicocare;

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
```

## ✅ Após Criar a Tabela

1. ✅ A tabela será criada
2. ✅ As notas poderão ser salvas
3. ✅ As notas poderão ser listadas
4. ✅ As notas poderão ser editadas
5. ✅ As notas poderão ser excluídas

---

**IMPORTANTE**: Execute o script ANTES de tentar salvar notas novamente!











