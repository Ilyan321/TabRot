# TabRot 🪴🪦
### *The Digital Tab Terrarium & Graveyard*

> **"A living digital terrarium where neglected tabs rot in real time, beg for CPR, or get cremated into a searchable graveyard."**

Built for **IdeaLab Hacks 2026** by **Ilyan Khan**.

---

## 🌿 The Concept

Every knowledge worker suffers from tab hoarding. You open a 3-hour tutorial video, save an academic paper, or leave an abandoned shopping cart open "just in case" — and then they sit for 4 days silently consuming gigabytes of system memory.

**TabRot transforms this cognitive clutter into a living, tactile editorial terrarium:**
- Neglected tabs experience biological decay through four stages: **Fresh** (0–4h) 🌱 → **Stale** (4–24h) 🍂 → **Rotten** (24–72h) 🍄 → **Fossilized** (>72h) 🪨.
- If you still need a tab, click **Water (CPR)** to revive it and reset its decay counter.
- If you're ready to let go, click **Cremate** — it physically closes the tab in Google Chrome and archives it with an epitaph in your searchable **Cemetery Archive**.
- **AI Diagnostics:** Powered by Groq LLM API (`qwen/qwen3.8-27b`) for sardonic, dry roasts of your hoarding habits.

---

## ✨ Features

- 🔬 **Real Chrome Extension (MV3):** Injects runtime heap metrics via `chrome.scripting` to monitor actual open tabs and closes tabs via `chrome.tabs.remove`.
- 📊 **Ecosystem Diagnostics HUD:** Real-time rot score meter, estimated RAM consumption breakdown, and stage distribution counters.
- 🪦 **Cemetery Archive:** Searchable digital graveyard tracking total RAM freed, cause of death, time of death, and revival options.
- 🔊 **Zero-Asset Procedural Audio:** All clicks, water drops, cremation crackles, and roasts synthesized live via the native **Web Audio API** (zero external MP3 files).
- 📜 **Anti-Slop Editorial Design:** Warm vintage parchment palette (`#E6DFD5`), Lichen Ink typography, 1.5px tactile borders, and discrete ASCII decay progress bars.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (Editorial Specimen Theme)
- **Extension:** Chrome Manifest V3 (`tabs`, `scripting`, `storage`)
- **AI Engine:** Groq API (`qwen/qwen3.8-27b` + deterministic offline hash fallback)
- **Audio:** Custom Web Audio API Oscillator Synth Engine

---

## 🚀 Quickstart & Installation

### 1. Web Simulator Mode
```bash
git clone https://github.com/Ilyan321/TabRot.git
cd TabRot
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 2. Loading as Google Chrome Extension
1. Run the build:
```bash
npm run build
```
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the root `dist` folder.
5. Pin **TabRot** to your browser toolbar!

---

## 📜 License
MIT License • Built for IdeaLab Hacks 2026.
