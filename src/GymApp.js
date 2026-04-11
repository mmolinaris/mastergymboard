// ============================================================
// GymBoard — DataService con Google Sheets API
// ============================================================
//
// COME USARE QUESTO FILE:
// 1. Completa gli STEP nella guida (crea API Key, pubblica il foglio)
// 2. Compila le 2 costanti qui sotto (SHEET_ID e API_KEY)  
// 3. Sostituisci il blocco "DATI DEMO" nell'app con gli import 
//    da questo file
//
// NOTA: Questo file contiene TUTTO il codice necessario.
//       Funziona sia come modulo importabile sia come 
//       riferimento da copiare/incollare nell'app.
// ============================================================


// ╔══════════════════════════════════════════════════════════╗
// ║  CONFIGURAZIONE — COMPILA QUESTI 2 VALORI               ║
// ╚══════════════════════════════════════════════════════════╝

const SHEET_ID = "QUI_IL_TUO_GOOGLE_SHEET_ID";
// Esempio: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
// Lo trovi nell'URL del foglio Google:
// https://docs.google.com/spreadsheets/d/QUESTO_E_LO_SHEET_ID/edit

const API_KEY = "QUI_LA_TUA_API_KEY";
// Esempio: "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
// La crei dalla Google Cloud Console (vedi guida)


// ╔══════════════════════════════════════════════════════════╗
// ║  FUNZIONI BASE — Lettura da Google Sheets                ║
// ╚══════════════════════════════════════════════════════════╝

/**
 * Legge un foglio di Google Sheets e restituisce un array di oggetti.
 * 
 * Esempio: fetchSheet("clienti") restituisce:
 * [
 *   { codice: "MG-001", nome: "Marco", cognome: "Rossi", ... },
 *   { codice: "MG-002", nome: "Laura", cognome: "Bianchi", ... },
 * ]
 * 
 * La prima riga del foglio diventa i nomi delle proprietà.
 */
async function fetchSheet(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Errore nel caricamento del foglio "${sheetName}": ${response.status}`);
  }
  
  const data = await response.json();
  const rows = data.values;
  
  if (!rows || rows.length < 2) {
    return []; // Foglio vuoto o solo intestazioni
  }
  
  // Prima riga = intestazioni (chiavi degli oggetti)
  const headers = rows[0];
  
  // Righe successive = dati
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j] || "";
    }
    result.push(obj);
  }
  
  return result;
}


/**
 * Legge il foglio "config" che ha un formato speciale (chiave/valore)
 * e restituisce un oggetto semplice.
 * 
 * Restituisce:
 * {
 *   nome_palestra: "Master Gym",
 *   colore_primario: "#FF6B00",
 *   ...
 * }
 */
async function fetchConfig() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/config?key=${API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Errore nel caricamento della configurazione: ${response.status}`);
  }
  
  const data = await response.json();
  const rows = data.values;
  
  if (!rows || rows.length < 2) {
    return {};
  }
  
  // Salta la riga intestazione, prendi chiave/valore
  const config = {};
  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    const value = rows[i][1] || "";
    if (key) {
      config[key] = value;
    }
  }
  
  return config;
}


// ╔══════════════════════════════════════════════════════════╗
// ║  FUNZIONE PRINCIPALE — Carica TUTTI i dati               ║
// ╚══════════════════════════════════════════════════════════╝

/**
 * Carica tutti i dati dal Google Sheet in un colpo solo.
 * Questa è la funzione che chiami dall'app.
 * 
 * Restituisce:
 * {
 *   config:   { nome_palestra: "...", colore_primario: "...", ... },
 *   clienti:  [ { codice: "MG-001", ... }, ... ],
 *   schede:   [ { scheda_id: "SCHEDA-001", ... }, ... ],
 *   esercizi: [ { scheda_id: "SCHEDA-001", giorno: "...", ... }, ... ],
 *   timestamp: "11/04/2026, 15:30:00"  // quando sono stati scaricati
 * }
 */
