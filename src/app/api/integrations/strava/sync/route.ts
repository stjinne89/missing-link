import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAdapter } from "@/lib/integrations/adapters";

/** POST /api/integrations/strava/sync — refresh data from Strava */
export async function POST() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const profile = await prisma.sportProfile.findUnique({
    where: { userId_provider: { userId: session.id, provider: "strava" } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Strava niet gekoppeld" }, { status: 404 });
  }

  const adapter = getAdapter("strava");
  let accessToken = profile.accessToken!;

  // Refresh token if expired
  if (profile.tokenExpiresAt && profile.tokenExpiresAt < new Date()) {
    const refreshed = await adapter.refreshAccessToken(profile.refreshToken!);
    accessToken = refreshed.accessToken;
    await prisma.sportProfile.update({
      where: { id: profile.id },
      data: { accessToken, tokenExpiresAt: refreshed.expiresAt },
    });
  }

  const sportData = await adapter.fetchProfile(accessToken);

  const updated = await prisma.sportProfile.update({
    where: { id: profile.id },
    data: {
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
    integration: {
      avgSpeed: updated.avgSpeed,
      avgDistance: updated.avgDistance,
      avgDuration: updated.avgDuration,
      weeklyRides: updated.weeklyRides,
      totalDistance: updated.totalDistance,
      lastSyncAt: updated.lastSyncAt?.toISOString(),
    },
  });
}
