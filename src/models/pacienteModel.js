const db = require('../config/db');

exports.create = (paciente, cb) => {
  const { nome, email, senha, idade, genero, preferencia_comunicacao, contato_preferido } = paciente;
  const sql = `INSERT INTO pacientes (nome, email, senha, idade, genero, preferencia_comunicacao, contato_preferido)
              VALUES (?,?,?,?,?,?,?)`;
  db.query(sql, [nome, email, senha, idade, genero, preferencia_comunicacao, contato_preferido], cb);
};

exports.findByEmail = (email, cb) => {
  db.query('SELECT * FROM pacientes WHERE email = ?', [email], cb);
};

exports.findById = (id, cb) => {
  db.query('SELECT * FROM pacientes WHERE id = ?', [id], cb);
};

exports.update = (id, dados, cb) => {
  const { 
    nome, email, idade, genero, preferencia_comunicacao, contato_preferido,
    link_whatsapp, link_telegram, link_discord, link_email, telefone
  } = dados;
  
  // Construir SQL dinamicamente baseado nos campos fornecidos
  const updates = [];
  const valores = [];
  
  if (nome !== undefined) { updates.push('nome=?'); valores.push(nome); }
  if (email !== undefined) { updates.push('email=?'); valores.push(email); }
  if (idade !== undefined) { updates.push('idade=?'); valores.push(idade); }
  if (genero !== undefined) { updates.push('genero=?'); valores.push(genero); }
  if (preferencia_comunicacao !== undefined) { updates.push('preferencia_comunicacao=?'); valores.push(preferencia_comunicacao); }
  if (contato_preferido !== undefined) { updates.push('contato_preferido=?'); valores.push(contato_preferido); }
  if (link_whatsapp !== undefined) { updates.push('link_whatsapp=?'); valores.push(link_whatsapp); }
  if (link_telegram !== undefined) { updates.push('link_telegram=?'); valores.push(link_telegram); }
  if (link_discord !== undefined) { updates.push('link_discord=?'); valores.push(link_discord); }
  if (link_email !== undefined) { updates.push('link_email=?'); valores.push(link_email); }
  if (telefone !== undefined) { updates.push('telefone=?'); valores.push(telefone); }
  
  if (updates.length === 0) {
    return cb(null, { affectedRows: 0 });
  }
  
  valores.push(id);
  const sql = `UPDATE pacientes SET ${updates.join(', ')} WHERE id=?`;
  db.query(sql, valores, cb);
};

exports.list = (cb) => {
  db.query('SELECT id, nome, email, idade, genero, preferencia_comunicacao, contato_preferido, link_whatsapp, link_telegram, link_discord, link_email, telefone, data_criacao FROM pacientes', cb);
};

exports.remove = (id, cb) => {
  db.query('DELETE FROM pacientes WHERE id = ?', [id], cb);
};




















