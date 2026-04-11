import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Home, BarChart3, ClipboardList, User, Play, Timer, ChevronRight, 
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info, Plus, Minus,
  RefreshCw, Wifi, WifiOff, LogOut, MapPin, Clock, Target,
  ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Zap,
  Video, AlertCircle
} from "lucide-react";

// ==========================================
// CONFIGURAZIONE GOOGLE SHEETS
// ==========================================
const SHEET_ID = "1No3lEcFiI6nuLuAeMjmD5YFyfgp50mzJp4XSh1CcOxY";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";

// --- Utility ---
const daysUntil = (dateStr) => {
  if (!dateStr) return 0;
  const d = new Date(dateStr.split('/').reverse().join('-')); // Gestisce formato DD/MM/YYYY
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr) => dateStr || "";

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

// --- Styles (Dal tuo file originale) ---
const baseStyles = {
  bg: "#0A0A0A",
  card: "#1A1A1A",
  cardBorder: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#666666",
};

// --- Componenti UI (Tutti ripristinati esattamente come li avevi) ---
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
        setRemaining(r => r <= 1 ? (clearInterval(intervalRef.current), 0) : r - 1);
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
          <circle cx="110" cy="110" r={radius} fill="none" stroke={remaining === 0 ? "#22c55e" : primaryColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "48px", fontWeight: 800, color: "#FFF" }}>{Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
      <button onClick={onClose} style={{ background: primaryColor, border: "none", borderRadius: 12, color: "#FFF", padding: "12px 48px", fontWeight: 600 }}>Chiudi</button>
    </div>
  );
}

function ExerciseCard({ ex, primaryColor, onTimer, onVideo }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: baseStyles.card, borderRadius: 16, border: `1px solid ${baseStyles.cardBorder}`, marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", background: "none", border: "none", padding: "16px", display: "flex", alignItems: "center", gap: "12px", color: "#FFF", textAlign: "left" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Dumbbell size={20} color={primaryColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700 }}>{ex.esercizio}</div>
          <div style={{ fontSize: "13px", color: baseStyles.textSecondary }}>{ex.serie} × {ex.reps} • {ex.peso} kg</div>
        </div>
        <ChevronDown size={20} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ background: "#222", borderRadius: 10, padding: "12px", marginBottom: 10, fontSize: "13px" }}>
             <b>Note:</b> {ex.note || "Nessuna nota dal trainer"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onTimer(parseInt(ex.riposo))} style={{ flex: 1, background: `${primaryColor}22`, border: "none", borderRadius: 10, padding: "10px", color: primaryColor, fontWeight: 700 }}>Riposo {ex.riposo}s</button>
            {ex.video && <button onClick={() => onVideo(ex.video)} style={{ flex: 1, background: "#333", border: "none", borderRadius: 10, padding: "10px", color: "#FFF", fontWeight: 700 }}>Video</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// --- App Principale ---
export default function GymApp() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [loginForm, setLoginForm] = useState({ codice: "", pin: "" });
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  // FETCH DATI REALI
  const loadData = async () => {
    setLoading(true);
    try {
      const sheets = ['config', 'clienti', 'schede', 'esercizi'];
      const results = {};
      for (const s of sheets) {
        const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${s}?key=${API_KEY}`);
        const json = await resp.json();
        const headers = json.values[0];
        results[s] = json.values.slice(1).map(row => {
          const obj = {}; headers.forEach((h, i) => obj[h] = row[i] || "");
          return obj;
        });
      }
      const config = {}; results.config.forEach(c => config[c.chiave] = c.valore);
      setData({ config, clienti: results.clienti, schede: results.schede, esercizi: results.esercizi });
    } catch (e) { console.error("Errore Sheet:", e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div style={{ background: "#000", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6B00", fontWeight: "bold" }}>CARICAMENTO...</div>;

  const primaryColor = data?.config?.colore_primario || "#FF6B00";

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Dumbbell size={40} color={primaryColor} />
        </div>
        <h1 style={{ color: "#FFF", fontSize: 28, fontWeight: 900 }}>{data.config.nome_palestra}</h1>
        <p style={{ color: "#666", marginBottom: 40 }}>{data.config.slogan}</p>
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Codice Cliente" value={loginForm.codice} onChange={e => setLoginForm({...loginForm, codice: e.target.value.toUpperCase()})} style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, padding: 16, color: "#FFF" }} />
          <input placeholder="PIN" type="password" value={loginForm.pin} onChange={e => setLoginForm({...loginForm, pin: e.target.value})} style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, padding: 16, color: "#FFF" }} />
          <button onClick={() => {
            const found = data.clienti.find(c => c.codice === loginForm.codice && c.pin === loginForm.pin);
            if (found) setUser(found); else alert("Dati errati");
          }} style={{ background: primaryColor, border: "none", borderRadius: 12, padding: 18, color: "#FFF", fontWeight: 800, fontSize: 16, marginTop: 10 }}>ACCEDI</button>
        </div>
      </div>
    );
  }

  // LOGICA SCHEDA UTENTE
  const scheda = data.schede.find(s => s.id_scheda === user.id_scheda_attiva);
  const workoutDays = [...new Set(data.esercizi.filter(e => e.id_scheda === user.id_scheda_attiva).map(e => e.giorno))];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#FFF", padding: "20px 16px 100px" }}>
      {timerSeconds && <RestTimer seconds={timerSeconds} onClose={() => setTimerSeconds(null)} primaryColor={primaryColor} />}
      {videoUrl && <VideoModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />}

      {selectedDay ? (
        <div>
          <button onClick={() => setSelectedDay(null)} style={{ background: "#222", border: "none", color: "#FFF", padding: 10, borderRadius: 10, marginBottom: 20 }}><ChevronLeft /></button>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>{selectedDay}</h2>
          {data.esercizi.filter(e => e.id_scheda === user.id_scheda_attiva && e.giorno === selectedDay).map((ex, i) => (
            <ExerciseCard key={i} ex={ex} primaryColor={primaryColor} onTimer={setTimerSeconds} onVideo={setVideoUrl} />
          ))}
        </div>
      ) : activeTab === "home" ? (
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Ciao {user.nome}! 💪</h1>
          <p style={{ color: "#A0A0A0", marginBottom: 24 }}>Pronto per la {data.config.nome_palestra}?</p>
          <div style={{ background: `${primaryColor}15`, border: `1px solid ${primaryColor}33`, borderRadius: 20, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: primaryColor, fontWeight: 700, letterSpacing: 1 }}>SCHEDA ATTIVA</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{scheda?.nome_scheda}</div>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginTop: 4 }}>Scade il: {user.scadenza} ({daysUntil(user.scadenza)}g)</div>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>ALLENAMENTI</h2>
          {workoutDays.map(d => (
            <button key={d} onClick={() => setSelectedDay(d)} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 14, padding: 20, marginBottom: 10, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700 }}>{d}</span>
              <ChevronRight color={primaryColor} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", paddingTop: 100, color: "#666" }}>
           Questa sezione (Progressi/Storico) è in fase di caricamento...
        </div>
      )}

      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} primaryColor={primaryColor} />
    </div>
  );
}

function VideoModal({ videoUrl, onClose }) {
  const id = getYouTubeId(videoUrl);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, color: "#FFF", background: "none", border: "none" }}><X size={30}/></button>
      <iframe width="100%" height="300" src={`https://www.youtube.com/embed/${id}`} frameBorder="0" allowFullScreen></iframe>
    </div>
  );
}
