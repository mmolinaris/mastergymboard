import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Home, BarChart3, ClipboardList, User, Play, Timer, ChevronRight,
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info, Plus, Minus,
  RefreshCw, Wifi, WifiOff, LogOut, MapPin, Clock, Target,
  ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Zap,
  Video, AlertCircle
} from "lucide-react";

// ============================================
// COLLEGAMENTO GOOGLE SHEETS
// ============================================
const SHEET_ID = "1No3lEcFiI6nuLuAeMjmD5YFyfgp50mzJp4XSh1CcOxY";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";

// ============================================
// DATI DEMO — (Usati come emergenza se Sheets fallisce)
// ============================================
const DEMO_CONFIG = {
  nome_palestra: "Master Gym",
  colore_primario: "#FF6B00",
  colore_sfondo: "#0A0A0A",
  logo_url: "",
  slogan: "Train Hard, Stay Strong",
  telefono: "02-12345678",
  indirizzo: "Via Roma 1, Milano",
  instagram: "@mastergym_mi",
};

const DEMO_CLIENTI = [
  { codice: "MG-001", nome: "Marco", cognome: "Rossi", email: "marco@email.com", telefono: "3331234567", data_iscrizione: "2026-04-01", scheda_attiva: "SCHEDA-001", schede_passate: "", pin: "1234" },
  { codice: "MG-002", nome: "Laura", cognome: "Bianchi", email: "laura@email.com", telefono: "3339876543", data_iscrizione: "2026-03-15", scheda_attiva: "SCHEDA-002", schede_passate: "SCHEDA-004", pin: "5678" },
  { codice: "MG-003", nome: "Andrea", cognome: "Verdi", email: "andrea@email.com", telefono: "3335551234", data_iscrizione: "2026-02-10", scheda_attiva: "SCHEDA-003", schede_passate: "SCHEDA-005", pin: "9012" },
];

const DEMO_SCHEDE = [
  { scheda_id: "SCHEDA-001", nome_scheda: "Massa Principiante", obiettivo: "Ipertrofia", data_creazione: "2026-04-01", data_scadenza: "2026-05-01", note_trainer: "Aumentare pesi ogni 2 settimane" },
  { scheda_id: "SCHEDA-002", nome_scheda: "Tonificazione Total Body", obiettivo: "Definizione", data_creazione: "2026-03-15", data_scadenza: "2026-04-30", note_trainer: "Focus su tecnica, no carichi pesanti" },
  { scheda_id: "SCHEDA-003", nome_scheda: "Forza Base", obiettivo: "Forza", data_creazione: "2026-02-10", data_scadenza: "2026-04-15", note_trainer: "Riposi lunghi tra le serie, concentrarsi sulla forma" },
];

const DEMO_ESERCIZI = [
  { scheda_id:"SCHEDA-001",giorno:"Giorno 1 - Petto e Tricipiti",ordine:1,gruppo_muscolare:"Petto",esercizio:"Panca piana bilanciere",serie:4,ripetizioni:"8-10",peso_suggerito:"60",riposo_sec:90,note:"Scendere fino al petto controllando il movimento",video_url:"https://www.youtube.com/watch?v=rT7DgCr-3pg",tecnica:"Presa media, scapole addotte e depresse, piedi ben piantati" },
];

// --- Utility ---
const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

// --- Styles ---
const styles = {
  get bg() { return DEMO_CONFIG.colore_sfondo || "#0A0A0A"; },
  get primary() { return DEMO_CONFIG.colore_primario || "#FF6B00"; },
  card: "#1A1A1A",
  cardBorder: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#666666",
};

