const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/pacientesController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', auth, authorize(['paciente']), ctrl.me);
router.put('/me', auth, authorize(['paciente']), ctrl.update);

// admin only
router.get('/', auth, authorize(['admin']), ctrl.list);
router.delete('/:id', auth, authorize(['admin']), ctrl.remove);

module.exports = router;






