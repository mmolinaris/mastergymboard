/* ================================================
   GYMBOARD — Google Apps Script v3
   ================================================ */

const SHEET_CLIENTI  = "clienti";
const SHEET_SCHEDE   = "schede";
const SHEET_ESERCIZI = "esercizi";
const SHEET_LIBRERIA = "libreria_esercizi";

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;

    if      (action === "addCliente")              result = addCliente(body.cliente);
    else if (action === "updateCliente")            result = updateCliente(body.cliente);
    else if (action === "deleteCliente")            result = deleteCliente(body.codice);
    else if (action === "addEsercizio")             result = addEsercizio(body.esercizio);
    else if (action === "updateEsercizio")          result = updateEsercizio(body.esercizio);
    else if (action === "deleteEsercizio")          result = deleteEsercizio(body.esercizio);
    else if (action === "addLibreriaEsercizio")     result = addLibreriaEsercizio(body.esercizio);
    else if (action === "updateLibreriaEsercizio")  result = updateLibreriaEsercizio(body.esercizio);
    else if (action === "deleteLibreriaEsercizio")  result = deleteLibreriaEsercizio(body.esercizio);
    else if (action === "deleteSchedaPassata")      result = deleteSchedaPassata(body.codiceCliente, body.schedaId);
    else if (action === "deleteSchedaEsercizi")     result = deleteSchedaEsercizi(body.schedaId);
    else if (action === "updateScheda")             result = updateScheda(body.scheda);
    else if (action === "addEserciziMultipli")      result = addEserciziMultipli(body.esercizi);
    else if (action === "deleteSchedaCompleta")     result = deleteSchedaCompleta(body.schedaId);
    else if (action === "addServizio")              result = addServizio(body.servizio);
    else if (action === "deleteServizio")           result = deleteServizio(body.servizio);
    else if (action === "getUltimiPesi")           result = getUltimiPesi(body.codice_cliente);
    else if (action === "saveProgresso")           result = saveProgresso(body.progresso);
    else throw new Error("Azione non riconosciuta: " + action);

    return okResponse(result);
  } catch (err) {
    return errResponse(err.message);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "GymBoard Script v3 attivo!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */
function getHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  let end = headers.length;
  while (end > 0 && String(headers[end-1]).trim() === "") end--;
  return headers.slice(0, end).map(h => String(h).trim());
}

function getSheet(name) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Foglio non trovato: " + name);
  return sheet;
}

function appendRowSafe(sheet, data) {
  const headers = getHeaders(sheet);
  const row = headers.map(h => data[h] !== undefined ? data[h] : "");
  sheet.appendRow(row);
}

/* ─────────────────────────────────────────────
   CLIENTI
   ───────────────────────────────────────────── */
function addCliente(cliente) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxNome = headers.indexOf("nome");
  const idxCogn = headers.indexOf("cognome");
  // Anti-duplicato
  for (let i = 1; i < data.length; i++) {
    const nomeUg = String(data[i][idxNome]).trim().toLowerCase() === String(cliente.nome).trim().toLowerCase();
    const cognUg = String(data[i][idxCogn]).trim().toLowerCase() === String(cliente.cognome).trim().toLowerCase();
    if (nomeUg && cognUg) throw new Error("Cliente già esistente: " + cliente.nome + " " + cliente.cognome);
  }
  appendRowSafe(sheet, cliente);
  return { success: true, message: "Cliente aggiunto: " + cliente.codice };
}

function getNextSchedaId() {
  const sheet = getSheet(SHEET_SCHEDE);
  const data  = sheet.getDataRange().getValues();
  const headers = getHeaders(sheet);
  const idx   = headers.indexOf("scheda_id");
  let max = 0;
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][idx] || "");
    const match = id.match(/SCH-(\d+)/);
    if (match) max = Math.max(max, parseInt(match[1]));
  }
  return "SCH-" + String(max + 1).padStart(3, "0");
}

function updateCliente(cliente) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxCodice = headers.indexOf("codice");
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxCodice]).trim() === String(cliente.codice).trim()) {
      headers.forEach((h, col) => {
        if (cliente[h] !== undefined) sheet.getRange(i + 1, col + 1).setValue(cliente[h]);
      });
      return { success: true, message: "Cliente aggiornato: " + cliente.codice };
    }
  }
  throw new Error("Cliente non trovato: " + cliente.codice);
}

