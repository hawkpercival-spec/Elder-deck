import React, { useState } from "react";
import { 
  auth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "../lib/firebase";
import { User } from "firebase/auth";
import { Shield, Lock, Mail, Sparkles, UserCheck, LogOut, Check, Crown } from "lucide-react";

interface CovenantLedgerProps {
  user: User | null;
  loading: boolean;
}

export const CovenantLedger: React.FC<CovenantLedgerProps> = ({ user, loading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleAnonymousSignIn = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setError(e.message || "Failed to establish a quick covenant.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Pray, enter both thy email and passphrase.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      let friendlyError = e.message;
      if (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
        friendlyError = "The credentials match no registered souls. Verify thy credentials.";
      } else if (e.code === "auth/weak-password") {
        friendlyError = "Thy password must possess at least six characters of power.";
      } else if (e.code === "auth/email-already-in-use") {
        friendlyError = "This email is already bound to another parchment.";
      }
      setError(friendlyError);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    setActionLoading(true);
    try {
      await signOut(auth);
    } catch (e: any) {
      setError("Failed to break the covenant safely.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="covenant-ledger-loading" className="bg-skyrim-stone/80 rounded-lg p-5 border border-skyrim-gold/20 flex flex-col items-center justify-center py-8">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-skyrim-gold animate-spin mb-2" />
        <p className="font-serif text-xs text-skyrim-gold/70 uppercase tracking-widest animate-pulse">
          Reading the Celestial Ledger...
        </p>
      </div>
    );
  }

  return (
    <div id="covenant-ledger-root" className="w-full flex flex-col space-y-4">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center space-x-2 text-skyrim-gold-light border-b border-skyrim-gold/10 pb-2">
        <Shield className="w-4 h-4 text-skyrim-gold" />
        <span className="font-serif text-xs font-semibold tracking-wider uppercase">
          Ledger of Covenants
        </span>
      </div>

      {user ? (
        /* Signed In State */
        <div className="flex flex-col space-y-3.5">
          <div className="flex items-start space-x-3.5 bg-black/45 p-3.5 rounded border border-skyrim-gold/10">
            <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-full flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
                ✦ Covenant Active ✦
              </span>
              <p className="text-white text-xs font-mono truncate flex items-center gap-1.5 flex-wrap">
                <span>{user.isAnonymous ? "Anonymous Seeker" : user.email}</span>
                {user.email?.toLowerCase() === "hawkpercival@asphodelpress.org" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-950 via-purple-950 to-amber-950 border border-amber-400/80 rounded-full text-[9px] text-amber-200 font-serif font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                    <Crown className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>Founder's Badge</span>
                  </span>
                )}
              </p>
              <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                Thy card drawing history and mystical inquiries are written directly into the cloud. They shall persist for eternity.
              </p>
            </div>
          </div>

          <button
            id="btn-break-covenant"
            onClick={handleSignOut}
            disabled={actionLoading}
            className="w-full py-2 rounded bg-black/40 hover:bg-black/60 border border-skyrim-gold/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 font-serif text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>BREAK COVENANT (LOGOUT)</span>
          </button>
        </div>
      ) : (
        /* Signed Out State */
        <div className="flex flex-col space-y-3.5">
          <p className="text-gray-400 text-xs leading-relaxed">
            Record thy choices in the <span className="text-skyrim-gold font-bold">Cloud Ledger</span>. Your discovered cards and diaries will be preserved across all realms.
          </p>

          {error && (
            <div className="p-3 bg-red-950/25 border border-red-500/20 text-red-300 rounded text-xs leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          {!showAuthForm ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-quick-covenant"
                onClick={handleAnonymousSignIn}
                disabled={actionLoading}
                className="py-2.5 px-3 rounded bg-[#1a1612] hover:bg-[#251f19] text-skyrim-gold-light border border-skyrim-gold/20 hover:border-skyrim-gold/40 text-xs font-serif font-black tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>QUICK COVENANT</span>
              </button>

              <button
                id="btn-secure-covenant"
                onClick={() => setShowAuthForm(true)}
                disabled={actionLoading}
                className="py-2.5 px-3 rounded bg-gradient-to-r from-amber-950/40 to-amber-900/10 hover:from-amber-900/60 text-white border border-skyrim-gold/15 hover:border-skyrim-gold/35 text-xs font-serif font-black tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-skyrim-gold" />
                <span>SECURE NOM DE GUERRE</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-skyrim-gold/50">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Thy magical email address"
                    className="w-full bg-black/55 text-xs rounded border border-skyrim-gold/35 pl-9 pr-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-skyrim-gold"
                    required
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-skyrim-gold/50">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Thy secret passphrase"
                    className="w-full bg-black/55 text-xs rounded border border-skyrim-gold/35 pl-9 pr-3 py-2 text-white placeholder-gray-650 focus:outline-none focus:border-skyrim-gold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRegistering}
                    onChange={() => setIsRegistering(!isRegistering)}
                    className="accent-skyrim-gold cursor-pointer"
                  />
                  <span>New traveler? Create credentials</span>
                </label>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAuthForm(false)}
                  className="flex-1 py-2 rounded bg-black/30 border border-skyrim-gold/10 hover:border-skyrim-gold/20 text-gray-400 text-xs font-serif transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded bg-gradient-to-r from-amber-950 to-amber-900 text-skyrim-gold-light border border-skyrim-gold/30 text-xs font-serif font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  {actionLoading ? (
                    <div className="w-3 h-3 rounded-full border border-t-transparent border-skyrim-gold animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRegistering ? "CREATE ACCOUNT" : "SIGN IN"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
