const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../models/adminModel');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    const hash = await bcrypt.hash(senha, 10);
    admin.create({ nome, email, senha: hash }, (err, result) => {
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
  admin.findByEmail(email, async (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!rows.length) return res.status(401).json({ erro: 'Usuário não encontrado.' });
    const user = rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ erro: 'Senha incorreta.' });
    const token = jwt.sign({ id: user.id, role: 'admin', nome: user.nome, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, role: 'admin', nome: user.nome, email: user.email });
  });
};

exports.listUsers = (req, res) => {
  db.query('SELECT id, nome, email, idade, genero FROM pacientes', (e1, pacientes) => {
    if (e1) return res.status(500).json({ erro: e1.message });
    db.query('SELECT id, nome, email, crp, disponivel, perfil_completo, aprovado FROM psicologos', (e2, psicologos) => {
      if (e2) return res.status(500).json({ erro: e2.message });
      res.json({ pacientes, psicologos });
    });
  });
};

exports.setPsicologoAprovado = (req, res) => {
  const { id, aprovado } = req.body;
  if (typeof id === 'undefined') return res.status(400).json({ erro: 'ID obrigatório.' });
  db.query('UPDATE psicologos SET aprovado=? WHERE id=?', [aprovado ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};

exports.removePsicologo = (req, res) => {
  db.query('DELETE FROM psicologos WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};

exports.removePaciente = (req, res) => {
  db.query('DELETE FROM pacientes WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};