function deleteCliente(codice) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idx     = headers.indexOf("codice");
  const idxAtt  = headers.indexOf("scheda_attiva");
  const idxPass = headers.indexOf("schede_passate");

  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idx]).trim() === String(codice).trim()) {
      // 1. Elimina scheda attiva + esercizi
      const schedaAttiva = String(data[i][idxAtt] || "").trim();
      if (schedaAttiva) {
        eliminaEserciziScheda(schedaAttiva);
        eliminaRigaScheda(schedaAttiva);
      }
      // 2. Elimina schede passate + esercizi
      const passate = String(data[i][idxPass] || "").split(",").map(s => s.trim()).filter(Boolean);
      passate.forEach(id => {
        eliminaEserciziScheda(id);
        eliminaRigaScheda(id);
      });
      // 3. Elimina progressi del cliente
      eliminaProgressiCliente(codice);
      // 4. Elimina riga cliente
      sheet.deleteRow(i + 1);
      return { success: true, message: "Cliente eliminato con schede e progressi: " + codice };
    }
  }
  throw new Error("Cliente non trovato: " + codice);
}

function eliminaProgressiCliente(codice) {
  try {
    const sheet   = getSheet("progressi");
    const headers = getHeaders(sheet);
    const data    = sheet.getDataRange().getValues();
    const idx     = headers.indexOf("codice_cliente");
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][idx]).trim() === String(codice).trim()) {
        sheet.deleteRow(i + 1);
      }
    }
  } catch(e) { /* foglio progressi potrebbe non esistere */ }
}

/* ─────────────────────────────────────────────
   ESERCIZI SCHEDE (foglio "esercizi")
   ───────────────────────────────────────────── */
function addEsercizio(ex) {
  const sheet = getSheet(SHEET_ESERCIZI);
  appendRowSafe(sheet, ex);
  return { success: true, message: "Esercizio aggiunto" };
}

function updateEsercizio(ex) {
  const sheet   = getSheet(SHEET_ESERCIZI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxSch  = headers.indexOf("scheda_id");
  const idxEx   = headers.indexOf("esercizio");
  const idxSed  = headers.indexOf("seduta");
  for (let i = 1; i < data.length; i++) {
    const matchScheda = !ex.scheda_id || String(data[i][idxSch]).trim() === String(ex.scheda_id).trim();
    const matchEx     = String(data[i][idxEx]).trim() === String(ex.esercizio).trim();
    const matchSeduta = idxSed < 0 || !ex.seduta || String(data[i][idxSed]).trim() === String(ex.seduta).trim();
    if (matchScheda && matchEx && matchSeduta) {
      headers.forEach((h, col) => {
        if (ex[h] !== undefined) sheet.getRange(i + 1, col + 1).setValue(ex[h]);
      });
      return { success: true, message: "Esercizio aggiornato" };
    }
  }
  throw new Error("Esercizio non trovato: " + ex.esercizio);
}

function deleteEsercizio(ex) {
  const sheet   = getSheet(SHEET_ESERCIZI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxSch  = headers.indexOf("scheda_id");
  const idxEx   = headers.indexOf("esercizio");
  for (let i = data.length - 1; i >= 1; i--) {
    const matchScheda = !ex.scheda_id || String(data[i][idxSch]).trim() === String(ex.scheda_id).trim();
    const matchEx     = String(data[i][idxEx]).trim() === String(ex.esercizio).trim();
    if (matchScheda && matchEx) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Esercizio eliminato" };
    }
  }
  throw new Error("Esercizio non trovato: " + ex.esercizio);
}

/* ─────────────────────────────────────────────
   LIBRERIA ESERCIZI (foglio "libreria_esercizi")
   ───────────────────────────────────────────── */
function addLibreriaEsercizio(ex) {
  const sheet = getSheet(SHEET_LIBRERIA);
  appendRowSafe(sheet, ex);
  return { success: true, message: "Esercizio aggiunto in libreria: " + ex.esercizio };
}

function updateLibreriaEsercizio(ex) {
  const sheet   = getSheet(SHEET_LIBRERIA);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxEx   = headers.indexOf("esercizio");
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxEx]).trim() === String(ex.esercizio).trim()) {
      headers.forEach((h, col) => {
        if (ex[h] !== undefined) sheet.getRange(i + 1, col + 1).setValue(ex[h]);
      });
      return { success: true, message: "Esercizio aggiornato in libreria: " + ex.esercizio };
    }
  }
  throw new Error("Esercizio non trovato in libreria: " + ex.esercizio);
}

