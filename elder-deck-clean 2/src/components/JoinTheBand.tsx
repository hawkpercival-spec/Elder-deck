import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Users, 
  MessageSquare, 
  Video, 
  Film, 
  Plus, 
  Check, 
  X, 
  Skull, 
  Flame, 
  Sparkles, 
  Send, 
  Tv, 
  Mic, 
  MicOff, 
  VideoOff, 
  Camera, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Crown, 
  Shield, 
  Link, 
  UserPlus, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  Info,
  Radio,
  Clock,
  CloudCheck,
  CloudOff,
  LogIn,
  Mail,
  Bell,
  BellRing,
  Trash2,
  CheckCircle2,
  Copy,
  Sliders,
  Filter,
  Calendar,
  Download,
  XCircle,
  HelpCircle,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  addDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { sfx } from "../utils/audio";

export interface MatchNotification {
  id: string;
  soulId: string;
  soulName: string;
  soulTitle: string;
  matchScore: number;
  message: string;
  timestamp: string;
  read: boolean;
  type: "soul_match" | "band_invite_accepted" | "coven_resonance";
}

export interface MovieNightRSVP {
  userId: string;
  userName: string;
  status: "attending" | "maybe" | "cannot";
  updatedAt: string;
  avatarSigil?: string;
  necromanticAvatarIcon?: string;
}

export interface ScheduledMovieNight {
  id: string;
  movieTitle: string;
  platform: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  telepartyUrl: string;
  hostName: string;
  hostUid: string;
  notes?: string;
  createdAt: string;
  rsvps: Record<string, MovieNightRSVP>;
}

export interface SoulCandidate {
  id: string;
  name: string;
  title: string;
  avatarSigil: string; // Color code or icon symbol
  avatarImage?: string;
  necromanticAvatarIcon?: string; // 💀, 🔮, 🕯️, 📜, 🗡️, 👑, 🦇, 🧟, 👁️, 🐺
  interests?: string[];
  bio: string;
  compatibility: number; // 0-100%
  favoriteGenre: string;
  streamingAccounts: Array<"Netflix" | "HBO Max" | "Disney+" | "Prime Video">;
  status: "pending" | "connected" | "passed";
  inBand?: boolean;
  email?: string;
  isFounder?: boolean;
  isOnline?: boolean;
  lastActiveAt?: string;
}

export const isFounderProfile = (candidate?: { id?: string; email?: string; name?: string; isFounder?: boolean } | null, currentUser?: User | null) => {
  if (!candidate) return false;
  if (candidate.isFounder) return true;
  if (candidate.email?.toLowerCase() === "hawkpercival@asphodelpress.org") return true;
  if (candidate.id === "hawkpercival@asphodelpress.org") return true;
  if (candidate.name && candidate.name.toLowerCase().includes("hawk percival")) return true;
  if (currentUser?.email?.toLowerCase() === "hawkpercival@asphodelpress.org" && (candidate.id === currentUser?.uid || candidate.id === "self" || !candidate.id)) return true;
  return false;
};

export const isUserOnline = (candidate?: { isOnline?: boolean; lastActiveAt?: string } | null) => {
  if (!candidate) return false;
  if (candidate.isOnline === true) return true;
  if (candidate.lastActiveAt) {
    try {
      const lastActive = new Date(candidate.lastActiveAt).getTime();
      return (Date.now() - lastActive) < 300000; // Online if active in the last 5 minutes (300,000 ms)
    } catch (e) {
      return false;
    }
  }
  return false;
};

