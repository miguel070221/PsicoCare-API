const db = require('../config/db');

exports.createFromSolicitacao = (id_paciente, id_psicologo, cb) => {
  // Garantir que o status seja 'ativo' explicitamente
  const sql = 'INSERT INTO atendimentos (id_paciente, id_psicologo, status) VALUES (?,?,?)';
  db.query(sql, [id_paciente, id_psicologo, 'ativo'], (err, result) => {
    if (err) {
      console.error('Erro ao criar atendimento:', err);
      return cb(err);
    }
    console.log(`Atendimento criado: paciente ${id_paciente} <-> psicólogo ${id_psicologo}, ID: ${result.insertId}`);
    cb(null, result);
  });
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
  // Filtrar apenas atendimentos ativos
  const sql = `SELECT a.*, ps.nome as psicologo_nome FROM atendimentos a
               JOIN psicologos ps ON ps.id = a.id_psicologo
               WHERE a.id_paciente = ? AND (a.status = 'ativo' OR a.status IS NULL)
               ORDER BY a.data_inicio DESC`;
  console.log('listByPaciente - SQL:', sql);
  console.log('listByPaciente - id_paciente:', id_paciente);
  db.query(sql, [id_paciente], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar atendimentos do paciente:', err);
      return cb(err);
    }
    console.log(`listByPaciente retornou ${rows?.length || 0} atendimentos`);
    if (rows && rows.length > 0) {
      rows.forEach((r, idx) => {
        console.log(`Atendimento ${idx + 1}: paciente ${r.id_paciente} <-> psicólogo ${r.id_psicologo}, status: ${r.status}`);
      });
    }
    cb(null, rows);
  });
};















