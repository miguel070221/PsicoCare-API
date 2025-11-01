const db = require('../config/db');

exports.createFromSolicitacao = (id_paciente, id_psicologo, cb) => {
  const sql = 'INSERT INTO atendimentos (id_paciente, id_psicologo) VALUES (?,?)';
  db.query(sql, [id_paciente, id_psicologo], cb);
};

exports.updateLink = (id, link_consulta, cb) => {
  db.query('UPDATE atendimentos SET link_consulta=? WHERE id=?', [link_consulta, id], cb);
};

exports.updateStatus = (id, status, cb) => {
  db.query('UPDATE atendimentos SET status=? WHERE id=?', [status, id], cb);
};

exports.listByPsicologo = (id_psicologo, cb) => {
  const sql = `SELECT a.*, p.nome as paciente_nome FROM atendimentos a
               JOIN pacientes p ON p.id = a.id_paciente
               WHERE a.id_psicologo = ? ORDER BY a.data_inicio DESC`;
  db.query(sql, [id_psicologo], cb);
};

exports.listByPaciente = (id_paciente, cb) => {
  const sql = `SELECT a.*, ps.nome as psicologo_nome FROM atendimentos a
               JOIN psicologos ps ON ps.id = a.id_psicologo
               WHERE a.id_paciente = ? ORDER BY a.data_inicio DESC`;
  db.query(sql, [id_paciente], cb);
};













