// Script qui s'exécute après npm install sur Vercel
// Génère le client Prisma automatiquement

const { execSync } = require('child_process');

try {
  console.log('Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Client Prisma généré avec succès!');
} catch (error) {
  console.error('Erreur lors de la génération du client Prisma:', error);
  process.exit(1);
}

