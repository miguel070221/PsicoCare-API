// src/controllers/acompanhamentoController.js
const Acompanhamento = require('../models/acompanhamentoModel');

exports.criarAcompanhamento = (req, res) => {
  const { texto, qualidade_sono, humor, data_hora } = req.body;
  // SEMPRE usar o ID do token, nunca confiar no body
  const id_usuario = req.usuario?.id;
  const role = req.usuario?.role;
  
  console.log('📝 [ACOMPANHAMENTO] criarAcompanhamento chamado');
  console.log('📝 [ACOMPANHAMENTO] id_usuario:', id_usuario);
  console.log('📝 [ACOMPANHAMENTO] role:', role);
  
  if (!id_usuario) {
    console.error('❌ [ACOMPANHAMENTO] Usuário não autenticado');
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }
  
  // Apenas pacientes podem criar acompanhamentos
  if (role !== 'paciente') {
    console.error('❌ [ACOMPANHAMENTO] Apenas pacientes podem criar acompanhamentos');
    return res.status(403).json({ error: 'Apenas pacientes podem criar acompanhamentos.' });
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
    if (err) {
      console.error('❌ [ACOMPANHAMENTO] Erro ao salvar:', err);
      return res.status(500).json({ error: 'Erro ao salvar acompanhamento.' });
    }
    console.log('✅ [ACOMPANHAMENTO] Acompanhamento criado com sucesso:', result.insertId);
    res.status(201).json({ success: true, id: result.insertId });
  });
};