export const FoundersBadge: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-950 via-purple-950 to-amber-950 border border-amber-400/90 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.45)] text-amber-200 font-serif font-bold uppercase tracking-wider shrink-0 ${
        size === "sm" ? "text-[8.5px] py-0.2 px-2" : size === "lg" ? "text-[11px] py-1 px-3" : "text-[9.5px]"
      }`}
      title="The Founder's Badge — ASCORP Founder & App Creator (Hawk Percival)"
    >
      <Crown className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
      <span>The Founder's Badge (ASCORP Founder)</span>
    </span>
  );
};

export const NECROMANTIC_AVATARS = [
  { icon: "💀", label: "Skull of Reanimation" },
  { icon: "🔮", label: "Orb of Ashen Spirits" },
  { icon: "🕯️", label: "Candle of the Void" },
  { icon: "📜", label: "Scroll of Forbidden Rites" },
  { icon: "🗡️", label: "Soul-Stealing Dagger" },
  { icon: "👑", label: "Lich Sovereign Crown" },
  { icon: "🦇", label: "Shadow Bat Familiar" },
  { icon: "🧟", label: "Risen Ghoul" },
  { icon: "👁️", label: "Eldritch Eye" },
  { icon: "🐺", label: "Phantom Direwolf" }
];

export const PRESET_NECRO_TITLES = [
  "Keeper of Ashen Grimoires",
  "Sovereign of Reanimated Souls",
  "Grand Arch-Lich of Midnight Cinema",
  "Necromancer of Dark Fantasy Epics",
  "Cult Classic Blood Mage",
  "Scholar of Eldritch Scriptures"
];

export const NECROMANTIC_INTERESTS_LIST = [
  "Zombie & Reanimation Classics",
  "Vampiric Gothic Dramas",
  "Occult & Eldritch Lore",
  "Cyber-Necromancy & Dark Sci-Fi",
  "Grimdark Medieval Epics",
  "Midnight Watch Party Rituals",
  "Ancient Grimoires & Arcana",
  "Alchemical Sorcery",
  "Dark Comedy & Cult Monsters",
  "Psychological Horror & Shadows"
];

export interface BandInvite {
  id: string;
  inviterUid: string;
  inviterEmail: string;
  inviterName: string;
  recipientEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isUser: boolean;
}

export interface LinkedStreamingAccount {
  service: "Teleparty" | "Netflix" | "HBO Max" | "Disney+" | "Prime Video" | "Custom Stream";
  connected: boolean;
  username?: string;
}

export interface BandGroup {
  id: string;
  name: string;
  sigilColor: string;
  members: SoulCandidate[];
  maxMembers: number; // 10
  createdDate: string;
}

interface JoinTheBandProps {
  user: User | null;
  onOpenAuth: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const JoinTheBand: React.FC<JoinTheBandProps> = ({
  user,
  onOpenAuth,
  showToast
}) => {
  // Navigation sub-tabs strictly matching user request: "summon" | "chats" | "watch_party"
  const [activeView, setActiveView] = useState<"summon" | "chats" | "watch_party">("summon");

  // State for candidate souls matched today (No mockups - loaded strictly from real data)
  const [candidates, setCandidates] = useState<SoulCandidate[]>(() => {
    const saved = localStorage.getItem("elder_deck_daily_souls_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Save candidates to localStorage
  useEffect(() => {
    localStorage.setItem("elder_deck_daily_souls_v1", JSON.stringify(candidates));
  }, [candidates]);

  // FIRESTORE SYNC: Fetch Real Public Souls & User Candidate Records
  const [isMyProfilePublished, setIsMyProfilePublished] = useState(false);

  useEffect(() => {
    if (!user) return;

    const publicCol = collection(db, "public_souls");
    const userCandCol = collection(db, "users", user.uid, "band_candidates");

    // Presence update helper
    const updatePresence = async (status: boolean) => {
      try {
        await updateDoc(doc(db, "public_souls", user.uid), {
          isOnline: status,
          lastActiveAt: new Date().toISOString()
        });
      } catch (e) {
        // Safe to ignore if they haven't saved a profile yet
      }
    };

    // Mark online initially
    updatePresence(true);

    // Dynamic heartbeat every 15s to maintain presence on server
    const heartbeatTimer = setInterval(() => {
      updatePresence(true);
    }, 15000);

    const unsubscribe = onSnapshot(publicCol, (pubSnapshot) => {
      // Check if current user has published profile
      const myDoc = pubSnapshot.docs.find((d) => d.id === user.uid);
      if (myDoc) {
        setIsMyProfilePublished(true);
        const myData = myDoc.data();
        if (myData.name) setMyProfileName(myData.name);
        if (myData.title) setMyProfileTitle(myData.title);
        if (myData.bio) setMyProfileBio(myData.bio);
        if (myData.necromanticAvatarIcon) setMyProfileAvatarIcon(myData.necromanticAvatarIcon);
        if (Array.isArray(myData.interests) && myData.interests.length > 0) setMyProfileInterests(myData.interests);
        if (myData.favoriteGenre) setMyProfileGenre(myData.favoriteGenre);
        if (myData.avatarSigil) setMyProfileSigil(myData.avatarSigil);
      }

      const publicSouls: SoulCandidate[] = pubSnapshot.docs
        .filter((docSnap) => docSnap.id !== user.uid)
        .map((docSnap) => {
          const data = docSnap.data();
          const isFounder = data.isFounder || 
            data.email?.toLowerCase() === "hawkpercival@asphodelpress.org" || 
            docSnap.id === "hawkpercival@asphodelpress.org" || 
            (data.name && data.name.toLowerCase().includes("hawk percival"));
          return {
            id: docSnap.id,
            name: data.name || "Unknown Soul",
            title: data.title || "",
            avatarSigil: data.avatarSigil || "bg-gray-800 border-gray-600 text-gray-400",
            avatarImage: data.avatarImage,
            necromanticAvatarIcon: data.necromanticAvatarIcon,
            interests: data.interests || [],
            bio: data.bio || "",
            compatibility: data.compatibility || 0,
            favoriteGenre: data.favoriteGenre || "",
            streamingAccounts: data.streamingAccounts || [],
            status: "pending",
            email: data.email || (isFounder ? "hawkpercival@asphodelpress.org" : undefined),
            isFounder: isFounder,
            isOnline: data.isOnline || false,
            lastActiveAt: data.lastActiveAt
          };
        });

      onSnapshot(userCandCol, (userSnapshot) => {
        const userCandMap = new Map<string, SoulCandidate>();
        userSnapshot.docs.forEach((d) => {
          userCandMap.set(d.id, d.data() as SoulCandidate);
        });

        const mergedMap = new Map<string, SoulCandidate>();

        // Add user candidates or evaluated statuses
        userCandMap.forEach((val, key) => {
          mergedMap.set(key, val);
        });

        // Add public souls if not already evaluated
        publicSouls.forEach((ps) => {
          if (!mergedMap.has(ps.id)) {
            mergedMap.set(ps.id, ps);
          }
        });

        setCovenPublicSouls(publicSouls);
        setCandidates(Array.from(mergedMap.values()));
      });
    }, (err) => {
      console.warn("Firestore public souls sync notice:", err);
    });

    return () => {
      clearInterval(heartbeatTimer);
      updatePresence(false);
      unsubscribe();
    };
  }, [user]);

  // AI Algorithmic Selection State
  const [covenPublicSouls, setCovenPublicSouls] = useState<SoulCandidate[]>([]);
  const [aiSelectedDailySouls, setAiSelectedDailySouls] = useState<SoulCandidate[]>([]);
  
  // Modals for creating real profile or adding real candidate
  const [showMyProfileModal, setShowMyProfileModal] = useState(false);
  const [myProfileName, setMyProfileName] = useState(user?.displayName || "");
  const [myProfileTitle, setMyProfileTitle] = useState("");
  const [myProfileAvatarIcon, setMyProfileAvatarIcon] = useState("💀");
  const [myProfileInterests, setMyProfileInterests] = useState<string[]>([
    "Zombie & Reanimation Classics",
    "Occult & Eldritch Lore",
    "Vampiric Gothic Dramas"
  ]);
  const [myProfileBio, setMyProfileBio] = useState("Master of midnight dark fantasy reanimation, grimoires of blood arcana, and occult watch parties.");
  const [myProfileGenre, setMyProfileGenre] = useState("Gothic Horror & Dark Fantasy");
  const [myProfileSigil, setMyProfileSigil] = useState("bg-purple-950/80 border-purple-500 text-purple-300");
  const [myProfileStreaming, setMyProfileStreaming] = useState<Array<"Netflix" | "HBO Max" | "Disney+" | "Prime Video">>(["Netflix", "HBO Max"]);

  const toggleMyInterest = (interest: string) => {
    sfx.playShuffleTick(0, 1.2);
    setMyProfileInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
            
  // Email Band Invitation state
  const [showEmailInviteModal, setShowEmailInviteModal] = useState(false);
  const [inviteEmailInput, setInviteEmailInput] = useState("");
  const [incomingInvites, setIncomingInvites] = useState<BandInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<BandInvite[]>([]);

  // Real-time Match Notifications state & observers
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [latestRealtimeMatch, setLatestRealtimeMatch] = useState<MatchNotification | null>(null);
  const [desktopNotifPermission, setDesktopNotifPermission] = useState<"default" | "granted" | "denied">(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const knownConnectedRef = useRef<Set<string>>(new Set());

  // FIRESTORE OBSERVER: Real-Time Soul Match Notifications & Candidate Observer
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // 1. Observer for match_notifications subcollection
    const notifCol = collection(db, "users", user.uid, "match_notifications");
    const notifQuery = query(notifCol, orderBy("createdAt", "desc"));

    const unsubNotifs = onSnapshot(notifQuery, (snapshot) => {
      const list: MatchNotification[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MatchNotification, "id">)
      }));
      setNotifications(list);
    }, (err) => {
      console.warn("Match notifications Firestore observer notice:", err);
    });

    // 2. Real-time Observer on Band Candidates to detect new soul matches dynamically
    const candidatesCol = collection(db, "users", user.uid, "band_candidates");
    let isInitialLoad = true;

    const unsubCandidates = onSnapshot(candidatesCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = change.doc.data() as SoulCandidate;
          const soulId = change.doc.id;

          if (data.status === "connected") {
            if (!knownConnectedRef.current.has(soulId)) {
              knownConnectedRef.current.add(soulId);

              if (!isInitialLoad) {
                triggerRealtimeMatchAlert(data);
              }
            }
          }
        }
      });

      if (isInitialLoad) {
        snapshot.docs.forEach((docSnap) => {
          const d = docSnap.data() as SoulCandidate;
          if (d.status === "connected") {
            knownConnectedRef.current.add(docSnap.id);
          }
        });
        isInitialLoad = false;
      }
    }, (err) => {
      console.warn("Candidates match observer notice:", err);
    });

    return () => {
      unsubNotifs();
      unsubCandidates();
    };
  }, [user]);

  // Trigger Real-Time Soul Match Alert (Sound, Floating Toast, Desktop Notification, Firestore Entry)
  const triggerRealtimeMatchAlert = async (soul: SoulCandidate) => {
    sfx.playArcaneShimmer();

    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newNotif: MatchNotification = {
      id: notifId,
      soulId: soul.id,
      soulName: soul.name,
      soulTitle: soul.title,
      matchScore: soul.compatibility || 95,
      message: `RESONANCE ACHIEVED! Thou hast successfully matched with ${soul.name} in Join The Band!`,
      timestamp: timeStr,
      read: false,
      type: "soul_match"
    };

    setLatestRealtimeMatch(newNotif);

    setTimeout(() => {
      setLatestRealtimeMatch((curr) => (curr?.id === notifId ? null : curr));
    }, 8000);

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "match_notifications", notifId), {
          ...newNotif,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Error writing match notification to Firestore:", e);
      }
    } else {
      setNotifications((prev) => [newNotif, ...prev]);
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("✨ Soul Bond Matched!", {
          body: `Thou hast matched with ${soul.name} (${soul.compatibility || 95}% Compatibility)! Chat & Watch Party unlocked.`,
          icon: "/icon.png"
        });
      } catch (err) {
        console.warn("Desktop notification error:", err);
      }
    }
  };

  const handleMarkNotifRead = async (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "match_notifications", notifId), { read: true });
      } catch (e) {
        console.error("Error marking notification read:", e);
      }
    }
  };

  const handleClearAllNotifications = async () => {
    sfx.playShuffleTick(0, 1.2);
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    if (user) {
      for (const id of ids) {
        try {
          await deleteDoc(doc(db, "users", user.uid, "match_notifications", id));
        } catch (e) {
          console.error("Error deleting notification:", e);
        }
      }
    }
    showToast("Cleared all match notifications.", "info");
  };

  const handleRequestDesktopPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Browser push notifications are not supported on this device.", "info");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setDesktopNotifPermission(perm);
      if (perm === "granted") {
        showToast("Desktop Real-Time Match Alerts Enabled!", "success");
        sfx.playShuffleTick(0, 1.5);
      } else {
        showToast("Desktop Notification permission was not granted.", "info");
      }
    } catch (e) {
      console.error("Error requesting notification permission:", e);
    }
  };

  // FIRESTORE SYNC: Email Band Invitations
  useEffect(() => {
    if (!user || !user.email) return;

    const colRef = collection(db, "band_invites");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const allInvites: BandInvite[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BandInvite, "id">)
      }));

      const userEmail = user.email!.toLowerCase().trim();

      const incoming = allInvites.filter(
        (inv) => inv.recipientEmail?.toLowerCase().trim() === userEmail && inv.status === "pending"
      );

      const sent = allInvites.filter(
        (inv) => inv.inviterUid === user.uid
      );

      setIncomingInvites(incoming);
      setSentInvites(sent);
    }, (err) => {
      console.warn("Band invites sync notice:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Selected chat candidate
  const [selectedChatSoul, setSelectedChatSoul] = useState<SoulCandidate | null>(null);

  // Chat message history indexed by candidate ID (Real Data Only)
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem("elder_deck_chat_msgs_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("elder_deck_chat_msgs_v1", JSON.stringify(messages));
  }, [messages]);

  // FIRESTORE SYNC: Chat messages for selected chat soul
  useEffect(() => {
    if (!user || !selectedChatSoul) return;

    const chatColRef = collection(db, "users", user.uid, "chats", selectedChatSoul.id, "messages");
    const q = query(chatColRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const loadedMsgs: ChatMessage[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            senderId: data.senderId || selectedChatSoul.id,
            senderName: data.senderName || selectedChatSoul.name,
            text: data.text || "",
            timestamp: data.timestampStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: !!data.isUser
          };
        });

        setMessages((prev) => ({
          ...prev,
          [selectedChatSoul.id]: loadedMsgs
        }));
      }
    }, (err) => {
      console.warn("Firestore chat sync notice:", err);
    });

    return () => unsubscribe();
  }, [user, selectedChatSoul]);

  // Input message text
  const [inputMessage, setInputMessage] = useState("");

  // Video Call / FaceTime Modal state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoFilter, setVideoFilter] = useState<"none" | "soul-fire" | "gothic-sepia" | "amber-glow">("soul-fire");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Linked Streaming Accounts (Teleparty)
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedStreamingAccount[]>(() => {
    const saved = localStorage.getItem("elder_deck_streaming_accounts_v1");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { service: "Teleparty", connected: false }
    ];
  });

  const [accountHandleInputs, setAccountHandleInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem("elder_deck_streaming_accounts_v1", JSON.stringify(linkedAccounts));
  }, [linkedAccounts]);

  // FIRESTORE SYNC: Streaming accounts
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, "users", user.uid, "streaming_accounts");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const accs: LinkedStreamingAccount[] = snapshot.docs.map((d) => d.data() as LinkedStreamingAccount);
        setLinkedAccounts(accs);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const [showStreamingModal, setShowStreamingModal] = useState(false);

  // Band / Coven (Group of up to 10 users)
  const [band, setBand] = useState<BandGroup>(() => {
    const saved = localStorage.getItem("elder_deck_band_group_v1");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      id: "band-coven-1",
      name: "My Coven",
      sigilColor: "#d4af37",
      members: [],
      maxMembers: 10,
      createdDate: new Date().toLocaleDateString()
    };
  });

  useEffect(() => {
    localStorage.setItem("elder_deck_band_group_v1", JSON.stringify(band));
  }, [band]);

  // FIRESTORE SYNC: Band Roster
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, "users", user.uid, "band_roster");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const members: SoulCandidate[] = snapshot.docs.map((d) => d.data() as SoulCandidate);
        setBand((prev) => ({
          ...prev,
          members
        }));
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Watch Party Stream & Movie Sharing State (Real User Data Only)
  const [watchMovieTitle, setWatchMovieTitle] = useState("");
  const [watchMovieProvider, setWatchMovieProvider] = useState<"Teleparty Stream" | "Teleparty Link" | "Custom Stream">("Teleparty Stream");
  const [watchMovieUrl, setWatchMovieUrl] = useState("");
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [isCopiedState, setIsCopiedState] = useState(false);

  // Scheduled Band Movie Nights & RSVP System State
  const [scheduledMovieNights, setScheduledMovieNights] = useState<ScheduledMovieNight[]>(() => {
    const saved = localStorage.getItem("elder_deck_movie_nights_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local movie nights", e);
      }
    }
    return [];
  });

  // Modal & Form State for Scheduling Upcoming Movie Night
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [schedTitle, setSchedTitle] = useState<string>("");
  const [schedPlatform, setSchedPlatform] = useState<string>("Teleparty Netflix");
  const [schedDate, setSchedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [schedTime, setSchedTime] = useState<string>("20:00");
  const [schedUrl, setSchedUrl] = useState<string>("");
  const [schedNotes, setSchedNotes] = useState<string>("");

  // Sync Scheduled Movie Nights with Firestore collection `watch_party_events`
  useEffect(() => {
    const colRef = collection(db, "watch_party_events");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteEvents: ScheduledMovieNight[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ScheduledMovieNight, "id">)
          }));
          setScheduledMovieNights(remoteEvents);
          localStorage.setItem("elder_deck_movie_nights_v2", JSON.stringify(remoteEvents));
        }
      },
      (err) => {
        console.warn("Firestore watch_party_events sync error:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("elder_deck_movie_nights_v2", JSON.stringify(scheduledMovieNights));
  }, [scheduledMovieNights]);

  // Handler: Create Scheduled Movie Night Event
  const handleCreateMovieNight = async () => {
    if (!schedTitle.trim()) {
      showToast("Please enter a Movie or Series Title for the watch party!", "error");
      return;
    }

    const hostName = user?.displayName || myProfileTitle || "Coven Convener";
    const hostUid = user?.uid || "user-self";

    let finalTelepartyUrl = schedUrl.trim();
    if (!finalTelepartyUrl) {
      const randomCode = `tp-coven-${Math.random().toString(36).substring(2, 8)}`;
      finalTelepartyUrl = `https://www.teleparty.com/party/${randomCode}`;
    } else {
      finalTelepartyUrl = formatTelepartyUrl(finalTelepartyUrl);
    }

    const newEventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const initialRsvp: MovieNightRSVP = {
      userId: hostUid,
      userName: hostName,
      status: "attending",
      updatedAt: new Date().toISOString(),
      avatarSigil: "bg-amber-950 border-amber-500 text-amber-200",
      necromanticAvatarIcon: "🕯️"
    };

    const newEvent: ScheduledMovieNight = {
      id: newEventId,
      movieTitle: schedTitle.trim(),
      platform: schedPlatform,
      date: schedDate,
      time: schedTime,
      telepartyUrl: finalTelepartyUrl,
      hostName,
      hostUid,
      notes: schedNotes.trim(),
      createdAt: new Date().toISOString(),
      rsvps: {
        [hostUid]: initialRsvp
      }
    };

    try {
      await setDoc(doc(db, "watch_party_events", newEventId), newEvent);
    } catch (e) {
      console.warn("Could not write movie night to Firestore:", e);
    }

    setScheduledMovieNights((prev) => [newEvent, ...prev.filter((item) => item.id !== newEventId)]);
    sfx.playArcaneShimmer();
    showToast(`🎬 Watch party for "${schedTitle}" scheduled on ${schedDate} at ${schedTime}!`, "success");

    setSchedTitle("");
    setSchedNotes("");
    setSchedUrl("");
    setShowScheduleModal(false);
  };

  // Handler: Update RSVP for Movie Night
  const handleToggleRSVP = async (eventId: string, newStatus: "attending" | "maybe" | "cannot") => {
    const currentUserId = user?.uid || "user-self";
    const currentUserName = user?.displayName || myProfileTitle || "Coven Member";

    const rsvpData: MovieNightRSVP = {
      userId: currentUserId,
      userName: currentUserName,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      avatarSigil: "bg-[#282018] border-[#d4af37] text-[#f1e5ac]",
      necromanticAvatarIcon: newStatus === "attending" ? "🕯️" : newStatus === "maybe" ? "🔮" : "💀"
    };

    setScheduledMovieNights((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const updatedRsvps = {
            ...(evt.rsvps || {}),
            [currentUserId]: rsvpData
          };
          try {
            updateDoc(doc(db, "watch_party_events", eventId), {
              rsvps: updatedRsvps
            });
          } catch (e) {
            console.warn("Failed to update RSVP in Firestore", e);
          }
          return { ...evt, rsvps: updatedRsvps };
        }
        return evt;
      })
    );

    sfx.playArcaneShimmer();
    const statusText = newStatus === "attending" ? "Attending 🕯️" : newStatus === "maybe" ? "Maybe 🔮" : "Cannot Attend 💀";
    showToast(`RSVP updated to ${statusText}`, "success");
  };

  // Handler: Delete Scheduled Movie Night
  const handleDeleteMovieNight = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "watch_party_events", eventId));
    } catch (e) {
      console.warn("Could not delete from Firestore", e);
    }
    setScheduledMovieNights((prev) => prev.filter((evt) => evt.id !== eventId));
    sfx.playShuffleTick(0, 1.3);
    showToast("Scheduled movie night removed.", "info");
  };

  // Calendar Utility: Open Google Calendar Web Link
  const generateGoogleCalendarUrl = (evt: ScheduledMovieNight) => {
    const [year, month, day] = evt.date.split("-");
    const [hours, minutes] = evt.time.split(":");
    const startDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const titleStr = encodeURIComponent(`Band Watch Party: ${evt.movieTitle}`);
    const datesStr = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
    const detailsStr = encodeURIComponent(
      `🎬 Band Movie Night Stream\nMovie: ${evt.movieTitle}\nPlatform: ${evt.platform}\nHost: ${evt.hostName}\nTeleparty URL: ${evt.telepartyUrl}\n\nNotes: ${evt.notes || "Bring your favorite potion & snacks!"}`
    );
    const locationStr = encodeURIComponent(evt.telepartyUrl || "Teleparty.com");

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleStr}&dates=${datesStr}&details=${detailsStr}&location=${locationStr}`;
    window.open(gcalUrl, "_blank");
    showToast("Opening Google Calendar to save event reminder...", "info");
  };

  // Calendar Utility: Download standard .ICS calendar file
  const downloadIcsFile = (evt: ScheduledMovieNight) => {
    const [year, month, day] = evt.date.split("-");
    const [hours, minutes] = evt.time.split(":");
    const startDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatIcsDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Elder Deck Band//Watch Party Scheduler//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Band Watch Party: ${evt.movieTitle}`,
      `DESCRIPTION:Platform: ${evt.platform}\\nHost: ${evt.hostName}\\nTeleparty Link: ${evt.telepartyUrl}\\nNotes: ${evt.notes || ""}`,
      `LOCATION:${evt.telepartyUrl || "Teleparty.com"}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `band-watch-party-${evt.movieTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded .ics calendar file for watch party!", "success");
  };

  // Teleparty Room Code Generator & Link Formatter Helpers
  const formatTelepartyUrl = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.includes("teleparty.com")) {
      return `https://${trimmed.replace(/^https?:\/\//, "")}`;
    }
    return `https://www.teleparty.com/party/${trimmed}`;
  };

  const extractRoomCode = (input: string) => {
    const formatted = formatTelepartyUrl(input);
    if (!formatted) return "";
    if (formatted.includes("/party/")) {
      return formatted.split("/party/")[1].split("?")[0];
    }
    return formatted.replace(/^https?:\/\//, "");
  };

  const handleGenerateTelepartyCode = () => {
    const code = `tp-coven-${Math.random().toString(36).substring(2, 8)}${Math.floor(Math.random() * 89 + 10)}`;
    const fullUrl = `https://www.teleparty.com/party/${code}`;
    setWatchMovieUrl(fullUrl);
    sfx.playArcaneShimmer();
    showToast(`⚡ Generated fresh Teleparty Room Code: ${code}`, "success");
  };

  const handleCopyTelepartyLink = (urlToCopy: string, label = "Teleparty Party Link") => {
    const formatted = formatTelepartyUrl(urlToCopy);
    if (!formatted) {
      showToast("Please generate or enter a Teleparty link first!", "error");
      return;
    }
    navigator.clipboard.writeText(formatted);
    setIsCopiedState(true);
    sfx.playArcaneShimmer();
    showToast(`✨ Copied ${label} to clipboard!`, "success");
    setTimeout(() => setIsCopiedState(false), 2500);
  };

  const handleBroadcastTelepartyToBand = async () => {
    const formatted = formatTelepartyUrl(watchMovieUrl);
    if (!formatted) {
      showToast("Please enter or generate a valid Teleparty link first!", "error");
      return;
    }
    if (connectedSouls.length === 0) {
      showToast("No bonded souls connected yet! Initiate bonds in the Daily 4 Souls tab first.", "info");
      return;
    }

    const movieStr = watchMovieTitle.trim() || watchMovieProvider;
    const msgText = `🎬 Teleparty Watch Party Invite for ${movieStr}! Join room: ${formatted}`;

    for (const soul of connectedSouls) {
      setMessages((prev) => ({
        ...prev,
        [soul.id]: [...(prev[soul.id] || []), {
          id: `msg_tp_${Date.now()}_${Math.random()}`,
          senderId: user?.uid || "user",
          senderName: myProfileName || "You",
          text: msgText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: true
        }]
      }));

      if (user) {
        try {
          const msgData = {
            senderId: user.uid,
            senderName: myProfileName || "You",
            text: msgText,
            timestampStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            isUser: true
          };
          await addDoc(collection(db, "users", user.uid, "chats", soul.id, "messages"), msgData);
          await addDoc(collection(db, "users", soul.id, "chats", user.uid, "messages"), {
            ...msgData,
            isUser: false
          });
        } catch (e) {
          console.error("Error broadcasting Teleparty link:", e);
        }
      }
    }

    sfx.playArcaneShimmer();
    showToast(`✨ Teleparty link broadcasted to all ${connectedSouls.length} bonded souls!`, "success");
  };

  // Webcam activation handler for FaceTime / Scrying Mirror
  useEffect(() => {
    if (isVideoCallActive && !isCamOff) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn("Webcam access restricted or unavailable:", err);
        });
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoCallActive, isCamOff]);

  // 2-Day AI Random Pairing State & Timer (Strictly Real Data from Firestore)
  const [pairingMeta, setPairingMeta] = useState<{ pairedAt: number; pairedIds: string[] } | null>(() => {
    const saved = localStorage.getItem("elder_deck_pairing_meta_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>("");

  // Sync Pairing Meta from Firestore
  useEffect(() => {
    if (!user) return;
    const metaRef = doc(db, "users", user.uid, "pairings_meta", "current");
    const unsub = onSnapshot(metaRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.pairedAt && Array.isArray(data.pairedIds)) {
          setPairingMeta({
            pairedAt: data.pairedAt,
            pairedIds: data.pairedIds
          });
          if (Array.isArray(data.souls) && data.souls.length > 0) {
            setAiSelectedDailySouls(data.souls as SoulCandidate[]);
          }
        }
      }
    }, (err) => {
      console.warn("Firestore pairings_meta sync notice:", err);
    });
    return () => unsub();
  }, [user]);

  // Algorithmic Selection for 2-Day AI Pairing
  const perform2DayAiShuffle = async (poolOverride?: SoulCandidate[]) => {
    // Only pair with OTHER users who have saved their profile and are currently online
    let pool = (poolOverride || covenPublicSouls).filter((p) => p.id !== user?.uid && isUserOnline(p));

    if (pool.length === 0) {
      try {
        const pubSnap = await getDocs(collection(db, "public_souls"));
        const fetchedMap = new Map<string, SoulCandidate>();

        pubSnap.docs.forEach((docSnap) => {
          if (docSnap.id === user?.uid) return;
          const data = docSnap.data();
          const isFounder = data.isFounder || 
            data.email?.toLowerCase() === "hawkpercival@asphodelpress.org" || 
            docSnap.id === "hawkpercival@asphodelpress.org" || 
            (data.name && data.name.toLowerCase().includes("hawk percival"));
          
          const cand: SoulCandidate = {
            id: docSnap.id,
            name: data.name || data.displayName || "Coven Seeker",
            title: data.title || "Occult Practitioner",
            avatarSigil: data.avatarSigil || "bg-purple-950/80 border-purple-500 text-purple-300",
            avatarImage: data.avatarImage || data.photoURL,
            necromanticAvatarIcon: data.necromanticAvatarIcon || "🔮",
            interests: data.interests || ["Movie Nights", "Dark Fantasy"],
            bio: data.bio || "Active soul in the Coven directory.",
            compatibility: data.compatibility || 88,
            favoriteGenre: data.favoriteGenre || "Dark Fantasy",
            streamingAccounts: data.streamingAccounts || ["Netflix"],
            status: "pending",
            email: data.email || (isFounder ? "hawkpercival@asphodelpress.org" : undefined),
            isFounder: isFounder,
            isOnline: data.isOnline || false,
            lastActiveAt: data.lastActiveAt
          };

          if (isUserOnline(cand)) {
            fetchedMap.set(docSnap.id, cand);
          }
        });

        pool = Array.from(fetchedMap.values());
        if (pool.length > 0) {
          setCovenPublicSouls(pool);
        }
      } catch (e) {
        console.warn("Direct Firestore fetch notice:", e);
      }
    }

    if (pool.length === 0) {
      setAiSelectedDailySouls([]);
      return [];
    }

    // Algorithmic scoring based on shared interests, platforms, and genre
    const scoredPool = pool.map(candidate => {
      let score = 50; // base score
      const soulInterests = candidate.interests || [];
      const sharedInterests = soulInterests.filter((i) =>
        myProfileInterests.some((ui) => ui.toLowerCase().trim() === i.toLowerCase().trim())
      );
      score += Math.min(20, sharedInterests.length * 5);
      const soulPlatforms = candidate.streamingAccounts || [];
      const sharedPlatforms = soulPlatforms.filter((p) =>
        myProfileStreaming.some((up) => up.toLowerCase().trim() === p.toLowerCase().trim())
      );
      score += Math.min(15, sharedPlatforms.length * 8);
      const soulGenre = (candidate.favoriteGenre || "").toLowerCase().trim();
      const userGenre = (myProfileGenre || "").toLowerCase().trim();
      if (soulGenre === userGenre && userGenre !== "") score += 15;
      else if (userGenre !== "" && (soulGenre.includes(userGenre) || userGenre.includes(soulGenre))) score += 10;
      score += Math.random() * 10;
      return { candidate, score };
    });
    scoredPool.sort((a, b) => b.score - a.score);
    const selectedFour = scoredPool.slice(0, 4).map(sc => sc.candidate);
    const pairedIds = selectedFour.map((s) => s.id);
    const pairedAt = Date.now();
    const newMeta = { pairedAt, pairedIds };

    setPairingMeta(newMeta);
    setAiSelectedDailySouls(selectedFour);
    localStorage.setItem("elder_deck_pairing_meta_v2", JSON.stringify(newMeta));

    if (user) {
      try {
        const fullPayload = {
          pairedAt,
          pairedIds,
          souls: selectedFour,
          createdAt: new Date().toISOString()
        };
        // Save current active Daily 4 Souls selection record
        await setDoc(doc(db, "users", user.uid, "pairings_meta", "current"), fullPayload);

        // Save historical selection record in pairings_history collection
        const historyRef = doc(db, "users", user.uid, "pairings_history", `pairing-${pairedAt}`);
        await setDoc(historyRef, fullPayload);
      } catch (err) {
        console.warn("Error saving 2-day pairing meta to Firestore:", err);
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/pairings_meta/current`);
      }
    }

    return selectedFour;
  };

  // Check 2-Day Pairing Expiry (48 Hours = 172800000 ms)
  useEffect(() => {
    if (covenPublicSouls.length === 0) return;

    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (!pairingMeta || (now - pairingMeta.pairedAt >= TWO_DAYS_MS) || pairingMeta.pairedIds.length === 0) {
      perform2DayAiShuffle(covenPublicSouls);
    }
  }, [covenPublicSouls]);

  // Live 2-Day Refresh Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pairingMeta?.pairedAt) {
        setTimeUntilRefresh("48h 00m");
        return;
      }
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - pairingMeta.pairedAt;
      const remaining = Math.max(0, TWO_DAYS_MS - elapsed);

      if (remaining <= 0) {
        setTimeUntilRefresh("Refreshing AI pairings...");
        if (covenPublicSouls.length > 0) {
          perform2DayAiShuffle(covenPublicSouls);
        }
      } else {
        const totalSecs = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;

        if (days > 0) {
          setTimeUntilRefresh(`${days}d ${remHours}h ${mins}m`);
        } else {
          setTimeUntilRefresh(`${hours}h ${mins}m ${secs}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pairingMeta, covenPublicSouls]);

  // 4 AI-Selected Random User Pairings for Current 2-Day Cycle
  const dailyFourSouls = React.useMemo(() => {
    // Filter down to candidates who are currently online on the server
    const onlineCandidates = candidates.filter((c) => c.id !== user?.uid && isUserOnline(c));

    if (pairingMeta && pairingMeta.pairedIds.length > 0) {
      const paired = onlineCandidates.filter((c) => pairingMeta.pairedIds.includes(c.id));
      if (paired.length > 0) return paired.slice(0, 4);
    }
    return onlineCandidates.slice(0, 4);
  }, [candidates, pairingMeta, user]);

  // Genre & Interest Compatibility Filter State
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("All Genres");
  const [selectedInterestFilter, setSelectedInterestFilter] = useState<string>("All Interests");
  const [showOnlySharedInterests, setShowOnlySharedInterests] = useState<boolean>(false);
  const [minMatchScoreFilter, setMinMatchScoreFilter] = useState<number>(0);
  const [sortByMatchScore, setSortByMatchScore] = useState<"highest" | "default">("highest");

  // Helper: Compute Match Score & Overlaps for Candidate vs User Profile
  const computeMatchDetails = useCallback((soul: SoulCandidate) => {
    const soulInterests = soul.interests || [];
    const sharedInterests = soulInterests.filter((i) =>
      myProfileInterests.some((ui) => ui.toLowerCase().trim() === i.toLowerCase().trim())
    );

    const soulPlatforms = soul.streamingAccounts || [];
    const userPlatforms = myProfileStreaming || [];
    const sharedPlatforms = soulPlatforms.filter((p) =>
      userPlatforms.some((up) => up.toLowerCase().trim() === p.toLowerCase().trim())
    );

    const soulGenre = (soul.favoriteGenre || "").toLowerCase().trim();
    const userGenre = (myProfileGenre || "").toLowerCase().trim();
    const genreMatch =
      soulGenre === userGenre ||
      (soulGenre.includes("horror") && userGenre.includes("horror")) ||
      (soulGenre.includes("fantasy") && userGenre.includes("fantasy")) ||
      (soulGenre.includes("cult") && userGenre.includes("cult")) ||
      (soulGenre.includes("sci-fi") && userGenre.includes("sci-fi")) ||
      (soulGenre.includes("medieval") && userGenre.includes("medieval"));

    // Dynamic Score Calculation
    let calculatedScore = 60;
    const interestBonus = Math.min(24, sharedInterests.length * 8);
    const platformBonus = Math.min(20, sharedPlatforms.length * 10);
    const genreBonus = genreMatch ? 12 : 0;

    calculatedScore += interestBonus + platformBonus + genreBonus;
    const score = Math.min(100, Math.max(50, Math.round(calculatedScore)));

    return {
      score,
      sharedInterests,
      sharedPlatforms,
      genreMatch,
      scoreBreakdown: { interestBonus, platformBonus, genreBonus }
    };
  }, [myProfileInterests, myProfileGenre, myProfileStreaming]);

  // Filtered & Sorted Candidate Souls for current cycle
  const filteredDailySouls = React.useMemo(() => {
    return dailyFourSouls.filter((soul) => {
      const matchDetails = computeMatchDetails(soul);

      if (minMatchScoreFilter > 0 && matchDetails.score < minMatchScoreFilter) {
        return false;
      }

      if (selectedGenreFilter !== "All Genres") {
        const gFilter = selectedGenreFilter.toLowerCase();
        const sGenre = (soul.favoriteGenre || "").toLowerCase();
        if (!sGenre.includes(gFilter) && gFilter !== "all genres") {
          return false;
        }
      }

      if (selectedInterestFilter !== "All Interests") {
        const iFilter = selectedInterestFilter.toLowerCase();
        const hasInterest = (soul.interests || []).some((i) => i.toLowerCase().includes(iFilter));
        if (!hasInterest) return false;
      }

      if (showOnlySharedInterests && matchDetails.sharedInterests.length === 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortByMatchScore === "highest") {
        const matchA = computeMatchDetails(a).score;
        const matchB = computeMatchDetails(b).score;
        return matchB - matchA;
      }
      return 0;
    });
  }, [dailyFourSouls, computeMatchDetails, minMatchScoreFilter, selectedGenreFilter, selectedInterestFilter, showOnlySharedInterests, sortByMatchScore]);

  // AI Algorithmic Daily Match Selection Engine (Strictly Real Data from Coven Directory)
  const handlePerformAiSelection = (poolOverride?: SoulCandidate[]) => {
    return perform2DayAiShuffle(poolOverride);
  };

  // Run initial AI selection when covenPublicSouls loads
  useEffect(() => {
    handlePerformAiSelection();
  }, [covenPublicSouls]);

  // Handle Publishing Current User's Real Soul Profile
  const handlePublishMyProfile = async () => {
    if (!user) {
      onOpenAuth();
      showToast("Please connect thy soul or sign up to file thy profile into the Coven Directory.", "info");
      return;
    }

    if (!myProfileName.trim()) {
      showToast("Please enter a name for thy Necromantic Soul Profile.", "error");
      return;
    }

    const isFounderUser = user?.email?.toLowerCase() === "hawkpercival@asphodelpress.org" || myProfileName.toLowerCase().includes("hawk percival");

    const profileId = user?.uid || `soul-self-${Date.now()}`;
    const profileData: SoulCandidate = {
      id: profileId,
      name: myProfileName.trim(),
      title: myProfileTitle.trim(),
      avatarSigil: myProfileSigil,
      necromanticAvatarIcon: myProfileAvatarIcon,
      interests: myProfileInterests,
      bio: myProfileBio.trim(),
      compatibility: 99,
      favoriteGenre: myProfileGenre,
      streamingAccounts: myProfileStreaming,
      status: "connected",
      email: user?.email || "hawkpercival@asphodelpress.org",
      isFounder: isFounderUser
    };

    sfx.playArcaneShimmer();

    if (user) {
      try {
        await setDoc(doc(db, "public_souls", user.uid), {
          ...profileData,
          inSelectionPool: true,
          status: "filed",
          filed: true,
          globalSubmission: true,
          isGlobal: true,
          filedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          systemLogged: true,
          isFounder: isFounderUser,
          email: user.email || "hawkpercival@asphodelpress.org"
        });
        setIsMyProfilePublished(true);

        // System Alert & Log
        const notifRef = doc(collection(db, "users", user.uid, "match_notifications"));
        await setDoc(notifRef, {
          soulId: profileId,
          soulName: myProfileName.trim(),
          soulTitle: myProfileTitle.trim() || "Coven Seeker",
          matchScore: 100,
          message: "SYSTEM ALERT: Thy profile has been FILED, noted, and logged in the Coven System Directory! Thy soul is now active in the 2-day algorithmic candidate selection pool.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: false,
          type: "coven_resonance",
          createdAt: new Date().toISOString()
        });

        showToast("✨ System Alert: Profile FILED in system ledger! Noted & logged in algorithmic selection.", "success");
        perform2DayAiShuffle();
      } catch (e) {
        console.error("Error publishing soul profile:", e);
        showToast("Failed to publish profile to cloud archives.", "error");
        handleFirestoreError(e, OperationType.UPDATE, `public_souls/${user.uid}`);
      }
    } else {
      setIsMyProfilePublished(true);
      showToast("System Alert: Profile FILED locally! Noted & logged in selection pool.", "info");
    }

    setShowMyProfileModal(false);
  };

  // Add a single AI Selected Soul to daily candidate list
  const handleAddAiSelectedSoul = async (soul: SoulCandidate) => {
    const newCandidate: SoulCandidate = {
      ...soul,
      status: "pending"
    };

    sfx.playShuffleTick(0, 1.4);

    setCandidates((prev) => {
      if (prev.some((c) => c.id === soul.id)) return prev;
      return [...prev, newCandidate];
    });

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "band_candidates", soul.id), newCandidate);
        showToast(`AI Selected Soul '${soul.name}' added to thy daily candidate list!`, "success");
      } catch (e) {
        console.error("Error saving AI selected soul:", e);
      }
    } else {
      showToast(`AI Selected Soul '${soul.name}' added locally!`, "info");
    }
  };

  // Add All 4 AI Selected Souls to daily candidates
  const handleAddAllAiSelectedSouls = async () => {
    sfx.playShuffleTick(0, 1.5);
    for (const soul of aiSelectedDailySouls) {
      await handleAddAiSelectedSoul(soul);
    }
    showToast("All 4 AI Selected Souls added to thy daily candidates!", "success");
    setShowAddCandidateModal(false);
  };

  // Handle Adding a Real Soul Candidate

  // Send Email Band Invitation
  const handleSendEmailInvite = async () => {
    if (!user) {
      showToast("Please sign in to send email invitations to thy Band.", "error");
      return;
    }

    const trimmedEmail = inviteEmailInput.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (user.email && trimmedEmail === user.email.toLowerCase()) {
      showToast("Thou cannot invite thine own email address.", "error");
      return;
    }

    const inviteId = doc(collection(db, "band_invites")).id;
    const newInvite: BandInvite = {
      id: inviteId,
      inviterUid: user.uid,
      inviterEmail: user.email || "",
      inviterName: user.displayName || user.email?.split("@")[0] || "Coven Seeker",
      recipientEmail: trimmedEmail,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    sfx.playShuffleTick(0, 1.4);

    try {
      await setDoc(doc(db, "band_invites", inviteId), newInvite);
      showToast(`Band invitation sent to ${trimmedEmail}!`, "success");
      setInviteEmailInput("");
      setShowEmailInviteModal(false);
    } catch (err) {
      console.error("Error sending band invite:", err);
      showToast("Failed to send invitation to the cloud.", "error");
    }
  };

  // Accept Email Band Invitation
  const handleAcceptInvite = async (invite: BandInvite) => {
    if (!user) return;
    sfx.playShuffleTick(0, 1.5);

    try {
      // 1. Update invite status to 'accepted'
      await updateDoc(doc(db, "band_invites", invite.id), { status: "accepted" });

      // 2. Add inviter as a connected soul candidate and band member in recipient's profile
      const inviterMember: SoulCandidate = {
        id: invite.inviterUid,
        name: invite.inviterName || invite.inviterEmail.split("@")[0],
        title: "Coven Member",
        avatarSigil: "bg-purple-950/80 border-purple-500 text-purple-300",
        bio: `Bonded via email invitation (${invite.inviterEmail})`,
        compatibility: 99,
        favoriteGenre: "Dark Fantasy & Horror",
        streamingAccounts: ["Netflix"],
        status: "connected",
        inBand: true
      };

      await setDoc(doc(db, "users", user.uid, "band_candidates", invite.inviterUid), inviterMember);
      await setDoc(doc(db, "users", user.uid, "band_roster", invite.inviterUid), inviterMember);

      // 3. Add recipient as a connected soul candidate and band member in inviter's profile
      const recipientMember: SoulCandidate = {
        id: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Coven Member",
        title: "Coven Member",
        avatarSigil: "bg-emerald-950/80 border-emerald-500 text-emerald-300",
        bio: `Accepted email invitation (${user.email})`,
        compatibility: 99,
        favoriteGenre: "Dark Fantasy & Horror",
        streamingAccounts: ["Netflix"],
        status: "connected",
        inBand: true
      };

      await setDoc(doc(db, "users", invite.inviterUid, "band_candidates", user.uid), recipientMember);
      await setDoc(doc(db, "users", invite.inviterUid, "band_roster", user.uid), recipientMember);

      // Trigger Real-Time Match Alert
      triggerRealtimeMatchAlert(inviterMember);

      showToast(`Accepted invitation from ${invite.inviterName}! Added to thy Band!`, "success");
    } catch (err) {
      console.error("Error accepting band invite:", err);
      showToast("Failed to accept invitation.", "error");
    }
  };

  // Decline Email Band Invitation
  const handleDeclineInvite = async (invite: BandInvite) => {
    if (!user) return;
    sfx.playShuffleTick(0, 0.8);

    try {
      await updateDoc(doc(db, "band_invites", invite.id), { status: "declined" });
      showToast(`Invitation from ${invite.inviterName} declined.`, "info");
    } catch (err) {
      console.error("Error declining invite:", err);
    }
  };

  // Handle Connecting or Passing a Soul candidate
  const handleDecideSoul = async (id: string, action: "connect" | "pass") => {
    sfx.playShuffleTick(0, 1.3);
    const newStatus = action === "connect" ? "connected" : "passed";

    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    const soul = candidates.find((c) => c.id === id);
    if (!soul) return;

    const updatedSoul: SoulCandidate = { ...soul, status: newStatus };

    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "band_candidates", id);
        await setDoc(docRef, updatedSoul, { merge: true });

        // When either user accepts the pairing, sync connected status to partner's candidates
        if (action === "connect") {
          const myData: SoulCandidate = {
            id: user.uid,
            name: user.displayName || myProfileName || "Elder Seer",
            title: myProfileTitle || "Arcane Practitioner",
            avatarSigil: myProfileSigil,
            necromanticAvatarIcon: myProfileAvatarIcon,
            interests: myProfileInterests,
            bio: myProfileBio || "Bonded coven seeker.",
            compatibility: 98,
            favoriteGenre: myProfileGenre,
            streamingAccounts: myProfileStreaming,
            status: "connected"
          };
          await setDoc(doc(db, "users", id, "band_candidates", user.uid), myData, { merge: true });
        }
      } catch (e) {
        console.error("Error updating candidate in Firestore:", e);
      }
    }

    if (action === "connect") {
      triggerRealtimeMatchAlert(updatedSoul);
      showToast(`✨ Pairing accepted! Soul Bond initiated with ${soul.name}. Chat & Band induction unlocked!`, "success");

      setSelectedChatSoul({ ...soul, status: "connected" });
      setActiveView("chats");
    } else if (action === "pass") {
      showToast(`Severed tether with ${soul.name}.`, "info");
    }
  };

  // Send Chat message (Real user messages stored directly to Firestore for both users)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChatSoul) return;

    sfx.playShuffleTick(0, 1.4);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userText = inputMessage.trim();
    const soulId = selectedChatSoul.id;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.uid || "user-self",
      senderName: user?.displayName || "You (Elder Seer)",
      text: userText,
      timestamp: timeStr,
      isUser: true
    };

    setMessages((prev) => ({
      ...prev,
      [soulId]: [...(prev[soulId] || []), newMsg]
    }));

    setInputMessage("");

    if (user) {
      try {
        const msgData = {
          senderId: user.uid,
          senderName: user.displayName || "You (Elder Seer)",
          text: userText,
          timestampStr: timeStr,
          timestamp: Date.now(),
          isUser: true
        };
        await addDoc(collection(db, "users", user.uid, "chats", soulId, "messages"), msgData);
        await addDoc(collection(db, "users", soulId, "chats", user.uid, "messages"), {
          ...msgData,
          isUser: false
        });
      } catch (e) {
        console.error("Error saving message to Firestore:", e);
      }
    }
  };

  // Add Soul to 10-Member Band
  const handleAddToBand = async (soul: SoulCandidate) => {
    if (band.members.length >= 10) {
      showToast("Thy Band is already at maximum capacity (10 Souls). Release a member first.", "error");
      return;
    }

    if (band.members.some((m) => m.id === soul.id)) {
      showToast(`${soul.name} is already inducted into thy Band!`, "info");
      return;
    }

    sfx.playShuffleTick(0, 1.5);
    const updatedMember = { ...soul, inBand: true };

    setBand((prev) => ({
      ...prev,
      members: [...prev.members, updatedMember]
    }));

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "band_roster", soul.id), updatedMember);
      } catch (e) {
        console.error("Error saving band member to Firestore:", e);
      }
    }

    showToast(`${soul.name} has been inducted into ${band.name}! (Slots: ${band.members.length + 1}/10)`, "success");
  };

  // Remove Soul from Band
  const handleRemoveFromBand = async (soulId: string) => {
    sfx.playShuffleTick(0, 0.9);
    setBand((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== soulId)
    }));

    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "band_roster", soulId));
      } catch (e) {
        console.error("Error removing band member from Firestore:", e);
      }
    }

    showToast("Soul released from thy Band.", "info");
  };

  // Trigger floating reaction in watch party
  const triggerReaction = (emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 70) + 15;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  // Direct Web Redirection & Teleparty Authorization
  const handleAuthorizeProvider = async (serviceName: string = "Teleparty") => {
    const loginUrl = "https://www.teleparty.com";
    
    sfx.playArcaneShimmer();
    showToast(`✨ Opening Teleparty sign-in portal in new window...`, "info");

    // Call server endpoint for audit logging
    try {
      await fetch("/api/auth/teleparty");
    } catch (err) {
      console.warn("Teleparty authorization server call error:", err);
    }

    // Web redirection: open official Teleparty login page in new browser window
    window.open(loginUrl, "_blank", "noopener,noreferrer");

    // Persist authorization & account handle
    const typedHandle = accountHandleInputs["Teleparty"] || accountHandleInputs[serviceName];
    const defaultHandle = user?.email ? user.email.split("@")[0] : "teleparty_seeker";
    const finalHandle = typedHandle && typedHandle.trim().length > 0 ? typedHandle.trim() : defaultHandle;

    const updated = linkedAccounts.map((acc) =>
      acc.service === "Teleparty" || acc.service === serviceName
        ? {
            ...acc,
            service: "Teleparty" as const,
            connected: true,
            username: finalHandle
          }
        : acc
    );

    if (!updated.some((a) => a.service === "Teleparty")) {
      updated.push({
        service: "Teleparty",
        connected: true,
        username: finalHandle
      });
    }

    setLinkedAccounts(updated);

    if (user) {
      try {
        const targetAcc = updated.find((a) => a.service === "Teleparty");
        if (targetAcc) {
          await setDoc(doc(db, "users", user.uid, "streaming_accounts", "Teleparty"), targetAcc);
        }
      } catch (e) {
        console.error("Error syncing Teleparty authorization to Firestore:", e);
      }
    }

    showToast(`✨ Authorized Teleparty account (${finalHandle})! Sign in on Teleparty.com to select thy streaming platform.`, "success");
  };

  // Save Real User Handle / Username to Link Streaming Account
  const handleSaveStreamingAccount = async (serviceName: string, usernameInput: string) => {
    const trimmed = usernameInput.trim();
    const updated = linkedAccounts.map((acc) =>
      acc.service === serviceName
        ? {
            ...acc,
            connected: trimmed.length > 0,
            username: trimmed || undefined
          }
        : acc
    );

    setLinkedAccounts(updated);
    sfx.playShuffleTick(0, 1.2);

    if (user) {
      try {
        const targetAcc = updated.find((a) => a.service === serviceName);
        if (targetAcc) {
          await setDoc(doc(db, "users", user.uid, "streaming_accounts", serviceName), targetAcc);
        }
      } catch (e) {
        console.error("Error syncing streaming accounts to Firestore:", e);
      }
    }

    if (trimmed.length > 0) {
      showToast(`Linked ${serviceName} as '${trimmed}'`, "success");
    } else {
      showToast(`Disconnected ${serviceName}`, "info");
    }
  };

  const connectedSouls = candidates.filter((c) => c.status === "connected");
  const pendingSouls = candidates.filter((c) => c.status === "pending");

  return (
    <div className="w-full flex flex-col space-y-4 relative text-[#eaddca]">
      
      {/* Top Banner Header: "Join The Band" (Nigromancy Covenant) */}
      <div className="bg-gradient-to-r from-[#181310] via-[#241a13] to-[#181310] border border-[#d4af37]/30 rounded-md p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2.5 bg-black/60 border border-[#d4af37]/50 rounded-md text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-base font-bold text-[#f1e5ac] tracking-wide uppercase flex items-center gap-1.5">
                Join The Band
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] rounded-full">
                  Social Cinema Coven
                </span>
              </h3>

              {/* SYNC STATUS & PUBLICATION BADGES */}
              {user ? (
                <span className="text-[9.5px] font-mono px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded-full flex items-center gap-1">
                  <CloudCheck className="w-3 h-3 text-emerald-400" />
                  <span>Coven Vault Synced ({user.displayName || user.email?.split('@')[0]})</span>
                </span>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-[9.5px] font-mono px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/50 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                >
                  <CloudOff className="w-3 h-3 text-amber-400" />
                  <span>Sign In to Sync Souls</span>
                </button>
              )}

              {isMyProfilePublished ? (
                <span className="text-[9.5px] font-mono px-2.5 py-0.5 bg-emerald-950/90 text-emerald-200 border border-emerald-400/80 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Profile Filed in System Ledger</span>
                </span>
              ) : (
                <span className="text-[9.5px] font-mono px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded-full flex items-center gap-1">
                  ⚠️ Profile Not Filed
                </span>
              )}
            </div>
            <p className="font-serif text-[11px] text-[#c5b396] italic mt-1">
              {isMyProfilePublished
                ? "Welcome to the band, now that you have joined elder deck, your coven awaits you."
                : "Join The Band connects you with fellow seekers in the public coven. Publish your profile to discover matched souls, sign in with Teleparty.com via web redirection for synchronized Watch Parties, initiate live scrying video calls, and form a 10-member Band for group movie nights."}
            </p>
          </div>
        </div>

        {/* Quick Actions / Link Accounts & Profile Buttons */}
        <div className="flex flex-wrap items-center gap-2 z-10 shrink-0">
          {!isMyProfilePublished && (
            <button
              onClick={() => setShowMyProfileModal(true)}
              className="px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-[10px] font-serif tracking-wider text-purple-200 rounded transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>Publish My Soul Profile</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowAddCandidateModal(true);
              handlePerformAiSelection();
            }}
            className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-[10px] font-serif tracking-wider text-emerald-200 rounded transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Real Candidate Soul</span>
          </button>

          <button
            onClick={() => setShowEmailInviteModal(true)}
            className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-[10px] font-serif tracking-wider text-amber-200 rounded transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Invite by Email</span>
          </button>

          <button
            onClick={() => setShowNotifDrawer(true)}
            className="relative px-3 py-1.5 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/80 text-[10px] font-serif tracking-wider text-purple-200 rounded transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
            title="Real-Time Match Alerts"
          >
            <Bell className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>Match Alerts</span>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-black font-mono text-[9px] font-bold rounded-full">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowStreamingModal(true)}
            className="px-3 py-1.5 bg-black/50 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 hover:border-[#d4af37] text-[10px] font-serif tracking-wider text-[#d4af37] rounded transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Tv className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Link Streaming Accounts</span>
          </button>
        </div>
      </div>

      {/* SYSTEM ALERT: PUBLISHED PROFILE BANNER */}
      {isMyProfilePublished && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/70 rounded-md shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs font-serif text-emerald-200 animate-fade-in z-10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <div>
              <strong className="text-emerald-300 font-bold block uppercase tracking-wider text-[11px]">
                Welcome to the band, now that you have joined elder deck, your coven awaits you.
              </strong>
              <span className="text-[10px] text-emerald-200/90 font-mono block">
                Profile Filed in System Ledger • Noted, catalogued & logged in Coven System Directory
              </span>
            </div>
          </div>
        </div>
      )}

      {/* INCOMING EMAIL BAND INVITATIONS BANNER */}
      {incomingInvites.length > 0 && (
        <div className="p-4 bg-purple-950/80 border border-purple-500/80 rounded-md shadow-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-purple-300 animate-bounce" />
            <h4 className="font-serif text-sm font-bold text-purple-200 uppercase tracking-wider">
              Pending Band Invitation ({incomingInvites.length})
            </h4>
          </div>
          <p className="font-serif text-xs text-[#c5b396]">
            A fellow coven seeker has invited thee to join their 10-member Band! Once accepted, both of thy souls will be bound together in the covenant.
          </p>
          <div className="space-y-2">
            {incomingInvites.map((invite) => (
              <div
                key={invite.id}
                className="p-3 bg-black/70 border border-purple-500/40 rounded flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <span className="font-serif text-xs font-bold text-purple-200 block">
                    {invite.inviterName} ({invite.inviterEmail})
                  </span>
                  <span className="font-mono text-[9px] text-gray-400">
                    Sent {new Date(invite.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 border border-emerald-500 text-emerald-100 text-xs font-serif uppercase tracking-wider font-bold rounded cursor-pointer transition-all flex items-center space-x-1 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Accept Invitation</span>
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-gray-300 text-xs font-serif uppercase tracking-wider rounded cursor-pointer transition-all flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-NAVIGATION BAR STRICTLY MATCHING USER SPECIFICATIONS */}
      <div className="flex w-full bg-black/50 p-1 rounded border border-[#d4af37]/20 gap-1">
        <button
          onClick={() => { sfx.playShuffleTick(0, 1.2); setActiveView("summon"); }}
          className={`flex-1 py-2 px-3 rounded text-[11px] font-serif tracking-wider uppercase font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeView === "summon"
              ? "bg-[#282018] text-[#f1e5ac] border border-[#d4af37]/60 shadow-md"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Daily 4 Souls ({dailyFourSouls.length})</span>
        </button>

        <button
          onClick={() => { sfx.playShuffleTick(0, 1.2); setActiveView("chats"); }}
          className={`flex-1 py-2 px-3 rounded text-[11px] font-serif tracking-wider uppercase font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeView === "chats"
              ? "bg-[#282018] text-[#f1e5ac] border border-[#d4af37]/60 shadow-md"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Chat ({connectedSouls.length})</span>
        </button>

        <button
          onClick={() => { sfx.playShuffleTick(0, 1.2); setActiveView("watch_party"); }}
          className={`flex-1 py-2 px-3 rounded text-[11px] font-serif tracking-wider uppercase font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeView === "watch_party"
              ? "bg-[#282018] text-[#f1e5ac] border border-[#d4af37]/60 shadow-md"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Watch Party</span>
        </button>
      </div>

      {/* VIEW 1: DAILY 4 SOULS (MATCHING SCREEN) */}
      {activeView === "summon" && (
        <div className="space-y-3">
          {/* PROMINENT NIGROMANCY AESTHETIC LIVE CYCLE TIMER BADGE */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-950/90 via-black to-purple-950/90 border-2 border-[#d4af37]/60 p-3 sm:p-4 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-black/80 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-inner relative">
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif text-xs sm:text-sm font-bold text-[#f1e5ac] tracking-wide uppercase flex items-center gap-1.5">
                      <span>2-Day Algorithmic Necromantic Cycle</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full">
                        4 Souls / 48 Hours
                      </span>
                    </span>
                  </div>
                  <p className="font-serif text-[11px] text-gray-300">
                    Pairing thee with four matched Coven souls every 48 hours. Live cycle alignment countdown:
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-black/80 px-3.5 py-2 rounded-lg border border-[#d4af37]/40 shadow-inner">
                <div className="text-right">
                  <span className="font-mono text-sm sm:text-base font-black text-emerald-400 tracking-wider block drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
                    {timeUntilRefresh || "48h 00m 00s"}
                  </span>
                  <span className="font-mono text-[8.5px] text-amber-300/80 uppercase tracking-widest block font-semibold">
                    Time Until Next Shuffle
                  </span>
                </div>

                <button
                  onClick={() => {
                    sfx.playArcaneShimmer();
                    perform2DayAiShuffle(covenPublicSouls);
                    showToast("✨ Manual Re-Roll Triggered: Fresh 4-soul match pool loaded!", "success");
                  }}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600/30 to-emerald-600/30 hover:from-amber-600/50 hover:to-emerald-600/50 text-[#f1e5ac] border border-[#d4af37]/60 text-[10px] font-serif uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center space-x-1.5 shadow-md active:scale-95"
                  title="Manual Re-Roll: Force a fresh random shuffle of candidates"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="font-bold">Manual Re-Roll</span>
                </button>
              </div>
            </div>
          </div>

          {dailyFourSouls.length === 0 ? (
            isMyProfilePublished ? (
              /* AWAITING RESONANCE MODULE - REAL LIVE SERVER PRESENCE SENSING */
              <div id="awaiting-resonance-portal" className="p-8 text-center bg-black/60 border-2 border-[#d4af37]/40 rounded-xl space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-500 animate-pulse" />
                
                {/* Pulsing Scrying Orb Graphic */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-purple-500/10 border border-purple-500/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-amber-500/15 border-2 border-dashed border-amber-400/40 animate-spin" style={{ animationDuration: '10s' }} />
                  <div className="w-14 h-14 rounded-full bg-black/90 border border-[#d4af37]/70 flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)] z-10">
                    <Radio className="w-7 h-7 text-amber-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h4 className="font-serif text-lg font-bold text-[#f1e5ac] uppercase tracking-wider flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Awaiting Server Resonance</span>
                  </h4>
                  <p className="font-serif text-xs text-[#c5b396] leading-relaxed">
                    Thy destiny scroll is published and actively radiating in the archives. To maintain the purity of the coven, this feature utilizes 100% real live server data. No phantom profiles or illusions are conjured.
                  </p>
                </div>

                {/* Real-time Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto bg-black/80 p-4 rounded-lg border border-white/5 text-left font-serif">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Thy Presence Status</span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>Online & Radiating</span>
                    </span>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Profiles in Database</span>
                    <span className="text-xs text-[#f1e5ac] font-bold">
                      {covenPublicSouls.length} {covenPublicSouls.length === 1 ? 'seeker' : 'seekers'} registered
                    </span>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Other Online Seekers</span>
                    <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span>0 currently active</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <p className="text-[11px] text-gray-400 italic max-w-md">
                    "When another seeker enters the scrying chambers and goes online on the server, the pairing feature will begin immediately..."
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        sfx.playArcaneShimmer();
                        perform2DayAiShuffle(covenPublicSouls);
                        showToast("🔮 Scrying orb focused: searching for real-time online coven frequencies...", "info");
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600/20 to-purple-600/20 hover:from-amber-600/40 hover:to-purple-600/40 border border-[#d4af37]/60 text-[#f1e5ac] text-xs font-serif uppercase tracking-wider font-bold rounded flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#d4af37] animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Refocus Scrying Orb</span>
                    </button>
                    
                    <button
                      onClick={() => setShowMyProfileModal(true)}
                      className="px-4 py-2 bg-black/80 hover:bg-black border border-purple-500/50 text-purple-200 text-xs font-serif uppercase tracking-wider rounded transition-all cursor-pointer"
                    >
                      <span>Edit My Profile</span>
                    </button>

                    <button
                      onClick={() => setShowAddCandidateModal(true)}
                      className="px-4 py-2 bg-emerald-950/95 hover:bg-emerald-900 border border-emerald-500/80 text-emerald-200 text-xs font-serif uppercase tracking-wider font-bold rounded flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Add Real Candidate Soul</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div id="coven-join-intro" className="p-8 text-center bg-black/40 border border-[#d4af37]/30 rounded-md space-y-4 shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-base font-bold text-[#f1e5ac] uppercase tracking-wider">
                    Join The Band — Social Cinema Coven
                  </h4>
                  <p className="font-serif text-xs text-[#c5b396] max-w-xl mx-auto leading-relaxed">
                    Join The Band connects you with fellow seekers in the public coven. Publish your profile to discover matched souls, sign in with Teleparty.com via web redirection for synchronized Watch Parties, initiate live scrying video calls, and form a 10-member Band for group movie nights.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {!isMyProfilePublished && (
                    <button
                      onClick={() => setShowMyProfileModal(true)}
                      className="px-4 py-2 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/80 text-purple-200 text-xs font-serif uppercase tracking-wider font-bold rounded flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                    >
                      <UserPlus className="w-4 h-4 text-purple-400" />
                      <span>Publish My Soul Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowAddCandidateModal(true)}
                    className="px-4 py-2 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/80 text-emerald-200 text-xs font-serif uppercase tracking-wider font-bold rounded flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Add Real Candidate Soul</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {/* GENRE & INTEREST COMPATIBILITY FILTERS CONTROL BAR */}
              <div className="bg-black/75 border border-[#d4af37]/40 p-3.5 rounded-xl space-y-3 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4af37]/20 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-[#d4af37]" />
                    <span className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider">
                      Genre & Interest Compatibility Filters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/90 px-2 py-0.5 border border-emerald-500/40 rounded-full font-semibold">
                      Showing {filteredDailySouls.length} of {dailyFourSouls.length} Candidates
                    </span>
                    {(selectedGenreFilter !== "All Genres" || selectedInterestFilter !== "All Interests" || showOnlySharedInterests || minMatchScoreFilter > 0) && (
                      <button
                        onClick={() => {
                          setSelectedGenreFilter("All Genres");
                          setSelectedInterestFilter("All Interests");
                          setShowOnlySharedInterests(false);
                          setMinMatchScoreFilter(0);
                          sfx.playShuffleTick(0, 1.2);
                        }}
                        className="font-serif text-[10px] text-amber-300 hover:underline uppercase font-bold cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* 1. Genre Filter */}
                  <div>
                    <label className="font-serif text-[9.5px] text-gray-400 uppercase block mb-1">
                      Movie Genre Overlap:
                    </label>
                    <select
                      value={selectedGenreFilter}
                      onChange={(e) => { setSelectedGenreFilter(e.target.value); sfx.playShuffleTick(0, 1.1); }}
                      className="w-full bg-black/90 border border-[#d4af37]/40 text-xs font-serif text-[#f1e5ac] px-2.5 py-1.5 rounded focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="All Genres">All Movie Genres</option>
                      <option value="Horror">Horror & Slashers</option>
                      <option value="Dark Fantasy">Dark Fantasy & Epics</option>
                      <option value="Cult Classics">Cult Classics & Monsters</option>
                      <option value="Sci-Fi">Dark Sci-Fi & Thrillers</option>
                      <option value="Medieval">Medieval & Historical</option>
                    </select>
                  </div>

                  {/* 2. Eldritch Interest Filter */}
                  <div>
                    <label className="font-serif text-[9.5px] text-gray-400 uppercase block mb-1">
                      Eldritch Interest Filter:
                    </label>
                    <select
                      value={selectedInterestFilter}
                      onChange={(e) => { setSelectedInterestFilter(e.target.value); sfx.playShuffleTick(0, 1.1); }}
                      className="w-full bg-black/90 border border-[#d4af37]/40 text-xs font-serif text-[#f1e5ac] px-2.5 py-1.5 rounded focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="All Interests">All Eldritch Lore</option>
                      {NECROMANTIC_INTERESTS_LIST.map((interest) => (
                        <option key={interest} value={interest}>{interest}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Min Match Score */}
                  <div>
                    <label className="font-serif text-[9.5px] text-gray-400 uppercase block mb-1">
                      Min Match Score Indicator:
                    </label>
                    <select
                      value={minMatchScoreFilter}
                      onChange={(e) => { setMinMatchScoreFilter(Number(e.target.value)); sfx.playShuffleTick(0, 1.1); }}
                      className="w-full bg-black/90 border border-[#d4af37]/40 text-xs font-serif text-[#f1e5ac] px-2.5 py-1.5 rounded focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value={0}>Any Match Score (0%+)</option>
                      <option value={70}>High Affinity (70%+)</option>
                      <option value={80}>Strong Resonance (80%+)</option>
                      <option value={90}>Perfect Alignment (90%+)</option>
                    </select>
                  </div>

                  {/* 4. Sorting */}
                  <div>
                    <label className="font-serif text-[9.5px] text-gray-400 uppercase block mb-1">
                      Sort Candidates:
                    </label>
                    <select
                      value={sortByMatchScore}
                      onChange={(e) => { setSortByMatchScore(e.target.value as "highest" | "default"); sfx.playShuffleTick(0, 1.1); }}
                      className="w-full bg-black/90 border border-[#d4af37]/40 text-xs font-serif text-[#f1e5ac] px-2.5 py-1.5 rounded focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="highest">Highest Match Score First</option>
                      <option value="default">Default Cycle Order</option>
                    </select>
                  </div>
                </div>

                {/* Quick Toggle Pill for Shared Interests */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => { setShowOnlySharedInterests(!showOnlySharedInterests); sfx.playShuffleTick(0, 1.2); }}
                    className={`px-3 py-1 rounded-full border text-[10px] font-serif uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      showOnlySharedInterests
                        ? "bg-purple-950 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                        : "bg-black/60 text-gray-400 border-white/10 hover:border-purple-500/50 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span>⚡ Show Only Shared Eldritch Interests</span>
                  </button>

                  <div className="text-[10px] font-mono text-amber-300/80">
                    Calculated from streaming, eldritch lore & genre overlaps
                  </div>
                </div>
              </div>

              {filteredDailySouls.length === 0 ? (
                <div className="p-6 text-center bg-black/60 border border-amber-500/30 rounded-xl space-y-2">
                  <p className="font-serif text-sm text-[#f1e5ac]">
                    No candidate souls match thy active filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedGenreFilter("All Genres");
                      setSelectedInterestFilter("All Interests");
                      setShowOnlySharedInterests(false);
                      setMinMatchScoreFilter(0);
                    }}
                    className="px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37]/60 text-[#f1e5ac] text-xs font-serif rounded uppercase font-bold hover:bg-[#d4af37]/40 transition-all cursor-pointer"
                  >
                    Clear Filter Criteria
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDailySouls.map((soul) => {
                  const matchDetails = computeMatchDetails(soul);
                  const { score, sharedInterests, sharedPlatforms, genreMatch, scoreBreakdown } = matchDetails;

                  return (
                    <div
                      key={soul.id}
                      className={`p-4 rounded-md border transition-all flex flex-col justify-between relative overflow-hidden bg-[#181310]/90 ${
                        soul.status === "connected"
                          ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : soul.status === "passed"
                          ? "border-red-900/30 opacity-60"
                          : "border-[#d4af37]/30 hover:border-[#d4af37]/70 shadow-md"
                      }`}
                    >
                      {/* Background Ambient Glow */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-xl pointer-events-none" />

                      <div className="space-y-2.5 z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-md flex flex-col items-center justify-center border font-serif font-bold text-sm shadow-inner shrink-0 ${soul.avatarSigil}`}>
                              {soul.necromanticAvatarIcon ? (
                                <span className="text-base leading-none">{soul.necromanticAvatarIcon}</span>
                              ) : (
                                soul.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <h4 className="font-serif text-sm font-bold text-[#f1e5ac] flex flex-wrap items-center gap-1.5">
                                <span>{soul.name}</span>
                                {isFounderProfile(soul, user) && <FoundersBadge size="sm" />}
                                {soul.status === "connected" && (
                                  <span className="text-[8.5px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded">
                                    Bonded
                                  </span>
                                )}
                              </h4>
                              <span className="font-serif text-[10px] text-[#c5b396] italic block">
                                {soul.title}
                              </span>
                            </div>
                          </div>

                          {/* PROMINENT MATCH SCORE INDICATOR */}
                          <div className="text-right flex flex-col items-end shrink-0">
                            <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-950 via-black to-emerald-950 border border-[#d4af37]/70 shadow-lg flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                              <span className="font-mono text-xs font-bold text-[#f1e5ac]">
                                {score}% Match Score
                              </span>
                            </div>
                            <span className="font-mono text-[8px] text-amber-300 uppercase tracking-wider block mt-1 font-semibold">
                              {sharedInterests.length > 0 ? `⚡ ${sharedInterests.length} Shared Interests` : "Resonant Affinity"}
                            </span>
                          </div>
                        </div>

                        <p className="font-serif text-xs text-[#eaddca]/90 leading-relaxed bg-black/40 p-2.5 rounded border border-white/5">
                          "{soul.bio}"
                        </p>

                        {/* MOVIE GENRE & PLATFORM OVERLAYS */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {genreMatch ? (
                            <span className="text-[9px] font-serif bg-emerald-950/90 text-emerald-200 border border-emerald-500/60 px-2 py-0.5 rounded flex items-center gap-1 font-bold shadow-sm">
                              <Film className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>Genre Overlap: {soul.favoriteGenre} (+12%)</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-serif bg-black/60 text-gray-400 border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                              <Film className="w-3 h-3 text-gray-500 shrink-0" />
                              <span>Fav Genre: {soul.favoriteGenre}</span>
                            </span>
                          )}

                          {sharedPlatforms.length > 0 && (
                            <span className="text-[9px] font-serif bg-amber-950/90 text-amber-200 border border-amber-500/60 px-2 py-0.5 rounded flex items-center gap-1 font-bold shadow-sm">
                              <Tv className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Shared Stream: {sharedPlatforms.join(", ")}</span>
                            </span>
                          )}
                        </div>

                        {/* ELDRITCH INTEREST OVERLAY */}
                        {soul.interests && soul.interests.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="font-serif text-[9px] text-gray-400 uppercase tracking-wider block">
                              Eldritch Interests & Overlap:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {soul.interests.map((interest, idx) => {
                                const isShared = sharedInterests.some(si => si.toLowerCase().trim() === interest.toLowerCase().trim());
                                return (
                                  <span
                                    key={idx}
                                    className={`text-[9px] font-serif px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                                      isShared
                                        ? "bg-gradient-to-r from-amber-950 to-emerald-950 text-amber-200 border border-amber-400/80 font-bold shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                                        : "bg-purple-950/60 text-purple-200 border border-purple-500/30"
                                    }`}
                                  >
                                    {isShared && <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />}
                                    <span>{isShared ? `Shared: ${interest}` : interest}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-400 border-t border-white/10 pt-2 gap-1">
                          <span className="font-serif italic text-[#c5b396]">
                            Streaming Accounts:
                          </span>
                          <div className="flex items-center space-x-1">
                            {soul.streamingAccounts.map((acc) => (
                              <span key={acc} className="px-1.5 py-0.5 bg-black/60 border border-[#d4af37]/30 text-[#d4af37] font-mono text-[8.5px] rounded">
                                {acc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS: ACCEPT OR PASS */}
                      <div className="mt-3.5 pt-2 border-t border-[#d4af37]/20 flex items-center gap-2 z-10">
                        {soul.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleDecideSoul(soul.id, "pass")}
                              className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-[10px] font-serif tracking-wider uppercase rounded transition-all cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Sever Tether</span>
                            </button>

                            <button
                              onClick={() => handleDecideSoul(soul.id, "connect")}
                              className="flex-1 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#f1e5ac] border border-[#d4af37]/60 text-[10px] font-serif tracking-wider uppercase font-bold rounded transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-md"
                            >
                              <Check className="w-3 h-3 text-[#d4af37]" />
                              <span>Initiate Bond</span>
                            </button>
                          </>
                        ) : soul.status === "connected" ? (
                          <button
                            onClick={() => {
                              setSelectedChatSoul(soul);
                              setActiveView("chats");
                            }}
                            className="w-full py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/50 text-[10px] font-serif tracking-wider uppercase font-bold rounded transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Open Soul Chat & FaceTime</span>
                          </button>
                        ) : (
                          <span className="w-full text-center font-serif text-[10px] italic text-gray-500 py-1">
                            Tether severed for today
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              )}

            {/* MANUAL RE-ROLL TRIGGER BANNER */}
            <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-black to-purple-950/60 border border-[#d4af37]/40 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0">
                  <RefreshCw className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <h5 className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider flex items-center gap-1.5">
                    <span>Manual Re-Roll Match Trigger</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/40 rounded">
                      Instant Refresh
                    </span>
                  </h5>
                  <p className="font-serif text-[11px] text-gray-300">
                    Connected with all current candidates or seeking a fresh draw? Trigger a manual re-roll to draw 4 new matched souls.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sfx.playArcaneShimmer();
                  perform2DayAiShuffle(covenPublicSouls);
                  showToast("✨ Manual Re-Roll Triggered: Fresh 4-soul match pool loaded!", "success");
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-serif text-xs font-bold uppercase tracking-wider rounded-md border border-[#d4af37]/80 shadow-md transition-all cursor-pointer flex items-center space-x-2 active:scale-95 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin-slow" />
                <span>Re-Roll Match Pool Now</span>
              </button>
            </div>
          </div>
          )}
        </div>
      )}

      {/* VIEW 2: SOUL CONNECTIONS & ACTIVE CHAT */}
      {activeView === "chats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-h-[420px]">
          {/* Left Column: List of Connected Souls */}
          <div className="md:col-span-1 bg-[#181310] border border-[#d4af37]/20 rounded-md p-2.5 flex flex-col space-y-2">
            <span className="font-serif text-xs font-bold text-[#d4af37] tracking-wider uppercase px-1 border-b border-[#d4af37]/20 pb-1 flex items-center justify-between">
              <span>Bonded Souls ({connectedSouls.length})</span>
            </span>

            {connectedSouls.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 font-serif italic my-auto">
                No active soul bonds yet. Go to the "Daily 4 Souls" tab and initiate a bond!
              </div>
            ) : (
              <div className="space-y-1.5 overflow-y-auto max-h-[360px]">
                {connectedSouls.map((soul) => {
                  const isSelected = selectedChatSoul?.id === soul.id;
                  return (
                    <button
                      key={soul.id}
                      onClick={() => {
                        sfx.playShuffleTick(0, 1.2);
                        setSelectedChatSoul(soul);
                      }}
                      className={`w-full p-2 rounded text-left transition-all border flex items-center space-x-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#282018] border-[#d4af37] text-[#f1e5ac] shadow"
                          : "bg-black/30 border-white/5 hover:bg-white/5 text-gray-300"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center border font-serif font-bold text-xs shrink-0 ${soul.avatarSigil}`}>
                        {soul.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <h5 className="font-serif text-xs font-bold truncate flex items-center gap-1">
                          <span className="truncate">{soul.name}</span>
                          {isFounderProfile(soul, user) && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" title="The Founder's Badge (ASCORP Founder & Creator)" />}
                        </h5>
                        <p className="font-serif text-[9.5px] text-gray-400 truncate italic">{soul.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Chat Window + Video Call & Watch Party Buttons */}
          <div className="md:col-span-2 bg-[#14100d] border border-[#d4af37]/30 rounded-md p-3 flex flex-col justify-between shadow-inner">
            {selectedChatSoul ? (
              <>
                {/* Chat Top Header */}
                <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2.5 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded flex items-center justify-center border font-serif font-bold text-xs ${selectedChatSoul.avatarSigil}`}>
                      {selectedChatSoul.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif text-xs font-bold text-[#f1e5ac] flex flex-wrap items-center gap-1.5">
                        <span>{selectedChatSoul.name}</span>
                        {isFounderProfile(selectedChatSoul, user) && <FoundersBadge size="sm" />}
                      </h4>
                      <span className="font-mono text-[8.5px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Online & Ready to Scry
                      </span>
                    </div>
                  </div>

                  {/* ACTION CONTROLS: FACETIME & WATCH PARTY & BAND INDUCTION */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        sfx.playShuffleTick(0, 1.3);
                        setIsVideoCallActive(true);
                      }}
                      className="px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/50 text-[9.5px] font-serif tracking-wider uppercase rounded transition-all cursor-pointer flex items-center space-x-1"
                      title="Launch Video Call / Scrying Mirror"
                    >
                      <Video className="w-3 h-3 text-purple-300" />
                      <span>FaceTime</span>
                    </button>

                    <button
                      onClick={() => {
                        sfx.playShuffleTick(0, 1.3);
                        setActiveView("watch_party");
                      }}
                      className="px-2.5 py-1 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#f1e5ac] border border-[#d4af37]/50 text-[9.5px] font-serif tracking-wider uppercase rounded transition-all cursor-pointer flex items-center space-x-1"
                      title="Launch Watch Party Room"
                    >
                      <Tv className="w-3 h-3 text-[#d4af37]" />
                      <span>Watch Party</span>
                    </button>

                    <button
                      onClick={() => handleAddToBand(selectedChatSoul)}
                      className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-500/50 text-[9.5px] font-serif uppercase rounded transition-all cursor-pointer flex items-center space-x-1"
                      title="Induct soul into your 10-person Band"
                    >
                      <UserPlus className="w-3 h-3 text-amber-300" />
                      <span>+ Band</span>
                    </button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[280px] min-h-[200px] mb-2.5">
                  {(messages[selectedChatSoul.id] || []).map((msg) => {
                    const isTelepartyMsg = msg.text.includes("teleparty.com") || msg.text.includes("Watch Party") || msg.text.includes("/party/");
                    const urlMatch = isTelepartyMsg ? msg.text.match(/https?:\/\/[^\s]+/) : null;
                    const linkUrl = urlMatch ? urlMatch[0] : (isTelepartyMsg && watchMovieUrl ? formatTelepartyUrl(watchMovieUrl) : "");
                    const code = linkUrl ? extractRoomCode(linkUrl) : "";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}
                      >
                        <span className="font-mono text-[8px] text-gray-500 mb-0.5 px-1">
                          {msg.senderName} • {msg.timestamp}
                        </span>
                        <div
                          className={`p-2.5 rounded-lg max-w-[85%] text-xs font-serif leading-relaxed border ${
                            msg.isUser
                              ? "bg-[#2d2218] text-[#f1e5ac] border-[#d4af37]/40 rounded-br-none shadow"
                              : "bg-[#181310] text-[#eaddca] border-white/10 rounded-bl-none"
                          }`}
                        >
                          {msg.text}

                          {isTelepartyMsg && linkUrl && (
                            <div className="p-2.5 bg-black/90 border border-[#d4af37]/60 rounded-lg space-y-2 mt-2 text-left shadow-lg">
                              <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-1.5">
                                <span className="font-serif text-[11px] font-bold text-[#f1e5ac] flex items-center gap-1.5">
                                  <Tv className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                  <span>Teleparty Watch Room</span>
                                </span>
                                {code && (
                                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-500/50 rounded font-semibold">
                                    Code: {code}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <button
                                  onClick={() => handleCopyTelepartyLink(linkUrl, "Watch Party Link")}
                                  className="flex-1 py-1 px-2.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/40 text-[#f1e5ac] border border-[#d4af37]/60 text-[10px] font-serif uppercase font-bold rounded flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-sm active:scale-95"
                                >
                                  <Copy className="w-3 h-3 text-[#d4af37]" />
                                  <span>1-Click Copy Link</span>
                                </button>

                                <button
                                  onClick={() => window.open(linkUrl, "_blank")}
                                  className="flex-1 py-1 px-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white border border-amber-400/50 text-[10px] font-serif uppercase font-bold rounded flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-sm active:scale-95"
                                >
                                  <ExternalLink className="w-3 h-3 text-amber-200" />
                                  <span>Join Watch Party</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (!watchMovieUrl.trim()) {
                        handleGenerateTelepartyCode();
                      }
                      const url = formatTelepartyUrl(watchMovieUrl) || "https://www.teleparty.com/party/tp-coven-room";
                      setInputMessage(`🎬 Teleparty Watch Party Room Invite! Join: ${url}`);
                      showToast("Loaded formatted Teleparty room link into chat input!", "info");
                    }}
                    className="p-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/50 rounded transition-all cursor-pointer shrink-0"
                    title="Insert Formatted Teleparty Watch Party Link"
                  >
                    <Tv className="w-4 h-4 text-amber-400" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Whisper to ${selectedChatSoul.name}...`}
                    className="flex-1 bg-black/60 border border-[#d4af37]/30 focus:border-[#d4af37] text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none placeholder:text-gray-600"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-3.5 py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/40 text-[#d4af37] border border-[#d4af37]/60 text-xs font-serif uppercase font-bold rounded transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-[#d4af37]/40" />
                <p className="font-serif text-xs">Select a bonded soul on the left to begin messaging or video chatting.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WATCH PARTY (TELEPARTY.COM AUTHORIZATION & MOVIE LINK CHAT SHARING) */}
      {activeView === "watch_party" && (
        <div className="space-y-4">
          {/* SCHEDULED BAND MOVIE NIGHTS & CALENDAR REMINDERS CARD */}
          <div className="p-4 bg-gradient-to-b from-[#1c151b] via-black to-[#13100d] border-2 border-[#d4af37]/60 rounded-xl space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4af37]/30 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#282018] border border-[#d4af37] rounded-lg shadow-md">
                  <Calendar className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <h5 className="font-serif text-sm font-bold text-[#f1e5ac] uppercase tracking-wide flex items-center gap-2">
                    <span>Scheduled Band Movie Nights & Calendar Reminders</span>
                    <span className="text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500/50 px-2 py-0.5 rounded-full font-bold">
                      {scheduledMovieNights.length} Event{scheduledMovieNights.length !== 1 ? "s" : ""}
                    </span>
                  </h5>
                  <span className="font-mono text-[9.5px] text-gray-400 block">
                    Plan upcoming watch parties with your bonded band, manage RSVPs, and export calendar reminders (.ics & Google Calendar)
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sfx.playArcaneShimmer();
                  setShowScheduleModal(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-700 hover:from-amber-500 hover:to-purple-600 text-white font-serif text-xs font-bold uppercase tracking-wider rounded border border-[#d4af37]/70 shadow-lg transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-200" />
                <span>Schedule Movie Night</span>
              </button>
            </div>

            {/* LIST OF SCHEDULED MOVIE NIGHTS */}
            {scheduledMovieNights.length === 0 ? (
              <div className="p-6 text-center bg-black/60 border border-amber-500/30 rounded-xl space-y-3">
                <Film className="w-8 h-8 text-[#d4af37]/50 mx-auto" />
                <p className="font-serif text-xs text-[#f1e5ac] max-w-md mx-auto">
                  No band movie nights scheduled yet. Click <strong className="text-amber-300 uppercase font-bold">Schedule Movie Night</strong> above to organize an upcoming stream watch party with your bonded band members!
                </p>
                <button
                  onClick={() => {
                    sfx.playArcaneShimmer();
                    setShowScheduleModal(true);
                  }}
                  className="px-4 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/40 text-[#f1e5ac] border border-[#d4af37]/60 text-xs font-serif uppercase font-bold rounded transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Create First Movie Night</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {scheduledMovieNights.map((event) => {
                  const rsvpArray = Object.values(event.rsvps || {}) as MovieNightRSVP[];
                  const attendingCount = rsvpArray.filter((r) => r.status === "attending").length;
                  const maybeCount = rsvpArray.filter((r) => r.status === "maybe").length;
                  const cannotCount = rsvpArray.filter((r) => r.status === "cannot").length;

                  const currentUserId = user?.uid || "user-self";
                  const myRsvpStatus = event.rsvps?.[currentUserId]?.status;

                  return (
                    <div
                      key={event.id}
                      className="bg-black/85 border border-[#d4af37]/50 hover:border-[#d4af37] p-4 rounded-xl space-y-3 transition-all shadow-xl relative overflow-hidden"
                    >
                      {/* Event Title & Date Banner */}
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-[9.5px] rounded uppercase font-bold">
                              {event.platform}
                            </span>
                            <h5 className="font-serif text-base font-bold text-[#f1e5ac]">
                              {event.movieTitle}
                            </h5>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-300 mt-1 font-serif">
                            <span className="flex items-center space-x-1 text-amber-300 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>{event.date}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-gray-300">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>{event.time}</span>
                            </span>
                            <span className="text-[10px] text-gray-400 italic">
                              Hosted by <strong className="text-[#eaddca]">{event.hostName}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Quick Calendar Export Actions */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => generateGoogleCalendarUrl(event)}
                            className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-500/50 text-[10px] font-serif uppercase font-bold rounded transition-all cursor-pointer flex items-center space-x-1"
                            title="Add to Google Calendar"
                          >
                            <Calendar className="w-3 h-3 text-amber-400" />
                            <span>Google Calendar</span>
                          </button>

                          <button
                            onClick={() => downloadIcsFile(event)}
                            className="px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/50 text-[10px] font-serif uppercase font-bold rounded transition-all cursor-pointer flex items-center space-x-1"
                            title="Download iCalendar .ics File"
                          >
                            <Download className="w-3 h-3 text-purple-300" />
                            <span>Export .ICS</span>
                          </button>

                          {(event.hostUid === user?.uid || user?.uid) && (
                            <button
                              onClick={() => handleDeleteMovieNight(event.id)}
                              className="p-1 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-800/40 rounded transition-all cursor-pointer"
                              title="Delete Movie Night Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Event Teleparty Link & Notes */}
                      {event.notes && (
                        <p className="font-serif text-xs text-[#eaddca]/90 italic bg-black/50 p-2 rounded border border-white/5">
                          "{event.notes}"
                        </p>
                      )}

                      <div className="p-2.5 bg-black/90 border border-emerald-500/40 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-300">
                        <div className="flex items-center space-x-2 truncate">
                          <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">Teleparty URL: {event.telepartyUrl}</span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleCopyTelepartyLink(event.telepartyUrl, "Teleparty URL")}
                            className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/60 text-[10px] font-serif font-bold uppercase rounded cursor-pointer flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </button>

                          <button
                            onClick={() => window.open(event.telepartyUrl, "_blank")}
                            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-black text-[10px] font-serif font-bold uppercase rounded cursor-pointer flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Join Stream</span>
                          </button>
                        </div>
                      </div>

                      {/* RSVP SYSTEM BAR */}
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider">
                              Band RSVP Status:
                            </span>
                            <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                                🕯️ {attendingCount} Attending
                              </span>
                              <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500/40 rounded font-bold">
                                🔮 {maybeCount} Maybe
                              </span>
                              {cannotCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800/40 rounded font-bold">
                                  💀 {cannotCount} Cannot
                                </span>
                              )}
                            </div>
                          </div>

                          {/* RSVP Toggle Buttons for Current User */}
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleToggleRSVP(event.id, "attending")}
                              className={`px-2.5 py-1 rounded text-[10px] font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                                myRsvpStatus === "attending"
                                  ? "bg-emerald-950 text-emerald-200 border-2 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                  : "bg-black/60 text-gray-400 border border-white/10 hover:border-emerald-500 hover:text-emerald-300"
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Attending</span>
                            </button>

                            <button
                              onClick={() => handleToggleRSVP(event.id, "maybe")}
                              className={`px-2.5 py-1 rounded text-[10px] font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                                myRsvpStatus === "maybe"
                                  ? "bg-purple-950 text-purple-200 border-2 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                  : "bg-black/60 text-gray-400 border border-white/10 hover:border-purple-500 hover:text-purple-300"
                              }`}
                            >
                              <HelpCircle className="w-3 h-3 text-purple-300" />
                              <span>Maybe</span>
                            </button>

                            <button
                              onClick={() => handleToggleRSVP(event.id, "cannot")}
                              className={`px-2.5 py-1 rounded text-[10px] font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                                myRsvpStatus === "cannot"
                                  ? "bg-red-950 text-red-200 border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                  : "bg-black/60 text-gray-400 border border-white/10 hover:border-red-500 hover:text-red-300"
                              }`}
                            >
                              <XCircle className="w-3 h-3 text-red-400" />
                              <span>Cannot</span>
                            </button>
                          </div>
                        </div>

                        {/* RSVP Attendees Roster Badges */}
                        {rsvpArray.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {rsvpArray.map((rsvp) => (
                              <span
                                key={rsvp.userId}
                                className={`text-[9.5px] font-serif px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                                  rsvp.status === "attending"
                                    ? "bg-emerald-950/80 text-emerald-200 border-emerald-500/50"
                                    : rsvp.status === "maybe"
                                    ? "bg-purple-950/80 text-purple-200 border-purple-500/50"
                                    : "bg-red-950/80 text-red-300 border-red-800/40 opacity-60"
                                }`}
                              >
                                <span>{rsvp.necromanticAvatarIcon || (rsvp.status === "attending" ? "🕯️" : "🔮")}</span>
                                <span className="font-bold">{rsvp.userName}</span>
                                <span className="text-[8.5px] opacity-75">
                                  ({rsvp.status})
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#181310] border border-[#d4af37]/40 rounded-md p-4 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-3">
              <div className="flex items-center space-x-2.5">
                <Tv className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#f1e5ac]">
                    Watch Party • Teleparty.com Authorization & Sign In
                  </h4>
                  <span className="font-mono text-[9.5px] text-gray-400 block">
                    Sign in to Teleparty via web redirection, then select your streaming platform on Teleparty.com to share movie links in chat
                  </span>
                </div>
              </div>
            </div>

            {/* TELEPARTY.COM AUTHORIZATION CARD SECTION */}
            <div className="p-4 bg-gradient-to-br from-[#1a1118] via-black to-black border-2 border-[#d4af37]/50 rounded-lg space-y-3.5 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-rose-600 via-amber-500 to-purple-600 text-white font-black text-sm flex items-center justify-center tracking-tighter shadow-md border border-white/20">
                    TP
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-bold text-[#f1e5ac] uppercase tracking-wide flex items-center gap-2">
                      <span>Teleparty.com Sign-In & Platform Portal</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </h5>
                    <span className="font-mono text-[9.5px] text-gray-400 block">
                      Multi-Platform Watch Party Stream Redirect (Netflix, HBO Max, Disney+, Hulu, YouTube)
                    </span>
                  </div>
                </div>

                {linkedAccounts.some((a) => a.service === "Teleparty" && a.connected) ? (
                  <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded font-bold">
                    Authorized ({linkedAccounts.find((a) => a.service === "Teleparty")?.username || "Teleparty User"})
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded font-bold">
                    Sign In Required
                  </span>
                )}
              </div>

              <p className="font-serif text-xs text-gray-300 leading-relaxed">
                Click below to open <span className="text-[#f1e5ac] font-bold underline">Teleparty.com</span> in a new browser window via web redirection. Once signed in on Teleparty, select any streaming platform (Netflix, HBO Max, Disney+, Hulu, YouTube, etc.) to launch synchronized watch parties with your soul connection!
              </p>

              <button
                onClick={() => handleAuthorizeProvider("Teleparty")}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-700 hover:from-amber-500 hover:to-purple-600 text-white font-serif text-xs uppercase font-bold tracking-wider rounded border border-[#d4af37]/60 transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
              >
                <ExternalLink className="w-4 h-4 text-amber-200" />
                <span>
                  {linkedAccounts.some((a) => a.service === "Teleparty" && a.connected)
                    ? "Re-Authorize & Open Teleparty.com Portal"
                    : "Sign In & Authorize with Teleparty.com"}
                </span>
              </button>
            </div>

            {/* MOVIE SELECTION & TELEPARTY ROOM CODE GENERATOR & LINK FORMATTER */}
            <div className="p-4 bg-black/70 border border-[#d4af37]/40 rounded-lg space-y-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4af37]/20 pb-2.5">
                <h5 className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider flex items-center space-x-1.5">
                  <Film className="w-4 h-4 text-[#d4af37]" />
                  <span>Teleparty Room Code Generator & Link Formatter</span>
                </h5>

                <button
                  onClick={handleGenerateTelepartyCode}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-serif text-[11px] font-bold uppercase tracking-wider rounded border border-amber-300 shadow transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>⚡ Generate Teleparty Room Code</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-serif text-[10px] text-gray-400 uppercase block mb-1">
                    Select Streaming Service Platform:
                  </label>
                  <select
                    value={watchMovieProvider}
                    onChange={(e) => setWatchMovieProvider(e.target.value as any)}
                    className="w-full bg-black/80 border border-[#d4af37]/40 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="Teleparty Stream">Teleparty (Netflix / HBO Max / Disney+ / Hulu)</option>
                    <option value="Teleparty Link">Teleparty Party Link</option>
                    <option value="Custom Stream">Custom Stream Link</option>
                  </select>
                </div>

                <div>
                  <label className="font-serif text-[10px] text-gray-400 uppercase block mb-1">
                    Movie or Series Title:
                  </label>
                  <input
                    type="text"
                    value={watchMovieTitle}
                    onChange={(e) => setWatchMovieTitle(e.target.value)}
                    placeholder="e.g. Stranger Things, Dune, House of the Dragon..."
                    className="w-full bg-black/80 border border-[#d4af37]/40 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Input for Teleparty Link / Room Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-serif text-[10px] text-gray-400 uppercase block">
                    Teleparty Party Link or Room Code:
                  </label>
                  {watchMovieUrl.trim() && (
                    <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Valid Teleparty Party URL</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={watchMovieUrl}
                    onChange={(e) => setWatchMovieUrl(e.target.value)}
                    placeholder="Paste Teleparty party link or room code (e.g. tp-coven-a8f2e9 or https://www.teleparty.com/party/...)"
                    className="flex-1 bg-black/80 border border-[#d4af37]/40 focus:border-[#d4af37] text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none placeholder:text-gray-600"
                  />
                  <button
                    onClick={() => handleCopyTelepartyLink(watchMovieUrl, "Teleparty Party Link")}
                    className="px-3 py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/40 text-[#f1e5ac] border border-[#d4af37]/60 text-xs font-serif uppercase font-bold rounded transition-all cursor-pointer flex items-center space-x-1 shrink-0"
                    title="1-Click Copy Teleparty Link"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Copy</span>
                  </button>
                </div>

                {/* Formatted Preview Badge */}
                {watchMovieUrl.trim() && (
                  <div className="p-2.5 bg-black/90 border border-emerald-500/40 rounded flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-300">
                    <div className="flex items-center space-x-2 truncate">
                      <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Formatted: {formatTelepartyUrl(watchMovieUrl)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-200 border border-emerald-500/50 rounded font-bold">
                        Code: {extractRoomCode(watchMovieUrl) || "Custom"}
                      </span>

                      <button
                        onClick={() => handleCopyTelepartyLink(extractRoomCode(watchMovieUrl), "Room Code")}
                        className="text-[10px] text-amber-300 hover:underline font-serif font-bold uppercase cursor-pointer"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sharing Controls Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#d4af37]/20">
                <button
                  onClick={() => {
                    const formatted = formatTelepartyUrl(watchMovieUrl);
                    if (!formatted) {
                      showToast("Please enter or generate a valid Teleparty link first!", "error");
                      return;
                    }

                    if (!selectedChatSoul) {
                      if (connectedSouls.length > 0) {
                        setSelectedChatSoul(connectedSouls[0]);
                      } else {
                        showToast("Please initiate a soul bond in the Summon tab to chat and share watch links!", "info");
                        return;
                      }
                    }

                    const formattedMsg = `🎬 Watch Party Link for ${watchMovieTitle.trim() || watchMovieProvider}: ${formatted}`;
                    setInputMessage(formattedMsg);
                    setActiveView("chats");
                    showToast("Watch link loaded into chat! Press Send to share with your watch partner.", "success");
                  }}
                  className="flex-1 py-2 px-3 bg-[#d4af37] hover:bg-[#e2bd44] text-black font-serif text-xs uppercase font-bold rounded transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Active Chat</span>
                </button>

                <button
                  onClick={handleBroadcastTelepartyToBand}
                  className="flex-1 py-2 px-3 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/60 font-serif text-xs uppercase font-bold rounded transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow active:scale-95"
                  title="Share Watch Party Link with all 10 Band members"
                >
                  <Users className="w-3.5 h-3.5 text-purple-300" />
                  <span>Broadcast to All Bonded Souls</span>
                </button>

                <button
                  onClick={() => {
                    const formatted = formatTelepartyUrl(watchMovieUrl);
                    if (!formatted) {
                      showToast("Please enter a movie URL or generate a room code to open!", "error");
                      return;
                    }
                    window.open(formatted, "_blank");
                  }}
                  className="py-2 px-4 bg-white/10 hover:bg-white/20 text-[#f1e5ac] border border-white/20 font-serif text-xs uppercase font-bold rounded transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Open Stream Window</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FACETIME / VIDEO CALL SCRYING MIRROR MODAL */}
      <AnimatePresence>
        {isVideoCallActive && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#14100d] border border-[#d4af37] rounded-lg w-full max-w-2xl p-4 shadow-[0_0_50px_rgba(212,175,55,0.3)] space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  <h3 className="font-serif text-sm font-bold text-[#f1e5ac] uppercase tracking-wider">
                    Scrying FaceTime Call • {selectedChatSoul?.name || "Band Coven"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsVideoCallActive(false)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* VIDEO FEEDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 aspect-video bg-black rounded border border-white/10 relative overflow-hidden p-2">
                {/* Local User Stream */}
                <div className="relative rounded bg-gray-900 border border-purple-500/30 overflow-hidden flex items-center justify-center">
                  {!isCamOff ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        videoFilter === "soul-fire"
                          ? "sepia contrast-125 saturate-200 hue-rotate-15"
                          : videoFilter === "gothic-sepia"
                          ? "sepia contrast-150 grayscale-25"
                          : videoFilter === "amber-glow"
                          ? "sepia contrast-110 saturate-150"
                          : ""
                      }`}
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-1 text-gray-500">
                      <VideoOff className="w-8 h-8" />
                      <span className="font-serif text-xs">Camera Off</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 font-mono text-[9px] bg-black/70 px-2 py-0.5 rounded text-[#f1e5ac]">
                    You (Elder Seer)
                  </span>
                </div>

                {/* Remote Matched Soul Stream / Scrying Simulation */}
                <div className="relative rounded bg-[#181310] border border-[#d4af37]/30 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#282018] border border-[#d4af37] flex items-center justify-center font-serif text-xl font-bold text-[#d4af37] mb-2 animate-pulse">
                    {selectedChatSoul?.name.charAt(0) || "C"}
                  </div>
                  <h5 className="font-serif text-xs font-bold text-[#f1e5ac]">
                    {selectedChatSoul?.name || "Coven Souls"}
                  </h5>
                  <span className="font-serif text-[10px] text-[#c5b396] italic">
                    Connected via Mystic Scrying Mirror
                  </span>
                  <div className="mt-2 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-[8.5px] text-emerald-400">Audio/Video Active</span>
                  </div>
                </div>
              </div>

              {/* VIDEO CALL CONTROLS */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      isMicMuted ? "bg-red-900 text-white border-red-500" : "bg-white/10 text-gray-300 border-white/20"
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsCamOff(!isCamOff)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      isCamOff ? "bg-red-900 text-white border-red-500" : "bg-white/10 text-gray-300 border-white/20"
                    }`}
                  >
                    {isCamOff ? <VideoOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  </button>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center space-x-1 text-[9.5px] font-mono text-gray-400">
                  <span>Filter:</span>
                  {(["none", "soul-fire", "gothic-sepia", "amber-glow"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setVideoFilter(f)}
                      className={`px-2 py-0.5 rounded border capitalize cursor-pointer ${
                        videoFilter === f ? "bg-[#d4af37]/30 border-[#d4af37] text-[#f1e5ac]" : "bg-black/40 border-white/10"
                      }`}
                    >
                      {f.replace("-", " ")}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsVideoCallActive(false)}
                  className="px-4 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-600 rounded text-xs font-serif uppercase tracking-wider font-bold cursor-pointer"
                >
                  End Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STREAMING ACCOUNTS LINKING MODAL */}
      <AnimatePresence>
        {showStreamingModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181310] border border-[#d4af37] rounded-lg w-full max-w-lg p-5 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                <div className="flex items-center space-x-2">
                  <Tv className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="font-serif text-sm font-bold text-[#f1e5ac] uppercase tracking-wider">
                    Teleparty.com Sign-In & Authorization
                  </h3>
                </div>
                <button
                  onClick={() => setShowStreamingModal(false)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-[#120e0b] border border-[#d4af37]/30 rounded text-xs text-[#c5b396] space-y-1 font-serif">
                <p className="font-bold text-[#f1e5ac] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Teleparty.com Web Redirection & Platform Selection</span>
                </p>
                <p className="text-[11px] leading-relaxed text-gray-300">
                  Click below to open Teleparty.com in a new browser window via web redirection. Once signed in on Teleparty, select any supported streaming platform (Netflix, HBO Max, Disney+, Hulu, YouTube) to watch together!
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {/* TELEPARTY AUTHORIZATION CARD */}
                {(() => {
                  const tpAcc = linkedAccounts.find((a) => a.service === "Teleparty") || { service: "Teleparty", connected: false };
                  const tpVal = accountHandleInputs["Teleparty"] ?? (tpAcc.username || "");
                  return (
                    <div className="p-4 bg-gradient-to-br from-amber-950/80 via-black to-black border-2 border-[#d4af37]/60 rounded-xl space-y-3 shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-500 to-rose-600 text-white font-black text-xs flex items-center justify-center tracking-tighter shadow-md">
                            TP
                          </div>
                          <div>
                            <h5 className="font-serif text-sm font-bold text-[#f1e5ac] uppercase tracking-wide">
                              Teleparty.com Authorization
                            </h5>
                            <span className="font-mono text-[9px] text-amber-300/80 block">
                              Multi-Service Stream Portal • Teleparty.com
                            </span>
                          </div>
                        </div>

                        <span className={`font-mono text-[9.5px] font-bold px-2 py-0.5 rounded border ${
                          tpAcc.connected
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/60"
                            : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                        }`}>
                          {tpAcc.connected ? `Authorized (${tpAcc.username})` : "Not Authorized"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-serif text-amber-200/90 font-bold uppercase">
                          Teleparty Account Email / Handle:
                        </label>
                        <input
                          type="text"
                          placeholder="Thy Teleparty account email or handle..."
                          value={tpVal}
                          onChange={(e) => setAccountHandleInputs({ ...accountHandleInputs, Teleparty: e.target.value })}
                          className="w-full px-3 py-1.5 bg-black/90 border border-amber-800/60 focus:border-amber-500 rounded text-xs text-amber-100 placeholder-amber-900/60 outline-none font-mono"
                        />
                      </div>

                      <button
                        onClick={() => handleAuthorizeProvider("Teleparty")}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-serif text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-400 shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-98"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Sign In & Authorize with Teleparty.com</span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={() => setShowStreamingModal(false)}
                className="w-full py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#f1e5ac] border border-[#d4af37]/60 text-xs font-serif uppercase font-bold tracking-wider rounded cursor-pointer font-bold"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PUBLISH / EDIT MY NECROMANTIC SOUL PROFILE MODAL (NIGROMANCY FORM) */}
      <AnimatePresence>
        {showMyProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#100c0a] border-2 border-emerald-900/80 rounded-xl w-full max-w-4xl p-5 shadow-[0_0_50px_rgba(16,185,129,0.2)] space-y-4 max-h-[92vh] overflow-y-auto relative"
            >
              {/* TOP DECORATIVE HEADER */}
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/80 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                    <Skull className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-emerald-200 uppercase tracking-widest flex items-center gap-2">
                      <span>GRIMOIRE OF NIGROMANCY • SOUL BINDING</span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </h3>
                    <p className="font-mono text-[10px] text-gray-400">
                      Inscribe thy avatar, arcane title, dark fantasy bio, and eldritch interests to enter the 2-day algorithmic selection process pairing thee with 4 matched souls every two days.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowMyProfileModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FOUNDER'S BADGE ACKNOWLEDGMENT BANNER */}
              {(user?.email?.toLowerCase() === "hawkpercival@asphodelpress.org" || myProfileName.toLowerCase().includes("hawk percival")) && (
                <div className="p-3 bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-amber-950/90 border-2 border-amber-400/80 rounded-lg flex items-center space-x-3 text-xs text-amber-200 font-serif shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <Crown className="w-6 h-6 text-amber-300 shrink-0 animate-pulse" />
                  <div>
                    <strong className="text-amber-300 font-bold uppercase tracking-wider block text-[11px]">
                      The Founder's Badge Active
                    </strong>
                    <span className="text-[10px] text-amber-100/90 font-mono block">
                      Acknowledged: Hawk Percival — Founder of ASCORP & Creator of this app. Thy profile is badged across all candidate pairings, chat rooms, and Coven listings.
                    </span>
                  </div>
                </div>
              )}

              {/* SYSTEM ALERT: PUBLISHED CONFIRMATION */}
              {isMyProfilePublished && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-500/70 rounded-lg flex items-center justify-between text-xs text-emerald-200 font-serif shadow-md">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold block uppercase tracking-wider text-[11px] text-emerald-300">
                        System Alert: Profile Filed in System Ledger
                      </span>
                      <span className="text-[10px] text-emerald-200/90 font-mono block">
                        Filed, noted & logged in Coven Directory. Your profile is actively part of the 2-day algorithmic selection process.
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-900 border border-emerald-400 text-[9px] font-mono rounded text-emerald-100 uppercase shrink-0">
                    Filed & Active
                  </span>
                </div>
              )}

              {/* GRID LAYOUT: FORM INPUTS (LEFT) & LIVE MATCH CARD PREVIEW (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* FORM FIELDS (COL-SPAN-7) */}
                <div className="lg:col-span-7 space-y-4 text-xs font-serif pr-1">
                  
                  {/* 1. NECROMANTIC AVATAR SYMBOL SELECTION */}
                  <div className="space-y-1.5 bg-black/60 p-3 rounded-lg border border-emerald-500/30">
                    <label className="block text-emerald-200 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                      <span>Select Necromantic Avatar Symbol:</span>
                      <span className="font-mono text-[9.5px] text-emerald-400 font-normal">
                        Active: {myProfileAvatarIcon}
                      </span>
                    </label>
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {NECROMANTIC_AVATARS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            sfx.playShuffleTick(0, 1.3);
                            setMyProfileAvatarIcon(item.icon);
                          }}
                          title={item.label}
                          className={`p-2 rounded-md border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            myProfileAvatarIcon === item.icon
                              ? "bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105"
                              : "bg-black/80 border-white/10 hover:border-emerald-500/50 text-gray-400 hover:text-white"
                          }`}
                        >
                          <span className="text-xl block mb-0.5">{item.icon}</span>
                          <span className="text-[8px] font-mono text-center truncate w-full block">
                            {item.label.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. SOUL NAME & NECROMANTIC TITLE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[#f1e5ac] font-bold">
                        Soul / Seer Name
                      </label>
                      <input
                        type="text"
                        value={myProfileName}
                        onChange={(e) => setMyProfileName(e.target.value)}
                        placeholder="e.g. Arch-Lich Malakor or Thy Name..."
                        className="w-full p-2 bg-black/80 border border-emerald-500/40 rounded text-white focus:border-emerald-400 outline-none font-serif text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[#f1e5ac] font-bold">
                        Arcane Title
                      </label>
                      <input
                        type="text"
                        value={myProfileTitle}
                        onChange={(e) => setMyProfileTitle(e.target.value)}
                        placeholder="e.g. Sovereign of Reanimated Souls..."
                        className="w-full p-2 bg-black/80 border border-emerald-500/40 rounded text-white focus:border-emerald-400 outline-none font-serif text-xs"
                      />
                    </div>
                  </div>

                  {/* PRESET TITLE CHIPS */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono block">
                      Quick Necromantic Title Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_NECRO_TITLES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            sfx.playShuffleTick(0, 1.2);
                            setMyProfileTitle(t);
                          }}
                          className={`px-2 py-0.5 rounded border text-[9.5px] font-serif transition-all cursor-pointer ${
                            myProfileTitle === t
                              ? "bg-purple-950 border-purple-400 text-purple-200"
                              : "bg-black/50 border-white/10 hover:border-purple-500/40 text-gray-400 hover:text-white"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. ELDRITCH INTERESTS & DARK FANTASY LORE TAGS */}
                  <div className="space-y-1.5 bg-black/60 p-3 rounded-lg border border-purple-500/30">
                    <label className="block text-purple-200 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                      <span>Eldritch Interests & Dark Fantasy Lore ({myProfileInterests.length} Selected):</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {NECROMANTIC_INTERESTS_LIST.map((interest) => {
                        const isSelected = myProfileInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleMyInterest(interest)}
                            className={`px-2.5 py-1 rounded-full border text-[10px] font-serif transition-all cursor-pointer flex items-center space-x-1 ${
                              isSelected
                                ? "bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)] font-bold"
                                : "bg-black/70 border-white/10 hover:border-purple-500/40 text-gray-400"
                            }`}
                          >
                            <span>{isSelected ? "✨" : "➕"}</span>
                            <span>{interest}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. DARK FANTASY BIO & BACKSTORY */}
                  <div className="space-y-1">
                    <label className="block text-[#f1e5ac] font-bold flex items-center justify-between">
                      <span>Dark Bio & Reanimation Backstory</span>
                      <span className="font-mono text-[9px] text-gray-500">{myProfileBio.length} chars</span>
                    </label>
                    <textarea
                      rows={3}
                      value={myProfileBio}
                      onChange={(e) => setMyProfileBio(e.target.value)}
                      placeholder="Record thy dark lore, midnight watch rituals, and spirit summonings..."
                      className="w-full p-2.5 bg-black/80 border border-emerald-500/40 rounded text-white focus:border-emerald-400 outline-none font-serif text-xs leading-relaxed"
                    />
                  </div>

                  {/* 5. FAVORITE GENRE & AURA SIGIL COLOR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[#f1e5ac] font-bold">
                        Cinematic Affinity
                      </label>
                      <select
                        value={myProfileGenre}
                        onChange={(e) => setMyProfileGenre(e.target.value)}
                        className="w-full p-2 bg-black/80 border border-emerald-500/40 rounded text-white focus:border-emerald-400 outline-none font-serif text-xs"
                      >
                        <option value="Gothic Horror & Dark Fantasy">Gothic Horror & Dark Fantasy</option>
                        <option value="Dark Sci-Fi & Psychological Thrillers">Dark Sci-Fi & Psychological Thrillers</option>
                        <option value="Cult Classics & Dark Comedy">Cult Classics & Dark Comedy</option>
                        <option value="Epic Medieval Fantasy & Historical Epics">Epic Medieval Fantasy & Historical Epics</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[#f1e5ac] font-bold">
                        Sigil Aura Color
                      </label>
                      <select
                        value={myProfileSigil}
                        onChange={(e) => setMyProfileSigil(e.target.value)}
                        className="w-full p-2 bg-black/80 border border-emerald-500/40 rounded text-white focus:border-emerald-400 outline-none font-serif text-xs"
                      >
                        <option value="bg-purple-950/80 border-purple-500 text-purple-300">Purple Void Arcana</option>
                        <option value="bg-emerald-950/80 border-emerald-500 text-emerald-300">Emerald Serpent Flame</option>
                        <option value="bg-cyan-950/80 border-cyan-500 text-cyan-300">Cyan Scrying Tide</option>
                        <option value="bg-amber-950/80 border-amber-500 text-amber-300">Amber Eclipse</option>
                        <option value="bg-rose-950/80 border-rose-500 text-rose-300">Blood Ruby Crucible</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: LIVE MATCH CARD PREVIEW (COL-SPAN-5) */}
                <div className="lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l border-emerald-500/30 pt-4 lg:pt-0 lg:pl-4">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-serif text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Live AI Selection Card Preview</span>
                  </div>
                  <p className="font-mono text-[9.5px] text-gray-400 leading-tight">
                    This is exactly how thy necromantic soul card will appear to other Coven members during daily AI selection:
                  </p>

                  {/* PREVIEW CARD DISPLAY */}
                  <div className={`p-4 rounded-xl border transition-all relative overflow-hidden bg-[#181310] space-y-3 shadow-xl ${myProfileSigil}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-black/80 border border-white/20 flex flex-col items-center justify-center shadow-lg shrink-0">
                          <span className="text-xl block leading-none">{myProfileAvatarIcon}</span>
                          <span className="text-[8px] font-mono text-gray-400 mt-0.5 uppercase">{myProfileName.charAt(0) || "S"}</span>
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-bold text-[#f1e5ac] flex flex-wrap items-center gap-1.5">
                            <span>{myProfileName || "Thy Soul Name"}</span>
                            {(user?.email?.toLowerCase() === "hawkpercival@asphodelpress.org" || myProfileName.toLowerCase().includes("hawk percival")) && (
                              <FoundersBadge size="sm" />
                            )}
                            <span className="text-[8px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded">
                              Public
                            </span>
                          </h4>
                          <span className="font-serif text-[10px] text-[#c5b396] italic block">
                            {myProfileTitle || "Arcane Title"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-[#d4af37] block">99%</span>
                        <span className="font-mono text-[7.5px] text-gray-400 uppercase tracking-widest block">Resonance</span>
                      </div>
                    </div>

                    <p className="font-serif text-xs text-[#eaddca] leading-relaxed bg-black/60 p-2.5 rounded border border-white/10 italic">
                      "{myProfileBio || "Thy dark fantasy bio and reanimation backstory..."}"
                    </p>

                    {/* INTERESTS TAGS IN PREVIEW */}
                    {myProfileInterests.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-mono text-[8.5px] text-gray-400 uppercase tracking-wider block">
                          Eldritch Interests:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {myProfileInterests.map((interest) => (
                            <span
                              key={interest}
                              className="text-[9px] font-serif bg-purple-900/60 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] border-t border-white/10 pt-2 text-gray-300">
                      <span className="font-serif italic text-[#c5b396]">
                        Affinity: <strong className="text-white font-normal">{myProfileGenre}</strong>
                      </span>
                      <div className="flex items-center space-x-1">
                        {myProfileStreaming.map((acc) => (
                          <span key={acc} className="px-1.5 py-0.5 bg-black/80 border border-[#d4af37]/40 text-[#d4af37] font-mono text-[8px] rounded">
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-black/70 border border-emerald-500/20 rounded-lg text-[10px] font-mono text-gray-400 space-y-1">
                    <span className="text-emerald-300 font-bold block">⚡ Algorithmic Pool Integration:</span>
                    <p>Once published, thy soul profile enters the algorithmic selection pool, pairing thee with four matched users every two days (48 hours).</p>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER BUTTONS */}
              <div className="flex gap-3 pt-3 border-t border-emerald-500/30">
                <button
                  type="button"
                  onClick={() => setShowMyProfileModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-serif uppercase tracking-wider rounded-lg cursor-pointer transition-all"
                >
                  Discard Changes
                </button>

                <button
                  type="button"
                  onClick={handlePublishMyProfile}
                  className="flex-1 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-500 text-xs font-serif uppercase font-bold tracking-widest rounded-lg cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center space-x-2"
                >
                  <Skull className="w-4 h-4 text-emerald-300" />
                  <span>{isMyProfilePublished ? "Update & Confirm Filed Profile" : "Inscribe & File Soul Profile (2-Day Pool)"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD REAL CANDIDATE SOUL & AI SELECTION MODAL */}
      <AnimatePresence>
        {showAddCandidateModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181310] border border-emerald-500/80 rounded-xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-emerald-200 uppercase tracking-wider">
                      AI 2-Day Soul Match Selection
                    </h3>
                    <span className="font-mono text-[9.5px] text-[#c5b396] block">
                      4 Real User Pairings Selected by Coven AI Engine
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCandidateModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="font-serif text-xs text-[#c5b396] leading-relaxed bg-black/40 p-3 rounded-lg border border-emerald-500/20">
                ⚡ Real users paired by the AI algorithm based on shared horror/dark fantasy genres, streaming accounts, and eldritch interests. Every 48 hours, a fresh 4-soul pool is generated from real Coven directory members.
              </p>
              
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {aiSelectedDailySouls.length} Paired Soul Candidates Available
                  </span>
                  <button
                    onClick={() => {
                      sfx.playArcaneShimmer();
                      handlePerformAiSelection();
                    }}
                    className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 font-serif text-xs uppercase tracking-wider font-bold border border-emerald-500/60 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-all shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Re-Run AI Matching</span>
                  </button>
                </div>

                {aiSelectedDailySouls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {aiSelectedDailySouls.map((soul) => {
                      const matchDetails = computeMatchDetails(soul);
                      const isAdded = candidates.some((c) => c.id === soul.id);

                      return (
                        <div key={soul.id} className="p-3.5 bg-black/80 border border-emerald-500/40 hover:border-emerald-400/80 rounded-xl flex items-start space-x-3 transition-all shadow-lg relative group">
                          <div className={`w-12 h-12 rounded-lg shadow-md shrink-0 border border-emerald-500/50 flex items-center justify-center text-xl overflow-hidden ${soul.avatarSigil || 'bg-gray-800'}`}>
                            {soul.avatarImage ? (
                              <img src={soul.avatarImage} alt={soul.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{soul.necromanticAvatarIcon || "🔮"}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-serif text-xs font-bold text-[#f1e5ac] truncate flex items-center gap-1">
                                <span>{soul.name}</span>
                                {soul.isFounder && (
                                  <Crown className="w-3 h-3 text-amber-400 inline shrink-0" title="Founder Soul" />
                                )}
                              </h5>
                              <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 rounded-full font-bold shrink-0">
                                {matchDetails.score}% Match
                              </span>
                            </div>

                            <span className="font-mono text-[9px] text-[#c5b396] block truncate">
                              {soul.title || "Coven Seeker"}
                            </span>

                            <p className="font-sans text-[10px] text-gray-300 line-clamp-2 leading-relaxed">
                              {soul.bio || "Active soul in the Coven directory."}
                            </p>

                            {soul.interests && soul.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {soul.interests.slice(0, 3).map((interest) => (
                                  <span key={interest} className="text-[8.5px] font-mono bg-emerald-950/60 text-emerald-200 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddAiSelectedSoul(soul)}
                            disabled={isAdded}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md ${
                              isAdded
                                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-500 cursor-default"
                                : "bg-emerald-950 hover:bg-emerald-600 border-emerald-500/80 text-emerald-200 hover:text-white"
                            }`}
                            title={isAdded ? "Already added to candidates" : "Add Soul to Candidates"}
                          >
                            {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-xs font-serif uppercase tracking-wider border border-white/10 rounded-xl bg-black/40 space-y-2">
                    <p className="text-[#f1e5ac] font-bold">No registered Coven souls available yet.</p>
                    <p className="text-[11px] text-gray-400 lowercase font-sans">
                      Publish thy soul profile to automatically seed the selection pool!
                    </p>
                  </div>
                )}

                {aiSelectedDailySouls.length > 0 && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <button
                      onClick={handleAddAllAiSelectedSouls}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-900 to-emerald-700 hover:from-emerald-800 hover:to-emerald-600 text-white text-xs font-serif font-bold uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Add All {aiSelectedDailySouls.length} AI Matches to Candidate List</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* INVITE MEMBER BY EMAIL MODAL */}
        {showEmailInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181310] border border-amber-500/80 rounded-lg w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider">
                    Invite Member to Thy Band
                  </h3>
                </div>
                <button
                  onClick={() => setShowEmailInviteModal(false)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="font-serif text-xs text-[#c5b396] leading-relaxed">
                Send an invitation directly to thy friend's email address. Once they log in and accept, both of thy souls will be automatically bound into the 10-member Band!
              </p>

              <div className="space-y-3 text-xs font-serif">
                <div>
                  <label className="block text-[#f1e5ac] mb-1 font-bold">Friend's Email Address *</label>
                  <input
                    type="email"
                    value={inviteEmailInput}
                    onChange={(e) => setInviteEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendEmailInvite()}
                    placeholder="friend@domain.org"
                    className="w-full p-2.5 bg-black/80 border border-amber-500/40 rounded text-white focus:border-amber-400 outline-none placeholder-gray-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowEmailInviteModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-serif uppercase tracking-wider rounded cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendEmailInvite}
                  className="flex-1 py-2 bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-500 text-xs font-serif uppercase font-bold tracking-wider rounded cursor-pointer shadow-lg flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Invite</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* REAL-TIME MATCH NOTIFICATION CENTER DRAWER / MODAL */}
        {showNotifDrawer && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181310] border border-purple-500/80 rounded-lg w-full max-w-xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
                <div className="flex items-center space-x-2">
                  <BellRing className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="font-serif text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Real-Time Match Alerts & Observer Log
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* BROWSER PUSH NOTIFICATIONS STATUS BAR */}
              <div className="p-3 bg-black/70 border border-purple-500/30 rounded-lg flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-serif text-xs font-bold text-purple-200 block">
                      Desktop Push Notifications: {desktopNotifPermission === "granted" ? "ACTIVE ✅" : "DISABLED 🔔"}
                    </span>
                    <span className="font-mono text-[9.5px] text-gray-400">
                      Firestore observer triggers sound & push notifications on new matches
                    </span>
                  </div>
                </div>

                {desktopNotifPermission !== "granted" && (
                  <button
                    onClick={handleRequestDesktopPermission}
                    className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-[10px] font-serif uppercase tracking-wider text-purple-200 rounded cursor-pointer"
                  >
                    Enable Desktop Alerts
                  </button>
                )}
              </div>

              {/* ACTION TOOLBAR */}
              <div className="flex items-center justify-between text-xs font-serif text-[#c5b396] pt-1">
                <span>
                  Showing {notifications.length} match alert{notifications.length === 1 ? "" : "s"}
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifications}
                    className="text-[10px] text-red-400 hover:text-red-300 font-serif uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* NOTIFICATION LIST */}
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-serif text-xs space-y-2">
                  <Sparkles className="w-8 h-8 text-purple-900 mx-auto" />
                  <p>No match notifications recorded yet.</p>
                  <p className="text-[10px]">When thou connectest with a soul or someone accepts thy invitation, real-time alerts will appear here!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border transition-all ${
                        notif.read
                          ? "bg-black/40 border-purple-500/20 opacity-80"
                          : "bg-purple-950/40 border-purple-500/60 shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                          <h4 className="font-serif text-xs font-bold text-[#f1e5ac]">
                            {notif.soulName}
                          </h4>
                          <span className="text-[9px] font-mono px-2 py-0.2 bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-full">
                            {notif.matchScore}% Match
                          </span>
                        </div>

                        <span className="font-mono text-[9px] text-gray-400">{notif.timestamp}</span>
                      </div>

                      <p className="font-serif text-xs text-[#c5b396] mt-1">
                        {notif.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center justify-between">
                        {!notif.read ? (
                          <button
                            onClick={() => handleMarkNotifRead(notif.id)}
                            className="text-[9.5px] font-serif text-gray-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Mark as Read</span>
                          </button>
                        ) : (
                          <span className="text-[9.5px] font-serif text-gray-500 italic">Read</span>
                        )}

                        <button
                          onClick={() => {
                            const soul = candidates.find((c) => c.id === notif.soulId);
                            if (soul) setSelectedChatSoul(soul);
                            setActiveView("chats");
                            setShowNotifDrawer(false);
                            handleMarkNotifRead(notif.id);
                          }}
                          className="px-2.5 py-0.5 bg-purple-900 hover:bg-purple-800 border border-purple-400 text-purple-100 text-[10px] font-serif font-bold uppercase tracking-wider rounded cursor-pointer"
                        >
                          Chat with Soul
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING REAL-TIME MATCH CELEBRATION BANNER */}
      <AnimatePresence>
        {latestRealtimeMatch && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.95 }}
            className="fixed top-4 right-4 z-[999] max-w-md w-full bg-[#181310]/95 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-xl p-4 backdrop-blur-md overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-400 flex items-center justify-center font-serif text-lg font-bold text-purple-200 shrink-0 animate-bounce">
                  ✨
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500/50 text-[9px] font-mono font-bold rounded-full">
                      MATCHED ({latestRealtimeMatch.matchScore}% Resonance)
                    </span>
                    <span className="text-[9px] font-mono text-gray-400">{latestRealtimeMatch.timestamp}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#f1e5ac] mt-0.5">
                    {latestRealtimeMatch.soulName}
                  </h4>
                  <p className="font-serif text-xs text-[#c5b396] leading-tight">
                    {latestRealtimeMatch.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLatestRealtimeMatch(null)}
                className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-2 border-t border-purple-500/30 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNotifDrawer(true);
                  setLatestRealtimeMatch(null);
                }}
                className="px-2.5 py-1 bg-black/60 hover:bg-white/10 border border-purple-500/40 text-[10px] font-serif uppercase tracking-wider text-purple-200 rounded cursor-pointer"
              >
                View Notifications
              </button>
              <button
                onClick={() => {
                  const matchedSoul = candidates.find((c) => c.id === latestRealtimeMatch.soulId);
                  if (matchedSoul) {
                    setSelectedChatSoul(matchedSoul);
                    setActiveView("chats");
                  } else {
                    setActiveView("chats");
                  }
                  setLatestRealtimeMatch(null);
                }}
                className="px-3 py-1 bg-purple-900 hover:bg-purple-800 border border-purple-400 text-[10px] font-serif font-bold uppercase tracking-wider text-purple-100 rounded shadow-md cursor-pointer flex items-center space-x-1"
              >
                <MessageSquare className="w-3 h-3 text-purple-300" />
                <span>Chat Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCHEDULE BAND MOVIE NIGHT MODAL */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#14100d] border-2 border-[#d4af37] rounded-xl w-full max-w-lg p-5 shadow-[0_0_50px_rgba(212,175,55,0.3)] space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="font-serif text-base font-bold text-[#f1e5ac] uppercase tracking-wider">
                    Schedule Band Movie Night
                  </h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-serif text-xs text-gray-300 uppercase block mb-1 font-bold">
                    Movie or Series Title <span className="text-amber-400">*</span>:
                  </label>
                  <input
                    type="text"
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    placeholder="e.g. Nosferatu, House of the Dragon, Dracula..."
                    className="w-full bg-black/80 border border-[#d4af37]/50 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none focus:border-[#d4af37] placeholder:text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-serif text-xs text-gray-300 uppercase block mb-1 font-bold">
                      Teleparty Platform:
                    </label>
                    <select
                      value={schedPlatform}
                      onChange={(e) => setSchedPlatform(e.target.value)}
                      className="w-full bg-black/80 border border-[#d4af37]/50 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Teleparty Netflix">Teleparty Netflix</option>
                      <option value="Teleparty HBO Max">Teleparty HBO Max</option>
                      <option value="Teleparty Disney+">Teleparty Disney+</option>
                      <option value="Teleparty Hulu">Teleparty Hulu</option>
                      <option value="Teleparty Prime Video">Teleparty Prime Video</option>
                      <option value="Custom Stream Link">Custom Stream Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-serif text-xs text-gray-300 uppercase block mb-1 font-bold">
                      Scheduled Date:
                    </label>
                    <input
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full bg-black/80 border border-[#d4af37]/50 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-serif text-xs text-gray-300 uppercase block mb-1 font-bold">
                      Start Time:
                    </label>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full bg-black/80 border border-[#d4af37]/50 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="font-serif text-xs text-gray-300 uppercase block mb-1 font-bold">
                      Teleparty URL or Room Code (Optional):
                    </label>
                    <input
                      type="text"
                      value={schedUrl}
                      onChange={(e) => setSchedUrl(e.target.value)}
                      placeholder="e.g. tp-coven-a8f2e9 (Leave blank to auto-generate)"
                      className="w-full bg-black/80 border border-[#d4af37]/50 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none focus:border-[#d4af37] placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-serif text-xs text-gray-300 uppercase block mb-1 font-bold">
                    Watch Party Notes & Atmosphere:
                  </label>
                  <textarea
                    rows={2}
                    value={schedNotes}
                    onChange={(e) => setSchedNotes(e.target.value)}
                    placeholder="e.g. Bring your favorite midnight potion, snacks, and scrying candles..."
                    className="w-full bg-black/80 border border-[#d4af37]/50 text-xs font-serif text-[#f1e5ac] px-3 py-2 rounded focus:outline-none focus:border-[#d4af37] placeholder:text-gray-600 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-serif uppercase font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateMovieNight}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white border border-[#d4af37] text-xs font-serif uppercase font-bold rounded cursor-pointer shadow-lg"
                >
                  Confirm & Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
