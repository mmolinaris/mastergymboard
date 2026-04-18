import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Home, BarChart3, ClipboardList, User, Timer, ChevronRight,
  Dumbbell, Phone, Instagram, ChevronLeft, X, Info,
  RefreshCw, LogOut, MapPin, Target, ChevronDown, Calendar,
  TrendingUp, Video, AlertCircle, Zap, Clock
} from "lucide-react";

const SHEET_ID = "144-i_O8EGeL51ku9oi7n44oS1KGQY2cutIrulSVDJcw";
const API_KEY = "AIzaSyDEoQi1P3VVocd7Yokkw8by8PLWq-t1IV4";
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

async function fetchSheet(tab) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(tab)}?key=${API_KEY}`);
  if (!res.ok) throw new Error(`Errore ${tab}: ${res.status}`);
  const d = await res.json();
  const [h, ...rows] = d.values || [];
  return rows.map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ""])));
}

async function fetchAllData() {
  const [cf, cl, sc, ex] = await Promise.all(["config","clienti","schede","esercizi"].map(fetchSheet));
  let servizi = [];
  try { servizi = await fetchSheet("servizi"); } catch(e) {}
  const esercizi = ex.map(e => ({
    ...e,
    seduta: e.seduta || e.giorno || "",
    recupero: e.recupero || (e.riposo_sec ? String(e.riposo_sec) : "0"),
    scheda_id: e.scheda_id || "",
    serie: e.serie || "",
    ripetizioni: e.ripetizioni || "",
    muscolo: e.muscolo || e.gruppo_muscolare || "",
    peso_suggerito: e.peso_suggerito || "",
    note: e.note || "",
    tecnica: e.tecnica || "",
    video_url: e.video_url || "",
    ordine: e.ordine || "0",
  }));
  return {
    config: Object.fromEntries(cf.map(r => [r.chiave, r.valore])),
    clienti: cl,
    schede: sc,
    esercizi,
    servizi
  };
}

const daysUntil = d => Math.ceil((new Date(d) - new Date()) / 864e5);
const fmtDate = d => {
  if (!d) return "";
  if (d.includes("/")) return d;
  const [y,m,day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const ytId = u => u?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || null;
const isCardio = e => !e.serie && (e.ripetizioni||"").includes("'");
const parseRec = r => {
  if (!r || r === "0") return 0;
  const m = r.match(/(\d+)/);
  if (!m) return 0;
  if (r.includes("'") && !r.includes("''")) return parseInt(m[1])*60;
  return parseInt(m[1]);
};

const ST = (p) => ({
  bg: "#FFFFFF",
  primary: p && p !== "#FF6B00" ? p : "#E53935",
  card: "#F5F5F5",
  border: "#E0E0E0",
  text: "#1A1A1A",
  sub: "#666666",
  muted: "#999999",
});

function Nav({ tab, onNav, color }) {
  return (
    <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"#FFFFFF",borderTop:"1px solid #E0E0E0",display:"flex",justifyContent:"space-around",padding:"6px 0 env(safe-area-inset-bottom, 8px)" }}>
      {[["home",Home,"Home"],["progress",BarChart3,"Progressi"],["history",ClipboardList,"Storico"],["profile",User,"Profilo"]].map(([id,Icon,lbl]) => {
        const a = tab===id;
        return <button key={id} onClick={()=>onNav(id)} style={{ background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:a?color:"#999",padding:"4px 12px" }}><Icon size={22} strokeWidth={a?2.5:1.5}/><span style={{fontSize:10,fontWeight:a?700:400}}>{lbl}</span></button>;
      })}
    </div>
  );
}

function RestTimer({ seconds, onClose, color }) {
  const [rem,setRem]=useState(seconds); const [run,setRun]=useState(true); const ref=useRef(null); const tot=useRef(seconds);
  useEffect(()=>{ if(run&&rem>0){ ref.current=setInterval(()=>setRem(r=>{if(r<=1){clearInterval(ref.current);try{navigator.vibrate?.([200,100,200])}catch(e){}return 0}return r-1}),1000)} return()=>clearInterval(ref.current) },[run,rem]);
  const R=90,C=2*Math.PI*R,off=C*(1-rem/tot.current),m=Math.floor(rem/60),s=rem%60;
  const adj=d=>{setRem(r=>Math.max(0,r+d));tot.current=Math.max(tot.current+d,1)};
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:32}}>
      <div style={{position:"relative",width:220,height:220}}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{transform:"rotate(-90deg)"}}><circle cx="110" cy="110" r={R} fill="none" stroke="#333" strokeWidth="8"/><circle cx="110" cy="110" r={R} fill="none" stroke={rem===0?"#22c55e":color} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} style={{transition:"stroke-dashoffset 1s linear"}}/></svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:48,fontWeight:800,color:"#FFF",fontVariantNumeric:"tabular-nums"}}>{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>{rem===0&&<span style={{fontSize:14,color:"#22c55e",fontWeight:600}}>TEMPO!</span>}</div>
      </div>
      <div style={{display:"flex",gap:16}}>{[[-15,"-15s"],[0,run?"⏸":"▶"],[15,"+15s"]].map(([d,l],i)=><button key={i} onClick={()=>d===0?setRun(!run):adj(d)} style={{background:d===0?color:"#333",border:"none",borderRadius:"50%",width:56,height:56,color:"#FFF",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{l}</button>)}</div>
      <button onClick={onClose} style={{background:"none",border:"1px solid #555",borderRadius:12,color:"#FFF",padding:"12px 48px",cursor:"pointer",fontSize:15,fontWeight:600}}>Chiudi</button>
    </div>
  );
}

function VideoModal({url,onClose}){ const id=ytId(url);if(!id)return null; return(
  <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"center",justifyContent:"center"}}>
    <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:"#FFF",cursor:"pointer"}}><X size={28}/></button>
    <div style={{width:"100%",maxWidth:560,aspectRatio:"16/9",borderRadius:12,overflow:"hidden",padding:"0 16px",boxSizing:"border-box"}}><iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`} style={{width:"100%",height:"100%",border:"none"}} allow="autoplay; encrypted-media" allowFullScreen/></div>
  </div>);
}

