import type { TabSpecimen } from '../types';
import { calculateRamEstimate, calculateDecay } from './decayEngine';

// Check if running inside actual Chrome extension environment
export const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && Boolean(chrome.tabs) && Boolean(chrome.tabs.query);
};

// Fetch real open tabs from Chrome, or return null if running on web
export const fetchRealChromeTabs = async (): Promise<TabSpecimen[] | null> => {
  if (!isChromeExtension()) return null;

  return new Promise((resolve) => {
    chrome.tabs.query({}, (realTabs) => {
      const now = Date.now();
      const savedMetadataStr = localStorage.getItem('tabrot_tabs_metadata');
      const savedMetadata: Record<string, { createdAt: number; lastInteractedAt: number; pinned: boolean }> =
        savedMetadataStr ? JSON.parse(savedMetadataStr) : {};

      const specimens: TabSpecimen[] = realTabs
        .filter((t) => t.id && t.url && !t.url.startsWith('chrome://'))
        .map((t, idx) => {
          const tabIdStr = `chrome-${t.id}`;
          const existing = savedMetadata[tabIdStr];

          // Use tracked creation time, or synthesize based on tab order
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
            ramEstimateMb: calculateRamEstimate(t.url || ''),
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

// Focus / Switch to a real tab in Google Chrome
export const focusRealChromeTab = (id: string): void => {
  if (!isChromeExtension()) return;
  if (id.startsWith('chrome-')) {
    const numericId = parseInt(id.replace('chrome-', ''), 10);
    if (!isNaN(numericId)) {
      chrome.tabs.update(numericId, { active: true }).catch(() => {});
    }
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
