export const DETERMINISTIC_ROASTS: Record<string, string[]> = {
  github: [
    "14 unmerged branches won't resolve your imposter syndrome.",
    "Staring at a red CI pipeline won't make the tests pass.",
    "This pull request has been waiting for review since the previous decade.",
    "PR description: 'minor fixes'. Changed 4,200 lines across 84 files.",
    "Starred repository #1,402 that you will never clone or build.",
  ],
  stackoverflow: [
    "Accepted answer is from 2012 with Python 2.7. Don't do this to yourself.",
    "Closed as duplicate of a question that doesn't answer your problem.",
    "You've scrolled past the top answer three times hoping for a magic snippet.",
    "Thread marked 'solves issue' with zero code and a dead link.",
    "Copy-pasting this regular expression will break production tomorrow.",
  ],
  youtube: [
    "Paused at 04:12 since Tuesday. You are never finishing this video essay.",
    "2.5 hours of 'Ultimate Productivity Guide' watched while producing nothing.",
    "Video tutorial open in 1080p while you struggle with standard syntax.",
    "Background noise tab consuming 450MB of RAM for silence.",
    "Algorithm recommended it, dopamine requested it, work suffered for it.",
  ],
  shopping: [
    "Abandoned cart with $300 of gear you don't need. Let the dopamine go.",
    "Checking price drops every 6 hours won't justify buying a third mechanical keyboard.",
    "Four tabs comparing identical cables. Buy one or close both.",
    "Adding items to wishlists isn't a substitute for actual accomplishments.",
    "The shipping costs more than your self-restraint.",
  ],
  reddit: [
    "Doomscrolling thread #481. The outside world misses you.",
    "Reading strangers argue about frameworks you don't use.",
    "Downvoted opinion thread open for 3 days just to keep your anger warm.",
    "Top comment answered the title, but you're 400 replies deep in drama.",
    "Tab decaying while you wait for someone to reply to your comment.",
  ],
  localhost: [
    "Still open after yesterday's crash. It's not going to fix itself.",
    "Localhost:3000 running in the background, rendering an unhandled runtime error.",
    "Server timed out 14 hours ago. Refreshing won't rebuild the node_modules.",
    "Memory leak in dev mode slowly draining your machine's soul.",
    "Port already in use. You left 4 other instances rotting in detached tabs.",
  ],
  academic: [
    "Tab open for 92 hours. You've read the title three times.",
    "Downloaded PDF #84 that will sit in your Downloads folder until disk wipe.",
    "Abstract looked promising; the 40 pages of math proofs said otherwise.",
    "Abstract skimmed, methodology ignored, conclusion cited incorrectly.",
    "Saved for research paper you promised to write two months ago.",
  ],
  general: [
    "Tab open so long it has developed its own micro-biome.",
    "You kept this open 'just in case'. Spoiler: the case never comes.",
    "Digital clutter is still clutter. Let it rest in peace.",
    "This tab is older than your current sprint commitment.",
    "Consuming 120MB of RAM to display a blank cookie consent banner.",
    "A monument to your optimistic multitasking.",
  ],
};

// Optional default key or loaded from localStorage / env
export const DEFAULT_GROQ_KEY = import.meta.env?.VITE_GROQ_API_KEY || '';

export function getDeterministicRoast(url: string, title: string, ageHours: number): string {
  const cleanUrl = url.toLowerCase();
  const cleanTitle = title.toLowerCase();

  let category = 'general';

  if (cleanUrl.includes('github.com')) {
    category = 'github';
  } else if (cleanUrl.includes('stackoverflow.com') || cleanUrl.includes('stackexchange.com')) {
    category = 'stackoverflow';
  } else if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    category = 'youtube';
  } else if (cleanUrl.includes('amazon.com') || cleanUrl.includes('ebay.com') || cleanUrl.includes('cart')) {
    category = 'shopping';
  } else if (cleanUrl.includes('reddit.com')) {
    category = 'reddit';
  } else if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
    category = 'localhost';
  } else if (cleanUrl.includes('arxiv.org') || cleanUrl.includes('wikipedia.org') || cleanTitle.includes('paper') || cleanTitle.includes('research')) {
    category = 'academic';
  }

  const pool = DETERMINISTIC_ROASTS[category] || DETERMINISTIC_ROASTS.general;
  
  // Deterministic selection based on URL and age
  let hash = 0;
  const str = url + ageHours.toString();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

export async function fetchGroqRoast(
  title: string,
  url: string,
  ageHours: number,
  apiKey?: string
): Promise<string> {
  const keyToUse = apiKey && apiKey.trim() !== '' ? apiKey.trim() : DEFAULT_GROQ_KEY;

  if (!keyToUse) {
    return getDeterministicRoast(url, title, ageHours);
  }

  try {
    const systemPrompt = `You are a cynical, dry, witty museum curator roaster cataloging neglected browser tabs. 
Your goal is to deliver a concise, brutal, 1-sentence roast (maximum 20 words) targeting the user's tab hoarding habits. 
Do not use quotes, hashtags, or emojis. Be sardonic, intellectual, and dry. Anti-slop style.`;

    const userPrompt = `Tab Title: "${title}"
URL: "${url}"
Age Idle: ${ageHours.toFixed(1)} hours.
Roast this tab specimen succinctly.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keyToUse}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      return getDeterministicRoast(url, title, ageHours);
    }

    const data = await response.json();
    const roastText = data?.choices?.[0]?.message?.content?.trim();

    if (roastText && roastText.length > 5) {
      return roastText.replace(/^["']|["']$/g, '');
    }

    return getDeterministicRoast(url, title, ageHours);
  } catch {
    return getDeterministicRoast(url, title, ageHours);
  }
}
