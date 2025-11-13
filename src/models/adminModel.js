const db = require('../config/db');

exports.create = (admin, cb) => {
  const { nome, email, senha } = admin;
  db.query('INSERT INTO administradores (nome, email, senha) VALUES (?,?,?)', [nome, email, senha], cb);
};

exports.findByEmail = (email, cb) => {
  db.query('SELECT * FROM administradores WHERE email = ?', [email], cb);
};

exports.list = (cb) => db.query('SELECT id, nome, email, data_criacao FROM administradores', cb);

exports.remove = (id, cb) => db.query('DELETE FROM administradores WHERE id = ?', [id], cb);






























