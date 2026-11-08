# Spec: TabRot (The Anti-Slop Tab Terrarium & Graveyard)

> **Theme Alignment:** IdeaLab Hacks 2026 — *"That tiny annoyance you keep noticing. The game you wish existed. The experiment you cannot stop thinking about."*  
> **Status:** FINALIZED  
> **Aesthetic:** Anti-Slop Editorial / Field Notebook (`#F4EFEA` Bone Parchment, `#1B2A26` Lichen Ink, `#3D5A45` Fungal Moss, `#C84B31` Rust Orange)

---

## 1. Product Overview & Core Thesis
Modern browsers treat open tabs as static list items. In reality, abandoned tabs represent digital clutter, attention debt, and RAM leakage. 

**TabRot** turns tab clutter into an interactive, organic ecosystem where neglected tabs visibly and tangibly decay over time through 4 distinct stages. It pairs a **Manifest V3 Chrome Extension** (quick popup + full dashboard tab) with a **100% Client-Side Web Simulator** hosted on GitHub Pages/Vercel so hackathon judges can experience the entire product in under 5 seconds without installing anything.

---

## 2. Design System: Anti-Slop Editorial Notebook
No generic dark mode neon purple, no pill buttons with redundant icons, and no AI-slop gradients. 

* **Background (Bone/Parchment):** `#F4EFEA` / `#EBE5DF`
* **Primary Text/Border (Lichen Ink):** `#1B2A26` (high contrast, sharp typography)
* **Secondary Text (Faded Specimen):** `#5E6963`
* **Accents:**
  * **Sprout / Fresh:** `#3D5A45` (Moss Green)
  * **Decaying / Stale:** `#BFA054` (Dried Ochre)
  * **Critical Rot / Cremate:** `#C84B31` (Rust Orange / Terracotta)
  * **Fossilized / Stone:** `#7A7571`
* **Typography:** Clean editorial mono/serif hybrid (`JetBrains Mono` / `Space Grotesk` / systemic editorial serif).
* **Borders & Shadows:** Crisp 1px solid borders, boxy editorial layouts, 0px border-radii or micro-rounded 2px. Tactile, physical paper feel.

---

## 3. Architecture & Tech Stack

```
tabrot/
├── manifest.json             # Chrome Extension Manifest V3
├── src/
│   ├── background/           # Service Worker (tracks tab age, closed tab archive)
│   ├── popup/                # 380px High-density compact Action Popup
│   ├── dashboard/            # Full-page Sanctuary & Graveyard (extension & web simulator)
│   ├── engine/
│   │   ├── decayEngine.ts    # Mathematical model of tab decay (0h -> 168h)
│   │   ├── soundEngine.ts    # Procedural Web Audio API sound synthesis (0 asset downloads)
│   │   ├── roastEngine.ts    # Hybrid: instant deterministic roasts + optional Groq API key
│   │   └── storage.ts        # Unified abstraction (chrome.storage.local <-> window.localStorage)
│   └── components/           # Modular UI components (SpecimenCard, GraveyardEpitaph, RotMeter)
├── vite.config.ts            # Fast build targeting both extension dist and web dist
```

### Key Technical Innovations
1. **Procedural Web Audio API Signal Graph:**
   * Synthesizes mechanical clicks, papery crumbling sounds, and cremation sizzles using native Web Audio oscillators and bandpass filters. **0 MP3 files downloaded, 0KB audio assets**.
2. **Hybrid Intelligence (Instant + Groq):**
   * Ships with 50+ deterministic, domain-specific roasts (GitHub PRs, YouTube rabbit holes, StackOverflow questions, shopping carts).
   * Supports an optional user-entered Groq API key (Llama 3.3 70B Versatile) for ultra-fast (sub-200ms) personalized tab roasts and obituary poems.
3. **Dual Execution Runtime (Extension + Web Simulator):**
   * Detects if running inside `chrome-extension://` or on the web.
   * On the web, it offers a 1-click **"Simulate My Cluttered Brain"** seed button that loads 15 realistic developer/student tabs with varying decay states, so judges can interact with everything immediately.

---

## 4. Four-Stage Lifecycle & Mechanics

| Stage | Age Range | Visual Specimen | Audio Feedback | Actions Available |
| :--- | :--- | :--- | :--- | :--- |
| **01 Fresh** | 0–4 hours | Crisp specimen label, green dot, 100% opacity | Gentle bell chime | Focus, Pin |
| **02 Stale** | 5–24 hours | Yellowing corner stamp, slightly desaturated | Faint paper rustle | Water (CPR), Archive |
| **03 Rotten** | 25–72 hours | Moss speckles, warning rust badge, witty roast bubble | Low hum | Water, Cremate |
| **04 Fossilized**| 73+ hours | Gray stone slate, cobweb ASCII, RAM penalty indicator | Dry click | Cremate to Graveyard |

### Cremate & Graveyard
* When a tab is cremated, it closes in the browser (or simulator) with a procedural visual crumble and sound.
* Saved to **The Cemetery** archive with an epitaph (URL, Title, Time alive, and cause of death).
* Can be searched, exported as Markdown, or revived with 1 click.

---

## 5. Verification Plan & Deliverables

1. **Unit & Logic Tests:**
   * Verify decay calculation formulas for all timestamps.
   * Verify audio oscillator lifecycle (clean teardown without audio leaks).
2. **Build Outputs:**
   * Extension bundle (`manifest.json` + `dist/popup.html` + `dist/dashboard.html`).
   * Standalone web demo build for GitHub Pages or Vercel.
3. **Judge Demo Readiness:**
   * Live URL running with the "Simulate My Brain" quick-loader.
   * Clean README with screenshots and 2-minute walkthrough script.