# Guide de déploiement sur Vercel

## Solutions de base de données gratuites recommandées

### 🥇 Option 1 : Neon (Recommandé)
**Pourquoi :** PostgreSQL serverless, très rapide, généreux en gratuit, parfait pour Vercel

**Limites gratuites :**
- 0.5 GB de stockage
- 1 projet
- Pas de limite de temps
- Connexions illimitées

**Étapes :**
1. Aller sur https://neon.tech
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Copier la connection string (DATABASE_URL)
5. L'ajouter dans les variables d'environnement Vercel

**Avantages :**
- ✅ Serverless (s'endort après inactivité, se réveille automatiquement)
- ✅ Très rapide
- ✅ Interface moderne
- ✅ Compatible Prisma
- ✅ Pas de limite de temps sur le plan gratuit

---

### 🥈 Option 2 : Supabase
**Pourquoi :** PostgreSQL + beaucoup de fonctionnalités supplémentaires (auth, storage, etc.)

**Limites gratuites :**
- 500 MB de stockage
- 2 GB de bande passante/mois
- Pas de limite de temps

**Étapes :**
1. Aller sur https://supabase.com
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Aller dans Settings → Database
5. Copier la connection string (URI)
6. L'ajouter dans les variables d'environnement Vercel

**Avantages :**
- ✅ PostgreSQL complet
- ✅ Interface graphique pour la DB
- ✅ API REST automatique
- ✅ Compatible Prisma

---

### 🥉 Option 3 : Railway
**Pourquoi :** Simple et rapide à configurer

**Limites gratuites :**
- $5 de crédit gratuit/mois
- Suffisant pour un petit projet

**Étapes :**
1. Aller sur https://railway.app
2. Créer un compte
3. New Project → Database → PostgreSQL
4. Copier la DATABASE_URL
5. L'ajouter dans les variables d'environnement Vercel

---

## Configuration pour Vercel

### Étape 1 : Préparer le projet

1. Créer un compte sur Vercel : https://vercel.com
2. Installer Vercel CLI (optionnel) :
```bash
npm i -g vercel
```

### Étape 2 : Créer la base de données

Choisissez une des options ci-dessus (Neon recommandé) et récupérez votre `DATABASE_URL`.

### Étape 3 : Configurer Prisma pour la production

Le fichier `prisma/schema.prisma` est déjà configuré. Assurez-vous que la connection pooling est activée si vous utilisez Neon ou Supabase.

**Pour Neon :** La connection string inclut déjà le pooling.
**Pour Supabase :** Utilisez la connection string avec `?pgbouncer=true` ou la connection pooler.

### Étape 4 : Déployer sur Vercel

#### Option A : Via l'interface Vercel (Recommandé)

1. Pousser votre code sur GitHub/GitLab/Bitbucket
2. Aller sur https://vercel.com/new
3. Importer votre repository
4. Vercel détectera automatiquement Next.js
5. Ajouter les variables d'environnement :
   - `DATABASE_URL` : Votre connection string de la DB
   - `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
   - `NEXTAUTH_URL` : Votre URL Vercel (ex: `https://votre-projet.vercel.app`)
   - `DISCORD_CLIENT_ID` : Votre Client ID Discord
   - `DISCORD_CLIENT_SECRET` : Votre Client Secret Discord
6. Cliquer sur "Deploy"

#### Option B : Via CLI

```bash
# Se connecter à Vercel
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DISCORD_CLIENT_ID
vercel env add DISCORD_CLIENT_SECRET

# Déployer en production
vercel --prod
```

### Étape 5 : Configurer les Build Commands

Vercel devrait détecter automatiquement, mais si besoin, ajoutez dans les settings :

**Build Command :** `npm run build`
**Install Command :** `npm install`
**Output Directory :** `.next`

### Étape 6 : Initialiser la base de données

Après le déploiement, vous devez initialiser la base de données :

```bash
# Option 1 : Via Vercel CLI
vercel env pull .env.local
npx prisma db push
npm run init:roles

# Option 2 : Via un script de déploiement (voir vercel.json)
```

### Étape 7 : Mettre à jour Discord OAuth

1. Aller sur https://discord.com/developers/applications
2. Aller dans votre application → OAuth2
3. Ajouter une nouvelle Redirect URI : `https://votre-projet.vercel.app/api/auth/callback/discord`
4. Sauvegarder

---

## Configuration automatique avec vercel.json

Un fichier `vercel.json` peut être créé pour automatiser certaines tâches.

---

## Notes importantes

- ✅ Vercel supporte nativement Next.js et Prisma
- ✅ Les variables d'environnement sont sécurisées
- ✅ Les migrations Prisma peuvent être exécutées via un script de build
- ⚠️ Pour Neon : La connection string inclut déjà le pooling
- ⚠️ Pour Supabase : Utilisez la connection pooler pour de meilleures performances
- ⚠️ NEXTAUTH_URL doit correspondre à votre domaine Vercel

---

## Commandes utiles après déploiement

```bash
# Voir les logs
vercel logs

# Ouvrir le dashboard
vercel dashboard

# Redéployer
vercel --prod
```

