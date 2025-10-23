// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');

/**
 * Função listar
 * Recupera todas as avaliações armazenadas no banco de dados do PsicoCare
 * e retorna os resultados como resposta JSON.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
exports.listar = (req, res) => {
  // Executa a query SQL para selecionar todos os registros da tabela avaliacoes
  db.query('SELECT * FROM avaliacoes', (err, results) => {
    // Verifica se houve erro na execução da query
    if (err) {
      // Retorna um erro HTTP 500 com a mensagem de erro do banco
      return res.status(500).json({ erro: err.message });
    }
    // Retorna os resultados da query como resposta JSON com status 200
    res.json(results);
  });
};

// Criar avaliação (autenticado)
exports.criar = (req, res) => {
  const id_usuario = req.usuario?.id;
  const { profissional_id, nota, comentario } = req.body;
  if (!id_usuario || !profissional_id || typeof nota === 'undefined') {
    return res.status(400).json({ erro: 'Dados incompletos para criar avaliação.' });
  }
  const sql = 'INSERT INTO avaliacoes (usuario_id, profissional_id, nota, comentario, data_hora) VALUES (?, ?, ?, ?, ?)';
  const data_hora = new Date();
  db.query(sql, [id_usuario, profissional_id, nota, comentario || '', data_hora], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id: result.insertId, usuario_id: id_usuario, profissional_id, nota, comentario, data_hora });
  });
};

// Listar avaliações públicas: retorna avaliações apenas para profissionais com >= 10 avaliações
exports.listarPublicas = (req, res) => {
  // Primeiro identifica profissionais com >= 10 avaliações
  const sql = `SELECT a.* FROM avaliacoes a JOIN (
    SELECT profissional_id FROM avaliacoes GROUP BY profissional_id HAVING COUNT(*) >= 10
  ) p ON a.profissional_id = p.profissional_id ORDER BY a.data_hora DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
};