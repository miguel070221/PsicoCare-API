/**
 * Função buscarPorId
 * Busca um usuário no banco de dados do PsicoCare pelo ID fornecido.
 * @param {number} id - ID do usuário a ser buscado
 * @param {Function} callback - Função de callback para lidar com o resultado ou erro da query
 */
exports.buscarPorId = (id, callback) => {
  const sql = 'SELECT id, nome, email FROM usuarios WHERE id = ?';
  db.query(sql, [id], callback);
};
/**
 * Função atualizar
 * Atualiza nome e email de um usuário pelo id.
 * @param {number} id - ID do usuário
 * @param {string} nome - Novo nome
 * @param {string} email - Novo email
 * @param {Function} callback - Função de callback para lidar com o resultado ou erro da query
 */
exports.atualizar = (id, nome, email, callback) => {
  const sql = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
  db.query(sql, [nome, email, id], callback);
};
// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');

/**
 * Função cadastrar
 * Insere um novo usuário na tabela usuarios do banco de dados do PsicoCare.
 * @param {string} nome - Nome do usuário
 * @param {string} email - E-mail do usuário
 * @param {string} senha - Senha do usuário (espera-se que já esteja criptografada)
 * @param {Function} callback - Função de callback para lidar com o resultado ou erro da query
 */
exports.cadastrar = (nome, email, senha, callback) => {
  // Define a query SQL para inserir um novo usuário na tabela usuarios
  const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  // Executa a query com os parâmetros fornecidos, passando o resultado para o callback
  db.query(sql, [nome, email, senha], callback);
};

/**
 * Função listar
 * Recupera uma lista de todos os usuários do PsicoCare, retornando apenas ID, nome e e-mail.
 * @param {Function} callback - Função de callback para lidar com o resultado ou erro da query
 */
exports.listar = (callback) => {
  // Define a query SQL para selecionar ID, nome e e-mail da tabela usuarios
  const sql = 'SELECT id, nome, email FROM usuarios';
  // Executa a query, passando o resultado para o callback
  db.query(sql, callback);
};

/**
 * Função buscarPorEmail
 * Busca um usuário no banco de dados do PsicoCare pelo e-mail fornecido.
 * @param {string} email - E-mail do usuário a ser buscado
 * @param {Function} callback - Função de callback para lidar com o resultado ou erro da query
 */
exports.buscarPorEmail = (email, callback) => {
  // Define a query SQL para buscar um usuário pelo e-mail
  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  // Executa a query com o e-mail fornecido, passando o resultado para o callback
  db.query(sql, [email], callback);
};