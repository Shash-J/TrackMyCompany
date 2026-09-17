# TrackMyCompany 🎓💼

> **The modern, privacy-first campus placement tracker for college students.**  
> Effortlessly track visiting companies, Google Form applications, CTC details, Online Assessment (OA) drive dates, and rejection reason statistics.

Built to replace messy, error-prone Excel spreadsheets with a high-performance web dashboard styled with the exact dark-mode aesthetic of [lastminuteplacementprep.in](https://www.lastminuteplacementprep.in/).

[![Official Website](https://img.shields.io/badge/Website-trackmycompany.online-863bff?style=for-the-badge&logo=google-chrome)](https://trackmycompany.online)
[![GitHub Pages Mirror](https://img.shields.io/badge/Mirror-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://shash-j.github.io/TrackMyCompany/)
[![PWA](https://img.shields.io/badge/PWA-Installable%20%26%20Offline%20Ready-green.svg?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live URLs

- **Official Domain:** [https://trackmycompany.online](https://trackmycompany.online)
- **Alternate Mirror (Works on restricted college Wi-Fi):** [https://shash-j.github.io/TrackMyCompany/](https://shash-j.github.io/TrackMyCompany/)

> [!TIP]
> **College Wi-Fi Restriction?**  
> If your college firewall blocks custom `.online` domains, simply use the **GitHub Pages Mirror** above, or open `trackmycompany.online` once via mobile data/hotspot and tap **Install App**. Once installed, it works 100% offline without needing internet access!

---

## 📲 How to Install & Use (For Students — Zero Setup Required)

You **do NOT need to code, clone any repository, or install Node.js** to use TrackMyCompany. It is a hosted, privacy-first **Progressive Web App (PWA)** that installs directly onto your phone or laptop in seconds.

### 📱 1. On Mobile (Android)
1. Open [https://trackmycompany.online](https://trackmycompany.online) (or the GitHub Pages mirror) in **Google Chrome**, **Brave**, or **Samsung Internet**.
2. Look for the prompt at the bottom: **"Add TrackMyCompany to Home screen"** or **"Install App"**.
3. *If no prompt appears:* Tap the **three dots menu (⋮)** in the top-right corner ➡️ tap **"Install app"** or **"Add to Home screen"**.
4. Tap **Install**.
5. The TrackMyCompany app icon is now on your home screen and app drawer. It opens full-screen just like an app from the Play Store and works completely offline!

---

### 🍏 2. On Mobile (iPhone / iPad — iOS)
1. Open [https://trackmycompany.online](https://trackmycompany.online) (or the GitHub Pages mirror) in **Safari**.
2. Tap the **Share** icon (the square with an arrow pointing upward at the bottom bar).
3. Scroll down the menu and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner.
5. The TrackMyCompany icon is now on your iOS home screen. It runs in standalone mode with full offline IndexedDB storage.

---

### 💻 3. On Laptop / PC (Windows, Mac, Linux)
1. Open [https://trackmycompany.online](https://trackmycompany.online) (or the GitHub Pages mirror) in **Chrome**, **Edge**, or **Brave**.
2. Look at the right side of the address bar (URL bar). You will see an **Install** icon (a computer monitor with a down arrow).
3. Click it and select **"Install"**.
   - *Alternatively:* Click the **three dots (⋮)** in Chrome/Edge ➡️ **"Cast, save, and share"** / **"Apps"** ➡️ **"Install TrackMyCompany"**.
4. TrackMyCompany opens in its own clean, distraction-free desktop window without browser tabs.
5. You can pin it to your Windows **Taskbar** or macOS **Dock** for instant one-click access.

---

## 🌟 Why TrackMyCompany?

During campus recruitment drives, company announcements arrive continuously on class WhatsApp groups and placement portals. Students often lose track of:
- Which companies arrived and whether they applied or skipped.
- Why they decided not to apply to certain companies (Low CTC, bond agreements, location, etc.).
- When the Online Assessment (OA) is scheduled and whether the college shortlisted them to write the test.

**TrackMyCompany** solves all of this with zero friction:
- **100% Client-Side Privacy**: No login, no passwords, no server database. Everything is saved directly in your device's persistent database (**IndexedDB**).
- **Persistent Storage API**: Calls `navigator.storage.persist()` so modern browsers won't auto-evict your data after periods of inactivity.
- **Progressive Web App (PWA)**: Installable directly to your phone's home screen or laptop desktop. Works 100% offline via Service Worker caching.
- **Immediate Onboarding**: Just enter your name and start tracking immediately.
- **Smart OA Shortlist Tracker**: Track Form Submitted status, OA drive dates, and shortlist outcomes (`Pending`, `Shortlisted for OA 🎉`, `Not Shortlisted`).
- **Rejection Reason Analytics**: Categorize skipped companies using preset chips (*Low CTC*, *Strict Bond*, *Location Not Preferred*, etc.) or custom notes, with visual breakdown charts on the Statistics page.
- **Excel & CSV Superpowers**: Export your full dataset anytime or import your existing placement spreadsheets with smart column detection and template downloads.
- **Proactive Backup Safety**: In-app JSON backup snapshots with automatic backup reminders so you never lose your progress.
- **LMPP Dark Aesthetic**: Sleek slate-navy palette, Inter typography, glowing status badges, and confetti celebrations.

---

## 🚀 Key Features

### 1. Personal Company Tracker
- **Applied Workflow**: Track priority (P1 High, P2 Medium, P3 Low), free-text CTC (e.g. `18 LPA`, `8.5 + 1L Retention Bonus`), Google Form link, and OA drive date.
- **Not Applied Workflow**: One-click rejection reason pills (*Low CTC*, *Strict Bond*, *Location*, *Ineligible*, *Other*) plus custom descriptive notes.
- **Real-time Search & Multi-Filters**: Filter by Tier (`Open Dream ≥12 LPA`, `Dream <12 LPA`, `Mass`, `Internship`), Priority, OA Shortlist status, or search company names and roles.
- **Drag-and-Drop Rank Reordering**: Shift company priorities with smooth drag-and-drop.

### 2. Comprehensive Analytics & Funnel
- **Application Funnel**: Visited ➡️ Applied Rate (%) ➡️ OA Shortlist Conversion (%).
- **Rejection Pattern Analysis**: Visual percentage bars and custom description chips showing exactly why companies were skipped.
- **Tier Breakdown**: Real-time ratio of Open Dream vs. Dream vs. Mass opportunities.

### 3. Dedicated OA Drives Timeline
- Chronological view of scheduled test dates with countdowns (`Today!`, `Tomorrow`, `In X days`).
- Quick-toggle shortlist status modifiers.

### 4. Excel & CSV Interoperability
- Export directly to formatted Excel (`.xlsx`) and `.csv`.
- Upload your existing spreadsheet with automatic column detection.
- Download standard Excel template with pre-filled examples.
- Portable JSON backup & restore.

### 5. Progressive Web App (PWA) & Offline Mode
- Installable on Android, iOS, Windows, and macOS.
- Works offline with full read/write capabilities via IndexedDB.
- Background Service Worker caching for instant load times.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens matching LMPP
- **Icons**: [Lucide React](https://lucide.dev/)
- **Spreadsheet Engine**: [SheetJS (xlsx)](https://docs.sheetjs.com/)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Data Persistence**: **IndexedDB** via `idb` with Persistent Storage API (`navigator.storage.persist()`) & automatic `localStorage` migration
- **PWA**: Service Worker with offline caching & Web App Manifest

---

## 💻 For Developers & Contributors (Local Development)

> [!NOTE]
> This section is strictly for developers who want to inspect the source code or contribute features to the project. Regular users do not need this!

### Prerequisites
- Node.js 18+ and npm installed on your machine.

### Local Setup
```bash
# Clone the repository
git clone https://github.com/Shash-J/TrackMyCompany.git

# Navigate into the project folder
cd TrackMyCompany

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Free Deployment
```bash
npm run build
npm run preview
```

#### Deploy to GitHub Pages (Automated)
This repository includes a pre-configured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
1. Push commits to `main`:
   ```bash
   git push origin main
   ```
2. GitHub Actions will automatically build and publish your updates to GitHub Pages and your custom domain `trackmycompany.online`!

---

## 📜 Privacy & Disclaimers

1. **Privacy Guarantee**: All data entered into TrackMyCompany is stored exclusively in your browser's private database (**IndexedDB**). No data is sent to any remote server or third-party service.
2. **Persistence Guarantee**: By leveraging modern browser IndexedDB and the Persistent Storage API, your data remains intact across sessions, tab closes, and browser restarts.
3. **Design Disclaimer**: UI/UX patterns and workflows are designed specifically for student convenience during high-pressure placement drives.

---

Made with ❤️ for campus placements • [Official Website](https://trackmycompany.online) • [GitHub Repository](https://github.com/Shash-J/TrackMyCompany.git)
