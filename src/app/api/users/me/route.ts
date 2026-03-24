import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseCSV } from "@/lib/utils";

/** GET /api/users/me — fetch current user profile + sport data */
export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { sportProfiles: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  const sportProfile = user.sportProfiles[0] ?? null;

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    city: user.city,
    bio: user.bio,
    gender: user.gender,
    genderPref: user.genderPref,
    photoUrl: user.photoUrl,
    modes: parseCSV(user.modes),
    disciplines: parseCSV(user.disciplines),
    experience: user.experience,
    preferredDistance: user.preferredDistance,
    preferredDays: parseCSV(user.preferredDays),
    ridePref: parseCSV(user.ridePref),
    goals: parseCSV(user.goals),
    region: user.region,
    latitude: user.latitude,
    longitude: user.longitude,
    onboardingComplete: user.onboardingComplete,
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

/** PATCH /api/users/me — update profile (onboarding + settings) */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await req.json();

  // Build update object, converting arrays to CSV strings
  const update: Record<string, unknown> = {};

  const directFields = [
    "name", "age", "city", "bio", "gender", "genderPref",
    "photoUrl", "experience", "preferredDistance", "region",
    "latitude", "longitude", "onboardingComplete",
    "showDatingMode", "showRideMode", "showExactCity",
  ];

  for (const field of directFields) {
    if (body[field] !== undefined) update[field] = body[field];
  }

  // Array fields → CSV
  const arrayFields = ["modes", "disciplines", "preferredDays", "ridePref", "goals"];
  for (const field of arrayFields) {
    if (Array.isArray(body[field])) {
      update[field] = body[field].join(",");
    }
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: update,
  });

  return NextResponse.json({ success: true, id: user.id });
}
