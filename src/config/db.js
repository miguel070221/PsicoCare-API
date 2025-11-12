// Importa a biblioteca mysql2 para conexão com o banco de dados MySQL
const mysql = require('mysql2');

// Verifica se as variáveis de ambiente estão configuradas
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ ERRO: Variáveis de ambiente do banco de dados não configuradas!');
  console.error('📝 Por favor, crie um arquivo .env na pasta PsicoCare-API com:');
  console.error('   DB_HOST=localhost');
  console.error('   DB_USER=root');
  console.error('   DB_PASSWORD=sua_senha');
  console.error('   DB_NAME=psicocare');
  console.error('   JWT_SECRET=supersecret');
  console.error('   JWT_EXPIRES_IN=1d');
  console.error('   PORT=3333');
  process.exit(1);
}

// Cria uma conexão com o banco de dados MySQL usando variáveis de ambiente
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', // Endereço do servidor MySQL, definido em variáveis de ambiente
  user: process.env.DB_USER || 'root', // Nome de usuário do banco, definido em variáveis de ambiente
  password: process.env.DB_PASSWORD || '', // Senha do banco, definida em variáveis de ambiente para segurança
  database: process.env.DB_NAME || 'psicocare' // Nome do banco de dados do PsicoCare, definido em variáveis de ambiente
});

// Estabelece a conexão com o banco e verifica erros
db.connect(err => {
  if (err) {
    console.error('❌ ERRO ao conectar ao banco de dados MySQL!');
    console.error('📋 Detalhes do erro:', err.message);
    console.error('');
    console.error('🔧 Possíveis soluções:');
    console.error('   1. Verifique se o MySQL está rodando (XAMPP, WAMP, ou serviço MySQL)');
    console.error('   2. Verifique se as credenciais no arquivo .env estão corretas');
    console.error('   3. Verifique se o banco de dados "psicocare" existe');
    console.error('   4. Verifique se a porta 3306 está disponível');
    console.error('');
    console.error('💡 Para criar o banco de dados, execute o arquivo:');
    console.error('   PsicoCare-API/src/schema.sql');
    console.error('');
    // Não lança o erro para evitar crash, mas o servidor não funcionará corretamente
    // O servidor continuará rodando, mas as rotas que precisam do banco falharão
    return;
  }
  // Exibe uma mensagem no console para confirmar a conexão bem-sucedida
  console.log('✅ Conectado ao banco de dados MySQL!');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}`);
});

// Exporta o objeto de conexão para uso em outros módulos do back-end
module.exports = db;