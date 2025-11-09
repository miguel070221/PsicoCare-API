const db = require('../config/db');

exports.create = (nota, cb) => {
  const { id_psicologo, id_paciente, titulo, conteudo, data_sessao, id_agendamento } = nota;
  const sql = `INSERT INTO notas_sessoes (id_psicologo, id_paciente, titulo, conteudo, data_sessao, id_agendamento)
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [id_psicologo, id_paciente, titulo, conteudo, data_sessao || null, id_agendamento || null], cb);
};

exports.listByPsicologo = (id_psicologo, cb) => {
  const sql = `SELECT n.*, p.nome as paciente_nome 
               FROM notas_sessoes n
               LEFT JOIN pacientes p ON p.id = n.id_paciente
               WHERE n.id_psicologo = ?
               ORDER BY n.created_at DESC`;
  db.query(sql, [id_psicologo], cb);
};

exports.listByPaciente = (id_psicologo, id_paciente, cb) => {
  const sql = `SELECT n.*, p.nome as paciente_nome 
               FROM notas_sessoes n
               LEFT JOIN pacientes p ON p.id = n.id_paciente
               WHERE n.id_psicologo = ? AND n.id_paciente = ?
               ORDER BY n.created_at DESC`;
  db.query(sql, [id_psicologo, id_paciente], cb);
};

exports.getById = (id, id_psicologo, cb) => {
  const sql = `SELECT n.*, p.nome as paciente_nome 
               FROM notas_sessoes n
               LEFT JOIN pacientes p ON p.id = n.id_paciente
               WHERE n.id = ? AND n.id_psicologo = ?`;
  db.query(sql, [id, id_psicologo], (err, rows) => {
    if (err) return cb(err);
    cb(null, rows[0]);
  });
};

exports.update = (id, dados, id_psicologo, cb) => {
  const allowed = ['titulo', 'conteudo', 'data_sessao'];
  const sets = [];
  const params = [];
  
  for (const key of allowed) {
    if (dados[key] !== undefined) {
      sets.push(`${key}=?`);
      params.push(dados[key]);
    }
  }
  
  if (sets.length === 0) return cb(null, { affectedRows: 0 });
  
  sets.push('updated_at=NOW()');
  params.push(id, id_psicologo);
  
  const sql = `UPDATE notas_sessoes SET ${sets.join(', ')} WHERE id=? AND id_psicologo=?`;
  db.query(sql, params, cb);
};

exports.remove = (id, id_psicologo, cb) => {
  const sql = 'DELETE FROM notas_sessoes WHERE id = ? AND id_psicologo = ?';
  db.query(sql, [id, id_psicologo], cb);
};




