const db = require('../config/db');

exports.create = (horario, cb) => {
  const { id_psicologo, dia_semana, hora_inicio, hora_fim, duracao_minutos, ativo } = horario;
  const sql = `INSERT INTO horarios_disponiveis (id_psicologo, dia_semana, hora_inicio, hora_fim, duracao_minutos, ativo)
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [id_psicologo, dia_semana, hora_inicio, hora_fim, duracao_minutos || 60, ativo !== undefined ? ativo : 1], cb);
};

exports.listByPsicologo = (id_psicologo, cb) => {
  const sql = `SELECT * FROM horarios_disponiveis WHERE id_psicologo = ? ORDER BY dia_semana, hora_inicio`;
  db.query(sql, [id_psicologo], cb);
};

exports.update = (id, dados, cb) => {
  const allowed = ['dia_semana', 'hora_inicio', 'hora_fim', 'duracao_minutos', 'ativo'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (dados[key] !== undefined) {
      sets.push(`${key}=?`);
      params.push(dados[key]);
    }
  }
  if (sets.length === 0) return cb(null, { affectedRows: 0 });
  const sql = `UPDATE horarios_disponiveis SET ${sets.join(', ')} WHERE id=?`;
  params.push(id);
  db.query(sql, params, cb);
};

exports.remove = (id, cb) => {
  console.log('Model: Removendo horário ID:', id);
  const sql = 'DELETE FROM horarios_disponiveis WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Model: Erro ao remover horário:', err);
      return cb(err);
    }
    console.log('Model: Horário removido, linhas afetadas:', result.affectedRows);
    cb(null, result);
  });
};

// Busca horários disponíveis para um psicólogo em uma data específica
exports.getHorariosDisponiveisPorData = (id_psicologo, data, cb) => {
  const diaSemana = new Date(data).getDay();
  const sql = `SELECT * FROM horarios_disponiveis 
               WHERE id_psicologo = ? AND dia_semana = ? AND ativo = 1
               ORDER BY hora_inicio`;
  db.query(sql, [id_psicologo, diaSemana], cb);
};

// Gera slots de horários disponíveis para uma data específica
exports.gerarSlotsDisponiveis = (id_psicologo, data, cb) => {
  const diaSemana = new Date(data).getDay();
  const sql = `SELECT hora_inicio, hora_fim, duracao_minutos FROM horarios_disponiveis 
               WHERE id_psicologo = ? AND dia_semana = ? AND ativo = 1
               ORDER BY hora_inicio`;
  
  db.query(sql, [id_psicologo, diaSemana], (err, horarios) => {
    if (err) return cb(err);
    
    if (!horarios || horarios.length === 0) {
      return cb(null, []);
    }
    
    // Busca agendamentos já existentes para essa data (compatível com estrutura antiga e nova)
    const sqlAgendamentos = `SELECT 
                              COALESCE(data_hora, CONCAT(data, ' ', horario)) AS data_hora
                             FROM agendamentos 
                             WHERE (profissional_id = ? OR id_profissional = ?)
                             AND DATE(COALESCE(data_hora, CONCAT(data, ' ', horario))) = DATE(?)
                             AND COALESCE(status, '') != 'cancelado'`;
    
    db.query(sqlAgendamentos, [id_psicologo, id_psicologo, data], (err2, agendamentos) => {
      if (err2) return cb(err2);
      
      const horariosOcupados = agendamentos.map(a => {
        const dt = new Date(a.data_hora);
        return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      });
      
      const slots = [];
      horarios.forEach(h => {
        const inicio = h.hora_inicio.split(':');
        const fim = h.hora_fim.split(':');
        const inicioMinutos = parseInt(inicio[0]) * 60 + parseInt(inicio[1]);
        const fimMinutos = parseInt(fim[0]) * 60 + parseInt(fim[1]);
        const duracao = h.duracao_minutos || 60;
        
        for (let minutos = inicioMinutos; minutos + duracao <= fimMinutos; minutos += duracao) {
          const hh = Math.floor(minutos / 60);
          const mm = minutos % 60;
          const horaSlot = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
          
          if (!horariosOcupados.includes(horaSlot)) {
            slots.push(horaSlot);
          }
        }
      });
      
      cb(null, slots);
    });
  });
};

// Busca os dias da semana que o psicólogo tem horários configurados
exports.getDiasSemanaDisponiveis = (id_psicologo, cb) => {
  const sql = `SELECT DISTINCT dia_semana 
               FROM horarios_disponiveis 
               WHERE id_psicologo = ? AND ativo = 1
               ORDER BY dia_semana`;
  db.query(sql, [id_psicologo], (err, rows) => {
    if (err) return cb(err);
    const diasSemana = rows.map(r => r.dia_semana);
    cb(null, diasSemana);
  });
};