exports.listarAcompanhamentos = (req, res) => {
  // SEMPRE usar o ID do token, nunca confiar em parâmetros
  const id_usuario = req.usuario?.id;
  const role = req.usuario?.role;
  
  console.log('📋 [ACOMPANHAMENTO] listarAcompanhamentos chamado');
  console.log('📋 [ACOMPANHAMENTO] id_usuario:', id_usuario);
  console.log('📋 [ACOMPANHAMENTO] role:', role);
  
  if (!id_usuario) {
    console.error('❌ [ACOMPANHAMENTO] Usuário não autenticado');
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }
  
  // Apenas pacientes podem ver seus próprios acompanhamentos
  if (role !== 'paciente') {
    console.error('❌ [ACOMPANHAMENTO] Apenas pacientes podem ver seus acompanhamentos');
    return res.status(403).json({ error: 'Apenas pacientes podem ver seus acompanhamentos.' });
  }
  
  Acompanhamento.getByUsuario(id_usuario, (err, rows) => {
    if (err) {
      console.error('❌ [ACOMPANHAMENTO] Erro ao buscar:', err);
      return res.status(500).json({ error: 'Erro ao buscar acompanhamentos.' });
    }
    console.log('✅ [ACOMPANHAMENTO] Acompanhamentos encontrados:', rows?.length || 0);
    res.json(rows || []);
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

// Atualizar acompanhamento (apenas pacientes podem atualizar seus próprios registros)
exports.atualizarAcompanhamento = (req, res) => {
  const acompanhamentoId = parseInt(req.params.id, 10);
  const { texto, qualidade_sono, humor } = req.body;
  const id_usuario = req.usuario?.id;
  const role = req.usuario?.role;

  console.log('✏️ [ACOMPANHAMENTO] atualizarAcompanhamento chamado');
  console.log('✏️ [ACOMPANHAMENTO] acompanhamentoId:', acompanhamentoId);
  console.log('✏️ [ACOMPANHAMENTO] id_usuario:', id_usuario);
  console.log('✏️ [ACOMPANHAMENTO] role:', role);

  if (!id_usuario) {
    console.error('❌ [ACOMPANHAMENTO] Usuário não autenticado');
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  // Apenas pacientes podem atualizar acompanhamentos
  if (role !== 'paciente') {
    console.error('❌ [ACOMPANHAMENTO] Apenas pacientes podem atualizar acompanhamentos');
    return res.status(403).json({ error: 'Apenas pacientes podem atualizar acompanhamentos.' });
  }

  if (!acompanhamentoId) {
    return res.status(400).json({ error: 'ID do acompanhamento é obrigatório.' });
  }

  // Verificar se o acompanhamento existe e pertence ao usuário
  Acompanhamento.getById(acompanhamentoId, (err, rows) => {
    if (err) {
      console.error('❌ [ACOMPANHAMENTO] Erro ao buscar acompanhamento:', err);
      return res.status(500).json({ error: 'Erro ao buscar acompanhamento.' });
    }

    if (!rows || rows.length === 0) {
      console.error('❌ [ACOMPANHAMENTO] Acompanhamento não encontrado');
      return res.status(404).json({ error: 'Acompanhamento não encontrado.' });
    }

    const acompanhamento = rows[0];
    if (acompanhamento.id_usuario !== id_usuario) {
      console.error('❌ [ACOMPANHAMENTO] Usuário não tem permissão para atualizar este acompanhamento');
      return res.status(403).json({ error: 'Você não tem permissão para atualizar este acompanhamento.' });
    }

    // Preparar dados para atualização (manter valores originais se não fornecidos)
    const dados = {
      texto: texto !== undefined ? (texto === '' ? null : texto) : acompanhamento.texto,
      qualidade_sono: qualidade_sono !== undefined ? (qualidade_sono === null ? null : qualidade_sono) : acompanhamento.qualidade_sono,
      humor: humor !== undefined ? (humor === '' ? null : humor) : acompanhamento.humor,
    };

    // Pelo menos um dos campos deve ter valor (não todos nulos)
    if (
      (dados.texto === null || dados.texto === '') &&
      (dados.qualidade_sono === null || dados.qualidade_sono === undefined) &&
      (dados.humor === null || dados.humor === '')
    ) {
      return res.status(400).json({ error: 'Inclua algum conteúdo (texto, sono ou humor).' });
    }

    Acompanhamento.update(acompanhamentoId, dados, (err2, result) => {
      if (err2) {
        console.error('❌ [ACOMPANHAMENTO] Erro ao atualizar:', err2);
        return res.status(500).json({ error: 'Erro ao atualizar acompanhamento.' });
      }
      console.log('✅ [ACOMPANHAMENTO] Acompanhamento atualizado com sucesso');
      res.json({ success: true, message: 'Acompanhamento atualizado com sucesso.' });
    });
  });
};

// Deletar acompanhamento (apenas pacientes podem deletar seus próprios registros)
exports.deletarAcompanhamento = (req, res) => {
  const acompanhamentoId = parseInt(req.params.id, 10);
  const id_usuario = req.usuario?.id;
  const role = req.usuario?.role;

  console.log('🗑️ [ACOMPANHAMENTO] deletarAcompanhamento chamado');
  console.log('🗑️ [ACOMPANHAMENTO] acompanhamentoId:', acompanhamentoId);
  console.log('🗑️ [ACOMPANHAMENTO] id_usuario:', id_usuario);
  console.log('🗑️ [ACOMPANHAMENTO] role:', role);

  if (!id_usuario) {
    console.error('❌ [ACOMPANHAMENTO] Usuário não autenticado');
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  // Apenas pacientes podem deletar acompanhamentos
  if (role !== 'paciente') {
    console.error('❌ [ACOMPANHAMENTO] Apenas pacientes podem deletar acompanhamentos');
    return res.status(403).json({ error: 'Apenas pacientes podem deletar acompanhamentos.' });
  }

  if (!acompanhamentoId) {
    return res.status(400).json({ error: 'ID do acompanhamento é obrigatório.' });
  }

  // Verificar se o acompanhamento existe e pertence ao usuário
  Acompanhamento.getById(acompanhamentoId, (err, rows) => {
    if (err) {
      console.error('❌ [ACOMPANHAMENTO] Erro ao buscar acompanhamento:', err);
      return res.status(500).json({ error: 'Erro ao buscar acompanhamento.' });
    }

    if (!rows || rows.length === 0) {
      console.error('❌ [ACOMPANHAMENTO] Acompanhamento não encontrado');
      return res.status(404).json({ error: 'Acompanhamento não encontrado.' });
    }

    const acompanhamento = rows[0];
    if (acompanhamento.id_usuario !== id_usuario) {
      console.error('❌ [ACOMPANHAMENTO] Usuário não tem permissão para deletar este acompanhamento');
      return res.status(403).json({ error: 'Você não tem permissão para deletar este acompanhamento.' });
    }

    Acompanhamento.delete(acompanhamentoId, (err2, result) => {
      if (err2) {
        console.error('❌ [ACOMPANHAMENTO] Erro ao deletar:', err2);
        return res.status(500).json({ error: 'Erro ao deletar acompanhamento.' });
      }
      console.log('✅ [ACOMPANHAMENTO] Acompanhamento deletado com sucesso');
      res.json({ success: true, message: 'Acompanhamento deletado com sucesso.' });
    });
  });
};