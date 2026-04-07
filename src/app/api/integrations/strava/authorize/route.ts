import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdapter } from "@/lib/integrations/adapters";

/** GET /api/integrations/strava/authorize — redirect user to Strava OAuth */
export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/integrations/strava/callback`;

  try {
    const adapter = getAdapter("strava");
    const url = adapter.authorizeUrl(redirectUri);
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.redirect(
      `${baseUrl}/profile?error=${encodeURIComponent(msg)}`
    );
  }
}
