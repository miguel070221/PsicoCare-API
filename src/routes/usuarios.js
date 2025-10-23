const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');


router.post('/', usuariosController.cadastrar);
router.get('/', usuariosController.listar);
router.get('/:id', usuariosController.buscarPorId);
router.put('/:id', usuariosController.atualizar);

// Rota para resetar senha
router.post('/reset-senha', usuariosController.resetarSenha);

module.exports = router;
