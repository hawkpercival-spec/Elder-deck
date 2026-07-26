/**
 * Firebase client configuration, sourced from environment variables.
 *
 * No credentials are committed to this repository. Copy `.env.example` to
 * `.env` and fill in the values from the Firebase console
 * (Project settings -> General -> Your apps -> SDK setup and configuration).
 *
 * Vite only exposes variables prefixed with `VITE_` to client code, so every
 * key below must be declared with that prefix in your `.env` file.
 */

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
};

// Vite replaces `import.meta.env.*` at build time; the cast keeps this file
// compiling without the `vite/client` ambient types. `process.env` is a
// fallback for any non-Vite (SSR / test) consumer of this module.
const env: Record<string, string | undefined> = {
  ...(typeof process !== "undefined" && process.env ? process.env : {}),
  ...((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}),
};

function required(name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Copy .env.example to .env and set your Firebase credentials.`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  return env[name] || undefined;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: required("VITE_FIREBASE_API_KEY"),
  authDomain: required("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: required("VITE_FIREBASE_PROJECT_ID"),
  appId: required("VITE_FIREBASE_APP_ID"),
  storageBucket: optional("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: optional("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  measurementId: optional("VITE_FIREBASE_MEASUREMENT_ID"),
};

/** Non-default Firestore database ID, if the project uses one. */
export const firestoreDatabaseId = optional("VITE_FIREBASE_FIRESTORE_DATABASE_ID");

/** Google OAuth web client ID, used for Google sign-in. */
export const oAuthClientId = optional("VITE_FIREBASE_OAUTH_CLIENT_ID");

/** reCAPTCHA site key for App Check, if enabled. */
export const recaptchaSiteKey = optional("VITE_FIREBASE_RECAPTCHA_SITE_KEY");
