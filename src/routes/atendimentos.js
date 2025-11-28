const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/atendimentosController');

router.get('/psicologo/meus', auth, authorize(['psicologo']), ctrl.meusComoPsicologo);
router.get('/paciente/meus', auth, authorize(['paciente']), ctrl.meusComoPaciente);
router.post('/definir-link', auth, authorize(['psicologo']), ctrl.definirLink);

module.exports = router;

































