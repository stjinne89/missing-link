import type { DisciplineConfig } from "@/types";

// =============================================================================
// Missing Link — Configuration
// =============================================================================

export const APP_NAME = "MissingLink";

// --- Design Tokens ----------------------------------------------------------

export const colors = {
  primary: "#FFC629",
  primaryDark: "#E5AD00",
  primaryLight: "#FFF3D0",
  secondary: "#1B1B1B",
  accent: "#FF6B6B",
  accentDark: "#E54D4D",
  success: "#2ECC71",
  dating: "#FF6B6B",
  ride: "#2ECC71",
  bff: "#F4A261",
} as const;

// --- Disciplines ------------------------------------------------------------

export const DISCIPLINES: DisciplineConfig[] = [
  { id: "road", label: "Racefiets", icon: "🚴", color: "#FF6B6B" },
  { id: "gravel", label: "Gravel", icon: "🪨", color: "#E5AD00" },
  { id: "mtb", label: "MTB", icon: "⛰️", color: "#2ECC71" },
  { id: "recreational", label: "Recreatief", icon: "🚲", color: "#5B9BD5" },
  { id: "bikepacking", label: "Bikepacking", icon: "🎒", color: "#9B59B6" },
  { id: "commute", label: "Woon-werk", icon: "🏙️", color: "#95A5A6" },
];

export const EXPERIENCE_LEVELS = [
  "Beginner",
  "Gevorderd",
  "Ervaren",
  "Expert",
  "Pro",
] as const;

export const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

export const RIDE_PREFS = ["Solo", "Duo", "Groep"] as const;

export const GOALS = [
  "Liefde",
  "Fietsmaatjes",
  "Trainingsmaatjes",
  "Groepsritten",
  "Casual ritten",
] as const;

export const DISTANCE_OPTIONS = [
  "10-30 km",
  "30-50 km",
  "50-80 km",
  "80-120 km",
  "100+ km",
] as const;

// --- Matching Config --------------------------------------------------------

export const MATCHING_WEIGHTS = {
  disciplineOverlap: 15,  // per overlapping discipline
  experienceMatch: 20,    // max, decreases with gap
  speedMatch: 20,         // max, decreases with difference
  dayOverlap: 5,          // per overlapping day
  proximity: 15,          // max, decreases with distance
  goalOverlap: 5,         // per overlapping goal
} as const;

// --- Integration Providers --------------------------------------------------

export const INTEGRATION_PROVIDERS = {
  strava: { id: "strava", name: "Strava", icon: "🟠", color: "#FC4C02" },
  garmin: { id: "garmin", name: "Garmin", icon: "🔵", color: "#007CC3" },
  wahoo: { id: "wahoo", name: "Wahoo", icon: "🔷", color: "#0073CF" },
} as const;
