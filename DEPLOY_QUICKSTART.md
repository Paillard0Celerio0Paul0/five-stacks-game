# 🚀 Guide rapide : Déploiement sur Vercel

## Étape 1 : Créer la base de données (5 minutes)

### Option recommandée : Neon

1. Aller sur **https://neon.tech**
2. Cliquer sur "Sign Up" (gratuit)
3. Créer un nouveau projet
4. **Copier la connection string** (elle ressemble à : `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
5. ⚠️ **Important** : Si vous voyez deux connection strings, utilisez celle avec "pooler" ou "pool"

---

## Étape 2 : Préparer Discord OAuth

1. Aller sur **https://discord.com/developers/applications**
2. Sélectionner votre application
3. Aller dans **OAuth2** → **General**
4. Dans **Redirects**, ajouter :
   - `http://localhost:3000/api/auth/callback/discord` (pour le dev local)
   - `https://votre-projet.vercel.app/api/auth/callback/discord` (vous l'ajouterez après le déploiement)

---

## Étape 3 : Déployer sur Vercel

### Méthode 1 : Via GitHub (Recommandé)

1. **Pousser votre code sur GitHub** :
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-username/five-stacks-game.git
git push -u origin main
```

2. **Aller sur Vercel** :
   - https://vercel.com/new
   - Cliquer sur "Import Project"
   - Sélectionner votre repository GitHub
   - Vercel détectera automatiquement Next.js

3. **Configurer les variables d'environnement** dans Vercel :
   - `DATABASE_URL` → Votre connection string Neon
   - `NEXTAUTH_SECRET` → Générer avec : `openssl rand -base64 32`
   - `NEXTAUTH_URL` → Laisser vide pour l'instant (Vercel l'ajoutera automatiquement)
   - `DISCORD_CLIENT_ID` → Votre Client ID Discord
   - `DISCORD_CLIENT_SECRET` → Votre Client Secret Discord

4. **Cliquer sur "Deploy"**

5. **Attendre la fin du déploiement** (2-3 minutes)

6. **Après le déploiement** :
   - Vercel vous donnera une URL (ex: `https://five-stacks-game.vercel.app`)
   - Mettre à jour `NEXTAUTH_URL` dans Vercel avec cette URL
   - Ajouter cette URL dans Discord OAuth Redirects

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
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

---

## Étape 4 : Initialiser la base de données

Après le premier déploiement, vous devez initialiser les rôles dans la base de données.

### Option A : Via l'interface web (Le plus simple) ⭐

1. Aller sur votre site Vercel déployé
2. Se connecter avec Discord
3. Ouvrir cette URL dans votre navigateur : `https://votre-projet.vercel.app/api/admin/init-roles`
4. Ou faire une requête POST (via Postman, curl, ou un bouton sur votre site)
5. Les rôles seront créés automatiquement

**Via curl :**
```bash
curl -X POST https://votre-projet.vercel.app/api/admin/init-roles
```

### Option B : Via Vercel CLI

```bash
# Récupérer les variables d'environnement
vercel env pull .env.local

# Initialiser la base de données
npx prisma db push
npm run init:roles
```

### Option C : Via Prisma Studio

```bash
vercel env pull .env.local
npx prisma studio
# Créer manuellement les rôles via l'interface
```

---

## Étape 5 : Vérifier que tout fonctionne

1. Aller sur votre URL Vercel
2. Cliquer sur "Se connecter avec Discord"
3. Tester la création d'un lobby

---

## 🔧 Résolution de problèmes

### Erreur "Prisma Client not generated"
- Le script `postinstall.js` devrait le faire automatiquement
- Sinon, dans Vercel → Settings → Build & Development Settings, ajouter :
  - Build Command : `prisma generate && next build`

### Erreur de connexion à la base de données
- Vérifier que la `DATABASE_URL` est correcte
- Pour Neon, utiliser la connection string avec "pooler"
- Vérifier que la base de données est active (Neon peut s'endormir)

### Erreur NextAuth
- Vérifier que `NEXTAUTH_URL` correspond à votre domaine Vercel
- Vérifier que `NEXTAUTH_SECRET` est défini
- Vérifier que les Redirect URIs Discord sont correctes

---

## 📝 Checklist finale

- [ ] Base de données créée (Neon/Supabase)
- [ ] Code poussé sur GitHub
- [ ] Projet déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Discord OAuth configuré avec l'URL Vercel
- [ ] Base de données initialisée (rôles créés)
- [ ] Test de connexion Discord réussi
- [ ] Test de création de lobby réussi

---

## 🎉 C'est prêt !

Votre application est maintenant en ligne et accessible publiquement.

