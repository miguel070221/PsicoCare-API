const express = require('express');
const router = express.Router();
const avaliacoesController = require('../controllers/avaliacoesController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Listar avaliações do usuário autenticado
router.get('/', auth, avaliacoesController.listar);

// Criar avaliação (apenas pacientes autenticados)
router.post('/', auth, authorize(['paciente']), avaliacoesController.criar);

// Listar avaliações públicas (sem autenticação)
router.get('/publicas', avaliacoesController.listarPublicas);

module.exports = router;
