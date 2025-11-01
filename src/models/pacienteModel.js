const db = require('../config/db');

exports.create = (paciente, cb) => {
  const { nome, email, senha, idade, genero, preferencia_comunicacao, contato_preferido } = paciente;
  const sql = `INSERT INTO pacientes (nome, email, senha, idade, genero, preferencia_comunicacao, contato_preferido)
              VALUES (?,?,?,?,?,?,?)`;
  db.query(sql, [nome, email, senha, idade, genero, preferencia_comunicacao, contato_preferido], cb);
};

exports.findByEmail = (email, cb) => {
  db.query('SELECT * FROM pacientes WHERE email = ?', [email], cb);
};

exports.findById = (id, cb) => {
  db.query('SELECT * FROM pacientes WHERE id = ?', [id], cb);
};

exports.update = (id, dados, cb) => {
  const { nome, idade, genero, preferencia_comunicacao, contato_preferido } = dados;
  const sql = `UPDATE pacientes SET nome=?, idade=?, genero=?, preferencia_comunicacao=?, contato_preferido=? WHERE id=?`;
  db.query(sql, [nome, idade, genero, preferencia_comunicacao, contato_preferido, id], cb);
};

exports.list = (cb) => {
  db.query('SELECT id, nome, email, idade, genero, preferencia_comunicacao, contato_preferido, data_criacao FROM pacientes', cb);
};

exports.remove = (id, cb) => {
  db.query('DELETE FROM pacientes WHERE id = ?', [id], cb);
};













