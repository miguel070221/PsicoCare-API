// src/models/acompanhamentoModel.js
const db = require('../config/db');

const Acompanhamento = {
  create: (acomp, callback) => {
    const sql = `INSERT INTO acompanhamentos (id_usuario, texto, qualidade_sono, humor, data_hora) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [acomp.id_usuario, acomp.texto, acomp.qualidade_sono, acomp.humor, acomp.data_hora], callback);
  },
  getByUsuario: (id_usuario, callback) => {
    const sql = `SELECT * FROM acompanhamentos WHERE id_usuario = ? ORDER BY data_hora DESC`;
    db.query(sql, [id_usuario], callback);
  },
};

module.exports = Acompanhamento;
