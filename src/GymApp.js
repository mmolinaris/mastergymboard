import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Home, BarChart3, ClipboardList, User, Timer, ChevronRight,
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info,
  RefreshCw, LogOut, MapPin, Target, ChevronDown, Calendar,
  TrendingUp, Video, AlertCircle, Zap, Facebook
} from "lucide-react";

const SHEET_ID = "1ncZxiiLhlfaWlKHmqZk1qb9tg5R6CBpT3cWKKuZrBXg";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const LOGO_URL = "https://raw.githubusercontent.com/mmolinaris/mastergymboard/main/public/icon-512.png";

const S = {
  bg: "#F4F4F4",
  white: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E2E2E2",
  text: "#1A1A1A",
  sub: "#6B6B6B",
  muted: "#AAAAAA",
  red: "#D32F2F",
  redLight: "#FFEBEE",
  redBorder: "#FFCDD2",
  gray: "#9E9E9E",
  grayLight: "#F0F0F0",
  grayDark: "#424242",
};

async function fetchSheet(tab) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(tab)}?key=${API_KEY}`);
  if (!res.ok) throw new Error(`Errore caricamento ${tab}: ${res.status}`);
  const d = await res.json();
  const [h, ...rows] = d.values || [];
  if (!h) return [];
  return rows.map(r => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? "").toString().trim()])));
}

async function fetchAllData() {
  const tabs = ["config","clienti","schede","esercizi"];
  let servizi = [];
  try { servizi = await fetchSheet("servizi"); } catch(e) {}
  const [cf, cl, sc, ex] = await Promise.all(tabs.map(fetchSheet));
  const esercizi = ex.map(e => ({
    ...e,
    seduta: e.seduta || e.giorno || "",
    recupero: e.recupero || e.riposo_sec || "0",
    muscolo: e.muscolo || e.gruppo_muscolare || "",
    ordine: e.ordine || "0",
  }));
  return {
    config: Object.fromEntries(cf.map(r => [r.chiave, r.valore])),
    clienti: cl,
    schede: sc,
    esercizi,
    servizi,
  };
}

const daysUntil = d => Math.ceil((new Date(d) - new Date()) / 864e5);
const fmtDate = d => {
  if (!d) return "";
  if (d.includes("/")) return d;
  const p = d.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
};
const ytId = u => u?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || null;
const isCardio = e => !e.serie && (e.ripetizioni || "").includes("'");
const parseRec = r => {
  if (!r || r === "0") return 0;
  const m = r.match(/(\d+)/);
  if (!m) return 0;
  return r.includes("'") && !r.includes("''") ? parseInt(m[1]) * 60 : parseInt(m[1]);
};

function Nav({ tab, onNav }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: S.white, borderTop: `1px solid ${S.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 env(safe-area-inset-bottom,10px)", boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>
      {[["home", Home, "Home"], ["progress", BarChart3, "Progressi"], ["history", ClipboardList, "Storico"], ["profile", User, "Profilo"]].map(([id, Icon, lbl]) => {
        const a = tab === id;
        return (
          <button key={id} onClick={() => onNav(id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: a ? S.red : S.muted, padding: "4px 16px", minWidth: 60 }}>
            <Icon size={22} strokeWidth={a ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: a ? 700 : 500 }}>{lbl}</span>
          </button>
        );
      })}
    </div>
  );
}

