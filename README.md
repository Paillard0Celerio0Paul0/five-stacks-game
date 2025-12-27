# Five Stacks Game

Système de lobby et attribution de rôles pour League of Legends avec authentification Discord.

## Fonctionnalités

- 🔐 Authentification Discord OAuth
- 🎮 Création et gestion de lobbies (5 joueurs)
- 🎲 Attribution aléatoire de rôles avec probabilités
- ✅ Système de vote post-partie
- 👑 Validation admin des rôles
- 🏆 Système de points (max 7 points par partie)

## Technologies

- Next.js 14+ (App Router)
- NextAuth.js v5 (Discord OAuth)
- Prisma + PostgreSQL
- TypeScript
- Tailwind CSS

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

3. Configurer votre base de données PostgreSQL dans `.env`

4. Générer le client Prisma :
```bash
npm run db:generate
```

5. Créer la base de données :
```bash
npm run db:push
```

6. Lancer le serveur de développement :
```bash
npm run dev
```

## Configuration Discord OAuth

1. Aller sur https://discord.com/developers/applications
2. Créer une nouvelle application
3. Dans "OAuth2", ajouter une redirection : `http://localhost:3000/api/auth/callback/discord`
4. Copier le Client ID et Client Secret dans `.env`

## Structure du projet

- `app/` - Pages et routes API Next.js
- `components/` - Composants React
- `lib/` - Utilitaires et logique métier
- `prisma/` - Schéma de base de données
- `types/` - Types TypeScript

