import type { TabSpecimen, CrematedTab, TabStage, TerrariumStats } from '../types';

export function calculateRamEstimate(url: string, title?: string): number {
  const cleanUrl = url.toLowerCase();
  const cleanTitle = (title || '').toLowerCase();

  // If this is the TabRot dashboard tab itself, read real JS heap if available
  if (
    cleanTitle.includes('tabrot') ||
    cleanUrl.includes('tabrot') ||
    cleanUrl.startsWith('chrome-extension://')
  ) {
    if (typeof performance !== 'undefined' && (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory) {
      const heapBytes = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      const heapMb = Math.round(heapBytes / (1024 * 1024));
      // Chrome tab hover tooltip measures total renderer process memory (V8 heap + Blink DOM + GPU compositing layer)
      // Base browser renderer process overhead in Chrome is ~45MB + heap
      return Math.max(58, Math.min(75, 45 + heapMb));
    }
    return 63; // Closely matches Chrome's 62.9MB tab hover baseline
  }

  // Heavy media & canvas webapps (~250 - 350MB)
  if (
    cleanUrl.includes('figma.com') ||
    cleanUrl.includes('youtube.com') ||
    cleanUrl.includes('canva.com') ||
    cleanUrl.includes('notion.so') ||
    cleanUrl.includes('meet.google.com') ||
    cleanUrl.includes('zoom.us') ||
    cleanUrl.includes('linear.app')
  ) {
    return Math.floor(280 + Math.random() * 40);
  }

  // Dev tools & complex SPAs (~140 - 190MB)
  if (
    cleanUrl.includes('github.com') ||
    cleanUrl.includes('stackoverflow.com') ||
    cleanUrl.includes('localhost') ||
    cleanUrl.includes('127.0.0.1') ||
    cleanUrl.includes('codepen.io') ||
    cleanUrl.includes('vercel.com') ||
    cleanUrl.includes('aws.amazon.com')
  ) {
    return Math.floor(140 + Math.random() * 30);
  }

  // Lean apps: Google Keep, simple notes, lightweight pages (~60 - 85MB)
  if (cleanUrl.includes('keep.google.com') || cleanTitle.includes('keep') || cleanUrl.includes('wikipedia.org')) {
    return Math.floor(65 + Math.random() * 15);
  }

  // Standard reading/articles baseline (~70 - 95MB)
  return Math.floor(70 + Math.random() * 20);
}

export function calculateDecay(tab: TabSpecimen, now: number = Date.now()): TabSpecimen {
  if (tab.pinned) {
    return {
      ...tab,
      stage: 'fresh',
      rotScore: 0,
    };
  }

  const ageMs = Math.max(0, now - tab.lastInteractedAt);
  const ageHours = ageMs / (1000 * 60 * 60);

  let stage: TabStage = 'fresh';
  let rotScore = 0;

  if (ageHours <= 4) {
    stage = 'fresh';
    rotScore = Math.min(20, Math.round((ageHours / 4) * 20));
  } else if (ageHours <= 24) {
    stage = 'stale';
    rotScore = Math.min(50, Math.round(21 + ((ageHours - 4) / 20) * 29));
  } else if (ageHours <= 72) {
    stage = 'rotten';
    rotScore = Math.min(85, Math.round(51 + ((ageHours - 24) / 48) * 34));
  } else {
    stage = 'fossilized';
    rotScore = Math.min(100, Math.round(86 + Math.min(1, (ageHours - 72) / 72) * 14));
  }

  return {
    ...tab,
    stage,
    rotScore,
  };
}

export function waterTab(tab: TabSpecimen): TabSpecimen {
  const now = Date.now();
  return {
    ...tab,
    lastInteractedAt: now,
    stage: 'fresh',
    rotScore: 0,
  };
}

export function cremateTab(tab: TabSpecimen, epitaph: string): CrematedTab {
  const now = Date.now();
  const lifetimeMs = now - tab.createdAt;
  const lifetimeHours = parseFloat((lifetimeMs / (1000 * 60 * 60)).toFixed(1));

  let causeOfDeath = 'Neglect & Natural Rot';
  if (tab.stage === 'fossilized') {
    causeOfDeath = 'Extreme Fossilization (>72h Stagnation)';
  } else if (tab.stage === 'rotten') {
    causeOfDeath = 'Advanced Mold Decay';
  } else if (tab.stage === 'stale') {
    causeOfDeath = 'Early Stagnation';
  } else if (tab.stage === 'fresh') {
    causeOfDeath = 'Mercy Cremation';
  }

  return {
    id: tab.id,
    url: tab.url,
    title: tab.title,
    diedAt: now,
    lifetimeHours,
    causeOfDeath,
    epitaph: epitaph || tab.roast || 'Gone to the digital ash heap.',
  };
}

export function calculateTerrariumStats(
  tabs: TabSpecimen[],
  graveyard: CrematedTab[]
): TerrariumStats {
  const totalOpenTabs = tabs.length;
  if (totalOpenTabs === 0) {
    return {
      overallRotPercentage: 0,
      totalOpenTabs: 0,
      totalRamUsedMb: 0,
      totalRamFreedMb: graveyard.reduce((acc, c) => acc + calculateRamEstimate(c.url), 0),
      freshCount: 0,
      staleCount: 0,
      rottenCount: 0,
      fossilizedCount: 0,
    };
  }

  let totalRotScore = 0;
  let totalRamUsedMb = 0;
  let freshCount = 0;
  let staleCount = 0;
  let rottenCount = 0;
  let fossilizedCount = 0;

  tabs.forEach((tab) => {
    totalRotScore += tab.rotScore;
    totalRamUsedMb += tab.ramEstimateMb;

    if (tab.stage === 'fresh') freshCount++;
    else if (tab.stage === 'stale') staleCount++;
    else if (tab.stage === 'rotten') rottenCount++;
    else if (tab.stage === 'fossilized') fossilizedCount++;
  });

  const overallRotPercentage = Math.round(totalRotScore / totalOpenTabs);
  const totalRamFreedMb = graveyard.reduce((acc, item) => acc + calculateRamEstimate(item.url), 0);

  return {
    overallRotPercentage,
    totalOpenTabs,
    totalRamUsedMb,
    totalRamFreedMb,
    freshCount,
    staleCount,
    rottenCount,
    fossilizedCount,
  };
}

export function getMockSpecimens(): TabSpecimen[] {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;

  const rawMock: Array<{
    id: string;
    url: string;
    title: string;
    favIconUrl?: string;
    ageHours: number;
    pinned?: boolean;
  }> = [
    {
      id: 'tab-1',
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Full 3-Hour Rust Lang Tutorial for Beginners - YouTube',
      favIconUrl: 'https://www.youtube.com/favicon.ico',
      ageHours: 94,
    },
    {
      id: 'tab-2',
      url: 'https://stackoverflow.com/questions/11227809/why-is-processing-a-sorted-array-faster-than-unsorted',
      title: 'Why is processing a sorted array faster than unsorted? - Stack Overflow',
      favIconUrl: 'https://stackoverflow.com/favicon.ico',
      ageHours: 48,
    },
    {
      id: 'tab-3',
      url: 'http://localhost:3000/dashboard?debug=true',
      title: 'React App - Localhost:3000 (Uncaught TypeError: Cannot read property)',
      favIconUrl: 'https://reactjs.org/favicon.ico',
      ageHours: 31,
    },
    {
      id: 'tab-4',
      url: 'https://amazon.com/gp/cart/view.html',
      title: 'Amazon.com Shopping Cart (3 items) - $349.99',
      favIconUrl: 'https://www.amazon.com/favicon.ico',
      ageHours: 82,
    },
    {
      id: 'tab-5',
      url: 'https://github.com/facebook/react/pull/28912',
      title: 'fix(core): Resolve memory leak in concurrent scheduler by dev-user · Pull Request #28912 · facebook/react',
      favIconUrl: 'https://github.githubassets.com/favicons/favicon.png',
      ageHours: 18,
    },
    {
      id: 'tab-6',
      url: 'https://arxiv.org/abs/1706.03762',
      title: '[1706.03762] Attention Is All You Need - Computer Science Research Paper',
      favIconUrl: 'https://arxiv.org/favicon.ico',
      ageHours: 112,
    },
    {
      id: 'tab-7',
      url: 'https://figma.com/file/aBc123Xyz/IdeaLab-Hacks-2026-Design-System-v4-FINAL-FINAL2',
      title: 'IdeaLab Hacks 2026 Design System v4 FINAL FINAL2 – Figma',
      favIconUrl: 'https://static.figma.com/app/icon/1/favicon.png',
      ageHours: 5,
    },
    {
      id: 'tab-8',
      url: 'https://reddit.com/r/programming/comments/18x9y7z/why_everyone_is_switching_to_zig/',
      title: 'Why everyone is switching to Zig in 2026 : r/programming',
      favIconUrl: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png',
      ageHours: 55,
    },
    {
      id: 'tab-9',
      url: 'https://notion.so/workspace/Quarterly-Goals-2026-Draft-994821',
      title: 'Quarterly Personal Growth Goals (Unfinished Draft) – Notion',
      favIconUrl: 'https://www.notion.so/images/favicon.ico',
      ageHours: 68,
    },
    {
      id: 'tab-10',
      url: 'https://wikipedia.org/wiki/Tardigrade',
      title: 'Tardigrade - Wikipedia',
      favIconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
      ageHours: 1.5,
    },
    {
      id: 'tab-11',
      url: 'https://docs.google.com/document/d/1xYz88921/edit',
      title: 'Untitled document - Google Docs',
      favIconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
      ageHours: 0.5,
    },
    {
      id: 'tab-12',
      url: 'https://news.ycombinator.com/',
      title: 'Hacker News',
      favIconUrl: 'https://news.ycombinator.com/favicon.ico',
      ageHours: 0.1,
      pinned: true,
    },
  ];

  return rawMock.map((m) => {
    const createdAt = now - m.ageHours * HOUR;
    const lastInteractedAt = createdAt;
    const ramEstimateMb = calculateRamEstimate(m.url);

    const baseSpecimen: TabSpecimen = {
      id: m.id,
      url: m.url,
      title: m.title,
      favIconUrl: m.favIconUrl,
      createdAt,
      lastInteractedAt,
      stage: 'fresh',
      rotScore: 0,
      ramEstimateMb,
      pinned: m.pinned || false,
    };

    return calculateDecay(baseSpecimen, now);
  });
}
