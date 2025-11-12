const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../models/adminModel');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    const hash = await bcrypt.hash(senha, 10);
    admin.create({ nome, email, senha: hash }, (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.status(201).json({ id: result.insertId, nome, email });
    });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.login = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  admin.findByEmail(email, async (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!rows.length) return res.status(401).json({ erro: 'Usuário não encontrado.' });
    const user = rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ erro: 'Senha incorreta.' });
    const token = jwt.sign({ id: user.id, role: 'admin', nome: user.nome, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, role: 'admin', nome: user.nome, email: user.email });
  });
};

exports.listUsers = (req, res) => {
  console.log('📋 [ADMIN] listUsers chamado');
  console.log('📋 [ADMIN] req.usuario:', JSON.stringify(req.usuario, null, 2));
  
  // Para admin, não retornar dados pessoais dos pacientes (apenas id, nome, email)
  db.query('SELECT id, nome, email FROM pacientes', (e1, pacientes) => {
    if (e1) {
      console.error('❌ [ADMIN] Erro ao buscar pacientes:', e1);
      return res.status(500).json({ erro: e1.message });
    }
    console.log('✅ [ADMIN] Pacientes encontrados:', pacientes?.length || 0);
    
    db.query('SELECT id, nome, email, crp, disponivel, perfil_completo, aprovado FROM psicologos', (e2, psicologos) => {
      if (e2) {
        console.error('❌ [ADMIN] Erro ao buscar psicólogos:', e2);
        return res.status(500).json({ erro: e2.message });
      }
      console.log('✅ [ADMIN] Psicólogos encontrados:', psicologos?.length || 0);
      console.log('✅ [ADMIN] Retornando:', { pacientes: pacientes?.length || 0, psicologos: psicologos?.length || 0 });
      res.json({ pacientes: pacientes || [], psicologos: psicologos || [] });
    });
  });
};

exports.setPsicologoAprovado = (req, res) => {
  const { id, aprovado } = req.body;
  if (typeof id === 'undefined') return res.status(400).json({ erro: 'ID obrigatório.' });
  db.query('UPDATE psicologos SET aprovado=? WHERE id=?', [aprovado ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};

exports.removePsicologo = (req, res) => {
  db.query('DELETE FROM psicologos WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};

exports.removePaciente = (req, res) => {
  db.query('DELETE FROM pacientes WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true });
  });
};

// Obter detalhes de um paciente (apenas informações básicas, sem dados pessoais)
exports.getPacienteDetalhes = (req, res) => {
  const pacienteId = req.params.id;
  
  db.query(
    `SELECT 
      id, nome, email, data_criacao
    FROM pacientes 
    WHERE id = ?`,
    [pacienteId],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (!rows || rows.length === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
      res.json(rows[0]);
    }
  );
};

// Obter detalhes completos de um psicólogo (exceto informações pessoais como notas)
exports.getPsicologoDetalhes = (req, res) => {
  const psicologoId = req.params.id;
  
  db.query(
    `SELECT 
      id, nome, email, crp, especializacoes, bio, foto_perfil,
      telefone, redes_sociais,
      disponivel, perfil_completo, aprovado, data_criacao
    FROM psicologos 
    WHERE id = ?`,
    [psicologoId],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (!rows || rows.length === 0) return res.status(404).json({ erro: 'Psicólogo não encontrado.' });
      
      const psicologo = rows[0];
      // Parse especializacoes se for JSON
      if (psicologo.especializacoes) {
        try {
          psicologo.especializacoes = JSON.parse(psicologo.especializacoes);
        } catch {
          psicologo.especializacoes = [];
        }
      } else {
        psicologo.especializacoes = [];
      }
      
      // Parse redes_sociais se for JSON
      if (psicologo.redes_sociais) {
        try {
          psicologo.redes_sociais = JSON.parse(psicologo.redes_sociais);
        } catch {
          psicologo.redes_sociais = {};
        }
      } else {
        psicologo.redes_sociais = {};
      }
      
      res.json(psicologo);
    }
  );
};

// Editar paciente (apenas campos básicos, sem dados pessoais)
exports.updatePaciente = (req, res) => {
  const pacienteId = req.params.id;
  const { nome, email } = req.body;
  
  // Campos permitidos para edição pelo admin (apenas nome e email, sem dados pessoais)
  const updates = [];
  const values = [];
  
  if (nome !== undefined) { updates.push('nome=?'); values.push(nome); }
  if (email !== undefined) { updates.push('email=?'); values.push(email); }
  
  if (updates.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo válido para atualizar.' });
  }
  
  values.push(pacienteId);
  const sql = `UPDATE pacientes SET ${updates.join(', ')} WHERE id=?`;
  
  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true, mensagem: 'Paciente atualizado com sucesso.' });
  });
};

