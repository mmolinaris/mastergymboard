   import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, ClipboardList, LayoutDashboard, Search, ChevronRight,
  Phone, Dumbbell, Calendar, Target, AlertCircle,
  ArrowLeft, X, MessageCircle, Send
} from "lucide-react";

const SHEET_ID = "1ncZxiiLhlfaWlKHmqZk1qb9tg5R6CBpT3cWKKuZrBXg";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL = "https://mastergymboard.vercel.app";
const LOGO_URL = "https://raw.githubusercontent.com/mmolinaris/mastergymboard/main/public/icon-512.png";

async function fetchSheet(tab) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(tab)}?key=${API_KEY}`);
  if (!res.ok) throw new Error(`Errore: ${res.status}`);
  const d = await res.json();
  const [h, ...rows] = d.values || [];
  if (!h) return [];
  return rows.map(r => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? "").toString().trim()])));
}

async function fetchAllData() {
  const [cf, cl, sc, ex] = await Promise.all([
    fetchSheet("config"), fetchSheet("clienti"), fetchSheet("schede"), fetchSheet("esercizi")
  ]);
  const esercizi = ex.map(e => ({
    ...e,
    seduta: e.seduta || e.giorno || "",
    recupero: e.recupero || e.riposo_sec || "0",
    muscolo: e.muscolo || e.gruppo_muscolare || "",
  }));
  return {
    config: Object.fromEntries(cf.map(r => [r.chiave, r.valore])),
    clienti: cl,
    schede: sc,
    esercizi,
  };
}

const fmtDate = d => {
  if (!d) return "—";
  if (d.includes("/")) return d;
  const p = d.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
};
const daysUntil = d => { if (!d) return 999; return Math.ceil((new Date(d) - new Date()) / 86400000); };

const T = {
  bg: "#F7F7F8", card: "#FFFFFF", border: "#E8E8EC",
  text: "#1A1A2E", textSec: "#6B7080", textMut: "#9CA3AF",
  primary: "#D32F2F", primaryLight: "#FFEBEE", primaryBorder: "#FFCDD2",
  danger: "#EF4444", dangerLight: "#FEF2F2",
  success: "#22C55E", successLight: "#F0FDF4",
  sidebar: "#1A1A1A", sidebarActive: "#D32F2F",
};

function Sidebar({ active, onNavigate, config }) {
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "clienti", icon: Users, label: "Clienti" },
    { id: "schede", icon: ClipboardList, label: "Schede" },
  ];
  return (
    <div style={{ width: 220, minHeight: "100vh", background: T.sidebar, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #2A2A2A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #333" }}>
            <img src={LOGO_URL} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ color: "white", fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{config?.nome_palestra || "Master Gym"}</div>
            <div style={{ color: "#666", fontSize: 10 }}>Pannello Gestione</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 12px", flex: 1 }}>
        {items.map(({ id, icon: Icon, label }) => {
          const a = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 4, background: a ? T.sidebarActive : "transparent", color: a ? "white" : "#888", fontWeight: a ? 700 : 500, fontSize: 13 }}>
              <Icon size={18} strokeWidth={a ? 2.2 : 1.5} />{label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "16px 20px", borderTop: "1px solid #2A2A2A" }}>
        <div style={{ color: "#555", fontSize: 11 }}>GymBoard v1.0</div>
        <div style={{ color: "#444", fontSize: 10, marginTop: 2 }}>by Marta Molinaris</div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, padding: 20, border: `1px solid ${T.border}`, flex: 1, minWidth: 160 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, color: T.textSec }}>{label}</div>
    </div>
  );
}

function WhatsAppModal({ cliente, onClose }) {
  const msg = `🏋️ *Master Gym — La tua scheda di allenamento!*\n\nCiao ${cliente.nome}! Da oggi puoi vedere la tua scheda direttamente sul telefono.\n\n📲 *Apri questo link:*\n${APP_URL}\n\n🔑 Il tuo codice: *${cliente.codice}*\n🔒 Il tuo PIN: *${cliente.pin}*\n\n━━━━━━━━━━━━━━━\n\n💡 *Per aggiungere l'icona al telefono:*\n\n*iPhone:* Apri con Safari → Condividi ⬆️ → Aggiungi alla schermata Home\n\n*Android:* Apri con Chrome → ⋮ → Aggiungi a schermata Home\n\n✅ Buon allenamento! 💪`;
  const waUrl = cliente.telefono ? `https://wa.me/${cliente.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}` : null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MessageCircle size={20} color="#25D366" />
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Messaggio per {cliente.nome}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={T.textMut} /></button>
        </div>
        <div style={{ padding: "20px 24px", overflow: "auto", flex: 1 }}>
          <div style={{ background: "#F0F0F0", borderRadius: 12, padding: 16, fontSize: 13, lineHeight: 1.6, color: "#333", whiteSpace: "pre-wrap" }}>{msg}</div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => navigator.clipboard.writeText(msg)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`, background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>📋 Copia</button>
          {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#25D366", color: "white", textDecoration: "none", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Send size={15} /> WhatsApp</a>}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ data, onNavigate, onSelectCliente }) {
  const { clienti, schede, esercizi } = data;
  const stats = useMemo(() => ({
    totClienti: clienti.filter(c => c.codice).length,
    schedeAttive: schede.length,
    inScadenza: clienti.filter(c => { const s = schede.find(sc => sc.scheda_id === c.scheda_attiva); return s && daysUntil(s.data_scadenza) <= 7 && daysUntil(s.data_scadenza) > 0; }).length,
    totEsercizi: esercizi.length,
  }), [clienti, schede, esercizi]);

  const recentClienti = useMemo(() => clienti.filter(c => c.codice && c.nome).slice(0, 5), [clienti]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: T.textSec }}>Panoramica della tua palestra</p>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={Users} label="Clienti attivi" value={stats.totClienti} color={T.primary} bgColor={T.primaryLight} />
        <StatCard icon={ClipboardList} label="Schede create" value={stats.schedeAttive} color="#6366F1" bgColor="#EEF2FF" />
        <StatCard icon={AlertCircle} label="In scadenza" value={stats.inScadenza} color={T.danger} bgColor={T.dangerLight} />
        <StatCard icon={Dumbbell} label="Esercizi totali" value={stats.totEsercizi} color={T.success} bgColor={T.successLight} />
      </div>
      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Ultimi clienti</span>
          <button onClick={() => onNavigate("clienti")} style={{ background: T.primaryLight, border: `1px solid ${T.primaryBorder}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: T.primary, fontSize: 12, fontWeight: 700 }}>Vedi tutti →</button>
        </div>
        {recentClienti.map(c => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          return (
            <button key={c.codice} onClick={() => onSelectCliente(c)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", border: "none", borderBottom: `1px solid ${T.border}`, background: "white", cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.primary, flexShrink: 0 }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize: 12, color: T.textSec }}>{scheda?.nome_scheda || "Nessuna scheda"}</div>
              </div>
              <span style={{ fontSize: 11, color: T.textMut, background: T.bg, padding: "3px 8px", borderRadius: 5, fontWeight: 600 }}>{c.codice}</span>
              <ChevronRight size={16} color={T.textMut} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClientiView({ data, onSelectCliente }) {
  const [search, setSearch] = useState("");
  const { clienti, schede } = data;
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clienti.filter(c => c.codice && c.nome && `${c.nome} ${c.cognome} ${c.codice}`.toLowerCase().includes(q));
  }, [clienti, search]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Clienti</h1>
        <p style={{ fontSize: 14, color: T.textSec }}>{filtered.length} clienti</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 16px", marginBottom: 20 }}>
        <Search size={18} color={T.textMut} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per nome o codice..." style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: T.text, background: "transparent" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} color={T.textMut} /></button>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(c => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          const days = scheda ? daysUntil(scheda.data_scadenza) : 999;
          return (
            <button key={c.codice} onClick={() => onSelectCliente(c)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", border: `1px solid ${T.border}`, borderRadius: 14, background: T.card, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: T.primary, flexShrink: 0 }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{scheda?.nome_scheda || "Nessuna scheda"} · {fmtDate(c.data_iscrizione)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {days <= 7 && days > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: T.danger, background: T.dangerLight, padding: "3px 8px", borderRadius: 6 }}>Scade {days}g</span>}
                {days <= 0 && scheda && <span style={{ fontSize: 11, fontWeight: 700, color: T.danger, background: T.dangerLight, padding: "3px 8px", borderRadius: 6 }}>Scaduta</span>}
                <span style={{ fontSize: 11, color: T.textMut, background: T.bg, padding: "3px 8px", borderRadius: 5 }}>{c.codice}</span>
                <ChevronRight size={16} color={T.textMut} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClienteDetail({ cliente, data, onBack, onWhatsApp }) {
  const { schede, esercizi } = data;
  const scheda = schede.find(s => s.scheda_id === cliente.scheda_attiva);
  const schedaEx = esercizi.filter(e => e.scheda_id === cliente.scheda_attiva);
  const sedute = [...new Set(schedaEx.map(e => e.seduta))].filter(Boolean);

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Torna alla lista
      </button>
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: T.primary }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>{cliente.nome} {cliente.cognome}</h2>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>Codice: <b>{cliente.codice}</b> · PIN: <b>{cliente.pin}</b></div>
          </div>
          <button onClick={() => onWhatsApp(cliente)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#25D366", color: "white", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Send size={15} /> WhatsApp
          </button>
        </div>
        {[["📞", cliente.telefono], ["📧", cliente.email], ["📅", `Iscritto: ${fmtDate(cliente.data_iscrizione)}`]].filter(([, v]) => v).map(([icon, val], i) => (
          <div key={i} style={{ fontSize: 13, color: T.textSec, marginBottom: 4 }}>{icon} {val}</div>
        ))}
      </div>
      {scheda ? (
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.primary, letterSpacing: "1px", marginBottom: 4 }}>SCHEDA ATTIVA</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>{scheda.nome_scheda}</div>
              <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{scheda.obiettivo} · {fmtDate(scheda.data_creazione)} → {fmtDate(scheda.data_scadenza)}</div>
            </div>
            {daysUntil(scheda.data_scadenza) <= 7 && <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, color: T.danger, background: T.dangerLight }}>{daysUntil(scheda.data_scadenza) > 0 ? `Scade tra ${daysUntil(scheda.data_scadenza)}g` : "Scaduta"}</span>}
          </div>
          {sedute.map(sed => {
            const dayExs = schedaEx.filter(e => e.seduta === sed).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
            return (
              <div key={sed} style={{ borderBottom: `1px solid ${T.border}` }}>
                <div style={{ padding: "10px 24px", background: T.bg, fontSize: 13, fontWeight: 700, color: T.primary }}>{sed}{dayExs[0]?.tipo_seduta ? ` — ${dayExs[0].tipo_seduta}` : ""}</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["#", "Esercizio", "Serie", "Reps", "Rec.", "Muscolo"].map(h => <th key={h} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: T.textMut, textAlign: "left" }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {dayExs.map((ex, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.border}22` }}>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: T.textMut }}>{ex.ordine}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.serie || "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.ripetizioni || "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.recupero || "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: T.textSec }}>{ex.muscolo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 40, textAlign: "center" }}>
          <ClipboardList size={40} color={T.textMut} style={{ marginBottom: 12 }} />
          <p style={{ color: T.textSec, fontSize: 14 }}>Nessuna scheda assegnata</p>
        </div>
      )}
    </div>
  );
}

function SchedeView({ data, onSelectScheda }) {
  const { schede, clienti, esercizi } = data;
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Schede</h1>
        <p style={{ fontSize: 14, color: T.textSec }}>{schede.length} schede create</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {schede.map(s => {
          const numClienti = clienti.filter(c => c.scheda_attiva === s.scheda_id).length;
          const numEx = esercizi.filter(e => e.scheda_id === s.scheda_id).length;
          const sedute = [...new Set(esercizi.filter(e => e.scheda_id === s.scheda_id).map(e => e.seduta))].filter(Boolean).length;
          const days = daysUntil(s.data_scadenza);
          return (
            <button key={s.scheda_id} onClick={() => onSelectScheda(s)} style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{s.nome_scheda}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{s.obiettivo}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: T.primaryLight, color: T.primary }}>{s.scheda_id}</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[[Users, `${numClienti} clienti`], [Calendar, `${sedute} sedute`], [Dumbbell, `${numEx} esercizi`]].map(([Icon, label], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon size={13} color={T.textSec} /><span style={{ fontSize: 12, color: T.textSec }}>{label}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SchedaDetail({ scheda, data, onBack }) {
  const { esercizi, clienti } = data;
  const schedaEx = esercizi.filter(e => e.scheda_id === scheda.scheda_id);
  const sedute = [...new Set(schedaEx.map(e => e.seduta))].filter(Boolean);
  const assigned = clienti.filter(c => c.scheda_attiva === scheda.scheda_id);
  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Torna alle schede
      </button>
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0, marginBottom: 8 }}>{scheda.nome_scheda}</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
          {[["Obiettivo", scheda.obiettivo], ["Creata", fmtDate(scheda.data_creazione)], ["Scadenza", fmtDate(scheda.data_scadenza)]].map(([k, v]) => (
            <span key={k} style={{ fontSize: 13, color: T.textSec }}>{k}: <b style={{ color: T.text }}>{v}</b></span>
          ))}
        </div>
        {assigned.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.textSec }}>Assegnata a:</span>
            {assigned.map(c => <span key={c.codice} style={{ fontSize: 12, fontWeight: 600, background: T.primaryLight, color: T.primary, padding: "2px 8px", borderRadius: 5 }}>{c.nome} {c.cognome}</span>)}
          </div>
        )}
      </div>
      {sedute.map(sed => {
        const dayExs = schedaEx.filter(e => e.seduta === sed).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
        return (
          <div key={sed} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "12px 20px", background: T.bg, borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 700, color: T.primary }}>{sed}{dayExs[0]?.tipo_seduta ? ` — ${dayExs[0].tipo_seduta}` : ""}</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["#", "Esercizio", "Serie", "Reps", "Rec.", "Muscolo", "Peso", "Note"].map(h => <th key={h} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: T.textMut, textAlign: "left", borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {dayExs.map((ex, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}22` }}>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: T.textMut }}>{ex.ordine}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.serie || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.ripetizioni || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.recupero || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: T.textSec }}>{ex.muscolo || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.primary, fontWeight: 600 }}>{ex.peso_suggerito ? `${ex.peso_suggerito} kg` : "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: T.textSec }}>{ex.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedScheda, setSelectedScheda] = useState(null);
  const [whatsappCliente, setWhatsappCliente] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchAllData()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}><Dumbbell size={32} color={T.primary} /><span style={{ color: T.textSec, fontSize: 15 }}>Caricamento...</span></div>;
  if (error) return <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}><AlertCircle size={40} color={T.danger} /><p style={{ color: T.text, fontSize: 16, fontWeight: 700 }}>Errore</p><p style={{ color: T.textSec, fontSize: 13 }}>{error}</p><button onClick={loadData} style={{ background: T.primary, border: "none", borderRadius: 10, padding: "12px 28px", color: "white", fontWeight: 700, cursor: "pointer" }}>Riprova</button></div>;

  const navigate = p => { setPage(p); setSelectedCliente(null); setSelectedScheda(null); };

  const activePage = page === "clienteDetail" ? "clienti" : page === "schedaDetail" ? "schede" : page;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#DDD;border-radius:3px}button{font-family:inherit}`}</style>
      <Sidebar active={activePage} onNavigate={navigate} config={data.config} />
      <div style={{ flex: 1, padding: "32px 40px", overflow: "auto", maxWidth: 1100 }}>
        {whatsappCliente && <WhatsAppModal cliente={whatsappCliente} onClose={() => setWhatsappCliente(null)} />}
        {page === "dashboard" && <DashboardView data={data} onNavigate={navigate} onSelectCliente={c => { setSelectedCliente(c); setPage("clienteDetail"); }} />}
        {page === "clienti" && <ClientiView data={data} onSelectCliente={c => { setSelectedCliente(c); setPage("clienteDetail"); }} />}
        {page === "clienteDetail" && selectedCliente && <ClienteDetail cliente={selectedCliente} data={data} onBack={() => navigate("clienti")} onWhatsApp={c => setWhatsappCliente(c)} />}
        {page === "schede" && <SchedeView data={data} onSelectScheda={s => { setSelectedScheda(s); setPage("schedaDetail"); }} />}
        {page === "schedaDetail" && selectedScheda && <SchedaDetail scheda={selectedScheda} data={data} onBack={() => navigate("schede")} />}
      </div>
    </div>
  );
}
