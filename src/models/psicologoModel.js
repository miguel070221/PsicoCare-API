const db = require('../config/db');

exports.create = (psicologo, cb) => {
  const { nome, email, senha, crp, especializacoes, bio, foto_perfil, telefone, redes_sociais, disponivel, perfil_completo, aprovado } = psicologo;
  const sql = `INSERT INTO psicologos (nome, email, senha, crp, especializacoes, bio, foto_perfil, telefone, redes_sociais, disponivel, perfil_completo, aprovado)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
  db.query(sql, [
    nome, email, senha, crp, 
    JSON.stringify(especializacoes || []), 
    bio, foto_perfil, telefone || null,
    redes_sociais ? JSON.stringify(redes_sociais) : null,
    !!disponivel, !!perfil_completo, aprovado ?? 1
  ], cb);
};

exports.update = (id, dados, cb) => {
  // Atualiza somente campos enviados para evitar sobrescrever com NULL/undefined
  const allowed = ['nome', 'email', 'crp', 'especializacoes', 'bio', 'foto_perfil', 'telefone', 'redes_sociais', 'disponivel', 'perfil_completo', 'aprovado'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (dados[key] !== undefined) {
      if (key === 'especializacoes' || key === 'redes_sociais') {
        sets.push(`${key}=?`);
        if (key === 'redes_sociais') {
          // Se redes_sociais está vazio ou é um objeto vazio, salva como null
          const redes = dados[key];
          if (!redes || (typeof redes === 'object' && Object.keys(redes).length === 0)) {
            params.push(null);
          } else {
            params.push(JSON.stringify(redes));
          }
        } else {
          params.push(JSON.stringify(dados[key] || []));
        }
      } else if (key === 'disponivel' || key === 'perfil_completo' || key === 'aprovado') {
        sets.push(`${key}=?`);
        params.push(dados[key] === true || dados[key] === 1 ? 1 : 0);
      } else {
        sets.push(`${key}=?`);
        // Se o valor for string vazia, converte para null
        const valor = dados[key];
        params.push(valor === '' || valor === undefined ? null : valor);
      }
    }
  }
  if (sets.length === 0) return cb(null, { affectedRows: 0 });
  const sql = `UPDATE psicologos SET ${sets.join(', ')} WHERE id=?`;
  params.push(id);
  db.query(sql, params, cb);
};

exports.listPublic = (filtros, cb) => {
  const { especializacao, faixa, pacienteId, apenasVinculados } = filtros || {};
  // Lista todos os psicólogos aprovados OU psicólogos vinculados ao paciente (se fornecido)
  let sql = `SELECT DISTINCT p.id, p.nome, p.crp, p.especializacoes, p.bio, p.foto_perfil, 
                    p.telefone, p.redes_sociais,
                    p.disponivel, p.perfil_completo, p.aprovado,
                    CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END AS vinculado
             FROM psicologos p`;
  
  const where = [];
  const params = [];
  
  // Se pacienteId fornecido, inclui psicólogos vinculados mesmo se não aprovados
  if (pacienteId) {
    sql += ` LEFT JOIN atendimentos a ON a.id_psicologo = p.id AND a.id_paciente = ? AND (a.status = 'ativo' OR a.status IS NULL)`;
    params.push(pacienteId);
    
    // Se apenasVinculados for true, mostra apenas os vinculados
    if (apenasVinculados) {
      where.push('a.id IS NOT NULL AND a.status = \'ativo\'');
    } else {
      where.push('(p.aprovado = 1 OR (a.id IS NOT NULL AND a.status = \'ativo\'))');
    }
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
  console.log('SQL listPublic:', sql);
  console.log('Params:', params);
  console.log('apenasVinculados:', apenasVinculados, 'pacienteId:', pacienteId);
  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Erro na query listPublic:', err);
      return cb(err);
    }
    console.log(`Query retornou ${rows?.length || 0} psicólogos`);
    if (rows && rows.length > 0) {
      console.log('Primeiro psicólogo:', JSON.stringify(rows[0], null, 2));
      rows.forEach((r, idx) => {
        console.log(`Psicólogo ${idx + 1}: ${r.nome} (ID: ${r.id}), vinculado: ${r.vinculado} (tipo: ${typeof r.vinculado})`);
      });
    }
    cb(null, rows);
  });
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

// Buscar psicólogos vinculados diretamente pelos atendimentos do paciente
exports.listByAtendimentos = (id_paciente, cb) => {
  // Primeiro, vamos verificar se existem atendimentos para este paciente
  const sqlCheck = `SELECT COUNT(*) as total FROM atendimentos WHERE id_paciente = ?`;
  console.log('=== listByAtendimentos ===');
  console.log('Verificando atendimentos para paciente ID:', id_paciente);
  
  db.query(sqlCheck, [id_paciente], (errCheck, checkRows) => {
    if (errCheck) {
      console.error('Erro ao verificar atendimentos:', errCheck);
      return cb(errCheck);
    }
    console.log(`Total de atendimentos encontrados: ${checkRows[0]?.total || 0}`);
    
    // Agora busca os atendimentos com detalhes
    const sqlDetails = `SELECT a.id, a.id_paciente, a.id_psicologo, a.status, p.nome as psicologo_nome 
                        FROM atendimentos a 
                        LEFT JOIN psicologos p ON p.id = a.id_psicologo
                        WHERE a.id_paciente = ?`;
    db.query(sqlDetails, [id_paciente], (errDetails, detailRows) => {
      if (errDetails) {
        console.error('Erro ao buscar detalhes dos atendimentos:', errDetails);
        return cb(errDetails);
      }
      console.log(`Detalhes dos atendimentos:`, JSON.stringify(detailRows, null, 2));
      
      // Agora executa a query principal - busca psicólogos vinculados via atendimentos ativos
      // A condição de status deve estar no JOIN para garantir que apenas atendimentos ativos sejam considerados
      const sql = `SELECT DISTINCT p.id, p.nome, p.crp, p.especializacoes, p.bio, p.foto_perfil, 
                          p.telefone, p.redes_sociais,
                          p.disponivel, p.perfil_completo, p.aprovado,
                          1 AS vinculado
                   FROM psicologos p
                   INNER JOIN atendimentos a ON a.id_psicologo = p.id 
                      AND a.id_paciente = ? 
                      AND (a.status = 'ativo' OR a.status IS NULL)
                   ORDER BY p.nome ASC`;
      console.log('SQL principal:', sql);
      console.log('Parâmetro id_paciente:', id_paciente);
      console.log('Tipo do id_paciente:', typeof id_paciente);
      
      db.query(sql, [id_paciente], (err, rows) => {
        if (err) {
          console.error('Erro ao buscar psicólogos por atendimentos:', err);
          return cb(err);
        }
        console.log(`Query retornou ${rows?.length || 0} psicólogos`);
        console.log('Tipo de rows:', typeof rows);
        console.log('É array?', Array.isArray(rows));
        if (rows && rows.length > 0) {
          rows.forEach((r, idx) => {
            console.log(`Psicólogo ${idx + 1}: ${r.nome} (ID: ${r.id}), disponível: ${r.disponivel}`);
          });
        } else {
          console.log('⚠️ Nenhum psicólogo encontrado. Verificando se há atendimentos ativos para este paciente...');
          // Vamos fazer uma query de debug para verificar
          const debugSql = `SELECT * FROM atendimentos WHERE id_paciente = ?`;
          db.query(debugSql, [id_paciente], (errDebug, debugRows) => {
            if (!errDebug) {
              console.log(`📊 Atendimentos encontrados para paciente ${id_paciente}:`, JSON.stringify(debugRows, null, 2));
              if (debugRows && debugRows.length > 0) {
                console.log('📊 Status dos atendimentos:', debugRows.map(a => ({ id: a.id, id_psicologo: a.id_psicologo, status: a.status })));
              } else {
                console.log('⚠️ Nenhum atendimento encontrado na tabela atendimentos para este paciente');
              }
            } else {
              console.error('Erro ao buscar atendimentos de debug:', errDebug);
            }
          });
        }
        // Garantir que sempre retornamos um array
        cb(null, Array.isArray(rows) ? rows : []);
      });
    });
  });
};