// Editar psicólogo (campos permitidos, exceto informações pessoais como notas)
exports.updatePsicologo = (req, res) => {
  const psicologoId = req.params.id;
  const { 
    nome, email, crp, especializacoes, bio, foto_perfil,
    disponivel, perfil_completo, aprovado
  } = req.body;
  
  // Campos permitidos para edição (não inclui senha, notas, etc)
  const updates = [];
  const values = [];
  
  if (nome !== undefined) { updates.push('nome=?'); values.push(nome); }
  if (email !== undefined) { updates.push('email=?'); values.push(email); }
  if (crp !== undefined) { updates.push('crp=?'); values.push(crp); }
  if (especializacoes !== undefined) { 
    const especializacoesJson = Array.isArray(especializacoes) 
      ? JSON.stringify(especializacoes) 
      : especializacoes;
    updates.push('especializacoes=?'); 
    values.push(especializacoesJson); 
  }
  if (bio !== undefined) { updates.push('bio=?'); values.push(bio); }
  if (foto_perfil !== undefined) { updates.push('foto_perfil=?'); values.push(foto_perfil); }
  if (disponivel !== undefined) { updates.push('disponivel=?'); values.push(disponivel ? 1 : 0); }
  if (perfil_completo !== undefined) { updates.push('perfil_completo=?'); values.push(perfil_completo ? 1 : 0); }
  if (aprovado !== undefined) { updates.push('aprovado=?'); values.push(aprovado ? 1 : 0); }
  
  if (updates.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo válido para atualizar.' });
  }
  
  values.push(psicologoId);
  const sql = `UPDATE psicologos SET ${updates.join(', ')} WHERE id=?`;
  
  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true, mensagem: 'Psicólogo atualizado com sucesso.' });
  });
};

// Listar todos os usuários com informações completas (exceto informações pessoais)
exports.listUsersCompleto = (req, res) => {
  console.log('📋 [ADMIN] listUsersCompleto chamado');
  console.log('📋 [ADMIN] req.usuario:', JSON.stringify(req.usuario, null, 2));
  
  // Buscar pacientes (sem dados pessoais - apenas id, nome, email)
  db.query(
    `SELECT 
      id, nome, email, data_criacao
    FROM pacientes 
    ORDER BY data_criacao DESC`,
    (e1, pacientes) => {
      if (e1) {
        console.error('❌ [ADMIN] Erro ao buscar pacientes (completo):', e1);
        return res.status(500).json({ erro: e1.message });
      }
      console.log('✅ [ADMIN] Pacientes encontrados (completo):', pacientes?.length || 0);
      
      // Buscar psicólogos (sem notas)
      db.query(
        `SELECT 
          id, nome, email, crp, especializacoes, bio, foto_perfil,
          disponivel, perfil_completo, aprovado, data_criacao
        FROM psicologos 
        ORDER BY data_criacao DESC`,
        (e2, psicologos) => {
          if (e2) {
            console.error('❌ [ADMIN] Erro ao buscar psicólogos (completo):', e2);
            return res.status(500).json({ erro: e2.message });
          }
          console.log('✅ [ADMIN] Psicólogos encontrados (completo):', psicologos?.length || 0);
          
          // Parse especializacoes dos psicólogos
          const psicologosParsed = (psicologos || []).map(p => ({
            ...p,
            especializacoes: p.especializacoes ? (() => {
              try {
                return JSON.parse(p.especializacoes);
              } catch (e) {
                console.warn('⚠️ [ADMIN] Erro ao parsear especializações do psicólogo', p.id, ':', e);
                return [];
              }
            })() : []
          }));
          
          console.log('✅ [ADMIN] Retornando (completo):', { pacientes: pacientes?.length || 0, psicologos: psicologosParsed?.length || 0 });
          res.json({ pacientes: pacientes || [], psicologos: psicologosParsed || [] });
        }
      );
    }
  );
};






















