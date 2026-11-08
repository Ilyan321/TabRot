export type TabStage = 'fresh' | 'stale' | 'rotten' | 'fossilized';

export interface TabSpecimen {
  id: string;
  url: string;
  title: string;
  favIconUrl?: string;
  createdAt: number; // epoch ms
  lastInteractedAt: number; // epoch ms
  stage: TabStage;
  rotScore: number; // 0 to 100
  ramEstimateMb: number; // calculated dynamically
  pinned: boolean;
  roast?: string;
}

export interface CrematedTab {
  id: string;
  url: string;
  title: string;
  diedAt: number; // epoch ms
  lifetimeHours: number;
  causeOfDeath: string;
  epitaph: string;
}

export interface TabRotState {
  activeTabs: TabSpecimen[];
  graveyard: CrematedTab[];
  totalRamFreedMb: number;
  isMuted: boolean;
  groqApiKey?: string;
}

export interface TerrariumStats {
  overallRotPercentage: number;
  totalOpenTabs: number;
  totalRamUsedMb: number;
  totalRamFreedMb: number;
  freshCount: number;
  staleCount: number;
  rottenCount: number;
  fossilizedCount: number;
}
