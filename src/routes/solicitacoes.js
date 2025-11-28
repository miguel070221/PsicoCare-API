const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/solicitacoesController');

// paciente cria e lista as suas
router.post('/', auth, authorize(['paciente']), ctrl.criar);
router.get('/minhas', auth, authorize(['paciente']), ctrl.minhas);

module.exports = router;

































