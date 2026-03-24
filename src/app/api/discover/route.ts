import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseCSV, haversineDistance } from "@/lib/utils";
import { calculateMatchScore, applyFilters } from "@/lib/matching/engine";

/** GET /api/discover?mode=dating&discipline=gravel&maxDistance=50 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = (searchParams.get("mode") || "dating") as "dating" | "ride";
  const discipline = searchParams.get("discipline") || undefined;
  const maxDistance = Number(searchParams.get("maxDistance")) || 100;
  const minSpeed = Number(searchParams.get("minSpeed")) || 0;
  const maxSpeed = Number(searchParams.get("maxSpeed")) || 50;

  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: { sportProfiles: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  // Get all other users who are active in the requested mode
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: currentUser.id },
      onboardingComplete: true,
      modes: { contains: mode },
    },
    include: { sportProfiles: true },
  });

  // Get existing likes to exclude already-liked profiles
  const existingLikes = await prisma.like.findMany({
    where: { fromId: currentUser.id, mode },
    select: { toId: true },
  });
  const likedIds = new Set(existingLikes.map((l) => l.toId));

  const userSport = currentUser.sportProfiles[0];
  const userLat = currentUser.latitude ?? 52.0;
  const userLng = currentUser.longitude ?? 5.0;

  // Transform candidates with distance and match score
  let results = candidates
    .filter((c) => !likedIds.has(c.id))
    .map((c) => {
      const candSport = c.sportProfiles[0];
      const distance = haversineDistance(
        userLat, userLng,
        c.latitude ?? 52.0, c.longitude ?? 5.0
      );

      const matchScore = calculateMatchScore(
        {
          id: currentUser.id,
          modes: parseCSV(currentUser.modes),
          disciplines: parseCSV(currentUser.disciplines),
          experience: currentUser.experience,
          avgSpeed: userSport?.avgSpeed ?? null,
          preferredDays: parseCSV(currentUser.preferredDays),
          goals: parseCSV(currentUser.goals),
          gender: currentUser.gender,
          genderPref: currentUser.genderPref,
        },
        {
          id: c.id,
          modes: parseCSV(c.modes),
          disciplines: parseCSV(c.disciplines),
          experience: c.experience,
          avgSpeed: candSport?.avgSpeed ?? null,
          preferredDays: parseCSV(c.preferredDays),
          goals: parseCSV(c.goals),
          gender: c.gender,
          genderPref: c.genderPref,
          distance,
        },
        mode
      );

      return {
        id: c.id,
        name: c.name,
        age: c.age,
        city: c.city,
        bio: c.bio,
        gender: c.gender,
        photoUrl: c.photoUrl,
        modes: parseCSV(c.modes),
        disciplines: parseCSV(c.disciplines),
        experience: c.experience,
        preferredDistance: c.preferredDistance,
        preferredDays: parseCSV(c.preferredDays),
        ridePref: parseCSV(c.ridePref),
        goals: parseCSV(c.goals),
        region: c.region,
        distance,
        matchScore,
        sportStats: candSport
          ? {
              provider: candSport.provider,
              avgSpeed: candSport.avgSpeed,
              avgDistance: candSport.avgDistance,
              avgDuration: candSport.avgDuration,
              avgElevation: candSport.avgElevation,
              weeklyRides: candSport.weeklyRides,
              totalDistance: candSport.totalDistance,
              totalRides: candSport.totalRides,
              recentActivities: candSport.recentActivities
                ? JSON.parse(candSport.recentActivities)
                : [],
              lastSyncAt: candSport.lastSyncAt?.toISOString() ?? null,
            }
          : null,
      };
    });

  // Apply filters
  results = applyFilters(
    results.map((r) => ({
      ...r,
      avgSpeed: r.sportStats?.avgSpeed ?? null,
    })),
    { mode, discipline: discipline as any, maxDistance, minSpeed, maxSpeed }
  ) as typeof results;

  // Sort by match score
  results.sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({ profiles: results });
}