// --- Componenti UI (Invariati) ---
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
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNavigate(t.id)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
            color: activeTab === t.id ? primaryColor : "#666", padding: "4px 12px",
          }}>
          <t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 1.5} />
          <span style={{ fontSize: "10px", fontWeight: activeTab === t.id ? 700 : 400 }}>{t.label}</span>
        </button>
      ))}
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
          <circle cx="110" cy="110" r={radius} fill="none" stroke={remaining === 0 ? "#22c55e" : primaryColor}
            strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
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
  const handleLog = () => { if (weightInput.trim()) { onLogWeight(ex.esercizio, ex.scheda_id, weightInput.trim()); setWeightInput(""); }};

  return (
    <div style={{ background: styles.card, borderRadius: 16, border: `1px solid ${styles.cardBorder}`, marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", background: "none", border: "none", padding: "16px", display: "flex", alignItems: "center", gap: "12px", color: "#FFF", textAlign: "left" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><Dumbbell size={20} color={primaryColor} /></div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{ex.esercizio}</div><div style={{ fontSize: "13px", color: styles.textSecondary }}>{ex.serie} × {ex.ripetizioni} • {ex.peso_suggerito} kg</div></div>
        <ChevronDown size={20} style={{ transform: expanded ? "rotate(180deg)" : "none" }} />
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ background: "#222", borderRadius: 10, padding: 12, marginBottom: 10, display: "flex", gap: 8 }}>
            <input value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="Tuo peso" type="number" style={{ flex: 1, background: "#333", border: "1px solid #444", borderRadius: 8, padding: 8, color: "#FFF" }} />
            <button onClick={handleLog} style={{ background: primaryColor, border: "none", borderRadius: 8, padding: "8, 16", color: "#FFF", fontWeight: 700 }}>Salva</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onTimer(ex.riposo_sec)} style={{ flex: 1, background: `${primaryColor}22`, border: "none", borderRadius: 10, padding: 10, color: primaryColor, fontWeight: 700 }}>Riposo {ex.riposo_sec}s</button>
            {ex.video_url && <button onClick={() => onVideo(ex.video_url)} style={{ flex: 1, background: "#333", border: "none", borderRadius: 10, padding: 10, color: "#FFF", fontWeight: 700 }}>Video</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function GymApp() {
  const [realData, setRealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentCliente, setCurrentCliente] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [progressData, setProgressData] = useState({});

  // --- MOTORE CARICAMENTO GOOGLE SHEETS ---
  const fetchData = useCallback(async () => {
    try {
      const sheets = ['config', 'clienti', 'schede', 'esercizi'];
      const res = {};
      for (const s of sheets) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${s}?key=${API_KEY}`;
        const resp = await fetch(url);
        const json = await resp.json();
        if (json.values) {
          const h = json.values[0];
          res[s] = json.values.slice(1).map(row => {
            const o = {}; h.forEach((key, i) => o[key] = row[i] || "");
            return o;
          });
        }
      }
      const configObj = {}; res.config?.forEach(item => configObj[item.chiave] = item.valore);
      setRealData({ config: configObj, clienti: res.clienti || [], schede: res.schede || [], esercizi: res.esercizi || [] });
      setLastSync(new Date().toLocaleString("it-IT"));
    } catch (e) { console.error("Errore Sheets:", e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Gestione variabili (Real vs Demo)
  const config = realData?.config || DEMO_CONFIG;
  const elencoClienti = realData?.clienti || DEMO_CLIENTI;
  const elencoSchede = realData?.schede || DEMO_SCHEDE;
  const elencoEsercizi = realData?.esercizi || DEMO_ESERCIZI;
  const primaryColor = config.colore_primario || "#FF6B00";

  const currentScheda = useMemo(() => {
    if (!currentCliente) return null;
    return elencoSchede.find(s => s.scheda_id === currentCliente.scheda_attiva);
  }, [currentCliente, elencoSchede]);

  const dayExercises = useMemo(() => {
    if (!selectedDay || !currentCliente) return [];
    return elencoEsercizi.filter(e => e.scheda_id === currentCliente.scheda_attiva && e.giorno === selectedDay);
  }, [selectedDay, currentCliente, elencoEsercizi]);

  const handleLogin = (code, pin) => {
    const cliente = elencoClienti.find(c => c.codice === code);
    if (!cliente || (cliente.pin && cliente.pin !== pin)) { setLoginError("Dati errati"); return; }
    setCurrentCliente(cliente); setLoggedIn(true); setLoginError("");
  };

  const handleLogWeight = (exercise, schedaId, weight) => {
    const key = `${exercise}__${schedaId}`;
    const date = new Date().toLocaleDateString("it-IT");
    setProgressData(prev => ({ ...prev, [key]: [...(prev[key] || []), { date, weight }] }));
  };

  if (loading) return <div style={{ background: "#000", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: primaryColor, fontWeight: 900 }}>CARICAMENTO...</div>;

  if (!loggedIn) return <LoginScreen config={config} onLogin={handleLogin} error={loginError} />;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#0A0A0A", minHeight: "100vh", color: "#FFF" }}>
      {timerSeconds && <RestTimer seconds={timerSeconds} onClose={() => setTimerSeconds(null)} primaryColor={primaryColor} />}
      {videoUrl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setVideoUrl(null)} style={{ position: "absolute", top: 20, right: 20, color: "#FFF", background: "none", border: "none" }}><X size={30}/></button>
          <iframe width="100%" height="300" src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`} frameBorder="0" allowFullScreen></iframe>
        </div>
      )}
      
      <div style={{ padding: "20px 16px 100px" }}>
        {selectedDay ? (
          <div>
            <button onClick={() => setSelectedDay(null)} style={{ background: "#222", border: "none", color: "#FFF", padding: 10, borderRadius: 10, marginBottom: 20 }}><ChevronLeft/></button>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>{selectedDay}</h2>
            {dayExercises.map((ex, i) => <ExerciseCard key={i} ex={ex} primaryColor={primaryColor} onTimer={setTimerSeconds} onVideo={setVideoUrl} onLogWeight={handleLogWeight} progress={progressData[`${ex.esercizio}__${ex.scheda_id}`]} />)}
          </div>
        ) : activeTab === "home" ? (
          <Dashboard cliente={currentCliente} scheda={currentScheda} esercizi={elencoEsercizi} primaryColor={primaryColor} onSelectDay={setSelectedDay} onSync={fetchData} lastSync={lastSync} />
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Sezione {activeTab} disponibile a breve...</div>
        )}
      </div>
      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} primaryColor={primaryColor} />
    </div>
  );
}

// --- Componenti UI rimanenti (Login e Dashboard) ---
function LoginScreen({ config, onLogin, error }) {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: `${styles.primary}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><Dumbbell size={40} color={config.colore_primario} /></div>
      <h1 style={{ color: "#FFF", fontSize: 28, fontWeight: 900 }}>{config.nome_palestra}</h1>
      <p style={{ color: "#666", marginBottom: 40 }}>{config.slogan}</p>
      <input placeholder="Codice" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, padding: 16, color: "#FFF", width: "100%", maxWidth: 300, marginBottom: 12 }} />
      <input placeholder="PIN" type="password" value={pin} onChange={e => setPin(e.target.value)} style={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 12, padding: 16, color: "#FFF", width: "100%", maxWidth: 300, marginBottom: 12 }} />
      {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{error}</p>}
      <button onClick={() => onLogin(code, pin)} style={{ background: config.colore_primario, border: "none", borderRadius: 12, padding: 18, color: "#FFF", fontWeight: 800, width: "100%", maxWidth: 300 }}>ACCEDI</button>
    </div>
  );
}

function Dashboard({ cliente, scheda, esercizi, primaryColor, onSelectDay, onSync, lastSync }) {
  const workoutDays = [...new Set(esercizi.filter(e => e.scheda_id
