# Instruções para Adicionar Campos de Links de Comunicação

## Descrição
Este script adiciona campos para armazenar links de comunicação específicos no perfil do paciente, permitindo que pacientes adicionem números/links do WhatsApp, Telegram, Discord, Email e Telefone.

## Como Executar

1. Conecte-se ao banco de dados MySQL:
```bash
mysql -u seu_usuario -p psicocare
```

2. Execute o script SQL:
```sql
source src/scripts/add_links_comunicacao.sql
```

Ou execute diretamente os comandos SQL:

```sql
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS link_whatsapp VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS link_telegram VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS link_discord VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS link_email VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20) DEFAULT NULL;
```

**Nota:** Se a sua versão do MySQL não suportar `IF NOT EXISTS` no `ALTER TABLE`, execute:

```sql
ALTER TABLE pacientes 
ADD COLUMN link_whatsapp VARCHAR(255) DEFAULT NULL,
ADD COLUMN link_telegram VARCHAR(255) DEFAULT NULL,
ADD COLUMN link_discord VARCHAR(255) DEFAULT NULL,
ADD COLUMN link_email VARCHAR(255) DEFAULT NULL,
ADD COLUMN telefone VARCHAR(20) DEFAULT NULL;
```

(Se houver erro dizendo que a coluna já existe, ignore e continue)

## Funcionalidades Adicionadas

1. **Frontend (Paciente):**
   - Campos para adicionar links/números de WhatsApp, Telegram, Discord, Email e Telefone
   - Interface de edição no perfil

2. **Frontend (Psicólogo):**
   - Visualização dos links de comunicação do paciente na página de detalhes
   - Funcionalidade de copiar ao clicar (especialmente útil para números)
   - Indicador visual quando é um número (mostra "Toque para copiar número")

3. **Backend:**
   - Model atualizado para suportar os novos campos
   - Controller atualizado para processar os novos campos
   - Query de atendimentos atualizada para retornar dados de comunicação

## Testes Recomendados

1. Como paciente:
   - Edite o perfil e adicione links/números de comunicação
   - Salve e verifique se os dados foram salvos

2. Como psicólogo:
   - Visualize o perfil de um paciente vinculado
   - Clique nos links de comunicação para copiar
   - Verifique se os números são copiados corretamente

## Compatibilidade

- Mantém compatibilidade com o campo `contato_preferido` existente
- Os novos campos são opcionais
- Se um campo não for preenchido, não será exibido na interface











