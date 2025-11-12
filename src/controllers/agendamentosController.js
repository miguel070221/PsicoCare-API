// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');

/**
 * Função listar
 * Recupera todos os agendamentos do banco de dados do PsicoCare e retorna como resposta JSON.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
exports.listar = (req, res) => {
  // IMPORTANTE: Sempre usar o ID do token como fonte confiável, não confiar nos parâmetros da query
  const usuarioTokenId = req.usuario?.id;
  const role = req.usuario?.role;
  
  console.log('=== LISTAR AGENDAMENTOS ===');
  console.log('🔐 req.usuario (do token):', JSON.stringify(req.usuario, null, 2));
  console.log('🔐 usuarioTokenId (ID do token):', usuarioTokenId);
  console.log('🔐 Role (do token):', role);
  console.log('🔐 Token presente:', !!req.headers.authorization);
  
  // Validar que temos um usuário autenticado com ID e role
  if (!usuarioTokenId || !role) {
    console.error('❌ Token inválido: faltando ID ou role');
    return res.status(401).json({ erro: 'Token inválido ou incompleto.' });
  }
  
  // Primeiro, verificar qual estrutura a tabela realmente tem
  db.query('DESCRIBE agendamentos', (errDescribe, columns) => {
    if (errDescribe) {
      console.error('❌ Erro ao verificar estrutura da tabela:', errDescribe);
      return res.status(500).json({ erro: 'Erro ao verificar estrutura da tabela.' });
    }
    
    // Verificar quais campos existem
    const hasIdUsuario = columns.some(col => col.Field === 'id_usuario');
    const hasUsuarioId = columns.some(col => col.Field === 'usuario_id');
    const hasIdProfissional = columns.some(col => col.Field === 'id_profissional');
    const hasProfissionalId = columns.some(col => col.Field === 'profissional_id');
    const hasDataHora = columns.some(col => col.Field === 'data_hora');
    const hasData = columns.some(col => col.Field === 'data');
    const hasHorario = columns.some(col => col.Field === 'horario');
    
    console.log('🔍 Estrutura da tabela:');
    console.log('  - id_usuario:', hasIdUsuario);
    console.log('  - usuario_id:', hasUsuarioId);
    console.log('  - id_profissional:', hasIdProfissional);
    console.log('  - profissional_id:', hasProfissionalId);
    console.log('  - data_hora:', hasDataHora);
    console.log('  - data:', hasData);
    console.log('  - horario:', hasHorario);
    
    // Determinar campos a usar
    const campoUsuario = hasIdUsuario ? 'id_usuario' : (hasUsuarioId ? 'usuario_id' : null);
    const campoProfissional = hasIdProfissional ? 'id_profissional' : (hasProfissionalId ? 'profissional_id' : null);
    const campoDataHora = hasDataHora ? 'data_hora' : (hasData && hasHorario ? 'CONCAT(data, \' \', horario)' : null);
    
    if (!campoUsuario || !campoProfissional) {
      console.error('❌ Estrutura da tabela não suportada');
      return res.status(500).json({ erro: 'Estrutura da tabela agendamentos não suportada.' });
    }
    
    // Montar SQL baseado na estrutura real da tabela
    // A tabela agendamentos referencia pacientes e psicologos diretamente
    let sql = `
      SELECT 
        a.id,
        a.${campoUsuario} AS usuario_id,
        a.${campoProfissional} AS profissional_id,
        ${campoDataHora === 'data_hora' 
          ? 'a.data_hora AS data_hora' 
          : 'CONCAT(a.data, \' \', a.horario) AS data_hora'},
        a.status,
        ${hasDataHora 
          ? 'DATE_FORMAT(a.data_hora, \'%d-%m-%Y\') AS data'
          : 'DATE_FORMAT(a.data, \'%d-%m-%Y\') AS data'},
        ${hasDataHora 
          ? 'DATE_FORMAT(a.data_hora, \'%H:%i\') AS horario'
          : 'DATE_FORMAT(a.horario, \'%H:%i\') AS horario'},
        p.nome AS paciente_nome,
        ps.nome AS psicologo_nome
      FROM agendamentos a
      LEFT JOIN pacientes p ON p.id = a.${campoUsuario}
      LEFT JOIN psicologos ps ON ps.id = a.${campoProfissional}
    `;
    
    const where = [];
    const params = [];
      
    // Para admin: pode ver todos os agendamentos
    if (role === 'admin') {
      console.log('🔍 [ADMIN] Buscando todos os agendamentos');
      // Não adiciona filtro WHERE, mostra todos
    }
    // Para pacientes: SEMPRE usar o ID do token (não confiar em parâmetros da query)
    else if (role === 'paciente') {
      console.log('🔍 [PACIENTE] Buscando agendamentos para paciente ID:', usuarioTokenId);
      console.log('🔍 Usando campo:', campoUsuario);
      
      // Garantir que é um número
      const pacienteId = Number(usuarioTokenId);
      if (isNaN(pacienteId)) {
        console.error('❌ ID do paciente inválido:', usuarioTokenId);
        return res.status(400).json({ erro: 'ID do paciente inválido.' });
      }
      
      where.push(`a.${campoUsuario} = ?`);
      params.push(pacienteId);
      
      console.log('✅ Filtro aplicado: agendamentos onde', campoUsuario, '=', pacienteId);
    }
    // Para psicólogos: SEMPRE usar o ID do token (não confiar em parâmetros da query)
    else if (role === 'psicologo') {
      console.log('🔍 [PSICÓLOGO] Buscando agendamentos para psicólogo ID:', usuarioTokenId);
      console.log('🔍 Usando campo:', campoProfissional);
      
      // Garantir que é um número
      const psicologoId = Number(usuarioTokenId);
      if (isNaN(psicologoId)) {
        console.error('❌ ID do psicólogo inválido:', usuarioTokenId);
        return res.status(400).json({ erro: 'ID do psicólogo inválido.' });
      }
      
      where.push(`a.${campoProfissional} = ?`);
      params.push(psicologoId);
      
      console.log('✅ Filtro aplicado: agendamentos onde', campoProfissional, '=', psicologoId);
    }
    // Se não é paciente nem psicólogo nem admin, negar acesso
    else {
      console.error('❌ Role não autorizado:', role);
      return res.status(403).json({ erro: 'Role não autorizado a visualizar agendamentos.' });
    }
    
    // Adicionar WHERE clause
    if (where.length > 0) {
      sql += ' WHERE ' + where.join(' AND ');
    }
    
    // Ordenar
    if (campoDataHora === 'data_hora') {
      sql += ' ORDER BY a.data_hora DESC';
    } else {
      sql += ' ORDER BY CONCAT(a.data, \' \', a.horario) DESC';
    }
    
    console.log('📊 SQL Final:', sql);
    console.log('📊 Parâmetros:', params);
    
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('❌ Erro ao buscar agendamentos:', err);
        return res.status(500).json({ erro: err.message });
      }
      
      console.log(`✅ Retornando ${results?.length || 0} agendamentos`);
      
      // Processar resultados
      if (results && results.length > 0) {
        console.log('📋 Total de agendamentos encontrados:', results.length);
        console.log('📋 Primeiro agendamento:', JSON.stringify(results[0], null, 2));
        
        // Mapear resultados para formato consistente
        const agendamentosMapeados = results.map(ag => ({
          id: ag.id,
          usuario_id: ag.usuario_id,
          profissional_id: ag.profissional_id,
          data_hora: ag.data_hora,
          data: ag.data,
          horario: ag.horario,
          status: ag.status,
          paciente_nome: ag.paciente_nome || null,
          psicologo_nome: ag.psicologo_nome || null
        }));
        
        console.log('✅ Retornando', agendamentosMapeados.length, 'agendamentos para', role === 'paciente' ? 'paciente' : 'psicólogo', 'ID:', usuarioTokenId);
        return res.json(agendamentosMapeados);
      } else {
        console.log('⚠️ Nenhum agendamento encontrado para', role === 'paciente' ? 'paciente' : 'psicólogo', 'ID:', usuarioTokenId);
        return res.json([]);
      }
    });
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

  console.log('📤 Criando agendamento:', { role, usuarioTokenId, profissional_id, paciente_id, data_hora });
  
  // Verificar estrutura da tabela
  db.query('DESCRIBE agendamentos', (errDescribe, columns) => {
    if (errDescribe) {
      console.error('❌ Erro ao verificar estrutura da tabela:', errDescribe);
      return res.status(500).json({ erro: 'Erro ao verificar estrutura da tabela.' });
    }
    
    const hasIdUsuario = columns.some(col => col.Field === 'id_usuario');
    const hasIdProfissional = columns.some(col => col.Field === 'id_profissional');
    const hasDataHora = columns.some(col => col.Field === 'data_hora');
    const hasData = columns.some(col => col.Field === 'data');
    const hasHorario = columns.some(col => col.Field === 'horario');
    
    console.log('🔍 Estrutura da tabela (criar):', { hasIdUsuario, hasIdProfissional, hasDataHora, hasData, hasHorario });
    
    // Admin pode criar agendamentos para qualquer paciente e psicólogo
    if (role === 'admin') {
      if (!profissional_id || !paciente_id) {
        return res.status(400).json({ erro: 'profissional_id e paciente_id são obrigatórios para admin criar agendamento.' });
      }
      
      // Usar estrutura nova primeiro (mais comum)
      if (hasDataHora) {
        console.log('📤 Inserindo agendamento (admin):', { paciente_id, profissional_id, dataHoraFinal });
        const sql = 'INSERT INTO agendamentos (usuario_id, profissional_id, data_hora, status) VALUES (?, ?, ?, ?)';
        db.query(sql, [paciente_id, profissional_id, dataHoraFinal, 'agendado'], (err, result) => {
          if (err) {
            console.error('❌ Erro ao inserir agendamento:', err);
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ erro: 'Paciente ou profissional não encontrado.' });
            }
            return res.status(500).json({ erro: 'Erro ao criar agendamento: ' + err.message });
          }
          console.log('✅ Agendamento criado com sucesso (admin):', result.insertId);
          res.status(201).json({ id: result.insertId, usuario_id: paciente_id, profissional_id, data_hora: dataHoraFinal, status: 'agendado' });
        });
      } else if (hasIdUsuario && hasIdProfissional && hasData && hasHorario) {
        // Estrutura antiga
        console.log('📤 Inserindo agendamento (estrutura antiga - admin):', { paciente_id, profissional_id, dataDate, horarioTime });
        const sql = 'INSERT INTO agendamentos (id_usuario, id_profissional, data, horario, status) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [paciente_id, profissional_id, dataDate, horarioTime, 'Agendado'], (err, result) => {
          if (err) {
            console.error('❌ Erro ao inserir agendamento:', err);
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ erro: 'Paciente ou profissional não encontrado.' });
            }
            return res.status(500).json({ erro: 'Erro ao criar agendamento: ' + err.message });
          }
          console.log('✅ Agendamento criado com sucesso (estrutura antiga - admin):', result.insertId);
          res.status(201).json({ id: result.insertId, id_usuario: paciente_id, id_profissional: profissional_id, data: dataDate, horario: horarioTime, status: 'Agendado' });
        });
      } else {
        return res.status(500).json({ erro: 'Estrutura da tabela agendamentos não suportada.' });
      }
      return; // Sair da função após criar o agendamento
    }
    
    if (role === 'paciente') {
      if (!usuarioTokenId || !profissional_id) {
        return res.status(400).json({ erro: 'profissional_id é obrigatório para paciente.' });
      }
      
      // Usar estrutura nova primeiro (mais comum)
      if (hasDataHora) {
        // Estrutura nova: usuario_id, profissional_id, data_hora
        console.log('📤 Inserindo agendamento (paciente):', { usuarioTokenId, profissional_id, dataHoraFinal });
        const sql = 'INSERT INTO agendamentos (usuario_id, profissional_id, data_hora, status) VALUES (?, ?, ?, ?)';
        db.query(sql, [usuarioTokenId, profissional_id, dataHoraFinal, 'agendado'], (err, result) => {
          if (err) {
            console.error('❌ Erro ao inserir agendamento:', err);
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ erro: `Profissional não encontrado. Verifique se o psicólogo ID ${profissional_id} existe e está aprovado.` });
            }
            return res.status(500).json({ erro: 'Erro ao criar agendamento: ' + err.message });
          }
          console.log('✅ Agendamento criado com sucesso:', result.insertId);
          res.status(201).json({ id: result.insertId, usuario_id: usuarioTokenId, profissional_id, data_hora: dataHoraFinal, status: 'agendado' });
        });
      } else if (hasIdUsuario && hasIdProfissional && hasData && hasHorario) {
        // Estrutura antiga: id_usuario, id_profissional, data, horario
        console.log('📤 Inserindo agendamento (estrutura antiga - paciente):', { usuarioTokenId, profissional_id, dataDate, horarioTime });
        const sql = 'INSERT INTO agendamentos (id_usuario, id_profissional, data, horario, status) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [usuarioTokenId, profissional_id, dataDate, horarioTime, 'Agendado'], (err, result) => {
          if (err) {
            console.error('❌ Erro ao inserir agendamento:', err);
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ erro: `Profissional não encontrado. Verifique se o psicólogo ID ${profissional_id} existe.` });
            }
            return res.status(500).json({ erro: 'Erro ao criar agendamento: ' + err.message });
          }
          console.log('✅ Agendamento criado com sucesso (estrutura antiga):', result.insertId);
          res.status(201).json({ id: result.insertId, id_usuario: usuarioTokenId, id_profissional: profissional_id, data: dataDate, horario: horarioTime, status: 'Agendado' });
        });
      } else {
        return res.status(500).json({ erro: 'Estrutura da tabela agendamentos não suportada. A tabela deve ter usuario_id/profissional_id/data_hora ou id_usuario/id_profissional/data/horario.' });
      }
    } else if (role === 'psicologo') {
      const profissionalIdFinal = profissional_id || usuarioTokenId;
      console.log('📤 Psicólogo agendando:', { profissionalIdFinal, paciente_id, usuarioTokenId, role });
      
      if (!profissionalIdFinal || !paciente_id) {
        return res.status(400).json({ erro: 'paciente_id é obrigatório para o psicólogo agendar.' });
      }

      // Verifica vínculo (atendimento) entre psicólogo e paciente
      console.log('🔍 [BACKEND] Verificando vínculo entre psicólogo e paciente:');
      console.log('🔍 [BACKEND] profissionalIdFinal:', profissionalIdFinal);
      console.log('🔍 [BACKEND] paciente_id:', paciente_id);
      console.log('🔍 [BACKEND] Tipo profissionalIdFinal:', typeof profissionalIdFinal);
      console.log('🔍 [BACKEND] Tipo paciente_id:', typeof paciente_id);
      
      // Primeiro, verificar TODOS os atendimentos para este psicólogo
      const sqlDebug = 'SELECT id, id_paciente, id_psicologo, status FROM atendimentos WHERE id_psicologo = ?';
      db.query(sqlDebug, [profissionalIdFinal], (errDebug, rowsDebug) => {
        if (!errDebug) {
          console.log('🔍 [BACKEND] Todos os atendimentos para psicólogo', profissionalIdFinal, ':', rowsDebug?.length || 0);
          if (rowsDebug && rowsDebug.length > 0) {
            rowsDebug.forEach((a, idx) => {
              console.log(`  ${idx + 1}. ID: ${a.id}, Paciente: ${a.id_paciente}, Status: ${a.status}`);
            });
          }
        }
      });
      
      const sqlCheck = 'SELECT id, status FROM atendimentos WHERE id_psicologo = ? AND id_paciente = ? AND (status = "ativo" OR status IS NULL) LIMIT 1';
      console.log('🔍 [BACKEND] SQL Check:', sqlCheck);
      console.log('🔍 [BACKEND] Parâmetros:', [profissionalIdFinal, paciente_id]);
      
      db.query(sqlCheck, [profissionalIdFinal, paciente_id], (err, rows) => {
        if (err) {
          console.error('❌ [BACKEND] Erro ao verificar vínculo:', err);
          return res.status(500).json({ erro: err.message });
        }
        console.log('🔍 [BACKEND] Vínculo verificado:', { rows: rows?.length || 0, profissionalIdFinal, paciente_id });
        
        if (!rows || rows.length === 0) {
          // Verificar se existe atendimento mas com status diferente
          const sqlCheckInativo = 'SELECT id, status FROM atendimentos WHERE id_psicologo = ? AND id_paciente = ? LIMIT 1';
          db.query(sqlCheckInativo, [profissionalIdFinal, paciente_id], (err2, rows2) => {
            if (!err2 && rows2 && rows2.length > 0) {
              console.error('❌ [BACKEND] Atendimento encontrado mas com status inativo:', rows2[0].status);
              return res.status(403).json({ 
                erro: `Paciente não vinculado ativamente. O atendimento existe mas está com status "${rows2[0].status}". O atendimento precisa estar ativo.` 
              });
            } else {
              console.error('❌ [BACKEND] Nenhum atendimento encontrado entre psicólogo', profissionalIdFinal, 'e paciente', paciente_id);
              return res.status(403).json({ 
                erro: `Paciente não vinculado a este psicólogo. É necessário criar um atendimento ativo primeiro.` 
              });
            }
          });
          return;
        }
        
        console.log('✅ [BACKEND] Vínculo encontrado:', rows[0]);
        
        // Verificar se o paciente existe na tabela pacientes
        console.log('🔍 [BACKEND] Verificando se paciente existe na tabela pacientes...');
        const sqlCheckPaciente = 'SELECT id FROM pacientes WHERE id = ? LIMIT 1';
        db.query(sqlCheckPaciente, [paciente_id], (errPaciente, rowsPaciente) => {
          if (errPaciente) {
            console.error('❌ [BACKEND] Erro ao verificar paciente:', errPaciente);
            return res.status(500).json({ erro: 'Erro ao verificar paciente.' });
          }
          
          const pacienteExiste = rowsPaciente && rowsPaciente.length > 0;
          console.log('🔍 [BACKEND] Paciente existe na tabela pacientes:', pacienteExiste);
          
          if (!pacienteExiste) {
            console.error('❌ [BACKEND] Paciente não encontrado na tabela pacientes:', paciente_id);
            return res.status(404).json({ erro: `Paciente com ID ${paciente_id} não encontrado na tabela de pacientes.` });
          }
          
          // Verificar qual campo usar: id_usuario (referencia usuarios) ou se pode usar paciente_id diretamente
          // Se a estrutura usa id_usuario mas referencia pacientes, pode haver um problema de schema
          // Vamos verificar a estrutura real da foreign key
          console.log('🔍 [BACKEND] Verificando estrutura da foreign key...');
          db.query('SHOW CREATE TABLE agendamentos', (errFK, rowsFK) => {
            if (errFK) {
              console.error('⚠️ [BACKEND] Erro ao verificar foreign key:', errFK);
              // Continuar mesmo se não conseguir verificar
            } else if (rowsFK && rowsFK.length > 0) {
              const createTable = rowsFK[0]['Create Table'];
              console.log('🔍 [BACKEND] Estrutura da tabela agendamentos:');
              console.log(createTable);
              
              // Verificar se id_usuario referencia pacientes ou usuarios
              if (createTable.includes('FOREIGN KEY (`id_usuario`) REFERENCES `pacientes`')) {
                console.log('✅ [BACKEND] id_usuario referencia pacientes - OK');
              } else if (createTable.includes('FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`')) {
                console.log('⚠️ [BACKEND] id_usuario referencia usuarios - pode ser problema');
                // Verificar se o paciente existe na tabela usuarios também
                db.query('SELECT id FROM usuarios WHERE id = ? LIMIT 1', [paciente_id], (errUsuario, rowsUsuario) => {
                  if (!errUsuario && (!rowsUsuario || rowsUsuario.length === 0)) {
                    console.error('❌ [BACKEND] Paciente não existe na tabela usuarios. id_usuario referencia usuarios, mas paciente está em pacientes.');
                    return res.status(400).json({ 
                      erro: 'Erro de schema: A tabela agendamentos usa id_usuario que referencia usuarios, mas o paciente está na tabela pacientes. É necessário corrigir o schema do banco de dados.' 
                    });
                  }
                  // Se existe em usuarios, continuar
                  inserirAgendamento();
                });
                return;
              }
            }
            
            // Inserir agendamento
            inserirAgendamento();
          });
          
          function inserirAgendamento() {
            // Inserir agendamento - usar estrutura nova (usuario_id, profissional_id, data_hora)
            console.log('📤 [BACKEND] Inserindo agendamento (psicólogo):', { paciente_id, profissionalIdFinal, dataHoraFinal });
            
            if (hasDataHora) {
              // Estrutura nova: usuario_id, profissional_id, data_hora
              const sql = 'INSERT INTO agendamentos (usuario_id, profissional_id, data_hora, status) VALUES (?, ?, ?, ?)';
              db.query(sql, [paciente_id, profissionalIdFinal, dataHoraFinal, 'agendado'], (err2, result) => {
                if (err2) {
                  console.error('❌ [BACKEND] Erro ao inserir agendamento:', err2);
                  console.error('❌ [BACKEND] Erro code:', err2.code);
                  console.error('❌ [BACKEND] Erro sqlMessage:', err2.sqlMessage);
                  if (err2.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({ 
                      erro: `Erro ao criar agendamento: Paciente ou psicólogo não encontrado. Verifique se os IDs estão corretos (paciente: ${paciente_id}, psicólogo: ${profissionalIdFinal}).` 
                    });
                  }
                  return res.status(500).json({ erro: err2.message || 'Erro ao criar agendamento.' });
                }
                console.log('✅ [BACKEND] Agendamento criado com sucesso:', result.insertId);
                res.status(201).json({ 
                  id: result.insertId, 
                  usuario_id: paciente_id, 
                  profissional_id: profissionalIdFinal, 
                  data_hora: dataHoraFinal, 
                  status: 'agendado' 
                });
              });
            } else if (hasIdUsuario && hasIdProfissional && hasData && hasHorario) {
              // Estrutura antiga: id_usuario, id_profissional, data, horario
              const sql = 'INSERT INTO agendamentos (id_usuario, id_profissional, data, horario, status) VALUES (?, ?, ?, ?, ?)';
              db.query(sql, [paciente_id, profissionalIdFinal, dataDate, horarioTime, 'Agendado'], (err2, result) => {
                if (err2) {
                  console.error('❌ [BACKEND] Erro ao inserir agendamento:', err2);
                  if (err2.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({ 
                      erro: `Erro ao criar agendamento: Paciente ou psicólogo não encontrado. Verifique se os IDs estão corretos.` 
                    });
                  }
                  return res.status(500).json({ erro: err2.message || 'Erro ao criar agendamento.' });
                }
                console.log('✅ [BACKEND] Agendamento criado com sucesso (estrutura antiga):', result.insertId);
                res.status(201).json({ 
                  id: result.insertId, 
                  id_usuario: paciente_id, 
                  id_profissional: profissionalIdFinal, 
                  data: dataDate, 
                  horario: horarioTime, 
                  status: 'Agendado' 
                });
              });
            } else {
              return res.status(500).json({ erro: 'Estrutura da tabela agendamentos não suportada. Verifique se a tabela tem os campos necessários.' });
            }
          }
        });
      });
    } else {
      // Role não autorizado ou não reconhecido
      console.error('❌ Role não autorizado:', role);
      return res.status(403).json({ erro: 'Role não autorizado a criar agendamentos.' });
    }
  });
};

// Atualizar agendamento
exports.atualizar = (req, res) => {
  const usuarioTokenId = req.usuario?.id;
  const role = req.usuario?.role;
  const agendamentoId = req.params.id;
  const { data_hora } = req.body;

  if (!agendamentoId) {
    return res.status(400).json({ erro: 'ID do agendamento é obrigatório.' });
  }

  if (!data_hora) {
    return res.status(400).json({ erro: 'data_hora é obrigatório.' });
  }

  // Verificar estrutura da tabela primeiro
  db.query('DESCRIBE agendamentos', (errDescribe, columns) => {
    if (errDescribe) {
      console.error('❌ Erro ao verificar estrutura da tabela:', errDescribe);
      return res.status(500).json({ erro: 'Erro ao verificar estrutura da tabela.' });
    }
    
    const hasIdUsuario = columns.some(col => col.Field === 'id_usuario');
    const campoUsuario = hasIdUsuario ? 'id_usuario' : 'usuario_id';
    const campoProfissional = columns.some(col => col.Field === 'id_profissional') ? 'id_profissional' : 'profissional_id';

  // Verificar se o agendamento existe e se o usuário tem permissão para editá-lo
    const sqlCheck = `SELECT a.id, a.${campoUsuario} AS usuario_id, a.${campoProfissional} AS profissional_id, a.status FROM agendamentos a WHERE a.id = ?`;

  db.query(sqlCheck, [agendamentoId], (err, results) => {
    if (err) {
        console.error('❌ Erro ao verificar agendamento:', err);
      return res.status(500).json({ erro: err.message });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    const agendamento = results[0];
    
    // Verificar permissão: admin pode editar qualquer agendamento
    // Paciente pode editar seus próprios agendamentos
    // Psicólogo pode editar agendamentos onde ele é o profissional
    const podeEditar = 
      role === 'admin' ||
      (role === 'paciente' && Number(agendamento.usuario_id) === Number(usuarioTokenId)) ||
      (role === 'psicologo' && Number(agendamento.profissional_id) === Number(usuarioTokenId));

    if (!podeEditar) {
        console.error('❌ Sem permissão para editar. Role:', role, 'usuarioTokenId:', usuarioTokenId, 'agendamento.usuario_id:', agendamento.usuario_id, 'agendamento.profissional_id:', agendamento.profissional_id);
      return res.status(403).json({ erro: 'Você não tem permissão para editar este agendamento.' });
    }

    // Verificar se está cancelado
    if (agendamento.status === 'cancelado' || agendamento.status === 'Cancelado') {
      return res.status(400).json({ erro: 'Não é possível editar um agendamento cancelado.' });
    }

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

      const hasDataHora = columns.some(col => col.Field === 'data_hora');
      const hasData = columns.some(col => col.Field === 'data');
      const hasHorario = columns.some(col => col.Field === 'horario');
      
      if (hasIdUsuario && hasData && hasHorario) {
        // Estrutura antiga: atualizar data e horario
        console.log('🔄 Atualizando agendamento (estrutura antiga):', { agendamentoId, dataDate, horarioTime });
        const sql = 'UPDATE agendamentos SET data = ?, horario = ? WHERE id = ?';
        db.query(sql, [dataDate, horarioTime, agendamentoId], (errUpdate, result) => {
          if (errUpdate) {
            console.error('❌ Erro ao atualizar agendamento:', errUpdate);
            return res.status(500).json({ erro: errUpdate.message });
          }
          console.log('✅ Agendamento atualizado com sucesso');
          res.json({ mensagem: 'Agendamento atualizado com sucesso.', id: agendamentoId, data: dataDate, horario: horarioTime });
        });
      } else if (hasDataHora) {
        // Estrutura nova: atualizar data_hora
        console.log('🔄 Atualizando agendamento (estrutura nova):', { agendamentoId, dataHoraFinal });
        const sql = 'UPDATE agendamentos SET data_hora = ? WHERE id = ?';
        db.query(sql, [dataHoraFinal, agendamentoId], (errUpdate, result) => {
          if (errUpdate) {
            console.error('❌ Erro ao atualizar agendamento:', errUpdate);
            return res.status(500).json({ erro: errUpdate.message });
          }
          console.log('✅ Agendamento atualizado com sucesso');
          res.json({ mensagem: 'Agendamento atualizado com sucesso.', id: agendamentoId, data_hora: dataHoraFinal });
        });
      } else {
        return res.status(500).json({ erro: 'Estrutura da tabela não suportada para atualização.' });
      }
    });
  });
};

// Deletar agendamento
exports.deletar = (req, res) => {
  const usuarioTokenId = req.usuario?.id;
  const role = req.usuario?.role;
  const agendamentoId = req.params.id;

  console.log('🗑️ [AGENDAMENTO] Deletar agendamento:', { agendamentoId, usuarioTokenId, role });

  if (!agendamentoId) {
    return res.status(400).json({ erro: 'ID do agendamento é obrigatório.' });
  }

  if (!usuarioTokenId || !role) {
    return res.status(401).json({ erro: 'Token inválido ou incompleto.' });
  }

  // Verificar estrutura da tabela
  db.query('DESCRIBE agendamentos', (errDescribe, columns) => {
    if (errDescribe) {
      console.error('❌ [AGENDAMENTO] Erro ao verificar estrutura:', errDescribe);
      return res.status(500).json({ erro: 'Erro ao verificar estrutura da tabela.' });
    }
    
    const hasIdUsuario = columns.some(col => col.Field === 'id_usuario');
    const campoUsuario = hasIdUsuario ? 'id_usuario' : 'usuario_id';
    const campoProfissional = columns.some(col => col.Field === 'id_profissional') ? 'id_profissional' : 'profissional_id';
    
    // Verificar se o agendamento existe e se o usuário tem permissão
    const sqlCheck = `SELECT a.id, a.${campoUsuario} AS usuario_id, a.${campoProfissional} AS profissional_id FROM agendamentos a WHERE a.id = ?`;

    db.query(sqlCheck, [agendamentoId], (err, results) => {
      if (err) {
        console.error('❌ [AGENDAMENTO] Erro ao verificar agendamento:', err);
        return res.status(500).json({ erro: err.message });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ erro: 'Agendamento não encontrado.' });
      }

      const agendamento = results[0];
      
      // Verificar permissão: admin pode deletar qualquer agendamento
      const podeDeletar = 
        role === 'admin' ||
        (role === 'paciente' && Number(agendamento.usuario_id) === Number(usuarioTokenId)) ||
        (role === 'psicologo' && Number(agendamento.profissional_id) === Number(usuarioTokenId));

      if (!podeDeletar) {
        console.error('❌ [AGENDAMENTO] Sem permissão para deletar');
        return res.status(403).json({ erro: 'Você não tem permissão para deletar este agendamento.' });
      }

      // Função para deletar o agendamento
      const deletarAgendamento = () => {
        const sqlDelete = 'DELETE FROM agendamentos WHERE id = ?';
        db.query(sqlDelete, [agendamentoId], (errDelete, result) => {
          if (errDelete) {
            // Se erro de foreign key, tentar deletar avaliações primeiro
            if (errDelete.code === 'ER_ROW_IS_REFERENCED_2' || errDelete.errno === 1451) {
              console.log('🔧 [AGENDAMENTO] Erro de foreign key. Deletando avaliações primeiro...');
              db.query('DELETE FROM avaliacoes WHERE id_agendamento = ?', [agendamentoId], (errAval) => {
                if (errAval) {
                  console.error('❌ [AGENDAMENTO] Erro ao deletar avaliações:', errAval);
                  return res.status(500).json({ 
                    erro: 'Não é possível deletar o agendamento pois existem avaliações vinculadas.' 
                  });
                }
                // Tentar deletar novamente
                deletarAgendamento();
              });
              return;
            }
            console.error('❌ [AGENDAMENTO] Erro ao deletar:', errDelete);
            return res.status(500).json({ erro: errDelete.message || 'Erro ao deletar agendamento.' });
          }
          
          console.log('✅ [AGENDAMENTO] Agendamento deletado com sucesso');
          res.json({ mensagem: 'Agendamento deletado com sucesso.', id: agendamentoId });
        });
      };
      
      // Verificar se existe tabela de avaliações e deletar registros vinculados primeiro
      db.query('SHOW TABLES LIKE "avaliacoes"', (errTables, tables) => {
        if (errTables || !tables || tables.length === 0) {
          // Não há tabela de avaliações, deletar diretamente
          deletarAgendamento();
          return;
        }
        
        // Deletar avaliações vinculadas primeiro
        db.query('DELETE FROM avaliacoes WHERE id_agendamento = ?', [agendamentoId], (errAvaliacoes, resultAvaliacoes) => {
          if (errAvaliacoes) {
            console.warn('⚠️ [AGENDAMENTO] Erro ao deletar avaliações (pode não existir):', errAvaliacoes.message);
          } else {
            console.log('✅ [AGENDAMENTO] Avaliações deletadas:', resultAvaliacoes?.affectedRows || 0);
          }
          // Deletar o agendamento
          deletarAgendamento();
        });
      });
    });
  });
};

// Cancelar agendamento (usa a mesma lógica de deletar)
exports.cancelar = (req, res) => {
  // Cancelar é o mesmo que deletar permanentemente
  exports.deletar(req, res);
};

/**
 * Listar agendamentos de um paciente específico (apenas para psicólogos)
 * Verifica se há vínculo entre o psicólogo e o paciente antes de retornar
 */
