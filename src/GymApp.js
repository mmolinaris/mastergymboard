import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Home, BarChart3, ClipboardList, User, Play, Timer, ChevronRight, 
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info, Plus, Minus,
  RefreshCw, Wifi, WifiOff, LogOut, MapPin, Clock, Target,
  ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Zap,
  Video, AlertCircle
} from "lucide-react";

// ==========================================
// LE TUE CHIAVI (NON TOCCARE)
// ==========================================
const SHEET_ID = "1No3lEcFiI6nuLuAeMjmD5YFyfgp50mzJp4XSh1CcOxY";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";

const GymApp = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loginForm, setLoginForm] = useState({ codice: '', pin: '' });

  // Funzione per caricare TUTTO da Google Sheets
  const loadAllData = async () => {
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
      // Trasformo config in oggetto semplice
      const config = {}; (res.config || []).forEach(c => config[c.chiave] = c.valore);
      
      setData({
        config: config,
        clienti: res.clienti || [],
        schede: res.schede || [],
        esercizi: res.esercizi || []
      });
    } catch (e) {
      console.error("Errore Google Sheets:", e);
    }
    setLoading(false);
  };

  useEffect(() => { loadAllData(); }, []);

  // Login
  const handleLogin = (e) => {
    e.preventDefault();
    const found = data?.clienti.find(c => 
      c.codice.trim().toUpperCase() === loginForm.codice.trim().toUpperCase() && 
      c.pin.trim() === loginForm.pin.trim()
    );
    if (found) setUser(found);
    else alert("Dati errati!");
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-bold italic">
      <RefreshCw className="animate-spin mb-4 text-[#FF6B00]" size={48} />
      <p className="tracking-widest uppercase">GymBoard sta caricando...</p>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 flex flex-col justify-center items-center">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black italic text-[#FF6B00] tracking-tighter">GYMBOARD</h1>
        <p className="text-gray-500 uppercase tracking-widest text-sm mt-2">{data?.config.nome_palestra}</p>
      </div>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input 
          className="w-full bg-[#1A1A1A] border-none p-5 rounded-2xl text-lg focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
          placeholder="Codice Cliente"
          value={loginForm.codice}
          onChange={e => setLoginForm({...loginForm, codice: e.target.value})}
        />
        <input 
          className="w-full bg-[#1A1A1A] border-none p-5 rounded-2xl text-lg focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
          type="password"
          placeholder="PIN"
          value={loginForm.pin}
          onChange={e => setLoginForm({...loginForm, pin: e.target.value})}
        />
        <button className="w-full bg-[#FF6B00] p-5 rounded-2xl font-black text-xl italic uppercase tracking-tighter hover:scale-95 transition-transform active:bg-orange-600">Entra</button>
      </form>
    </div>
  );

  // Filtro la scheda e gli esercizi dell'utente
  const activeScheda = data.schede.find(s => s.id_scheda === user.id_scheda_attiva);
  const workoutDays = Array.from(new Set(data.esercizi.filter(e => e.id_scheda === user.id_scheda_attiva).map(e => e.giorno)));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-32">
      {/* HEADER */}
      <div className="p-6 bg-gradient-to-b from-[#111] to-[#0A0A0A] border-b border-[#222]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tight">CIAO {user.nome.toUpperCase()}! 💪</h1>
            <p className="text-gray-400 text-sm">Pronto per allenarti alla {data.config.nome_palestra}?</p>
          </div>
          <button onClick={loadAllData} className="p-3 bg-[#1A1A1A] rounded-full text-[#FF6B00]"><RefreshCw size={20}/></button>
        </div>

        {activeScheda && (
          <div className="bg-[#1A1A1A] p-6 rounded-3xl relative overflow-hidden border border-[#222]">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Dumbbell size={80}/></div>
            <p className="text-[#FF6B00] font-bold text-xs uppercase tracking-widest mb-1">Scheda Attiva</p>
            <h2 className="text-2xl font-black italic leading-tight">{activeScheda.nome_scheda}</h2>
            <div className="flex gap-4 mt-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Target size={14}/> {activeScheda.obiettivo}</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> Scade il {user.scadenza}</span>
            </div>
          </div>
        )}
      </div>

      {/* WORKOUT LIST */}
      <div className="p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 text-center">I tuoi allenamenti</h3>
        {workoutDays.map((giorno, idx) => (
          <button 
            key={idx}
            onClick={() => setSelectedWorkout(giorno)}
            className="w-full bg-[#1A1A1A] p-5 rounded-2xl flex items-center justify-between group active:scale-95 transition-all border border-transparent active:border-[#FF6B00]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-[#FF6B00] font-black text-xl italic">{giorno}</div>
              <div className="text-left">
                <p className="font-bold text-lg">Allenamento {giorno}</p>
                <p className="text-gray-500 text-xs">Vedi esercizi e note</p>
              </div>
            </div>
            <ChevronRight className="text-gray-700 group-active:text-[#FF6B00]" />
          </button>
        ))}
      </div>

      {/* FOOTER NAV */}
      <div className="fixed bottom-6 left-6 right-6 bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#333] p-4 rounded-3xl flex justify-around items-center shadow-2xl z-50">
        <button onClick={() => setActiveTab('home')} className={`p-2 transition-colors ${activeTab === 'home' ? 'text-[#FF6B00]' : 'text-gray-500'}`}><Home/></button>
        <button onClick={() => setActiveTab('progress')} className={`p-2 transition-colors ${activeTab === 'progress' ? 'text-[#FF6B00]' : 'text-gray-500'}`}><BarChart3/></button>
        <button onClick={() => setActiveTab('history')} className={`p-2 transition-colors ${activeTab === 'history' ? 'text-[#FF6B00]' : 'text-gray-500'}`}><ClipboardList/></button>
        <button onClick={() => setActiveTab('profile')} className={`p-2 transition-colors ${activeTab === 'profile' ? 'text-[#FF6B00]' : 'text-gray-500'}`}><User/></button>
      </div>

      {/* MODALE ALLENAMENTO (DETTAGLIO ESERCIZI) */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black z-[100] overflow-y-auto p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => setSelectedWorkout(null)} className="p-2 bg-[#1A1A1A] rounded-full text-white"><ChevronLeft/></button>
            <h2 className="text-xl font-black italic uppercase italic">Giorno {selectedWorkout}</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="space-y-6">
            {data.esercizi.filter(e => e.giorno === selectedWorkout && e.id_scheda === user.id_scheda_attiva).map((ex, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-3xl overflow-hidden border border-[#222]">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold italic leading-tight">{ex.esercizio}</h3>
                    {ex.video && <a href={ex.video} target="_blank" className="text-[#FF6B00] p-2 bg-orange-500/10 rounded-lg"><Video size={20}/></a>}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-black/50 p-3 rounded-2xl text-center"><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Serie</p><p className="text-lg font-black italic">{ex.serie}</p></div>
                    <div className="bg-black/50 p-3 rounded-2xl text-center"><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Reps</p><p className="text-lg font-black italic">{ex.reps}</p></div>
                    <div className="bg-black/50 p-3 rounded-2xl text-center"><p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Recupero</p><p className="text-lg font-black italic">{ex.recupero}"</p></div>
                  </div>
                  <div className="bg-[#222] p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-gray-400 font-bold text-sm">Carico: <span className="text-white">{ex.peso} kg</span></span>
                    <button className="bg-[#FF6B00] px-4 py-2 rounded-xl text-xs font-black uppercase italic">Dettagli</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GymApp;
