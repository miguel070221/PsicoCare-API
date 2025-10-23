const express = require('express');
const router = express.Router();
const avaliacoesController = require('../controllers/avaliacoesController');
const auth = require('../middleware/auth');
router.get('/', auth, avaliacoesController.listar);
// Criar avaliação (autenticado)
router.post('/', auth, avaliacoesController.criar);
// Listar avaliações públicas (somente profissionais com >= 10 avaliações)
router.get('/publicas', avaliacoesController.listarPublicas);

module.exports = router;
