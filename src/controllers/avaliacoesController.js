// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');

/**
 * Função listar
 * Recupera todas as avaliações do usuário autenticado
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
exports.listar = (req, res) => {
  const usuarioId = req.usuario?.id;
  const role = req.usuario?.role;
  
  console.log('📋 [AVALIACOES] listar chamado');
  console.log('📋 [AVALIACOES] usuarioId:', usuarioId);
  console.log('📋 [AVALIACOES] role:', role);
  
  if (!usuarioId) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }
  
  // Se for paciente, lista avaliações que ele fez
  // Se for psicólogo, lista avaliações que ele recebeu
  let sql;
  let params;
  
  if (role === 'paciente') {
    sql = 'SELECT * FROM avaliacoes WHERE usuario_id = ? ORDER BY data_hora DESC';
    params = [usuarioId];
  } else if (role === 'psicologo') {
    sql = 'SELECT * FROM avaliacoes WHERE profissional_id = ? ORDER BY data_hora DESC';
    params = [usuarioId];
  } else {
    // Admin ou outro role - retorna todas (ou vazio)
    sql = 'SELECT * FROM avaliacoes ORDER BY data_hora DESC';
    params = [];
  }
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ [AVALIACOES] Erro ao buscar avaliações:', err);
      return res.status(500).json({ erro: err.message });
    }
    console.log('✅ [AVALIACOES] Avaliações encontradas:', results?.length || 0);
    res.json(results || []);
  });
};

// Criar avaliação (apenas pacientes podem criar)
exports.criar = (req, res) => {
  const id_usuario = req.usuario?.id;
  const role = req.usuario?.role;
  const { profissional_id, nota, comentario, id_agendamento } = req.body;
  
  console.log('📤 [AVALIACOES] criar chamado');
  console.log('📤 [AVALIACOES] usuarioId:', id_usuario);
  console.log('📤 [AVALIACOES] role:', role);
  console.log('📤 [AVALIACOES] dados:', { profissional_id, nota, comentario, id_agendamento });
  
  // Apenas pacientes podem criar avaliações
  if (role !== 'paciente') {
    console.error('❌ [AVALIACOES] Apenas pacientes podem criar avaliações');
    return res.status(403).json({ erro: 'Apenas pacientes podem criar avaliações.' });
  }
  
  if (!id_usuario || !profissional_id || typeof nota === 'undefined') {
    return res.status(400).json({ erro: 'Dados incompletos para criar avaliação (usuario_id, profissional_id e nota são obrigatórios).' });
  }
  
  // Validar nota (1-5)
  if (nota < 1 || nota > 5) {
    return res.status(400).json({ erro: 'A nota deve ser entre 1 e 5.' });
  }
  
  const sql = 'INSERT INTO avaliacoes (usuario_id, profissional_id, nota, comentario, id_agendamento, data_hora) VALUES (?, ?, ?, ?, ?, ?)';
  const data_hora = new Date();
  db.query(sql, [id_usuario, profissional_id, nota, comentario || null, id_agendamento || null, data_hora], (err, result) => {
    if (err) {
      console.error('❌ [AVALIACOES] Erro ao criar avaliação:', err);
      return res.status(500).json({ erro: err.message });
    }
    console.log('✅ [AVALIACOES] Avaliação criada com sucesso:', result.insertId);
    res.status(201).json({ id: result.insertId, usuario_id: id_usuario, profissional_id, nota, comentario, id_agendamento, data_hora });
  });
};

// Listar avaliações públicas: retorna todas as avaliações (sem filtro de >= 10)
exports.listarPublicas = (req, res) => {
  console.log('📋 [AVALIACOES] listarPublicas chamado');
  
  // Listar todas as avaliações públicas (sem restrição de >= 10 avaliações)
  const sql = `SELECT 
    a.id,
    a.usuario_id,
    a.profissional_id,
    a.id_agendamento,
    a.nota,
    a.comentario,
    a.data_hora,
    p.nome AS paciente_nome,
    ps.nome AS psicologo_nome
  FROM avaliacoes a
  LEFT JOIN pacientes p ON p.id = a.usuario_id
  LEFT JOIN psicologos ps ON ps.id = a.profissional_id
  ORDER BY a.data_hora DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ [AVALIACOES] Erro ao buscar avaliações públicas:', err);
      return res.status(500).json({ erro: err.message });
    }
    console.log('✅ [AVALIACOES] Avaliações públicas encontradas:', results?.length || 0);
    res.json(results || []);
  });
};