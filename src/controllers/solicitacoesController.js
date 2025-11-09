const solicitacoes = require('../models/solicitacaoModel');

exports.criar = (req, res) => {
  const { id_psicologo } = req.body;
  const id_paciente = req.usuario.id;
  if (!id_psicologo) return res.status(400).json({ erro: 'id_psicologo é obrigatório.' });
  solicitacoes.create(id_paciente, id_psicologo, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Solicitação já existente.' });
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({ id: result.insertId, status: 'pendente' });
  });
};

exports.minhas = (req, res) => {
  solicitacoes.listByPaciente(req.usuario.id, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
};


















