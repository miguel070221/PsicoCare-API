const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pacientes = require('../models/pacienteModel');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, idade, genero, preferencia_comunicacao, contato_preferido } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    const hash = await bcrypt.hash(senha, 10);
    pacientes.create({ nome, email, senha: hash, idade, genero, preferencia_comunicacao, contato_preferido }, (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.status(201).json({ id: result.insertId, nome, email });
    });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.login = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  pacientes.findByEmail(email, async (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!rows.length) return res.status(401).json({ erro: 'Usuário não encontrado.' });
    const user = rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ erro: 'Senha incorreta.' });
    const token = jwt.sign({ id: user.id, role: 'paciente', nome: user.nome, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, role: 'paciente', nome: user.nome, email: user.email });
  });
};

exports.me = (req, res) => {
  pacientes.findById(req.usuario.id, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!rows.length) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(rows[0]);
  });
};

exports.update = (req, res) => {
  pacientes.update(req.usuario.id, req.body, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};

exports.list = (req, res) => {
  pacientes.list((err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
};

exports.remove = (req, res) => {
  pacientes.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};


















