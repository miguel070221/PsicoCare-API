const express = require('express');
const router = express.Router();
const agendamentosController = require('../controllers/agendamentosController');
const auth = require('../middleware/auth');

router.get('/', auth, agendamentosController.listar);
// Listar agendamentos de um paciente específico (apenas para psicólogos) - deve vir ANTES de /:id
router.get('/paciente/:pacienteId', auth, agendamentosController.listarPorPaciente);
// Criar agendamento (autenticado)
router.post('/', auth, agendamentosController.criar);
// IMPORTANTE: Rotas específicas devem vir ANTES de rotas com parâmetros genéricos
// Cancelar/Deletar agendamento (autenticado) - agora deleta ao invés de apenas cancelar
router.put('/:id/cancelar', auth, agendamentosController.cancelar);
// Deletar agendamento (autenticado) - rota alternativa
router.delete('/:id', auth, agendamentosController.deletar);
// Atualizar agendamento (autenticado) - deve vir depois das rotas específicas
router.put('/:id', auth, agendamentosController.atualizar);

module.exports = router;
