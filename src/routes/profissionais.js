const express = require('express');
const router = express.Router();
const profissionaisController = require('../controllers/profissionaisController');

router.get('/', profissionaisController.listar);
// Toggle disponibilidade (autenticado) - aqui assumimos que o middleware auth definirá req.usuario
router.patch('/:id/disponibilidade', profissionaisController.toggleDisponibilidade);

module.exports = router;
