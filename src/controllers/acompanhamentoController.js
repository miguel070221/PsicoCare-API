// src/controllers/acompanhamentoController.js
const Acompanhamento = require('../models/acompanhamentoModel');

exports.criarAcompanhamento = (req, res) => {
  const { texto, qualidade_sono, humor, data_hora } = req.body;
  const id_usuario = req.usuario?.id || req.body.id_usuario;
  if (!id_usuario) {
    return res.status(400).json({ error: 'Usuário não autenticado.' });
  }
  // Pelo menos um dos campos deve estar preenchido
  if (
    (texto === undefined || texto === '') &&
    (qualidade_sono === undefined || qualidade_sono === null) &&
    (humor === undefined || humor === '')
  ) {
    return res.status(400).json({ error: 'Inclua algum conteúdo (texto, sono ou humor).' });
  }
  const registro = {
    id_usuario,
    texto: texto ?? null,
    qualidade_sono: qualidade_sono ?? null,
    humor: humor ?? null,
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

// Psicólogo visualiza acompanhamentos de um paciente vinculado
exports.listarPorPacienteComAutorizacao = (req, res) => {
  const pacienteId = parseInt(req.params.id, 10);
  const psicologoId = req.usuario?.id;
  if (!pacienteId || !psicologoId) return res.status(400).json({ error: 'Parâmetros inválidos.' });
  const db = require('../config/db');
  const sql = 'SELECT 1 FROM atendimentos WHERE id_psicologo = ? AND id_paciente = ? LIMIT 1';
  db.query(sql, [psicologoId, pacienteId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao validar vínculo.' });
    if (!rows || rows.length === 0) return res.status(403).json({ error: 'Sem vínculo com este paciente.' });
    Acompanhamento.getByUsuario(pacienteId, (err2, rows2) => {
      if (err2) return res.status(500).json({ error: 'Erro ao buscar acompanhamentos.' });
      res.json(rows2);
    });
  });
};