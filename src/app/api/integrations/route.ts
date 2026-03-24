import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAdapter } from "@/lib/integrations/adapters";

/** POST /api/integrations — connect a sport platform (mock for now) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { provider } = await req.json();

  if (!["strava", "garmin", "wahoo"].includes(provider)) {
    return NextResponse.json({ error: "Onbekende provider" }, { status: 400 });
  }

  const adapter = getAdapter(provider);

  try {
    // Mock: directly fetch profile data (real flow would use OAuth callback)
    const tokens = await adapter.handleCallback("mock_code");
    const sportData = await adapter.fetchProfile(tokens.accessToken);

    // Upsert sport profile
    const sportProfile = await prisma.sportProfile.upsert({
      where: {
        userId_provider: {
          userId: session.id,
          provider,
        },
      },
      create: {
        userId: session.id,
        provider,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        avgSpeed: sportData.avgSpeed,
        avgDistance: sportData.avgDistance,
        avgDuration: sportData.avgDuration,
        avgElevation: sportData.avgElevation,
        weeklyRides: sportData.weeklyRides,
        totalDistance: sportData.totalDistance,
        totalRides: sportData.totalRides,
        recentActivities: JSON.stringify(sportData.recentActivities),
        lastSyncAt: new Date(),
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        avgSpeed: sportData.avgSpeed,
        avgDistance: sportData.avgDistance,
        avgDuration: sportData.avgDuration,
        avgElevation: sportData.avgElevation,
        weeklyRides: sportData.weeklyRides,
        totalDistance: sportData.totalDistance,
        totalRides: sportData.totalRides,
        recentActivities: JSON.stringify(sportData.recentActivities),
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      provider,
      stats: {
        avgSpeed: sportProfile.avgSpeed,
        avgDistance: sportProfile.avgDistance,
        avgDuration: sportProfile.avgDuration,
        avgElevation: sportProfile.avgElevation,
        weeklyRides: sportProfile.weeklyRides,
        totalDistance: sportProfile.totalDistance,
      },
    });
  } catch (err) {
    console.error(`Integration error (${provider}):`, err);
    return NextResponse.json(
      { error: "Koppeling mislukt" },
      { status: 500 }
    );
  }
}

/** GET /api/integrations — list connected integrations */
export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const profiles = await prisma.sportProfile.findMany({
    where: { userId: session.id },
    select: {
      provider: true,
      avgSpeed: true,
      avgDistance: true,
      avgDuration: true,
      avgElevation: true,
      weeklyRides: true,
      totalDistance: true,
      totalRides: true,
      lastSyncAt: true,
    },
  });

  return NextResponse.json({ integrations: profiles });
}
