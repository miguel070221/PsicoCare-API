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
// Rotas novas do sistema
app.use('/pacientes', require('./routes/pacientes'));
app.use('/psicologos', require('./routes/psicologos'));
app.use('/admin', require('./routes/admin'));
app.use('/solicitacoes', require('./routes/solicitacoes'));
app.use('/atendimentos', require('./routes/atendimentos'));
app.use('/acompanhamentos', require('./routes/acompanhamentos'));

// Define a porta do servidor, usando a variável de ambiente PORT ou 3333 como padrão
const PORT = process.env.PORT || 3333;

// Inicia o servidor na porta especificada e exibe uma mensagem de confirmação
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Conexão é estabelecida ao importar config/db
require('./config/db');