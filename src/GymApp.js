import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users, LayoutDashboard, Dumbbell, Search, ChevronRight, ArrowLeft,
  Phone, Calendar, AlertCircle, Send, X, Plus, Trash2, Edit3,
  RefreshCw, CheckCircle, MessageCircle, ChevronDown, ChevronUp,
  Loader, History, Activity, BookOpen, Zap, Save, LogOut,
  ClipboardList, Printer, UserPlus, Eye, EyeOff, Lock, Settings
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIGURAZIONE
   ───────────────────────────────────────────── */
const SHEET_ID   = "144-i_O8EGeL51ku9oi7n44oS1KGQY2cutIrulSVDJcw";
const API_KEY    = "AIzaSyDEoQi1P3VVocd7Yokkw8by8PLWq-t1IV4";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5tKZ9pNCI4BqNLasU3XIFcl-RZYiQY799tUj7R_kNFlGmv3ucNPXPamylFGH0qXNS/exec";
const BASE_URL   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL    = "https://mastergymcanelli.vercel.app";

// Login credentials
const ADMIN_USER = "Mastergym";
const ADMIN_PASS = "1234";

/* ─────────────────────────────────────────────
   TEMPLATE SCHEDE
   ───────────────────────────────────────────── */
const TEMPLATES = [
  {
    id: "BASE1", nome: "Base 1 — Full Body", obiettivo: "Tonificazione generale",
    descrizione: "3 sedute · Principiante · Full Body", colore: "#10B981",
    sedute: ["Seduta 1 - Full Body A", "Seduta 2 - Full Body B", "Seduta 3 - Full Body C"],
    esercizi: [
      { seduta: "Seduta 1 - Full Body A", ordine: 1, muscolo: "Cardio",   esercizio: "Tappeto in salita",    ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 1 - Full Body A", ordine: 2, muscolo: "Gambe",    esercizio: "Pressa 45°",           ripetizioni: "12",    serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 1 - Full Body A", ordine: 3, muscolo: "Gambe",    esercizio: "Leg extension",        ripetizioni: "12-15", serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 1 - Full Body A", ordine: 4, muscolo: "Dorsali",  esercizio: "Lat machine",          ripetizioni: "10-12", serie: "3", recupero: "60", note: "Tira al petto" },
      { seduta: "Seduta 1 - Full Body A", ordine: 5, muscolo: "Cardio",   esercizio: "Ellittica",            ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 2 - Full Body B", ordine: 1, muscolo: "Cardio",   esercizio: "Bici",                 ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 2 - Full Body B", ordine: 2, muscolo: "Pettorali",esercizio: "Chest press",          ripetizioni: "10-12", serie: "3", recupero: "75", note: "" },
      { seduta: "Seduta 2 - Full Body B", ordine: 3, muscolo: "Spalle",   esercizio: "Alzate laterali",      ripetizioni: "12-15", serie: "3", recupero: "60", note: "Gomiti morbidi" },
      { seduta: "Seduta 2 - Full Body B", ordine: 4, muscolo: "Core",     esercizio: "Plank",                ripetizioni: "30s",   serie: "3", recupero: "45", note: "Core contratto" },
      { seduta: "Seduta 2 - Full Body B", ordine: 5, muscolo: "Cardio",   esercizio: "Step",                 ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 3 - Full Body C", ordine: 1, muscolo: "Spalle",   esercizio: "Rotatori spalle",      ripetizioni: "10",    serie: "3", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 3 - Full Body C", ordine: 2, muscolo: "Glutei",   esercizio: "Hip thrust",           ripetizioni: "12",    serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 3 - Full Body C", ordine: 3, muscolo: "Dorsali",  esercizio: "Pulley bassa triangolo",ripetizioni:"10-12", serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 3 - Full Body C", ordine: 4, muscolo: "Addome",   esercizio: "Crunch",               ripetizioni: "15",    serie: "3", recupero: "45", note: "" },
      { seduta: "Seduta 3 - Full Body C", ordine: 5, muscolo: "Cardio",   esercizio: "Tappeto in salita",    ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
    ],
  },
  {
    id: "BASE2", nome: "Base 2 — Upper/Lower", obiettivo: "Ipertrofia",
    descrizione: "4 sedute · Intermedio · Split Upper/Lower", colore: "#6366F1",
    sedute: ["Seduta 1 - Upper A", "Seduta 2 - Lower A", "Seduta 3 - Upper B", "Seduta 4 - Lower B"],
    esercizi: [
      { seduta: "Seduta 1 - Upper A", ordine: 1, muscolo: "Spalle",    esercizio: "Rotatori spalle",      ripetizioni: "10",   serie: "3", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 1 - Upper A", ordine: 2, muscolo: "Pettorali", esercizio: "Panca piana bilanciere",ripetizioni: "8-10",serie: "4", recupero: "120", note: "Scapole addotte", peso_suggerito: "60" },
      { seduta: "Seduta 1 - Upper A", ordine: 3, muscolo: "Dorsali",   esercizio: "Lat machine",          ripetizioni: "8-10", serie: "4", recupero: "90",  note: "Petto verso la sbarra" },
      { seduta: "Seduta 1 - Upper A", ordine: 4, muscolo: "Bicipiti",  esercizio: "Curl bilanciere",      ripetizioni: "10",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 1 - Upper A", ordine: 5, muscolo: "Tricipiti", esercizio: "Pushdown corda",       ripetizioni: "12",   serie: "3", recupero: "60",  note: "Gomiti fissi" },
      { seduta: "Seduta 2 - Lower A", ordine: 1, muscolo: "Cardio",    esercizio: "Tappeto in salita",    ripetizioni: "5'",   serie: "1", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 2 - Lower A", ordine: 2, muscolo: "Gambe",     esercizio: "Squat",                ripetizioni: "8-10", serie: "4", recupero: "120", note: "Full depth", peso_suggerito: "60" },
      { seduta: "Seduta 2 - Lower A", ordine: 3, muscolo: "Femorali",  esercizio: "Leg curl",             ripetizioni: "12",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Lower A", ordine: 4, muscolo: "Glutei",    esercizio: "Hip thrust",           ripetizioni: "12",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Lower A", ordine: 5, muscolo: "Addome",    esercizio: "Crunch inverso panchetta",ripetizioni:"15", serie: "3", recupero: "45",  note: "" },
      { seduta: "Seduta 3 - Upper B", ordine: 1, muscolo: "Spalle",    esercizio: "Rotatori spalle",      ripetizioni: "10",   serie: "3", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 3 - Upper B", ordine: 2, muscolo: "Pettorali", esercizio: "Panca inclinata manubri",ripetizioni:"10",  serie: "4", recupero: "90",  note: "30° inclinazione" },
      { seduta: "Seduta 3 - Upper B", ordine: 3, muscolo: "Dorsali",   esercizio: "Rematore manubrio",    ripetizioni: "10",   serie: "4", recupero: "90",  note: "Un braccio per volta" },
      { seduta: "Seduta 3 - Upper B", ordine: 4, muscolo: "Spalle",    esercizio: "Alzate laterali",      ripetizioni: "12-15",serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 3 - Upper B", ordine: 5, muscolo: "Tricipiti", esercizio: "Dips panchetta",       ripetizioni: "12",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 1, muscolo: "Cardio",    esercizio: "Bici",                 ripetizioni: "5'",   serie: "1", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 4 - Lower B", ordine: 2, muscolo: "Gambe",     esercizio: "Pressa 45°",           ripetizioni: "10-12",serie: "4", recupero: "90",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 3, muscolo: "Gambe",     esercizio: "Affondi alternati",    ripetizioni: "10",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 4, muscolo: "Gambe",     esercizio: "Adductor+Abductor",    ripetizioni: "15+15",serie: "3", recupero: "45",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 5, muscolo: "Cardio",    esercizio: "Ellittica",            ripetizioni: "10'",  serie: "1", recupero: "0",   note: "Defaticamento" },
    ],
  },
  {
    id: "BASE3", nome: "Base 3 — Circuit Training", obiettivo: "Dimagrimento",
    descrizione: "3 sedute · Intermedio · Circuito cardio+forza", colore: "#EF4444",
    sedute: ["Seduta 1 - Circuit A", "Seduta 2 - Circuit B", "Seduta 3 - Circuit C"],
    esercizi: [
      { seduta: "Seduta 1 - Circuit A", ordine: 1, muscolo: "Cardio",    esercizio: "Tappeto in salita",      ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 1 - Circuit A", ordine: 2, muscolo: "Full body",  esercizio: "Burpees",                ripetizioni: "10",    serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 1 - Circuit A", ordine: 3, muscolo: "Gambe",      esercizio: "Squat+Salto",            ripetizioni: "15",    serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 1 - Circuit A", ordine: 4, muscolo: "Core",       esercizio: "Mountain climber",       ripetizioni: "20",    serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 1 - Circuit A", ordine: 5, muscolo: "Cardio",     esercizio: "Ellittica",              ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 2 - Circuit B", ordine: 1, muscolo: "Cardio",     esercizio: "Bici",                   ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 2 - Circuit B", ordine: 2, muscolo: "Gambe",      esercizio: "Pressa 45°",             ripetizioni: "15",    serie: "4", recupero: "45", note: "Full ROM" },
      { seduta: "Seduta 2 - Circuit B", ordine: 3, muscolo: "Femorali",   esercizio: "Leg curl",               ripetizioni: "15",    serie: "3", recupero: "45", note: "" },
      { seduta: "Seduta 2 - Circuit B", ordine: 4, muscolo: "Gambe",      esercizio: "Adductor+Abductor",      ripetizioni: "15+15", serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 2 - Circuit B", ordine: 5, muscolo: "Cardio",     esercizio: "Step",                   ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 3 - Circuit C", ordine: 1, muscolo: "Spalle",     esercizio: "Rotatori spalle",        ripetizioni: "10",    serie: "3", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 3 - Circuit C", ordine: 2, muscolo: "Pettorali",  esercizio: "Chest press+Croci cavi", ripetizioni: "10+10", serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 3 - Circuit C", ordine: 3, muscolo: "Dorsali",    esercizio: "Lat tb+Curl cavo basso", ripetizioni: "10+12", serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 3 - Circuit C", ordine: 4, muscolo: "Core",       esercizio: "Plank+Crunch",           ripetizioni: "30s+15",serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 3 - Circuit C", ordine: 5, muscolo: "Cardio",     esercizio: "Tappeto in salita",      ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
    ],
  },
  {
    id: "BASE4", nome: "Base 4 — Forza", obiettivo: "Forza e massa",
    descrizione: "3 sedute · Avanzato · Push/Pull/Legs", colore: "#F59E0B",
    sedute: ["Seduta 1 - Push", "Seduta 2 - Pull", "Seduta 3 - Legs"],
    esercizi: [
      { seduta: "Seduta 1 - Push",  ordine: 1, muscolo: "Pettorali", esercizio: "Panca piana bilanciere",  ripetizioni: "5",     serie: "5", recupero: "180", note: "Movimento esplosivo", peso_suggerito: "80" },
      { seduta: "Seduta 1 - Push",  ordine: 2, muscolo: "Pettorali", esercizio: "Panca inclinata manubri", ripetizioni: "6-8",   serie: "4", recupero: "120", note: "" },
      { seduta: "Seduta 1 - Push",  ordine: 3, muscolo: "Spalle",    esercizio: "Lento avanti manubri",    ripetizioni: "8-10",  serie: "4", recupero: "90",  note: "" },
      { seduta: "Seduta 1 - Push",  ordine: 4, muscolo: "Spalle",    esercizio: "Alzate laterali",         ripetizioni: "12-15", serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 1 - Push",  ordine: 5, muscolo: "Tricipiti", esercizio: "Pushdown corda",          ripetizioni: "12",    serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 1, muscolo: "Dorsali",   esercizio: "Trazioni easypower",      ripetizioni: "6-8",   serie: "4", recupero: "120", note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 2, muscolo: "Dorsali",   esercizio: "Rematore manubrio",       ripetizioni: "8",     serie: "4", recupero: "90",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 3, muscolo: "Dorsali",   esercizio: "Pulley bassa triangolo",  ripetizioni: "10",    serie: "3", recupero: "75",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 4, muscolo: "Bicipiti",  esercizio: "Curl bilanciere",         ripetizioni: "8-10",  serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 5, muscolo: "Bicipiti",  esercizio: "Curl alternato manubri",  ripetizioni: "10",    serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 3 - Legs",  ordine: 1, muscolo: "Cardio",    esercizio: "Tappeto in salita",       ripetizioni: "5'",    serie: "1", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 3 - Legs",  ordine: 2, muscolo: "Gambe",     esercizio: "Squat",                   ripetizioni: "5",     serie: "5", recupero: "180", note: "Profondità completa", peso_suggerito: "80" },
      { seduta: "Seduta 3 - Legs",  ordine: 3, muscolo: "Gambe",     esercizio: "Pressa 45°",              ripetizioni: "8-10",  serie: "4", recupero: "120", note: "" },
      { seduta: "Seduta 3 - Legs",  ordine: 4, muscolo: "Femorali",  esercizio: "Leg curl",                ripetizioni: "12",    serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 3 - Legs",  ordine: 5, muscolo: "Glutei",    esercizio: "Hip thrust",              ripetizioni: "12",    serie: "3", recupero: "60",  note: "" },
    ],
  },
];

/* ─────────────────────────────────────────────
   DATA FETCHING
   ───────────────────────────────────────────── */
async function fetchSheet(tabName) {
  const url = `${BASE_URL}/${encodeURIComponent(tabName)}?key=${API_KEY}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Errore ${res.status} sul foglio "${tabName}"`);
  const json = await res.json();
  const [headers, ...rows] = json.values || [];
  if (!headers) return [];
  return rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}

async function fetchAllData() {
  const [configRows, clienti, schede, esercizi, libreria] = await Promise.all([
    fetchSheet("config"), fetchSheet("clienti"), fetchSheet("schede"),
    fetchSheet("esercizi"), fetchSheet("libreria_esercizi"),
  ]);
  let servizi = [];
  try { servizi = await fetchSheet("servizi"); } catch(e) {}
  const config = Object.fromEntries(configRows.map(r => [r.chiave, r.valore]));
  return { config, clienti, schede, esercizi, libreria, servizi };
}

async function writeViaScript(action, payload) {
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body,
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Errore scrittura: ${res.status}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { status: "ok" }; }
}

/* ─────────────────────────────────────────────
   UTILS
   ───────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

const daysUntil = (d) => {
  if (!d) return 999;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const genId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const today = () => new Date().toISOString().split("T")[0];
const inMonths = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().split("T")[0];
};

/* ─────────────────────────────────────────────
   THEME
   ───────────────────────────────────────────── */
const T = {
  bg: "#F4F4F6", card: "#FFFFFF", border: "#E5E5EB",
  text: "#111827", textSec: "#6B7280", textMut: "#9CA3AF",
  primary: "#FF6B00", primaryLight: "#FFF3EB", primaryBorder: "#FFD4B0",
  danger: "#EF4444", dangerLight: "#FEF2F2",
  success: "#10B981", successLight: "#ECFDF5",
  warning: "#F59E0B", warningLight: "#FFFBEB",
  sidebar: "#18181B", sidebarBorder: "#27272A",
};

/* ─────────────────────────────────────────────
   MODAL HELPERS
   ───────────────────────────────────────────── */
function Overlay({ children, zIndex = 1000 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {children}
    </div>
  );
}
function ModalBox({ children, maxWidth = 500, maxHeight = "82vh" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth, maxHeight, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
      {children}
    </div>
  );
}
function ModalHeader({ title, icon, onClose, left }) {
  return (
    <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {left}{icon}
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</span>
      </div>
      {onClose && <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={19} /></button>}
    </div>
  );
}
function ModalFooter({ children }) {
  return <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>{children}</div>;
}
function BtnPrimary({ onClick, children, disabled, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: T.primary, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: (disabled || loading) ? 0.7 : 1, display: "flex", alignItems: "center", gap: 7 }}>
      {loading ? <><Loader size={14} /> Salvo...</> : children}
    </button>
  );
}
function BtnSecondary({ onClick, children }) {
  return <button onClick={onClick} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${T.border}`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text }}>{children}</button>;
}
function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5, letterSpacing: "0.4px" }}>{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }} />;
}
function Badge({ color, bg, children }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, color, background: bg, whiteSpace: "nowrap" }}>{children}</span>;
}
function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: T.textSec }}>
      <Icon size={32} color={T.textMut} style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 13.5, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>{msg}</p>
    </div>
  );
}
function SectionBox({ title, icon, badge, action, children }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "15px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text, flex: 1 }}>{title}</span>
        {badge && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: T.bg, color: T.textSec }}>{badge}</span>}
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <Overlay zIndex={1100}>
      <ModalBox maxWidth={380}>
        <div style={{ padding: 28 }}>
          <AlertCircle size={32} color={T.danger} style={{ marginBottom: 14 }} />
          <p style={{ fontSize: 15, color: T.text, marginBottom: 22, lineHeight: 1.5 }}>{message}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <BtnSecondary onClick={onCancel}>Annulla</BtnSecondary>
            <button onClick={onConfirm} disabled={loading} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: T.danger, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "Elimina"}
            </button>
          </div>
        </div>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   LOGIN SCREEN
   ───────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      onLogin();
    } else {
      setError("Username o password errati");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.card, borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Dumbbell size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>GymBoard Admin</div>
          <div style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>Accedi al pannello di gestione</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="USERNAME">
            <Input value={user} onChange={setUser} placeholder="Username" />
          </Field>
          <Field label="PASSWORD">
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}
            />
          </Field>

          {error && <p style={{ fontSize: 12, color: T.danger, textAlign: "center", margin: 0 }}>{error}</p>}

          <button onClick={handleLogin} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
            Accedi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────── */
function Sidebar({ active, onNavigate, config, onLogout }) {
  const items = [
    { id: "dashboard",     icon: LayoutDashboard, label: "Dashboard"     },
    { id: "clienti",       icon: Users,           label: "Clienti"       },
    { id: "schede",        icon: ClipboardList,   label: "Schede"        },
    { id: "esercizi",      icon: Dumbbell,        label: "Esercizi"      },
    { id: "impostazioni",  icon: Settings,        label: "Palestra"      },
  ];
  return (
    <div style={{ width: 232, minHeight: "100vh", background: T.sidebar, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: `1px solid ${T.sidebarBorder}` }}>
      <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Dumbbell size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{config?.nome_palestra || "GymBoard"}</div>
            <div style={{ color: "#71717A", fontSize: 10, marginTop: 2 }}>Pannello Admin</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {items.map(({ id, icon: Icon, label }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", marginBottom: 3, background: on ? T.primary : "transparent", color: on ? "#fff" : "#A1A1AA", fontWeight: on ? 700 : 500, fontSize: 13.5, transition: "all 0.15s" }}>
              <Icon size={17} strokeWidth={on ? 2.5 : 1.8} />{label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "12px 10px", borderTop: `1px solid ${T.sidebarBorder}` }}>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "#71717A", fontSize: 13.5, fontWeight: 500 }}>
          <LogOut size={17} strokeWidth={1.8} /> Esci
        </button>
        <div style={{ color: "#52525B", fontSize: 10, padding: "8px 14px 0" }}>GymBoard v5 · by Marta</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${T.border}`, flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: T.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: T.textSec, marginTop: 5 }}>{label}</div>
      </div>
    </div>
  );
}

function NavCard({ icon: Icon, label, sub, color, bg, onClick }) {
  return (
    <button onClick={onClick} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 30px", cursor: "pointer", textAlign: "left", flex: "1 1 220px", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 20 }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={26} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{label}</div>
        <div style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>{sub}</div>
      </div>
      <ChevronRight size={20} color={T.textMut} style={{ marginLeft: "auto" }} />
    </button>
  );
}

/* ─────────────────────────────────────────────
   WHATSAPP MODAL
   ───────────────────────────────────────────── */
function WAModal({ cliente, onClose }) {
  const [copied, setCopied] = useState(false);
  const msg = `🏋️ *${cliente.palestra || "Master Gym"} — La tua scheda!*\n\nCiao ${cliente.nome}! Da oggi puoi vedere la tua scheda dal telefono.\n\n📲 *Link:* ${APP_URL}\n🔑 Codice: *${cliente.codice}*\n🔒 PIN: *${cliente.pin}*\n\n━━━━━━━━━━━━━━━\n💡 Per averla come app: apri il link con Safari (iPhone) o Chrome (Android) → Aggiungi alla schermata Home.\n\nBuon allenamento! 💪`;
  const waUrl = cliente.telefono ? `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}` : null;
  const copy = () => { navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <Overlay>
      <ModalBox maxWidth={500}>
        <ModalHeader title={`Messaggio per ${cliente.nome}`} icon={<MessageCircle size={19} color="#25D366" />} onClose={onClose} />
        <div style={{ padding: "18px 22px", overflow: "auto", flex: 1 }}>
          <pre style={{ background: T.bg, borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.65, color: "#333", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{msg}</pre>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={copy}>{copied ? "✅ Copiato!" : "📋 Copia"}</BtnSecondary>
          {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Send size={14} /> Apri WhatsApp</a>}
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   CLIENTE FORM MODAL (aggiunta/modifica)
   ───────────────────────────────────────────── */
function genCodiceCliente(clienti) {
  const nums = clienti.map(c => parseInt((c.codice || "").replace(/\D/g, ""))).filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `MG-${String(next).padStart(3, "0")}`;
}

function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function ClienteFormModal({ cliente, onClose, onSaved, clienti = [] }) {
  const isEdit = !!cliente;
  const [form, setForm] = useState(cliente || { codice: genCodiceCliente(clienti), nome: "", cognome: "", pin: genPin(), telefono: "", email: "", data_iscrizione: today(), scheda_attiva: "", schede_passate: "", obiettivo: "" });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.codice || !form.nome || !form.cognome) { alert("Codice, nome e cognome sono obbligatori"); return; }
    setSaving(true);
    try {
      await writeViaScript(isEdit ? "updateCliente" : "addCliente", { cliente: form });
      await onSaved();
      onClose();
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  return (
    <Overlay>
      <ModalBox maxWidth={580}>
        <ModalHeader title={isEdit ? `Modifica ${form.nome} ${form.cognome}` : "Nuovo cliente"} onClose={onClose} />
        <div style={{ padding: "20px 24px", overflow: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="CODICE *"><Input value={form.codice} onChange={v => set("codice", v)} placeholder="Es: MG-006" /></Field>
            <Field label="PIN"><Input value={form.pin} onChange={v => set("pin", v)} placeholder="Es: 1234" /></Field>
            <Field label="DATA ISCRIZIONE"><Input type="date" value={form.data_iscrizione} onChange={v => set("data_iscrizione", v)} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="NOME *"><Input value={form.nome} onChange={v => set("nome", v)} placeholder="Es: Marco" /></Field>
            <Field label="COGNOME *"><Input value={form.cognome} onChange={v => set("cognome", v)} placeholder="Es: Rossi" /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="TELEFONO"><Input value={form.telefono} onChange={v => set("telefono", v)} placeholder="+39 333 0000000" /></Field>
            <Field label="EMAIL"><Input value={form.email} onChange={v => set("email", v)} placeholder="email@esempio.com" /></Field>
          </div>
          <Field label="OBIETTIVO">
            <Input value={form.obiettivo} onChange={v => set("obiettivo", v)} placeholder="Es: Tonificazione" />
          </Field>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={onClose}>Annulla</BtnSecondary>
          <BtnPrimary onClick={handleSave} loading={saving}><Save size={14} /> {isEdit ? "Salva modifiche" : "Aggiungi cliente"}</BtnPrimary>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   ESERCIZI TABLE
   ───────────────────────────────────────────── */
function EserciziTable({ esercizi }) {
  if (!esercizi.length) return <p style={{ fontSize: 13, color: T.textSec }}>Nessun esercizio.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>{["#", "Esercizio", "Serie", "Reps", "Peso", "Rec.", "Muscolo"].map(h => <th key={h} style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: T.textMut, textAlign: "left" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {esercizi.map((ex, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}44` }}>
              <td style={{ padding: "9px 10px", color: T.textMut, width: 28 }}>{ex.ordine || i + 1}</td>
              <td style={{ padding: "9px 10px", fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.serie || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.ripetizioni || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.primary, fontWeight: 600 }}>{ex.peso_suggerito ? `${ex.peso_suggerito} kg` : "—"}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.recupero ? `${ex.recupero}s` : ex.riposo_sec ? `${ex.riposo_sec}s` : "—"}</td>
              <td style={{ padding: "9px 10px", color: T.textSec }}>{ex.muscolo || ex.gruppo_muscolare || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAMPA SCHEDA
   ───────────────────────────────────────────── */
function printScheda(scheda, esercizi, cliente) {
  const sedute = [...new Set(esercizi.map(e => e.seduta || e.giorno))].filter(Boolean);
  const html = `
    <html><head><title>Scheda ${scheda.nome_scheda}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
      h1 { font-size: 22px; margin-bottom: 4px; color: #FF6B00; }
      .meta { font-size: 13px; color: #666; margin-bottom: 24px; }
      .cliente { background: #FFF3EB; padding: 10px 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
      .seduta { margin-bottom: 20px; }
      .seduta-title { font-size: 14px; font-weight: bold; color: #FF6B00; background: #FFF3EB; padding: 6px 12px; border-radius: 6px; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #f4f4f6; padding: 7px 10px; text-align: left; font-weight: 700; color: #666; border-bottom: 2px solid #e5e5eb; }
      td { padding: 7px 10px; border-bottom: 1px solid #e5e5eb; }
      @media print { body { padding: 10px; } }
    </style></head><body>
    <h1>${scheda.nome_scheda}</h1>
    <div class="meta">${scheda.obiettivo || ""} · Dal ${fmt(scheda.data_creazione)} al ${fmt(scheda.data_scadenza)}</div>
    ${cliente ? `<div class="cliente">👤 <b>${cliente.nome} ${cliente.cognome}</b> · Codice: ${cliente.codice}</div>` : ""}
    ${sedute.map(s => {
      const exs = esercizi.filter(e => (e.seduta || e.giorno) === s).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
      return `<div class="seduta">
        <div class="seduta-title">${s}</div>
        <table><thead><tr><th>#</th><th>Esercizio</th><th>Serie</th><th>Reps</th><th>Peso</th><th>Rec.</th><th>Note</th></tr></thead>
        <tbody>${exs.map((ex, i) => `<tr>
          <td>${ex.ordine || i + 1}</td>
          <td><b>${ex.esercizio}</b></td>
          <td>${ex.serie || "—"}</td>
          <td>${ex.ripetizioni || "—"}</td>
          <td>${ex.peso_suggerito ? ex.peso_suggerito + " kg" : "—"}</td>
          <td>${ex.recupero ? ex.recupero + "s" : "—"}</td>
          <td>${ex.note || ""}</td>
        </tr>`).join("")}</tbody></table>
      </div>`;
    }).join("")}
    <p style="font-size:11px;color:#999;margin-top:30px;">Stampato da GymBoard Admin</p>
    </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.print();
}

/* ─────────────────────────────────────────────
   DASHBOARD VIEW
   ───────────────────────────────────────────── */
function DashboardView({ data, onNavigate }) {
  const { clienti, schede, esercizi } = data;
  const stats = useMemo(() => {
    const inScadenza = clienti.filter(c => { const s = schede.find(sc => sc.scheda_id === c.scheda_attiva); const d = daysUntil(s?.data_scadenza); return d <= 7 && d > 0; }).length;
    return { totClienti: clienti.length, inScadenza, schedeAttive: schede.length, totEsercizi: esercizi.length };
  }, [clienti, schede, esercizi]);

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>Panoramica della palestra</p>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard icon={Users}       label="Clienti attivi"    value={stats.totClienti}  color={T.primary} bg={T.primaryLight} />
        <StatCard icon={AlertCircle} label="Schede in scadenza" value={stats.inScadenza} color={T.danger}  bg={T.dangerLight} />
        <StatCard icon={BookOpen}    label="Schede create"     value={stats.schedeAttive} color="#6366F1"   bg="#EEF2FF" />
        <StatCard icon={Dumbbell}    label="Esercizi totali"   value={stats.totEsercizi}  color={T.success} bg={T.successLight} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <NavCard icon={Users}        label="Clienti"  color={T.primary} bg={T.primaryLight}  sub={`${stats.totClienti} clienti`}  onClick={() => onNavigate("clienti")} />
        <NavCard icon={ClipboardList} label="Schede"  color="#6366F1"   bg="#EEF2FF"          sub={`${stats.schedeAttive} schede`} onClick={() => onNavigate("schede")} />
        <NavCard icon={Dumbbell}     label="Esercizi" color={T.success} bg={T.successLight}   sub={`${stats.totEsercizi} esercizi`} onClick={() => onNavigate("esercizi")} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENTI VIEW
   ───────────────────────────────────────────── */
function ClientiView({ data, onSelectCliente, onRefresh }) {
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editCliente, setEditCliente] = useState(null);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [delLoading, setDelLoading]   = useState(false);
  const { clienti, schede } = data;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clienti;
    return clienti.filter(c => `${c.nome} ${c.cognome} ${c.codice}`.toLowerCase().includes(q));
  }, [clienti, search]);

  const handleDelete = async () => {
    setDelLoading(true);
    try { await writeViaScript("deleteCliente", { codice: confirmDel }); await onRefresh(); setConfirmDel(null); }
    catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  return (
    <div>
      {confirmDel && <ConfirmModal message="Eliminare questo cliente?" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={delLoading} />}
      {(showForm || editCliente) && <ClienteFormModal cliente={editCliente} clienti={clienti} onClose={() => { setShowForm(false); setEditCliente(null); }} onSaved={onRefresh} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Clienti</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>{clienti.length} clienti registrati</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>
          <UserPlus size={17} /> Aggiungi cliente
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 11, padding: "10px 16px", marginBottom: 20 }}>
        <Search size={17} color={T.textMut} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per nome, cognome o codice..." style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: T.text, background: "transparent" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={15} /></button>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.map(c => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          const days = daysUntil(scheda?.data_scadenza);
          const expired = days <= 0 && scheda;
          const expiring = days > 0 && days <= 7;
          return (
            <div key={c.codice} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: T.primary, flexShrink: 0 }}>
                  {c.nome?.[0]}{c.cognome?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{c.nome} {c.cognome}</div>
                  <div style={{ fontSize: 11.5, color: T.textMut, fontWeight: 600 }}>{c.codice} · PIN: {c.pin}</div>
                </div>
                {expiring && <Badge color={T.warning} bg={T.warningLight}>{days}g</Badge>}
                {expired  && <Badge color={T.danger}  bg={T.dangerLight}>Scaduta</Badge>}
              </div>

              <div style={{ background: T.bg, borderRadius: 9, padding: "9px 12px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{scheda?.nome_scheda || "Nessuna scheda"}</div>
                {scheda && <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>Scade: {fmt(scheda.data_scadenza)}</div>}
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onSelectCliente(c)} style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.primaryLight, cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <Eye size={13} /> Dettaglio
                </button>
                <button onClick={() => setEditCliente(c)} style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#EEF2FF", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#6366F1", display: "flex", alignItems: "center", gap: 5 }}>
                  <Edit3 size={13} /> Modifica
                </button>
                <button onClick={() => setConfirmDel(c.codice)} style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger, display: "flex", alignItems: "center", gap: 5 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENTE DETAIL
   ───────────────────────────────────────────── */
function ClienteDetail({ cliente, data, onBack, onWhatsApp, onRefresh }) {
  const { schede, esercizi } = data;
  const schedaAttiva = schede.find(s => s.scheda_id === cliente.scheda_attiva);
  const schedePassate = useMemo(() => {
    if (!cliente.schede_passate) return [];
    return cliente.schede_passate.split(",").map(id => id.trim()).filter(Boolean).map(id => schede.find(s => s.scheda_id === id)).filter(Boolean);
  }, [cliente.schede_passate, schede]);

  const exForScheda = id => esercizi.filter(e => e.scheda_id === id).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
  const [openGiorni,  setOpenGiorni]  = useState({});
  const [openPassate, setOpenPassate] = useState({});
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [delLoading,  setDelLoading]  = useState(false);
  const [editMode,    setEditMode]    = useState(false);
  const [savingEdit,  setSavingEdit]  = useState(false);

  const handleDeletePassata = async () => {
    setDelLoading(true);
    try { await writeViaScript("deleteSchedaPassata", { codiceCliente: cliente.codice, schedaId: confirmDel }); await onRefresh(); setConfirmDel(null); }
    catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  const handleSaveEdit = async (info, exs) => {
    if (!schedaAttiva) return;
    setSavingEdit(true);
    try {
      // 1. Aggiorna i dati della scheda (nome, date, obiettivo)
      await writeViaScript("updateScheda", {
        scheda: {
          scheda_id: schedaAttiva.scheda_id,
          nome_scheda: info.nome_scheda,
          obiettivo: info.obiettivo,
          data_creazione: info.data_inizio,
          data_scadenza: info.data_scadenza,
          note_trainer: info.note_trainer,
        }
      });
      // 2. Elimina esercizi vecchi
      await writeViaScript("deleteSchedaEsercizi", { schedaId: schedaAttiva.scheda_id });
      // 3. Riscrivi esercizi aggiornati
      await writeViaScript("addEserciziMultipli", {
        esercizi: exs.map(({ _id, ...e }) => ({ ...e, scheda_id: schedaAttiva.scheda_id }))
      });
      await onRefresh();
      setEditMode(false);
    } catch (err) { alert("Errore salvataggio: " + err.message); }
    finally { setSavingEdit(false); }
  };

  const days = daysUntil(schedaAttiva?.data_scadenza);

  return (
    <div>
      {confirmDel && <ConfirmModal message={`Eliminare la scheda "${schede.find(s => s.scheda_id === confirmDel)?.nome_scheda}"?`} onConfirm={handleDeletePassata} onCancel={() => setConfirmDel(null)} loading={delLoading} />}

      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Torna alla lista
      </button>

      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "22px 24px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: 13, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800, color: T.primary, flexShrink: 0 }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>{cliente.nome} {cliente.cognome}</h2>
            <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 3 }}>Codice: <b style={{ color: T.text }}>{cliente.codice}</b> · PIN: <b style={{ color: T.text }}>{cliente.pin}</b></div>
          </div>
          <button onClick={() => onWhatsApp(cliente)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Send size={14} /> WhatsApp
          </button>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {cliente.telefono && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Phone size={13} color={T.textSec} /><span style={{ fontSize: 13, color: T.textSec }}>{cliente.telefono}</span></div>}
          {cliente.data_iscrizione && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Calendar size={13} color={T.textSec} /><span style={{ fontSize: 13, color: T.textSec }}>Iscritto: {fmt(cliente.data_iscrizione)}</span></div>}
        </div>
      </div>

      <SectionBox title="Scheda attiva" icon="🟢"
        action={schedaAttiva && (
          <div style={{ display: "flex", gap: 8 }}>
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: T.primaryLight, color: T.primary, border: `1px solid ${T.primaryBorder}`, borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <Edit3 size={14} /> Modifica
              </button>
            )}
            <button onClick={() => printScheda(schedaAttiva, exForScheda(schedaAttiva.scheda_id), cliente)} style={{ display: "flex", alignItems: "center", gap: 6, background: T.bg, color: T.textSec, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              <Printer size={14} /> Stampa
            </button>
          </div>
        )}
      >
        {editMode && schedaAttiva ? (
          <EditorScheda
            scheda={schedaAttiva}
            esercizi={exForScheda(schedaAttiva.scheda_id)}
            libreria={data.libreria || []}
            clienti={data.clienti}
            cliente={cliente}
            onSave={handleSaveEdit}
            onCancel={() => setEditMode(false)}
            saving={savingEdit}
          />
        ) : schedaAttiva ? (
          <div>
            <div style={{ background: T.bg, borderRadius: 10, padding: "13px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{schedaAttiva.nome_scheda}</div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>{schedaAttiva.obiettivo} · {fmt(schedaAttiva.data_creazione)} → {fmt(schedaAttiva.data_scadenza)}</div>
              </div>
              {days <= 7 && <Badge color={days > 0 ? T.warning : T.danger} bg={days > 0 ? T.warningLight : T.dangerLight}>{days > 0 ? `Scade tra ${days} giorni` : "Scaduta"}</Badge>}
            </div>
            {[...new Set(exForScheda(schedaAttiva.scheda_id).map(e => e.seduta || e.giorno))].filter(Boolean).map(g => {
              const dayEx = exForScheda(schedaAttiva.scheda_id).filter(e => (e.seduta || e.giorno) === g);
              const open = openGiorni[g];
              return (
                <div key={g} style={{ border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                  <button onClick={() => setOpenGiorni(p => ({ ...p, [g]: !p[g] }))} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: T.bg, border: "none", cursor: "pointer" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: T.primary }}>{g}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11.5, color: T.textMut }}>{dayEx.length} esercizi</span>
                      {open ? <ChevronUp size={15} color={T.textMut} /> : <ChevronDown size={15} color={T.textMut} />}
                    </div>
                  </button>
                  {open && <div style={{ padding: "10px 14px" }}><EserciziTable esercizi={dayEx} /></div>}
                </div>
              );
            })}
          </div>
        ) : <EmptyState icon={BookOpen} msg="Nessuna scheda attiva. Vai nel dettaglio cliente e crea una nuova scheda." />}
      </SectionBox>

      <SectionBox title="Schede passate" icon="🔘" badge={schedePassate.length > 0 ? `${schedePassate.length}` : undefined}>
        {schedePassate.length === 0 ? <EmptyState icon={History} msg="Nessuna scheda passata." /> : schedePassate.map(s => (
          <div key={s.scheda_id} style={{ border: `1px solid ${T.border}`, borderRadius: 11, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: T.bg }}>
              <button onClick={() => setOpenPassate(p => ({ ...p, [s.scheda_id]: !p[s.scheda_id] }))} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", flex: 1, textAlign: "left" }}>
                {openPassate[s.scheda_id] ? <ChevronUp size={16} color={T.textMut} /> : <ChevronDown size={16} color={T.textMut} />}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.nome_scheda}</div>
                  <div style={{ fontSize: 11.5, color: T.textSec }}>{s.obiettivo} · {fmt(s.data_creazione)} → {fmt(s.data_scadenza)}</div>
                </div>
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => printScheda(s, exForScheda(s.scheda_id), cliente)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.textSec }}><Printer size={12} /></button>
                <button onClick={() => setConfirmDel(s.scheda_id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger }}><Trash2 size={12} /> Elimina</button>
              </div>
            </div>
            {openPassate[s.scheda_id] && <div style={{ padding: "14px 16px" }}><EserciziTable esercizi={exForScheda(s.scheda_id)} /></div>}
          </div>
        ))}
      </SectionBox>

      <SectionBox title="Progressi" icon="📈">
        <EmptyState icon={Activity} msg="I progressi vengono salvati localmente nell'app del cliente." />
      </SectionBox>
    </div>
  );
}


/* ─────────────────────────────────────────────
   EDITOR SCHEDA — usato sia per nuova che modifica
   ───────────────────────────────────────────── */
function EditorScheda({ scheda, esercizi: esErca, libreria, clienti, cliente, onSave, onCancel, saving }) {
  const today2 = new Date().toISOString().split("T")[0];
  const in2m   = new Date(Date.now() + 60 * 24 * 3600000).toISOString().split("T")[0];

  const [info, setInfo] = useState({
    nome_scheda:    scheda?.nome_scheda   || "",
    obiettivo:      scheda?.obiettivo     || "",
    data_inizio:    scheda?.data_creazione || today2,
    data_scadenza:  scheda?.data_scadenza  || in2m,
    note_trainer:   scheda?.note_trainer   || "",
    cliente_codice: cliente?.codice        || "",
  });

  const [exs, setExs] = useState(() =>
    (esErca || []).map((e, i) => ({ ...e, seduta: e.seduta || e.giorno || "Seduta 1", _id: i }))
  );
  const [searchEx, setSearchEx] = useState("");
  const [searchBySed, setSearchBySed] = useState({});

  const sedute = useMemo(() => [...new Set(exs.map(e => e.seduta))].filter(Boolean), [exs]);

  // Libreria raggruppata per muscolo
  const libByMuscolo = useMemo(() => {
    const g = {};
    libreria.forEach(e => {
      const k = e.muscolo || "Altro";
      if (!g[k]) g[k] = [];
      g[k].push(e);
    });
    return g;
  }, [libreria]);

  const getLibFiltered = (q) => {
    if (!q) return libreria.slice(0, 40);
    return libreria.filter(e => `${e.esercizio} ${e.muscolo}`.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  };

  const updateEx = (id, field, value) => setExs(prev => prev.map(e => e._id === id ? { ...e, [field]: value } : e));
  const removeEx = id => setExs(prev => prev.filter(e => e._id !== id));

  // Sposta esercizio su/giù - usa swap diretto nell'array
  const moveEx = (id, dir) => {
    setExs(prev => {
      const sed = prev.find(e => e._id === id)?.seduta;
      const others = prev.filter(e => e.seduta !== sed);
      const inSed = [...prev.filter(e => e.seduta === sed)];
      const idx = inSed.findIndex(e => e._id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= inSed.length) return prev;
      // Swap diretto
      [inSed[idx], inSed[newIdx]] = [inSed[newIdx], inSed[idx]];
      // Ricalcola ordine
      const reordered = inSed.map((e, i) => ({ ...e, ordine: i + 1 }));
      return [...others, ...reordered];
    });
  };

  const addFromLib = (ex, sedutaTarget, position) => {
    const target = sedutaTarget || sedute[0] || "Seduta 1";
    const inSed = exs.filter(e => e.seduta === target);
    const ordine = position !== undefined ? position : inSed.length + 1;
    const newEx = {
      esercizio: ex.esercizio, muscolo: ex.muscolo, seduta: target,
      serie: "3", ripetizioni: "10-12", recupero: "60", peso_suggerito: "", note: "",
      ordine, _id: Date.now() + Math.random()
    };
    if (position !== undefined) {
      // Inserisci alla posizione specificata e riscala gli altri
      setExs(prev => {
        const others = prev.filter(e => e.seduta === target);
        const rest = prev.filter(e => e.seduta !== target);
        const updated = others.map(e => ({
          ...e, ordine: parseInt(e.ordine) >= ordine ? parseInt(e.ordine) + 1 : parseInt(e.ordine)
        }));
        return [...rest, ...updated, newEx];
      });
    } else {
      setExs(prev => [...prev, newEx]);
    }
  };

  const addSeduta = () => {
    const n = sedute.length + 1;
    setExs(prev => [...prev, {
      esercizio: "Nuovo esercizio", muscolo: "", seduta: `Seduta ${n}`,
      serie: "3", ripetizioni: "10-12", recupero: "60", peso_suggerito: "", note: "",
      ordine: 1, _id: Date.now()
    }]);
  };

  const removeSeduta = (sed) => {
    if (!window.confirm(`Eliminare "${sed}" con tutti i suoi esercizi?`)) return;
    setExs(prev => {
      const remaining = prev.filter(e => e.seduta !== sed);
      // Rinomina sedute rimanenti in ordine
      const sedRimanenti = [...new Set(remaining.map(e => e.seduta))].filter(Boolean);
      return remaining.map(e => {
        const idx = sedRimanenti.indexOf(e.seduta);
        const nuovaSeduta = `Seduta ${idx + 1}`;
        return { ...e, seduta: nuovaSeduta };
      });
    });
  };

  // Sostituzione esercizio con dropdown libreria
  const [showDropdown, setShowDropdown] = useState(null);

  return (
    <div>
      {/* INFO SCHEDA */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.textSec, letterSpacing: "0.5px", marginBottom: 14 }}>INFO SCHEDA</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="NOME SCHEDA *"><Input value={info.nome_scheda} onChange={v => setInfo(p => ({ ...p, nome_scheda: v }))} placeholder="Es: Tonificazione Marco" /></Field>
          <Field label="OBIETTIVO"><Input value={info.obiettivo} onChange={v => setInfo(p => ({ ...p, obiettivo: v }))} placeholder="Es: Tonificazione" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="DATA INIZIO"><Input type="date" value={info.data_inizio} onChange={v => setInfo(p => ({ ...p, data_inizio: v }))} /></Field>
          <Field label="DATA SCADENZA"><Input type="date" value={info.data_scadenza} onChange={v => setInfo(p => ({ ...p, data_scadenza: v }))} /></Field>
          <Field label="NOTE TRAINER"><Input value={info.note_trainer} onChange={v => setInfo(p => ({ ...p, note_trainer: v }))} placeholder="Note generali..." /></Field>
        </div>
        {!cliente && (
          <Field label="ASSEGNA A CLIENTE *">
            <select value={info.cliente_codice} onChange={e => setInfo(p => ({ ...p, cliente_codice: e.target.value }))}
              style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}>
              <option value="">Seleziona cliente...</option>
              {clienti.map(c => <option key={c.codice} value={c.codice}>{c.nome} {c.cognome} ({c.codice})</option>)}
            </select>
          </Field>
        )}
      </div>

      {/* ESERCIZI PER SEDUTA */}
      {sedute.map(sed => {
        const sedExs = exs.filter(e => e.seduta === sed).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
        const q = searchBySed[sed] || "";
        const libSed = getLibFiltered(q);
        return (
          <div key={sed} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.primary, letterSpacing: "0.5px", textTransform: "uppercase" }}>{sed}</div>
              <button onClick={() => removeSeduta(sed)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 11, fontWeight: 600, color: T.danger }}>
                <Trash2 size={11} /> Rimuovi seduta
              </button>
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              {/* Header colonne */}
              <div style={{ display: "grid", gridTemplateColumns: "24px 24px 2fr 55px 70px 70px 60px 1fr 28px", gap: 4, padding: "8px 12px", background: T.bg, fontSize: 10, fontWeight: 700, color: T.textMut }}>
                <span></span><span>#</span><span>ESERCIZIO</span><span style={{textAlign:"center"}}>SERIE</span><span style={{textAlign:"center"}}>REPS</span><span style={{textAlign:"center"}}>KG</span><span style={{textAlign:"center"}}>REC.</span><span>NOTE</span><span></span>
              </div>

              {sedExs.map((ex, ri) => (
                <div key={ex._id}>
                  <div style={{ display: "grid", gridTemplateColumns: "24px 24px 2fr 55px 70px 70px 60px 1fr 28px", gap: 4, padding: "6px 12px", alignItems: "center", borderTop: `1px solid ${T.border}`, background: ri % 2 === 0 ? "#fff" : T.bg + "88" }}>
                    {/* Frecce su/giù */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <button onClick={() => moveEx(ex._id, -1)} disabled={ri === 0} style={{ background: "none", border: "none", cursor: ri === 0 ? "default" : "pointer", color: ri === 0 ? T.textMut : T.primary, padding: 0, fontSize: 10, lineHeight: 1 }}>▲</button>
                      <button onClick={() => moveEx(ex._id, 1)} disabled={ri === sedExs.length - 1} style={{ background: "none", border: "none", cursor: ri === sedExs.length - 1 ? "default" : "pointer", color: ri === sedExs.length - 1 ? T.textMut : T.primary, padding: 0, fontSize: 10, lineHeight: 1 }}>▼</button>
                    </div>
                    <span style={{ fontSize: 11, color: T.textMut, fontWeight: 700 }}>{ri + 1}</span>

                    {/* Nome esercizio con dropdown sostituzione */}
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input value={ex.esercizio || ""} onChange={e => updateEx(ex._id, "esercizio", e.target.value)}
                          style={{ border: "1px solid transparent", borderRadius: 5, padding: "4px 6px", fontSize: 12, color: T.text, outline: "none", background: "transparent", width: "100%", fontWeight: 700 }}
                          onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.background = "#fff"; }}
                          onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                        />
                        <button onClick={() => setShowDropdown(showDropdown === ex._id ? null : ex._id)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 5, cursor: "pointer", padding: "2px 5px", fontSize: 10, color: T.textSec, flexShrink: 0 }} title="Scegli dalla libreria">
                          📚
                        </button>
                      </div>
                      {showDropdown === ex._id && (
                        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, width: 280, maxHeight: 220, overflow: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>
                            <input autoFocus placeholder="Cerca..." onChange={e => setSearchEx(e.target.value)}
                              style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, outline: "none" }} />
                          </div>
                          <div>
                            {Object.entries(libByMuscolo).map(([muscolo, items]) => {
                              const filtered = items.filter(i => !searchEx || i.esercizio.toLowerCase().includes(searchEx.toLowerCase()));
                              if (!filtered.length) return null;
                              return (
                                <div key={muscolo}>
                                  <div style={{ padding: "4px 10px", fontSize: 10, fontWeight: 800, color: T.primary, background: T.bg, letterSpacing: "0.5px" }}>{muscolo.toUpperCase()}</div>
                                  {filtered.map((lib, li) => (
                                    <button key={li} onClick={() => { updateEx(ex._id, "esercizio", lib.esercizio); updateEx(ex._id, "muscolo", lib.muscolo); setShowDropdown(null); setSearchEx(""); }}
                                      style={{ width: "100%", padding: "7px 12px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 12, color: T.text, display: "flex", justifyContent: "space-between" }}
                                      onMouseEnter={e => e.currentTarget.style.background = T.bg}
                                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                                    >
                                      <span>{lib.esercizio}</span>
                                      <span style={{ fontSize: 10, color: T.textMut }}>{lib.muscolo}</span>
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {["serie","ripetizioni","peso_suggerito","recupero","note"].map((f, fi) => (
                      <input key={f} value={ex[f] || ""} onChange={e => updateEx(ex._id, f, e.target.value)}
                        style={{ border: "1px solid transparent", borderRadius: 5, padding: "4px 6px", fontSize: 12, color: T.text, outline: "none", background: "transparent", width: "100%", textAlign: fi < 4 ? "center" : "left" }}
                        onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                      />
                    ))}
                    <button onClick={() => removeEx(ex._id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
                  </div>
                </div>
              ))}

              {/* Aggiungi esercizio dalla libreria per questa seduta */}
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, background: T.bg + "44" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textSec, marginBottom: 6 }}>+ AGGIUNGI A {sed.toUpperCase()}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input value={q} onChange={e => setSearchBySed(p => ({ ...p, [sed]: e.target.value }))}
                    placeholder="Cerca per nome o muscolo..."
                    style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 10px", fontSize: 12, outline: "none", background: "#fff" }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {libSed.slice(0, 20).map((ex, i) => (
                    <button key={i} onClick={() => addFromLib(ex, sed)}
                      style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: T.text }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
                    >
                      + {ex.esercizio} <span style={{ fontSize: 9, color: T.textMut }}>({ex.muscolo})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* AGGIUNGI SEDUTA */}
      <button onClick={addSeduta} style={{ display: "flex", alignItems: "center", gap: 7, background: T.bg, color: T.textSec, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 20, width: "100%", justifyContent: "center" }}>
        <Plus size={15} /> Aggiungi nuova seduta
      </button>

      {/* FOOTER */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <BtnSecondary onClick={onCancel}>Annulla</BtnSecondary>
        <BtnPrimary onClick={() => onSave(info, exs)} loading={saving}><Save size={14} /> Salva scheda</BtnPrimary>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   SCHEDE VIEW
   ───────────────────────────────────────────── */
function SchedeView({ data, onRefresh }) {
  const { clienti, esercizi, libreria } = data;
  const [selTpl,   setSelTpl]   = useState(null); // null = lista template, obj = compose
  const [saving,   setSaving]   = useState(false);
  const [info, setInfo] = useState({ nome_scheda: "", obiettivo: "", data_inizio: new Date().toISOString().split("T")[0], data_scadenza: new Date(Date.now() + 60*24*3600000).toISOString().split("T")[0], note_trainer: "", cliente_codice: "" });
  const [exs, setExs] = useState([]);

  const pickTemplate = (t) => {
    setSelTpl(t);
    setInfo(p => ({ ...p, nome_scheda: t.nome, obiettivo: t.obiettivo }));
    setExs(t.esercizi.map((e, i) => ({ ...e, _id: i })));
  };

  const handleSave = async (info2, exs2) => {
    if (!info2.nome_scheda) { alert("Inserisci il nome della scheda"); return; }
    if (!info2.cliente_codice) { alert("Seleziona un cliente"); return; }
    setSaving(true);
    try {
      const schedaId = genId("SCH");
      const clienteSel = clienti.find(c => c.codice === info2.cliente_codice);
      await writeViaScript("creaSchedaDaTemplate", {
        cliente_codice: info2.cliente_codice,
        scheda_attiva_old: clienteSel?.scheda_attiva || "",
        scheda: { scheda_id: schedaId, nome_scheda: info2.nome_scheda, obiettivo: info2.obiettivo, data_creazione: info2.data_inizio, data_scadenza: info2.data_scadenza, note_trainer: info2.note_trainer },
        esercizi: exs2.map(({ _id, ...e }) => ({ ...e, scheda_id: schedaId })),
      });
      await onRefresh();
      setSelTpl(null);
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  // EDITOR SCHEDA
  if (selTpl) return (
    <div>
      <button onClick={() => setSelTpl(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={16} /> Torna ai template
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 6 }}>
        Componi scheda — <span style={{ color: selTpl.colore }}>{selTpl.nome}</span>
      </h1>
      <p style={{ fontSize: 13.5, color: T.textSec, marginBottom: 20 }}>Modifica gli esercizi, assegna al cliente e salva.</p>
      <EditorScheda
        scheda={{ nome_scheda: selTpl.nome, obiettivo: selTpl.obiettivo, data_creazione: info.data_inizio, data_scadenza: info.data_scadenza }}
        esercizi={exs}
        libreria={libreria || []}
        clienti={clienti}
        cliente={null}
        onSave={handleSave}
        onCancel={() => setSelTpl(null)}
        saving={saving}
      />
    </div>
  );

  // LISTA TEMPLATE
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Schede</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>Scegli un template, personalizzalo e assegnalo a un cliente</p>
      </div>

      <div style={{ background: T.primaryLight, border: `1px solid ${T.primaryBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: T.primary, fontWeight: 600 }}>
        💡 Seleziona un template per creare una nuova scheda. Le schede assegnate si trovano nel dettaglio di ogni cliente.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => pickTemplate(t)} style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: "22px 24px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.colore; e.currentTarget.style.boxShadow = `0 4px 20px ${t.colore}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: t.colore + "22", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell size={26} color={t.colore} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>{t.nome}</div>
              <div style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>{t.descrizione}</div>
              <div style={{ fontSize: 12, color: T.textMut, marginTop: 4 }}>{t.esercizi.length} esercizi · {t.sedute.length} sedute</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.colore, background: t.colore + "15", padding: "5px 14px", borderRadius: 8 }}>Usa template →</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ESERCIZI VIEW
   ───────────────────────────────────────────── */
function EserciziView({ data, onRefresh }) {
  const { esercizi, schede } = data;
  const [search,       setSearch]       = useState("");
  const [filterScheda, setFilterScheda] = useState("all");
  const [showForm,     setShowForm]     = useState(false);
  const [editEx,       setEditEx]       = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [delLoading,   setDelLoading]   = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [form, setForm] = useState({ scheda_id: "", seduta: "", ordine: "", muscolo: "", esercizio: "", serie: "", ripetizioni: "", peso_suggerito: "", recupero: "", note: "", video_url: "" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return esercizi.filter(e => {
      const ms = !q || `${e.esercizio} ${e.muscolo || e.gruppo_muscolare}`.toLowerCase().includes(q);
      const msc = filterScheda === "all" || e.scheda_id === filterScheda;
      return ms && msc;
    });
  }, [esercizi, search, filterScheda]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => { const k = e.muscolo || e.gruppo_muscolare || "Altro"; if (!g[k]) g[k] = []; g[k].push(e); });
    return g;
  }, [filtered]);

  const handleAdd = async () => {
    if (!form.esercizio) { alert("Inserisci il nome dell'esercizio"); return; }
    setSaving(true);
    try { await writeViaScript("addEsercizio", { esercizio: form }); await onRefresh(); setShowForm(false); setForm({ scheda_id: "", seduta: "", ordine: "", muscolo: "", esercizio: "", serie: "", ripetizioni: "", peso_suggerito: "", recupero: "", note: "", video_url: "" }); }
    catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try { await writeViaScript("deleteEsercizio", { esercizio: confirmDel }); await onRefresh(); setConfirmDel(null); }
    catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  return (
    <div>
      {confirmDel && <ConfirmModal message={`Eliminare "${confirmDel.esercizio}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={delLoading} />}
      {editEx && (
        <Overlay zIndex={1100}>
          <ModalBox maxWidth={560}>
            <ModalHeader title="Modifica esercizio" onClose={() => setEditEx(null)} />
            <div style={{ padding: "20px 24px", overflow: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="NOME *"><Input value={editEx.esercizio || ""} onChange={v => setEditEx(p => ({ ...p, esercizio: v }))} /></Field>
                <Field label="MUSCOLO"><Input value={editEx.muscolo || editEx.gruppo_muscolare || ""} onChange={v => setEditEx(p => ({ ...p, muscolo: v }))} /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                {[["serie","Serie"],["ripetizioni","Reps"],["peso_suggerito","Peso (kg)"],["recupero","Rec. (s)"]].map(([f,l]) => (
                  <Field key={f} label={l}><Input value={editEx[f] || ""} onChange={v => setEditEx(p => ({ ...p, [f]: v }))} /></Field>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="NOTE"><Input value={editEx.note || ""} onChange={v => setEditEx(p => ({ ...p, note: v }))} /></Field>
                <Field label="VIDEO URL"><Input value={editEx.video_url || ""} onChange={v => setEditEx(p => ({ ...p, video_url: v }))} /></Field>
              </div>
            </div>
            <ModalFooter>
              <BtnSecondary onClick={() => setEditEx(null)}>Annulla</BtnSecondary>
              <BtnPrimary onClick={async () => { setSaving(true); try { await writeViaScript("updateEsercizio", { esercizio: editEx }); await onRefresh(); setEditEx(null); } catch (err) { alert(err.message); } finally { setSaving(false); } }} loading={saving}><Save size={14} /> Salva</BtnPrimary>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Esercizi</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>{esercizi.length} esercizi in libreria</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>
          <Plus size={17} /> Aggiungi esercizio
        </button>
      </div>

      {showForm && (
        <div style={{ background: T.card, border: `1px solid ${T.primaryBorder}`, borderRadius: 14, padding: "22px 24px", marginBottom: 22, boxShadow: "0 4px 20px rgba(255,107,0,0.08)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 18 }}>➕ Nuovo esercizio</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="SCHEDA (opzionale)">
              <select value={form.scheda_id} onChange={e => setForm(p => ({ ...p, scheda_id: e.target.value }))} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}>
                <option value="">Nessuna scheda (libero)</option>
                {schede.map(s => <option key={s.scheda_id} value={s.scheda_id}>{s.scheda_id} — {s.nome_scheda}</option>)}
              </select>
            </Field>
            <Field label="SEDUTA"><Input value={form.seduta} onChange={v => setForm(p => ({ ...p, seduta: v }))} placeholder="Es: Seduta 1" /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 60px", gap: 12, marginBottom: 12 }}>
            <Field label="NOME *"><Input value={form.esercizio} onChange={v => setForm(p => ({ ...p, esercizio: v }))} placeholder="Es: Panca piana" /></Field>
            <Field label="MUSCOLO"><Input value={form.muscolo} onChange={v => setForm(p => ({ ...p, muscolo: v }))} placeholder="Es: Pettorali" /></Field>
            <Field label="ORDINE"><Input type="number" value={form.ordine} onChange={v => setForm(p => ({ ...p, ordine: v }))} placeholder="1" /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["serie","SERIE","3"],["ripetizioni","REPS","10-12"],["peso_suggerito","PESO (kg)",""],["recupero","REC. (s)","60"]].map(([f,l,ph]) => (
              <Field key={f} label={l}><Input value={form[f]} onChange={v => setForm(p => ({ ...p, [f]: v }))} placeholder={ph} /></Field>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <Field label="NOTE"><Input value={form.note} onChange={v => setForm(p => ({ ...p, note: v }))} placeholder="Note tecniche..." /></Field>
            <Field label="VIDEO URL"><Input value={form.video_url} onChange={v => setForm(p => ({ ...p, video_url: v }))} placeholder="https://youtube.com/..." /></Field>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <BtnSecondary onClick={() => setShowForm(false)}>Annulla</BtnSecondary>
            <BtnPrimary onClick={handleAdd} loading={saving}><Plus size={14} /> Salva</BtnPrimary>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px" }}>
          <Search size={16} color={T.textMut} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca esercizio..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: T.text, background: "transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={14} /></button>}
        </div>
        <select value={filterScheda} onChange={e => setFilterScheda(e.target.value)} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: T.text, background: T.card, outline: "none", cursor: "pointer" }}>
          <option value="all">Tutte le schede</option>
          {schede.map(s => <option key={s.scheda_id} value={s.scheda_id}>{s.scheda_id} — {s.nome_scheda}</option>)}
        </select>
      </div>

      {Object.entries(grouped).length === 0 ? <EmptyState icon={Dumbbell} msg="Nessun esercizio trovato." /> : Object.entries(grouped).map(([muscolo, exs]) => (
        <div key={muscolo} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.primary, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>{muscolo}</div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            {exs.map((ex, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: i < exs.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: T.primaryLight, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.primary }}>{ex.ordine || i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{ex.esercizio}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{[ex.serie && `${ex.serie} serie`, ex.ripetizioni && `${ex.ripetizioni} reps`, ex.peso_suggerito && `${ex.peso_suggerito}kg`].filter(Boolean).join(" · ")}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {ex.scheda_id && <span style={{ fontSize: 11, background: T.bg, color: T.textMut, padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{ex.scheda_id}</span>}
                  {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: T.danger, background: T.dangerLight, padding: "3px 8px", borderRadius: 6, textDecoration: "none" }}>▶ Video</a>}
                  <button onClick={() => setEditEx({ ...ex })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: "#EEF2FF", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#6366F1" }}><Edit3 size={12} /> Modifica</button>
                  <button onClick={() => setConfirmDel(ex)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger }}><Trash2 size={12} /> Elimina</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


/* ─────────────────────────────────────────────
   IMPOSTAZIONI — Corsi e Professionisti
   ───────────────────────────────────────────── */
function ServiceCard({ items, title, emoji, onDelete }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{title}</span>
        <span style={{ marginLeft: 4, fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: T.bg, color: T.textSec }}>{items.length}</span>
      </div>
      <div style={{ padding: "12px 20px" }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 13, color: T.textMut, margin: 0 }}>Nessun elemento ancora.</p>
        ) : items.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.nome}</div>
              {s.descrizione && <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{s.descrizione}</div>}
              {s.contatto && <div style={{ fontSize: 12, color: T.primary, marginTop: 2, fontWeight: 600 }}>{s.contatto}</div>}
            </div>
            <button onClick={() => onDelete(s)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger }}>
              <Trash2 size={12} /> Elimina
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpostazioniView({ data, onRefresh }) {
  const { servizi = [] } = data;
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: "corso", nome: "", descrizione: "", contatto: "" });

  const corsi = servizi.filter(s => s.tipo === "corso");
  const professionisti = servizi.filter(s => s.tipo === "professionista");

  const handleAdd = async () => {
    if (!form.nome) { alert("Inserisci il nome"); return; }
    setSaving(true);
    try {
      await writeViaScript("addServizio", { servizio: form });
      await onRefresh();
      setShowForm(false);
      setForm({ tipo: "corso", nome: "", descrizione: "", contatto: "" });
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await writeViaScript("deleteServizio", { servizio: confirmDel });
      await onRefresh();
      setConfirmDel(null);
    } catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  return (
    <div>
      {confirmDel && (
        <ConfirmModal
          message={`Eliminare "${confirmDel.nome}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
          loading={delLoading}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>La Palestra</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>Gestisci corsi e professionisti</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>
          <Plus size={17} /> Aggiungi
        </button>
      </div>

      {/* FORM AGGIUNTA */}
      {showForm && (
        <div style={{ background: T.card, border: `1px solid ${T.primaryBorder}`, borderRadius: 14, padding: "22px 24px", marginBottom: 22, boxShadow: "0 4px 20px rgba(255,107,0,0.08)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 18 }}>➕ Nuovo elemento</div>
          <div style={{ marginBottom: 12 }}>
            <Field label="TIPO">
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}>
                <option value="corso">Corso</option>
                <option value="professionista">Professionista</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="NOME *"><Input value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} placeholder={form.tipo === "corso" ? "Es: Pilates" : "Es: Dott. Rossi"} /></Field>
            <Field label="CONTATTO"><Input value={form.contatto} onChange={v => setForm(p => ({ ...p, contatto: v }))} placeholder={form.tipo === "corso" ? "Es: Istruttore: Laura" : "Es: 333 0000000"} /></Field>
          </div>
          <Field label="DESCRIZIONE">
            <Input value={form.descrizione} onChange={v => setForm(p => ({ ...p, descrizione: v }))} placeholder={form.tipo === "corso" ? "Es: Lezioni ogni martedì e giovedì" : "Es: Fisioterapista specializzato"} />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <BtnSecondary onClick={() => setShowForm(false)}>Annulla</BtnSecondary>
            <BtnPrimary onClick={handleAdd} loading={saving}><Plus size={14} /> Salva</BtnPrimary>
          </div>
        </div>
      )}

      <ServiceCard items={corsi} title="I nostri corsi" emoji="💪" onDelete={setConfirmDel} />
      <ServiceCard items={professionisti} title="I nostri professionisti" emoji="🏥" onDelete={setConfirmDel} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING / ERROR
   ───────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Dumbbell size={24} color="#fff" /></div>
      <div><div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>GymBoard Admin</div><div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>Caricamento...</div></div>
    </div>
  );
}
function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <AlertCircle size={44} color={T.danger} />
      <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Errore di connessione</p>
      <p style={{ fontSize: 13, color: T.textSec, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>{error}</p>
      <button onClick={onRetry} style={{ background: T.primary, border: "none", borderRadius: 10, padding: "11px 26px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}><RefreshCw size={16} /> Riprova</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
   ───────────────────────────────────────────── */
export default function AdminPanel() {
  const [loggedIn,        setLoggedIn]        = useState(false);
  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [page,            setPage]            = useState("dashboard");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [waCliente,       setWaCliente]       = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchAllData()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (loggedIn) loadData(); }, [loggedIn, loadData]);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  if (loading)   return <LoadingScreen />;
  if (error)     return <ErrorScreen error={error} onRetry={loadData} />;

  const navigate = (p) => { setPage(p); setSelectedCliente(null); };
  const openCliente = (c) => { setSelectedCliente(c); setPage("clienteDetail"); };
  const sidebarActive = page === "clienteDetail" ? "clienti" : page;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Sora', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 3px; }
        button, input, select, textarea { font-family: inherit; }
        input::placeholder { color: #9CA3AF; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <Sidebar active={sidebarActive} onNavigate={navigate} config={data.config} onLogout={() => { setLoggedIn(false); setPage("dashboard"); }} />

      <div style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button onClick={loadData} style={{ display: "flex", alignItems: "center", gap: 7, background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontSize: 12.5, color: T.textSec, fontWeight: 600 }}>
            <RefreshCw size={14} /> Aggiorna dati
          </button>
        </div>

        {/* OVERLAY SALVATAGGIO */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${T.primaryLight}`, borderTop: `3px solid ${T.primary}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Caricamento...</div>
          </div>
        </div>
      )}

      {waCliente && <WAModal cliente={waCliente} onClose={() => setWaCliente(null)} />}

        {page === "dashboard"     && <DashboardView data={data} onNavigate={navigate} />}
        {page === "clienti"       && <ClientiView   data={data} onSelectCliente={openCliente} onRefresh={loadData} />}
        {page === "clienteDetail" && selectedCliente && <ClienteDetail cliente={selectedCliente} data={data} onBack={() => navigate("clienti")} onWhatsApp={setWaCliente} onRefresh={loadData} />}
        {page === "schede"        && <SchedeView    data={data} onRefresh={loadData} />}
        {page === "esercizi"      && <EserciziView  data={data} onRefresh={loadData} />}
        {page === "impostazioni"   && <ImpostazioniView data={data} onRefresh={loadData} />}
      </div>
    </div>
  );
}