async function loadAllData() {
  // Lancia tutte e 4 le richieste in parallelo (più veloce)
  const [config, clienti, schede, esercizi] = await Promise.all([
    fetchConfig(),
    fetchSheet("clienti"),
    fetchSheet("schede"),
    fetchSheet("esercizi"),
  ]);
  
  // Converti i campi numerici degli esercizi
  // (Google Sheets restituisce tutto come stringhe)
  const eserciziFix = esercizi.map(e => ({
    ...e,
    ordine: parseInt(e.ordine) || 0,
    serie: parseInt(e.serie) || 0,
    riposo_sec: parseInt(e.riposo_sec) || 60,
    // peso_suggerito e ripetizioni restano stringa (possono essere "corpo", "8-10", etc.)
  }));
  
  return {
    config,
    clienti,
    schede,
    esercizi: eserciziFix,
    timestamp: new Date().toLocaleString("it-IT"),
  };
}


// ╔══════════════════════════════════════════════════════════╗
// ║  CACHE OFFLINE — Salva e leggi da localStorage           ║
// ╚══════════════════════════════════════════════════════════╝

const CACHE_KEY = "gymboard_data";
const PROGRESS_KEY = "gymboard_progress";

/**
 * Salva i dati in localStorage per uso offline.
 */
function saveToCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn("Impossibile salvare in cache:", e);
    return false;
  }
}

/**
 * Legge i dati dalla cache locale.
 * Restituisce null se non c'è nulla salvato.
 */
function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Errore lettura cache:", e);
    return null;
  }
}

/**
 * Salva i progressi (pesi usati) in localStorage.
 * I progressi sono salvati SOLO in locale, mai su Google Sheets.
 */
function saveProgress(progressData) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
    return true;
  } catch (e) {
    console.warn("Impossibile salvare progressi:", e);
    return false;
  }
}

/**
 * Carica i progressi salvati.
 */
function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}


// ╔══════════════════════════════════════════════════════════╗
// ║  FUNZIONE SMART — Online/Offline automatico              ║
// ╚══════════════════════════════════════════════════════════╝

/**
 * Carica i dati nel modo migliore possibile:
 * - Se online → scarica da Google Sheets e aggiorna la cache
 * - Se offline → usa la cache locale
 * - Se online ma errore → usa la cache locale come fallback
 * 
 * Restituisce:
 * {
 *   data: { config, clienti, schede, esercizi, timestamp },
 *   source: "online" | "cache",
 *   error: null | "messaggio errore"
 * }
 */
async function smartLoad() {
  // Prima prova a caricare online
  try {
    const data = await loadAllData();
    
    // Successo! Salva in cache per uso futuro offline
    saveToCache(data);
    
    return {
      data: data,
      source: "online",
      error: null,
    };
  } catch (err) {
    console.warn("Caricamento online fallito:", err.message);
    
    // Fallback: prova la cache
    const cached = loadFromCache();
    
    if (cached) {
      return {
        data: cached,
        source: "cache",
        error: `Offline — dati aggiornati al ${cached.timestamp}`,
      };
    }
    
    // Nessuna cache disponibile
    return {
      data: null,
      source: "none",
      error: "Impossibile caricare i dati. Controlla la connessione internet.",
    };
  }
}


// ╔══════════════════════════════════════════════════════════╗
// ║  SCRITTURA PROGRESSI SU GOOGLE SHEETS (OPZIONE A)       ║
// ╚══════════════════════════════════════════════════════════╝
//
// NOTA: Questa opzione richiede un setup più avanzato:
// - Un Google Apps Script (gratuito) che fa da "ponte"
// - Oppure un Service Account con permessi di scrittura
//
// Per la versione base, i progressi restano in localStorage.
// Questa funzione è qui pronta per quando vorrai attivare 
// la scrittura su Sheets.
//
// Per usarla, dovrai creare un Google Apps Script Web App
// (vedi guida sotto) e inserire l'URL qui:

const APPS_SCRIPT_URL = ""; // Lascia vuoto per ora

/**
 * OPZIONE A: Scrive un progresso su Google Sheets tramite Apps Script.
 * 
 * Richiede un Google Apps Script pubblicato come Web App.
 * Vedi la funzione createAppsScript() sotto per il codice da usare.
 */
