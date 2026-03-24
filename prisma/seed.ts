import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MOCK_USERS = [
  {
    email: "sophie@test.nl",
    name: "Sophie",
    age: 28,
    city: "Utrecht",
    bio: "Gravelfanaat die net zo hard op een terras kan zitten als trappen. Zoek iemand die daar ook van houdt.",
    gender: "Vrouw",
    genderPref: "Man",
    modes: "dating,ride",
    disciplines: "gravel,road",
    experience: "Ervaren",
    preferredDistance: "50-80 km",
    preferredDays: "Za,Zo,Wo",
    ridePref: "Duo,Groep",
    goals: "Liefde,Fietsmaatjes",
    latitude: 52.0907,
    longitude: 5.1214,
    region: "Utrecht",
    sport: { avgSpeed: 28.4, avgDistance: 62, avgDuration: 135, weeklyRides: 4, totalDistance: 8200, avgElevation: 340 },
  },
  {
    email: "lars@test.nl",
    name: "Lars",
    age: 31,
    city: "Amersfoort",
    bio: "Racefiets addict. Elke zaterdag 100+ km. Zoek iemand die het wiel kan houden.",
    gender: "Man",
    genderPref: null,
    modes: "ride",
    disciplines: "road",
    experience: "Expert",
    preferredDistance: "80-120 km",
    preferredDays: "Za,Zo,Di,Do",
    ridePref: "Duo,Groep",
    goals: "Trainingsmaatjes,Groepsritten",
    latitude: 52.1561,
    longitude: 5.3878,
    region: "Utrecht",
    sport: { avgSpeed: 32.1, avgDistance: 95, avgDuration: 180, weeklyRides: 5, totalDistance: 14200, avgElevation: 520 },
  },
  {
    email: "emma@test.nl",
    name: "Emma",
    age: 26,
    city: "Amsterdam",
    bio: "Mountainbike in het weekend, gravelpad door de week. Op zoek naar iemand om mee te ontdekken.",
    gender: "Vrouw",
    genderPref: "Man",
    modes: "dating",
    disciplines: "mtb,gravel",
    experience: "Gevorderd",
    preferredDistance: "30-60 km",
    preferredDays: "Za,Zo",
    ridePref: "Duo",
    goals: "Liefde,Casual ritten",
    latitude: 52.3676,
    longitude: 4.9041,
    region: "Noord-Holland",
    sport: { avgSpeed: 24.2, avgDistance: 42, avgDuration: 110, weeklyRides: 3, totalDistance: 4100, avgElevation: 280 },
  },
  {
    email: "thomas@test.nl",
    name: "Thomas",
    age: 34,
    city: "Arnhem",
    bio: "Bikepacking-vet. Droomt van de Transcontinental Race. Zoek gelijkgestemden voor overnachtingsritten.",
    gender: "Man",
    genderPref: null,
    modes: "ride",
    disciplines: "bikepacking,road,gravel",
    experience: "Expert",
    preferredDistance: "100+ km",
    preferredDays: "Za,Zo",
    ridePref: "Duo,Groep",
    goals: "Fietsmaatjes,Trainingsmaatjes",
    latitude: 51.985,
    longitude: 5.8987,
    region: "Gelderland",
    sport: { avgSpeed: 26.8, avgDistance: 110, avgDuration: 300, weeklyRides: 3, totalDistance: 18500, avgElevation: 620 },
  },
  {
    email: "lisa@test.nl",
    name: "Lisa",
    age: 29,
    city: "Den Bosch",
    bio: "Net begonnen met racefiets, op zoek naar gezellige trainingsmaten die geduld hebben 😅",
    gender: "Vrouw",
    genderPref: "Man",
    modes: "ride,dating",
    disciplines: "road,recreational",
    experience: "Beginner",
    preferredDistance: "20-40 km",
    preferredDays: "Za,Zo,Wo",
    ridePref: "Duo,Groep",
    goals: "Fietsmaatjes,Casual ritten",
    latitude: 51.6978,
    longitude: 5.3037,
    region: "Noord-Brabant",
    sport: { avgSpeed: 22.3, avgDistance: 28, avgDuration: 75, weeklyRides: 2, totalDistance: 1200, avgElevation: 80 },
  },
  {
    email: "daan@test.nl",
    name: "Daan",
    age: 27,
    city: "Eindhoven",
    bio: "Gravel is leven. Als het modderig is, is het goed. Zoek een partner in crime (en in de modder).",
    gender: "Man",
    genderPref: "Vrouw",
    modes: "dating,ride",
    disciplines: "gravel,mtb",
    experience: "Ervaren",
    preferredDistance: "40-70 km",
    preferredDays: "Za,Zo,Vr",
    ridePref: "Duo",
    goals: "Liefde,Fietsmaatjes",
    latitude: 51.4416,
    longitude: 5.4697,
    region: "Noord-Brabant",
    sport: { avgSpeed: 25.6, avgDistance: 55, avgDuration: 140, weeklyRides: 4, totalDistance: 7800, avgElevation: 380 },
  },
  {
    email: "floor@test.nl",
    name: "Floor",
    age: 25,
    city: "Groningen",
    bio: "Woon-werkfietser die ontdekte dat wielrennen eigenlijk best leuk is. Nu twee fietsen en een probleem.",
    gender: "Vrouw",
    genderPref: "Iedereen",
    modes: "dating,ride",
    disciplines: "road,commute",
    experience: "Gevorderd",
    preferredDistance: "30-50 km",
    preferredDays: "Za,Zo,Di",
    ridePref: "Duo",
    goals: "Liefde,Fietsmaatjes,Casual ritten",
    latitude: 53.2194,
    longitude: 6.5665,
    region: "Groningen",
    sport: { avgSpeed: 26.1, avgDistance: 38, avgDuration: 90, weeklyRides: 3, totalDistance: 3200, avgElevation: 45 },
  },
  {
    email: "mark@test.nl",
    name: "Mark",
    age: 38,
    city: "Maastricht",
    bio: "Limburgs klimgeit. Elke heuvel is een kans. Cauberg is mijn achtertuin. Zoek serieuze trainingspartners.",
    gender: "Man",
    genderPref: null,
    modes: "ride",
    disciplines: "road",
    experience: "Pro",
    preferredDistance: "80-120 km",
    preferredDays: "Za,Zo,Di,Do",
    ridePref: "Duo,Groep",
    goals: "Trainingsmaatjes,Groepsritten",
    latitude: 50.8514,
    longitude: 5.6910,
    region: "Limburg",
    sport: { avgSpeed: 30.5, avgDistance: 88, avgDuration: 170, weeklyRides: 5, totalDistance: 22000, avgElevation: 890 },
  },
];