exports.listarPorPaciente = (req, res) => {
  const usuarioTokenId = req.usuario?.id;
  const role = req.usuario?.role;
  const pacienteId = req.params.pacienteId;

  console.log('=== LISTAR AGENDAMENTOS POR PACIENTE ===');
  console.log('🔐 req.usuario (do token):', JSON.stringify(req.usuario, null, 2));
  console.log('🔐 usuarioTokenId (ID do token):', usuarioTokenId);
  console.log('🔐 Role (do token):', role);
  console.log('🔐 Paciente ID (parâmetro):', pacienteId);

  // Validar que temos um usuário autenticado com ID e role
  if (!usuarioTokenId || !role) {
    console.error('❌ Token inválido: faltando ID ou role');
    return res.status(401).json({ erro: 'Token inválido ou incompleto.' });
  }

  // Apenas psicólogos podem acessar esta rota
  if (role !== 'psicologo') {
    console.error('❌ Role não autorizado:', role);
    return res.status(403).json({ erro: 'Apenas psicólogos podem visualizar agendamentos de pacientes específicos.' });
  }

  // Validar pacienteId
  const pacienteIdNum = Number(pacienteId);
  if (!pacienteId || isNaN(pacienteIdNum)) {
    return res.status(400).json({ erro: 'ID do paciente inválido.' });
  }

  const psicologoId = Number(usuarioTokenId);
  if (isNaN(psicologoId)) {
    return res.status(400).json({ erro: 'ID do psicólogo inválido.' });
  }

  // Verificar se há vínculo (atendimento) entre psicólogo e paciente
  const sqlCheckVinculo = 'SELECT id, status FROM atendimentos WHERE id_psicologo = ? AND id_paciente = ? AND (status = "ativo" OR status IS NULL) LIMIT 1';
  
  db.query(sqlCheckVinculo, [psicologoId, pacienteIdNum], (errVinculo, rowsVinculo) => {
    if (errVinculo) {
      console.error('❌ Erro ao verificar vínculo:', errVinculo);
      return res.status(500).json({ erro: 'Erro ao verificar vínculo com o paciente.' });
    }

    if (!rowsVinculo || rowsVinculo.length === 0) {
      console.error('❌ Nenhum vínculo encontrado entre psicólogo', psicologoId, 'e paciente', pacienteIdNum);
      return res.status(403).json({ erro: 'Você não tem vínculo ativo com este paciente. Não é possível visualizar os agendamentos.' });
    }

    console.log('✅ Vínculo encontrado:', rowsVinculo[0]);

    // Verificar estrutura da tabela
    db.query('DESCRIBE agendamentos', (errDescribe, columns) => {
      if (errDescribe) {
        console.error('❌ Erro ao verificar estrutura da tabela:', errDescribe);
        return res.status(500).json({ erro: 'Erro ao verificar estrutura da tabela.' });
      }

      const hasIdUsuario = columns.some(col => col.Field === 'id_usuario');
      const hasUsuarioId = columns.some(col => col.Field === 'usuario_id');
      const hasIdProfissional = columns.some(col => col.Field === 'id_profissional');
      const hasProfissionalId = columns.some(col => col.Field === 'profissional_id');
      const hasDataHora = columns.some(col => col.Field === 'data_hora');
      const hasData = columns.some(col => col.Field === 'data');
      const hasHorario = columns.some(col => col.Field === 'horario');

      const campoUsuario = hasIdUsuario ? 'id_usuario' : (hasUsuarioId ? 'usuario_id' : null);
      const campoProfissional = hasIdProfissional ? 'id_profissional' : (hasProfissionalId ? 'profissional_id' : null);
      const campoDataHora = hasDataHora ? 'data_hora' : (hasData && hasHorario ? 'CONCAT(data, \' \', horario)' : null);

      if (!campoUsuario || !campoProfissional) {
        console.error('❌ Estrutura da tabela não suportada');
        return res.status(500).json({ erro: 'Estrutura da tabela agendamentos não suportada.' });
      }

      // Montar SQL para buscar agendamentos do paciente específico com este psicólogo
      let sql = `
        SELECT 
          a.id,
          a.${campoUsuario} AS usuario_id,
          a.${campoProfissional} AS profissional_id,
          ${campoDataHora === 'data_hora' 
            ? 'a.data_hora AS data_hora' 
            : 'CONCAT(a.data, \' \', a.horario) AS data_hora'},
          a.status,
          ${hasDataHora 
            ? 'DATE_FORMAT(a.data_hora, \'%d-%m-%Y\') AS data'
            : 'DATE_FORMAT(a.data, \'%d-%m-%Y\') AS data'},
          ${hasDataHora 
            ? 'DATE_FORMAT(a.data_hora, \'%H:%i\') AS horario'
            : 'DATE_FORMAT(a.horario, \'%H:%i\') AS horario'},
          p.nome AS paciente_nome,
          ps.nome AS psicologo_nome
        FROM agendamentos a
        LEFT JOIN pacientes p ON p.id = a.${campoUsuario}
        LEFT JOIN psicologos ps ON ps.id = a.${campoProfissional}
        WHERE a.${campoUsuario} = ? AND a.${campoProfissional} = ?
      `;

      // Ordenar
      if (campoDataHora === 'data_hora') {
        sql += ' ORDER BY a.data_hora DESC';
      } else {
        sql += ' ORDER BY CONCAT(a.data, \' \', a.horario) DESC';
      }

      console.log('📊 SQL Final:', sql);
      console.log('📊 Parâmetros:', [pacienteIdNum, psicologoId]);

      db.query(sql, [pacienteIdNum, psicologoId], (err, results) => {
        if (err) {
          console.error('❌ Erro ao buscar agendamentos:', err);
          return res.status(500).json({ erro: err.message });
        }

        console.log(`✅ Retornando ${results?.length || 0} agendamentos do paciente ${pacienteIdNum} com psicólogo ${psicologoId}`);

        // Processar resultados
        const agendamentosMapeados = (results || []).map(ag => ({
          id: ag.id,
          usuario_id: ag.usuario_id,
          profissional_id: ag.profissional_id,
          data_hora: ag.data_hora,
          data: ag.data,
          horario: ag.horario,
          status: ag.status,
          paciente_nome: ag.paciente_nome || null,
          psicologo_nome: ag.psicologo_nome || null
        }));

        return res.json(agendamentosMapeados);
      });
    });
  });
};