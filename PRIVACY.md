# Privacy Policy & Transparency Declaration

**Last Updated:** November 9, 2026  
**Project:** TabRot — The Digital Tab Terrarium & Graveyard  
**Author / Developer:** Ilyan Khan ([GitHub: @Ilyan321](https://github.com/Ilyan321))  
**Contact & Security Inquiries:** [ilyaankhan342@gmail.com](mailto:ilyaankhan342@gmail.com)  

---

## 1. Core Commitment: Local-First & Zero Tracking

TabRot is built with an absolute **zero-data-harvesting** architecture:
- **No telemetry or analytics trackers** (No Google Analytics, no Mixpanel, no Sentry, no ad trackers).
- **No account creation or sign-in** required.
- **No cookies used:** TabRot does not create, store, or read any HTTP tracking cookies. All state is preserved locally via client-side `localStorage` and `chrome.storage.local`.

---

## 2. Chrome Extension Permissions & Data Handling

TabRot requests the following permissions under Chrome Extension Manifest V3:

| Permission | Purpose & Scope |
| :--- | :--- |
| **`tabs`** | Used exclusively to query your open tabs (title, URL, favicon), calculate how long they have been idle, focus active tabs when clicked, and close tabs when you click "Cremate". Tab data never leaves your browser. |
| **`scripting`** | Injects an isolated runtime query to inspect `window.performance.memory.totalJSHeapSize` so TabRot can show you live RAM metrics. **TabRot never reads, logs, or transmits form inputs, passwords, keystrokes, or page contents.** |
| **`storage`** | Stores your saved terrarium state, pinned tab preferences, and the cemetery graveyard history locally on your computer. |

---

## 3. Third-Party AI Services (Groq API)

- TabRot includes an optional **"AI Diagnose"** feature.
- When explicitly activated by the user, the tab title and domain are transmitted via encrypted HTTPS directly to Groq's API endpoint (`api.groq.com`) using model `qwen/qwen3.8-27b` to generate a 1-sentence satirical roast.
- **Zero Retention:** Requests are not saved, logged by TabRot, or used to build persistent user profiles. If offline or if no API key is configured, TabRot automatically falls back to deterministic local offline roasts with zero network requests.

---

## 4. Cookie Policy

TabRot operates with **zero cookies**:
- We do not use first-party tracking cookies.
- We do not use third-party advertising cookies.
- No cookie consent banner is needed under GDPR / ePrivacy Directive because no non-essential cookies or trackers are placed.

---

## 5. Security Inquiries, Bug Reports & Vulnerabilities

We welcome community feedback, bug reports, and security vulnerability disclosures:
- **Bug & Issue Tracker:** [https://github.com/Ilyan321/TabRot/issues](https://github.com/Ilyan321/TabRot/issues)
- **Direct Developer Email:** [ilyaankhan342@gmail.com](mailto:ilyaankhan342@gmail.com)
- **Response Time:** We strive to acknowledge vulnerability reports and critical bugs within 48 hours.

---

## 6. Terms of Service & Software Disclaimer

TabRot is provided **"AS IS"** under the MIT License:
- When you execute the **"Cremate"** action (either individually or via "Mass Cremate"), TabRot will instruct Google Chrome to close the selected tab.
- **Please ensure you do not cremate tabs with unsaved form input or in-progress work.** The developer is not responsible for data lost due to tab closure commands triggered by the user.
