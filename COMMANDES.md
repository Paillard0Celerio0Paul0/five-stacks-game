# Commandes à exécuter pour le projet Five Stacks Game

## Étape 1 : Installation des dépendances

```bash
npm install
```

## Étape 2 : Configuration de l'environnement

1. Créer le fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

2. Éditer le fichier `.env` et remplir les variables :
   - `DATABASE_URL` : URL de votre base de données PostgreSQL
   - `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
   - `NEXTAUTH_URL` : `http://localhost:3000` (en développement)
   - `DISCORD_CLIENT_ID` : Obtenir sur https://discord.com/developers/applications
   - `DISCORD_CLIENT_SECRET` : Obtenir sur Discord Developer Portal

## Étape 3 : Configuration Discord OAuth

1. Aller sur https://discord.com/developers/applications
2. Créer une nouvelle application
3. Aller dans "OAuth2" → "General"
4. Ajouter une Redirect URI : `http://localhost:3000/api/auth/callback/discord`
5. Copier le Client ID et créer un Client Secret
6. Les ajouter dans le fichier `.env`

## Étape 4 : Configuration de la base de données

1. Générer le client Prisma :
```bash
npm run db:generate
```

2. Créer la base de données (si elle n'existe pas) :
```bash
# Avec PostgreSQL, créer la base de données :
createdb five_stacks_game

# Ou utiliser votre méthode préférée pour créer la base
```

3. Appliquer le schéma à la base de données :
```bash
npm run db:push
```

4. Initialiser les rôles par défaut :
```bash
npx tsx scripts/init-roles.ts
```

## Étape 5 : Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur http://localhost:3000

## Commandes utiles

- `npm run dev` : Lancer le serveur de développement
- `npm run build` : Construire pour la production
- `npm run start` : Lancer le serveur de production
- `npm run db:generate` : Régénérer le client Prisma
- `npm run db:push` : Pousser les changements de schéma vers la DB
- `npm run db:migrate` : Créer une migration
- `npm run db:studio` : Ouvrir Prisma Studio (interface graphique pour la DB)

## Notes importantes

- Assurez-vous d'avoir PostgreSQL installé et en cours d'exécution
- Le schéma Prisma est dans `prisma/schema.prisma`
- Les routes API sont dans `app/api/`
- Les pages sont dans `app/`
- Les composants sont dans `components/`

