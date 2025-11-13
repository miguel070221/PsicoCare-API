# Scripts do Banco de Dados

Esta pasta contém os scripts SQL essenciais para configurar o banco de dados do PsicoCare.

## Arquivos Essenciais

### 1. `criar-banco-tabelas.sql`
Script completo para criar o banco de dados `psicocare` e todas as tabelas necessárias.
- Execute este script no phpMyAdmin ou MySQL para criar o banco de dados inicial.

### 2. `SQL_COPIAR_COLAR_CRIAR_BANCO.sql`
Script simplificado para copiar e colar no phpMyAdmin.
- Contém o mesmo conteúdo do `criar-banco-tabelas.sql`, mas formatado para facilitar a cópia.

### 3. `SQL_COPIAR_COLAR_CRIAR_ADMIN.sql`
Script para criar o usuário administrador padrão.
- Execute após criar o banco de dados.
- Credenciais padrão:
  - Email: `admin@psicocare.com`
  - Senha: `admin123`

## Como Usar

1. Abra o phpMyAdmin (ou conecte-se ao MySQL via terminal).
2. Execute o script `SQL_COPIAR_COLAR_CRIAR_BANCO.sql` para criar o banco e as tabelas.
3. Execute o script `SQL_COPIAR_COLAR_CRIAR_ADMIN.sql` para criar o usuário administrador.
4. Configure o arquivo `.env` na raiz do projeto com as credenciais do banco de dados.

## Schema Principal

O schema completo está disponível em `../src/schema.sql` e é usado como referência principal para a estrutura do banco de dados.






