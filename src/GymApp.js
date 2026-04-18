import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Home, BarChart3, ClipboardList, User, Play, Timer, ChevronRight,
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info, Plus, Minus,
  RefreshCw, Wifi, WifiOff, LogOut, MapPin, Clock, Target,
  ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Zap,
  Video, AlertCircle, Loader
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIGURAZIONE — Google Sheets API
   Queste due righe collegano l'app al TUO foglio Google.
   ───────────────────────────────────────────── */
const SHEET_ID = "144-i_O8EGeL51ku9oi7n44oS1KGQY2cutIrulSVDJcw";
const API_KEY = "AIzaSyDEoQi1P3VVocd7Yokkw8by8PLWq-t1IV4";
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

/* ─────────────────────────────────────────────
   FUNZIONI API — Leggono i dati da Google Sheets
   ───────────────────────────────────────────── */
async function fetchSheet(tabName) {
  const url = `${BASE_URL}/${encodeURIComponent(tabName)}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Errore fetch tab "${tabName}": ${res.status}`);
  const data = await res.json();
  const [headers, ...rows] = data.values || [];
  return rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}

async function fetchAllData() {
  const [configRows, clienti, schede, esercizi] = await Promise.all([
    fetchSheet("config"), fetchSheet("clienti"), fetchSheet("schede"), fetchSheet("esercizi"),
  ]);
  const config = Object.fromEntries(configRows.map(r => [r.chiave, r.valore]));
  return { config, clienti, schede, esercizi };
}

/* ─────────────────────────────────────────────
   UTILITÀ
   ───────────────────────────────────────────── */
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

const getStyles = (primary, bg) => ({
  bg: bg || "#0A0A0A",
  primary: primary || "#FF6B00",
  card: "#1A1A1A",
  cardBorder: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#666666",
});

