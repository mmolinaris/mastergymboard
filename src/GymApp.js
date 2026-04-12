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
const SHEET_ID = "1No3lEcFiI6nuLuAeMjmD5YFyfgp50mzJp4XSh1CcOxY";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
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
            try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
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
        position: "absolute", top: 16, right: 16, background: "none",
        border: "none", color: "#FFF", cursor: "pointer"
      }}><X size={28} /></button>
      <div style={{
        width: "100%", maxWidth: 560, aspectRatio: "16/9",
        borderRadius: 12, overflow: "hidden", padding: "0 16px", boxSizing: "border-box"
      }}>
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
              <div key={label} style={{
                background: "#222", borderRadius: 8, padding: "8px 12px", flex: 1, textAlign: "center"
              }}>
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
   LOGIN — Codice cliente + PIN
   ───────────────────────────────────────────── */
function LoginScreen({ config, styles, onLogin, error }) {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    if (code.trim() && pin.trim()) onLogin(code.trim().toUpperCase(), pin.trim());
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
      {/* LOGO — prende logo_url dal foglio config, altrimenti mostra icona */}
      <div style={{
        width: 120, height: 120, marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {config.logo_url && config.logo_url.startsWith("http") ? (
          <img src={config.logo_url} alt="logo"
            style={{ width: 120, height: 120, objectFit: "contain", borderRadius: "50%" }}
            onError={(e) => { e.target.style.display = "none"; }} />
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
        <p style={{
          color: styles.textSecondary, fontSize: "14px", marginBottom: 40,
          fontStyle: "italic", textAlign: "center"
        }}>{config.slogan}</p>
      )}

      <div style={{ width: "100%", maxWidth: 320 }}>
        <label style={{
          display: "block", fontSize: "12px", color: styles.textSecondary,
          marginBottom: 6, fontWeight: 600, letterSpacing: "1px"
        }}>CODICE CLIENTE</label>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="es. MG-001"
          autoComplete="off"
          autoCapitalize="characters"
          style={{
            width: "100%", background: styles.card, border: `1px solid ${styles.cardBorder}`,
            borderRadius: 12, padding: "14px 16px", color: "#FFF",
            fontSize: "16px", fontWeight: 700, outline: "none", marginBottom: 16,
            boxSizing: "border-box", letterSpacing: "1px"
          }}
        />

        <label style={{
          display: "block", fontSize: "12px", color: styles.textSecondary,
          marginBottom: 6, fontWeight: 600, letterSpacing: "1px"
        }}>PIN</label>
        <input
          value={pin}
          onChange={e => setPin(e.target.value.slice(0, 4))}
          onKeyDown={handleKeyDown}
          placeholder="• • • •"
          type="password"
          inputMode="numeric"
          style={{
            width: "100%", background: styles.card, border: `1px solid ${styles.cardBorder}`,
            borderRadius: 12, padding: "14px 16px", color: "#FFF",
            fontSize: "20px", fontWeight: 700, outline: "none", marginBottom: 8,
            boxSizing: "border-box", letterSpacing: "8px", textAlign: "center"
          }}
        />

        {error && (
          <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", marginBottom: 8 }}>{error}</p>
        )}

        <button onClick={handleSubmit} style={{
          width: "100%", background: styles.primary, border: "none", borderRadius: 12,
          padding: "16px", color: "#FFF", fontSize: "16px", fontWeight: 800,
          cursor: "pointer", marginTop: 16, textTransform: "uppercase",
          opacity: (code.trim() && pin.trim()) ? 1 : 0.5
        }}>
          Accedi
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD — Schermata principale
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
            <div style={{
              fontSize: "11px", color: styles.primary, fontWeight: 700,
              letterSpacing: "1.5px", marginBottom: 4
            }}>SCHEDA ATTIVA</div>
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

      <h2 style={{ color: "#FFF", fontSize: "16px", fontWeight: 800, marginBottom: 12 }}>I TUOI ALLENAMENTI</h2>
      {giorni.map((g, i) => (
        <button key={g.nome} onClick={() => onSelectDay(g.nome)} style={{
          width: "100%", background: styles.card, border: `1px solid ${styles.cardBorder}`,
          borderRadius: 14, padding: "16px", marginBottom: 10, cursor: "pointer",
          display: "flex", alignItems: "center", gap: "12px", textAlign: "left"
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: `${styles.primary}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 900, color: styles.primary
          }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#FFF", fontSize: "15px", fontWeight: 700 }}>{g.nome}</div>
            <div style={{ color: styles.textSecondary, fontSize: "13px" }}>{g.count} esercizi</div>
          </div>
          <ChevronRight size={20} color={styles.textMuted} />
        </button>
      ))}

      <button onClick={onSync} style={{
        width: "100%", background: "#161616", border: `1px solid ${styles.cardBorder}`,
        borderRadius: 12, padding: "12px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        color: styles.textSecondary, fontSize: "13px", marginTop: 8
      }}>
        <RefreshCw size={14} /> Aggiorna scheda {lastSync && `• ${lastSync}`}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GIORNO DI ALLENAMENTO
   ───────────────────────────────────────────── */
function WorkoutDay({ giorno, esercizi, styles, onBack, onTimer, onVideo, progressData, onLogWeight }) {
  const grouped = useMemo(() => {
    const groups = {};
    [...esercizi].sort((a, b) => parseInt(a.ordine) - parseInt(b.ordine)).forEach(e => {
      if (!groups[e.gruppo_muscolare]) groups[e.gruppo_muscolare] = [];
      groups[e.gruppo_muscolare].push(e);
    });
    return groups;
  }, [esercizi]);

  return (
    <div style={{ padding: "0 16px 100px", minHeight: "100vh", background: styles.bg }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 50, background: styles.bg,
        padding: "16px 0 12px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${styles.cardBorder}`
      }}>
        <button onClick={onBack} style={{
          background: "#222", border: "none", borderRadius: 10, width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
        }}>
          <ChevronLeft size={20} color="#FFF" />
        </button>
        <div>
          <h1 style={{ color: "#FFF", fontSize: "18px", fontWeight: 800, margin: 0 }}>{giorno}</h1>
          <p style={{ color: styles.textSecondary, fontSize: "12px", margin: 0 }}>{esercizi.length} esercizi</p>
        </div>
      </div>
      <div style={{ paddingTop: 16 }}>
        {Object.entries(grouped).map(([group, exs]) => (
          <div key={group} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: "11px", fontWeight: 800, color: styles.primary,
              letterSpacing: "2px", marginBottom: 10, paddingLeft: 4, textTransform: "uppercase"
            }}>{group}</div>
            {exs.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} styles={styles} onTimer={onTimer} onVideo={onVideo}
                progress={progressData[`${ex.esercizio}__${ex.scheda_id}`] || []}
                onLogWeight={onLogWeight} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROGRESSI
   ───────────────────────────────────────────── */
function ProgressTracker({ progressData, styles, esercizi, schedaAttiva }) {
  const [selectedEx, setSelectedEx] = useState(null);
  const activeExercises = useMemo(() =>
    [...new Set(esercizi.filter(e => e.scheda_id === schedaAttiva).map(e => e.esercizio))],
    [esercizi, schedaAttiva]
  );
  const todayLogs = useMemo(() => {
    const today = new Date().toLocaleDateString("it-IT");
    const logs = [];
    Object.entries(progressData).forEach(([key, entries]) => {
      entries.forEach(entry => {
        if (entry.date === today) logs.push({ exercise: key.split("__")[0], weight: entry.weight });
      });
    });
    return logs;
  }, [progressData]);
  const selectedData = selectedEx ? (progressData[`${selectedEx}__${schedaAttiva}`] || []) : [];

  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: styles.bg }}>
      <h1 style={{ color: "#FFF", fontSize: "24px", fontWeight: 900, marginBottom: 4 }}>Progressi 📊</h1>
      <p style={{ color: styles.textSecondary, fontSize: "14px", marginBottom: 24 }}>Monitora i tuoi miglioramenti</p>

      <div style={{
        background: `${styles.primary}15`, borderRadius: 16, padding: "16px",
        marginBottom: 24, border: `1px solid ${styles.primary}22`
      }}>
        <div style={{
          fontSize: "11px", color: styles.primary, fontWeight: 700,
          letterSpacing: "1.5px", marginBottom: 10
        }}>SESSIONE DI OGGI</div>
        {todayLogs.length === 0 ? (
          <p style={{ color: styles.textSecondary, fontSize: "13px", margin: 0 }}>
            Nessun peso registrato oggi. Vai alla scheda e inizia! 💪
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {todayLogs.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#FFF", fontSize: "14px" }}>{l.exercise}</span>
                <span style={{ color: styles.primary, fontWeight: 700, fontSize: "14px" }}>{l.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ color: "#FFF", fontSize: "16px", fontWeight: 800, marginBottom: 12 }}>STORICO PER ESERCIZIO</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {activeExercises.map(ex => (
          <button key={ex} onClick={() => setSelectedEx(selectedEx === ex ? null : ex)} style={{
            background: selectedEx === ex ? styles.primary : "#222",
            border: `1px solid ${selectedEx === ex ? styles.primary : styles.cardBorder}`,
            borderRadius: 8, padding: "6px 12px", cursor: "pointer",
            color: selectedEx === ex ? "#FFF" : styles.textSecondary,
            fontSize: "12px", fontWeight: 600
          }}>{ex}</button>
        ))}
      </div>

      {selectedEx && (
        <div style={{
          background: styles.card, borderRadius: 16, padding: "16px",
          border: `1px solid ${styles.cardBorder}`
        }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#FFF", marginBottom: 12 }}>{selectedEx}</div>
          {selectedData.length === 0 ? (
            <p style={{ color: styles.textSecondary, fontSize: "13px" }}>Nessun dato per questo esercizio.</p>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, marginBottom: 12 }}>
                {selectedData.slice(-10).map((d, i) => {
                  const max = Math.max(...selectedData.slice(-10).map(x => parseFloat(x.weight) || 0));
                  const val = parseFloat(d.weight) || 0;
                  const h = max > 0 ? (val / max) * 100 : 0;
                  return (
                    <div key={i} style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4
                    }}>
                      <span style={{ fontSize: "10px", color: "#FFF", fontWeight: 700 }}>{d.weight}</span>
                      <div style={{
                        width: "100%", height: `${h}%`, minHeight: 4,
                        background: styles.primary, borderRadius: "4px 4px 0 0"
                      }} />
                      <span style={{ fontSize: "9px", color: styles.textMuted }}>{d.date.slice(0, 5)}</span>
                    </div>
                  );
                })}
              </div>
              {selectedData.length >= 2 && (() => {
                const first = parseFloat(selectedData[0].weight) || 0;
                const last = parseFloat(selectedData[selectedData.length - 1].weight) || 0;
                const diff = last - first;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: diff >= 0 ? "#22c55e" : "#ef4444" }}>
                    <TrendingUp size={16} />
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>
                      {diff >= 0 ? "+" : ""}{diff.toFixed(1)} kg dal primo log
                    </span>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STORICO SCHEDE
   ───────────────────────────────────────────── */
function WorkoutHistory({ cliente, schede, esercizi, styles }) {
  const [openScheda, setOpenScheda] = useState(null);
  const allSchedaIds = useMemo(() => {
    const ids = [cliente.scheda_attiva];
    if (cliente.schede_passate) {
      cliente.schede_passate.split(",").map(s => s.trim()).filter(Boolean).forEach(id => ids.push(id));
    }
    return ids;
  }, [cliente]);
  const schedeList = useMemo(() =>
    allSchedaIds.map(id => schede.find(s => s.scheda_id === id)).filter(Boolean),
    [allSchedaIds, schede]
  );

  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: styles.bg }}>
      <h1 style={{ color: "#FFF", fontSize: "24px", fontWeight: 900, marginBottom: 4 }}>Storico 📋</h1>
      <p style={{ color: styles.textSecondary, fontSize: "14px", marginBottom: 24 }}>Le tue schede di allenamento</p>

      {schedeList.map(s => {
        const isActive = s.scheda_id === cliente.scheda_attiva;
        const isOpen = openScheda === s.scheda_id;
        const exs = esercizi.filter(e => e.scheda_id === s.scheda_id);
        const giorni = [...new Set(exs.map(e => e.giorno))];
        return (
          <div key={s.scheda_id} style={{
            background: styles.card, borderRadius: 16, marginBottom: 12,
            border: `1px solid ${isActive ? styles.primary + "44" : styles.cardBorder}`,
            overflow: "hidden"
          }}>
            <button onClick={() => setOpenScheda(isOpen ? null : s.scheda_id)} style={{
              width: "100%", background: "none", border: "none", cursor: "pointer",
              padding: "16px", display: "flex", alignItems: "center", gap: 12,
              color: "#FFF", textAlign: "left"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isActive ? `${styles.primary}22` : "#222"
              }}>
                <ClipboardList size={20} color={isActive ? styles.primary : styles.textMuted} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700 }}>{s.nome_scheda}</span>
                  {isActive && (
                    <span style={{
                      background: styles.primary, color: "#FFF", fontSize: "9px",
                      fontWeight: 800, padding: "2px 8px", borderRadius: 4, letterSpacing: "1px"
                    }}>ATTIVA</span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: styles.textSecondary, marginTop: 2 }}>
                  {s.obiettivo} • {formatDate(s.data_creazione)} → {formatDate(s.data_scadenza)}
                </div>
              </div>
              <ChevronDown size={18} color={styles.textMuted}
                style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {isOpen && (
              <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${styles.cardBorder}` }}>
                {s.note_trainer && (
                  <p style={{
                    color: styles.textSecondary, fontSize: "12px", fontStyle: "italic", marginBottom: 12
                  }}>💡 {s.note_trainer}</p>
                )}
                {giorni.map(g => {
                  const dayExs = exs.filter(e => e.giorno === g).sort((a, b) => parseInt(a.ordine) - parseInt(b.ordine));
                  return (
                    <div key={g} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: styles.primary, marginBottom: 6 }}>{g}</div>
                      {dayExs.map((e, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between",
                          padding: "6px 0", borderBottom: `1px solid ${styles.cardBorder}22`
                        }}>
                          <span style={{ color: "#FFF", fontSize: "13px" }}>{e.esercizio}</span>
                          <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{e.serie}×{e.ripetizioni}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROFILO
   ───────────────────────────────────────────── */
function ProfileScreen({ cliente, config, styles, onLogout }) {
  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: styles.bg }}>
      <h1 style={{ color: "#FFF", fontSize: "24px", fontWeight: 900, marginBottom: 24 }}>Profilo ⚙️</h1>

      <div style={{
        background: styles.card, borderRadius: 16, padding: "20px", marginBottom: 16,
        border: `1px solid ${styles.cardBorder}`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: `${styles.primary}22`,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <User size={28} color={styles.primary} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFF" }}>
              {cliente.nome} {cliente.cognome}
            </div>
            <div style={{ fontSize: "13px", color: styles.textSecondary }}>Codice: {cliente.codice}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Email", cliente.email],
            ["Telefono", cliente.telefono],
            ["Iscritto dal", formatDate(cliente.data_iscrizione)]
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{k}</span>
              <span style={{ color: "#FFF", fontSize: "13px" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: styles.card, borderRadius: 16, padding: "20px", marginBottom: 16,
        border: `1px solid ${styles.cardBorder}`
      }}>
        <div style={{
          fontSize: "12px", color: styles.primary, fontWeight: 700,
          letterSpacing: "1.5px", marginBottom: 16
        }}>LA TUA PALESTRA</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", marginBottom: 12 }}>
          {config.nome_palestra}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {config.indirizzo && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MapPin size={16} color={styles.textSecondary} />
              <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{config.indirizzo}</span>
            </div>
          )}
          {config.telefono && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Phone size={16} color={styles.textSecondary} />
              <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{config.telefono}</span>
            </div>
          )}
          {config.instagram && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Instagram size={16} color={styles.textSecondary} />
              <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{config.instagram}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {config.telefono && (
            <a href={`tel:${config.telefono}`} style={{
              flex: 1, background: `${styles.primary}22`, border: `1px solid ${styles.primary}44`,
              borderRadius: 10, padding: "12px", textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              color: styles.primary, fontWeight: 700, fontSize: "13px"
            }}><Phone size={16} /> Chiama</a>
          )}
          {config.instagram && (
            <a href={`https://instagram.com/${config.instagram.replace("@", "")}`}
              target="_blank" rel="noreferrer" style={{
                flex: 1, background: "#222", border: `1px solid ${styles.cardBorder}`,
                borderRadius: 10, padding: "12px", textDecoration: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                color: "#FFF", fontWeight: 700, fontSize: "13px"
              }}><Instagram size={16} /> Instagram</a>
          )}
        </div>
      </div>

      <button onClick={onLogout} style={{
        width: "100%", background: "#1C1111", border: "1px solid #3A1111",
        borderRadius: 12, padding: "14px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        color: "#ef4444", fontWeight: 700, fontSize: "14px"
      }}>
        <LogOut size={16} /> Esci
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP PRINCIPALE
   ───────────────────────────────────────────── */
export default function GymApp() {
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentCliente, setCurrentCliente] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [progressData, setProgressData] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAllData();
      setAppData(data);
      setLastSync(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const styles = useMemo(() =>
    getStyles(appData?.config?.colore_primario, appData?.config?.colore_sfondo),
    [appData]
  );
  const primaryColor = styles.primary;

  const currentScheda = useMemo(() => {
    if (!currentCliente || !appData) return null;
    return appData.schede.find(s => s.scheda_id === currentCliente.scheda_attiva);
  }, [currentCliente, appData]);

  const dayExercises = useMemo(() => {
    if (!selectedDay || !currentCliente || !appData) return [];
    return appData.esercizi.filter(
      e => e.scheda_id === currentCliente.scheda_attiva && e.giorno === selectedDay
    );
  }, [selectedDay, currentCliente, appData]);

  /* LOGIN — codice + PIN */
  const handleLogin = useCallback((code, pin) => {
    if (!appData) return;
    const cliente = appData.clienti.find(c => c.codice === code);
    if (!cliente) {
      setLoginError("Codice cliente non trovato");
      return;
    }
    if (cliente.pin && cliente.pin !== pin) {
      setLoginError("PIN non corretto");
      return;
    }
    setCurrentCliente(cliente);
    setLoggedIn(true);
    setLoginError("");
  }, [appData]);

  const handleLogout = useCallback(() => {
    setLoggedIn(false);
    setCurrentCliente(null);
    setActiveTab("home");
    setSelectedDay(null);
  }, []);

  const handleLogWeight = useCallback((exercise, schedaId, weight) => {
    const key = `${exercise}__${schedaId}`;
    const date = new Date().toLocaleDateString("it-IT");
    setProgressData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { date, weight }]
    }));
  }, []);

  if (loading) return <LoadingScreen primary="#FF6B00" />;
  if (fetchError) return <ErrorScreen error={fetchError} onRetry={loadData} />;
  if (!loggedIn) return <LoginScreen config={appData.config} styles={styles} onLogin={handleLogin} error={loginError} />;

  return (
    <div style={{
      width: "100%",
      margin: "0 auto",
      position: "relative",
      background: styles.bg,
      minHeight: "100vh"
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        html, body { background: ${styles.bg}; }
        input::placeholder { color: #555; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {timerSeconds !== null && (
        <RestTimer seconds={timerSeconds} onClose={() => setTimerSeconds(null)} primaryColor={primaryColor} />
      )}
      {videoUrl && <VideoModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />}

      <div>
        {selectedDay ? (
          <WorkoutDay giorno={selectedDay} esercizi={dayExercises} styles={styles}
            onBack={() => setSelectedDay(null)}
            onTimer={s => setTimerSeconds(s)}
            onVideo={v => setVideoUrl(v)}
            progressData={progressData}
            onLogWeight={handleLogWeight} />
        ) : activeTab === "home" && currentScheda ? (
          <Dashboard cliente={currentCliente} scheda={currentScheda} esercizi={appData.esercizi}
            styles={styles} onSelectDay={day => setSelectedDay(day)}
            onSync={loadData} lastSync={lastSync} />
        ) : activeTab === "progress" ? (
          <ProgressTracker progressData={progressData} styles={styles}
            esercizi={appData.esercizi} schedaAttiva={currentCliente.scheda_attiva} />
        ) : activeTab === "history" ? (
          <WorkoutHistory cliente={currentCliente} schede={appData.schede}
            esercizi={appData.esercizi} styles={styles} />
        ) : activeTab === "profile" ? (
          <ProfileScreen cliente={currentCliente} config={appData.config}
            styles={styles} onLogout={handleLogout} />
        ) : null}
      </div>

      {!selectedDay && (
        <BottomNav activeTab={activeTab}
          onNavigate={tab => { setActiveTab(tab); setSelectedDay(null); }}
          primaryColor={primaryColor} />
      )}
    </div>
  );
}
