// Script para gerar hash de senha para admin
const bcrypt = require('bcrypt');

const senha = process.argv[2] || 'admin123';

bcrypt.hash(senha, 10).then(hash => {
  console.log('\n========================================');
  console.log('Hash gerada para a senha:', senha);
  console.log('========================================');
  console.log(hash);
  console.log('========================================\n');
  
  console.log('Use este hash no script criar_admin.sql');
  console.log('Ou execute diretamente no MySQL:\n');
  console.log(`INSERT INTO administradores (nome, email, senha, data_criacao)`);
  console.log(`VALUES (`);
  console.log(`  'Administrador',`);
  console.log(`  'admin@psicocare.com',`);
  console.log(`  '${hash}',`);
  console.log(`  NOW()`);
  console.log(`);\n`);
}).catch(err => {
  console.error('Erro ao gerar hash:', err);
});












