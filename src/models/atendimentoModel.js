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
  // Primeiro, vamos verificar TODOS os atendimentos para debug
  const debugSql = 'SELECT id, id_paciente, id_psicologo, status FROM atendimentos';
  db.query(debugSql, [], (errDebug, debugRows) => {
    if (!errDebug) {
      console.log('🔍 DEBUG: Todos os atendimentos na tabela:', debugRows?.length || 0);
      if (debugRows && debugRows.length > 0) {
        debugRows.forEach((a, idx) => {
          console.log(`  ${idx + 1}. ID: ${a.id}, Paciente: ${a.id_paciente}, Psicólogo: ${a.id_psicologo}, Status: ${a.status}`);
        });
      }
      // Verificar se há atendimentos para este psicólogo específico
      const atendimentosParaEstePsicologo = debugRows?.filter(a => Number(a.id_psicologo) === Number(id_psicologo)) || [];
      console.log(`🔍 DEBUG: Atendimentos para psicólogo ${id_psicologo}: ${atendimentosParaEstePsicologo.length}`);
      atendimentosParaEstePsicologo.forEach((a, idx) => {
        console.log(`  ${idx + 1}. ID: ${a.id}, Paciente: ${a.id_paciente}, Status: ${a.status}`);
      });
    }
  });
  
  // Filtrar apenas atendimentos ativos
  // Tentar buscar com campos de links primeiro, se falhar, buscar sem eles
  const sqlComLinks = `SELECT a.*, 
                             p.nome as paciente_nome,
                             p.preferencia_comunicacao,
                             p.contato_preferido,
                             p.link_whatsapp,
                             p.link_telegram,
                             p.link_discord,
                             p.link_email,
                             p.telefone
                       FROM atendimentos a
                       JOIN pacientes p ON p.id = a.id_paciente
                       WHERE a.id_psicologo = ? 
                         AND (a.status = 'ativo' OR a.status IS NULL)
                       ORDER BY a.data_inicio DESC`;
  
  const sqlSemLinks = `SELECT a.*, 
                             p.nome as paciente_nome,
                             p.preferencia_comunicacao,
                             p.contato_preferido
                       FROM atendimentos a
                       JOIN pacientes p ON p.id = a.id_paciente
                       WHERE a.id_psicologo = ? 
                         AND (a.status = 'ativo' OR a.status IS NULL)
                       ORDER BY a.data_inicio DESC`;
  
  console.log('listByPsicologo - id_psicologo:', id_psicologo, 'Tipo:', typeof id_psicologo);
  
  // Tentar primeiro com campos de links
  db.query(sqlComLinks, [id_psicologo], (err, rows) => {
    if (err && err.code === 'ER_BAD_FIELD_ERROR') {
      // Se as colunas não existem, buscar sem elas
      console.log('⚠️ Campos de links não encontrados, buscando sem eles...');
      db.query(sqlSemLinks, [id_psicologo], (err2, rows2) => {
        if (err2) {
          console.error('Erro ao buscar atendimentos do psicólogo:', err2);
          return cb(err2);
        }
        
        // Adicionar campos de links como null
        if (rows2 && rows2.length > 0) {
          rows2.forEach((row) => {
            row.link_whatsapp = null;
            row.link_telegram = null;
            row.link_discord = null;
            row.link_email = null;
            row.telefone = null;
          });
        }
        
        console.log(`listByPsicologo retornou ${rows2?.length || 0} atendimentos (sem campos de links)`);
        if (rows2 && rows2.length > 0) {
          rows2.forEach((r, idx) => {
            console.log(`Atendimento ${idx + 1}: paciente ${r.id_paciente} (${r.paciente_nome}) <-> psicólogo ${r.id_psicologo}, status: ${r.status}`);
          });
        }
        cb(null, rows2 || []);
      });
    } else if (err) {
      console.error('Erro ao buscar atendimentos do psicólogo:', err);
      return cb(err);
    } else {
      // Sucesso com campos de links
      console.log(`listByPsicologo retornou ${rows?.length || 0} atendimentos (com campos de links)`);
      if (rows && rows.length > 0) {
        rows.forEach((r, idx) => {
          console.log(`Atendimento ${idx + 1}: paciente ${r.id_paciente} (${r.paciente_nome}) <-> psicólogo ${r.id_psicologo}, status: ${r.status}`);
        });
      } else {
        console.log('⚠️ Nenhum atendimento ativo encontrado para este psicólogo');
      }
      cb(null, rows || []);
    }
  });
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















