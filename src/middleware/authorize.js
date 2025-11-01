module.exports = function authorize(roles = []) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }
    if (allowed.length > 0 && !allowed.includes(req.usuario.role)) {
      return res.status(403).json({ erro: 'Sem permissão.' });
    }
    next();
  };
};













