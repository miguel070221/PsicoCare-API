const atendimentos = require('../models/atendimentoModel');

exports.meusComoPsicologo = (req, res) => {
  const idPsicologo = req.usuario.id;
  const role = req.usuario.role;
  
  console.log('=== meusComoPsicologo ===');
  console.log('ID do psicólogo do token:', idPsicologo);
  console.log('Role do token:', role);
  console.log('Token completo:', JSON.stringify(req.usuario, null, 2));
  
  if (!idPsicologo) {
    console.error('❌ ID do psicólogo não encontrado no token');
    return res.status(400).json({ erro: 'ID do psicólogo não encontrado no token.' });
  }
  
  atendimentos.listByPsicologo(idPsicologo, (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar atendimentos:', err);
      return res.status(500).json({ erro: err.message });
    }
    
    console.log('✅ Atendimentos retornados:', rows?.length || 0);
    if (rows && rows.length > 0) {
      console.log('📋 Detalhes dos atendimentos:');
      rows.forEach((r, idx) => {
        console.log(`  ${idx + 1}. ID: ${r.id}, Paciente: ${r.id_paciente} (${r.paciente_nome}), Status: ${r.status}`);
      });
    } else {
      console.log('⚠️ Nenhum atendimento encontrado');
    }
    
    res.json(rows);
  });
};

exports.meusComoPaciente = (req, res) => {
  atendimentos.listByPaciente(req.usuario.id, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
};

exports.definirLink = (req, res) => {
  const { id, link_consulta } = req.body;
  if (!id || !link_consulta) return res.status(400).json({ erro: 'id e link_consulta são obrigatórios.' });
  atendimentos.updateLink(id, link_consulta, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};




















