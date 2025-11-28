# Scripts SQL - Guia de Uso

## 📋 Resumo

Este diretório contém scripts SQL para atualizar o banco de dados. **Você só precisa executar UM script**.

## ✅ O que fazer:

### 1. Execute APENAS este script:
**`ATUALIZAR_BANCO.sql`** - Script consolidado e seguro

Este script:
- ✅ Adiciona as colunas de links de comunicação (se ainda não existirem)
- ✅ Verifica se as tabelas necessárias existem
- ✅ É seguro executar múltiplas vezes (não causa erros)

### 2. Como executar:

**Opção A - phpMyAdmin:**
1. Abra o phpMyAdmin
2. Selecione o banco `psicocare`
3. Vá na aba "SQL"
4. Cole o conteúdo do arquivo `ATUALIZAR_BANCO.sql`
5. Clique em "Executar"

**Opção B - Linha de comando MySQL:**
```bash
mysql -u seu_usuario -p psicocare < src/scripts/ATUALIZAR_BANCO.sql
```

## ❌ O que NÃO fazer:

- ❌ **NÃO execute** os scripts duplicados:
  - `adicionar_colunas_links.sql` (versão antiga)
  - `adicionar_colunas_links_simples.sql` (pode dar erro)
  - `add_links_comunicacao.sql` (versão antiga)
  - `add_links_comunicacao_safe.sql` (versão antiga)
  - `criar_tabela_horarios.sql` (já existe no schema.sql)
  - `create_horarios_table.sql` (já existe no schema.sql)

## 📝 Notas importantes:

1. **Tabela `horarios_disponiveis`**: Já está definida no `schema.sql`. Se você executou o schema.sql, esta tabela já existe. Os scripts separados são **redundantes**.

2. **Tabela `notas_sessoes`**: Já está definida no `schema.sql`. Se você executou o schema.sql, esta tabela já existe.

3. **Colunas de links**: O script `ATUALIZAR_BANCO.sql` adiciona as colunas necessárias de forma segura, verificando se já existem antes de criar.

## 🔍 Verificação:

Após executar o script, você verá:
- Lista das colunas de comunicação adicionadas
- Status das tabelas `horarios_disponiveis` e `notas_sessoes`
- Mensagem de conclusão

## 🆘 Se algo der errado:

Se você receber um erro, verifique:
1. Se o banco de dados `psicocare` existe
2. Se você tem permissões para alterar tabelas
3. Se as colunas já existem (isso é normal e não é um erro)

## 📚 Scripts antigos (manter para referência):

Os outros scripts foram mantidos para referência histórica, mas **não precisam ser executados**. O script `ATUALIZAR_BANCO.sql` consolida tudo que é necessário.














