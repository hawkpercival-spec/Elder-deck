import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Compass, 
  BookOpen, 
  ShieldAlert, 
  Sword, 
  Crown, 
  Skull,
  Feather,
  Info,
  User as UserIcon,
  LogIn,
  LogOut,
  Bell,
  Music,
  Users,
  Headphones
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, MEDIEVAL_DECK, GAME_TIPS, FORTUNES } from "./data/cards";
import { isProceduralId, generateProceduralCard } from "./utils/procedural";
import { MedievalCard } from "./components/MedievalCard";
import { OracleParchment } from "./components/OracleParchment";
import { QuestLog, HistoryEntry } from "./components/QuestLog";
import { DestinyArchive, SavedProphecy } from "./components/DestinyArchive";
import { JournalEntry } from "./components/JournalSection";
import { sfx, MUSIC_LIBRARY } from "./utils/audio";
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc,
  getDoc,
  getDocs, 
  writeBatch,
  doc,
  deleteDoc,
  signOut,
  handleFirestoreError,
  OperationType
} from "./lib/firebase";
import { SeerCodex } from "./components/SeerCodex";
import { AuthModal } from "./components/AuthModal";
import { PaywallModal } from "./components/PaywallModal";
import { ElliotPopup } from "./components/ElliotPopup";
import { Dagger3DBackground } from "./components/Dagger3DBackground";
import { Gauntlet3DBackground } from "./components/Gauntlet3DBackground";
import { SpatialAudioControl } from "./components/SpatialAudioControl";
import { trackUserAccountInRegistry } from "./utils/registrySync";
import { User } from "firebase/auth";

