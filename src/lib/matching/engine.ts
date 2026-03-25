import { EXPERIENCE_LEVELS, MATCHING_WEIGHTS } from "@/config/constants";
import type { AppMode, DiscoverFilters } from "@/types";

// =============================================================================
// Missing Link — Matching Engine
// =============================================================================
// Calculates compatibility scores between users for both Dating and Ride/BFF.
// Designed as a pure-function module for easy testing and tuning.
// =============================================================================

interface MatchCandidate {
  id: string;
  modes: string[];
  disciplines: string[];
  experience: string | null;
  avgSpeed: number | null;
  preferredDays: string[];
  goals: string[];
  gender: string | null;
  genderPref: string | null;
  distance: number; // km from current user
}

interface CurrentUser {
  id: string;
  modes: string[];
  disciplines: string[];
  experience: string | null;
  avgSpeed: number | null;
  preferredDays: string[];
  goals: string[];
  gender: string | null;
  genderPref: string | null;
}

export function calculateMatchScore(
  user: CurrentUser,
  candidate: MatchCandidate,
  mode: AppMode
): number {
  const w = MATCHING_WEIGHTS;
  let score = 0;

  // 1. Discipline overlap
  const disciplineOverlap = user.disciplines.filter((d) =>
    candidate.disciplines.includes(d)
  ).length;
  score += disciplineOverlap * w.disciplineOverlap;

  // 2. Experience match (closer = better)
  const expLevels = EXPERIENCE_LEVELS as readonly string[];
  const userExp = expLevels.indexOf(user.experience || "Gevorderd");
  const candExp = expLevels.indexOf(candidate.experience || "Gevorderd");
  const expDiff = Math.abs(userExp - candExp);
  score += Math.max(0, w.experienceMatch - expDiff * 7);

  // 3. Speed compatibility
  if (user.avgSpeed && candidate.avgSpeed) {
    const speedDiff = Math.abs(user.avgSpeed - candidate.avgSpeed);
    score += Math.max(0, w.speedMatch - speedDiff * 2);
  }

  // 4. Day overlap
  const dayOverlap = user.preferredDays.filter((d) =>
    candidate.preferredDays.includes(d)
  ).length;
  score += dayOverlap * w.dayOverlap;

  // 5. Proximity
  score += Math.max(0, w.proximity - candidate.distance * 0.3);

  // 6. Goal overlap
  const goalOverlap = user.goals.filter((g) =>
    candidate.goals.includes(g)
  ).length;
  score += goalOverlap * w.goalOverlap;

  // 7. Dating-specific: gender preference matching
  if (mode === "dating") {
    if (
      user.genderPref &&
      user.genderPref !== "Iedereen" &&
      candidate.gender !== user.genderPref
    ) {
      score *= 0.1;
    }
    if (
      candidate.genderPref &&
      candidate.genderPref !== "Iedereen" &&
      user.gender !== candidate.genderPref
    ) {
      score *= 0.1;
    }
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/** Apply discovery filters to a set of candidates */
export function applyFilters<T extends { modes: string[]; disciplines: string[]; distance: number; avgSpeed?: number | null }>(
  candidates: T[],
  filters: DiscoverFilters
): T[] {
  let result = candidates.filter((c) => c.modes.includes(filters.mode));

  if (filters.discipline) {
    result = result.filter((c) => c.disciplines.includes(filters.discipline!));
  }
  if (filters.maxDistance) {
    result = result.filter((c) => c.distance <= filters.maxDistance!);
  }
  if (filters.minSpeed) {
    result = result.filter(
      (c) => (c.avgSpeed ?? 0) >= filters.minSpeed!
    );
  }
  if (filters.maxSpeed) {
    result = result.filter(
      (c) => (c.avgSpeed ?? 50) <= filters.maxSpeed!
    );
  }

  return result;
}
