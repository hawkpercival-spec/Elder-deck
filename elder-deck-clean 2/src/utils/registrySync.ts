import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "../lib/firebase";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: db.app ? null : null
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AppRegistryAccount {
  uid: string;
  email: string;
  displayName: string;
  registeredAt: string;
  lastActiveAt: string;
  providerId: string;
  covenantStatus: string;
  isSubscribed: boolean;
  photoURL?: string;
}

export interface AppRegistryStats {
  totalUsersCount: number;
  activeSubscribersCount: number;
  lastRegisteredEmail: string;
  lastRegisteredAt: string;
  updatedAt: string;
}

/**
 * Real-time tracking function executed whenever a user authenticates.
 * Automatically updates both the user's private profile document and the global app registry.
 */
export async function trackUserAccountInRegistry(
  user: User, 
  isSubscribed: boolean = false
): Promise<void> {
  if (!user) return;

  const userPath = `app_registry_users/${user.uid}`;
  const nowIso = new Date().toISOString();
  const providerId = user.providerData && user.providerData.length > 0 ? user.providerData[0].providerId : (user.isAnonymous ? "anonymous" : "password");

  try {
    const regDocRef = doc(db, "app_registry_users", user.uid);
    const docSnap = await getDoc(regDocRef);

    const accountData: AppRegistryAccount = {
      uid: user.uid,
      email: user.email || (user.isAnonymous ? "Anonymous Coven Soul" : "registered_soul@elderdeck.io"),
      displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Elder Seer"),
      registeredAt: docSnap.exists() ? (docSnap.data().registeredAt || nowIso) : nowIso,
      lastActiveAt: nowIso,
      providerId: providerId,
      covenantStatus: isSubscribed ? "Active Master Covenant" : "Initiate Trial",
      isSubscribed: isSubscribed,
      photoURL: user.photoURL || undefined
    };

    // 1. Upsert User Registration Record in Real-Time App Registry
    await setDoc(regDocRef, accountData, { merge: true });

    // 2. Also ensure User's personal /users/{uid} document is updated
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email || "",
      displayName: accountData.displayName,
      isSubscribed: isSubscribed,
      lastActiveAt: nowIso,
      updatedAt: nowIso
    }, { merge: true });

    // 3. Update Global Registry Stats Summary
    const statsDocRef = doc(db, "app_registry_stats", "summary");
    const regCol = collection(db, "app_registry_users");
    const allUsersSnap = await getDocs(regCol);
    
    let totalUsers = allUsersSnap.docs.length;
    let totalSubscribers = 0;
    
    allUsersSnap.docs.forEach((d) => {
      if (d.data().isSubscribed) totalSubscribers++;
    });

    await setDoc(statsDocRef, {
      totalUsersCount: totalUsers,
      activeSubscribersCount: totalSubscribers,
      lastRegisteredEmail: accountData.email,
      lastRegisteredAt: nowIso,
      updatedAt: nowIso
    }, { merge: true });

  } catch (err) {
    console.warn("Registry account sync warning:", err);
    // Don't crash main thread if network is flickering
  }
}
