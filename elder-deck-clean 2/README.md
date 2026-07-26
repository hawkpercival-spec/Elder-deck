# Elder Deck & Sanctuary of Sovngarde

An immersive, full-stack medieval tarot oracle, prophecy generator, and sanctuary meditation web application built with React, TypeScript, Tailwind CSS, Express, Firebase Firestore & Authentication, and the Gemini API.

## Features

- **Elder Deck Divination**: Interactive tarot card drawings with real-time celestial ormen generation and card lore.
- **Bespoke Sanctuary Meditation**: AI-powered personalized medieval contemplation exercises tailored to each drawn card and traveler temperament.
- **Covenant Ledger & User Auth**: Secure authentication and cloud persistence via Firebase Firestore and Auth.
- **Destiny Scroll Synthesis**: Seamless integration of user journal reflections with AI prophecy analysis.
- **Tavern Music & Soundscapes**: Atmospheric medieval sound effects and audio gear.

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or bun

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure your credentials:
   ```bash
   cp .env.example .env
   ```
   - Server-side secrets: `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `WATCHMODE_API_KEY`, `APP_URL`.
   - Firebase client config: the `VITE_FIREBASE_*` values from
     Firebase console → Project settings → General → Your apps.

   No credentials are stored in this repository. `.env` and
   `firebase-applet-config.json` are gitignored; see
   `firebase-applet-config.example.json` for the expected shape.
3. Run the development server:
   ```bash
   npm run dev
   ```

### Production Build & Deployment

1. Build the application for production (bundles client and Express server into `dist/`):
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Secrets Policy

- Never commit `.env`, `firebase-applet-config.json`, service-account JSON, or build output.
- Server-side keys (Gemini, Stripe, WatchMode) are read from `process.env` in `server.ts`
  and are never sent to the browser.
- Firebase client values are read from `VITE_FIREBASE_*` in `src/lib/firebaseConfig.ts`.
  They are public by design once bundled, so access must be enforced with
  Firestore security rules, Firebase Auth, and API key restrictions
  (HTTP referrer + allowed APIs) in the Google Cloud console.
- In CI/CD, supply every value through repository or provider secrets.

## GitHub Export & Deployment

This repository is fully configured for GitHub export and CI/CD pipelines:
- Includes GitHub Actions workflow (`.github/workflows/ci.yml`) for automated linting and production builds.
- Fully compatible with Cloud Run, Firebase Hosting, or standard Node.js hosting providers.
