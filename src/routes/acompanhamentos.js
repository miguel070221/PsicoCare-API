// src/routes/acompanhamentos.js
const express = require('express');
const router = express.Router();
const acompanhamentoController = require('../controllers/acompanhamentoController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Criar acompanhamento (apenas pacientes autenticados)
router.post('/', auth, authorize(['paciente']), acompanhamentoController.criarAcompanhamento);

// Listar acompanhamentos do usuário autenticado (apenas pacientes)
router.get('/', auth, authorize(['paciente']), acompanhamentoController.listarAcompanhamentos);

// Psicólogo: listar acompanhamentos de um paciente vinculado
router.get('/paciente/:id', auth, authorize(['psicologo']), acompanhamentoController.listarPorPacienteComAutorizacao);

module.exports = router;
