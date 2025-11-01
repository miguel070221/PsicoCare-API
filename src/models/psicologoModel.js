const db = require('../config/db');

exports.create = (psicologo, cb) => {
  const { nome, email, senha, crp, especializacoes, bio, foto_perfil, disponivel, perfil_completo, aprovado } = psicologo;
  const sql = `INSERT INTO psicologos (nome, email, senha, crp, especializacoes, bio, foto_perfil, disponivel, perfil_completo, aprovado)
              VALUES (?,?,?,?,?,?,?,?,?,?)`;
  db.query(sql, [nome, email, senha, crp, JSON.stringify(especializacoes || []), bio, foto_perfil, !!disponivel, !!perfil_completo, aprovado ?? 1], cb);
};

exports.update = (id, dados, cb) => {
  // Atualiza somente campos enviados para evitar sobrescrever com NULL/undefined
  const allowed = ['nome', 'crp', 'especializacoes', 'bio', 'foto_perfil', 'disponivel', 'perfil_completo', 'aprovado'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (dados[key] !== undefined) {
      if (key === 'especializacoes') {
        sets.push('especializacoes=?');
        params.push(JSON.stringify(dados[key] || []));
      } else if (key === 'disponivel' || key === 'perfil_completo') {
        sets.push(`${key}=?`);
        params.push(!!dados[key]);
      } else {
        sets.push(`${key}=?`);
        params.push(dados[key]);
      }
    }
  }
  if (sets.length === 0) return cb(null, { affectedRows: 0 });
  const sql = `UPDATE psicologos SET ${sets.join(', ')} WHERE id=?`;
  params.push(id);
  db.query(sql, params, cb);
};

exports.listPublic = (filtros, cb) => {
  const { especializacao, faixa, pacienteId } = filtros || {};
  // Lista todos os psicólogos aprovados OU psicólogos vinculados ao paciente (se fornecido)
  let sql = `SELECT DISTINCT p.id, p.nome, p.crp, p.especializacoes, p.bio, p.foto_perfil, 
                    p.disponivel, p.perfil_completo, p.aprovado,
                    CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END AS vinculado
             FROM psicologos p`;
  
  const where = [];
  const params = [];
  
  // Se pacienteId fornecido, inclui psicólogos vinculados mesmo se não aprovados
  if (pacienteId) {
    sql += ` LEFT JOIN atendimentos a ON a.id_psicologo = p.id AND a.id_paciente = ? AND a.status = 'ativo'`;
    params.push(pacienteId);
    where.push('(p.aprovado = 1 OR a.id IS NOT NULL)');
  } else {
    // Sem pacienteId, mostra todos os aprovados (sem filtro de disponibilidade)
    where.push('p.aprovado = 1');
  }
  
  if (where.length > 0) {
    sql += ' WHERE ' + where.join(' AND ');
  }
  
  if (especializacao) {
    sql += ' AND JSON_SEARCH(p.especializacoes, "one", ?) IS NOT NULL';
    params.push(especializacao);
  }
  // faixa etária pode ser representada via especializacoes também ("criancas", "adultos", "idosos")
  if (faixa) {
    sql += ' AND JSON_SEARCH(p.especializacoes, "one", ?) IS NOT NULL';
    params.push(faixa);
  }
  sql += ' ORDER BY vinculado DESC, p.disponivel DESC, p.nome ASC'; // Vinculados primeiro, depois disponíveis
  console.log('SQL listPublic:', sql, 'Params:', params);
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


