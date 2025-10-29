const db = require('../config/db');

exports.create = (psicologo, cb) => {
  const { nome, email, senha, crp, especializacoes, bio, foto_perfil, disponivel, perfil_completo, aprovado } = psicologo;
  const sql = `INSERT INTO psicologos (nome, email, senha, crp, especializacoes, bio, foto_perfil, disponivel, perfil_completo, aprovado)
              VALUES (?,?,?,?,?,?,?,?,?,?)`;
  db.query(sql, [nome, email, senha, crp, JSON.stringify(especializacoes || []), bio, foto_perfil, !!disponivel, !!perfil_completo, aprovado ?? 1], cb);
};

exports.update = (id, dados, cb) => {
  const { nome, crp, especializacoes, bio, foto_perfil, disponivel, perfil_completo, aprovado } = dados;
  const sql = `UPDATE psicologos SET nome=?, crp=?, especializacoes=?, bio=?, foto_perfil=?, disponivel=?, perfil_completo=?, aprovado=? WHERE id=?`;
  db.query(sql, [nome, crp, JSON.stringify(especializacoes || []), bio, foto_perfil, !!disponivel, !!perfil_completo, aprovado ?? 1, id], cb);
};

exports.listPublic = (filtros, cb) => {
  const { especializacao, faixa } = filtros || {};
  let sql = `SELECT id, nome, crp, especializacoes, bio, foto_perfil FROM psicologos
             WHERE disponivel=1 AND aprovado=1`;
  const params = [];
  if (especializacao) {
    sql += ' AND JSON_SEARCH(especializacoes, "one", ?) IS NOT NULL';
    params.push(especializacao);
  }
  // faixa etária pode ser representada via especializacoes também ("criancas", "adultos", "idosos")
  if (faixa) {
    sql += ' AND JSON_SEARCH(especializacoes, "one", ?) IS NOT NULL';
    params.push(faixa);
  }
  db.query(sql, params, cb);
};

exports.findByEmail = (email, cb) => {
  db.query('SELECT * FROM psicologos WHERE email = ?', [email], cb);
};

exports.findById = (id, cb) => {
  db.query('SELECT * FROM psicologos WHERE id = ?', [id], cb);
};

exports.remove = (id, cb) => {
  db.query('DELETE FROM psicologos WHERE id = ?', [id], cb);
};


