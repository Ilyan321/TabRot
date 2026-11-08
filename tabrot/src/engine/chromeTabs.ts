import type { TabSpecimen } from '../types';
import { calculateRamEstimate, calculateDecay } from './decayEngine';

// Check if running inside actual Chrome extension environment
export const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && Boolean(chrome.tabs) && Boolean(chrome.tabs.query);
};

// Query the live JS Heap & DOM renderer memory directly from the tab's runtime
const queryTabLiveMemory = async (tabId: number): Promise<number | null> => {
  if (!isChromeExtension() || !chrome.scripting || !chrome.scripting.executeScript) {
    return null;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try {
          const perf = window.performance as unknown as { memory?: { totalJSHeapSize: number; usedJSHeapSize: number } };
          if (perf && perf.memory) {
            // Chrome's Tab Hover metric is: Renderer Base Overhead (~45-55MB) + Allocated Heap + DOM tree
            const heapBytes = perf.memory.totalJSHeapSize || perf.memory.usedJSHeapSize || 0;
            const heapMb = Math.round(heapBytes / (1024 * 1024));
            return Math.max(45, 50 + heapMb);
          }
        } catch {
          // ignore inside sandbox
        }
        return null;
      },
    });

    if (results && results[0] && typeof results[0].result === 'number') {
      return results[0].result;
    }
  } catch {
    // Script execution restricted on internal or non-HTTP tabs
  }
  return null;
};

// Fetch real open tabs from Chrome, reading live process memory when available
export const fetchRealChromeTabs = async (): Promise<TabSpecimen[] | null> => {
  if (!isChromeExtension()) return null;

  return new Promise((resolve) => {
    chrome.tabs.query({}, async (realTabs) => {
      const now = Date.now();
      const savedMetadataStr = localStorage.getItem('tabrot_tabs_metadata');
      const savedMetadata: Record<string, { createdAt: number; lastInteractedAt: number; pinned: boolean }> =
        savedMetadataStr ? JSON.parse(savedMetadataStr) : {};

      const validTabs = realTabs.filter((t) => t.id && t.url && !t.url.startsWith('chrome://'));

      // Concurrently query live memory for each tab
      const memoryPromises = validTabs.map(async (t) => {
        if (!t.id) return null;
        return queryTabLiveMemory(t.id);
      });
      const liveMemories = await Promise.all(memoryPromises);

      const specimens: TabSpecimen[] = validTabs.map((t, idx) => {
        const tabIdStr = `chrome-${t.id}`;
        const existing = savedMetadata[tabIdStr];

        // Read real live memory if injected script returned a value, otherwise calculate calibrated estimate
        const liveMb = liveMemories[idx];
        const ramEstimateMb = liveMb && liveMb > 20 ? liveMb : calculateRamEstimate(t.url || '', t.title || '');

        const createdAt = existing?.createdAt || now - idx * 4 * 60 * 60 * 1000;
        const lastInteractedAt = existing?.lastInteractedAt || createdAt;

        const base: TabSpecimen = {
          id: tabIdStr,
          url: t.url || '',
          title: t.title || 'Untitled Tab',
          favIconUrl: t.favIconUrl,
          createdAt,
          lastInteractedAt,
          stage: 'fresh',
          rotScore: 0,
          ramEstimateMb,
          pinned: Boolean(t.pinned || existing?.pinned),
        };

        return calculateDecay(base, now);
      });

      // Update storage cache
      const newMetadata: Record<string, { createdAt: number; lastInteractedAt: number; pinned: boolean }> = {};
      specimens.forEach((s) => {
        newMetadata[s.id] = {
          createdAt: s.createdAt,
          lastInteractedAt: s.lastInteractedAt,
          pinned: s.pinned,
        };
      });
      localStorage.setItem('tabrot_tabs_metadata', JSON.stringify(newMetadata));

      resolve(specimens);
    });
  });
};

// Actually close a real tab in Google Chrome
export const closeRealChromeTab = (id: string): void => {
  if (!isChromeExtension()) return;
  if (id.startsWith('chrome-')) {
    const numericId = parseInt(id.replace('chrome-', ''), 10);
    if (!isNaN(numericId)) {
      chrome.tabs.remove(numericId).catch(() => {});
    }
  }
};

// Focus / Switch to a real tab in Google Chrome, bringing its window to front
export const focusRealChromeTab = (id: string, fallbackUrl?: string): void => {
  if (isChromeExtension() && id.startsWith('chrome-')) {
    const numericId = parseInt(id.replace('chrome-', ''), 10);
    if (!isNaN(numericId)) {
      chrome.tabs.get(numericId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          if (fallbackUrl) window.open(fallbackUrl, '_blank');
          return;
        }
        chrome.tabs.update(numericId, { active: true });
        if (tab.windowId) {
          chrome.windows.update(tab.windowId, { focused: true });
        }
      });
      return;
    }
  }

  if (fallbackUrl) {
    window.open(fallbackUrl, '_blank');
  }
};

// Open the full dashboard tab from popup
export const openFullDashboard = (): void => {
  if (isChromeExtension()) {
    const dashboardUrl = chrome.runtime.getURL('index.html');
    chrome.tabs.create({ url: dashboardUrl });
  } else {
    window.open('/', '_blank');
  }
};
