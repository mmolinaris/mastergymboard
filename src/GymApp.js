import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Home, BarChart3, ClipboardList, User, Play, Timer, ChevronRight,
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info, Plus, Minus,
  RefreshCw, Wifi, WifiOff, LogOut, MapPin, Clock, Target,
  ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Zap,
  Video, AlertCircle
} from "lucide-react";

// ============================================
// DATI DEMO — Sostituire con Google Sheets API
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
  { scheda_id: "SCHEDA-004", nome_scheda: "Intro Fitness", obiettivo: "Condizionamento", data_creazione: "2026-01-10", data_scadenza: "2026-03-10", note_trainer: "Scheda introduttiva completata" },
  { scheda_id: "SCHEDA-005", nome_scheda: "Conditioning Base", obiettivo: "Resistenza", data_creazione: "2025-12-01", data_scadenza: "2026-02-01", note_trainer: "Buon lavoro, passare a Forza Base" },
];

const DEMO_ESERCIZI = [
  // SCHEDA-001 — Marco Rossi — Massa Principiante (3 giorni)
  // Giorno 1 - Petto e Tricipiti
  { scheda_id:"SCHEDA-001",giorno:"Giorno 1 - Petto e Tricipiti",ordine:1,gruppo_muscolare:"Petto",esercizio:"Panca piana bilanciere",serie:4,ripetizioni:"8-10",peso_suggerito:"60",riposo_sec:90,note:"Scendere fino al petto controllando il movimento",video_url:"https://www.youtube.com/watch?v=rT7DgCr-3pg",tecnica:"Presa media, scapole addotte e depresse, piedi ben piantati" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 1 - Petto e Tricipiti",ordine:2,gruppo_muscolare:"Petto",esercizio:"Panca inclinata manubri",serie:3,ripetizioni:"10-12",peso_suggerito:"20",riposo_sec:75,note:"Inclinazione 30°",video_url:"https://www.youtube.com/watch?v=8iPEnn-ltC8",tecnica:"Manubri paralleli, gomiti a 45°, squeeze in alto" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 1 - Petto e Tricipiti",ordine:3,gruppo_muscolare:"Petto",esercizio:"Croci ai cavi alti",serie:3,ripetizioni:"12-15",peso_suggerito:"10",riposo_sec:60,note:"Squeeze al centro per 1 secondo",video_url:"",tecnica:"Gomiti leggermente flessi, movimento ad arco" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 1 - Petto e Tricipiti",ordine:4,gruppo_muscolare:"Tricipiti",esercizio:"French press manubrio",serie:3,ripetizioni:"10-12",peso_suggerito:"14",riposo_sec:60,note:"",video_url:"https://www.youtube.com/watch?v=ir5PsbniVSc",tecnica:"Gomiti fermi, solo avambraccio si muove" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 1 - Petto e Tricipiti",ordine:5,gruppo_muscolare:"Tricipiti",esercizio:"Pushdown al cavo",serie:3,ripetizioni:"12-15",peso_suggerito:"20",riposo_sec:60,note:"Ultima serie in drop set",video_url:"",tecnica:"Gomiti aderenti al corpo, estensione completa" },
  // Giorno 2 - Schiena e Bicipiti
  { scheda_id:"SCHEDA-001",giorno:"Giorno 2 - Schiena e Bicipiti",ordine:1,gruppo_muscolare:"Schiena",esercizio:"Trazioni alla sbarra",serie:4,ripetizioni:"6-8",peso_suggerito:"corpo",riposo_sec:120,note:"Aggiungere zavorra se superi 10 rep",video_url:"https://www.youtube.com/watch?v=eGo4IYlbE5g",tecnica:"Presa prona, tirata al petto, scapole depresse" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 2 - Schiena e Bicipiti",ordine:2,gruppo_muscolare:"Schiena",esercizio:"Rematore bilanciere",serie:4,ripetizioni:"8-10",peso_suggerito:"50",riposo_sec:90,note:"Busto a 45°, non arrotondare la schiena",video_url:"https://www.youtube.com/watch?v=kBWAon7ItDw",tecnica:"Tirare verso l'ombelico, contrarre i dorsali" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 2 - Schiena e Bicipiti",ordine:3,gruppo_muscolare:"Schiena",esercizio:"Lat machine avanti",serie:3,ripetizioni:"10-12",peso_suggerito:"45",riposo_sec:75,note:"",video_url:"",tecnica:"Presa larga, tirare verso il petto alto" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 2 - Schiena e Bicipiti",ordine:4,gruppo_muscolare:"Bicipiti",esercizio:"Curl bilanciere",serie:3,ripetizioni:"10-12",peso_suggerito:"25",riposo_sec:60,note:"Non dondolare il busto",video_url:"https://www.youtube.com/watch?v=kwG2ipFRgFo",tecnica:"Gomiti fissi ai fianchi, contrazione piena" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 2 - Schiena e Bicipiti",ordine:5,gruppo_muscolare:"Bicipiti",esercizio:"Curl manubri alternati",serie:3,ripetizioni:"10 per braccio",peso_suggerito:"12",riposo_sec:60,note:"Supinare durante la salita",video_url:"",tecnica:"Partire con presa neutra, ruotare in supinazione" },
  // Giorno 3 - Gambe e Spalle
  { scheda_id:"SCHEDA-001",giorno:"Giorno 3 - Gambe e Spalle",ordine:1,gruppo_muscolare:"Gambe",esercizio:"Squat bilanciere",serie:4,ripetizioni:"8-10",peso_suggerito:"70",riposo_sec:120,note:"Profondità: almeno parallelo",video_url:"https://www.youtube.com/watch?v=ultWZbUMPL8",tecnica:"Piedi larghezza spalle, punte leggermente fuori, petto alto" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 3 - Gambe e Spalle",ordine:2,gruppo_muscolare:"Gambe",esercizio:"Leg press 45°",serie:4,ripetizioni:"10-12",peso_suggerito:"120",riposo_sec:90,note:"Non bloccare le ginocchia in estensione",video_url:"",tecnica:"Piedi alti sulla pedana per enfatizzare glutei" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 3 - Gambe e Spalle",ordine:3,gruppo_muscolare:"Gambe",esercizio:"Leg curl sdraiato",serie:3,ripetizioni:"12",peso_suggerito:"30",riposo_sec:60,note:"",video_url:"",tecnica:"Contrazione piena, discesa controllata 3 secondi" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 3 - Gambe e Spalle",ordine:4,gruppo_muscolare:"Spalle",esercizio:"Military press manubri",serie:4,ripetizioni:"8-10",peso_suggerito:"16",riposo_sec:90,note:"Seduto su panca a 90°",video_url:"https://www.youtube.com/watch?v=qEwKCR5JCog",tecnica:"Non inarcare la schiena, core attivo" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 3 - Gambe e Spalle",ordine:5,gruppo_muscolare:"Spalle",esercizio:"Alzate laterali",serie:3,ripetizioni:"15",peso_suggerito:"8",riposo_sec:60,note:"Ultime 5 rep parziali se cedimento",video_url:"",tecnica:"Gomiti leggermente flessi, alzare fino a parallelo" },
  { scheda_id:"SCHEDA-001",giorno:"Giorno 3 - Gambe e Spalle",ordine:6,gruppo_muscolare:"Spalle",esercizio:"Face pull al cavo",serie:3,ripetizioni:"15",peso_suggerito:"15",riposo_sec:60,note:"Fondamentale per salute spalle",video_url:"https://www.youtube.com/watch?v=rep-qVOkqgk",tecnica:"Tirare verso la fronte, ruotare esternamente" },

  // SCHEDA-002 — Laura Bianchi — Tonificazione Total Body (4 giorni)
  // Giorno 1 - Upper Body Push
  { scheda_id:"SCHEDA-002",giorno:"Giorno 1 - Upper Body Push",ordine:1,gruppo_muscolare:"Petto",esercizio:"Push-up",serie:3,ripetizioni:"12-15",peso_suggerito:"corpo",riposo_sec:45,note:"Se troppo facili, aggiungere peso sulla schiena",video_url:"https://www.youtube.com/watch?v=IODxDxX7oi4",tecnica:"Corpo rigido come una tavola, petto sfiora il pavimento" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 1 - Upper Body Push",ordine:2,gruppo_muscolare:"Petto",esercizio:"Chest press macchina",serie:3,ripetizioni:"12",peso_suggerito:"15",riposo_sec:45,note:"",video_url:"",tecnica:"Scapole addotte, movimento controllato" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 1 - Upper Body Push",ordine:3,gruppo_muscolare:"Spalle",esercizio:"Shoulder press manubri",serie:3,ripetizioni:"12",peso_suggerito:"8",riposo_sec:60,note:"Alternare con Arnold press ogni 2 settimane",video_url:"https://www.youtube.com/watch?v=qEwKCR5JCog",tecnica:"Partire da altezza orecchie, estendere senza bloccare" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 1 - Upper Body Push",ordine:4,gruppo_muscolare:"Spalle",esercizio:"Alzate laterali",serie:3,ripetizioni:"15",peso_suggerito:"5",riposo_sec:45,note:"",video_url:"",tecnica:"Gomiti a 90°, non superare linea spalle" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 1 - Upper Body Push",ordine:5,gruppo_muscolare:"Tricipiti",esercizio:"Dip alla panca",serie:3,ripetizioni:"12",peso_suggerito:"corpo",riposo_sec:45,note:"Gambe distese per aumentare difficoltà",video_url:"",tecnica:"Scendere fino a 90° gomiti, non di più" },
  // Giorno 2 - Lower Body
  { scheda_id:"SCHEDA-002",giorno:"Giorno 2 - Lower Body",ordine:1,gruppo_muscolare:"Glutei",esercizio:"Hip thrust bilanciere",serie:4,ripetizioni:"12",peso_suggerito:"40",riposo_sec:60,note:"Pausa 2 sec in alto con squeeze",video_url:"https://www.youtube.com/watch?v=xDmFkJxPzeM",tecnica:"Schiena appoggiata alla panca, mento al petto in alto" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 2 - Lower Body",ordine:2,gruppo_muscolare:"Gambe",esercizio:"Goblet squat",serie:3,ripetizioni:"15",peso_suggerito:"14",riposo_sec:60,note:"Mantenere il petto alto",video_url:"https://www.youtube.com/watch?v=MeIiIdhvXT4",tecnica:"Manubrio al petto, gomiti tra le ginocchia" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 2 - Lower Body",ordine:3,gruppo_muscolare:"Gambe",esercizio:"Affondi camminati",serie:3,ripetizioni:"12 per gamba",peso_suggerito:"8",riposo_sec:60,note:"",video_url:"",tecnica:"Passo lungo, ginocchio posteriore sfiora il pavimento" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 2 - Lower Body",ordine:4,gruppo_muscolare:"Gambe",esercizio:"Leg extension",serie:3,ripetizioni:"15",peso_suggerito:"20",riposo_sec:45,note:"Contrazione piena in alto per 1 sec",video_url:"",tecnica:"Schiena aderente allo schienale" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 2 - Lower Body",ordine:5,gruppo_muscolare:"Gambe",esercizio:"Leg curl seduto",serie:3,ripetizioni:"15",peso_suggerito:"20",riposo_sec:45,note:"",video_url:"",tecnica:"Contrazione piena, eccentrica lenta" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 2 - Lower Body",ordine:6,gruppo_muscolare:"Polpacci",esercizio:"Calf raise in piedi",serie:4,ripetizioni:"20",peso_suggerito:"30",riposo_sec:30,note:"Pausa 2 sec in basso (stretch) e in alto",video_url:"",tecnica:"Range completo, non rimbalzare" },
  // Giorno 3 - Upper Body Pull
  { scheda_id:"SCHEDA-002",giorno:"Giorno 3 - Upper Body Pull",ordine:1,gruppo_muscolare:"Schiena",esercizio:"Lat machine avanti",serie:3,ripetizioni:"12",peso_suggerito:"30",riposo_sec:60,note:"Focus sulla connessione mente-muscolo",video_url:"https://www.youtube.com/watch?v=CAwf7n6Luuc",tecnica:"Presa larga, tirare con i gomiti verso i fianchi" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 3 - Upper Body Pull",ordine:2,gruppo_muscolare:"Schiena",esercizio:"Rematore manubrio",serie:3,ripetizioni:"12 per braccio",peso_suggerito:"10",riposo_sec:60,note:"",video_url:"",tecnica:"Busto parallelo alla panca, tirare verso il fianco" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 3 - Upper Body Pull",ordine:3,gruppo_muscolare:"Schiena",esercizio:"Pulley basso",serie:3,ripetizioni:"12",peso_suggerito:"25",riposo_sec:60,note:"Schiena dritta, non oscillare",video_url:"",tecnica:"Presa stretta triangolo, petto in fuori" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 3 - Upper Body Pull",ordine:4,gruppo_muscolare:"Bicipiti",esercizio:"Curl manubri seduta",serie:3,ripetizioni:"12",peso_suggerito:"7",riposo_sec:45,note:"",video_url:"https://www.youtube.com/watch?v=ykJmrZ5v0Oo",tecnica:"Panca inclinata 45°, supinazione piena" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 3 - Upper Body Pull",ordine:5,gruppo_muscolare:"Posteriore spalla",esercizio:"Face pull",serie:3,ripetizioni:"15",peso_suggerito:"10",riposo_sec:45,note:"Essenziale per postura",video_url:"",tecnica:"Corda al cavo alto, tirare verso il viso" },
  // Giorno 4 - Full Body Circuit
  { scheda_id:"SCHEDA-002",giorno:"Giorno 4 - Full Body Circuit",ordine:1,gruppo_muscolare:"Total Body",esercizio:"Burpees",serie:3,ripetizioni:"10",peso_suggerito:"corpo",riposo_sec:30,note:"Circuito: poco riposo tra esercizi",video_url:"https://www.youtube.com/watch?v=dZgVxmf6jkA",tecnica:"Push-up completo in basso, salto in alto" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 4 - Full Body Circuit",ordine:2,gruppo_muscolare:"Total Body",esercizio:"Kettlebell swing",serie:3,ripetizioni:"15",peso_suggerito:"12",riposo_sec:30,note:"",video_url:"https://www.youtube.com/watch?v=YSxHifyI6s8",tecnica:"Hinge all'anca, braccia rilassate, potenza dai glutei" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 4 - Full Body Circuit",ordine:3,gruppo_muscolare:"Core",esercizio:"Plank",serie:3,ripetizioni:"45 sec",peso_suggerito:"corpo",riposo_sec:30,note:"Se facile, provare plank con reach",video_url:"",tecnica:"Corpo rigido, glutei e core contratti" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 4 - Full Body Circuit",ordine:4,gruppo_muscolare:"Gambe",esercizio:"Jump squat",serie:3,ripetizioni:"12",peso_suggerito:"corpo",riposo_sec:30,note:"",video_url:"",tecnica:"Atterrare morbidi, ginocchia in fuori" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 4 - Full Body Circuit",ordine:5,gruppo_muscolare:"Core",esercizio:"Mountain climbers",serie:3,ripetizioni:"20 per gamba",peso_suggerito:"corpo",riposo_sec:30,note:"",video_url:"",tecnica:"Spalle sopra i polsi, velocità controllata" },
  { scheda_id:"SCHEDA-002",giorno:"Giorno 4 - Full Body Circuit",ordine:6,gruppo_muscolare:"Total Body",esercizio:"Thruster manubri",serie:3,ripetizioni:"12",peso_suggerito:"8",riposo_sec:45,note:"Ultimo esercizio: dare tutto!",video_url:"",tecnica:"Squat + shoulder press in un movimento fluido" },

  // SCHEDA-003 — Andrea Verdi — Forza Base (3 giorni)
  // Giorno 1 - Squat Day
  { scheda_id:"SCHEDA-003",giorno:"Giorno 1 - Squat Day",ordine:1,gruppo_muscolare:"Gambe",esercizio:"Back squat",serie:5,ripetizioni:"5",peso_suggerito:"100",riposo_sec:180,note:"RPE 8. Ultimo set AMRAP",video_url:"https://www.youtube.com/watch?v=ultWZbUMPL8",tecnica:"Low bar, petto alto, respiro in alto, core bloccato" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 1 - Squat Day",ordine:2,gruppo_muscolare:"Gambe",esercizio:"Front squat",serie:3,ripetizioni:"6-8",peso_suggerito:"60",riposo_sec:120,note:"Complementare al back squat",video_url:"https://www.youtube.com/watch?v=m4ytaCJZpl0",tecnica:"Gomiti alti, presa clean o incrociata" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 1 - Squat Day",ordine:3,gruppo_muscolare:"Gambe",esercizio:"Leg press",serie:3,ripetizioni:"10",peso_suggerito:"160",riposo_sec:90,note:"Volume accessorio",video_url:"",tecnica:"Piedi al centro, range completo" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 1 - Squat Day",ordine:4,gruppo_muscolare:"Gambe",esercizio:"Romanian deadlift",serie:3,ripetizioni:"10",peso_suggerito:"60",riposo_sec:90,note:"Focus sugli ischiocrurali",video_url:"https://www.youtube.com/watch?v=JCXUYuzwNrM",tecnica:"Bilanciere vicino alle gambe, hinge all'anca" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 1 - Squat Day",ordine:5,gruppo_muscolare:"Core",esercizio:"Plank con peso",serie:3,ripetizioni:"60 sec",peso_suggerito:"10",riposo_sec:60,note:"Disco sulla schiena",video_url:"",tecnica:"Posizione neutra, non far cadere i fianchi" },
  // Giorno 2 - Bench Day
  { scheda_id:"SCHEDA-003",giorno:"Giorno 2 - Bench Day",ordine:1,gruppo_muscolare:"Petto",esercizio:"Panca piana bilanciere",serie:5,ripetizioni:"5",peso_suggerito:"85",riposo_sec:180,note:"RPE 8. Setup: arco, scapole, piedi",video_url:"https://www.youtube.com/watch?v=rT7DgCr-3pg",tecnica:"Presa 1.5× larghezza spalle, discesa controllata" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 2 - Bench Day",ordine:2,gruppo_muscolare:"Petto",esercizio:"Panca inclinata bilanciere",serie:3,ripetizioni:"8",peso_suggerito:"55",riposo_sec:120,note:"",video_url:"",tecnica:"Inclinazione 30°, stessa tecnica della piana" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 2 - Bench Day",ordine:3,gruppo_muscolare:"Spalle",esercizio:"Military press in piedi",serie:4,ripetizioni:"6",peso_suggerito:"45",riposo_sec:120,note:"Complemento petto e deltoidi anteriori",video_url:"https://www.youtube.com/watch?v=2yjwXTZQDDI",tecnica:"Bilanciere dalla clavicola, push verticale, core stretto" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 2 - Bench Day",ordine:4,gruppo_muscolare:"Tricipiti",esercizio:"Dip alle parallele",serie:3,ripetizioni:"8-10",peso_suggerito:"corpo",riposo_sec:90,note:"Aggiungere zavorra se > 12 rep",video_url:"",tecnica:"Busto leggermente inclinato, gomiti indietro" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 2 - Bench Day",ordine:5,gruppo_muscolare:"Tricipiti",esercizio:"Skull crusher EZ",serie:3,ripetizioni:"10",peso_suggerito:"25",riposo_sec:60,note:"",video_url:"",tecnica:"Barra alla fronte, gomiti fissi, solo avambraccio" },
  // Giorno 3 - Deadlift Day
  { scheda_id:"SCHEDA-003",giorno:"Giorno 3 - Deadlift Day",ordine:1,gruppo_muscolare:"Schiena",esercizio:"Stacco da terra convenzionale",serie:5,ripetizioni:"5",peso_suggerito:"120",riposo_sec:180,note:"RPE 8. Reset ad ogni rep",video_url:"https://www.youtube.com/watch?v=op9kVnSso6Q",tecnica:"Piedi sotto le anche, presa mista o hook, schiena neutra" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 3 - Deadlift Day",ordine:2,gruppo_muscolare:"Schiena",esercizio:"Deficit deadlift",serie:3,ripetizioni:"6",peso_suggerito:"90",riposo_sec:120,note:"Rialzo 5cm, per migliorare stacco dal pavimento",video_url:"",tecnica:"Stessa tecnica del convenzionale, più range" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 3 - Deadlift Day",ordine:3,gruppo_muscolare:"Schiena",esercizio:"Barbell row pesante",serie:4,ripetizioni:"6-8",peso_suggerito:"70",riposo_sec:90,note:"Complemento per dorsali e trapezio",video_url:"https://www.youtube.com/watch?v=kBWAon7ItDw",tecnica:"Busto a 45°, tirata esplosiva all'ombelico" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 3 - Deadlift Day",ordine:4,gruppo_muscolare:"Schiena",esercizio:"Trazioni presa neutra",serie:3,ripetizioni:"8",peso_suggerito:"corpo",riposo_sec:90,note:"Zavorra se necessario",video_url:"",tecnica:"Presa neutra, tirata al petto, discesa controllata" },
  { scheda_id:"SCHEDA-003",giorno:"Giorno 3 - Deadlift Day",ordine:5,gruppo_muscolare:"Core",esercizio:"Ab wheel rollout",serie:3,ripetizioni:"10",peso_suggerito:"corpo",riposo_sec:60,note:"Da ginocchia, estendere il più possibile",video_url:"",tecnica:"Core stretto, non inarcare la lombare" },

  // Schede passate (dati minimi per storico)
  { scheda_id:"SCHEDA-004",giorno:"Giorno 1 - Full Body A",ordine:1,gruppo_muscolare:"Total Body",esercizio:"Squat al multipower",serie:3,ripetizioni:"12",peso_suggerito:"30",riposo_sec:60,note:"Scheda introduttiva",video_url:"",tecnica:"Imparare il movimento base" },
  { scheda_id:"SCHEDA-004",giorno:"Giorno 2 - Full Body B",ordine:1,gruppo_muscolare:"Total Body",esercizio:"Chest press macchina",serie:3,ripetizioni:"12",peso_suggerito:"10",riposo_sec:60,note:"",video_url:"",tecnica:"Movimento guidato, focus sulla forma" },
  { scheda_id:"SCHEDA-005",giorno:"Giorno 1 - Cardio Forza",ordine:1,gruppo_muscolare:"Total Body",esercizio:"Circuit training",serie:4,ripetizioni:"30 sec",peso_suggerito:"corpo",riposo_sec:30,note:"Circuito base per condizionamento",video_url:"",tecnica:"Mantenere intensità costante" },
];

// ============================================
// FINE DATI DEMO
// ============================================

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

// --- Bottom Nav ---
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

// --- Rest Timer ---
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
            try { navigator.vibrate && navigator.vibrate([200, 100, 200, 100, 200]); } catch(e) {}
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
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "32px",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#222" strokeWidth="8" />
          <circle cx="110" cy="110" r={radius} fill="none" stroke={remaining === 0 ? "#22c55e" : primaryColor}
            strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "48px", fontWeight: 800, color: "#FFF", fontVariantNumeric: "tabular-nums", letterSpacing: "-2px" }}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          {remaining === 0 && <span style={{ fontSize: "14px", color: "#22c55e", fontWeight: 600, marginTop: 4 }}>TEMPO SCADUTO!</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={() => adjust(-15)} style={{
          background: "#222", border: "none", borderRadius: "50%", width: 56, height: 56,
          color: "#FFF", fontSize: "14px", fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>-15s</button>
        <button onClick={() => setRunning(!running)} style={{
          background: primaryColor, border: "none", borderRadius: "50%", width: 56, height: 56,
          color: "#FFF", fontSize: "13px", fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{running ? "⏸" : "▶"}</button>
        <button onClick={() => adjust(15)} style={{
          background: "#222", border: "none", borderRadius: "50%", width: 56, height: 56,
          color: "#FFF", fontSize: "14px", fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+15s</button>
      </div>
      <button onClick={onClose} style={{
        background: "none", border: `1px solid ${styles.cardBorder}`, borderRadius: 12,
        color: "#FFF", padding: "12px 48px", cursor: "pointer", fontSize: "15px", fontWeight: 600,
      }}>Chiudi</button>
    </div>
  );
}

// --- Video Modal ---
function VideoModal({ videoUrl, onClose }) {
  const id = getYouTubeId(videoUrl);
  if (!id) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.2s ease",
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16, background: "none", border: "none",
        color: "#FFF", cursor: "pointer", zIndex: 10,
      }}><X size={28} /></button>
      <div style={{ width: "100%", maxWidth: 480, aspectRatio: "16/9", borderRadius: 12, overflow: "hidden" }}>
        <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="autoplay; encrypted-media" allowFullScreen />
      </div>
    </div>
  );
}

// --- Exercise Card ---
function ExerciseCard({ ex, primaryColor, onTimer, onVideo, progress, onLogWeight }) {
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
      border: `1px solid ${styles.cardBorder}`, marginBottom: 12,
      transition: "all 0.2s",
    }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "16px", display: "flex", alignItems: "center", gap: "12px",
        color: styles.textPrimary, textAlign: "left",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: `${primaryColor}22`, flexShrink: 0,
        }}>
          <Dumbbell size={20} color={primaryColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: 2 }}>{ex.esercizio}</div>
          <div style={{ fontSize: "13px", color: styles.textSecondary }}>
            {ex.serie} × {ex.ripetizioni} {ex.peso_suggerito !== "corpo" ? `• ${ex.peso_suggerito} kg` : "• Corpo libero"}
          </div>
        </div>
        <div style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <ChevronDown size={20} color={styles.textMuted} />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px", animation: "slideDown 0.25s ease" }}>
          {/* Stats Row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ background: "#222", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 80, textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: styles.textSecondary, marginBottom: 2 }}>SERIE</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", fontVariantNumeric: "tabular-nums" }}>{ex.serie}</div>
            </div>
            <div style={{ background: "#222", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 80, textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: styles.textSecondary, marginBottom: 2 }}>REPS</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", fontVariantNumeric: "tabular-nums" }}>{ex.ripetizioni}</div>
            </div>
            <div style={{ background: "#222", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 80, textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: styles.textSecondary, marginBottom: 2 }}>RIPOSO</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", fontVariantNumeric: "tabular-nums" }}>{ex.riposo_sec}s</div>
            </div>
          </div>

          {/* Peso suggerito */}
          <div style={{ background: `${primaryColor}15`, borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={16} color={primaryColor} />
            <span style={{ fontSize: "13px", color: styles.textSecondary }}>Peso suggerito:</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: primaryColor }}>{ex.peso_suggerito === "corpo" ? "Corpo libero" : `${ex.peso_suggerito} kg`}</span>
          </div>

          {/* Log peso */}
          <div style={{ background: "#222", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: "12px", color: styles.textSecondary, marginBottom: 6 }}>IL TUO PESO OGGI</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={weightInput} onChange={e => setWeightInput(e.target.value)}
                placeholder="kg" type="number" inputMode="decimal"
                style={{
                  flex: 1, background: "#333", border: "1px solid #444", borderRadius: 8,
                  padding: "8px 12px", color: "#FFF", fontSize: "16px", fontWeight: 700,
                  outline: "none", fontVariantNumeric: "tabular-nums",
                }}
                onFocus={e => e.target.style.borderColor = primaryColor}
                onBlur={e => e.target.style.borderColor = "#444"}
              />
              <button onClick={handleLog} style={{
                background: primaryColor, border: "none", borderRadius: 8, padding: "8px 16px",
                color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap",
              }}>Salva</button>
            </div>
            {logged.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {logged.slice(-5).map((l, i) => (
                  <span key={i} style={{
                    background: "#333", borderRadius: 6, padding: "3px 8px",
                    fontSize: "11px", color: styles.textSecondary,
                  }}>{l.date}: <b style={{ color: "#FFF" }}>{l.weight}kg</b></span>
                ))}
              </div>
            )}
          </div>

          {/* Trainer notes */}
          {ex.note && (
            <div style={{ background: "#1E1A14", border: `1px solid ${primaryColor}33`, borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertCircle size={16} color={primaryColor} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: "13px", color: "#E0C080", lineHeight: 1.4 }}>{ex.note}</span>
            </div>
          )}

          {/* Tecnica */}
          {ex.tecnica && (
            <button onClick={() => setShowTech(!showTech)} style={{
              width: "100%", background: "none", border: `1px solid ${styles.cardBorder}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              color: styles.textSecondary, textAlign: "left",
            }}>
              <Info size={16} />
              <span style={{ flex: 1, fontSize: "13px" }}>{showTech ? ex.tecnica : "Mostra tecnica"}</span>
            </button>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onTimer(ex.riposo_sec)} style={{
              flex: 1, background: `${primaryColor}22`, border: `1px solid ${primaryColor}44`,
              borderRadius: 10, padding: "10px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              color: primaryColor, fontWeight: 700, fontSize: "13px",
            }}>
              <Timer size={16} /> Riposo {ex.riposo_sec}s
            </button>
            {ex.video_url && (
              <button onClick={() => onVideo(ex.video_url)} style={{
                flex: 1, background: "#222", border: `1px solid ${styles.cardBorder}`,
                borderRadius: 10, padding: "10px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                color: "#FFF", fontWeight: 700, fontSize: "13px",
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

// --- Login Screen ---
function LoginScreen({ config, onLogin, error }) {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div style={{
      minHeight: "100vh", background: styles.bg, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 24px",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20, background: `${styles.primary}22`,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
        border: `2px solid ${styles.primary}44`,
      }}>
        <Dumbbell size={40} color={styles.primary} />
      </div>
      <h1 style={{ color: "#FFF", fontSize: "28px", fontWeight: 900, marginBottom: 4, letterSpacing: "-0.5px" }}>
        {config.nome_palestra}
      </h1>
      <p style={{ color: styles.textSecondary, fontSize: "14px", marginBottom: 40, fontStyle: "italic" }}>
        {config.slogan}
      </p>

      <div style={{ width: "100%", maxWidth: 320 }}>
        <label style={{ display: "block", fontSize: "12px", color: styles.textSecondary, marginBottom: 6, fontWeight: 600, letterSpacing: "1px" }}>
          CODICE CLIENTE
        </label>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="es. MG-001"
          style={{
            width: "100%", background: styles.card, border: `1px solid ${styles.cardBorder}`,
            borderRadius: 12, padding: "14px 16px", color: "#FFF", fontSize: "16px",
            fontWeight: 700, outline: "none", marginBottom: 16, boxSizing: "border-box",
            letterSpacing: "1px",
          }} />

        <label style={{ display: "block", fontSize: "12px", color: styles.textSecondary, marginBottom: 6, fontWeight: 600, letterSpacing: "1px" }}>
          PIN
        </label>
        <input value={pin} onChange={e => setPin(e.target.value.slice(0, 4))}
          placeholder="• • • •" type="password" inputMode="numeric"
          style={{
            width: "100%", background: styles.card, border: `1px solid ${styles.cardBorder}`,
            borderRadius: 12, padding: "14px 16px", color: "#FFF", fontSize: "20px",
            fontWeight: 700, outline: "none", marginBottom: 8, boxSizing: "border-box",
            letterSpacing: "8px", textAlign: "center",
          }} />

        {error && (
          <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", marginBottom: 8 }}>{error}</p>
        )}

        <button onClick={() => onLogin(code, pin)} style={{
          width: "100%", background: styles.primary, border: "none", borderRadius: 12,
          padding: "16px", color: "#FFF", fontSize: "16px", fontWeight: 800,
          cursor: "pointer", marginTop: 16, letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}>
          Accedi
        </button>
      </div>
    </div>
  );
}

// --- Dashboard ---
function Dashboard({ cliente, scheda, esercizi, primaryColor, onSelectDay, onSync, lastSync }) {
  const giorni = useMemo(() => {
    if (!esercizi) return [];
    const unique = [...new Set(esercizi.filter(e => e.scheda_id === scheda.scheda_id).map(e => e.giorno))];
    return unique.map(g => ({
      nome: g,
      count: esercizi.filter(e => e.scheda_id === scheda.scheda_id && e.giorno === g).length,
    }));
  }, [esercizi, scheda]);

  const daysLeft = daysUntil(scheda.data_scadenza);

  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: styles.bg }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#FFF", fontSize: "24px", fontWeight: 900, marginBottom: 2 }}>
          Ciao {cliente.nome}! 💪
        </h1>
        <p style={{ color: styles.textSecondary, fontSize: "14px" }}>Pronto per allenarti?</p>
      </div>

      {/* Active card */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}08)`,
        borderRadius: 20, padding: "20px", marginBottom: 24,
        border: `1px solid ${primaryColor}33`, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `${primaryColor}11` }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: "11px", color: primaryColor, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>SCHEDA ATTIVA</div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFF" }}>{scheda.nome_scheda}</div>
          </div>
          {daysLeft <= 7 && daysLeft > 0 && (
            <span style={{
              background: "#ef444422", color: "#ef4444", fontSize: "11px", fontWeight: 700,
              padding: "4px 10px", borderRadius: 8,
            }}>Scade tra {daysLeft}g</span>
          )}
          {daysLeft <= 0 && (
            <span style={{
              background: "#ef444422", color: "#ef4444", fontSize: "11px", fontWeight: 700,
              padding: "4px 10px", borderRadius: 8,
            }}>Scaduta</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16 }}>
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
          <div style={{ marginTop: 12, fontSize: "12px", color: styles.textSecondary, fontStyle: "italic", borderTop: `1px solid ${primaryColor}22`, paddingTop: 10 }}>
            💡 {scheda.note_trainer}
          </div>
        )}
      </div>

      {/* Giorni */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: "#FFF", fontSize: "16px", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.3px" }}>
          I TUOI ALLENAMENTI
        </h2>
        {giorni.map((g, i) => (
          <button key={g.nome} onClick={() => onSelectDay(g.nome)}
            style={{
              width: "100%", background: styles.card, border: `1px solid ${styles.cardBorder}`,
              borderRadius: 14, padding: "16px", marginBottom: 10, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "12px", textAlign: "left",
              transition: "border-color 0.2s",
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = primaryColor + "66"}
            onMouseOut={e => e.currentTarget.style.borderColor = styles.cardBorder}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${primaryColor}22`, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: 900, color: primaryColor,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#FFF", fontSize: "15px", fontWeight: 700 }}>{g.nome}</div>
              <div style={{ color: styles.textSecondary, fontSize: "13px" }}>{g.count} esercizi</div>
            </div>
            <ChevronRight size={20} color={styles.textMuted} />
          </button>
        ))}
      </div>

      {/* Sync */}
      <button onClick={onSync} style={{
        width: "100%", background: "#161616", border: `1px solid ${styles.cardBorder}`,
        borderRadius: 12, padding: "12px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        color: styles.textSecondary, fontSize: "13px",
      }}>
        <RefreshCw size={14} />
        Aggiorna scheda {lastSync && `• Ultimo sync: ${lastSync}`}
      </button>
    </div>
  );
}

// --- Workout Day ---
function WorkoutDay({ giorno, esercizi, primaryColor, onBack, onTimer, onVideo, progressData, onLogWeight }) {
  const grouped = useMemo(() => {
    const groups = {};
    esercizi.sort((a, b) => a.ordine - b.ordine).forEach(e => {
      if (!groups[e.gruppo_muscolare]) groups[e.gruppo_muscolare] = [];
      groups[e.gruppo_muscolare].push(e);
    });
    return groups;
  }, [esercizi]);

  return (
    <div style={{ padding: "0 16px 100px", minHeight: "100vh", background: styles.bg }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50, background: styles.bg,
        padding: "16px 0 12px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${styles.cardBorder}`,
      }}>
        <button onClick={onBack} style={{
          background: "#222", border: "none", borderRadius: 10, width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
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
              fontSize: "11px", fontWeight: 800, color: primaryColor,
              letterSpacing: "2px", marginBottom: 10, paddingLeft: 4,
              textTransform: "uppercase",
            }}>{group}</div>
            {exs.map(ex => (
              <ExerciseCard key={ex.ordine} ex={ex} primaryColor={primaryColor}
                onTimer={onTimer} onVideo={onVideo}
                progress={progressData[`${ex.esercizio}__${ex.scheda_id}`] || []}
                onLogWeight={onLogWeight}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Progress Tracker ---
function ProgressTracker({ progressData, primaryColor, esercizi, schedaAttiva }) {
  const [selectedEx, setSelectedEx] = useState(null);

  const activeExercises = useMemo(() => {
    return esercizi.filter(e => e.scheda_id === schedaAttiva)
      .map(e => e.esercizio)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [esercizi, schedaAttiva]);

  const todayLogs = useMemo(() => {
    const today = new Date().toLocaleDateString("it-IT");
    const logs = [];
    Object.entries(progressData).forEach(([key, entries]) => {
      entries.forEach(entry => {
        if (entry.date === today) {
          logs.push({ exercise: key.split("__")[0], weight: entry.weight });
        }
      });
    });
    return logs;
  }, [progressData]);

  const selectedData = selectedEx ? (progressData[`${selectedEx}__${schedaAttiva}`] || []) : [];

  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: styles.bg }}>
      <h1 style={{ color: "#FFF", fontSize: "24px", fontWeight: 900, marginBottom: 4 }}>Progressi 📊</h1>
      <p style={{ color: styles.textSecondary, fontSize: "14px", marginBottom: 24 }}>Monitora i tuoi miglioramenti</p>

      {/* Today summary */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor}15, transparent)`,
        borderRadius: 16, padding: "16px", marginBottom: 24,
        border: `1px solid ${primaryColor}22`,
      }}>
        <div style={{ fontSize: "11px", color: primaryColor, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 10 }}>
          SESSIONE DI OGGI
        </div>
        {todayLogs.length === 0 ? (
          <p style={{ color: styles.textSecondary, fontSize: "13px", margin: 0 }}>Nessun peso registrato oggi. Vai alla scheda e inizia ad allenarti! 💪</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {todayLogs.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#FFF", fontSize: "14px" }}>{l.exercise}</span>
                <span style={{ color: primaryColor, fontWeight: 700, fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{l.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercise selector */}
      <h2 style={{ color: "#FFF", fontSize: "16px", fontWeight: 800, marginBottom: 12 }}>STORICO PER ESERCIZIO</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {activeExercises.map(ex => (
          <button key={ex} onClick={() => setSelectedEx(selectedEx === ex ? null : ex)}
            style={{
              background: selectedEx === ex ? primaryColor : "#222",
              border: `1px solid ${selectedEx === ex ? primaryColor : styles.cardBorder}`,
              borderRadius: 8, padding: "6px 12px", cursor: "pointer",
              color: selectedEx === ex ? "#FFF" : styles.textSecondary,
              fontSize: "12px", fontWeight: 600, transition: "all 0.2s",
            }}>
            {ex}
          </button>
        ))}
      </div>

      {selectedEx && (
        <div style={{ background: styles.card, borderRadius: 16, padding: "16px", border: `1px solid ${styles.cardBorder}` }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#FFF", marginBottom: 12 }}>{selectedEx}</div>
          {selectedData.length === 0 ? (
            <p style={{ color: styles.textSecondary, fontSize: "13px" }}>Nessun dato registrato per questo esercizio.</p>
          ) : (
            <>
              {/* Simple bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, marginBottom: 12 }}>
                {selectedData.slice(-10).map((d, i) => {
                  const max = Math.max(...selectedData.slice(-10).map(x => parseFloat(x.weight) || 0));
                  const val = parseFloat(d.weight) || 0;
                  const h = max > 0 ? (val / max) * 100 : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: "10px", color: "#FFF", fontWeight: 700 }}>{d.weight}</span>
                      <div style={{
                        width: "100%", height: `${h}%`, minHeight: 4,
                        background: `linear-gradient(to top, ${primaryColor}, ${primaryColor}88)`,
                        borderRadius: "4px 4px 0 0", transition: "height 0.3s",
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

// --- Workout History ---
function WorkoutHistory({ cliente, schede, esercizi, primaryColor }) {
  const [openScheda, setOpenScheda] = useState(null);

  const allSchedaIds = useMemo(() => {
    const ids = [cliente.scheda_attiva];
    if (cliente.schede_passate) {
      cliente.schede_passate.split(",").map(s => s.trim()).filter(Boolean).forEach(id => ids.push(id));
    }
    return ids;
  }, [cliente]);

  const schedeList = useMemo(() => {
    return allSchedaIds.map(id => schede.find(s => s.scheda_id === id)).filter(Boolean);
  }, [allSchedaIds, schede]);

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
            border: `1px solid ${isActive ? primaryColor + "44" : styles.cardBorder}`,
            overflow: "hidden",
          }}>
            <button onClick={() => setOpenScheda(isOpen ? null : s.scheda_id)} style={{
              width: "100%", background: "none", border: "none", cursor: "pointer",
              padding: "16px", display: "flex", alignItems: "center", gap: 12,
              color: "#FFF", textAlign: "left",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: isActive ? `${primaryColor}22` : "#222",
              }}>
                <ClipboardList size={20} color={isActive ? primaryColor : styles.textMuted} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700 }}>{s.nome_scheda}</span>
                  {isActive && (
                    <span style={{
                      background: primaryColor, color: "#FFF", fontSize: "9px", fontWeight: 800,
                      padding: "2px 8px", borderRadius: 4, letterSpacing: "1px",
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
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${styles.cardBorder}`, paddingTop: 12 }}>
                {s.note_trainer && (
                  <p style={{ color: styles.textSecondary, fontSize: "12px", fontStyle: "italic", marginBottom: 12 }}>
                    💡 {s.note_trainer}
                  </p>
                )}
                {giorni.map(g => {
                  const dayExs = exs.filter(e => e.giorno === g).sort((a, b) => a.ordine - b.ordine);
                  return (
                    <div key={g} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: primaryColor, marginBottom: 6, letterSpacing: "0.5px" }}>{g}</div>
                      {dayExs.map(e => (
                        <div key={e.ordine} style={{
                          display: "flex", justifyContent: "space-between", padding: "6px 0",
                          borderBottom: `1px solid ${styles.cardBorder}22`,
                        }}>
                          <span style={{ color: "#FFF", fontSize: "13px" }}>{e.esercizio}</span>
                          <span style={{ color: styles.textSecondary, fontSize: "13px", fontVariantNumeric: "tabular-nums" }}>
                            {e.serie}×{e.ripetizioni}
                          </span>
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

// --- Profile Screen ---
function ProfileScreen({ cliente, config, primaryColor, onLogout }) {
  return (
    <div style={{ padding: "20px 16px 100px", minHeight: "100vh", background: styles.bg }}>
      <h1 style={{ color: "#FFF", fontSize: "24px", fontWeight: 900, marginBottom: 24 }}>Profilo ⚙️</h1>

      {/* User info */}
      <div style={{
        background: styles.card, borderRadius: 16, padding: "20px", marginBottom: 16,
        border: `1px solid ${styles.cardBorder}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: `${primaryColor}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <User size={28} color={primaryColor} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFF" }}>{cliente.nome} {cliente.cognome}</div>
            <div style={{ fontSize: "13px", color: styles.textSecondary }}>Codice: {cliente.codice}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: styles.textSecondary, fontSize: "13px" }}>Email</span>
            <span style={{ color: "#FFF", fontSize: "13px" }}>{cliente.email}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: styles.textSecondary, fontSize: "13px" }}>Iscritto dal</span>
            <span style={{ color: "#FFF", fontSize: "13px" }}>{formatDate(cliente.data_iscrizione)}</span>
          </div>
        </div>
      </div>

      {/* Gym contacts */}
      <div style={{
        background: styles.card, borderRadius: 16, padding: "20px", marginBottom: 16,
        border: `1px solid ${styles.cardBorder}`,
      }}>
        <div style={{ fontSize: "12px", color: primaryColor, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 16 }}>
          LA TUA PALESTRA
        </div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", marginBottom: 12 }}>{config.nome_palestra}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MapPin size={16} color={styles.textSecondary} />
            <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{config.indirizzo}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Phone size={16} color={styles.textSecondary} />
            <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{config.telefono}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Instagram size={16} color={styles.textSecondary} />
            <span style={{ color: styles.textSecondary, fontSize: "13px" }}>{config.instagram}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <a href={`tel:${config.telefono}`} style={{
            flex: 1, background: `${primaryColor}22`, border: `1px solid ${primaryColor}44`,
            borderRadius: 10, padding: "12px", cursor: "pointer", textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            color: primaryColor, fontWeight: 700, fontSize: "13px",
          }}>
            <Phone size={16} /> Chiama
          </a>
          <a href={`https://instagram.com/${config.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{
            flex: 1, background: "#222", border: `1px solid ${styles.cardBorder}`,
            borderRadius: 10, padding: "12px", cursor: "pointer", textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            color: "#FFF", fontWeight: 700, fontSize: "13px",
          }}>
            <Instagram size={16} /> Instagram
          </a>
        </div>
      </div>

      {/* Logout */}
      <button onClick={onLogout} style={{
        width: "100%", background: "#1C1111", border: "1px solid #3A1111",
        borderRadius: 12, padding: "14px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        color: "#ef4444", fontWeight: 700, fontSize: "14px",
      }}>
        <LogOut size={16} /> Esci
      </button>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function GymApp() {
  // Auth state
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [savedCode, setSavedCode] = useState(null);

  // Data state
  const [currentCliente, setCurrentCliente] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Overlays
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  // Progress tracking
  const [progressData, setProgressData] = useState({});

  const config = DEMO_CONFIG;
  const primaryColor = config.colore_primario;

  // Get current scheda
  const currentScheda = useMemo(() => {
    if (!currentCliente) return null;
    return DEMO_SCHEDE.find(s => s.scheda_id === currentCliente.scheda_attiva);
  }, [currentCliente]);

  // Get current day exercises
  const dayExercises = useMemo(() => {
    if (!selectedDay || !currentCliente) return [];
    return DEMO_ESERCIZI.filter(e => e.scheda_id === currentCliente.scheda_attiva && e.giorno === selectedDay);
  }, [selectedDay, currentCliente]);

  // Login handler
  const handleLogin = useCallback((code, pin) => {
    const cliente = DEMO_CLIENTI.find(c => c.codice === code);
    if (!cliente) { setLoginError("Codice cliente non trovato"); return; }
    if (cliente.pin && cliente.pin !== pin) { setLoginError("PIN non corretto"); return; }
    setCurrentCliente(cliente);
    setSavedCode(code);
    setLoggedIn(true);
    setLoginError("");
    setLastSync(new Date().toLocaleString("it-IT"));
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    setLoggedIn(false);
    setCurrentCliente(null);
    setSavedCode(null);
    setActiveTab("home");
    setSelectedDay(null);
  }, []);

  // Sync
  const handleSync = useCallback(() => {
    setLastSync(new Date().toLocaleString("it-IT"));
  }, []);

  // Log weight
  const handleLogWeight = useCallback((exercise, schedaId, weight) => {
    const key = `${exercise}__${schedaId}`;
    const date = new Date().toLocaleDateString("it-IT");
    setProgressData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { date, weight }],
    }));
  }, []);

  // Navigation helper
  const navigateTab = useCallback((tab) => {
    setActiveTab(tab);
    setSelectedDay(null);
  }, []);

  if (!loggedIn) {
    return <LoginScreen config={config} onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", background: styles.bg, minHeight: "100vh" }}>
      {/* Global styles */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: ${styles.bg}; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; }
        input::placeholder { color: #555; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Offline badge */}
      {isOffline && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
          background: "#422006", padding: "4px 0", textAlign: "center",
          fontSize: "11px", color: "#fbbf24", fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        }}>
          <WifiOff size={12} /> Offline — dati aggiornati al {lastSync || "N/A"}
        </div>
      )}

      {/* Timer overlay */}
      {timerSeconds !== null && (
        <RestTimer seconds={timerSeconds} onClose={() => setTimerSeconds(null)} primaryColor={primaryColor} />
      )}

      {/* Video overlay */}
      {videoUrl && (
        <VideoModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />
      )}

      {/* Main content */}
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        {selectedDay ? (
          <WorkoutDay
            giorno={selectedDay}
            esercizi={dayExercises}
            primaryColor={primaryColor}
            onBack={() => setSelectedDay(null)}
            onTimer={(s) => setTimerSeconds(s)}
            onVideo={(v) => setVideoUrl(v)}
            progressData={progressData}
            onLogWeight={handleLogWeight}
          />
        ) : activeTab === "home" && currentScheda ? (
          <Dashboard
            cliente={currentCliente}
            scheda={currentScheda}
            esercizi={DEMO_ESERCIZI}
            primaryColor={primaryColor}
            onSelectDay={(day) => setSelectedDay(day)}
            onSync={handleSync}
            lastSync={lastSync}
          />
        ) : activeTab === "progress" ? (
          <ProgressTracker
            progressData={progressData}
            primaryColor={primaryColor}
            esercizi={DEMO_ESERCIZI}
            schedaAttiva={currentCliente.scheda_attiva}
          />
        ) : activeTab === "history" ? (
          <WorkoutHistory
            cliente={currentCliente}
            schede={DEMO_SCHEDE}
            esercizi={DEMO_ESERCIZI}
            primaryColor={primaryColor}
          />
        ) : activeTab === "profile" ? (
          <ProfileScreen
            cliente={currentCliente}
            config={config}
            primaryColor={primaryColor}
            onLogout={handleLogout}
          />
        ) : null}
      </div>

      {/* Bottom nav */}
      {!selectedDay && <BottomNav activeTab={activeTab} onNavigate={navigateTab} primaryColor={primaryColor} />}
    </div>
  );
}
