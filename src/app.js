// Importa o framework Express para criar o servidor da API
const express = require('express');
// Importa o middleware CORS para permitir requisições de origens diferentes
const cors = require('cors');
// Carrega variáveis de ambiente do arquivo .env para configuração segura
require('dotenv').config();

// Inicializa o aplicativo Express
const app = express();

// Configura o middleware CORS para permitir acesso ao front-end do PsicoCare
app.use(cors());
// Configura o middleware para interpretar corpos de requisições no formato JSON
app.use(express.json());

/**
 * Rota base da API
 * Retorna uma mensagem confirmando que a API do PsicoCare está funcionando.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
app.get('/', (req, res) => {
  res.send('API PsicoCare funcionando!');
});

// Configura as rotas principais da API, delegando para os respectivos módulos
app.use('/auth', require('./routes/auth')); // Rotas de autenticação (ex.: login)
app.use('/usuarios', require('./routes/usuarios')); // Rotas para gerenciamento de usuários
app.use('/profissionais', require('./routes/profissionais')); // Rotas para gerenciamento de profissionais
app.use('/agendamentos', require('./routes/agendamentos')); // Rotas para gerenciamento de agendamentos

app.use('/acompanhamentos', require('./routes/acompanhamentos'));
app.use('/avaliacoes', require('./routes/avaliacoes')); // Rotas para gerenciamento de avaliações

// Define a porta do servidor, usando a variável de ambiente PORT ou 3333 como padrão
const PORT = process.env.PORT || 3333;

// Inicia o servidor na porta especificada e exibe uma mensagem de confirmação
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Importa o objeto de conexão com o banco de dados MySQL (parece não ser usado diretamente aqui)
// TODO: Verificar se esta linha é necessária ou se deve ser movida para outro arquivo
const db = require('./config/db');
// Importa o router do módulo de autenticação (parece não ser usado diretamente aqui)
// TODO: Verificar se esta linha é necessária ou se é um erro de formatação
const { router } = require('./routes/auth');