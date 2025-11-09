const horarios = require('../models/horarioDisponivelModel');

exports.list = (req, res) => {
  const psicologoId = req.usuario.id;
  horarios.listByPsicologo(psicologoId, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
};

exports.create = (req, res) => {
  const psicologoId = req.usuario.id;
  const { dia_semana, hora_inicio, hora_fim, duracao_minutos, ativo } = req.body;
  
  console.log('Criar horário:', { psicologoId, dia_semana, hora_inicio, hora_fim, duracao_minutos, ativo });
  
  if (dia_semana === undefined || !hora_inicio || !hora_fim) {
    return res.status(400).json({ erro: 'dia_semana, hora_inicio e hora_fim são obrigatórios.' });
  }
  
  horarios.create({
    id_psicologo: psicologoId,
    dia_semana,
    hora_inicio,
    hora_fim,
    duracao_minutos,
    ativo
  }, (err, result) => {
    if (err) {
      console.error('Erro ao criar horário:', err);
      return res.status(500).json({ erro: err.message });
    }
    console.log('Horário criado com sucesso:', result.insertId);
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const psicologoId = req.usuario.id;
  
  // Verificar se o horário pertence ao psicólogo
  horarios.listByPsicologo(psicologoId, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    const horario = rows.find(h => h.id === parseInt(id));
    if (!horario) {
      return res.status(404).json({ erro: 'Horário não encontrado.' });
    }
    
    horarios.update(id, req.body, (err2) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.json({ ok: true });
    });
  });
};

exports.remove = (req, res) => {
  const { id } = req.params;
  const psicologoId = req.usuario?.id;
  
  console.log('=== CONTROLLER REMOVE ===');
  console.log('ID do parâmetro:', id);
  console.log('ID do psicólogo:', psicologoId);
  console.log('usuario completo:', req.usuario);
  
  if (!psicologoId) {
    console.error('Psicólogo não autenticado!');
    return res.status(401).json({ erro: 'Não autenticado.' });
  }
  
  if (!id) {
    console.error('ID não fornecido!');
    return res.status(400).json({ erro: 'ID é obrigatório.' });
  }
  
  // Verificar se o horário pertence ao psicólogo
  horarios.listByPsicologo(psicologoId, (err, rows) => {
    if (err) {
      console.error('Erro ao listar horários:', err);
      return res.status(500).json({ erro: err.message });
    }
    
    console.log('Horários encontrados:', rows.length);
    console.log('Buscando horário com ID:', parseInt(id));
    
    const horario = rows.find(h => h.id === parseInt(id));
    if (!horario) {
      console.log('Horário não encontrado. IDs disponíveis:', rows.map(r => r.id));
      return res.status(404).json({ erro: 'Horário não encontrado ou não pertence a este psicólogo.' });
    }
    
    console.log('Horário encontrado, removendo...');
    horarios.remove(id, (err2, result) => {
      if (err2) {
        console.error('Erro ao remover horário:', err2);
        return res.status(500).json({ erro: err2.message });
      }
      console.log('Horário removido com sucesso! Linhas afetadas:', result?.affectedRows);
      res.json({ ok: true, message: 'Horário removido com sucesso' });
    });
  });
};

// Lista horários disponíveis para paciente agendar
exports.getSlotsDisponiveis = (req, res) => {
  const { psicologoId, data } = req.query;
  
  if (!psicologoId || !data) {
    return res.status(400).json({ erro: 'psicologoId e data são obrigatórios.' });
  }
  
  horarios.gerarSlotsDisponiveis(psicologoId, data, (err, slots) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ slots });
  });
};

// Lista os dias da semana disponíveis para um psicólogo
exports.getDiasSemanaDisponiveis = (req, res) => {
  const { psicologoId } = req.query;
  
  if (!psicologoId) {
    return res.status(400).json({ erro: 'psicologoId é obrigatório.' });
  }
  
  horarios.getDiasSemanaDisponiveis(psicologoId, (err, diasSemana) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ diasSemana });
  });
};

// Lista horários disponíveis de um psicólogo (público para pacientes)
exports.listarHorariosPublico = (req, res) => {
  const { psicologoId } = req.query;
  
  if (!psicologoId) {
    return res.status(400).json({ erro: 'psicologoId é obrigatório.' });
  }
  
  horarios.listByPsicologo(psicologoId, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    // Filtrar apenas os ativos e formatar
    const horariosAtivos = rows
      .filter(h => h.ativo === 1 || h.ativo === true)
      .map(h => ({
        ...h,
        dia_semana_nome: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][h.dia_semana] || `Dia ${h.dia_semana}`
      }));
    res.json(horariosAtivos);
  });
};

