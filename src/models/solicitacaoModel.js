const db = require('../config/db');

exports.create = (id_paciente, id_psicologo, cb) => {
  const sql = 'INSERT INTO solicitacoes (id_paciente, id_psicologo) VALUES (?,?)';
  db.query(sql, [id_paciente, id_psicologo], cb);
};

exports.findPendingForPsych = (id_psicologo, cb) => {
  const sql = `SELECT s.*, p.nome as paciente_nome, p.preferencia_comunicacao, p.contato_preferido
               FROM solicitacoes s
               JOIN pacientes p ON p.id = s.id_paciente
               WHERE s.id_psicologo = ? AND s.status = 'pendente'`;
  db.query(sql, [id_psicologo], cb);
};

exports.updateStatus = (id, status, cb) => {
  db.query('UPDATE solicitacoes SET status=? WHERE id=?', [status, id], cb);
};

exports.listByPaciente = (id_paciente, cb) => {
  const sql = `SELECT s.*, ps.nome as psicologo_nome
               FROM solicitacoes s JOIN psicologos ps ON ps.id = s.id_psicologo
               WHERE s.id_paciente = ? ORDER BY s.data_envio DESC`;
  db.query(sql, [id_paciente], cb);
};






