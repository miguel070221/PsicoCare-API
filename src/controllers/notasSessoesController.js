const notas = require('../models/notaSessaoModel');

exports.list = (req, res) => {
  const id_psicologo = req.usuario.id;
  const { id_paciente } = req.query;
  
  if (id_paciente) {
    notas.listByPaciente(id_psicologo, id_paciente, (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows);
    });
  } else {
    notas.listByPsicologo(id_psicologo, (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows);
    });
  }
};

exports.create = (req, res) => {
  const id_psicologo = req.usuario.id;
  const { id_paciente, titulo, conteudo, data_sessao, id_agendamento } = req.body;
  
  if (!id_paciente || !titulo || !conteudo) {
    return res.status(400).json({ erro: 'id_paciente, titulo e conteudo são obrigatórios.' });
  }
  
  notas.create({
    id_psicologo,
    id_paciente,
    titulo,
    conteudo,
    data_sessao,
    id_agendamento
  }, (err, result) => {
    if (err) {
      console.error('Erro ao criar nota:', err);
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const id_psicologo = req.usuario.id;
  const { titulo, conteudo, data_sessao } = req.body;
  
  if (!titulo || !conteudo) {
    return res.status(400).json({ erro: 'titulo e conteudo são obrigatórios.' });
  }
  
  // Verificar se a nota existe e pertence ao psicólogo
  notas.getById(id, id_psicologo, (err, nota) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!nota) {
      return res.status(404).json({ erro: 'Nota não encontrada.' });
    }
    
    notas.update(id, { titulo, conteudo, data_sessao }, id_psicologo, (err2, result) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.json({ ok: true });
    });
  });
};

exports.remove = (req, res) => {
  const { id } = req.params;
  const id_psicologo = req.usuario.id;
  
  // Verificar se a nota existe e pertence ao psicólogo
  notas.getById(id, id_psicologo, (err, nota) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!nota) {
      return res.status(404).json({ erro: 'Nota não encontrada.' });
    }
    
    notas.remove(id, id_psicologo, (err2, result) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.json({ ok: true, message: 'Nota removida com sucesso' });
    });
  });
};




