// src/routes/acompanhamentos.js
const express = require('express');
const router = express.Router();
const acompanhamentoController = require('../controllers/acompanhamentoController');
const auth = require('../middleware/auth');

// Criar acompanhamento (autenticado)
router.post('/', auth, acompanhamentoController.criarAcompanhamento);

// Listar acompanhamentos do usuário autenticado
router.get('/', auth, acompanhamentoController.listarAcompanhamentos);

// Listar acompanhamentos por id_usuario (admin ou debug)
router.get('/usuario/:id_usuario', acompanhamentoController.listarAcompanhamentos);

module.exports = router;
