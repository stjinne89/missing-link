import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseCSV, haversineDistance } from "@/lib/utils";

/** GET /api/users/[id] — fetch another user's public profile */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { sportProfiles: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  // Get current user for distance calculation
  const currentUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { latitude: true, longitude: true },
  });

  const distance = haversineDistance(
    currentUser?.latitude ?? 52.0,
    currentUser?.longitude ?? 5.0,
    user.latitude ?? 52.0,
    user.longitude ?? 5.0
  );

  const sportProfile = user.sportProfiles[0] ?? null;

  return NextResponse.json({
    id: user.id,
    name: user.name,
    age: user.age,
    city: user.city,
    bio: user.bio,
    gender: user.gender,
    photoUrl: user.photoUrl,
    modes: parseCSV(user.modes),
    disciplines: parseCSV(user.disciplines),
    experience: user.experience,
    preferredDistance: user.preferredDistance,
    preferredDays: parseCSV(user.preferredDays),
    ridePref: parseCSV(user.ridePref),
    goals: parseCSV(user.goals),
    region: user.region,
    distance,
    sportStats: sportProfile
      ? {
          provider: sportProfile.provider,
          avgSpeed: sportProfile.avgSpeed,
          avgDistance: sportProfile.avgDistance,
          avgDuration: sportProfile.avgDuration,
          avgElevation: sportProfile.avgElevation,
          weeklyRides: sportProfile.weeklyRides,
          totalDistance: sportProfile.totalDistance,
          totalRides: sportProfile.totalRides,
          recentActivities: sportProfile.recentActivities
            ? JSON.parse(sportProfile.recentActivities)
            : [],
          lastSyncAt: sportProfile.lastSyncAt?.toISOString() ?? null,
        }
      : null,
  });
}
