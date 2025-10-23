// Importa a biblioteca jsonwebtoken para verificação de tokens JWT
const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação
 * Verifica a presença e validade de um token JWT no cabeçalho da requisição,
 * protegendo rotas do PsicoCare que exigem autenticação de usuários.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função para passar o controle à próxima função na cadeia
 */
module.exports = (req, res, next) => {
  // Extrai o token do cabeçalho Authorization (formato: "Bearer <token>")
  const token = req.headers.authorization?.split(' ')[1];

  // Verifica se o token foi fornecido na requisição
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  try {
    // Verifica a validade do token usando a chave secreta definida em variáveis de ambiente
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adiciona os dados decodificados do token (ex.: id, email) ao objeto req para uso nas rotas
    req.usuario = decoded;
    // Passa o controle para a próxima função na cadeia (ex.: controlador da rota)
    next();
  } catch (err) {
    // Retorna erro 403 se o token for inválido ou expirado
    return res.status(403).json({ erro: 'Token inválido.' });
  }
};