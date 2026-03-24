// =============================================================================
// Missing Link — Sport Integration Service
// =============================================================================
// Adapter pattern: each provider implements the same interface.
// Currently uses mock data; swap adapters for real OAuth flows later.
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
  authorize(redirectUrl: string): string; // Returns OAuth URL
  handleCallback(code: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }>;
  fetchProfile(accessToken: string): Promise<SportData>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;
}

// --- MOCK ADAPTER -----------------------------------------------------------
// Used for development. Returns realistic demo data.

class MockAdapter implements IntegrationAdapter {
  provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  authorize(redirectUrl: string): string {
    return `${redirectUrl}?code=mock_code_${this.provider}&provider=${this.provider}`;
  }

  async handleCallback(_code: string) {
    // Simulate OAuth callback
    await delay(300);
    return {
      accessToken: `mock_access_${this.provider}_${Date.now()}`,
      refreshToken: `mock_refresh_${this.provider}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000),
    };
  }

  async fetchProfile(_accessToken: string): Promise<SportData> {
    await delay(500);
    const base = {
      avgSpeed: 22 + Math.random() * 12,
      avgDistance: 30 + Math.random() * 80,
      avgDuration: 60 + Math.random() * 180,
      avgElevation: 50 + Math.random() * 600,
      weeklyRides: 1 + Math.random() * 5,
      totalDistance: 500 + Math.random() * 15000,
      totalRides: Math.floor(20 + Math.random() * 300),
      recentActivities: Array.from({ length: 5 }, (_, i) => ({
        name: ["Ochtendrit", "Intervaltraining", "Toertocht", "Gravelrit", "Weekendrit"][i],
        distance: +(20 + Math.random() * 80).toFixed(1),
        speed: +(20 + Math.random() * 14).toFixed(1),
        date: new Date(Date.now() - i * 86400000 * 2).toISOString(),
        elevation: Math.floor(30 + Math.random() * 500),
        type: ["Ride", "Ride", "Ride", "GravelRide", "Ride"][i],
      })),
    };
    return base;
  }

  async refreshAccessToken(_refreshToken: string) {
    await delay(200);
    return {
      accessToken: `mock_access_${this.provider}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000),
    };
  }
}

// --- STRAVA ADAPTER (placeholder for real implementation) -------------------

class StravaAdapter extends MockAdapter {
  constructor() {
    super("strava");
  }

  // TODO: Replace with real Strava OAuth
  // authorize(redirectUrl: string): string {
  //   const clientId = process.env.STRAVA_CLIENT_ID;
  //   return `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&scope=read,activity:read`;
  // }
  //
  // async handleCallback(code: string) {
  //   const res = await fetch("https://www.strava.com/oauth/token", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       client_id: process.env.STRAVA_CLIENT_ID,
  //       client_secret: process.env.STRAVA_CLIENT_SECRET,
  //       code,
  //       grant_type: "authorization_code",
  //     }),
  //   });
  //   const data = await res.json();
  //   return {
  //     accessToken: data.access_token,
  //     refreshToken: data.refresh_token,
  //     expiresAt: new Date(data.expires_at * 1000),
  //   };
  // }
  //
  // async fetchProfile(accessToken: string): Promise<SportData> {
  //   const [stats, activities] = await Promise.all([
  //     fetch("https://www.strava.com/api/v3/athlete", { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
  //     fetch("https://www.strava.com/api/v3/athlete/activities?per_page=10", { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
  //   ]);
  //   // Transform Strava data into our SportData format
  //   ...
  // }
}

// --- GARMIN ADAPTER (placeholder) -------------------------------------------

class GarminAdapter extends MockAdapter {
  constructor() {
    super("garmin");
  }
  // TODO: Implement Garmin Health API integration
}

// --- WAHOO ADAPTER (placeholder) --------------------------------------------

class WahooAdapter extends MockAdapter {
  constructor() {
    super("wahoo");
  }
  // TODO: Implement Wahoo Cloud API integration
}

// --- SERVICE FACTORY --------------------------------------------------------

const adapters: Record<string, IntegrationAdapter> = {
  strava: new StravaAdapter(),
  garmin: new GarminAdapter(),
  wahoo: new WahooAdapter(),
};

export function getAdapter(provider: string): IntegrationAdapter {
  const adapter = adapters[provider];
  if (!adapter) throw new Error(`Unknown provider: ${provider}`);
  return adapter;
}

/**
 * Merge sport data from multiple providers.
 * Prioritizes the source with more recent data.
 */
export function mergeSportData(sources: SportData[]): SportData | null {
  if (sources.length === 0) return null;
  if (sources.length === 1) return sources[0];

  // Average the stats across providers
  const merged: SportData = {
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

  return merged;
}

// --- Helpers ----------------------------------------------------------------

function avg(nums: number[]): number {
  return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
