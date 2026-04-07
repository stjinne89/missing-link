import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAdapter } from "@/lib/integrations/adapters";

/** GET /api/integrations/strava/callback — handle OAuth callback from Strava */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/integrations/strava/callback`;

  const session = await getSession();
  if (!session?.id) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    const msg = error === "access_denied" ? "Strava koppeling geweigerd" : "Koppeling mislukt";
    return NextResponse.redirect(
      `${baseUrl}/integrations?error=${encodeURIComponent(msg)}`
    );
  }

  try {
    const adapter = getAdapter("strava");

    // Exchange code for tokens
    const tokens = await adapter.handleCallback(code, redirectUri);

    // Fetch sport data
    const sportData = await adapter.fetchProfile(tokens.accessToken);

    // Save to database
    await prisma.sportProfile.upsert({
      where: { userId_provider: { userId: session.id, provider: "strava" } },
      create: {
        userId: session.id,
        provider: "strava",
        providerUserId: tokens.providerUserId ?? null,
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
        providerUserId: tokens.providerUserId ?? undefined,
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

    return NextResponse.redirect(`${baseUrl}/integrations?success=strava`);
  } catch (err) {
    console.error("Strava callback error:", err);
    // Stuur volledige foutmelding mee zodat we kunnen debuggen
    const msg = err instanceof Error ? err.message : "Koppeling mislukt";
    return NextResponse.redirect(
      `${baseUrl}/integrations?error=${encodeURIComponent(msg)}`
    );
  }
}
