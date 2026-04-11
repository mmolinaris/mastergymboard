import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Home, BarChart3, ClipboardList, User, Play, Timer, ChevronRight, 
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info, Plus, Minus,
  RefreshCw, Wifi, WifiOff, LogOut, MapPin, Clock, Target,
  ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Zap,
  Video, AlertCircle
} from "lucide-react";

// ==========================================
// CONFIGURAZIONE GOOGLE SHEETS (LE TUE CHIAVI)
// ==========================================
const SHEET_ID = "1No3lEcFiI6nuLuAeMjmD5YFyfgp50mzJp4XSh1CcOxY";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";

// Dati di emergenza (se Google non risponde)
const FALLBACK_CONFIG = {
  nome_palestra: "Master Gym",
  colore_primario: "#FF6B00",
  colore_sfondo: "#0A0A0A",
  indirizzo: "Via Bussinello 73, Canelli (AT)",
  instagram: "@asd_palestra_mastergym"
};

const GymApp = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loginForm, setLoginForm] = useState({ codice: '', pin: '' });

  // --- LOGICA DI CARICAMENTO DATI ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const sheets = ['config', 'clienti', 'schede', 'esercizi'];
      const results = {};

      for (const sheet of sheets) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheet}?key=${API_KEY}`;
        const resp = await fetch(url);
        const json = await resp.json();
        
        if (json.values) {
          const headers = json.values[0];
          results[sheet] = json.values.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = row[i] || "");
            return obj;
          });
        }
      }

      // Trasforma il foglio config in un oggetto semplice
      const configObj = {};
      (results.config || []).forEach(item => {
        configObj[item.chiave] = item.valore;
      });

      setData({
        config: { ...FALLBACK_CONFIG, ...configObj },
        clienti: results.clienti || [],
        schede: results.schede || [],
        esercizi: results.esercizi || []
      });
      setError(null);
    } catch (err) {
      console.error("Errore caricamento:", err);
      setError("Impossibile connettersi a Google Sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGICA LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = data?.clienti.find(c => 
      c.codice.trim().toUpperCase() === loginForm.codice.trim().toUpperCase() && 
      c.pin.trim() === loginForm.pin.trim()
    );

    if (foundUser) {
      setUser(foundUser);
      setLoginForm({ codice: '', pin: '' });
    } else {
      alert("Codice o PIN errati. Controlla il foglio Google!");
    }
  };

  // Se sta caricando...
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <RefreshCw className="animate-spin mr-2" /> Caricamento GymBoard...
      </div>
    );
  }

  // Se non c'è l'utente loggato, mostra il Login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter italic text-[#FF6B00]">GYMBOARD</h1>
            <p className="text-gray-400 mt-2">{data?.config.nome_palestra || "Master Gym"}</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input 
              className="w-full bg-[#1A1A1A] border-none p-4 rounded-xl" 
              placeholder="Codice Cliente (es. MG-001)"
              value={loginForm.codice}
              onChange={e => setLoginForm({...loginForm, codice: e.target.value})}
            />
            <input 
              className="w-full bg-[#1A1A1A] border-none p-4 rounded-xl" 
              type="password"
              placeholder="PIN"
              value={loginForm.pin}
              onChange={e => setLoginForm({...loginForm, pin: e.target.value})}
            />
            <button className="w-full bg-[#FF6B00] p-4 rounded-xl font-bold text-lg">ENTRA</button>
          </form>
        </div>
      </div>
    );
  }

  // Se loggato, mostra l'App (Versione Semplificata per test)
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Ciao {user.nome}! 💪</h1>
        <p className="text-gray-400">Pronto per allenarti alla {data.config.nome_palestra}?</p>
        
        <div className="mt-8 bg-[#1A1A1A] p-6 rounded-2xl border-l-4 border-[#FF6B00]">
          <h2 className="text-[#FF6B00] font-bold text-sm uppercase">Scheda Attiva</h2>
          <p className="text-xl font-bold">{user.scheda_attiva}</p>
          <p className="text-gray-400 text-sm mt-1">Scade il: {user.scadenza}</p>
        </div>

        <button 
          onClick={fetchData}
          className="mt-8 w-full flex items-center justify-center gap-2 p-4 bg-[#1A1A1A] rounded-xl text-sm text-gray-400"
        >
          <RefreshCw size={16} /> Aggiorna dati da Google Sheets
        </button>

        <button 
          onClick={() => setUser(null)}
          className="mt-4 w-full p-4 text-red-500 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default GymApp;