function deleteLibreriaEsercizio(esercizio) {
  const sheet   = getSheet(SHEET_LIBRERIA);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxEx   = headers.indexOf("esercizio");
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idxEx]).trim() === String(esercizio).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Esercizio eliminato dalla libreria: " + esercizio };
    }
  }
  throw new Error("Esercizio non trovato in libreria: " + esercizio);
}

/* ─────────────────────────────────────────────
   SCHEDE
   ───────────────────────────────────────────── */
function deleteSchedaPassata(codiceCliente, schedaId) {
  const sheet   = getSheet(SHEET_CLIENTI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxCod  = headers.indexOf("codice");
  const idxPass = headers.indexOf("schede_passate");
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxCod]).trim() === String(codiceCliente).trim()) {
      const passate = String(data[i][idxPass] || "").split(",").map(s => s.trim()).filter(s => s && s !== schedaId).join(",");
      sheet.getRange(i + 1, idxPass + 1).setValue(passate);
      eliminaEserciziScheda(schedaId);
      eliminaRigaScheda(schedaId);
      return { success: true, message: "Scheda passata eliminata" };
    }
  }
  throw new Error("Cliente non trovato: " + codiceCliente);
}

function updateScheda(scheda) {
  const sheet   = getSheet(SHEET_SCHEDE);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idx     = headers.indexOf("scheda_id");
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idx]).trim() === String(scheda.scheda_id).trim()) {
      headers.forEach((h, col) => {
        if (scheda[h] !== undefined) sheet.getRange(i + 1, col + 1).setValue(scheda[h]);
      });
      return { success: true, message: "Scheda aggiornata" };
    }
  }
  throw new Error("Scheda non trovata: " + scheda.scheda_id);
}

function addEserciziMultipli(esercizi) {
  const sheet = getSheet(SHEET_ESERCIZI);
  esercizi.forEach(ex => appendRowSafe(sheet, ex));
  return { success: true, message: "Esercizi aggiunti: " + esercizi.length };
}

function deleteSchedaEsercizi(schedaId) {
  eliminaEserciziScheda(schedaId);
  return { success: true, message: "Esercizi eliminati per scheda: " + schedaId };
}

function deleteSchedaCompleta(schedaId) {
  const sheetC   = getSheet(SHEET_CLIENTI);
  const headersC = getHeaders(sheetC);
  const dataC    = sheetC.getDataRange().getValues();
  const idxAtt   = headersC.indexOf("scheda_attiva");
  const idxPass  = headersC.indexOf("schede_passate");
  for (let i = 1; i < dataC.length; i++) {
    if (String(dataC[i][idxAtt]).trim() === String(schedaId).trim()) {
      sheetC.getRange(i + 1, idxAtt + 1).setValue("");
    }
    const passate = String(dataC[i][idxPass] || "").split(",").map(s => s.trim()).filter(s => s && s !== schedaId).join(",");
    sheetC.getRange(i + 1, idxPass + 1).setValue(passate);
  }
  eliminaEserciziScheda(schedaId);
  eliminaRigaScheda(schedaId);
  return { success: true, message: "Scheda eliminata: " + schedaId };
}

