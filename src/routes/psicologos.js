const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/psicologosController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

// público para pacientes (auth opcional para incluir psicólogos vinculados)
router.get('/public', ctrl.listPublic);

// psicólogo autenticado
router.get('/me', auth, authorize(['psicologo']), ctrl.me);
router.put('/me', auth, authorize(['psicologo']), ctrl.update);
router.post('/toggle-disponibilidade', auth, authorize(['psicologo']), ctrl.toggleDisponibilidade);
router.get('/solicitacoes/pendentes', auth, authorize(['psicologo']), ctrl.getSolicitacoesPendentes);
router.post('/solicitacoes/aceitar', auth, authorize(['psicologo']), ctrl.aceitarSolicitacao);
router.post('/solicitacoes/recusar', auth, authorize(['psicologo']), ctrl.recusarSolicitacao);

// admin
router.get('/', auth, authorize(['admin']), ctrl.list);

module.exports = router;










