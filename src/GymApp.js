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
  const d = new Date(dateStr);
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

// --- Componenti UI (RIPRISTINATI DAL TUO FILE ORIGINALE) ---

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
            <div style={{ flex: 1, background: "#222", padding: 8, borderRadius: 8, textAlign: "center" }}>
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

// --- Pagine ---

function Dashboard({ cliente, scheda, esercizi, primaryColor, onSelectDay }) {
  const workoutDays = useMemo(() => {
    return [...new Set(esercizi.filter(e => e.scheda_id === scheda.scheda_id).map(e => e.giorno))];
  }, [esercizi, scheda]);

  return (
    <div style={{ padding: "20px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900 }}>Ciao {cliente.nome.toUpperCase()}! 💪</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>Pronto per allenarti?</p>
      
      <div style={{ background: `linear-gradient(135deg, ${primaryColor}22, #111)`, border: `1px solid ${primaryColor}33`, borderRadius: 24, padding: 24, marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: primaryColor, fontWeight: 700, letterSpacing: 1 }}>SCHEDA ATTIVA</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{scheda.nome_scheda}</div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 8 }}>Scadenza: {formatDate(scheda.data_scadenza)}</div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>I TUOI GIORNI</h2>
      {workoutDays.map((d, i) => (
        <button key={i} onClick={() => onSelectDay(d)} style={{ width: "100%", background: "#1A1A1A", border: "1px solid #222", borderRadius: 16, padding: 20, marginBottom: 12, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
             <div style={{ fontWeight: 800 }}>{d}</div>
             <div style={{ fontSize: 12, color: "#555" }}>Inizia sessione</div>
          </div>
          <ChevronRight color={primaryColor} />
        </button>
      ))}
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPALE (L'APP VERA)
// ==========================================

export default function GymApp() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [loginForm, setLoginForm] = useState({ codice: "", pin: "" });
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sheets = ['config', 'clienti', 'schede', 'esercizi'];
      const res = {};
      for (const s of sheets) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${s}?key=${API_KEY}`;
        const r = await fetch(url);
        const j = await r.json();
        if (j.values) {
          const h = j.values[0];
          res[s] = j.values.slice(1).map(row => {
            const o = {}; h.forEach((key, i) => o[key] = row[i] || "");
            return o;
          });
        }
      }
      const config = {}; res.config.forEach(c => config[c.chiave] = c.valore);
      setData({ config, clienti: res.clienti, schede: res.schede, esercizi: res.esercizi });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{ background: "#000", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6B00", fontWeight: "bold" }}>CARICAMENTO GYMBOARD...</div>;

  const primaryColor = data.config.colore_primario || "#FF6B00";

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <h1 style={{ color: primaryColor, fontSize: 32, fontWeight: 900, fontStyle: 'italic' }}>GYMBOARD</h1>
        <p style={{ color: "#FFF", marginBottom: 40, fontWeight: 700 }}>{data.config.nome_palestra}</p>
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Codice Cliente" value={loginForm.codice} onChange={e => setLoginForm({...loginForm, codice: e.target.value.toUpperCase()})} style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, padding: 16, color: "#FFF" }} />
          <input placeholder="PIN" type="password" value={loginForm.pin} onChange={e => setLoginForm({...loginForm, pin: e.target.value})} style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, padding: 16, color: "#FFF" }} />
          <button onClick={() => {
            const found = data.clienti.find(c => c.codice.trim() === loginForm.codice.trim() && c.pin.trim() === loginForm.pin.trim());
            if (found) setUser(found); else alert("Dati errati!");
          }} style={{ background: primaryColor, border: "none", borderRadius: 12, padding: 18, color: "#FFF", fontWeight: 800 }}>ENTRA</button>
        </div>
      </div>
    );
  }

  const scheda = data.schede.find(s => s.scheda_id === user.scheda_attiva);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#FFF", paddingBottom: 100 }}>
      {timerSeconds && <RestTimer seconds={timerSeconds} onClose={() => setTimerSeconds(null)} primaryColor={primaryColor} />}
      {videoUrl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <button onClick={() => setVideoUrl(null)} style={{ position: "absolute", top: 20, right: 20, color: "#FFF", background: 'none', border: 'none' }}><X size={30} /></button>
           <iframe width="100%" height="300" src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`} frameBorder="0" allowFullScreen></iframe>
        </div>
      )}

      {selectedDay ? (
        <div style={{ padding: 20 }}>
          <button onClick={() => setSelectedDay(null)} style={{ background: "#222", border: "none", color: "#FFF", padding: 10, borderRadius: 10, marginBottom: 20 }}><ChevronLeft /></button>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>{selectedDay}</h2>
          {data.esercizi.filter(e => e.scheda_id === user.scheda_attiva && e.giorno === selectedDay).map((ex, i) => (
            <ExerciseCard key={i} ex={ex} primaryColor={primaryColor} onTimer={setTimerSeconds} onVideo={setVideoUrl} />
          ))}
        </div>
      ) : (
        activeTab === "home" ? <Dashboard cliente={user} scheda={scheda} esercizi={data.esercizi} primaryColor={primaryColor} onSelectDay={setSelectedDay} /> :
        <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Sezione {activeTab} in caricamento...</div>
      )}

      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} primaryColor={primaryColor} />
    </div>
  );
}