function RestTimer({ seconds, onClose }) {
  const [rem, setRem] = useState(seconds);
  const [run, setRun] = useState(true);
  const ref = useRef(null);
  const tot = useRef(seconds);
  useEffect(() => {
    if (run && rem > 0) {
      ref.current = setInterval(() => setRem(r => {
        if (r <= 1) { clearInterval(ref.current); try { navigator.vibrate?.([300, 100, 300]); } catch (e) { } return 0; }
        return r - 1;
      }), 1000);
    }
    return () => clearInterval(ref.current);
  }, [run, rem]);
  const R = 85, C = 2 * Math.PI * R, off = C * (1 - rem / tot.current), m = Math.floor(rem / 60), s = rem % 60;
  const adj = d => { setRem(r => Math.max(0, r + d)); tot.current = Math.max(tot.current + d, 1); };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,20,20,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, padding: 24 }}>
      <p style={{ color: S.muted, fontSize: 13, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Recupero</p>
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#333" strokeWidth="6" />
          <circle cx="100" cy="100" r={R} fill="none" stroke={rem === 0 ? "#4CAF50" : S.red} strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#FFF", fontVariantNumeric: "tabular-nums" }}>{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>
          {rem === 0 && <span style={{ fontSize: 13, color: "#4CAF50", fontWeight: 700, marginTop: 4 }}>RIPRENDI!</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {[[-15, "-15s"], [0, run ? "⏸" : "▶"], [15, "+15s"]].map(([d, l], i) => (
          <button key={i} onClick={() => d === 0 ? setRun(!run) : adj(d)} style={{ background: d === 0 ? S.red : "#2A2A2A", border: "none", borderRadius: "50%", width: 52, height: 52, color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{l}</button>
        ))}
      </div>
      <button onClick={onClose} style={{ background: "transparent", border: "1px solid #444", borderRadius: 12, color: "#CCC", padding: "12px 40px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Chiudi</button>
    </div>
  );
}

function VideoModal({ url, onClose }) {
  const id = ytId(url);
  if (!id) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: "max(48px, env(safe-area-inset-top, 48px))", right: 16, background: "#333", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
      <div style={{ width: "100%", maxWidth: 560, aspectRatio: "16/9", padding: "0 16px", boxSizing: "border-box" }}>
        <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`} style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }} allow="autoplay; encrypted-media" allowFullScreen />
      </div>
    </div>
  );
}

function ExCard({ ex, onTimer, onVideo, progress, onLog }) {
  const [open, setOpen] = useState(false);
  const [showT, setShowT] = useState(false);
  const [wt, setWt] = useState("");
  const logged = progress || [];
  const cardio = isCardio(ex);
  const hasPeso = ex.peso_suggerito?.trim();
  const hasVid = ex.video_url?.trim();
  const hasNote = ex.note?.trim();
  const hasTech = ex.tecnica?.trim();
  const recSec = parseRec(ex.recupero);
  const doLog = () => { if (!wt.trim()) return; onLog(ex.esercizio, ex.scheda_id, wt.trim()); setWt(""); };

  if (cardio) return (
    <div style={{ background: S.card, borderRadius: 12, border: `1px solid ${S.border}`, marginBottom: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Zap size={17} color="#388E3C" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{ex.esercizio}</div>
        {hasNote && <div style={{ fontSize: 12, color: S.sub, marginTop: 1 }}>{ex.note}</div>}
      </div>
      <div style={{ background: "#E8F5E9", borderRadius: 8, padding: "4px 10px" }}><span style={{ fontSize: 14, fontWeight: 800, color: "#388E3C" }}>{ex.ripetizioni}</span></div>
    </div>
  );

  const sub = [ex.serie && ex.ripetizioni ? `${ex.serie} × ${ex.ripetizioni}` : "", ex.muscolo || "", hasPeso ? `${ex.peso_suggerito} kg` : ""].filter(Boolean).join(" · ");

  return (
    <div style={{ background: S.card, borderRadius: 14, overflow: "hidden", border: `1px solid ${S.border}`, marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: S.redLight, flexShrink: 0 }}><Dumbbell size={19} color={S.red} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 2 }}>{ex.esercizio}</div>
          <div style={{ fontSize: 12, color: S.sub }}>{sub}</div>
        </div>
        <ChevronDown size={18} color={S.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .25s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
            {[ex.serie && ["SERIE", ex.serie], ex.ripetizioni && ["REPS", ex.ripetizioni], ["REC.", ex.recupero && ex.recupero !== "0" ? ex.recupero + "s" : "—"]].filter(Boolean).map(([l, v]) => (
              <div key={l} style={{ background: S.grayLight, borderRadius: 10, padding: "8px 12px", flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: S.muted, marginBottom: 2, fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: S.grayDark }}>{v}</div>
              </div>
            ))}
          </div>
          {ex.muscolo && <div style={{ display: "inline-block", background: S.redLight, borderRadius: 8, padding: "3px 10px", marginBottom: 10 }}><span style={{ fontSize: 11, color: S.red, fontWeight: 700 }}>{ex.muscolo}</span></div>}
          {hasPeso && (
            <div style={{ background: S.redLight, borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={15} color={S.red} />
              <span style={{ fontSize: 13, color: S.sub }}>Peso suggerito</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: S.red, marginLeft: "auto" }}>{ex.peso_suggerito} kg</span>
            </div>
          )}
          <div style={{ background: S.grayLight, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 6, fontWeight: 600 }}>IL TUO PESO OGGI</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={wt} onChange={e => setWt(e.target.value)} placeholder="es. 40" type="number" inputMode="decimal" style={{ flex: 1, background: S.white, border: `1px solid ${S.border}`, borderRadius: 8, padding: "9px 12px", color: S.text, fontSize: 16, fontWeight: 700, outline: "none" }} />
              <button onClick={doLog} style={{ background: S.red, border: "none", borderRadius: 8, padding: "9px 18px", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Salva</button>
            </div>
            {logged.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {logged.slice(-5).map((l, i) => <span key={i} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, color: S.sub }}>{l.date}: <b style={{ color: S.text }}>{l.weight}kg</b></span>)}
              </div>
            )}
          </div>
          {hasNote && (
            <div style={{ background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 8 }}>
              <AlertCircle size={15} color="#F9A825" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#5D4037", lineHeight: 1.5 }}>{ex.note}</span>
            </div>
          )}
          {hasTech && (
            <button onClick={() => setShowT(!showT)} style={{ width: "100%", background: "none", border: `1px solid ${S.border}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: 10, textAlign: "left" }}>
              <Info size={15} color={S.gray} />
              <span style={{ flex: 1, fontSize: 13, color: showT ? S.text : S.sub }}>{showT ? ex.tecnica : "Mostra esecuzione"}</span>
              <ChevronDown size={14} color={S.muted} style={{ transform: showT ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {recSec > 0 && <button onClick={() => onTimer(recSec)} style={{ flex: 1, background: S.redLight, border: `1px solid ${S.redBorder}`, borderRadius: 10, padding: "10px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: S.red, fontWeight: 700, fontSize: 12 }}><Timer size={15} /> Timer {ex.recupero}s</button>}
            {hasVid && <button onClick={() => onVideo(ex.video_url)} style={{ flex: 1, background: S.grayLight, border: `1px solid ${S.border}`, borderRadius: 10, padding: "10px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: S.grayDark, fontWeight: 700, fontSize: 12 }}><Video size={15} /> Video</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ config, onLogin, error }) {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const nomePalestra = config.nome_palestra || "ASD Master Gym";
  return (
    <div style={{ minHeight: "100vh", background: S.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ width: 110, height: 110, marginBottom: 16, borderRadius: "50%", overflow: "hidden", border: `3px solid ${S.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", background: S.white, flexShrink: 0 }}>
        <img src={LOGO_URL} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <h1 style={{ color: S.text, fontSize: 24, fontWeight: 900, marginBottom: 4, textAlign: "center" }}>{nomePalestra}</h1>
      {config.slogan && <p style={{ color: S.sub, fontSize: 13, marginBottom: 32, fontStyle: "italic", textAlign: "center" }}>{config.slogan}</p>}
      <div style={{ width: "100%", maxWidth: 300 }}>
        <label style={{ display: "block", fontSize: 11, color: S.muted, marginBottom: 5, fontWeight: 700, letterSpacing: "1.2px" }}>CODICE CLIENTE</label>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="es. MG-001" autoComplete="off"
          style={{ width: "100%", background: S.grayLight, border: `1.5px solid ${S.border}`, borderRadius: 12, padding: "14px 16px", color: S.text, fontSize: 16, fontWeight: 700, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
        <label style={{ display: "block", fontSize: 11, color: S.muted, marginBottom: 5, fontWeight: 700, letterSpacing: "1.2px" }}>PIN</label>
        <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="••••" type="password" inputMode="numeric"
          onKeyDown={e => { if (e.key === "Enter" && code.trim() && pin.trim()) onLogin(code.trim().toUpperCase(), pin.trim()); }}
          style={{ width: "100%", background: S.grayLight, border: `1.5px solid ${S.border}`, borderRadius: 12, padding: "14px 16px", color: S.text, fontSize: 22, fontWeight: 700, outline: "none", marginBottom: 8, boxSizing: "border-box", letterSpacing: "10px", textAlign: "center" }} />
        {error && <p style={{ color: S.red, fontSize: 13, textAlign: "center", marginBottom: 8, fontWeight: 600 }}>{error}</p>}
        <button onClick={() => code.trim() && pin.trim() && onLogin(code.trim().toUpperCase(), pin.trim())}
          style={{ width: "100%", background: code.trim() && pin.trim() ? S.red : "#BDBDBD", border: "none", borderRadius: 12, padding: "15px 16px", color: "#FFF", fontSize: 15, fontWeight: 800, cursor: code.trim() && pin.trim() ? "pointer" : "default", marginTop: 8, textTransform: "uppercase", letterSpacing: "1px" }}>
          Accedi
        </button>
      </div>
    </div>
  );
}

function Dashboard({ cliente, scheda, esercizi, onSelectDay, onSync, lastSync }) {
  const sedute = useMemo(() => {
    const exs = esercizi.filter(e => e.scheda_id === scheda.scheda_id);
    const u = [...new Set(exs.map(e => e.seduta))].filter(Boolean);
    return u.map(sed => ({ nome: sed, tipo: exs.find(e => e.seduta === sed)?.tipo_seduta || "", count: exs.filter(e => e.seduta === sed).length }));
  }, [esercizi, scheda]);
  const dl = daysUntil(scheda.data_scadenza);
  const scaduta = dl <= 0;
  const inScadenza = dl > 0 && dl <= 7;
  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: S.bg }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: S.text, fontSize: 22, fontWeight: 900, marginBottom: 2 }}>Ciao {cliente.nome}! 💪</h1>
        <p style={{ color: S.sub, fontSize: 13 }}>Pronto per allenarti oggi?</p>
      </div>
      <div style={{ background: S.white, borderRadius: 16, padding: 18, marginBottom: 20, border: `1px solid ${S.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: S.red, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>SCHEDA ATTIVA</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: S.text }}>{scheda.nome_scheda}</div>
          </div>
          {scaduta && <span style={{ background: S.redLight, color: S.red, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>Scaduta</span>}
          {inScadenza && <span style={{ background: "#FFF3E0", color: "#E65100", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>Scade in {dl}gg</span>}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: scheda.note_trainer ? 10 : 0 }}>
          {scheda.obiettivo && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Target size={13} color={S.gray} /><span style={{ fontSize: 12, color: S.sub }}>{scheda.obiettivo}</span></div>}
          {scheda.data_scadenza && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} color={S.gray} /><span style={{ fontSize: 12, color: S.sub }}>Fino al {fmtDate(scheda.data_scadenza)}</span></div>}
        </div>
        {scheda.note_trainer && <div style={{ marginTop: 10, fontSize: 12, color: S.sub, fontStyle: "italic", borderTop: `1px solid ${S.border}`, paddingTop: 10 }}>💡 {scheda.note_trainer}</div>}
      </div>
      <h2 style={{ color: S.text, fontSize: 14, fontWeight: 800, marginBottom: 10, letterSpacing: "0.5px" }}>LE TUE SEDUTE</h2>
      {sedute.map((sed, i) => (
        <button key={sed.nome} onClick={() => onSelectDay(sed.nome)}
          style={{ width: "100%", background: S.white, border: `1px solid ${S.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: S.redLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: S.red, flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: S.text, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {sed.nome}
              {sed.tipo && <span style={{ background: S.redLight, color: S.red, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>{sed.tipo}</span>}
            </div>
            <div style={{ color: S.muted, fontSize: 12, marginTop: 2 }}>{sed.count} esercizi</div>
          </div>
          <ChevronRight size={18} color={S.muted} />
        </button>
      ))}
      <button onClick={onSync}
        style={{ width: "100%", background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: S.muted, fontSize: 12, marginTop: 4 }}>
        <RefreshCw size={13} /> Aggiorna {lastSync && `· ${lastSync}`}
      </button>
    </div>
  );
}

function WorkoutDay({ seduta, esercizi, onBack, onTimer, onVideo, progressData, onLog }) {
  const tipo = esercizi[0]?.tipo_seduta || "";
  return (
    <div style={{ padding: "0 16px 100px", minHeight: "100vh", background: S.bg }}>
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: S.bg, paddingTop: "max(48px, env(safe-area-inset-top, 48px))", paddingBottom: 12, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${S.border}` }}>
        <button onClick={onBack} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <ChevronLeft size={20} color={S.text} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ color: S.text, fontSize: 17, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {seduta}
            {tipo && <span style={{ background: S.redLight, color: S.red, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>{tipo}</span>}
          </h1>
          <p style={{ color: S.muted, fontSize: 12, margin: 0 }}>{esercizi.length} esercizi</p>
        </div>
      </div>
      <div style={{ paddingTop: 14 }}>
        {[...esercizi].sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0)).map((ex, i) => (
          <ExCard key={i} ex={ex} onTimer={onTimer} onVideo={onVideo} progress={progressData[`${ex.esercizio}__${ex.scheda_id}`] || []} onLog={onLog} />
        ))}
      </div>
    </div>
  );
}

function ProgressView({ progressData, esercizi, schedaId }) {
  const [sel, setSel] = useState(null);
  const activeEx = useMemo(() => [...new Set(esercizi.filter(e => e.scheda_id === schedaId && !isCardio(e)).map(e => e.esercizio))], [esercizi, schedaId]);
  const todayLogs = useMemo(() => {
    const t = new Date().toLocaleDateString("it-IT");
    const l = [];
    Object.entries(progressData).forEach(([k, es]) => { es.forEach(e => { if (e.date === t) l.push({ ex: k.split("__")[0], weight: e.weight }); }); });
    return l;
  }, [progressData]);
  const selData = sel ? (progressData[`${sel}__${schedaId}`] || []) : [];
  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: S.bg }}>
      <h1 style={{ color: S.text, fontSize: 22, fontWeight: 900, marginBottom: 2 }}>Progressi 📈</h1>
      <p style={{ color: S.sub, fontSize: 13, marginBottom: 20 }}>I tuoi miglioramenti nel tempo</p>
      <div style={{ background: S.white, borderRadius: 14, padding: 16, marginBottom: 20, border: `1px solid ${S.border}` }}>
        <div style={{ fontSize: 10, color: S.red, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 10 }}>OGGI</div>
        {todayLogs.length === 0
          ? <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>Nessun peso registrato ancora oggi 💪</p>
          : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{todayLogs.map((l, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: S.text, fontSize: 13 }}>{l.ex}</span><span style={{ color: S.red, fontWeight: 800, fontSize: 14 }}>{l.weight} kg</span></div>)}</div>
        }
      </div>
      <h2 style={{ color: S.text, fontSize: 14, fontWeight: 800, marginBottom: 10 }}>PER ESERCIZIO</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
        {activeEx.map(ex => (
          <button key={ex} onClick={() => setSel(sel === ex ? null : ex)}
            style={{ background: sel === ex ? S.red : S.white, border: `1.5px solid ${sel === ex ? S.red : S.border}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", color: sel === ex ? "#FFF" : S.sub, fontSize: 12, fontWeight: 600 }}>
            {ex}
          </button>
        ))}
      </div>
      {sel && (
        <div style={{ background: S.white, borderRadius: 14, padding: 16, border: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: S.text, marginBottom: 14 }}>{sel}</div>
          {selData.length === 0
            ? <p style={{ color: S.muted, fontSize: 13 }}>Nessun dato registrato.</p>
            : (
              <>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 110, marginBottom: 14 }}>
                  {selData.slice(-10).map((d, i) => {
                    const max = Math.max(...selData.slice(-10).map(x => parseFloat(x.weight) || 0));
                    const h = max > 0 ? ((parseFloat(d.weight) || 0) / max) * 100 : 0;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 9, color: S.text, fontWeight: 700 }}>{d.weight}</span>
                        <div style={{ width: "100%", height: `${h}%`, minHeight: 4, background: S.red, borderRadius: "4px 4px 0 0", opacity: 0.85 }} />
                        <span style={{ fontSize: 8, color: S.muted }}>{d.date.slice(0, 5)}</span>
                      </div>
                    );
                  })}
                </div>
                {selData.length >= 2 && (() => {
                  const diff = (parseFloat(selData.at(-1).weight) || 0) - (parseFloat(selData[0].weight) || 0);
                  return <div style={{ display: "flex", alignItems: "center", gap: 6, color: diff >= 0 ? "#388E3C" : S.red, background: diff >= 0 ? "#E8F5E9" : S.redLight, padding: "8px 12px", borderRadius: 8 }}><TrendingUp size={15} /><span style={{ fontSize: 13, fontWeight: 700 }}>{diff >= 0 ? "+" : ""}{diff.toFixed(1)} kg dal primo allenamento</span></div>;
                })()}
              </>
            )
          }
        </div>
      )}
    </div>
  );
}

function HistoryView({ cliente, schede, esercizi }) {
  const [openId, setOpenId] = useState(null);
  const ids = useMemo(() => {
    const l = [cliente.scheda_attiva];
    if (cliente.schede_passate) cliente.schede_passate.split(",").map(x => x.trim()).filter(Boolean).forEach(id => l.push(id));
    return l.filter(Boolean);
  }, [cliente]);
  const list = useMemo(() => ids.map(id => schede.find(sc => sc.scheda_id === id)).filter(Boolean), [ids, schede]);
  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: S.bg }}>
      <h1 style={{ color: S.text, fontSize: 22, fontWeight: 900, marginBottom: 2 }}>Storico 📋</h1>
      <p style={{ color: S.sub, fontSize: 13, marginBottom: 20 }}>Le tue schede di allenamento</p>
      {list.length === 0 && <div style={{ background: S.white, borderRadius: 14, padding: 24, textAlign: "center", border: `1px solid ${S.border}` }}><p style={{ color: S.muted, fontSize: 14 }}>Nessuna scheda trovata.</p></div>}
      {list.map(sc => {
        const active = sc.scheda_id === cliente.scheda_attiva;
        const isOpen = openId === sc.scheda_id;
        const exs = esercizi.filter(e => e.scheda_id === sc.scheda_id);
        const seds = [...new Set(exs.map(e => e.seduta))].filter(Boolean);
        return (
          <div key={sc.scheda_id} style={{ background: S.white, borderRadius: 14, marginBottom: 10, border: `1.5px solid ${active ? S.red : S.border}`, overflow: "hidden" }}>
            <button onClick={() => setOpenId(isOpen ? null : sc.scheda_id)}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: active ? S.redLight : S.grayLight, flexShrink: 0 }}>
                <ClipboardList size={18} color={active ? S.red : S.gray} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{sc.nome_scheda}</span>
                  {active && <span style={{ background: S.red, color: "#FFF", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>ATTIVA</span>}
                </div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{sc.obiettivo} · {fmtDate(sc.data_creazione)} → {fmtDate(sc.data_scadenza)}</div>
              </div>
              <ChevronDown size={17} color={S.muted} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
            </button>
            {isOpen && (
              <div style={{ padding: "10px 16px 16px", borderTop: `1px solid ${S.border}` }}>
                {sc.note_trainer && <p style={{ color: S.sub, fontSize: 12, fontStyle: "italic", marginBottom: 12 }}>💡 {sc.note_trainer}</p>}
                {seds.map(sed => {
                  const dayExs = exs.filter(e => e.seduta === sed).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
                  return (
                    <div key={sed} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: S.red, marginBottom: 6 }}>{sed}{dayExs[0]?.tipo_seduta ? ` · ${dayExs[0].tipo_seduta}` : ""}</div>
                      {dayExs.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.grayLight}` }}>
                          <span style={{ color: S.text, fontSize: 13 }}>{e.esercizio}</span>
                          <span style={{ color: S.muted, fontSize: 12 }}>{isCardio(e) ? e.ripetizioni : `${e.serie}×${e.ripetizioni}`}</span>
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

function ProfileView({ cliente, config, servizi, onLogout }) {
  const corsi = servizi.filter(s => s.tipo === "corso");
  const collaborazioni = servizi.filter(s => s.tipo === "collaborazione");
  const personal = servizi.filter(s => s.tipo === "personal");
  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: S.bg }}>
      <h1 style={{ color: S.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Profilo</h1>
      {/* Dati cliente */}
      <div style={{ background: S.white, borderRadius: 16, padding: 20, marginBottom: 12, border: `1px solid ${S.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: S.redLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><User size={26} color={S.red} /></div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: S.text }}>{cliente.nome} {cliente.cognome}</div>
            <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>Codice: {cliente.codice}</div>
          </div>
        </div>
        {[["Email", cliente.email], ["Telefono", cliente.telefono], ["Iscritto dal", fmtDate(cliente.data_iscrizione)]].filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${S.grayLight}` }}>
            <span style={{ color: S.muted, fontSize: 13 }}>{k}</span>
            <span style={{ color: S.text, fontSize: 13, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      {/* La tua palestra */}
      <div style={{ background: S.white, borderRadius: 16, padding: 20, marginBottom: 12, border: `1px solid ${S.border}` }}>
        <div style={{ fontSize: 10, color: S.red, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 14 }}>LA TUA PALESTRA</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: `2px solid ${S.border}`, flexShrink: 0 }}>
            <img src={LOGO_URL} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: S.text }}>{config.nome_palestra || "ASD Master Gym"}</div>
        </div>
        {config.indirizzo && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><MapPin size={15} color={S.gray} /><span style={{ color: S.sub, fontSize: 13 }}>{config.indirizzo}</span></div>}
        {config.telefono && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><Phone size={15} color={S.gray} /><span style={{ color: S.sub, fontSize: 13 }}>{config.telefono}</span></div>}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {config.telefono && <a href={`tel:${config.telefono}`} style={{ flex: 1, background: S.redLight, border: `1px solid ${S.redBorder}`, borderRadius: 10, padding: "11px 8px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: S.red, fontWeight: 700, fontSize: 12 }}><Phone size={14} /> Chiama</a>}
          <a href="https://www.instagram.com/asd_palestra_mastergym/" target="_blank" rel="noreferrer" style={{ flex: 1, background: S.grayLight, border: `1px solid ${S.border}`, borderRadius: 10, padding: "11px 8px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: S.grayDark, fontWeight: 700, fontSize: 12 }}><Instagram size={14} /> Instagram</a>
          <a href="https://www.facebook.com/palestraasdmastergym/" target="_blank" rel="noreferrer" style={{ flex: 1, background: "#E8F0FE", border: "1px solid #C5D2F6", borderRadius: 10, padding: "11px 8px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#1565C0", fontWeight: 700, fontSize: 12 }}><Facebook size={14} /> Facebook</a>
        </div>
      </div>
      {/* Corsi */}
      {corsi.length > 0 && (
        <div style={{ background: S.white, borderRadius: 16, padding: 20, marginBottom: 12, border: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 10, color: S.red, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 14 }}>I NOSTRI CORSI</div>
          {corsi.map((c, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < corsi.length - 1 ? `1px solid ${S.grayLight}` : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{c.nome}</div>
              {c.descrizione && <div style={{ fontSize: 12, color: S.sub, marginTop: 2 }}>{c.descrizione}</div>}
              {c.contatto && <div style={{ fontSize: 12, color: S.red, marginTop: 2 }}>{c.contatto}</div>}
            </div>
          ))}
        </div>
      )}
      {/* Collaborazioni */}
      {collaborazioni.length > 0 && (
        <div style={{ background: S.white, borderRadius: 16, padding: 20, marginBottom: 12, border: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 10, color: S.red, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 14 }}>LE NOSTRE COLLABORAZIONI</div>
          {collaborazioni.map((c, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < collaborazioni.length - 1 ? `1px solid ${S.grayLight}` : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{c.nome}</div>
              {c.descrizione && <div style={{ fontSize: 12, color: S.sub, marginTop: 2 }}>{c.descrizione}</div>}
              {c.contatto && <div style={{ fontSize: 12, color: S.red, marginTop: 2 }}>{c.contatto}</div>}
            </div>
          ))}
        </div>
      )}
      {/* Personal */}
      {personal.length > 0 && (
        <div style={{ background: S.white, borderRadius: 16, padding: 20, marginBottom: 12, border: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 10, color: S.red, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 14 }}>I NOSTRI PERSONAL TRAINER</div>
          {personal.map((c, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < personal.length - 1 ? `1px solid ${S.grayLight}` : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{c.nome}</div>
              {c.descrizione && <div style={{ fontSize: 12, color: S.sub, marginTop: 2 }}>{c.descrizione}</div>}
              {c.contatto && <div style={{ fontSize: 12, color: S.red, marginTop: 2 }}>{c.contatto}</div>}
            </div>
          ))}
        </div>
      )}
      <button onClick={onLogout} style={{ width: "100%", background: S.redLight, border: `1px solid ${S.redBorder}`, borderRadius: 12, padding: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: S.red, fontWeight: 700, fontSize: 14 }}>
        <LogOut size={16} /> Esci
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: S.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: `2px solid ${S.border}` }}>
        <img src={LOGO_URL} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <p style={{ color: S.muted, fontSize: 14, fontWeight: 500 }}>Caricamento in corso...</p>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", background: S.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
      <AlertCircle size={44} color={S.red} />
      <h2 style={{ color: S.text, fontSize: 18, fontWeight: 800, textAlign: "center" }}>Errore di connessione</h2>
      <p style={{ color: S.muted, fontSize: 13, textAlign: "center", maxWidth: 280 }}>{error}</p>
      <button onClick={onRetry} style={{ background: S.red, border: "none", borderRadius: 12, padding: "14px 36px", color: "#FFF", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Riprova</button>
    </div>
  );
}

export default function GymApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [cliente, setCliente] = useState(null);
  const [tab, setTab] = useState("home");
  const [selDay, setSelDay] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [timer, setTimer] = useState(null);
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchAllData();
      setData(d);
      setLastSync(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const scheda = useMemo(() => cliente && data ? data.schede.find(sc => sc.scheda_id === cliente.scheda_attiva) : null, [cliente, data]);
  const dayExs = useMemo(() => selDay && cliente && data ? data.esercizi.filter(e => e.scheda_id === cliente.scheda_attiva && e.seduta === selDay) : [], [selDay, cliente, data]);

  const handleLogin = useCallback((code, pin) => {
    if (!data) return;
    const c = data.clienti.find(cl => cl.codice === code);
    if (!c) { setLoginErr("Codice non trovato"); return; }
    if (c.pin && String(c.pin).trim() !== String(pin).trim()) { setLoginErr("PIN non corretto"); return; }
    setCliente(c);
    setLoggedIn(true);
    setLoginErr("");
    try { localStorage.setItem("gb_code", code); localStorage.setItem("gb_pin", pin); } catch (e) { }
  }, [data]);

  useEffect(() => {
    if (!data || loggedIn) return;
    try {
      const code = localStorage.getItem("gb_code"), pin = localStorage.getItem("gb_pin");
      if (code) {
        const c = data.clienti.find(cl => cl.codice === code);
        if (c && (!c.pin || String(c.pin).trim() === String(pin).trim())) { setCliente(c); setLoggedIn(true); }
      }
    } catch (e) { }
  }, [data, loggedIn]);

  const handleLogout = useCallback(() => {
    setLoggedIn(false);
    setCliente(null);
    setTab("home");
    setSelDay(null);
    try { localStorage.removeItem("gb_code"); localStorage.removeItem("gb_pin"); } catch (e) { }
  }, []);

  const handleLog = useCallback((exercise, schedaId, weight) => {
    const k = `${exercise}__${schedaId}`;
    const d = new Date().toLocaleDateString("it-IT");
    setProgress(p => ({ ...p, [k]: [...(p[k] || []), { date: d, weight }] }));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={load} />;
  if (!loggedIn) return <LoginScreen config={data.config} onLogin={handleLogin} error={loginErr} />;

  return (
    <div style={{ width: "100%", margin: "0 auto", position: "relative", background: S.bg, minHeight: "100vh" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}html,body{background:${S.bg}}input::placeholder{color:#BDBDBD}::-webkit-scrollbar{width:0}button{-webkit-appearance:none}`}</style>
      {timer !== null && <RestTimer seconds={timer} onClose={() => setTimer(null)} />}
      {video && <VideoModal url={video} onClose={() => setVideo(null)} />}
      <div>
        {selDay
          ? <WorkoutDay seduta={selDay} esercizi={dayExs} onBack={() => setSelDay(null)} onTimer={setTimer} onVideo={setVideo} progressData={progress} onLog={handleLog} />
          : tab === "home" && scheda
            ? <Dashboard cliente={cliente} scheda={scheda} esercizi={data.esercizi} onSelectDay={setSelDay} onSync={load} lastSync={lastSync} />
            : tab === "home" && !scheda
              ? <div style={{ padding: "60px 24px", textAlign: "center" }}>
                  <AlertCircle size={44} color={S.red} style={{ margin: "0 auto 16px" }} />
                  <h2 style={{ color: S.text, fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Scheda non trovata</h2>
                  <p style={{ color: S.muted, fontSize: 14 }}>Contatta il tuo trainer.</p>
                </div>
              : tab === "progress"
                ? <ProgressView progressData={progress} esercizi={data.esercizi} schedaId={cliente?.scheda_attiva} />
                : tab === "history"
                  ? <HistoryView cliente={cliente} schede={data.schede} esercizi={data.esercizi} />
                  : tab === "profile"
                    ? <ProfileView cliente={cliente} config={data.config} servizi={data.servizi || []} onLogout={handleLogout} />
                    : null
        }
      </div>
      {!selDay && <Nav tab={tab} onNav={t => { setTab(t); setSelDay(null); }} />}
    </div>
  );
}
