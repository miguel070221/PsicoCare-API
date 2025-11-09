const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/adminController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

router.get('/usuarios', auth, authorize(['admin']), ctrl.listUsers);
router.post('/psicologos/aprovar', auth, authorize(['admin']), ctrl.setPsicologoAprovado);
router.delete('/psicologos/:id', auth, authorize(['admin']), ctrl.removePsicologo);
router.delete('/pacientes/:id', auth, authorize(['admin']), ctrl.removePaciente);

module.exports = router;


















