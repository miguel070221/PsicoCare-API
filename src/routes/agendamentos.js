const express = require('express');
const router = express.Router();
const agendamentosController = require('../controllers/agendamentosController');
const auth = require('../middleware/auth');

router.get('/', auth, agendamentosController.listar);
// Criar agendamento (autenticado)
router.post('/', auth, agendamentosController.criar);

module.exports = router;