async function main() {
  console.log("🌱 Seeding Missing Link database...\n");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.ridePlan.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.sportProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("test1234", 12);

  for (const data of MOCK_USERS) {
    const { sport, ...userData } = data;

    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        onboardingComplete: true,
      },
    });

    // Create sport profile with mock Strava data
    await prisma.sportProfile.create({
      data: {
        userId: user.id,
        provider: "strava",
        avgSpeed: sport.avgSpeed,
        avgDistance: sport.avgDistance,
        avgDuration: sport.avgDuration,
        weeklyRides: sport.weeklyRides,
        totalDistance: sport.totalDistance,
        avgElevation: sport.avgElevation,
        totalRides: Math.floor(sport.totalDistance / sport.avgDistance),
        recentActivities: JSON.stringify([
          {
            name: "Ochtendrit",
            distance: (sport.avgDistance * (0.8 + Math.random() * 0.4)).toFixed(1),
            speed: (sport.avgSpeed * (0.95 + Math.random() * 0.1)).toFixed(1),
            date: new Date(Date.now() - 86400000).toISOString(),
            elevation: Math.floor(sport.avgElevation * (0.7 + Math.random() * 0.6)),
          },
          {
            name: "Weekendtocht",
            distance: (sport.avgDistance * (1.0 + Math.random() * 0.5)).toFixed(1),
            speed: (sport.avgSpeed * (0.9 + Math.random() * 0.15)).toFixed(1),
            date: new Date(Date.now() - 86400000 * 3).toISOString(),
            elevation: Math.floor(sport.avgElevation * (0.8 + Math.random() * 0.8)),
          },
        ]),
        lastSyncAt: new Date(),
      },
    });

    console.log(`  ✅ ${user.name} (${user.city}) — ${userData.modes}`);
  }

  // Create a demo user for login
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@missinglink.nl",
      name: "Demo",
      age: 30,
      city: "Assen",
      bio: "Demo account — probeer alle features uit!",
      gender: "Man",
      genderPref: "Iedereen",
      modes: "dating,ride",
      disciplines: "road,gravel",
      experience: "Ervaren",
      preferredDistance: "50-80 km",
      preferredDays: "Za,Zo,Wo",
      ridePref: "Duo,Groep",
      goals: "Liefde,Fietsmaatjes,Trainingsmaatjes",
      latitude: 52.9925,
      longitude: 6.5625,
      region: "Drenthe",
      passwordHash,
      onboardingComplete: true,
    },
  });

  await prisma.sportProfile.create({
    data: {
      userId: demoUser.id,
      provider: "strava",
      avgSpeed: 27.5,
      avgDistance: 58,
      avgDuration: 120,
      weeklyRides: 3,
      totalDistance: 5400,
      avgElevation: 120,
      totalRides: 93,
      lastSyncAt: new Date(),
    },
  });

  console.log(`\n  🌟 Demo account: demo@missinglink.nl / test1234\n`);
  console.log("✅ Seed complete!\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
