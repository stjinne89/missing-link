// =============================================================================
// Missing Link — Sport Integration Adapters
// =============================================================================
// Adapter pattern: each provider implements the same interface.
// Strava: fully implemented. Garmin/Wahoo: mock (ready to swap in).
// =============================================================================

export interface SportData {
  avgSpeed: number;
  avgDistance: number;
  avgDuration: number;
  avgElevation: number;
  weeklyRides: number;
  totalDistance: number;
  totalRides: number;
  recentActivities: {
    name: string;
    distance: number;
    speed: number;
    date: string;
    elevation: number;
    type?: string;
  }[];
}

export interface IntegrationAdapter {
  provider: string;
  authorizeUrl(redirectUri: string): string;
  handleCallback(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date; providerUserId?: string }>;
  fetchProfile(accessToken: string): Promise<SportData>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;
}

// --- STRAVA ADAPTER ---------------------------------------------------------

class StravaAdapter implements IntegrationAdapter {
  provider = "strava";

  authorizeUrl(redirectUri: string): string {
    const clientId = process.env.STRAVA_CLIENT_ID;
    if (!clientId) throw new Error("STRAVA_CLIENT_ID is niet geconfigureerd");
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      approval_prompt: "auto",
      scope: "read,activity:read",
    });
    return `https://www.strava.com/oauth/authorize?${params}`;
  }

  async handleCallback(code: string, redirectUri: string) {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      // Log volledig voor debugging
      console.error("Strava token exchange fout:", JSON.stringify({
        status: res.status,
        error: err,
        clientId: process.env.STRAVA_CLIENT_ID,
        redirectUri,
        codeLength: code?.length,
      }));
      throw new Error(`Strava token exchange mislukt: ${err.message || res.status} — errors: ${JSON.stringify(err.errors)}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at * 1000),
      providerUserId: String(data.athlete?.id ?? ""),
    };
  }

  async fetchProfile(accessToken: string): Promise<SportData> {
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Fetch athlete + recent activities in parallel
    const [athleteRes, activitiesRes] = await Promise.all([
      fetch("https://www.strava.com/api/v3/athlete", { headers }),
      fetch("https://www.strava.com/api/v3/athlete/activities?per_page=20", { headers }),
    ]);

    if (!athleteRes.ok) throw new Error("Strava athlete fetch mislukt");

    const athlete = await athleteRes.json();
    const activities: StravaActivity[] = activitiesRes.ok ? await activitiesRes.json() : [];

    // Fetch all-time stats
    let stats: StravaStats | null = null;
    if (athlete.id) {
      const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, { headers });
      if (statsRes.ok) stats = await statsRes.json();
    }

    return transformStravaData(activities, stats);
  }

  async refreshAccessToken(refreshToken: string) {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) throw new Error("Strava token refresh mislukt");
    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresAt: new Date(data.expires_at * 1000),
    };
  }
}

// --- STRAVA DATA TRANSFORMATION ---------------------------------------------

interface StravaActivity {
  name: string;
  distance: number;         // meters
  moving_time: number;      // seconds
  average_speed: number;    // m/s
  total_elevation_gain: number;
  type: string;
  start_date: string;
}

interface StravaStats {
  all_ride_totals: {
    count: number;
    distance: number;       // meters
  };
  ytd_ride_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
}

function transformStravaData(activities: StravaActivity[], stats: StravaStats | null): SportData {
  const rides = activities.filter((a) =>
    ["Ride", "VirtualRide", "GravelRide", "MountainBikeRide", "EBikeRide"].includes(a.type)
  );

  const avgSpeed = rides.length > 0
    ? +(rides.reduce((s, a) => s + a.average_speed * 3.6, 0) / rides.length).toFixed(1)
    : 0;

  const avgDistance = rides.length > 0
    ? +(rides.reduce((s, a) => s + a.distance / 1000, 0) / rides.length).toFixed(1)
    : 0;

  const avgDuration = rides.length > 0
    ? +(rides.reduce((s, a) => s + a.moving_time / 60, 0) / rides.length).toFixed(0)
    : 0;

  const avgElevation = rides.length > 0
    ? +(rides.reduce((s, a) => s + a.total_elevation_gain, 0) / rides.length).toFixed(0)
    : 0;

  // Estimate weekly rides from last 20 activities (roughly 4 weeks)
  const weeklyRides = +(rides.length / 4).toFixed(1);

  const totalDistance = stats
    ? +(stats.all_ride_totals.distance / 1000).toFixed(0)
    : +(rides.reduce((s, a) => s + a.distance / 1000, 0)).toFixed(0);

  const totalRides = stats?.all_ride_totals.count ?? rides.length;

  const recentActivities = rides.slice(0, 5).map((a) => ({
    name: a.name,
    distance: +(a.distance / 1000).toFixed(1),
    speed: +(a.average_speed * 3.6).toFixed(1),
    date: a.start_date,
    elevation: Math.round(a.total_elevation_gain),
    type: a.type,
  }));

  return { avgSpeed, avgDistance, avgDuration, avgElevation, weeklyRides, totalDistance, totalRides, recentActivities };
}

// --- MOCK ADAPTER -----------------------------------------------------------
// Used for Garmin/Wahoo (not yet implemented) and local development fallback.

class MockAdapter implements IntegrationAdapter {
  provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  authorizeUrl(_redirectUri: string): string {
    return `/api/integrations/${this.provider}/callback?code=mock_code`;
  }

  async handleCallback(_code: string, _redirectUri: string) {
    await delay(300);
    return {
      accessToken: `mock_access_${this.provider}_${Date.now()}`,
      refreshToken: `mock_refresh_${this.provider}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000),
    };
  }

  async fetchProfile(_accessToken: string): Promise<SportData> {
    await delay(500);
    return {
      avgSpeed: +(22 + Math.random() * 12).toFixed(1),
      avgDistance: +(30 + Math.random() * 80).toFixed(1),
      avgDuration: +(60 + Math.random() * 180).toFixed(0),
      avgElevation: +(50 + Math.random() * 600).toFixed(0),
      weeklyRides: +(1 + Math.random() * 5).toFixed(1),
      totalDistance: +(500 + Math.random() * 15000).toFixed(0),
      totalRides: Math.floor(20 + Math.random() * 300),
      recentActivities: Array.from({ length: 5 }, (_, i) => ({
        name: ["Ochtendrit", "Intervaltraining", "Toertocht", "Gravelrit", "Weekendrit"][i],
        distance: +(20 + Math.random() * 80).toFixed(1),
        speed: +(20 + Math.random() * 14).toFixed(1),
        date: new Date(Date.now() - i * 86400000 * 2).toISOString(),
        elevation: Math.floor(30 + Math.random() * 500),
        type: "Ride",
      })),
    };
  }

  async refreshAccessToken(_refreshToken: string) {
    return {
      accessToken: `mock_access_${this.provider}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000),
    };
  }
}

class GarminAdapter extends MockAdapter {
  constructor() { super("garmin"); }
  // TODO: Garmin Health API (OAuth 1.0a)
}

class WahooAdapter extends MockAdapter {
  constructor() { super("wahoo"); }
  // TODO: Wahoo Cloud API (OAuth 2.0)
}

// --- SERVICE FACTORY --------------------------------------------------------

const adapters: Record<string, IntegrationAdapter> = {
  strava: new StravaAdapter(),
  garmin: new GarminAdapter(),
  wahoo: new WahooAdapter(),
};

export function getAdapter(provider: string): IntegrationAdapter {
  const adapter = adapters[provider];
  if (!adapter) throw new Error(`Onbekende provider: ${provider}`);
  return adapter;
}

export function mergeSportData(sources: SportData[]): SportData | null {
  if (sources.length === 0) return null;
  if (sources.length === 1) return sources[0];

  return {
    avgSpeed: avg(sources.map((s) => s.avgSpeed)),
    avgDistance: avg(sources.map((s) => s.avgDistance)),
    avgDuration: avg(sources.map((s) => s.avgDuration)),
    avgElevation: avg(sources.map((s) => s.avgElevation)),
    weeklyRides: Math.max(...sources.map((s) => s.weeklyRides)),
    totalDistance: Math.max(...sources.map((s) => s.totalDistance)),
    totalRides: Math.max(...sources.map((s) => s.totalRides)),
    recentActivities: sources
      .flatMap((s) => s.recentActivities)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10),
  };
}

function avg(nums: number[]): number {
  return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
