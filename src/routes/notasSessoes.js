const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/notasSessoesController');

// Todas as rotas exigem autenticação e serem psicólogo
router.get('/', auth, authorize(['psicologo']), ctrl.list);
router.post('/', auth, authorize(['psicologo']), ctrl.create);
router.put('/:id', auth, authorize(['psicologo']), ctrl.update);
router.delete('/:id', auth, authorize(['psicologo']), ctrl.remove);

module.exports = router;