function creaSchedaDaTemplate(codiceCliente, schedaAttivaOld, scheda, esercizi) {
  // 1. Genera ID progressivo
  const schedaId = getNextSchedaId();
  scheda.scheda_id = schedaId;

  // 2. Scrivi scheda
  const sheetS = getSheet(SHEET_SCHEDE);
  appendRowSafe(sheetS, scheda);

  // 2. Scrivi esercizi
  const sheetE = getSheet(SHEET_ESERCIZI);
  esercizi.forEach(ex => appendRowSafe(sheetE, ex));

  // 3. Aggiorna cliente
  const sheetC   = getSheet(SHEET_CLIENTI);
  const headersC = getHeaders(sheetC);
  const dataC    = sheetC.getDataRange().getValues();
  const idxCod   = headersC.indexOf("codice");
  const idxAtt   = headersC.indexOf("scheda_attiva");
  const idxPass  = headersC.indexOf("schede_passate");

  for (let i = 1; i < dataC.length; i++) {
    if (String(dataC[i][idxCod]).trim() === String(codiceCliente).trim()) {
      if (schedaAttivaOld) {
        const passateAttuali = String(dataC[i][idxPass] || "").split(",").map(s => s.trim()).filter(Boolean);
        passateAttuali.forEach(oldId => {
          eliminaEserciziScheda(oldId);
          eliminaRigaScheda(oldId);
        });
        sheetC.getRange(i + 1, idxPass + 1).setValue(schedaAttivaOld);
      }
      sheetC.getRange(i + 1, idxAtt + 1).setValue(scheda.scheda_id);
      return { success: true, message: "Scheda creata e assegnata a " + codiceCliente };
    }
  }
  throw new Error("Cliente non trovato: " + codiceCliente);
}

function getUltimiPesi(codiceCliente) {
  try {
    const sheet   = getSheet("progressi");
    const headers = getHeaders(sheet);
    const data    = sheet.getDataRange().getValues();
    const idxCod  = headers.indexOf("codice_cliente");
    const idxData = headers.indexOf("data");
    const idxEx   = headers.indexOf("esercizio");
    const idxPeso = headers.indexOf("peso_kg");
    
    // Prendi solo le righe di questo cliente
    const miei = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idxCod]).trim() === String(codiceCliente).trim()) {
        miei.push({
          data:     String(data[i][idxData] || ""),
          esercizio: String(data[i][idxEx]  || ""),
          peso_kg:  String(data[i][idxPeso] || ""),
        });
      }
    }
    
    // Tieni solo l'ultimo per esercizio
    const ultimi = {};
    miei.forEach(r => {
      if (!r.esercizio || !r.peso_kg) return;
      if (!ultimi[r.esercizio]) {
        ultimi[r.esercizio] = r;
      } else {
        // Confronta date DD/MM/YYYY
        const da = r.data.split("/").reverse().join("-");
        const db = ultimi[r.esercizio].data.split("/").reverse().join("-");
        if (da >= db) ultimi[r.esercizio] = r;
      }
    });
    
    return { success: true, data: ultimi };
  } catch(e) {
    return { success: false, data: {} };
  }
}


function saveProgresso(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("progressi");
  if (!sheet) {
    sheet = ss.insertSheet("progressi");
    sheet.appendRow(["codice_cliente","data","esercizio","peso_kg","ripetizioni_fatte","note_cliente"]);
  }
  appendRowSafe(sheet, p);
  return { success: true, message: "Progresso salvato" };
}


function addServizio(servizio) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("servizi");
  if (!sheet) {
    sheet = ss.insertSheet("servizi");
    sheet.appendRow(["tipo","nome","descrizione","contatto"]);
  }
  appendRowSafe(sheet, servizio);
  return { success: true, message: "Servizio aggiunto" };
}

function deleteServizio(servizio) {
  const sheet   = getSheet("servizi");
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idxNome = headers.indexOf("nome");
  const idxTipo = headers.indexOf("tipo");
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idxNome]).trim() === String(servizio.nome).trim() &&
        String(data[i][idxTipo]).trim() === String(servizio.tipo).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Servizio eliminato" };
    }
  }
  throw new Error("Servizio non trovato: " + servizio.nome);
}

/* ─────────────────────────────────────────────
   UTILS INTERNI
   ───────────────────────────────────────────── */
function eliminaEserciziScheda(schedaId) {
  const sheet   = getSheet(SHEET_ESERCIZI);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idx     = headers.indexOf("scheda_id");
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idx]).trim() === String(schedaId).trim()) sheet.deleteRow(i + 1);
  }
}

function eliminaRigaScheda(schedaId) {
  const sheet   = getSheet(SHEET_SCHEDE);
  const headers = getHeaders(sheet);
  const data    = sheet.getDataRange().getValues();
  const idx     = headers.indexOf("scheda_id");
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idx]).trim() === String(schedaId).trim()) sheet.deleteRow(i + 1);
  }
}

function okResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", data })).setMimeType(ContentService.MimeType.JSON);
}

function errResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message })).setMimeType(ContentService.MimeType.JSON);
}