/* ─────────────────────────────────────────────
   COMPONENTI UI
   ───────────────────────────────────────────── */

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
      padding: "6px 0 env(safe-area-inset-bottom, 8px)"
    }}>
      {tabs.map(t => {
        const active = activeTab === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => onNavigate(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
            color: active ? primaryColor : "#666", padding: "4px 12px"
          }}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
            <span style={{ fontSize: "10px", fontWeight: active ? 700 : 400 }}>{t.label}</span>
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
            try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch(e) {}
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
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const adjust = (delta) => {
    setRemaining(r => Math.max(0, r + delta));
    total.current = Math.max(total.current + delta, 1);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px"
    }}>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#222" strokeWidth="8" />
          <circle cx="110" cy="110" r={radius} fill="none"
            stroke={remaining === 0 ? "#22c55e" : primaryColor}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <span style={{
            fontSize: "48px", fontWeight: 800, color: "#FFF",
            fontVariantNumeric: "tabular-nums", letterSpacing: "-2px"
          }}>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
          {remaining === 0 && <span style={{ fontSize: "14px", color: "#22c55e", fontWeight: 600 }}>TEMPO SCADUTO!</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={() => adjust(-15)} style={{
          background: "#222", border: "none", borderRadius: "50%", width: 56, height: 56,
          color: "#FFF", fontSize: "14px", fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>-15s</button>
        <button onClick={() => setRunning(!running)} style={{
          background: primaryColor, border: "none", borderRadius: "50%", width: 56, height: 56,
          color: "#FFF", fontSize: "18px", fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>{running ? "⏸" : "▶"}</button>
        <button onClick={() => adjust(15)} style={{
          background: "#222", border: "none", borderRadius: "50%", width: 56, height: 56,
          color: "#FFF", fontSize: "14px", fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>+15s</button>
      </div>
      <button onClick={onClose} style={{
        background: "none", border: "1px solid #333", borderRadius: 12,
        color: "#FFF", padding: "12px 48px", cursor: "pointer", fontSize: "15px", fontWeight: 600
      }}>Chiudi</button>
    </div>
  );
}

function VideoModal({ videoUrl, onClose }) {
  const id = getYouTubeId(videoUrl);
  if (!id) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#FFF", cursor: "pointer"
      }}><X size={28} /></button>
      <div style={{ width: "100%", maxWidth: 480, aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", padding: "0 16px", boxSizing: "border-box" }}>
        <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="autoplay; encrypted-media" allowFullScreen />
      </div>
    </div>
  );
}

function ExerciseCard({ ex, styles, onTimer, onVideo, progress, onLogWeight }) {
  const [expanded, setExpanded] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const logged = progress || [];

  const handleLog = () => {
    if (!weightInput.trim()) return;
    onLogWeight(ex.esercizio, ex.scheda_id, weightInput.trim());
    setWeightInput("");
  };

  return (
    <div style={{
      background: styles.card, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${styles.cardBorder}`, marginBottom: 12
    }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "16px", display: "flex", alignItems: "center", gap: "12px",
        color: styles.textPrimary, textAlign: "left"
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${styles.primary}22`, flexShrink: 0
        }}>
          <Dumbbell size={20} color={styles.primary} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: 2 }}>{ex.esercizio}</div>
          <div style={{ fontSize: "13px", color: styles.textSecondary }}>
            {ex.serie} × {ex.ripetizioni} {ex.peso_suggerito !== "corpo" ? `• ${ex.peso_suggerito} kg` : "• Corpo libero"}
          </div>
        </div>
        <ChevronDown size={20} color={styles.textMuted}
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[["SERIE", ex.serie], ["REPS", ex.ripetizioni], ["RIPOSO", `${ex.riposo_sec}s`]].map(([label, val]) => (
              <div key={label} style={{ background: "#222", borderRadius: 8, padding: "8px 12px", flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: styles.textSecondary, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFF" }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{
            background: `${styles.primary}15`, borderRadius: 10, padding: "10px 12px",
            marginBottom: 10, display: "flex", alignItems: "center", gap: 8
          }}>
            <Target size={16} color={styles.primary} />
            <span style={{ fontSize: "13px", color: styles.textSecondary }}>Peso suggerito:</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: styles.primary }}>
              {ex.peso_suggerito === "corpo" ? "Corpo libero" : `${ex.peso_suggerito} kg`}
            </span>
          </div>
          <div style={{ background: "#222", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: "12px", color: styles.textSecondary, marginBottom: 6 }}>IL TUO PESO OGGI</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={weightInput} onChange={e => setWeightInput(e.target.value)}
                placeholder="kg" type="number" inputMode="decimal"
                style={{
                  flex: 1, background: "#333", border: "1px solid #444", borderRadius: 8,
                  padding: "8px 12px", color: "#FFF", fontSize: "16px", fontWeight: 700, outline: "none"
                }} />
              <button onClick={handleLog} style={{
                background: styles.primary, border: "none", borderRadius: 8,
                padding: "8px 16px", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: "14px"
              }}>Salva</button>
            </div>
            {logged.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {logged.slice(-5).map((l, i) => (
                  <span key={i} style={{
                    background: "#333", borderRadius: 6, padding: "3px 8px",
                    fontSize: "11px", color: styles.textSecondary
                  }}>{l.date}: <b style={{ color: "#FFF" }}>{l.weight}kg</b></span>
                ))}
              </div>
            )}
          </div>
          {ex.note && (
            <div style={{
              background: "#1E1A14", border: `1px solid ${styles.primary}33`,
              borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 8
            }}>
              <AlertCircle size={16} color={styles.primary} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: "13px", color: "#E0C080", lineHeight: 1.4 }}>{ex.note}</span>
            </div>
          )}
          {ex.tecnica && (
            <button onClick={() => setShowTech(!showTech)} style={{
              width: "100%", background: "none", border: `1px solid ${styles.cardBorder}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              color: styles.textSecondary, textAlign: "left"
            }}>
              <Info size={16} />
              <span style={{ flex: 1, fontSize: "13px" }}>{showTech ? ex.tecnica : "Mostra tecnica"}</span>
            </button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onTimer(parseInt(ex.riposo_sec) || 60)} style={{
              flex: 1, background: `${styles.primary}22`, border: `1px solid ${styles.primary}44`,
              borderRadius: 10, padding: "10px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              color: styles.primary, fontWeight: 700, fontSize: "13px"
            }}>
              <Timer size={16} /> Riposo {ex.riposo_sec}s
            </button>
            {ex.video_url && (
              <button onClick={() => onVideo(ex.video_url)} style={{
                flex: 1, background: "#222", border: `1px solid ${styles.cardBorder}`,
                borderRadius: 10, padding: "10px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                color: "#FFF", fontWeight: 700, fontSize: "13px"
              }}>
                <Video size={16} /> Video
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingScreen({ primary }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0A",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16
    }}>
      <Dumbbell size={48} color={primary || "#FF6B00"} />
      <p style={{ color: "#666", fontSize: "14px" }}>Caricamento...</p>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0A",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, gap: 16
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%", border: "2px solid #ef4444",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <AlertCircle size={32} color="#ef4444" />
      </div>
      <h2 style={{ color: "#FFF", fontSize: "20px", fontWeight: 800, textAlign: "center" }}>Errore di connessione</h2>
      <p style={{ color: "#666", fontSize: "13px", textAlign: "center", maxWidth: 300 }}>{error}</p>
      <button onClick={onRetry} style={{
        background: "#FF6B00", border: "none", borderRadius: 12,
        padding: "14px 32px", color: "#FFF", fontWeight: 800, fontSize: "16px", cursor: "pointer", marginTop: 8
      }}>Riprova</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGIN SEMPLIFICATO — Solo codice cliente!
   Il cliente inserisce solo il suo codice (es. MG-001)
   e accede direttamente. Niente PIN, niente password.
   ───────────────────────────────────────────── */
function LoginScreen({ config, styles, onLogin, error }) {
  const [code, setCode] = useState("");
  const hasLogo = config.logo_url && config.logo_url !== "https://link-al-logo.png" && config.logo_url.trim() !== "";

  const handleSubmit = () => {
    if (code.trim()) onLogin(code.trim().toUpperCase());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{
      minHeight: "100vh", background: styles.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 24px"
    }}>
      {/* LOGO */}
      <div style={{
        width: 120, height: 120, marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {hasLogo ? (
          <img src={config.logo_url} alt="logo"
            style={{ width: 120, height: 120, objectFit: "contain", borderRadius: "50%" }} />
        ) : (
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: `${styles.primary}22`, border: `2px solid ${styles.primary}44`,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Dumbbell size={56} color={styles.primary} />
          </div>
        )}
      </div>

      <h1 style={{ color: "#FFF", fontSize: "28px", fontWeight: 900, marginBottom: 4, textAlign: "center" }}>
        {config.nome_palestra}
      </h1>
      {config.slogan && (
        <p style={{ color: styles.textSecondary, fontSize: "14px", marginBottom: 40, fontStyle: "italic", textAlign: "center" }}>
          {config.slogan}
        </p>
      )}

      <div style={{ width: "100%", maxWidth: 320 }}>
        <label style={{
          display: "block", fontSize: "12px", color: styles.textSecondary,
          marginBottom: 8, fontWeight: 600, letterSpacing: "1px", textAlign: "center"
        }}>INSERISCI IL TUO CODICE</label>

        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="es. MG-001"
          autoComplete="off"
          autoCapitalize="characters"
          style={{
            width: "100%", background: styles.card, border: `2px solid ${styles.cardBorder}`,
            borderRadius: 14, padding: "16px 20px", color: "#FFF",
            fontSize: "22px", fontWeight: 800, outline: "none", marginBottom: 12,
            boxSizing: "border-box", letterSpacing: "2px", textAlign: "center"
          }}
        />

        {error && (
          <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", marginBottom: 8 }}>{error}</p>
        )}

        <button onClick={handleSubmit} style={{
          width: "100%", background: styles.primary, border: "none", borderRadius: 14,
          padding: "16px", color: "#FFF", fontSize: "16px", fontWeight: 800,
          cursor: "pointer", marginTop: 8, textTransform: "uppercase",
          opacity: code.trim() ? 1 : 0.5
        }}>
          Accedi
        </button>

        <p style={{
          color: styles.textMuted, fontSize: "12px", textAlign: "center", marginTop: 16, lineHeight: 1.5
        }}>
          Il codice ti è stato dato dalla palestra.<br />
          Se non lo ricordi, chiedi al tuo trainer.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD — Schermata principale dopo il login
   ───────────────────────────────────────────── */
function Dashboard({ cliente, scheda, esercizi, styles, onSelectDay, onSync, lastSync }) {
  const giorni = useMemo(() => {
    if (!esercizi) return [];
    const unique = [...new Set(esercizi.filter(e => e.scheda_id === scheda.scheda_id).map(e => e.giorno))];
    return unique.map(g => ({
      nome: g,
      count: esercizi.filter(e => e.scheda_id === scheda.scheda_id && e.giorno === g).length
    }));
  }, [esercizi, scheda]);

  const daysLeft = daysUntil(scheda.data_scadenza);

  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: styles.bg }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#FFF", fontSize: "24px", fontWeight: 900, marginBottom: 2 }}>
          Ciao {cliente.nome}! 💪
        </h1>
        <p style={{ color: styles.textSecondary, fontSize: "14px" }}>Pronto per allenarti?</p>
      </div>

      <div style={{
        background: `linear-gradient(135deg, ${styles.primary}22, ${styles.primary}08)`,
        borderRadius: 20, padding: "20px", marginBottom: 24,
        border: `1px solid ${styles.primary}33`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: "11px", color: styles.primary, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>
              SCHEDA ATTIVA
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFF" }}>{scheda.nome_scheda}</div>
          </div>
          {daysLeft <= 7 && daysLeft > 0 && (
            <span style={{
              background: "#ef444422", color: "#ef4444", fontSize: "11px",
              fontWeight: 700, padding: "4px 10px", borderRadius: 8
            }}>Scade tra {daysLeft}g</span>
          )}
          {daysLeft <= 0 && (
            <span style={{
              background: "#ef444422", color: "#ef4444", fontSize: "11px",
              fontWeight: 700, padding: "4px 10px", borderRadius: 8
            }}>Scaduta</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Target size={14} color={styles.textSecondary} />
            <span style={{ fontSize: "13px", color: styles.textSecondary }}>{scheda.obiettivo}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={14} color={styles.textSecondary} />
            <span style={{ fontSize: "13px", color: styles.textSecondary }}>Fino al {formatDate(scheda.data_scadenza)}</span>
          </div>
        </div>
        {scheda.note_trainer && (
          <div style={{
            marginTop: 12, fontSize: "12px", color: styles.textSecondary,
            fontStyle: "italic", borderTop: `1px solid ${styles.primary}22`, paddingTop: 10
          }}>💡 {scheda.note_trainer}</div>
        )}
      </div>

      <h
