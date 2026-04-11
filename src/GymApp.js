import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Home, BarChart3, ClipboardList, User, Play, Timer, ChevronRight, 
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info, Plus, Minus,
  RefreshCw, Wifi, WifiOff, LogOut, MapPin, Clock, Target,
  ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Zap,
  Video, AlertCircle
} from "lucide-react";

// ==========================================
// COLLEGAMENTO REALE A GOOGLE SHEETS
// ==========================================
const SHEET_ID = "1No3lEcFiI6nuLuAeMjmD5YFyfgp50mzJp4XSh1CcOxY";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";

// --- Utility (Copiate dal tuo file originale) ---
const daysUntil = (dateStr) => {
  if (!dateStr) return 0;
  const parts = dateStr.split("-");
  const d = parts.length === 3 ? new Date(parts[0], parts[1]-1, parts[2]) : new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

// --- Styles (Copiati dal tuo file originale) ---
const styles = {
  bg: "#0A0A0A",
  card: "#1A1A1A",
  cardBorder: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#666666",
};

// --- Componenti UI (TUTTI RIPRISTINATI DAL TUO FILE ORIGINALE) ---

function BottomNav({ activeTab, onNavigate, primaryColor }) {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "progress", icon: BarChart3, label: "Progressi" },
    { id: "history", icon: ClipboardList, label: "Storico" },
    { id: "profile", icon: User, label: "Profilo" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "#111111", borderTop: "1px solid #222",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "6px 0 env(safe-area-inset-bottom, 8px) 0",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    }}>
      {tabs.map(t => {
        const active = activeTab === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => onNavigate(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              color: active ? primaryColor : "#666", padding: "4px 12px",
              transition: "color 0.2s",
            }}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
            <span style={{ fontSize: "10px", fontWeight: active ? 700 : 400, letterSpacing: "0.5px" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function RestTimer({ seconds, onClose, primaryColor }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);
  const total = useRef(seconds);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  const progress = remaining / total.current;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px" }}>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#222" strokeWidth="8" />
          <circle cx="110" cy="110" r={radius} fill="none" stroke={remaining === 0 ? "#22c55e" : primaryColor}
            strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "48px", fontWeight: 800, color: "#FFF" }}>{Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
      <button onClick={onClose} style={{ background: primaryColor, border: "none", borderRadius: 12, color: "#FFF", padding: "12px 48px", fontWeight: 600 }}>Chiudi</button>
    </div>
  );
}

function ExerciseCard({ ex, primaryColor, onTimer, onVideo, progress, onLogWeight }) {
  const [expanded, setExpanded] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  return (
    <div style={{ background: styles.card, borderRadius: 16, border: `1px solid ${styles.cardBorder}`, marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", background: "none", border: "none", padding: "16px", display: "flex", alignItems: "center", gap: "12px", color: "#FFF", textAlign: "left" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Dumbbell size={20} color={primaryColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700 }}>{ex.esercizio}</div>
          <div style={{ fontSize: "13px", color: styles.textSecondary }}>{ex.serie} × {ex.ripetizioni} • {ex.peso_suggerito} kg</div>
        </div>
        <ChevronDown size={20} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, background: "#222", p: 2, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#666" }}>RIPOSO</div>
              <div style={{ fontWeight: 800 }}>{ex.riposo_sec}s</div>
            </div>
            {ex.video_url && (
               <button onClick={() => onVideo(ex.video_url)} style={{ flex: 1, background: "#333", border: "none", borderRadius: 8, color: "#FFF", fontWeight: 700, fontSize: 12 }}>VIDEO</button>
            )}
            <button onClick={() => onTimer(parseInt(ex.riposo_sec))} style={{ flex: 1, background: `${primaryColor}22`, border: "none", borderRadius: 8, color: primaryColor, fontWeight: 700, fontSize: 12 }}>TIMER</button>
          </div>
          <div style={{ background: "#222", borderRadius: 10, padding: 12, fontSize: 13, color: "#AAA" }}>
            <b>Note:</b> {ex.note || "Nessuna nota specifica."}
          </div>
        </div>
      )}
    </div>
  );
}

//
