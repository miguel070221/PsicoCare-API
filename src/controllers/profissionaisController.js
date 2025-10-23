// Importa o objeto de conexão com o banco de dados MySQL configurado no arquivo db.js
const db = require('../config/db');

/**
 * Função listar
 * Recupera todos os profissionais cadastrados no banco de dados do PsicoCare
 * e retorna os resultados como resposta JSON.
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
exports.listar = (req, res) => {
  // Executa a query SQL para selecionar todos os registros da tabela profissionais
  db.query('SELECT * FROM profissionais', (err, results) => {
    // Verifica se houve erro na execução da query
    if (err) {
      // Retorna um erro HTTP 500 com a mensagem de erro do banco
      return res.status(500).json({ erro: err.message });
    }
    // Retorna os resultados da query como resposta JSON com status 200
    res.json(results);
  });
};

// Toggle disponibilidade do profissional (espera body { disponivel: 0|1 })
exports.toggleDisponibilidade = (req, res) => {
  const { id } = req.params;
  const { disponivel } = req.body;
  if (typeof disponivel === 'undefined') return res.status(400).json({ erro: 'Campo disponivel obrigatório.' });

  const sql = 'UPDATE profissionais SET disponivel = ? WHERE id = ?';
  db.query(sql, [disponivel ? 1 : 0, id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ id, disponivel: disponivel ? 1 : 0 });
  });
};