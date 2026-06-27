# Tableau de bord PE Sport (Classement EPS)

Application web pour les professeurs d'Éducation Physique et Sportive (EPS) au Maroc : suivi des progrès des élèves, gestion des classes et affichage d'un classement public. Conçue autour de la grille d'évaluation marocaine (domaines de connaissances procédurale, conceptuelle et comportementale).

## Fonctionnalités

- **Classement public** — Classements par domaine de connaissance (procédural, conceptuel, comportemental) avec podium et analyses IA en vedette
- **Tableau de bord professeur** — Espace protégé pour gérer les élèves, les classes et les fiches de progression
- **Notation EPS marocaine** — Familles d'activités (athlétisme, sports collectifs, gymnastique), sous-activités, critères d'évaluation et notation basée sur l'IAC
- **Assistant IA** (optionnel) — Propulsé par Anthropic Claude :
  - Saisie de progression en langage naturel
  - Analyse par élève
  - Rapports hebdomadaires de classe
  - Widget de chat intégré
- **Internationalisation** — Anglais, français et arabe (`next-intl`)
- **Thème sombre / clair**

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Langage | TypeScript |
| Interface | React 18, [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), icônes [Lucide](https://lucide.dev/) |
| Graphiques | [Recharts](https://recharts.org/) |
| Authentification | [NextAuth.js v5](https://authjs.dev/) (identifiants email/mot de passe) |
| Base de données | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| IA | [Anthropic Claude SDK](https://docs.anthropic.com/) (`claude-sonnet-4-6`, `claude-haiku-4-5`) |
| i18n | [next-intl](https://next-intl.dev/) |
| Validation | [Zod](https://zod.dev/) |
| Markdown | react-markdown (rendu des réponses IA) |
| Hachage des mots de passe | bcryptjs |
| Dates | date-fns |
| Linting | ESLint + eslint-config-next |
| Déploiement | Docker, [Railway](https://railway.app/) |

## Structure du projet

```
app/
  (auth)/login/          # Connexion professeur
  (dashboard)/dashboard/ # Tableau de bord protégé (élèves, progression, stats)
  leaderboard/           # Classement public
  api/                   # Routes API REST (élèves, classes, progression, IA, auth)
components/
  dashboard/             # UI du tableau de bord (sidebar, graphiques, formulaires, tableaux)
  leaderboard/           # UI du classement (podium, filtres, spotlight IA)
  ai/                    # Widget de chat IA et rendu markdown
  ui/                    # Composants UI partagés (bouton, carte, input, etc.)
lib/
  actions/               # Server actions (élèves, classes, progression)
  utils/                 # Helpers scoring, classement, statistiques
  ai/                    # Outils et prompts Claude
  constants/             # Catégories du classement
prisma/
  schema.prisma          # Schéma de la base de données
  seed.ts                # Données de démo + compte professeur
messages/                # Chaînes i18n (en, fr, ar)
```

## Prérequis

- Node.js 20+
- npm
- Docker (optionnel, pour PostgreSQL en local)
- Clé API Anthropic (optionnelle, pour les fonctionnalités IA)

## Démarrage

### 1. Installer les dépendances

```bash
npm install
# ou
make install
```

### 2. Configurer l'environnement

Copiez le fichier d'exemple et renseignez les valeurs :

```bash
cp .env.example .env
```

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Oui | Chaîne de connexion PostgreSQL |
| `AUTH_SECRET` | Oui | Secret de session (`openssl rand -base64 32`) |
| `NEXTAUTH_SECRET` | Oui | Identique à `AUTH_SECRET` pour NextAuth |
| `ANTHROPIC_API_KEY` | Non | Active les fonctionnalités IA |
| `AUTH_URL` | Production uniquement | URL publique de l'app (ex. `https://your-app.up.railway.app`) |

### 3. Démarrer la base de données

**Avec Docker (recommandé en local) :**

```bash
make db-up        # Démarre Postgres sur le port 5434
make db-setup     # db-up + schéma + données de démo
```

**Ou manuellement :**

```bash
make db-push      # Applique le schéma Prisma
npm run db:seed   # Insère les données de démo
```

### 4. Lancer le serveur de développement

```bash
npm run dev
# ou
make dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — l'application redirige vers `/leaderboard`.

### 5. Se connecter en tant que professeur

Après le seed, utilisez les identifiants définis dans `prisma/seed.ts` :

- **Email :** `Aya@sefyani.lakrizi`
- **Mot de passe :** `LAHCEN@AYA2026`

Les routes du tableau de bord (`/dashboard/*`) nécessitent une authentification.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Générer le client Prisma + build de production |
| `npm run start` | Démarrer le serveur de production |
| `npm run lint` | Lancer ESLint |
| `npm run db:push` | Pousser le schéma vers la base de données |
| `npm run db:seed` | Insérer les données de démo |
| `npm run db:studio` | Ouvrir Prisma Studio |
| `npm run railway:start` | Pousser le schéma puis démarrer (déploiement Railway) |

### Raccourcis Makefile

Exécutez `make help` pour la liste complète. Cibles courantes :

```bash
make db-setup       # Configuration locale initiale (DB + schéma + seed)
make env-check      # Vérifier que les variables d'environnement sont définies
make docker-build   # Construire l'image Docker
make docker-run     # Lancer le conteneur en local
```

## Routes API

| Route | Rôle |
|-------|------|
| `GET /api/health` | Vérification de santé (utilisée par Railway) |
| `POST /api/auth/[...nextauth]` | Authentification |
| `GET/POST /api/students` | Lister / créer des élèves |
| `GET/PATCH/DELETE /api/students/[id]` | CRUD élève |
| `GET/POST /api/classes` | Lister / créer des classes |
| `GET/PATCH/DELETE /api/classes/[id]` | CRUD classe |
| `GET/POST /api/progress` | Lister / créer des fiches de progression |
| `GET/PATCH/DELETE /api/progress/[id]` | CRUD fiche de progression |
| `POST /api/ai/parse-progress` | IA : convertir du langage naturel en fiche de progression |
| `POST /api/ai/analyze-student` | IA : analyse des performances d'un élève |
| `POST /api/ai/class-report` | IA : rapport hebdomadaire de classe (streaming) |
| `POST /api/ai/chat` | IA : chat intégré |
| `GET /api/leaderboard/insights` | IA : analyses en vedette du classement |

## Déploiement (Railway)

Le projet inclut un `Dockerfile` et un `railway.toml` pour le déploiement sur Railway.

**Important — variables sur le service WEB (Leaderbord_EPS), pas seulement Postgres :**

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://leaderbord.up.railway.app
ANTHROPIC_API_KEY=<optionnel>
```

**Seed automatique au déploiement :** le conteneur exécute `prisma db push` + `prisma db seed` (32 élèves) au démarrage. Si le seed échoue, `/api/health` le relance tant que la base est vide.

Après deploy, vérifiez : `https://votre-app.up.railway.app/api/health` → doit retourner `{"ok":true,"students":32,...}`

Pour désactiver le seed : `RUN_DB_SEED=false`

**Seed manuel depuis votre PC** (optionnel) — ajoutez l'URL Railway dans `.env` :

```bash
RAILWAY_DATABASE_URL="postgresql://postgres:...@....proxy.rlwy.net:12345/railway"
make db-seed-railway
```

Point de contrôle de santé : `/api/health`

## Modèle de données (aperçu)

- **User** — Professeurs et administrateurs (authentification par identifiants)
- **SchoolClass** — Groupes de classes avec nom/code uniques
- **Student** — Élèves liés à une classe, avec âge/genre/avatar optionnels
- **ProgressLog** — Entrées d'évaluation liées à la grille EPS marocaine (famille d'activité, sous-activité, domaine de connaissance, critères, score, semestre, etc.)

Consultez `prisma/schema.prisma` pour le schéma complet et les énumérations.

## Licence

Projet privé.
