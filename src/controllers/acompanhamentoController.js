// src/controllers/acompanhamentoController.js
const Acompanhamento = require('../models/acompanhamentoModel');

exports.criarAcompanhamento = (req, res) => {
  const { texto, qualidade_sono, humor, data_hora } = req.body;
  const id_usuario = req.usuario?.id || req.body.id_usuario;
  if (!id_usuario || !texto || !qualidade_sono || !humor) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }
  const registro = {
    id_usuario,
    texto,
    qualidade_sono,
    humor,
    data_hora: data_hora || new Date(),
  };
  Acompanhamento.create(registro, (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao salvar acompanhamento.' });
    res.status(201).json({ success: true, id: result.insertId });
  });
};

exports.listarAcompanhamentos = (req, res) => {
  const id_usuario = req.usuario?.id || req.params.id_usuario;
  if (!id_usuario) return res.status(400).json({ error: 'Usuário não informado.' });
  Acompanhamento.getByUsuario(id_usuario, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar acompanhamentos.' });
    res.json(rows);
  });
};
