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
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  // Log para debug (rotas de notas e agendamentos)
  if (req.originalUrl?.includes('notas-sessoes') || req.originalUrl?.includes('agendamentos')) {
    console.log('🔐 [AUTH] MIDDLEWARE AUTH - Verificando autenticação:');
    console.log('🔐 [AUTH] URL:', req.originalUrl);
    console.log('🔐 [AUTH] Method:', req.method);
    console.log('🔐 [AUTH] Authorization header:', authHeader ? 'Presente' : 'Ausente');
    console.log('🔐 [AUTH] Token extraído:', token ? `${token.substring(0, 20)}...` : 'Não encontrado');
    console.log('🔐 [AUTH] JWT_SECRET definido:', !!process.env.JWT_SECRET);
  }

  // Verifica se o token foi fornecido na requisição
  if (!token) {
    if (req.originalUrl?.includes('notas-sessoes') || req.originalUrl?.includes('agendamentos')) {
      console.error('❌ [AUTH] MIDDLEWARE AUTH - Token não fornecido');
      console.error('❌ [AUTH] URL:', req.originalUrl);
      console.error('❌ [AUTH] Method:', req.method);
    }
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  try {
    // Verifica a validade do token usando a chave secreta definida em variáveis de ambiente
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adiciona os dados decodificados do token (ex.: id, email) ao objeto req para uso nas rotas
    req.usuario = decoded;
    
    if (req.originalUrl?.includes('notas-sessoes') || req.originalUrl?.includes('agendamentos')) {
      console.log('✅ [AUTH] MIDDLEWARE AUTH - Token válido');
      console.log('✅ [AUTH] Usuário decodificado:', JSON.stringify(decoded, null, 2));
    }
    
    // Passa o controle para a próxima função na cadeia (ex.: controlador da rota)
    next();
  } catch (err) {
    // Retorna erro 403 se o token for inválido ou expirado
    if (req.originalUrl?.includes('notas-sessoes') || req.originalUrl?.includes('agendamentos')) {
      console.error('❌ [AUTH] MIDDLEWARE AUTH - Erro ao verificar token:', err.message);
      console.error('❌ [AUTH] Erro completo:', err);
      console.error('❌ [AUTH] URL:', req.originalUrl);
      console.error('❌ [AUTH] Method:', req.method);
    }
    return res.status(403).json({ erro: 'Token inválido.', detalhes: err.message });
  }
};