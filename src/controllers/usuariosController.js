// Importa bcrypt para hash de senha (já importado acima, não repetir)
// Endpoint para resetar senha
exports.resetarSenha = async (req, res) => {
  const { email, novaSenha } = req.body;
  if (!email || !novaSenha) {
    return res.status(400).json({ erro: 'Email e nova senha são obrigatórios.' });
  }
  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
  const sql = 'UPDATE usuarios SET senha = ? WHERE email = ?';
  db.query(sql, [senhaCriptografada, email], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json({ sucesso: true });
  });
};
// Buscar usuário por ID
exports.buscarPorId = (req, res) => {
  const { id } = req.params;
  usuarioModel.buscarPorId(id, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(results[0]);
  });
};
// Atualizar usuário
const usuarioModel = require('../models/usuarioModel');
exports.atualizar = (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
  }
  usuarioModel.atualizar(id, nome, email, (err, result) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    // Retorna os dados atualizados
    res.json({ id: Number(id), nome, email });
  });
};
// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');
// Importa a biblioteca bcrypt para criptografia segura de senhas
const bcrypt = require('bcrypt');

/**
 * Função cadastrar
 * Cadastra um novo usuário no banco de dados do PsicoCare, criptografando a senha antes de salvá-la.
 * @param {Object} req - Objeto de requisição do Express com os dados do usuário (nome, email, senha, telefone, nascimento)
 * @param {Object} res - Objeto de resposta do Express
 */
exports.cadastrar = async (req, res) => {
  // Extrai os dados do corpo da requisição
  const { nome, email, senha, telefone, nascimento, tipo, crp, especialidade } = req.body;

  // Valida se os campos obrigatórios (nome, email, senha) foram fornecidos
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  // Criptografa a senha com um custo de 10 (nível de segurança para o hash)
  const senhaCriptografada = await bcrypt.hash(senha, 10);

  // Executa a query SQL para inserir o novo usuário na tabela usuarios
  db.query(
    'INSERT INTO usuarios (nome, email, senha, telefone, nascimento) VALUES (?, ?, ?, ?, ?)',
    [nome, email, senhaCriptografada, telefone, nascimento],
    (err, result) => {
      // Retorna erro 500 se houver falha na inserção
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      const novoId = result.insertId;
      // Se o tipo for psicologo, criar registro na tabela profissionais
      if (tipo === 'psicologo') {
        const sqlP = 'INSERT INTO profissionais (usuario_id, nome, crp, especialidade, disponivel) VALUES (?, ?, ?, ?, ?)';
        db.query(sqlP, [novoId, nome, crp || '', especialidade || '', 0], (err2) => {
          if (err2) {
            return res.status(500).json({ erro: err2.message });
          }
          return res.status(201).json({ id: novoId, role: 'psicologo' });
        });
      } else {
        // Retorna o ID do usuário cadastrado com status 201 (criado)
        res.status(201).json({ id: novoId });
      }
    }
  );
};

/**
 * Função listar
 * Recupera todos os usuários cadastrados no banco de dados do PsicoCare, retornando apenas ID, nome e e-mail.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
exports.listar = (req, res) => {
  // Executa a query SQL para selecionar ID, nome e e-mail da tabela usuarios
  db.query('SELECT id, nome, email FROM usuarios', (err, results) => {
    // Retorna erro 500 se houver falha na consulta
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    // Retorna os resultados da query como resposta JSON com status 200
    res.json(results);
  });
};