const atendimentos = require('../models/atendimentoModel');

exports.meusComoPsicologo = (req, res) => {
  atendimentos.listByPsicologo(req.usuario.id, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
};

exports.meusComoPaciente = (req, res) => {
  atendimentos.listByPaciente(req.usuario.id, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
};

exports.definirLink = (req, res) => {
  const { id, link_consulta } = req.body;
  if (!id || !link_consulta) return res.status(400).json({ erro: 'id e link_consulta são obrigatórios.' });
  atendimentos.updateLink(id, link_consulta, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};













