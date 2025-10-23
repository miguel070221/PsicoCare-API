// Importa a biblioteca jsonwebtoken para gerar tokens de autenticação
const jwt = require('jsonwebtoken');
// Importa a biblioteca bcrypt para comparação segura de senhas
const bcrypt = require('bcrypt');
// Importa o objeto de conexão com o banco de dados MySQL
const db = require('../config/db');

/**
 * Função login
 * Autentica um usuário no PsicoCare com base no e-mail e senha fornecidos,
 * retornando um token JWT e o nome do usuário em caso de sucesso.
 * @param {Object} req - Objeto de requisição do Express com e-mail e senha no corpo
 * @param {Object} res - Objeto de resposta do Express
 */
exports.login = (req, res) => {
  // Extrai e-mail e senha do corpo da requisição
  const { email, senha } = req.body;

  // Valida se e-mail e senha foram fornecidos
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  // Executa a query SQL para buscar o usuário pelo e-mail
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    // Retorna erro 500 se houver falha na consulta ao banco
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    // Verifica se o usuário existe no banco
    if (results.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    // Obtém o primeiro resultado (único usuário com o e-mail fornecido)
    const usuario = results[0];

    // Compatível: aceita senha em texto puro OU hash bcrypt
    let senhaCorreta = false;
    if (usuario.senha.startsWith('$2b$')) {
      // bcrypt
      try {
        senhaCorreta = await require('bcrypt').compare(senha, usuario.senha);
      } catch (e) {
        senhaCorreta = false;
      }
    } else {
      // texto puro
      senhaCorreta = senha === usuario.senha;
    }
    if (!senhaCorreta) {
      // Retorna erro 401 se a senha estiver incorreta
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    // Verifica se existe um profissional vinculado a este usuário
    db.query('SELECT id, disponivel FROM profissionais WHERE usuario_id = ?', [usuario.id], (err2, profResults) => {
      if (err2) return res.status(500).json({ erro: err2.message });

      const isPsicologo = profResults && profResults.length > 0;
      const profissionalId = isPsicologo ? profResults[0].id : null;

      // Gera um token JWT contendo o ID, nome, e-mail e role
      const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email, role: isPsicologo ? 'psicologo' : 'paciente' };
      if (profissionalId) payload.profissionalId = profissionalId;

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

      // Retorna o token JWT, nome, email e role do usuário como resposta JSON
      res.json({ token, nome: usuario.nome, email: usuario.email, role: payload.role, profissionalId });
    });
  });
};