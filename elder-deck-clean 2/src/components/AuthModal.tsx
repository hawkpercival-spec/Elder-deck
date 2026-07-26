import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  UserPlus, 
  X, 
  Compass, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signInWithGoogle,
  sendPasswordResetEmail
} from "../lib/firebase";
import { sfx } from "../utils/audio";

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const playTick = () => sfx.playShuffleTick(0, 1.1);
  const playFlip = () => sfx.playFlip();

  const handleToggleMode = () => {
    playFlip();
    setMode(prev => prev === "signin" ? "signup" : "signin");
    setError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const validateForm = () => {
    if (!email || !password) {
      setError("Thy credentials cannot be left blank.");
      return false;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Thy password confirmation does not align.");
      return false;
    }
    if (password.length < 6) {
      setError("Thy passcode must be at least six runes in length.");
      return false;
    }
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    playTick();

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        sfx.playMysticChime("Epic");
        onClose();
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        sfx.playMysticChime("Legendary");
        onClose();
      }
    } catch (err: any) {
      console.error("Authentication failed:", err);
      // Beautiful medieval error translations
      let msg = "The cosmos reject thy offering. Check thy details and try again.";
      if (err.code === "auth/operation-not-allowed") {
        msg = "Email and Password authentication is not currently enabled in the sanctuary settings.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "The heavens deny this soul-mark. Check thy email or passcode.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "This soul-mark is already claimed by another covenant.";
      } else if (err.code === "auth/invalid-email") {
        msg = "The scribes reject this email scroll format.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousAuth = async () => {
    setLoading(true);
    setError(null);
    playTick();
    try {
      await signInAnonymously(auth);
      sfx.playMysticChime("Rare");
      onClose();
    } catch (err: any) {
      console.error("Anonymous auth failed:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Anonymous sign-in is not currently enabled in the sanctuary settings.");
      } else {
        setError("The sanctuary gates are barred right now. Try again anon.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    playTick();
    try {
      await signInWithGoogle();
      sfx.playMysticChime("Epic");
      onClose();
    } catch (err: any) {
      console.error("Google auth failed:", err);
      setError(err.message || "Failed to align thy Google soul-connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter thy email address first to receive the reset scroll.");
      return;
    }
    setLoading(true);
    setError(null);
    playTick();
    try {
      await sendPasswordResetEmail(auth, email);
      sfx.playMysticChime("Common");
      setError("A cosmic reset scroll has been sent to thy email. Check thy parchment inbox.");
    } catch (err: any) {
      console.error("Password reset failed:", err);
      let msg = "The stars were unable to send thy reset scroll.";
      if (err.code === "auth/user-not-found") {
        msg = "No registered soul resides under this email mark.";
      } else if (err.code === "auth/invalid-email") {
        msg = "The scribes reject this email scroll format.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-skyrim-stone/95 border border-skyrim-gold/30 rounded-sm relative p-8 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.05)] text-center overflow-hidden"
        style={{ backgroundImage: "radial-gradient(circle at center, #261f18 0%, #0f0d0b 100%)" }}
      >
        {/* Decorative corner brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-skyrim-gold/40" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-skyrim-gold/40" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-skyrim-gold/40" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-skyrim-gold/40" />

        {/* Close Button */}
        <button 
          onClick={() => { playFlip(); onClose(); }}
          className="absolute top-4 right-4 text-gray-500 hover:text-skyrim-gold transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-skyrim-gold/5 border border-skyrim-gold/20 rounded-full mb-3 text-skyrim-gold animate-pulse">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-black tracking-[0.15em] text-[#f1e5ac] uppercase skyrim-text-shadow">
            {mode === "signin" ? "Connect Soul" : "Initiate Pact"}
          </h2>
          <p className="font-sans text-[10px] tracking-wider text-skyrim-gold-light/60 uppercase mt-1">
            {mode === "signin" ? "Enter the Prophetic Sanctuary" : "Forge a Permanent Covenant"}
          </p>
        </div>

        {/* Explain the benefits */}
        <p className="font-serif text-xs text-gray-400 italic leading-relaxed mb-6 px-2">
          "Connect thy soul to synchronize thy history of draws and saved Destiny Scrolls to the cloud covenant archives across all thy devices."
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-sm border border-red-500/20 bg-red-950/20 flex items-start space-x-2.5 text-left text-xs text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span className="font-sans leading-normal">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[10px] font-sans font-semibold text-skyrim-gold-light/75 uppercase tracking-widest">
              Thy Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="wanderer@skyrim.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-black/45 border border-skyrim-gold/15 hover:border-skyrim-gold/30 focus:border-skyrim-gold/60 p-2.5 pl-10 rounded-sm text-xs font-sans text-gray-200 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-sans font-semibold text-skyrim-gold-light/75 uppercase tracking-widest">
                Passcode Runes
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-[9px] font-sans text-skyrim-gold/50 hover:text-skyrim-gold transition-colors uppercase cursor-pointer underline bg-transparent border-0 outline-none p-0"
                >
                  Forgot passcode?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-black/45 border border-skyrim-gold/15 hover:border-skyrim-gold/30 focus:border-skyrim-gold/60 p-2.5 pl-10 rounded-sm text-xs font-sans text-gray-200 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === "signup" && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-[10px] font-sans font-semibold text-skyrim-gold-light/75 uppercase tracking-widest">
                Re-align Passcode
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-black/45 border border-skyrim-gold/15 hover:border-skyrim-gold/30 focus:border-skyrim-gold/60 p-2.5 pl-10 rounded-sm text-xs font-sans text-gray-200 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group relative py-3 mt-4 bg-skyrim-slate border border-skyrim-gold/40 text-skyrim-gold hover:text-white hover:border-skyrim-gold hover:bg-skyrim-gold/5 transition-all text-xs font-serif font-bold tracking-[0.2em] uppercase cursor-pointer flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="animate-pulse">Consulting the Stars...</span>
            ) : mode === "signin" ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Connect Soul</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Initiate Covenant</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-skyrim-gold/10" />
          </div>
          <span className="relative px-3 bg-[#110e0a] font-serif text-[9px] tracking-widest text-skyrim-gold/40 uppercase">
            OR
          </span>
        </div>

        <div className="space-y-3">
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 bg-skyrim-gold/10 border border-skyrim-gold/30 text-skyrim-gold hover:bg-skyrim-gold/20 hover:text-white transition-all text-[10px] font-sans font-semibold tracking-widest uppercase cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Connect with Google Account</span>
          </button>

          {/* Anonymous / Guest Sign-In */}
          <button
            onClick={handleAnonymousAuth}
            disabled={loading}
            className="w-full py-2.5 bg-black/40 border border-skyrim-gold/10 text-gray-400 hover:text-skyrim-gold-light hover:border-skyrim-gold/30 transition-all text-[10px] font-sans font-semibold tracking-widest uppercase cursor-pointer"
          >
            Enter as Nameless Wanderer
          </button>
        </div>

        {/* Mode switcher */}
        <div className="mt-6 text-center">
          <button
            onClick={handleToggleMode}
            disabled={loading}
            className="font-sans text-[10px] tracking-wider text-skyrim-gold/55 hover:text-skyrim-gold transition-colors cursor-pointer uppercase underline underline-offset-4"
          >
            {mode === "signin" 
              ? "Need a soul-mark? Create a permanent account" 
              : "Already have a soul-mark? Connect thy soul"
            }
          </button>
        </div>
      </div>
    </div>
  );
};