function ExCard({ex,s,onTimer,onVideo,progress,onLog}){
  const [open,setOpen]=useState(false);const [showT,setShowT]=useState(false);const [wt,setWt]=useState("");
  const logged=progress||[];const cardio=isCardio(ex);
  const hasPeso=ex.peso_suggerito?.trim();const hasVid=ex.video_url?.trim();const hasNote=ex.note?.trim();const hasTech=ex.tecnica?.trim();
  const recSec=parseRec(ex.recupero);
  const doLog=()=>{if(!wt.trim())return;onLog(ex.esercizio,ex.scheda_id,wt.trim());setWt("")};

  if(cardio) return(
    <div style={{background:s.card,borderRadius:14,border:`1px solid ${s.border}`,marginBottom:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:36,height:36,borderRadius:10,background:"#22c55e22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Zap size={18} color="#22c55e"/></div>
      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:s.text}}>{ex.esercizio}</div>{hasNote&&<div style={{fontSize:12,color:s.sub,marginTop:2}}>{ex.note}</div>}</div>
      <div style={{background:"#22c55e22",borderRadius:8,padding:"6px 12px"}}><span style={{fontSize:16,fontWeight:800,color:"#22c55e"}}>{ex.ripetizioni}</span></div>
    </div>);

  const sub=[ex.serie&&ex.ripetizioni?`${ex.serie} × ${ex.ripetizioni}`:"",ex.muscolo||"",hasPeso?`${ex.peso_suggerito} kg`:""].filter(Boolean).join(" • ");

  return(
    <div style={{background:s.card,borderRadius:16,overflow:"hidden",border:`1px solid ${s.border}`,marginBottom:12}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:16,display:"flex",alignItems:"center",gap:12,color:s.text,textAlign:"left"}}>
        <div style={{width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:`${s.primary}15`,flexShrink:0}}><Dumbbell size={20} color={s.primary}/></div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:700,marginBottom:2,color:s.text}}>{ex.esercizio}</div><div style={{fontSize:13,color:s.sub}}>{sub}</div></div>
        <ChevronDown size={20} color={s.muted} style={{transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}/>
      </button>
      {open&&(<div style={{padding:"0 16px 16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:12}}>{[ex.serie&&["SERIE",ex.serie],ex.ripetizioni&&["REPS",ex.ripetizioni],["REC.",ex.recupero||"0"]].filter(Boolean).map(([l,v])=><div key={l} style={{background:"#EBEBEB",borderRadius:8,padding:"8px 12px",flex:1,textAlign:"center"}}><div style={{fontSize:11,color:s.sub,marginBottom:2}}>{l}</div><div style={{fontSize:18,fontWeight:800,color:s.text}}>{v}</div></div>)}</div>
        {ex.muscolo&&<div style={{display:"inline-block",background:`${s.primary}15`,borderRadius:8,padding:"4px 12px",marginBottom:10}}><span style={{fontSize:12,color:s.primary,fontWeight:700}}>{ex.muscolo}</span></div>}
        {hasPeso&&<div style={{background:`${s.primary}10`,borderRadius:10,padding:"10px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><Target size={16} color={s.primary}/><span style={{fontSize:13,color:s.sub}}>Peso suggerito:</span><span style={{fontSize:15,fontWeight:700,color:s.primary}}>{ex.peso_suggerito} kg</span></div>}
        <div style={{background:"#EBEBEB",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
          <div style={{fontSize:12,color:s.sub,marginBottom:6}}>IL TUO PESO OGGI</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><input value={wt} onChange={e=>setWt(e.target.value)} placeholder="kg" type="number" inputMode="decimal" style={{flex:1,background:"#FFF",border:`1px solid ${s.border}`,borderRadius:8,padding:"8px 12px",color:s.text,fontSize:16,fontWeight:700,outline:"none"}}/><button onClick={doLog} style={{background:s.primary,border:"none",borderRadius:8,padding:"8px 16px",color:"#FFF",fontWeight:700,cursor:"pointer",fontSize:14}}>Salva</button></div>
          {logged.length>0&&<div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>{logged.slice(-5).map((l,i)=><span key={i} style={{background:"#FFF",borderRadius:6,padding:"3px 8px",fontSize:11,color:s.sub}}>{l.date}: <b style={{color:s.text}}>{l.weight}kg</b></span>)}</div>}
        </div>
        {hasNote&&<div style={{background:`${s.primary}08`,border:`1px solid ${s.primary}33`,borderRadius:10,padding:"10px 12px",marginBottom:10,display:"flex",gap:8}}><AlertCircle size={16} color={s.primary} style={{flexShrink:0,marginTop:2}}/><span style={{fontSize:13,color:s.text,lineHeight:1.4}}>{ex.note}</span></div>}
        {hasTech&&<button onClick={()=>setShowT(!showT)} style={{width:"100%",background:"none",border:`1px solid ${s.border}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:10,color:s.sub,textAlign:"left"}}><Info size={16}/><span style={{flex:1,fontSize:13,color:s.text}}>{showT?ex.tecnica:"Mostra tecnica"}</span></button>}
        <div style={{display:"flex",gap:8}}>
          {recSec>0&&<button onClick={()=>onTimer(recSec)} style={{flex:1,background:`${s.primary}15`,border:`1px solid ${s.primary}33`,borderRadius:10,padding:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:s.primary,fontWeight:700,fontSize:13}}><Timer size={16}/> Riposo {ex.recupero}s</button>}
          {hasVid&&<button onClick={()=>onVideo(ex.video_url)} style={{flex:1,background:"#EBEBEB",border:`1px solid ${s.border}`,borderRadius:10,padding:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:s.text,fontWeight:700,fontSize:13}}><Video size={16}/> Video</button>}
        </div>
      </div>)}
    </div>);
}

function LoginScreen({config,s,onLogin,error}){
  const [code,setCode]=useState("");const [pin,setPin]=useState("");
  const hasLogo=config.logo_url?.startsWith("http");
  return(
    <div style={{minHeight:"100vh",background:"#FFFFFF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
      <div style={{width:120,height:120,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {hasLogo?<img src={config.logo_url} alt="" style={{width:120,height:120,objectFit:"contain",borderRadius:"50%"}} onError={e=>{e.target.style.display="none"}}/>:<div style={{width:120,height:120,borderRadius:"50%",background:`${s.primary}15`,border:`2px solid ${s.primary}33`,display:"flex",alignItems:"center",justifyContent:"center"}}><Dumbbell size={56} color={s.primary}/></div>}
      </div>
      <h1 style={{color:s.text,fontSize:28,fontWeight:900,marginBottom:4,textAlign:"center"}}>{config.nome_palestra||"Gym App"}</h1>
      {config.slogan&&<p style={{color:s.sub,fontSize:14,marginBottom:40,fontStyle:"italic",textAlign:"center"}}>{config.slogan}</p>}
      <div style={{width:"100%",maxWidth:320}}>
        <label style={{display:"block",fontSize:12,color:s.sub,marginBottom:6,fontWeight:600,letterSpacing:"1px"}}>CODICE CLIENTE</label>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="es. MG-001" autoComplete="off" style={{width:"100%",background:"#F5F5F5",border:`1px solid ${s.border}`,borderRadius:12,padding:"14px 16px",color:s.text,fontSize:16,fontWeight:700,outline:"none",marginBottom:16,boxSizing:"border-box",letterSpacing:"1px"}}/>
        <label style={{display:"block",fontSize:12,color:s.sub,marginBottom:6,fontWeight:600,letterSpacing:"1px"}}>PIN</label>
        <input value={pin} onChange={e=>setPin(e.target.value.slice(0,4))} placeholder="• • • •" type="password" inputMode="numeric" onKeyDown={e=>{if(e.key==="Enter"&&code.trim()&&pin.trim())onLogin(code.trim().toUpperCase(),pin.trim())}} style={{width:"100%",background:"#F5F5F5",border:`1px solid ${s.border}`,borderRadius:12,padding:"14px 16px",color:s.text,fontSize:20,fontWeight:700,outline:"none",marginBottom:8,boxSizing:"border-box",letterSpacing:"8px",textAlign:"center"}}/>
        {error&&<p style={{color:"#E53935",fontSize:13,textAlign:"center",marginBottom:8}}>{error}</p>}
        <button onClick={()=>onLogin(code.trim().toUpperCase(),pin.trim())} style={{width:"100%",background:s.primary,border:"none",borderRadius:12,padding:16,color:"#FFF",fontSize:16,fontWeight:800,cursor:"pointer",marginTop:16,textTransform:"uppercase",opacity:code.trim()&&pin.trim()?1:0.5}}>Accedi</button>
      </div>
    </div>);
}

function Dashboard({cliente,scheda,esercizi,s,onSelectDay,onSync,lastSync}){
  const sedute=useMemo(()=>{
    const exs=esercizi.filter(e=>e.scheda_id===scheda.scheda_id);
    const u=[...new Set(exs.map(e=>e.seduta))].filter(Boolean);
    return u.map(sed=>({nome:sed,tipo:exs.find(e=>e.seduta===sed)?.tipo_seduta||"",count:exs.filter(e=>e.seduta===sed).length}));
  },[esercizi,scheda]);
  const dl=daysUntil(scheda.data_scadenza);
  return(
    <div style={{padding:"20px 16px 100px",minHeight:"100vh",background:s.bg}}>
      <div style={{marginBottom:24}}><h1 style={{color:s.text,fontSize:24,fontWeight:900,marginBottom:2}}>Ciao {cliente.nome}! 💪</h1><p style={{color:s.sub,fontSize:14}}>Pronto per allenarti?</p></div>
      <div style={{background:`linear-gradient(135deg,${s.primary}12,${s.primary}05)`,borderRadius:20,padding:20,marginBottom:24,border:`1px solid ${s.primary}25`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div><div style={{fontSize:11,color:s.primary,fontWeight:700,letterSpacing:"1.5px",marginBottom:4}}>SCHEDA ATTIVA</div><div style={{fontSize:20,fontWeight:900,color:s.text}}>{scheda.nome_scheda}</div></div>
          {dl<=7&&dl>0&&<span style={{background:"#ef444415",color:"#ef4444",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:8}}>Scade tra {dl}g</span>}
          {dl<=0&&<span style={{background:"#ef444415",color:"#ef4444",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:8}}>Scaduta</span>}
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {scheda.obiettivo&&<div style={{display:"flex",alignItems:"center",gap:4}}><Target size={14} color={s.sub}/><span style={{fontSize:13,color:s.sub}}>{scheda.obiettivo}</span></div>}
          {scheda.data_scadenza&&<div style={{display:"flex",alignItems:"center",gap:4}}><Calendar size={14} color={s.sub}/><span style={{fontSize:13,color:s.sub}}>Fino al {fmtDate(scheda.data_scadenza)}</span></div>}
        </div>
        {scheda.note_trainer&&<div style={{marginTop:12,fontSize:12,color:s.sub,fontStyle:"italic",borderTop:`1px solid ${s.primary}20`,paddingTop:10}}>💡 {scheda.note_trainer}</div>}
      </div>
      <h2 style={{color:s.text,fontSize:16,fontWeight:800,marginBottom:12}}>LE TUE SEDUTE</h2>
      {sedute.length===0&&<p style={{color:s.sub,fontSize:14}}>Nessuna seduta trovata.</p>}
      {sedute.map((sed,i)=>(
        <button key={sed.nome} onClick={()=>onSelectDay(sed.nome)} style={{width:"100%",background:s.card,border:`1px solid ${s.border}`,borderRadius:14,padding:16,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
          <div style={{width:44,height:44,borderRadius:12,background:`${s.primary}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:s.primary}}>{i+1}</div>
          <div style={{flex:1}}><div style={{color:s.text,fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>{sed.nome}{sed.tipo&&<span style={{background:`${s.primary}15`,color:s.primary,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:4}}>{sed.tipo}</span>}</div><div style={{color:s.sub,fontSize:13}}>{sed.count} esercizi</div></div>
          <ChevronRight size={20} color={s.muted}/>
        </button>))}
      <button onClick={onSync} style={{width:"100%",background:s.card,border:`1px solid ${s.border}`,borderRadius:12,padding:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:s.sub,fontSize:13,marginTop:8}}><RefreshCw size={14}/> Aggiorna {lastSync&&`• ${lastSync}`}</button>
    </div>);
}

function WorkoutDay({seduta,esercizi,s,onBack,onTimer,onVideo,progressData,onLog}){
  const tipo=esercizi[0]?.tipo_seduta||"";
  return(
    <div style={{padding:"0 16px 100px",minHeight:"100vh",background:s.bg}}>
      <div style={{position:"sticky",top:0,zIndex:50,background:s.bg,padding:"16px 0 12px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${s.border}`}}>
        <button onClick={onBack} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ChevronLeft size={20} color={s.text}/></button>
        <div style={{flex:1}}><h1 style={{color:s.text,fontSize:18,fontWeight:800,margin:0,display:"flex",alignItems:"center",gap:8}}>{seduta}{tipo&&<span style={{background:`${s.primary}15`,color:s.primary,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:4}}>{tipo}</span>}</h1><p style={{color:s.sub,fontSize:12,margin:0}}>{esercizi.length} esercizi</p></div>
      </div>
      <div style={{paddingTop:16}}>{[...esercizi].sort((a,b)=>parseInt(a.ordine||0)-parseInt(b.ordine||0)).map((ex,i)=><ExCard key={i} ex={ex} s={s} onTimer={onTimer} onVideo={onVideo} progress={progressData[`${ex.esercizio}__${ex.scheda_id}`]||[]} onLog={onLog}/>)}</div>
    </div>);
}

function ProgressView({progressData,s,esercizi,schedaId}){
  const [sel,setSel]=useState(null);
  const activeEx=useMemo(()=>[...new Set(esercizi.filter(e=>e.scheda_id===schedaId&&!isCardio(e)).map(e=>e.esercizio))],[esercizi,schedaId]);
  const todayLogs=useMemo(()=>{const t=new Date().toLocaleDateString("it-IT");const l=[];Object.entries(progressData).forEach(([k,es])=>{es.forEach(e=>{if(e.date===t)l.push({ex:k.split("__")[0],weight:e.weight})})});return l},[progressData]);
  const selData=sel?(progressData[`${sel}__${schedaId}`]||[]):[];
  return(
    <div style={{padding:"20px 16px 100px",minHeight:"100vh",background:s.bg}}>
      <h1 style={{color:s.text,fontSize:24,fontWeight:900,marginBottom:4}}>Progressi 📊</h1><p style={{color:s.sub,fontSize:14,marginBottom:24}}>I tuoi miglioramenti</p>
      <div style={{background:`${s.primary}10`,borderRadius:16,padding:16,marginBottom:24,border:`1px solid ${s.primary}20`}}>
        <div style={{fontSize:11,color:s.primary,fontWeight:700,letterSpacing:"1.5px",marginBottom:10}}>OGGI</div>
        {todayLogs.length===0?<p style={{color:s.sub,fontSize:13,margin:0}}>Nessun peso registrato oggi 💪</p>:<div style={{display:"flex",flexDirection:"column",gap:6}}>{todayLogs.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between"}}><span style={{color:s.text,fontSize:14}}>{l.ex}</span><span style={{color:s.primary,fontWeight:700,fontSize:14}}>{l.weight} kg</span></div>)}</div>}
      </div>
      <h2 style={{color:s.text,fontSize:16,fontWeight:800,marginBottom:12}}>PER ESERCIZIO</h2>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{activeEx.map(ex=><button key={ex} onClick={()=>setSel(sel===ex?null:ex)} style={{background:sel===ex?s.primary:s.card,border:`1px solid ${sel===ex?s.primary:s.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:sel===ex?"#FFF":s.sub,fontSize:12,fontWeight:600}}>{ex}</button>)}</div>
      {sel&&<div style={{background:s.card,borderRadius:16,padding:16,border:`1px solid ${s.border}`}}>
        <div style={{fontSize:15,fontWeight:700,color:s.text,marginBottom:12}}>{sel}</div>
        {selData.length===0?<p style={{color:s.sub,fontSize:13}}>Nessun dato.</p>:<>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:120,marginBottom:12}}>{selData.slice(-10).map((d,i)=>{const max=Math.max(...selData.slice(-10).map(x=>parseFloat(x.weight)||0));const h=max>0?((parseFloat(d.weight)||0)/max)*100:0;return<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:10,color:s.text,fontWeight:700}}>{d.weight}</span><div style={{width:"100%",height:`${h}%`,minHeight:4,background:s.primary,borderRadius:"4px 4px 0 0"}}/><span style={{fontSize:9,color:s.muted}}>{d.date.slice(0,5)}</span></div>})}</div>
          {selData.length>=2&&(()=>{const diff=(parseFloat(selData.at(-1).weight)||0)-(parseFloat(selData[0].weight)||0);return<div style={{display:"flex",alignItems:"center",gap:6,color:diff>=0?"#22c55e":"#ef4444"}}><TrendingUp size={16}/><span style={{fontSize:13,fontWeight:700}}>{diff>=0?"+":""}{diff.toFixed(1)} kg dal primo log</span></div>})()}
        </>}
      </div>}
    </div>);
}

function HistoryView({cliente,schede,esercizi,s}){
  const [openId,setOpenId]=useState(null);
  const ids=useMemo(()=>{
    const l=[cliente.scheda_attiva];
    if(cliente.schede_passate)cliente.schede_passate.split(",").map(x=>x.trim()).filter(Boolean).forEach(id=>l.push(id));
    return l.filter(Boolean);
  },[cliente]);
  const list=useMemo(()=>ids.map(id=>schede.find(sc=>sc.scheda_id===id)).filter(Boolean),[ids,schede]);
  return(
    <div style={{padding:"20px 16px 100px",minHeight:"100vh",background:s.bg}}>
      <h1 style={{color:s.text,fontSize:24,fontWeight:900,marginBottom:4}}>Storico 📋</h1><p style={{color:s.sub,fontSize:14,marginBottom:24}}>Le tue schede</p>
      {list.length===0&&<p style={{color:s.sub,fontSize:14}}>Nessuna scheda trovata.</p>}
      {list.map(sc=>{const active=sc.scheda_id===cliente.scheda_attiva;const isOpen=openId===sc.scheda_id;const exs=esercizi.filter(e=>e.scheda_id===sc.scheda_id);const seds=[...new Set(exs.map(e=>e.seduta))].filter(Boolean);
      return(<div key={sc.scheda_id} style={{background:s.card,borderRadius:16,marginBottom:12,border:`1px solid ${active?s.primary+"44":s.border}`,overflow:"hidden"}}>
        <button onClick={()=>setOpenId(isOpen?null:sc.scheda_id)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:16,display:"flex",alignItems:"center",gap:12,color:s.text,textAlign:"left"}}>
          <div style={{width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:active?`${s.primary}15`:"#E8E8E8"}}><ClipboardList size={20} color={active?s.primary:s.muted}/></div>
          <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:15,fontWeight:700,color:s.text}}>{sc.nome_scheda}</span>{active&&<span style={{background:s.primary,color:"#FFF",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:4}}>ATTIVA</span>}</div><div style={{fontSize:12,color:s.sub,marginTop:2}}>{sc.obiettivo} • {fmtDate(sc.data_creazione)} → {fmtDate(sc.data_scadenza)}</div></div>
          <ChevronDown size={18} color={s.muted} style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s"}}/>
        </button>
        {isOpen&&<div style={{padding:"12px 16px 16px",borderTop:`1px solid ${s.border}`}}>
          {sc.note_trainer&&<p style={{color:s.sub,fontSize:12,fontStyle:"italic",marginBottom:12}}>💡 {sc.note_trainer}</p>}
          {seds.map(sed=>{const dayExs=exs.filter(e=>e.seduta===sed).sort((a,b)=>parseInt(a.ordine||0)-parseInt(b.ordine||0));return(<div key={sed} style={{marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:s.primary,marginBottom:6}}>{sed}</div>{dayExs.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${s.border}`}}><span style={{color:s.text,fontSize:13}}>{e.esercizio}</span><span style={{color:s.sub,fontSize:13}}>{isCardio(e)?e.ripetizioni:`${e.serie}×${e.ripetizioni}`}</span></div>)}</div>)})}
        </div>}
      </div>)})}
    </div>);
}

function ProfileView({cliente,config,s,onLogout,servizi}){
  const corsi = (servizi||[]).filter(sv=>sv.tipo==="corso");
  const professionisti = (servizi||[]).filter(sv=>sv.tipo==="professionista");
  const waNum = (config.whatsapp||"").replace(/\D/g,"");
  const fbUrl = config.facebook ? (config.facebook.startsWith("http") ? config.facebook : `https://facebook.com/${config.facebook}`) : null;
  const igUrl = config.instagram ? `https://instagram.com/${config.instagram.replace("@","")}` : null;
  const orari = [
    ["Lunedì - Venerdì", config.orari_lun_ven || config.orari1 || "09:00 - 21:30"],
    ["Sabato", config.orari_sab || config.orari2 || "15:30 - 18:30"],
    ["Domenica", config.orari_dom || config.orari3 || "Chiuso"],
  ];
  return(
    <div style={{padding:"20px 16px 100px",minHeight:"100vh",background:s.bg}}>
      <h1 style={{color:s.text,fontSize:24,fontWeight:900,marginBottom:24}}>Profilo ⚙️</h1>

      {/* DATI CLIENTE */}
      <div style={{background:s.card,borderRadius:16,padding:20,marginBottom:16,border:`1px solid ${s.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
          <div style={{width:56,height:56,borderRadius:16,background:`${s.primary}15`,display:"flex",alignItems:"center",justifyContent:"center"}}><User size={28} color={s.primary}/></div>
          <div><div style={{fontSize:20,fontWeight:900,color:s.text}}>{cliente.nome} {cliente.cognome}</div><div style={{fontSize:13,color:s.sub}}>Codice: {cliente.codice}</div></div>
        </div>
        {[["Email",cliente.email],["Telefono",cliente.telefono],["Iscritto dal",fmtDate(cliente.data_iscrizione)]].filter(([,v])=>v).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${s.border}`}}><span style={{color:s.sub,fontSize:13}}>{k}</span><span style={{color:s.text,fontSize:13,fontWeight:600}}>{v}</span></div>)}
      </div>

      {/* LA TUA PALESTRA */}
      <div style={{background:s.card,borderRadius:16,padding:20,marginBottom:16,border:`1px solid ${s.border}`}}>
        <div style={{fontSize:11,color:s.primary,fontWeight:700,letterSpacing:"1.5px",marginBottom:14}}>LA TUA PALESTRA</div>
        <div style={{fontSize:18,fontWeight:800,color:s.text,marginBottom:12}}>{config.nome_palestra}</div>
        {config.indirizzo&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><MapPin size={15} color={s.sub}/><span style={{color:s.sub,fontSize:13}}>{config.indirizzo}</span></div>}
        {config.telefono&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Phone size={15} color={s.sub}/><span style={{color:s.sub,fontSize:13}}>{config.telefono}</span></div>}

        {/* TASTI SOCIAL */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {config.telefono&&<a href={`tel:${config.telefono}`} style={{flex:1,minWidth:"45%",background:`${s.primary}15`,border:`1px solid ${s.primary}33`,borderRadius:10,padding:"11px 8px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:s.primary,fontWeight:700,fontSize:13}}><Phone size={15}/> Chiama</a>}
          {waNum&&<a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" style={{flex:1,minWidth:"45%",background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:10,padding:"11px 8px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"#2E7D32",fontWeight:700,fontSize:13}}>💬 WhatsApp</a>}
          {igUrl&&<a href={igUrl} target="_blank" rel="noreferrer" style={{flex:1,minWidth:"45%",background:"#FCE4EC",border:"1px solid #F48FB1",borderRadius:10,padding:"11px 8px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"#C2185B",fontWeight:700,fontSize:13}}><Instagram size={15}/> Instagram</a>}
          {fbUrl&&<a href={fbUrl} target="_blank" rel="noreferrer" style={{flex:1,minWidth:"45%",background:"#E3F2FD",border:"1px solid #90CAF9",borderRadius:10,padding:"11px 8px",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"#1565C0",fontWeight:700,fontSize:13}}>📘 Facebook</a>}
        </div>
      </div>

      {/* ORARI */}
      {orari.length>0&&<div style={{background:s.card,borderRadius:16,padding:20,marginBottom:16,border:`1px solid ${s.border}`}}>
        <div style={{fontSize:11,color:s.primary,fontWeight:700,letterSpacing:"1.5px",marginBottom:14}}>🕐 ORARI</div>
        {orari.map(([giorno,ora])=>(
          <div key={giorno} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${s.border}`}}>
            <span style={{color:s.sub,fontSize:13}}>{giorno}</span>
            <span style={{color:ora==="Chiuso"?"#E53935":s.text,fontSize:13,fontWeight:700}}>{ora}</span>
          </div>
        ))}
      </div>}

      {/* CORSI */}
      {corsi.length>0&&<div style={{background:s.card,borderRadius:16,padding:20,marginBottom:16,border:`1px solid ${s.border}`}}>
        <div style={{fontSize:11,color:s.primary,fontWeight:700,letterSpacing:"1.5px",marginBottom:14}}>💪 I NOSTRI CORSI</div>
        {corsi.map((c,i)=>(
          <div key={i} style={{paddingBottom:12,marginBottom:12,borderBottom:i<corsi.length-1?`1px solid ${s.border}`:"none"}}>
            <div style={{fontSize:15,fontWeight:700,color:s.text}}>{c.nome}</div>
            {c.descrizione&&<div style={{fontSize:13,color:s.sub,marginTop:3}}>{c.descrizione}</div>}
            {c.contatto&&<div style={{fontSize:12,color:s.primary,marginTop:4,fontWeight:600}}>{c.contatto}</div>}
          </div>
        ))}
      </div>}

      {/* PROFESSIONISTI */}
      {professionisti.length>0&&<div style={{background:s.card,borderRadius:16,padding:20,marginBottom:16,border:`1px solid ${s.border}`}}>
        <div style={{fontSize:11,color:s.primary,fontWeight:700,letterSpacing:"1.5px",marginBottom:14}}>🏥 I NOSTRI PROFESSIONISTI</div>
        {professionisti.map((p,i)=>(
          <div key={i} style={{paddingBottom:12,marginBottom:12,borderBottom:i<professionisti.length-1?`1px solid ${s.border}`:"none"}}>
            <div style={{fontSize:15,fontWeight:700,color:s.text}}>{p.nome}</div>
            {p.descrizione&&<div style={{fontSize:13,color:s.sub,marginTop:3}}>{p.descrizione}</div>}
            {p.contatto&&<div style={{fontSize:12,color:s.primary,marginTop:4,fontWeight:600}}>{p.contatto}</div>}
          </div>
        ))}
      </div>}

      <button onClick={onLogout} style={{width:"100%",background:"#FFF0F0",border:"1px solid #FFCCCC",borderRadius:12,padding:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"#E53935",fontWeight:700,fontSize:14}}><LogOut size={16}/> Esci</button>
    </div>);
}

function LoadingScreen({c}){return<div style={{minHeight:"100vh",background:"#FFFFFF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><Dumbbell size={48} color={c||"#E53935"}/><p style={{color:"#999",fontSize:14}}>Caricamento...</p></div>}
function ErrorScreen({error,onRetry}){return<div style={{minHeight:"100vh",background:"#FFFFFF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,gap:16}}><AlertCircle size={40} color="#E53935"/><h2 style={{color:"#1A1A1A",fontSize:20,fontWeight:800}}>Errore di connessione</h2><p style={{color:"#666",fontSize:13,textAlign:"center",maxWidth:300}}>{error}</p><button onClick={onRetry} style={{background:"#E53935",border:"none",borderRadius:12,padding:"14px 32px",color:"#FFF",fontWeight:800,fontSize:16,cursor:"pointer"}}>Riprova</button></div>}

export default function GymApp(){
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState(null);
  const [loggedIn,setLoggedIn]=useState(false);const [loginErr,setLoginErr]=useState("");const [cliente,setCliente]=useState(null);
  const [tab,setTab]=useState("home");const [selDay,setSelDay]=useState(null);const [lastSync,setLastSync]=useState(null);
  const [timer,setTimer]=useState(null);const [video,setVideo]=useState(null);const [progress,setProgress]=useState({});

  const load=useCallback(async()=>{setLoading(true);setError(null);try{const d=await fetchAllData();setData(d);setLastSync(new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}))}catch(e){setError(e.message)}finally{setLoading(false)}},[]);
  useEffect(()=>{load()},[load]);

  const s=useMemo(()=>ST(data?.config?.colore_primario),[data]);
  const scheda=useMemo(()=>cliente&&data?data.schede.find(sc=>sc.scheda_id===cliente.scheda_attiva):null,[cliente,data]);
  const dayExs=useMemo(()=>selDay&&cliente&&data?data.esercizi.filter(e=>e.scheda_id===cliente.scheda_attiva&&e.seduta===selDay):[],[selDay,cliente,data]);

  const handleLogin=useCallback((code,pin)=>{
    if(!data)return;
    const c=data.clienti.find(cl=>cl.codice===code);
    if(!c){setLoginErr("Codice non trovato");return}
    if(c.pin&&String(c.pin)!==String(pin)){setLoginErr("PIN non corretto");return}
    setCliente(c);setLoggedIn(true);setLoginErr("");
    try{localStorage.setItem("gb_code",code);localStorage.setItem("gb_pin",pin)}catch(e){}
  },[data]);

  useEffect(()=>{
    if(!data||loggedIn)return;
    try{
      const code=localStorage.getItem("gb_code"),pin=localStorage.getItem("gb_pin");
      if(code){const c=data.clienti.find(cl=>cl.codice===code);if(c&&(!c.pin||String(c.pin)===String(pin))){setCliente(c);setLoggedIn(true)}}
    }catch(e){}
  },[data,loggedIn]);

  const handleLogout=useCallback(()=>{setLoggedIn(false);setCliente(null);setTab("home");setSelDay(null);try{localStorage.removeItem("gb_code");localStorage.removeItem("gb_pin")}catch(e){}},[]);
  const handleLog=useCallback((exercise,schedaId,weight)=>{const k=`${exercise}__${schedaId}`;const d=new Date().toLocaleDateString("it-IT");setProgress(p=>({...p,[k]:[...(p[k]||[]),{date:d,weight}]}))},[]);

  if(loading)return<LoadingScreen c="#E53935"/>;
  if(error)return<ErrorScreen error={error} onRetry={load}/>;
  if(!loggedIn)return<LoginScreen config={data.config} s={s} onLogin={handleLogin} error={loginErr}/>;

  return(
    <div style={{width:"100%",margin:"0 auto",position:"relative",background:"#FFFFFF",minHeight:"100vh"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}html,body{background:#FFFFFF}input::placeholder{color:#AAA}::-webkit-scrollbar{width:0}`}</style>
      {timer!==null&&<RestTimer seconds={timer} onClose={()=>setTimer(null)} color={s.primary}/>}
      {video&&<VideoModal url={video} onClose={()=>setVideo(null)}/>}
      <div>
        {selDay?<WorkoutDay seduta={selDay} esercizi={dayExs} s={s} onBack={()=>setSelDay(null)} onTimer={setTimer} onVideo={setVideo} progressData={progress} onLog={handleLog}/>
        :tab==="home"&&scheda?<Dashboard cliente={cliente} scheda={scheda} esercizi={data.esercizi} s={s} onSelectDay={setSelDay} onSync={load} lastSync={lastSync}/>
        :tab==="home"&&!scheda?<div style={{padding:"40px 24px",textAlign:"center"}}><AlertCircle size={40} color="#E53935" style={{margin:"0 auto 16px"}}/><h2 style={{color:"#1A1A1A",fontSize:18,fontWeight:800,marginBottom:8}}>Scheda non trovata</h2><p style={{color:"#666",fontSize:14}}>Contatta il tuo trainer.</p></div>
        :tab==="progress"?<ProgressView progressData={progress} s={s} esercizi={data.esercizi} schedaId={cliente?.scheda_attiva}/>
        :tab==="history"?<HistoryView cliente={cliente} schede={data.schede} esercizi={data.esercizi} s={s}/>
        :tab==="profile"?<ProfileView cliente={cliente} config={data.config} s={s} onLogout={handleLogout} servizi={data.servizi||[]}/>
        :null}
      </div>
      {!selDay&&<Nav tab={tab} onNav={t=>{setTab(t);setSelDay(null)}} color={s.primary}/>}
    </div>);
}
