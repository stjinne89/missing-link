// =============================================================================
// Missing Link — Core Types
// =============================================================================

export type AppMode = "dating" | "ride";

export type Discipline =
  | "road"
  | "gravel"
  | "mtb"
  | "recreational"
  | "bikepacking"
  | "commute";

export type ExperienceLevel =
  | "Beginner"
  | "Gevorderd"
  | "Ervaren"
  | "Expert"
  | "Pro";

export type Gender = "Man" | "Vrouw" | "Non-binair" | "Iedereen";

export type RidePref = "Solo" | "Duo" | "Groep";

export type Goal =
  | "Liefde"
  | "Fietsmaatjes"
  | "Trainingsmaatjes"
  | "Groepsritten"
  | "Casual ritten";

// --- User & Profile ---------------------------------------------------------

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  gender: string | null;
  genderPref: string | null;
  photoUrl: string | null;
  modes: AppMode[];
  disciplines: Discipline[];
  experience: ExperienceLevel | null;
  preferredDistance: string | null;
  preferredDays: string[];
  ridePref: RidePref[];
  goals: Goal[];
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  onboardingComplete: boolean;
}

// --- Sport Data -------------------------------------------------------------

export interface SportStats {
  provider: string;
  avgSpeed: number | null;
  avgDistance: number | null;
  avgDuration: number | null;
  avgElevation: number | null;
  weeklyRides: number | null;
  totalDistance: number | null;
  totalRides: number | null;
  recentActivities: RecentActivity[];
  lastSyncAt: string | null;
}

export interface RecentActivity {
  name: string;
  distance: string;
  speed: string;
  date: string;
  elevation: number;
}

// --- Discovery & Matching ---------------------------------------------------

export interface DiscoverProfile extends UserProfile {
  sportStats: SportStats | null;
  distance: number; // km from current user
  matchScore: number;
}

export interface DiscoverFilters {
  mode: AppMode;
  discipline?: Discipline;
  maxDistance?: number;
  minSpeed?: number;
  maxSpeed?: number;
  experience?: ExperienceLevel;
}

// --- Matches & Chat ---------------------------------------------------------

export interface MatchData {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhotoUrl: string | null;
  partnerCity: string | null;
  partnerDisciplines: Discipline[];
  mode: AppMode;
  score: number | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "ride_plan" | "image";
  read: boolean;
  createdAt: string;
}

// --- Ride Plans -------------------------------------------------------------

export interface RidePlanData {
  id: string;
  matchId: string;
  date: string | null;
  time: string | null;
  startLocation: string | null;
  startLat: number | null;
  startLng: number | null;
  routeUrl: string | null;
  distance: number | null;
  notes: string | null;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: string;
}

// --- Config -----------------------------------------------------------------

export interface DisciplineConfig {
  id: Discipline;
  label: string;
  icon: string;
  color: string;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
}