export default function App() {
  // Navigation / Splash state
  const [showIntro, setShowIntro] = useState(true);
  const [showSpatialAudioModal, setShowSpatialAudioModal] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState<number | null>(null);
  
  // Game states
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [alignmentFilter, setAlignmentFilter] = useState<"All" | "Warrior" | "Mage" | "Thief">("All");
  const [deckHovered, setDeckHovered] = useState(false);
  
  // Audio settings
  const [musicOn, setMusicOn] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string>("minstrel_guild");
  
  // Tips rotation
  const [tipText, setTipText] = useState(GAME_TIPS[0]);
  
  // History log state
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Saved Destiny Scrolls state
  const [prophecies, setProphecies] = useState<SavedProphecy[]>([]);

  // Saved Journal reflections state
  const [savedJournals, setSavedJournals] = useState<JournalEntry[]>([]);

  // Fortune of the Day state (randomized only on new draw)
  const [currentFortune, setCurrentFortune] = useState<string | null>(null);
  
  // Codex active tab state (for the streamlined side panel)
  const [activeCodexTab, setActiveCodexTab] = useState<string>("oracle");
  
  // Firebase Auth states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showElliotPopup, setShowElliotPopup] = useState(false);

  // Paywall & Stripe states
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isMyProfilePublished, setIsMyProfilePublished] = useState(false); // Track profile completion
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  // Monitor profile completion
  useEffect(() => {
    if (!user) {
      setIsMyProfilePublished(false);
      return;
    }
    const publicCol = collection(db, "public_souls");
    const unsubscribe = onSnapshot(publicCol, (pubSnapshot) => {
      const myDoc = pubSnapshot.docs.find((d) => d.id === user.uid);
      setIsMyProfilePublished(!!myDoc);
    }, (err) => {
      console.warn("Firestore public souls sync notice:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // Custom medieval notification system (replaces window.alert for better iframe compatibility)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Monitor Auth state changes & sync local records
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Track new user sign-in / registration real-time in global registry account
        trackUserAccountInRegistry(currentUser, false).catch(console.error);
        // Automatically sync and merge any local storage entries into Firestore (History)
        const saved = localStorage.getItem("elder_deck_history_v1");
        if (saved) {
          try {
            const localHistory: HistoryEntry[] = JSON.parse(saved);
            if (localHistory.length > 0) {
              const colRef = collection(db, "users", currentUser.uid, "history");
              // Check existing entries to prevent duplication
              const existingSnapshot = await getDocs(query(colRef, orderBy("timestamp", "desc")));
              const existingTimestamps = new Set(existingSnapshot.docs.map(doc => doc.data().timestamp));

              const batch = writeBatch(db);
              let hasUpdates = false;

              localHistory.forEach((entry) => {
                if (!existingTimestamps.has(entry.timestamp)) {
                  const newDocRef = doc(colRef);
                  batch.set(newDocRef, entry);
                  hasUpdates = true;
                }
              });

              if (hasUpdates) {
                await batch.commit();
              }
              localStorage.removeItem("elder_deck_history_v1");
            }
          } catch (e) {
            console.error("Failed to sync local logs to Firebase:", e);
          }
        }

        // Automatically sync and merge any local storage entries into Firestore (Prophecies)
        const savedPropheciesLocal = localStorage.getItem("elder_deck_prophecies_v1");
        if (savedPropheciesLocal) {
          try {
            const localProphecies: SavedProphecy[] = JSON.parse(savedPropheciesLocal);
            if (localProphecies.length > 0) {
              const colRef = collection(db, "users", currentUser.uid, "prophecies");
              const existingSnapshot = await getDocs(colRef);
              const existingIds = new Set(existingSnapshot.docs.map(doc => doc.id));

              const batch = writeBatch(db);
              let hasUpdates = false;

              localProphecies.forEach((p) => {
                if (!existingIds.has(p.id)) {
                  const newDocRef = doc(colRef, p.id);
                  batch.set(newDocRef, p);
                  hasUpdates = true;
                }
              });

              if (hasUpdates) {
                await batch.commit();
              }
              localStorage.removeItem("elder_deck_prophecies_v1");
            }
          } catch (e) {
            console.error("Failed to sync local prophecies to Firebase:", e);
          }
        }

        // Automatically sync and merge any local storage entries into Firestore (Journals)
        const savedJournalsLocal = localStorage.getItem("elder_deck_journals_v1");
        if (savedJournalsLocal) {
          try {
            const localJournals: JournalEntry[] = JSON.parse(savedJournalsLocal);
            if (localJournals.length > 0) {
              const colRef = collection(db, "users", currentUser.uid, "journals");
              const existingSnapshot = await getDocs(colRef);
              const existingIds = new Set(existingSnapshot.docs.map(doc => doc.id));

              const batch = writeBatch(db);
              let hasUpdates = false;

              localJournals.forEach((j) => {
                if (!existingIds.has(j.id)) {
                  const newDocRef = doc(colRef, j.id);
                  batch.set(newDocRef, j);
                  hasUpdates = true;
                }
              });

              if (hasUpdates) {
                await batch.commit();
              }
              localStorage.removeItem("elder_deck_journals_v1");
            }
          } catch (e) {
            console.error("Failed to sync local journals to Firebase:", e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Monitor subscription status in Firestore, local cache, or via Exempt list
  useEffect(() => {
    if (!user) {
      setIsSubscribed(false);
      return;
    }

    const EXEMPT_EMAILS = [
      "elliot@raindance.co.uk",
      "hawkpercival@asphodelpress.org"
    ];

    if (user.email && EXEMPT_EMAILS.includes(user.email.toLowerCase())) {
      setIsSubscribed(true);
      return;
    }

    // Real-time Firestore subscription check
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().isSubscribed) {
        setIsSubscribed(true);
        localStorage.setItem("elder_deck_subscribed_v1", "true");
      } else {
        const localSub = localStorage.getItem("elder_deck_subscribed_v1") === "true";
        if (localSub) {
          setDoc(userDocRef, { 
            isSubscribed: true,
            covenantStatus: "active",
            subscriptionLoggedAt: new Date().toISOString(),
            email: user.email || ""
          }, { merge: true }).catch(console.error);
        }
        setIsSubscribed(localSub);
      }
    }, (error) => {
      console.error("Firestore user status subscription error:", error);
      const localSub = localStorage.getItem("elder_deck_subscribed_v1") === "true";
      setIsSubscribed(localSub);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time update to App Registry Account whenever user or subscription status updates
  useEffect(() => {
    if (user) {
      trackUserAccountInRegistry(user, isSubscribed).catch(console.error);
    }
  }, [user, isSubscribed]);

  // Subscribe to real-time coven soul count
  useEffect(() => {
    const statsDocRef = doc(db, "app_registry_stats", "summary");
    const unsubscribe = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.totalUsersCount === "number") {
          setTotalUsersCount(data.totalUsersCount);
        }
      }
    }, (error) => {
      console.warn("Real-time stats sync error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Trigger specialized popup for Elliot when logging in for the first time
  useEffect(() => {
    if (!user || !user.email) return;

    const normalizedEmail = user.email.toLowerCase();
    const isElliotUser = normalizedEmail === "elliot@raindance.co.uk" || normalizedEmail === "elliot.raindance.co.uk";

    if (isElliotUser) {
      const localShown = localStorage.getItem("elliot_love_shown_v1") === "true";
      if (!localShown) {
        // Double-check Firestore database record to avoid showing on other devices
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then((snap) => {
          if (snap.exists() && snap.data()?.elliotLoveShown === true) {
            localStorage.setItem("elliot_love_shown_v1", "true");
          } else {
            setShowElliotPopup(true);
          }
        }).catch((err) => {
          console.error("Error checking Elliot status in Firestore:", err);
          // Fallback to local storage if firestore gets blocked
          setShowElliotPopup(true);
        });
      }
    }
  }, [user]);

  const handleCloseElliotPopup = async () => {
    setShowElliotPopup(false);
    localStorage.setItem("elliot_love_shown_v1", "true");
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { elliotLoveShown: true }, { merge: true });
      } catch (e) {
        console.error("Failed to store Elliot status in Firestore:", e);
      }
    }
  };

  // Auto-trigger paywall modal if trial draw is exhausted and user is not subscribed
  // This is now handled in handleFlipCard for the first card.
  // We keep this for subsequent draws or if the condition is met later.
  useEffect(() => {
    if (!isSubscribed && history.length > 1) {
      setShowPaywallModal(true);
    }
  }, [isSubscribed, history.length]);

  // Capture Stripe Checkout redirect success or cancel parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const sessionId = params.get("session_id");
    const cancel = params.get("cancel");

    if (cancel) {
      showToast("Thy covenant with Stripe was cancelled. The seers await thy return.", "info");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    if (success && sessionId) {
      const verifyCheckout = async () => {
        try {
          const response = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);
          const data = await response.json();
          if (response.ok && data.success) {
            localStorage.setItem("elder_deck_subscribed_v1", "true");
            setIsSubscribed(true);

            const activeUserId = user?.uid || data.userId || "";
            const activeUserEmail = user?.email || data.customerEmail || "";
            const currentIso = new Date().toISOString();
            const nextCycleIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const paymentLogData = {
              id: sessionId,
              userId: activeUserId,
              email: activeUserEmail,
              amount: data.amountTotal || 2.99,
              currency: data.currency || "usd",
              status: "paid",
              sessionId: sessionId,
              paymentMethod: "stripe_checkout",
              createdAt: currentIso,
              nextBillingCycle: nextCycleIso
            };

            // Write global payment log
            try {
              await setDoc(doc(db, "payment_logs", sessionId), paymentLogData);
            } catch (pErr) {
              console.warn("Notice: Writing global payment log:", pErr);
            }

            if (activeUserId) {
              const userDocRef = doc(db, "users", activeUserId);
              await setDoc(userDocRef, { 
                isSubscribed: true,
                covenantStatus: "active",
                subscriptionCurrency: data.currency || "usd",
                subscriptionAmount: data.amountTotal || 2.99,
                subscriptionLoggedAt: currentIso,
                lastPaymentSessionId: sessionId,
                email: activeUserEmail,
                updatedAt: currentIso
              }, { merge: true });

              // Write user specific payment log
              try {
                await setDoc(doc(db, "users", activeUserId, "payment_logs", sessionId), paymentLogData);
              } catch (pErr) {
                console.warn("Notice: Writing user payment log:", pErr);
              }
            } else {
              setShowAuthModal(true);
              showToast("Thy Covenant is sealed! Create a profile to save thy status.", "success");
            }
            
            sfx.playMysticChime("Epic");
            showToast("The Covenant is sealed! Welcome, premium Seer.", "success");
          } else {
            showToast("The validation of thy offering failed: " + (data.error || "unknown error"), "error");
          }
        } catch (e) {
          console.error("Verification failed:", e);
        } finally {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      };
      
      verifyCheckout();
    } else if (success) {
      // Just in case they are exempt and success=true is returned without session_id
      localStorage.setItem("elder_deck_subscribed_v1", "true");
      setIsSubscribed(true);
      if (!user) {
        setShowAuthModal(true);
        showToast("Thy Covenant is sealed! Create a profile to save thy status.", "success");
      }
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [user]);

  const handleSubscribe = async (selectedCurrency: "USD" | "GBP" = "USD") => {
    setStripeLoading(true);
    sfx.playFullShuffle();
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "",
          userId: user?.uid || "",
          currency: selectedCurrency.toLowerCase(),
        }),
      });
      const data = await response.json();
      if (response.ok && data.url) {
        const newWindow = window.open(data.url, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          window.location.href = data.url;
        }
      } else {
        showToast("Arcane disturbance prevented summoning checkout gate: " + (data.error || "unknown error"), "error");
      }
    } catch (e: any) {
      showToast("Error initiating checkout: " + e.message, "error");
    } finally {
      setStripeLoading(false);
    }
  };

  // Listen to history log changes in Firestore or local storage depending on auth
  useEffect(() => {
    if (!user) {
      // Local Storage Fallback when signed out
      const saved = localStorage.getItem("elder_deck_history_v1");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse local history.");
        }
      } else {
        setHistory([]);
      }
      return;
    }

    // Subscribe to Firestore changes in real-time
    const colRef = collection(db, "users", user.uid, "history");
    const q = query(colRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: HistoryEntry[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as HistoryEntry);
      });
      setHistory(items);
    }, (error) => {
      console.error("Firestore history subscription error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to saved prophecies in Firestore or local storage depending on auth
  useEffect(() => {
    if (!user) {
      // Local Storage Fallback when signed out
      const saved = localStorage.getItem("elder_deck_prophecies_v1");
      if (saved) {
        try {
          setProphecies(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse local prophecies.");
        }
      } else {
        setProphecies([]);
      }
      return;
    }

    // Subscribe to Firestore prophecies in real-time
    const colRef = collection(db, "users", user.uid, "prophecies");
    const q = query(colRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: SavedProphecy[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as SavedProphecy);
      });
      setProphecies(items);
    }, (error) => {
      console.error("Firestore prophecies subscription error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to saved journals in Firestore or local storage depending on auth
  useEffect(() => {
    if (!user) {
      // Local Storage Fallback when signed out
      const saved = localStorage.getItem("elder_deck_journals_v1");
      if (saved) {
        try {
          setSavedJournals(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse local journals.");
        }
      } else {
        setSavedJournals([]);
      }
      return;
    }

    // Subscribe to Firestore journals in real-time
    const colRef = collection(db, "users", user.uid, "journals");
    const q = query(colRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: JournalEntry[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as JournalEntry);
      });
      setSavedJournals(items);
    }, (error) => {
      console.error("Firestore journals subscription error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Save history helper (mostly used as fallback/offline mode)
  const saveHistory = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem("elder_deck_history_v1", JSON.stringify(newHistory));
  };

  const savePropheciesLocal = (newProphecies: SavedProphecy[]) => {
    setProphecies(newProphecies);
    localStorage.setItem("elder_deck_prophecies_v1", JSON.stringify(newProphecies));
  };

  // Save prophecy capability
  const handleSaveProphecy = async (
    question: string,
    omen: string,
    trial: string,
    destiny: string
  ) => {
    if (!selectedCard) return;

    const newProphecy: Omit<SavedProphecy, "id"> = {
      timestamp: new Date().toISOString(),
      question,
      cardId: selectedCard.id,
      cardName: selectedCard.name,
      cardRarity: selectedCard.rarity,
      cardArchetype: selectedCard.archetype,
      omen,
      trial,
      destiny
    };

    if (user) {
      try {
        const colRef = collection(db, "users", user.uid, "prophecies");
        await addDoc(colRef, newProphecy);
      } catch (e) {
        console.error("Failed to save prophecy to Firestore:", e);
        // Save locally as fallback
        const id = "local_" + Math.random().toString(36).substring(2, 11);
        savePropheciesLocal([{ id, ...newProphecy }, ...prophecies]);
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/prophecies`);
      }
    } else {
      const id = "local_" + Math.random().toString(36).substring(2, 11);
      savePropheciesLocal([{ id, ...newProphecy }, ...prophecies]);
    }
  };

  // Delete prophecy capability
  const handleDeleteProphecy = async (id: string) => {
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "prophecies", id);
        await deleteDoc(docRef);
      } catch (e) {
        console.error("Failed to delete prophecy from Firestore:", e);
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/prophecies/${id}`);
      }
    } else {
      const updated = prophecies.filter(p => p.id !== id);
      savePropheciesLocal(updated);
    }
  };

  // Clear all saved prophecies
  const handleClearArchive = async () => {
    if (user) {
      try {
        const colRef = collection(db, "users", user.uid, "prophecies");
        const snapshot = await getDocs(colRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } catch (e) {
        console.error("Failed to clear prophecy archive from Firestore:", e);
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/prophecies`);
      }
    } else {
      savePropheciesLocal([]);
    }
  };

  // Rotate Skyrim loading tips
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * GAME_TIPS.length);
      setTipText(GAME_TIPS[idx]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle entering the sanctuary (first interaction allows Web Audio context)
  const handleEnterSanctuary = () => {
    setShowIntro(false);
    sfx.init();
    sfx.startThemeMusic(currentTrackId);
    setMusicOn(true);
    sfx.playMysticChime("Rare");
  };

  // Toggle background celestial theme music
  const handleToggleMusic = () => {
    sfx.init();
    if (musicOn) {
      sfx.stopThemeMusic();
      setMusicOn(false);
    } else {
      sfx.startThemeMusic(currentTrackId);
      setMusicOn(true);
      sfx.playShuffleTick(0, 1.25);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    sfx.init();
    setCurrentTrackId(trackId);
    sfx.playTrack(trackId);
    setMusicOn(true);
  };

  // Safe cleanup of Web Audio nodes on unmount
  useEffect(() => {
    return () => {
      sfx.stopThemeMusic();
    };
  }, []);

  // Algorithmically shuffle and select card with weight distribution
  const handleChooseCard = () => {
    if (isShuffling) return;

    if (!isSubscribed && history.length >= 1) {
      setShowPaywallModal(true);
      sfx.playFlip();
      return;
    }

    // Reset card view
    setIsShuffling(true);
    setIsFlipped(false);
    setSelectedCard(null);
    setActiveCodexTab("oracle");

    // Swap tips on shuffle for engagement
    const randomTip = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
    setTipText(randomTip);

    // Synthesize physical shuffle sound
    sfx.playFullShuffle();

    // 1.5 seconds simulated shuffle
    setTimeout(() => {
      // Get IDs of all cards drawn by the user to ensure never pulling the same card twice
      const drawnIds = history.map(h => h.cardId);

      // We have a 40% chance to draw from Signature Cards and a 60% chance to generate a new custom Prophecy card
      const isProcedural = Math.random() < 0.6;

      let drawn: Card;

      if (!isProcedural) {
        // Draw a hand-crafted signature card
        let pool = MEDIEVAL_DECK.filter(c => !drawnIds.includes(c.id));

        // Fallback to entire deck if all signature cards have been drawn
        if (pool.length === 0) {
          pool = [...MEDIEVAL_DECK];
        }

        // Apply alignment filter if selected
        if (alignmentFilter !== "All") {
          const matches = pool.filter(c => c.archetype === alignmentFilter);
          if (matches.length > 0) {
            pool = matches;
          }
        }

        // Shuffle the selected pool
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        drawn = pool[0];
      } else {
        // Draw a brand new procedural card!
        // Determine the archetype based on filter, or pick a random one
        let selectedArchetype: string;
        if (alignmentFilter !== "All") {
          selectedArchetype = alignmentFilter;
        } else {
          const archetypes = ["Warrior", "Mage", "Thief", "Fate"];
          selectedArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        }

        // Generate a random seed
        const randomSeed = Math.floor(Math.random() * 10000000).toString();
        const procId = `proc_${selectedArchetype}_${randomSeed}`;

        drawn = generateProceduralCard(procId);
      }

      setSelectedCard(drawn);

      // Select randomized Fortune of the Day based on drawn card's archetype
      const list = FORTUNES[drawn.archetype as keyof typeof FORTUNES] || FORTUNES["Fate"];
      const randIdx = Math.floor(Math.random() * list.length);
      setCurrentFortune(list[randIdx]);

      setIsShuffling(false);
      sfx.playFlip(); // play a card-deal thud
    }, 1600);
  };

  // Flip active card and log to historical records
  const handleFlipCard = async () => {
    if (!selectedCard || isFlipped) return;

    setIsFlipped(true);
    if (!isSubscribed && history.length === 0) {
      setTimeout(() => setShowPaywallModal(true), 600);
    }
    sfx.playFlip(selectedCard.rarity);
    setActiveCodexTab("oracle");
    
    // Play majestic chords based on card rarity
    setTimeout(() => {
      sfx.playMysticChime(selectedCard.rarity);
    }, 200);

    // Save draw into quest journal
    const newEntry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      cardId: selectedCard.id,
      cardName: selectedCard.name,
      cardRarity: selectedCard.rarity,
      cardArchetype: selectedCard.archetype,
    };

    if (user) {
      try {
        const colRef = collection(db, "users", user.uid, "history");
        await addDoc(colRef, newEntry);
      } catch (e) {
        console.error("Error saving reading to Firebase:", e);
        saveHistory([newEntry, ...history]);
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/history`);
      }
    } else {
      saveHistory([newEntry, ...history]);
    }
  };

  // Inspect previous drawings from history list
  const handleSelectHistoricalCard = (cardId: string) => {
    let card: Card | undefined;
    if (isProceduralId(cardId)) {
      card = generateProceduralCard(cardId);
    } else {
      card = MEDIEVAL_DECK.find(c => c.id === cardId);
    }

    if (card) {
      setSelectedCard(card);
      setIsFlipped(true);
      setCurrentFortune(null); // Fortune of the Day only appears on new card draws
      setActiveCodexTab("oracle");
      sfx.playFlip(card.rarity);
      sfx.playMysticChime(card.rarity);
      
      // Scroll smoothly to active table card
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Burn logs
  const handleClearLogs = async () => {
    if (confirm("Are you certain you wish to burn thy records of fate? This action is irreversible.")) {
      if (user) {
        try {
          const colRef = collection(db, "users", user.uid, "history");
          const snapshot = await getDocs(colRef);
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        } catch (e) {
          console.error("Failed to burn records in Firebase:", e);
          handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/history`);
        }
      } else {
        saveHistory([]);
      }
      sfx.playFullShuffle();
    }
  };

  const saveJournalsLocal = (newJournals: JournalEntry[]) => {
    setSavedJournals(newJournals);
    localStorage.setItem("elder_deck_journals_v1", JSON.stringify(newJournals));
  };

  const handleSaveJournal = async (entry: Omit<JournalEntry, "id" | "timestamp">) => {
    const newJournal: Omit<JournalEntry, "id"> = {
      timestamp: new Date().toISOString(),
      ...entry
    };

    if (user) {
      try {
        const colRef = collection(db, "users", user.uid, "journals");
        await addDoc(colRef, newJournal);
      } catch (e) {
        console.error("Failed to save journal to Firestore:", e);
        // Save locally as fallback
        const id = "local_j_" + Math.random().toString(36).substring(2, 11);
        saveJournalsLocal([{ id, ...newJournal }, ...savedJournals]);
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/journals`);
      }
    } else {
      const id = "local_j_" + Math.random().toString(36).substring(2, 11);
      saveJournalsLocal([{ id, ...newJournal }, ...savedJournals]);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "journals", id);
        await deleteDoc(docRef);
      } catch (e) {
        console.error("Failed to delete journal from Firestore:", e);
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/journals/${id}`);
      }
    } else {
      const updated = savedJournals.filter(j => j.id !== id);
      saveJournalsLocal(updated);
    }
  };

  const handleClearJournals = async () => {
    if (user) {
      try {
        const colRef = collection(db, "users", user.uid, "journals");
        const snapshot = await getDocs(colRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } catch (e) {
        console.error("Failed to clear journal vault from Firestore:", e);
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/journals`);
      }
    } else {
      saveJournalsLocal([]);
    }
  };

  const handleUpdateJournal = async (id: string, updates: Partial<JournalEntry>) => {
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "journals", id);
        await setDoc(docRef, updates, { merge: true });
      } catch (e) {
        console.error("Failed to update journal in Firestore:", e);
        // Save locally as fallback
        const updated = savedJournals.map(j => j.id === id ? { ...j, ...updates } : j);
        saveJournalsLocal(updated);
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/journals/${id}`);
      }
    } else {
      const updated = savedJournals.map(j => j.id === id ? { ...j, ...updates } : j);
      saveJournalsLocal(updated);
    }
  };

  return (
    <div 
      id="skyrim-root" 
      className="min-h-screen text-gray-200 font-serif relative overflow-x-hidden selection:bg-skyrim-gold selection:text-black border-[12px] md:border-[16px] border-skyrim-slate flex flex-col justify-between"
      style={{ backgroundImage: "radial-gradient(circle, #2c241c 0%, #0f0d0b 100%)" }}
    >
      
      {/* Background Subtle Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* ================= SPLASH INTRO SCREEN ================= */}
      {showIntro ? (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-between p-8 overflow-hidden border-[12px] md:border-[16px] border-skyrim-slate"
          style={{ backgroundImage: "radial-gradient(circle, #2c241c 0%, #0f0d0b 100%)" }}
        >
          {/* 3D Silver Daggers Floating Interactive Background */}
          <Dagger3DBackground />
          <Gauntlet3DBackground />

          {/* Subtle mist effect backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_70%)] animate-pulse" />
          
          {/* Top layout */}
          <div className="flex justify-between items-center text-skyrim-gold/50 font-serif text-[10px] tracking-[0.3em] uppercase max-w-7xl mx-auto w-full border-b border-skyrim-gold/15 pb-4 z-10">
            <span>THE ELDER DECKS</span>
            <span>PROPHETIC ANCHOR</span>
          </div>

          {/* Main Title Center */}
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center justify-center my-auto space-y-8 z-10">
            <div className="relative">
              {/* Runic pulsing ring */}
              <div className="absolute inset-0 -m-12 border border-skyrim-gold/5 rounded-full animate-spin" style={{ animationDuration: "120s" }} />
              <div className="absolute inset-0 -m-6 border border-skyrim-gold/15 rounded-full animate-spin" style={{ animationDuration: "60s" }} />
              
              <h1 className="font-serif text-5xl md:text-6xl font-black tracking-[0.25em] text-[#f1e5ac] skyrim-text-shadow uppercase">
                Elder Deck
              </h1>
              <p className="font-medieval text-skyrim-gold text-sm tracking-[0.15em] uppercase mt-2">
                Medieval Card of the Day
              </p>
            </div>

            <div className="w-16 h-[1px] bg-skyrim-gold/30" />

            {/* Live Changing Skyrim-style Loading Tips Block */}
            <div className="bg-skyrim-stone/60 border border-skyrim-gold/20 p-5 rounded-sm max-w-lg shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
              <span className="font-serif text-[10px] tracking-[0.25em] text-skyrim-gold font-bold block mb-2 uppercase">
                Chronicle Archives
              </span>
              <p className="text-gray-300 text-xs leading-relaxed italic font-serif">
                "{tipText}"
              </p>
            </div>

            <button
              onClick={handleEnterSanctuary}
              className="group relative px-12 py-4 bg-white/5 backdrop-blur-md border border-skyrim-gold/30 hover:border-skyrim-gold text-skyrim-gold-light hover:text-white font-serif text-xs font-bold tracking-[0.25em] transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.97] cursor-pointer uppercase overflow-hidden"
            >
              {/* Curved glossy reflection overlay typical of glassmorphism */}
              <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              {/* Subtle hover gleam effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              {/* Corner squares for introduction button */}
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-[#d4af37] shadow-[0_0_4px_#d4af37]"></div>
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#d4af37] shadow-[0_0_4px_#d4af37]"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#d4af37] shadow-[0_0_4px_#d4af37]"></div>
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#d4af37] shadow-[0_0_4px_#d4af37]"></div>
              
              <span className="relative z-10 drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">
                Enter the Sanctuary
              </span>
            </button>
          </div>

          {/* Bottom layout */}
          <div className="flex justify-between items-center text-skyrim-gold/40 font-mono text-[9px] uppercase max-w-7xl mx-auto w-full border-t border-skyrim-gold/15 pt-4 z-10">
            <span>© 2026 COVEN OF RUNES</span>
            <span>SHUFFLE TO UNVEIL DOOM</span>
          </div>
        </div>
      ) : null}


      {/* ================= MAIN APPLICATION LAYOUT ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10 flex flex-col space-y-8 w-full">
        
        {/* APP HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-skyrim-gold/20 pb-4 space-y-4 md:space-y-0 w-full">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center space-x-2">
              <span className="text-skyrim-gold"><Crown className="w-3.5 h-3.5" /></span>
              <span className="font-serif text-[9px] tracking-[0.3em] text-skyrim-gold-light uppercase font-bold">
                Daily Runic Seer
              </span>
            </div>
            <h1 className="font-serif text-3xl font-black tracking-[0.15em] text-[#f1e5ac] uppercase mt-0.5 skyrim-text-shadow">
              Elder Deck
            </h1>
          </div>

          {/* Controls: Ambient Drone Audio Trigger and User Auth */}
          <div className="flex items-center space-x-3.5 flex-wrap justify-center gap-y-2">
            {/* User Auth Status/Button */}
            {authLoading ? (
              <span className="text-[10px] font-serif tracking-widest text-gray-500 uppercase animate-pulse">
                Seeking Soul...
              </span>
            ) : user ? (
              <div className="flex items-center space-x-2 bg-skyrim-slate/50 border border-skyrim-gold/15 px-3 py-1.5 rounded-sm relative group">
                <UserIcon className="w-3.5 h-3.5 text-skyrim-gold animate-pulse" />
                <span className="text-[10px] font-sans font-bold text-skyrim-gold-light max-w-[120px] truncate uppercase tracking-wider" title={user.email || "Nameless Wanderer"}>
                  {user.isAnonymous ? "Nameless Guest" : (user.email ? user.email.split("@")[0] : "Wanderer")}
                </span>
                <button
                  onClick={async () => {
                    sfx.playFlip();
                    await signOut(auth);
                  }}
                  title="Disconnect Soul (Sign Out)"
                  className="text-gray-500 hover:text-red-400 transition-colors p-0.5 ml-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sfx.playShuffleTick(0, 1.2);
                  setShowAuthModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-skyrim-gold/5 border border-skyrim-gold/25 hover:bg-skyrim-gold/15 hover:border-skyrim-gold text-skyrim-gold text-[10px] font-serif tracking-widest uppercase transition-all rounded-sm cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.05)] hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connect Soul</span>
              </button>
            )}

            {/* Join The Band Social Hub CTA Button */}
            <button
              onClick={() => {
                sfx.playShuffleTick(0, 1.25);
                setActiveCodexTab("band");
                const codexElement = document.getElementById("codex-section");
                if (codexElement) {
                  codexElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/50 hover:border-purple-400 text-purple-200 text-[10px] font-serif tracking-widest uppercase font-semibold transition-all rounded-sm cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              title="Open Join The Band Nigromancy Coven"
            >
              <Users className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>Join The Band</span>
            </button>

            {/* Premium Covenant Status Badge/Button */}
            {isSubscribed ? (
              <div className="flex items-center space-x-1 bg-[#d4af37]/15 border border-[#d4af37]/40 px-3.5 py-1.5 rounded-sm text-[#f1e5ac] text-[10px] font-serif tracking-widest uppercase font-semibold">
                <Crown className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
                <span>Premium Seer</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  sfx.playShuffleTick(0, 1.2);
                  setShowPaywallModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#2a241e] border border-skyrim-gold/40 hover:border-skyrim-gold text-skyrim-gold text-[10px] font-serif tracking-widest uppercase font-semibold transition-all rounded-sm cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.15)] hover:bg-[#3d342b]"
              >
                <Crown className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Join Covenant</span>
              </button>
            )}

            {/* Fantasy & Horror Music Library selector dropdown */}
            <div className="flex items-center space-x-2 bg-black/40 border border-skyrim-slate rounded-sm px-3 py-2">
              <span className="text-[10px] font-serif uppercase tracking-widest text-[#d4af37] font-semibold flex items-center space-x-1">
                <span>🎵 Music:</span>
              </span>
              <select
                value={currentTrackId}
                onChange={(e) => handleSelectTrack(e.target.value)}
                className="bg-transparent border-none text-skyrim-gold-light hover:text-white text-[10px] font-serif font-bold uppercase tracking-widest focus:outline-none cursor-pointer max-w-[170px]"
              >
                {MUSIC_LIBRARY.map((track) => (
                  <option key={track.id} value={track.id} className="bg-[#181310] text-[#f1e5ac] text-xs font-serif">
                    {track.icon} {track.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleToggleMusic}
              className={`flex items-center space-x-2 px-4 py-2 rounded-sm border text-[10px] font-serif tracking-widest uppercase transition-all cursor-pointer ${
                musicOn 
                  ? "bg-[#6d28d9]/15 text-[#d8b4fe] border-[#a78bfa]/40 hover:bg-[#6d28d9]/25 hover:border-[#c084fc]" 
                  : "bg-black/40 text-gray-400 border-skyrim-slate hover:text-gray-200 hover:border-[#6d28d9]/30"
              }`}
              title="Toggle fantasy/horror background theme music"
            >
              {musicOn ? <Music className="w-3.5 h-3.5 animate-pulse text-[#c084fc]" /> : <Music className="w-3.5 h-3.5 text-gray-500" />}
              <span>{musicOn ? "Music: On" : "Music: Off"}</span>
            </button>

            <button
              onClick={() => {
                setShowSpatialAudioModal(true);
                sfx.playShuffleTick(0, 1.2);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-sm border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 hover:border-amber-400 text-[10px] font-serif tracking-widest uppercase transition-all cursor-pointer shadow-sm"
              title="Configure 3D Spatial Audio (Tavern Fireplace, Mountain Winds, Runic Chanting)"
              id="open-spatial-audio-modal-button"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>3D Spatial Sound</span>
            </button>

            <div
              className="flex items-center space-x-2 px-3.5 py-2 rounded-sm border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-[10px] font-serif tracking-widest uppercase shadow-sm selection:bg-transparent"
              title="Real-time active coven souls registered to the system"
              id="registered-souls-count"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Coven Souls: <strong className="text-emerald-200 font-mono text-[11px] ml-1">{totalUsersCount !== null ? totalUsersCount : "..."}</strong></span>
            </div>
          </div>
        </header>


        {/* MAIN GRID: CARD DEALER + STATS/JOURNAL PANEL */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: DECK & CARD DRAWING STAGE (7 cols) */}
          <section className="lg:col-span-7 bg-skyrim-stone/60 border border-skyrim-gold/15 rounded-sm p-6 shadow-[inset_0_0_30px_rgba(0,0,0,0.85)] flex flex-col items-center space-y-6">
            
            {/* STAGE HEADER: ALIGNMENT STONE SELECTION */}
            <div className="w-full text-center flex flex-col space-y-3 pb-3 border-b border-skyrim-gold/10">
              <span className="font-serif text-[10px] tracking-[0.25em] text-skyrim-gold font-bold uppercase">
                Choose Thy Runic Alignment
              </span>
              
              {/* Alignment Selector: styled as Guardian Stones */}
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {[
                  { id: "All", label: "Fate", icon: Compass, color: "hover:border-skyrim-gold text-skyrim-gold-light", activeClass: "stone-active-fate", delay: "0s" },
                  { id: "Warrior", label: "Warrior", icon: Sword, color: "hover:border-red-500 text-red-400", activeClass: "stone-active-warrior", delay: "0.4s" },
                  { id: "Mage", label: "Mage", icon: Sparkles, color: "hover:border-cyan-500 text-cyan-400", activeClass: "stone-active-mage", delay: "0.8s" },
                  { id: "Thief", label: "Thief", icon: Feather, color: "hover:border-emerald-500 text-emerald-400", activeClass: "stone-active-thief", delay: "1.2s" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = alignmentFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAlignmentFilter(item.id as any);
                        sfx.playShuffleTick(0, isActive ? 1.3 : 1.1);
                      }}
                      className={`flex flex-col items-center p-2 rounded-sm border transition-all cursor-pointer ${
                        isActive
                          ? `${item.activeClass} scale-[1.03]`
                          : "bg-black/35 border-skyrim-gold/10 text-gray-500 animate-stone-float"
                      } ${item.color}`}
                      style={{ animationDelay: item.delay }}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="font-serif text-[9px] tracking-wider uppercase font-bold">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* THE CARD FIELD */}
            <div className="relative min-h-[500px] w-full flex items-center justify-center p-4">
              
              {isShuffling ? (
                /* Shuffling Deck Visual Effect */
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                  {/* Staggered visual fan of shuffling card-backs */}
                  <div className="relative w-48 h-72 flex items-center justify-center">
                    {[1, 2, 3, 4].map((n) => (
                      <div 
                        key={n}
                        className="absolute w-44 h-[260px] rounded-sm border border-skyrim-gold/30 shadow-2xl bg-skyrim-stone overflow-hidden"
                        style={{
                          transform: `rotate(${(n - 2.5) * 12}deg) translate(${(n - 2.5) * 15}px, ${Math.abs(n - 2.5) * 4}px)`,
                          opacity: 0.9 - n * 0.1,
                          zIndex: 10 - n
                        }}
                      >
                        <img 
                          src="/src/assets/images/card_back_3d_1784953684442.jpg" 
                          alt="Shuffling Deck Layer"
                          className="w-full h-full object-cover opacity-70"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Loading spinner and misty tips text */}
                  <div className="text-center max-w-sm px-4">
                    <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-skyrim-gold animate-spin mx-auto mb-3" />
                    <span className="font-medieval text-[#f1e5ac] text-sm tracking-widest uppercase block mb-1">
                      Algorithmic Shuffle
                    </span>
                    <p className="font-serif text-[11px] text-gray-400 italic">
                      "{tipText}"
                    </p>
                  </div>
                </div>
              ) : selectedCard ? (
                /* Active Card (Face-down or Face-up) */
                <div className="flex flex-col items-center space-y-4 animate-fade-in">
                  <MedievalCard 
                    key={selectedCard.id}
                    card={selectedCard}
                    isFlipped={isFlipped}
                    onClick={handleFlipCard}
                    interactive={!isFlipped}
                  />
                  
                  {!isFlipped && (
                    <div className="text-center animate-bounce mt-2 pointer-events-none">
                      <span className="font-medieval text-xs text-skyrim-gold-light tracking-widest uppercase bg-black/60 border border-skyrim-gold/30 px-4 py-2 rounded-full shadow-lg">
                        ✦ Click Card to Unveil Fate ✦
                      </span>
                    </div>
                  )}

                  {currentFortune && (
                    <div className="w-full max-w-sm mt-4 p-4 rounded-sm border border-skyrim-gold/20 bg-black/40 backdrop-blur-sm text-center relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.5)] animate-fade-in">
                      {/* Decorative Golden Corners */}
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-skyrim-gold/45" />
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-skyrim-gold/45" />
                      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-skyrim-gold/45" />
                      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-skyrim-gold/45" />
                      
                      <div className="flex items-center justify-center space-x-1.5 mb-1.5 text-skyrim-gold-light">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-skyrim-gold" />
                        <span className="font-medieval text-[10px] tracking-[0.2em] uppercase">
                          Fortune of the Day
                        </span>
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-skyrim-gold" />
                      </div>
                      <p className="font-serif text-[11px] text-[#e3d7a3] leading-relaxed italic px-2">
                        "{currentFortune}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Card Slot: The Dormant Stack in Frutiger Aero Nigromancy theme */
                <div className="w-full max-w-sm mx-auto p-6 rounded-md frutiger-nigro-bg frutiger-glossy-shine frutiger-glass-swipe border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col items-center space-y-6 text-center">
                  
                  {/* Floating Frutiger Aero Nigromancy Bubbles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="frutiger-bubble w-4 h-4 left-[12%] bottom-[-20px]" style={{ animationDelay: '0s', animationDuration: '6s' }} />
                    <div className="frutiger-bubble w-6 h-6 left-[32%] bottom-[-30px]" style={{ animationDelay: '1.2s', animationDuration: '8.5s' }} />
                    <div className="frutiger-bubble w-5 h-5 left-[58%] bottom-[-25px]" style={{ animationDelay: '2.5s', animationDuration: '7.5s' }} />
                    <div className="frutiger-bubble w-7 h-7 left-[78%] bottom-[-35px]" style={{ animationDelay: '4s', animationDuration: '9.5s' }} />
                    <div className="frutiger-bubble w-3 h-3 left-[46%] bottom-[-15px]" style={{ animationDelay: '5.5s', animationDuration: '5.5s' }} />
                    <div className="frutiger-bubble w-5 h-5 left-[24%] bottom-[-25px]" style={{ animationDelay: '6.8s', animationDuration: '8s' }} />
                  </div>
                  
                  {/* Pile representation of 3D layered card pile */}
                  <div 
                    className="relative w-52 h-76 mb-2 z-10 cursor-pointer"
                    onMouseEnter={() => {
                      setDeckHovered(true);
                      sfx.playShuffleTick(0, 0.95);
                      sfx.playShuffleTick(0.04, 1.05);
                      sfx.playShuffleTick(0.08, 1.2);
                    }}
                    onMouseLeave={() => setDeckHovered(false)}
                  >
                    {[1, 2, 3].map((layer) => {
                      // Custom transition logic for fanning out
                      let transformStyle = "";
                      if (deckHovered) {
                        if (layer === 3) {
                          transformStyle = "translate(-48px, 16px) rotate(-14deg)";
                        } else if (layer === 2) {
                          transformStyle = "translate(-24px, 6px) rotate(-7deg)";
                        } else { // layer === 1
                          transformStyle = "translate(24px, 6px) rotate(7deg)";
                        }
                      } else {
                        transformStyle = `translate(${-layer * 4}px, ${layer * 4}px) rotate(${-layer * 1.5}deg)`;
                      }

                      return (
                        <div 
                          key={layer}
                          className="absolute inset-0 rounded-sm border border-emerald-500/20 shadow-xl bg-[#091510] overflow-hidden transition-all duration-500 ease-out"
                          style={{
                            transform: transformStyle,
                            zIndex: 10 - layer
                          }}
                        >
                          <img 
                            src="/src/assets/images/card_back_3d_1784953684442.jpg" 
                            alt="Dormant Tarot Pile Stack"
                            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-[#064e3b]/30 mix-blend-color" />
                          <div className="absolute inset-0 bg-black/40" />
                        </div>
                      );
                    })}
                    
                    {/* Top deck card back with neon-green shadow / gloss */}
                    <div 
                      className="absolute inset-0 rounded-sm border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-[#0a1410] flex flex-col justify-between p-4 z-10 overflow-hidden transition-all duration-500 ease-out"
                      style={{
                        transform: deckHovered ? "translate(48px, 16px) rotate(14deg)" : "translate(0px, 0px) rotate(0deg)"
                      }}
                    >
                      {/* Glossy overlay on top of card back */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-50 z-20 pointer-events-none" />
                      
                      <div className="absolute inset-1 border border-emerald-500/20 rounded-sm pointer-events-none" />
                      <img 
                        src="/src/assets/images/card_back_3d_1784953684442.jpg" 
                        alt="Target Runic Deck" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-color-dodge"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#021810] via-transparent to-[#021810]/40" />
                      <div className="absolute inset-0 bg-[#10b981]/15 mix-blend-color-dodge pointer-events-none" />
                      
                      <div className="relative z-10 text-[9px] font-serif text-emerald-300/60 text-center tracking-widest uppercase font-bold">
                        The Elder Scrolls
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center justify-center text-center py-10">
                        <Skull className="w-10 h-10 text-emerald-400/80 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                      </div>
                      
                      <div className="relative z-10 text-[8px] font-mono text-emerald-400/50 text-center uppercase tracking-widest font-semibold">
                        Rune-Stones Sleepeth
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 z-10">
                    <span className="font-medieval text-sm text-emerald-400 tracking-widest uppercase drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
                      The Deck Sleepeth
                    </span>
                    <p className="font-serif text-xs text-gray-300 leading-relaxed px-4">
                      Choose thy alignment stone above, then press the trigger to shuffle the 12 cosmic runes and draw thy Medieval Card of the Day.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON FIELD: DRAW OR RESHUFFLE */}
            <div className="w-full border-t border-skyrim-gold/10 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              
              {selectedCard ? (
                <button
                  onClick={handleChooseCard}
                  disabled={isShuffling}
                  className="px-6 py-2.5 rounded-sm bg-black/45 hover:bg-black/70 text-gray-300 font-serif text-xs font-bold tracking-[0.2em] border border-skyrim-gold/25 hover:border-skyrim-gold/60 cursor-pointer flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RESHUFFLE DECK</span>
                </button>
              ) : (
                /* High craftsmanship Choose My Card button with 4 golden corners (Geometric Balance signature style) */
                <button
                  onClick={handleChooseCard}
                  disabled={isShuffling}
                  className="group relative px-12 py-5 bg-[#2a241e] border-2 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all duration-300 active:scale-95 cursor-pointer text-center"
                >
                  {/* Absolute 4 Golden Corners */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#d4af37]"></div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d4af37]"></div>
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#d4af37]"></div>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#d4af37]"></div>
                  
                  <span className="relative text-lg font-bold uppercase tracking-[0.3em] text-[#f1e5ac] font-serif">
                    Choose My Card
                  </span>
                </button>
              )}

            </div>

            {/* Draw count/Premium status subline */}
            <div className="text-center font-serif text-[10px] tracking-widest text-skyrim-gold-light/65 uppercase mt-2">
              {isSubscribed ? (
                <span className="text-[#f1e5ac] font-semibold animate-pulse">✦ Premium Seer Covenant Active • Unlimited Draws ✦</span>
              ) : (
                <span>
                  Trial Draws: <strong className="text-[#f1e5ac]">{Math.max(0, 1 - history.length)}/1 remaining</strong> (Covenant required beyond 1 draw)
                </span>
              )}
            </div>
          </section>

          {/* RIGHT: THE SEER'S CODEX (5 cols) */}
          <section id="codex-section" className="lg:col-span-5 flex flex-col space-y-6">
            <SeerCodex
              user={user}
              authLoading={authLoading}
              selectedCard={selectedCard}
              isFlipped={isFlipped}
              prophecies={prophecies}
              history={history}
              cardsPool={MEDIEVAL_DECK}
              activeTab={activeCodexTab}
              setActiveTab={setActiveCodexTab}
              onSaveProphecy={handleSaveProphecy}
              onDeleteProphecy={handleDeleteProphecy}
              onClearArchive={handleClearArchive}
              onSelectCard={handleSelectHistoricalCard}
              onClearHistory={handleClearLogs}
              onOpenAuth={() => setShowAuthModal(true)}
              savedJournals={savedJournals}
              onSaveJournal={handleSaveJournal}
              onDeleteJournal={handleDeleteJournal}
              onClearJournals={handleClearJournals}
              onUpdateJournal={handleUpdateJournal}
              isSubscribed={isSubscribed}
              isMyProfilePublished={isMyProfilePublished}
              onPaywallRequired={() => setShowPaywallModal(true)}
              showToast={showToast}
            />
          </section>

        </main>


        {/* FOOTER METADATA CREDITS */}
        <footer className="border-t border-skyrim-gold/15 pt-6 pb-6 text-center flex flex-col items-center justify-center space-y-3 w-full">
          <div className="flex items-center space-x-2 text-skyrim-gold/40">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "60s" }} />
            <span className="font-serif text-[10px] tracking-[0.25em] uppercase font-bold">
              Elder Deck : Prophecy Engine
            </span>
          </div>
          
          <p className="font-serif text-[10px] text-gray-500 italic max-w-md">
            "Thy voice shall carve the path of destiny, and thy blade shall protect thy sweetrolls."
          </p>
        </footer>

      </div>

      {/* AUTHENTICATION OVERLAY MODAL */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* PAYWALL OFFERING OVERLAY MODAL */}
      {showPaywallModal && (
        <PaywallModal 
          onClose={() => setShowPaywallModal(false)} 
          onSubscribe={handleSubscribe} 
          loading={stripeLoading}
          isSignedIn={!!user}
          onOpenAuth={() => setShowAuthModal(true)}
          isClosable={true}
        />
      )}

      {/* ELLIOT LOVE DECREE POPUP */}
      <AnimatePresence>
        {showElliotPopup && (
          <ElliotPopup onClose={handleCloseElliotPopup} />
        )}
      </AnimatePresence>

      {/* 3D Spatial Audio Configuration Modal */}
      <SpatialAudioControl
        isOpen={showSpatialAudioModal}
        onClose={() => setShowSpatialAudioModal(false)}
      />

      {/* MEDIEVAL TOAST NOTIFICATION BANNER */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] bg-[#1e1915]/95 border border-skyrim-gold/40 text-[#f1e5ac] px-5 py-4 rounded shadow-[0_4px_30px_rgba(0,0,0,0.85)] flex items-start space-x-3.5 backdrop-blur-sm"
          >
            {/* Skyrim corner accents for the notification */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#d4af37]"></div>
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#d4af37]"></div>
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#d4af37]"></div>
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#d4af37]"></div>

            <div className="flex-shrink-0 mt-0.5">
              {notification.type === "success" ? (
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              ) : notification.type === "error" ? (
                <ShieldAlert className="w-5 h-5 text-red-400" />
              ) : (
                <Bell className="w-5 h-5 text-skyrim-gold" />
              )}
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <span className="text-[10px] font-serif font-black tracking-[0.2em] uppercase block mb-1 text-skyrim-gold">
                {notification.type === "success" ? "✦ Decree of Fate ✦" : notification.type === "error" ? "⚠️ Arcane Warning" : "✉ Message of Seers"}
              </span>
              <p className="text-xs leading-relaxed text-gray-200 font-serif">
                {notification.message}
              </p>
            </div>

            <button 
              onClick={() => setNotification(null)}
              className="text-gray-550 hover:text-white transition-colors text-[10px] font-mono cursor-pointer self-start leading-none p-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