async function writeProgressToSheet(codiceCliente, esercizio, peso, data) {
  if (!APPS_SCRIPT_URL) {
    console.log("Scrittura su Sheets non configurata. Progressi salvati solo in locale.");
    return false;
  }
  
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addProgress",
        codice: codiceCliente,
        esercizio: esercizio,
        peso: peso,
        data: data,
      }),
    });
    
    const result = await response.json();
    return result.success === true;
  } catch (e) {
    console.warn("Errore scrittura su Sheets:", e);
    return false;
  }
}


// ╔══════════════════════════════════════════════════════════╗
// ║  GOOGLE APPS SCRIPT — Codice per la scrittura            ║
// ╚══════════════════════════════════════════════════════════╝
//
// Se vuoi attivare l'OPZIONE A (scrittura progressi su Sheets),
// crea un Google Apps Script con questo codice:
//
// ---- INIZIO CODICE APPS SCRIPT ----
//
// function doPost(e) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet();
//   var data = JSON.parse(e.postData.contents);
//   
//   if (data.action === "addProgress") {
//     var progressSheet = sheet.getSheetByName("progressi");
//     
//     // Se il foglio "progressi" non esiste, crealo
//     if (!progressSheet) {
//       progressSheet = sheet.insertSheet("progressi");
//       progressSheet.appendRow([
//         "codice_cliente", "esercizio", "peso", "data", "timestamp"
//       ]);
//     }
//     
//     progressSheet.appendRow([
//       data.codice,
//       data.esercizio,
//       data.peso,
//       data.data,
//       new Date().toISOString()
//     ]);
//     
//     return ContentService
//       .createTextOutput(JSON.stringify({ success: true }))
//       .setMimeType(ContentService.MimeType.JSON);
//   }
//   
//   return ContentService
//     .createTextOutput(JSON.stringify({ success: false, error: "Azione sconosciuta" }))
//     .setMimeType(ContentService.MimeType.JSON);
// }
//
// function doGet(e) {
//   return ContentService
//     .createTextOutput("GymBoard API attiva")
//     .setMimeType(ContentService.MimeType.TEXT);
// }
//
// ---- FINE CODICE APPS SCRIPT ----


// ╔══════════════════════════════════════════════════════════╗
// ║  HOOK REACT — usaGymData()                               ║
// ╚══════════════════════════════════════════════════════════╝
//
// Questo è un custom hook React che puoi usare direttamente
// nel componente GymApp. Gestisce tutto: caricamento, cache,
// errori, e sync.
//
// COME SI USA nell'app:
//
//   function GymApp() {
//     const { data, loading, error, source, refresh } = useGymData();
//     
//     if (loading) return <LoadingScreen />;
//     if (!data) return <ErrorScreen message={error} />;
//     
//     const { config, clienti, schede, esercizi } = data;
//     // ... tutto il resto dell'app usa questi dati
//   }
//

/*
import { useState, useEffect, useCallback } from "react";

function useGymData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  
  const load = useCallback(async () => {
    setLoading(true);
    
    const result = await smartLoad();
    
    setData(result.data);
    setSource(result.source);
    setError(result.error);
    setLoading(false);
  }, []);
  
  // Carica al primo render
  useEffect(() => {
    load();
  }, [load]);
  
  // Auto-sync quando torna online
  useEffect(() => {
    const handleOnline = () => {
      console.log("Connessione ripristinata, ricarico dati...");
      load();
    };
    
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [load]);
  
  return {
    data,        // { config, clienti, schede, esercizi, timestamp } oppure null
    loading,     // true durante il caricamento
    error,       // messaggio errore oppure null
    source,      // "online", "cache", o "none"
    refresh: load, // funzione per forzare il ricaricamento
  };
}
*/


// ╔══════════════════════════════════════════════════════════╗
// ║  EXPORT                                                  ║
// ╚══════════════════════════════════════════════════════════╝

// Se usi questo come modulo ES (import/export):
// export { loadAllData, smartLoad, saveToCache, loadFromCache, 
//          saveProgress, loadProgress, writeProgressToSheet,
//          fetchSheet, fetchConfig };

// Se usi questo dentro l'app React (copia/incolla):
// Copia le funzioni che ti servono direttamente nel file .jsx
