// Importa a biblioteca mysql2 para conexão com o banco de dados MySQL
const mysql = require('mysql2');

// Cria uma conexão com o banco de dados MySQL usando variáveis de ambiente
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Endereço do servidor MySQL, definido em variáveis de ambiente
  user: process.env.DB_USER, // Nome de usuário do banco, definido em variáveis de ambiente
  password: process.env.DB_PASSWORD, // Senha do banco, definida em variáveis de ambiente para segurança
  database: process.env.DB_NAME // Nome do banco de dados do PsicoCare, definido em variáveis de ambiente
});

// Estabelece a conexão com o banco e verifica erros
db.connect(err => {
  if (err) {
    // Lança um erro se a conexão falhar, interrompendo a execução
    throw err;
  }
  // Exibe uma mensagem no console para confirmar a conexão bem-sucedida
  console.log('Conectado ao banco de dados MySQL!');
});

// Exporta o objeto de conexão para uso em outros módulos do back-end
module.exports = db;