const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/horariosDisponiveisController');

// Rotas protegidas para psicólogo
router.get('/', auth, authorize(['psicologo']), ctrl.list);
router.post('/', auth, authorize(['psicologo']), ctrl.create);
router.put('/:id', auth, authorize(['psicologo']), ctrl.update);
router.delete('/:id', auth, authorize(['psicologo']), ctrl.remove);

// Rota pública para pacientes verem slots disponíveis
router.get('/slots', ctrl.getSlotsDisponiveis);
// Rota pública para pacientes verem dias da semana disponíveis
router.get('/dias-semana', ctrl.getDiasSemanaDisponiveis);
// Rota pública para pacientes verem horários configurados do psicólogo
router.get('/publico', ctrl.listarHorariosPublico);

module.exports = router;

