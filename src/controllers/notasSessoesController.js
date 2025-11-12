const notas = require('../models/notaSessaoModel');

exports.list = (req, res) => {
  const id_psicologo = req.usuario.id;
  const { id_paciente } = req.query;
  
  if (id_paciente) {
    notas.listByPaciente(id_psicologo, id_paciente, (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows);
    });
  } else {
    notas.listByPsicologo(id_psicologo, (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows);
    });
  }
};

exports.create = (req, res) => {
  const id_psicologo = req.usuario?.id;
  const { id_paciente, titulo, conteudo, data_sessao, id_agendamento } = req.body;
  
  if (!id_psicologo) {
    return res.status(401).json({ erro: 'Usuário não autenticado corretamente.' });
  }
  
  if (!id_paciente) {
    return res.status(400).json({ erro: 'id_paciente é obrigatório.' });
  }
  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ erro: 'titulo é obrigatório.' });
  }
  if (!conteudo || !conteudo.trim()) {
    return res.status(400).json({ erro: 'conteudo é obrigatório.' });
  }
  
  notas.create({
    id_psicologo,
    id_paciente: Number(id_paciente),
    titulo: titulo.trim(),
    conteudo: conteudo.trim(),
    data_sessao: data_sessao || null,
    id_agendamento: id_agendamento || null
  }, (err, result) => {
    if (err) {
      let mensagemErro = err.message || 'Erro ao salvar nota no banco de dados.';
      if (err.code === 'ER_NO_SUCH_TABLE' || err.errno === 1146) {
        mensagemErro = 'Tabela notas_sessoes não existe no banco de dados. Execute o schema.sql para criar a tabela.';
      }
      return res.status(500).json({ 
        erro: mensagemErro,
        detalhes: err.sqlMessage || 'Erro desconhecido'
      });
    }
    
    res.status(201).json({ 
      id: result.insertId, 
      id_psicologo,
      id_paciente: Number(id_paciente),
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      data_sessao: data_sessao || null,
      id_agendamento: id_agendamento || null
    });
  });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const id_psicologo = req.usuario.id;
  const { titulo, conteudo, data_sessao } = req.body;
  
  if (!titulo || !conteudo) {
    return res.status(400).json({ erro: 'titulo e conteudo são obrigatórios.' });
  }
  
  // Verificar se a nota existe e pertence ao psicólogo
  notas.getById(id, id_psicologo, (err, nota) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!nota) {
      return res.status(404).json({ erro: 'Nota não encontrada.' });
    }
    
    notas.update(id, { titulo, conteudo, data_sessao }, id_psicologo, (err2, result) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.json({ ok: true });
    });
  });
};

exports.remove = (req, res) => {
  const { id } = req.params;
  const id_psicologo = req.usuario.id;
  
  // Verificar se a nota existe e pertence ao psicólogo
  notas.getById(id, id_psicologo, (err, nota) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!nota) {
      return res.status(404).json({ erro: 'Nota não encontrada.' });
    }
    
    notas.remove(id, id_psicologo, (err2, result) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.json({ ok: true, message: 'Nota removida com sucesso' });
    });
  });
};
