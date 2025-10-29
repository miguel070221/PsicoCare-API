const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const psicologos = require('../models/psicologoModel');
const solicitacoes = require('../models/solicitacaoModel');
const atendimentos = require('../models/atendimentoModel');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, crp, especializacoes, bio } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    const hash = await bcrypt.hash(senha, 10);
    psicologos.create({ nome, email, senha: hash, crp, especializacoes, bio, disponivel: 0, perfil_completo: 0, aprovado: 1 }, (err, result) => {
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
  psicologos.findByEmail(email, async (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!rows.length) return res.status(401).json({ erro: 'Usuário não encontrado.' });
    const user = rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ erro: 'Senha incorreta.' });
    const token = jwt.sign({ id: user.id, role: 'psicologo', nome: user.nome, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, role: 'psicologo', nome: user.nome, email: user.email, disponivel: !!user.disponivel, perfil_completo: !!user.perfil_completo });
  });
};

exports.update = (req, res) => {
  psicologos.update(req.usuario.id, req.body, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};

exports.toggleDisponibilidade = (req, res) => {
  const { disponivel } = req.body;
  // Ao ativar disponibilidade, marcamos perfil_completo=true para aparecer na lista
  const updates = disponivel ? { disponivel: 1, perfil_completo: 1 } : { disponivel: 0 };
  psicologos.update(req.usuario.id, updates, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true, disponivel: !!disponivel });
  });
};

exports.listPublic = (req, res) => {
  const { especializacao, faixa } = req.query;
  psicologos.listPublic({ especializacao, faixa }, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    const mapped = rows.map(r => ({ ...r, especializacoes: JSON.parse(r.especializacoes || '[]') }));
    res.json(mapped);
  });
};

exports.list = (req, res) => {
  // para admin — lista completa
  const sql = 'SELECT * FROM psicologos ORDER BY data_criacao DESC';
  require('../config/db').query(sql, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows.map(r => ({ ...r, especializacoes: JSON.parse(r.especializacoes || '[]') })));
  });
};

exports.getSolicitacoesPendentes = (req, res) => {
  solicitacoes.findPendingForPsych(req.usuario.id, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
};

exports.aceitarSolicitacao = (req, res) => {
  const { solicitacaoId, id_paciente } = req.body;
  if (!solicitacaoId || !id_paciente) return res.status(400).json({ erro: 'Dados insuficientes.' });
  solicitacoes.updateStatus(solicitacaoId, 'aceita', (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    atendimentos.createFromSolicitacao(id_paciente, req.usuario.id, (err2, result) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.json({ ok: true, atendimentoId: result.insertId });
    });
  });
};

exports.recusarSolicitacao = (req, res) => {
  const { solicitacaoId } = req.body;
  if (!solicitacaoId) return res.status(400).json({ erro: 'Dados insuficientes.' });
  solicitacoes.updateStatus(solicitacaoId, 'recusada', (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};


