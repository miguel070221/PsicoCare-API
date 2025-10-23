// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');

/**
 * Função listar
 * Recupera todos os agendamentos do banco de dados do PsicoCare e retorna como resposta JSON.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
exports.listar = (req, res) => {
  const { usuarioId } = req.query;
  let sql = 'SELECT * FROM agendamentos';
  let params = [];
  if (usuarioId) {
    sql += ' WHERE usuario_id = ?';
    params.push(usuarioId);
  }
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(results);
  });
};

// Criar novo agendamento
exports.criar = (req, res) => {
  const id_usuario = req.usuario?.id;
  const { profissional_id, data_hora } = req.body;

  if (!id_usuario || !profissional_id || !data_hora) {
    return res.status(400).json({ erro: 'Dados incompletos para criar agendamento.' });
  }

  // Espera data_hora em ISO
  const sql = 'INSERT INTO agendamentos (usuario_id, profissional_id, data_hora, status) VALUES (?, ?, ?, ?)';
  db.query(sql, [id_usuario, profissional_id, data_hora, 'agendado'], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id: result.insertId, usuario_id: id_usuario, profissional_id, data_hora, status: 'agendado' });
  });
};