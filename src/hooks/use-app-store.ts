import { create } from "zustand";
import type { AppMode, DiscoverFilters, DiscoverProfile, MatchData } from "@/types";

// =============================================================================
// Missing Link — Client State (Zustand)
// =============================================================================

interface AppState {
  // Current mode
  currentMode: AppMode;
  setCurrentMode: (mode: AppMode) => void;

  // Discovery
  filters: DiscoverFilters;
  setFilters: (filters: Partial<DiscoverFilters>) => void;
  discoverProfiles: DiscoverProfile[];
  setDiscoverProfiles: (profiles: DiscoverProfile[]) => void;
  discoverIndex: number;
  nextProfile: () => void;
  resetDiscoverIndex: () => void;

  // Matches
  matches: MatchData[];
  setMatches: (matches: MatchData[]) => void;
  addMatch: (match: MatchData) => void;

  // UI state
  showFilters: boolean;
  toggleFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Mode
  currentMode: "dating",
  setCurrentMode: (mode) =>
    set((s) => ({
      currentMode: mode,
      filters: { ...s.filters, mode },
      discoverIndex: 0,
    })),

  // Discovery
  filters: { mode: "dating", maxDistance: 100, minSpeed: 0, maxSpeed: 50 },
  setFilters: (partial) =>
    set((s) => ({
      filters: { ...s.filters, ...partial },
      discoverIndex: 0,
    })),
  discoverProfiles: [],
  setDiscoverProfiles: (profiles) => set({ discoverProfiles: profiles }),
  discoverIndex: 0,
  nextProfile: () => set((s) => ({ discoverIndex: s.discoverIndex + 1 })),
  resetDiscoverIndex: () => set({ discoverIndex: 0 }),

  // Matches
  matches: [],
  setMatches: (matches) => set({ matches }),
  addMatch: (match) =>
    set((s) => ({
      matches: s.matches.some((m) => m.id === match.id)
        ? s.matches
        : [match, ...s.matches],
    })),

  // UI
  showFilters: false,
  toggleFilters: () => set((s) => ({ showFilters: !s.showFilters })),
}));
