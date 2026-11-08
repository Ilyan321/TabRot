// TabRot Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('TabRot extension installed.');
});

// Update lastInteractedAt whenever the user switches to / clicks a tab in Google Chrome
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  const now = Date.now();
  const key = `chrome-${tabId}`;

  try {
    const data = await chrome.storage.local.get(['tabrot_tabs_metadata']);
    const metadata = data.tabrot_tabs_metadata || {};
    
    if (metadata[key]) {
      metadata[key].lastInteractedAt = now;
    } else {
      metadata[key] = {
        createdAt: now,
        lastInteractedAt: now,
        pinned: false,
      };
    }
    
    await chrome.storage.local.set({ tabrot_tabs_metadata: metadata });
  } catch (err) {
    console.error('Error recording tab activation:', err);
  }
});

// Also reset when user refreshes or navigates to a new page in a tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    const now = Date.now();
    const key = `chrome-${tabId}`;
    try {
      const data = await chrome.storage.local.get(['tabrot_tabs_metadata']);
      const metadata = data.tabrot_tabs_metadata || {};
      if (metadata[key]) {
        metadata[key].lastInteractedAt = now;
      }
      await chrome.storage.local.set({ tabrot_tabs_metadata: metadata });
    } catch {
      // ignore
    }
  }
});
