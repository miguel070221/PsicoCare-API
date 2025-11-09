// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');

/**
 * Função listar
 * Recupera todos os agendamentos do banco de dados do PsicoCare e retorna como resposta JSON.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
exports.listar = (req, res) => {
  const { usuarioId, profissionalId } = req.query;
  // Compatibilidade com estrutura real: id_usuario, id_profissional, data, horario
  // Ou estrutura nova: usuario_id, profissional_id, data_hora
  let sql = `
    SELECT a.id,
           COALESCE(a.usuario_id, a.id_usuario) AS usuario_id,
           COALESCE(a.profissional_id, a.id_profissional) AS profissional_id,
           COALESCE(a.data_hora, CONCAT(a.data, ' ', a.horario)) AS data_hora,
           a.status,
           COALESCE(
             DATE_FORMAT(a.data_hora, '%d-%m-%Y'),
             DATE_FORMAT(a.data, '%d-%m-%Y')
           ) AS data,
           COALESCE(
             DATE_FORMAT(a.data_hora, '%H:%i'),
             DATE_FORMAT(a.horario, '%H:%i')
           ) AS horario,
           COALESCE(ps.nome, prof.nome) AS psicologo_nome,
           p.nome  AS paciente_nome
    FROM agendamentos a
    LEFT JOIN psicologos ps ON ps.id = a.profissional_id
    LEFT JOIN profissionais prof ON prof.id = a.id_profissional
    LEFT JOIN pacientes p   ON p.id = COALESCE(a.usuario_id, a.id_usuario)
  `;
  const where = [];
  const params = [];
  if (usuarioId) {
    where.push('(a.usuario_id = ? OR a.id_usuario = ?)');
    params.push(usuarioId, usuarioId);
  }
  if (profissionalId) {
    where.push('(a.profissional_id = ? OR a.id_profissional = ?)');
    params.push(profissionalId, profissionalId);
  }
  if (where.length) {
    sql += ' WHERE ' + where.join(' AND ');
  }
  sql += ' ORDER BY COALESCE(a.data_hora, CONCAT(a.data, \' \', a.horario)) DESC';
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(results);
  });
};

// Criar novo agendamento
exports.criar = (req, res) => {
  const usuarioTokenId = req.usuario?.id;
  const role = req.usuario?.role;
  const { profissional_id, data_hora, paciente_id } = req.body;

  // Validação básica dos campos de data
  if (!data_hora) {
    return res.status(400).json({ erro: 'data_hora é obrigatório.' });
  }

  // Cenários:
  // 1) Paciente autenticado cria seu próprio agendamento -> usa usuarioTokenId como usuario_id e precisa de profissional_id
  // 2) Psicólogo autenticado cria para um paciente vinculado -> usa paciente_id como usuario_id e profissional_id do corpo (ou o próprio do token)

  // Converter data_hora ISO para data e horario (estrutura antiga) ou manter data_hora (estrutura nova)
  let dataDate, horarioTime, dataHoraFinal;
  try {
    const dataObj = new Date(data_hora);
    dataDate = dataObj.toISOString().split('T')[0]; // YYYY-MM-DD
    horarioTime = dataObj.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    dataHoraFinal = data_hora;
  } catch (e) {
    return res.status(400).json({ erro: 'Formato de data_hora inválido.' });
  }

  // Verificar estrutura da tabela (tenta com campos antigos primeiro)
  const checkTableStructure = 'SHOW COLUMNS FROM agendamentos WHERE Field IN ("id_usuario", "usuario_id")';
  db.query(checkTableStructure, (errCheck, columns) => {
    if (errCheck) {
      return res.status(500).json({ erro: 'Erro ao verificar estrutura da tabela: ' + errCheck.message });
    }
    
    // Verifica se existe id_usuario (estrutura antiga) ou usuario_id (estrutura nova)
    const hasIdUsuario = columns && columns.some(col => col.Field === 'id_usuario');
    const isOldStructure = hasIdUsuario;
    
    if (role === 'paciente') {
      if (!usuarioTokenId || !profissional_id) {
        return res.status(400).json({ erro: 'profissional_id é obrigatório para paciente.' });
      }
      
      if (isOldStructure) {
        // Estrutura antiga: id_usuario, id_profissional, data, horario
        // Nota: na estrutura antiga, id_profissional pode referenciar profissionais ou psicologos
        const sql = 'INSERT INTO agendamentos (id_usuario, id_profissional, data, horario, status) VALUES (?, ?, ?, ?, ?)';
        return db.query(sql, [usuarioTokenId, profissional_id, dataDate, horarioTime, 'Agendado'], (err, result) => {
          if (err) {
            console.error('Erro ao inserir agendamento (estrutura antiga):', err);
            return res.status(500).json({ erro: err.message });
          }
          res.status(201).json({ id: result.insertId, id_usuario: usuarioTokenId, id_profissional: profissional_id, data: dataDate, horario: horarioTime, status: 'Agendado' });
        });
      } else {
        // Estrutura nova: usuario_id, profissional_id, data_hora
        const sql = 'INSERT INTO agendamentos (usuario_id, profissional_id, data_hora, status) VALUES (?, ?, ?, ?)';
        return db.query(sql, [usuarioTokenId, profissional_id, dataHoraFinal, 'agendado'], (err, result) => {
          if (err) return res.status(500).json({ erro: err.message });
          res.status(201).json({ id: result.insertId, usuario_id: usuarioTokenId, profissional_id, data_hora: dataHoraFinal, status: 'agendado' });
        });
      }
    }

    if (role === 'psicologo') {
      const profissionalIdFinal = profissional_id || usuarioTokenId;
      console.log('Psicólogo agendando:', { profissionalIdFinal, paciente_id, usuarioTokenId, role });
      
      if (!profissionalIdFinal || !paciente_id) {
        return res.status(400).json({ erro: 'paciente_id é obrigatório para o psicólogo agendar.' });
      }

      // Verifica vínculo (atendimento) entre psicólogo e paciente
      const sqlCheck = 'SELECT id FROM atendimentos WHERE id_psicologo = ? AND id_paciente = ? AND status = "ativo" LIMIT 1';
      db.query(sqlCheck, [profissionalIdFinal, paciente_id], (err, rows) => {
        if (err) {
          console.error('Erro ao verificar vínculo:', err);
          return res.status(500).json({ erro: err.message });
        }
        console.log('Vínculo verificado:', { rows: rows?.length, profissionalIdFinal, paciente_id });
        if (!rows || rows.length === 0) {
          return res.status(403).json({ erro: 'Paciente não vinculado a este psicólogo ou atendimento inativo.' });
        }
        
        if (isOldStructure) {
          // Estrutura antiga: id_usuario, id_profissional, data, horario
          console.log('Inserindo agendamento (estrutura antiga):', { paciente_id, profissionalIdFinal, dataDate, horarioTime });
          const sql = 'INSERT INTO agendamentos (id_usuario, id_profissional, data, horario, status) VALUES (?, ?, ?, ?, ?)';
          db.query(sql, [paciente_id, profissionalIdFinal, dataDate, horarioTime, 'Agendado'], (err2, result) => {
            if (err2) {
              console.error('Erro ao inserir agendamento (estrutura antiga):', err2);
              return res.status(500).json({ erro: err2.message });
            }
            console.log('Agendamento criado com sucesso (estrutura antiga):', result.insertId);
            res.status(201).json({ id: result.insertId, id_usuario: paciente_id, id_profissional: profissionalIdFinal, data: dataDate, horario: horarioTime, status: 'Agendado' });
          });
        } else {
          // Estrutura nova
          console.log('Inserindo agendamento (estrutura nova):', { paciente_id, profissionalIdFinal, dataHoraFinal });
          const sql = 'INSERT INTO agendamentos (usuario_id, profissional_id, data_hora, status) VALUES (?, ?, ?, ?)';
          db.query(sql, [paciente_id, profissionalIdFinal, dataHoraFinal, 'agendado'], (err2, result) => {
            if (err2) {
              console.error('Erro ao inserir agendamento (estrutura nova):', err2);
              return res.status(500).json({ erro: err2.message });
            }
            console.log('Agendamento criado com sucesso (estrutura nova):', result.insertId);
            res.status(201).json({ id: result.insertId, usuario_id: paciente_id, profissional_id: profissionalIdFinal, data_hora: dataHoraFinal, status: 'agendado' });
          });
        }
      });
    }
  });

  return res.status(403).json({ erro: 'Role não autorizado a criar agendamentos.' });
};

// Cancelar agendamento
exports.cancelar = (req, res) => {
  const usuarioTokenId = req.usuario?.id;
  const role = req.usuario?.role;
  const agendamentoId = req.params.id;

  if (!agendamentoId) {
    return res.status(400).json({ erro: 'ID do agendamento é obrigatório.' });
  }

  // Verificar se o agendamento existe e se o usuário tem permissão para cancelá-lo
  let sqlCheck = `
    SELECT a.id,
           COALESCE(a.usuario_id, a.id_usuario) AS usuario_id,
           COALESCE(a.profissional_id, a.id_profissional) AS profissional_id,
           a.status
    FROM agendamentos a
    WHERE a.id = ?
  `;

  db.query(sqlCheck, [agendamentoId], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    const agendamento = results[0];
    
    // Verificar permissão: paciente pode cancelar seus próprios agendamentos
    // Psicólogo pode cancelar agendamentos onde ele é o profissional
    const podeCancelar = 
      (role === 'paciente' && Number(agendamento.usuario_id) === Number(usuarioTokenId)) ||
      (role === 'psicologo' && Number(agendamento.profissional_id) === Number(usuarioTokenId));

    if (!podeCancelar) {
      return res.status(403).json({ erro: 'Você não tem permissão para cancelar este agendamento.' });
    }

    // Verificar se já está cancelado
    if (agendamento.status === 'cancelado' || agendamento.status === 'Cancelado') {
      return res.status(400).json({ erro: 'Este agendamento já está cancelado.' });
    }

    // Atualizar status para cancelado
    const sqlUpdate = 'UPDATE agendamentos SET status = ? WHERE id = ?';
    db.query(sqlUpdate, ['cancelado', agendamentoId], (errUpdate, result) => {
      if (errUpdate) {
        return res.status(500).json({ erro: errUpdate.message });
      }
      res.json({ mensagem: 'Agendamento cancelado com sucesso.', id: agendamentoId });
    });
  });
};