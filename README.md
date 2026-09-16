# TrackMyCompany 🎓💼

> **The modern, privacy-first campus placement tracker for college students.**  
> Effortlessly track visiting companies, Google Form applications, CTC details, Online Assessment (OA) drive dates, and rejection reason statistics.

Built to replace annoying, messy Excel sheets with a high-performance web dashboard styled with the exact dark-mode aesthetic of [lastminuteplacementprep.in](https://www.lastminuteplacementprep.in/).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://shash-j.github.io/TrackMyCompany/)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%99%A5-indigo.svg)](https://github.com/Shash-J/TrackMyCompany)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Bundled%20with-Vite-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/Framework-React%2019-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)

**🌐 Live Website:** [https://shash-j.github.io/TrackMyCompany/](https://shash-j.github.io/TrackMyCompany/)

---

## 🌟 Why TrackMyCompany?

During campus recruitment drives, company announcements arrive continuously on class WhatsApp groups and placement portals. Students often lose track of:
- Which companies arrived and whether they applied or skipped.
- Why they decided not to apply to certain companies (Low CTC, bond agreements, location, etc.).
- When the Online Assessment (OA) is scheduled and whether the college shortlisted them to write the test.

**TrackMyCompany** solves all of this with zero setup friction:
- **100% Client-Side Privacy**: No login, no passwords, no server database. Everything is saved directly in your browser's local storage.
- **Immediate Onboarding**: Just enter your name and start tracking immediately.
- **Smart OA Shortlist Tracker**: Track Form Submitted status, OA drive dates, and shortlist outcomes (`Pending`, `Shortlisted for OA 🎉`, `Not Shortlisted`).
- **Rejection Reason Analytics**: Categorize skipped companies using preset chips (*Low CTC*, *Strict Bond*, *Location Not Preferred*, etc.) or custom notes, with visual breakdown charts on the Statistics page.
- **Excel & CSV Superpowers**: Export your full dataset anytime or import your existing placement spreadsheets with smart column detection and template downloads.
- **LMPP Dark Aesthetic**: Sleek slate-navy palette, Inter typography, glowing status badges, and confetti celebrations.

---

## 🚀 Key Features

### 1. Personal Company Tracker
- **Applied Workflow**: Track priority (P1 High, P2 Medium, P3 Low), free-text CTC (e.g. `18 LPA`, `8.5 + 1L Retention Bonus`), Google Form link, and OA drive date.
- **Not Applied Workflow**: One-click rejection reason pills (*Low CTC*, *Strict Bond*, *Location*, *Ineligible*, *Other*) plus custom descriptive notes.
- **Real-time Search & Multi-Filters**: Filter by Tier (`Open Dream ≥12 LPA`, `Dream <12 LPA`, `Mass`, `Internship`), Priority, OA Shortlist status, or search company names and roles.

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

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens matching LMPP
- **Icons**: [Lucide React](https://lucide.dev/)
- **Spreadsheet Engine**: [SheetJS (xlsx)](https://docs.sheetjs.com/)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Data Persistence**: Browser `localStorage` with reactive cross-tab events

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js 18+ and npm installed on your machine.

### Installation
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

```

### Production Build & Free Deployment
```bash
npm run build
npm run preview
```

#### Deploy to GitHub Pages (Automated)
This repository includes a pre-configured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
1. Go to your GitHub repository: [https://github.com/Shash-J/TrackMyCompany](https://github.com/Shash-J/TrackMyCompany)
2. Navigate to **Settings** ➡️ **Pages** (under Code and automation).
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push your commits to `main`:
   ```bash
   git push origin main
   ```
5. GitHub will automatically build and publish your site at **https://shash-j.github.io/TrackMyCompany/** for free!

---

## 🤝 Contributing

TrackMyCompany is an open-source project created by students, for students. Contributions are welcome!

1. Fork the Project: `https://github.com/Shash-J/TrackMyCompany.git`
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 Privacy & Disclaimers

1. **Privacy Guarantee**: All data entered into TrackMyCompany is stored exclusively in your browser's local storage (`localStorage`). No data is sent to any remote server or third-party service.
2. **Design Disclaimer**: UI/UX patterns and workflows are designed specifically for student convenience during high-pressure placement drives.

---

Made with ❤️ for campus placements • [GitHub Repository](https://github.com/Shash-J/TrackMyCompany.git)
