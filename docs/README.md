# 🔗 Missing Link — Vind jouw perfecte fietspartner

Missing Link is een matching-app voor fietsers. Combineer **Dating** en **Ride/BFF** om liefde of fietsmaatjes te vinden op basis van discipline, tempo, niveau en locatie.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Auth:** NextAuth v5
- **State:** Zustand
- **Validation:** Zod

## Snel starten

### Vereisten

- Node.js 18+ (aanbevolen: 20+)
- npm of pnpm

### Installatie

```bash
# 1. Clone of kopieer het project
cd missing-link

# 2. Installeer dependencies
npm install

# 3. Kopieer environment variabelen
cp .env.example .env.local
# (default .env.local werkt out-of-the-box met SQLite)

# 4. Initialiseer de database
npx prisma generate
npx prisma db push

# 5. Seed de database met testdata
npx tsx prisma/seed.ts

# 6. Start de development server
npm run dev
```

### Open de app

Open [http://localhost:3000](http://localhost:3000)

**Demo account:** `demo@missinglink.nl` / `test1234`

## Project structuur

```
missing-link/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Testdata
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login + Register pagina's
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/          # Authenticated pagina's met bottom nav
│   │   │   ├── discover/    # Swipe/ontdek feed
│   │   │   ├── matches/     # Match overzicht
│   │   │   ├── chat/        # Chat per match
│   │   │   └── profile/     # Eigen profiel
│   │   ├── onboarding/      # Onboarding wizard
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth + registratie
│   │   │   ├── discover/    # Discovery + matching
│   │   │   ├── matches/     # Like/match systeem
│   │   │   ├── chat/        # Berichten
│   │   │   └── integrations/ # Strava/Garmin/Wahoo
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── ui/              # Button, Input, Avatar, Badge, etc.
│   │   ├── cards/           # ProfileCard
│   │   └── layout/          # BottomNav
│   ├── config/
│   │   └── constants.ts     # Disciplines, kleuren, matching weights
│   ├── hooks/
│   │   └── use-app-store.ts # Zustand store
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuratie
│   │   ├── db.ts            # Prisma client
│   │   ├── integrations/
│   │   │   └── adapters.ts  # Strava/Garmin/Wahoo adapters
│   │   ├── matching/
│   │   │   └── engine.ts    # Match scoring algoritme
│   │   └── utils/
│   │       └── index.ts     # Helpers (cn, haversine, etc.)
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   └── middleware.ts         # Auth middleware
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Belangrijke features

### Twee modi
- **💕 Dating** — romantische matches via fietsen
- **🚴 Ride/BFF** — fietsmaatjes zoeken

Gebruikers kiezen tijdens onboarding of ze één of beide modi willen gebruiken. De hele app — discover, matches, chat — filtert per modus.

### Matching engine
Het matchingalgoritme (`src/lib/matching/engine.ts`) berekent een score (0-100) op basis van:
- Discipline overlap (15 per match)
- Ervaringsniveau verschil (max 20)
- Snelheidscompatibiliteit (max 20)
- Beschikbaarheid overlap (5 per dag)
- Afstand/nabijheid (max 15)
- Gedeelde doelen (5 per match)
- Geslachtsvoorkeur (dating modus)

### Sport integraties
Adapter pattern in `src/lib/integrations/adapters.ts`:
- **MockAdapter** — draait standaard, retourneert demo-data
- **StravaAdapter** — placeholder met commented-out OAuth code
- **GarminAdapter** — placeholder
- **WahooAdapter** — placeholder

Alle adapters delen dezelfde interface. Swap mock voor echt door de TODO's in te vullen.

### API endpoints

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| POST | `/api/auth/register` | Account aanmaken |
| GET | `/api/users/me` | Eigen profiel ophalen |
| PATCH | `/api/users/me` | Profiel updaten |
| GET | `/api/discover` | Fietsers ontdekken (met filters) |
| GET | `/api/matches` | Alle matches ophalen |
| POST | `/api/matches` | Like sturen (+ auto-match check) |
| GET | `/api/chat?matchId=x` | Berichten ophalen |
| POST | `/api/chat` | Bericht sturen |
| GET | `/api/integrations` | Gekoppelde platformen |
| POST | `/api/integrations` | Platform koppelen |

## Database

### Ontwikkeling (SQLite)
De standaard `.env.local` gebruikt SQLite. Geen extra setup nodig.

```bash
npx prisma db push    # Schema toepassen
npx tsx prisma/seed.ts # Testdata laden
npx prisma studio     # Database GUI openen
```

### Productie (PostgreSQL)
Wijzig in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

En in `.env.local`:
```
DATABASE_URL="postgresql://user:pass@host:5432/missinglink"
```

Dan:
```bash
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

## Volgende stappen

### Korte termijn
1. **Strava OAuth** — echte koppeling implementeren
2. **Foto uploads** — profielfoto's via S3/Cloudflare R2
3. **WebSocket chat** — realtime berichten (Socket.io of Ably)
4. **Profiel detail pagina** — volledige profielweergave bij klik
5. **Rit planning** — persistente ritvoorstellen in database

### Middellange termijn
6. **Geolocation** — browser GPS + PostGIS queries
7. **Push notifications** — nieuwe matches en berichten
8. **Garmin/Wahoo integratie** — echte API koppelingen
9. **Route integratie** — Komoot/Google Maps voor routes
10. **Swipe animaties** — Framer Motion gestures

### Lange termijn
11. **AI matching** — gewichten optimaliseren op basis van succesvolle matches
12. **Groepsritten** — meerdere deelnemers per rit
13. **Events** — georganiseerde groepsritten
14. **Premium features** — betaald abonnement
15. **React Native app** — native mobiele app
16. **Verificatie** — identiteitsverificatie voor veiligheid

## Deployment

### Vercel (aanbevolen)
```bash
npm install -g vercel
vercel
```

Stel environment variables in via het Vercel dashboard.

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Licentie
Proprietary — Missing Link
