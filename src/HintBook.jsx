import { useState, useRef, useEffect } from "react";
import PAGES from "./hints/index.js";


const AC=a=>({YES:"#16a34a",NO:"#dc2626",WARN:"#d97706",CONTEXT:"#2563eb",UNVERIFIABLE:"#6b7280"})[a]||"#6b7280";
const AB=a=>({YES:"#f0fdf4",NO:"#fef2f2",WARN:"#fffbeb",CONTEXT:"#eff6ff",UNVERIFIABLE:"#f9fafb"})[a]||"#f9fafb";
const ABd=a=>({YES:"#86efac",NO:"#fca5a5",WARN:"#fde68a",CONTEXT:"#bfdbfe",UNVERIFIABLE:"#e5e7eb"})[a]||"#e5e7eb";
const AI=a=>({YES:"ti-check",NO:"ti-x",WARN:"ti-alert-triangle",CONTEXT:"ti-info-circle",UNVERIFIABLE:"ti-minus"})[a]||"ti-minus";
const VCFG={
  HIGHLY_SUSPICIOUS:{bg:"#fef2f2",border:"#dc2626",text:"#991b1b",label:"Highly suspicious — likely fraudulent",icon:"ti-shield-off"},
  SUSPICIOUS:{bg:"#fffbeb",border:"#d97706",text:"#92400e",label:"Suspicious — further investigation required",icon:"ti-alert-triangle"},
  APPEARS_LEGITIMATE:{bg:"#f0fdf4",border:"#16a34a",text:"#14532d",label:"Appears legitimate",icon:"ti-shield-check"},
  CANNOT_DETERMINE:{bg:"#f8fafc",border:"#64748b",text:"#1e293b",label:"Cannot determine — insufficient visual data",icon:"ti-help"},
};

function resizeToBase64(dataUrl,mtype,maxSide=1024){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const{width:w,height:h}=img;
      if(Math.max(w,h)<=maxSide){resolve(dataUrl.split(",")[1]);return;}
      const s=maxSide/Math.max(w,h);
      const c=document.createElement("canvas");
      c.width=Math.round(w*s);c.height=Math.round(h*s);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      const q=mtype==="image/png"?"image/png":"image/jpeg";
      resolve(c.toDataURL(q,0.92).split(",")[1]);
    };
    img.src=dataUrl;
  });
}

export default function HintBookApp(){
  const[pgId,setPgId]=useState("ca_dl");
  const[open,setOpen]=useState({});
  const[imgs,setImgs]=useState([]);
  const[busy,setBusy]=useState(false);
  const[result,setResult]=useState(null);
  const[err,setErr]=useState(null);
  const[bmsg,setBmsg]=useState("");
  const[centerW,setCenterW]=useState(260);
  const[dynPages,setDynPages]=useState({});
  const[addOpen,setAddOpen]=useState(false);
  const[addInput,setAddInput]=useState("");
  const[genBusy,setGenBusy]=useState(false);
  const[genErr,setGenErr]=useState(null);
  const fileRef=useRef();const addRef=useRef();
  const addInputRef=useRef();const leaveTimer=useRef();
  const dragging=useRef(false);const dragX=useRef(0);const dragW=useRef(0);
  const allPages={...PAGES,...dynPages};
  const pg=allPages[pgId]||Object.values(allPages)[0];
  const total=pg.sections.reduce((a,s)=>a+s.hints.length,0);
  const isOpen=id=>open[id]!==false;
  const flip=id=>setOpen(p=>({...p,[id]:!isOpen(id)}));
  const allOpen=()=>{const n={};pg.sections.forEach(s=>{n[s.id]=true;});setOpen(n);};
  const allClose=()=>{const n={};pg.sections.forEach(s=>{n[s.id]=false;});setOpen(n);};

  const exportPage=p=>{
    const js=`const ${p.id.toUpperCase().replace(/[^A-Z0-9]/g,"_")}=${JSON.stringify(p,null,2)};\n\nexport default ${p.id.toUpperCase().replace(/[^A-Z0-9]/g,"_")};\n`;
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([js],{type:"text/javascript"}));
    a.download=`${p.id}.js`;a.click();
  };

  useEffect(()=>{
    const onMove=e=>{if(!dragging.current)return;const d=e.clientX-dragX.current;setCenterW(Math.max(180,Math.min(520,dragW.current+d)));};
    const onUp=()=>{dragging.current=false;document.body.style.cursor="";document.body.style.userSelect="";};
    window.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);
    return()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
  },[]);
  const onDivDown=e=>{dragging.current=true;dragX.current=e.clientX;dragW.current=centerW;document.body.style.cursor="col-resize";document.body.style.userSelect="none";e.preventDefault();};

  const processFiles=async(files,append=false)=>{
    const existing=append?imgs:[];const slots=2-existing.length;if(slots<=0)return;
    const arr=Array.from(files).slice(0,slots);
    const proc=await Promise.all(arr.map(async f=>{
      const dataUrl=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});
      const mtype=f.type||"image/jpeg";
      const apiB64=await resizeToBase64(dataUrl,mtype,1024);
      return{preview:dataUrl,base64:apiB64,mtype,name:f.name,size:f.size};
    }));
    setImgs([...existing,...proc]);setResult(null);setErr(null);
  };

  const doAssess=async()=>{
    if(!imgs.length||busy)return;
    setBusy(true);setErr(null);setResult(null);
    const MSGS=[`Analyzing image${imgs.length>1?"s":""}…`,`Running ${total} hint checks…`,"Cross-referencing fields…","Checking MRZ consistency…","Checking semantic consistency…","Compiling assessment…"];
    let mi=0;setBmsg(MSGS[0]);const tick=setInterval(()=>{mi=(mi+1)%MSGS.length;setBmsg(MSGS[mi]);},1800);
    try{
      const qs=pg.sections.map(s=>`[${s.id}] ${s.title}\n`+s.hints.map(h=>`  ${h[0]} (expect:${h[3]}): ${h[1]}${h[2]?` [${h[2]}]`:""}`).join("\n")).join("\n\n");
      const resp=await fetch("/api/llm/chat/completions",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"Qwen/Qwen3-VL-235B-A22B-Instruct",max_tokens:4096,messages:[{role:"user",content:[
          ...imgs.map(img=>({type:"image_url",image_url:{url:img.preview}})),
          {type:"text",text:`You are an expert document fraud detection AI. Analyze the provided image(s) of a "${pg.title}" document against this checklist.\n\nAnswer: YES (confirmed), NO (anomaly/red flag), WARN (borderline), UNVERIFIABLE (can't determine from image), CONTEXT (generation-dependent — describe what you observe).\ncriticalFails = (NO where expect=YES) + (YES where expect=NO). warnings = WARN count. passes = correct YES/NO answers. unverifiable = UNVERIFIABLE + CONTEXT count.\nProvide a 1-sentence finding per check.\n\nCHECKLIST:\n${qs}\n\nReturn ONLY valid JSON, no markdown fences:\n{"verdict":"HIGHLY_SUSPICIOUS|SUSPICIOUS|APPEARS_LEGITIMATE|CANNOT_DETERMINE","summary":"2-3 sentence assessment naming specific anomalies","criticalFails":0,"warnings":0,"passes":0,"unverifiable":0,"sections":[{"id":"","title":"","checks":[{"id":"","answer":"YES|NO|WARN|UNVERIFIABLE|CONTEXT","finding":"1 sentence"}]}]}`}
        ]}]})
      });
      const data=await resp.json();if(data.error)throw new Error(data.error.message||"API error");
      const raw=data.choices?.[0]?.message?.content||"";
      setResult(JSON.parse(raw.replace(/```(?:json)?\s*|\s*```/g,"").trim()));
    }catch(e){setErr(e.message||"Assessment failed");}
    finally{clearInterval(tick);setBusy(false);setBmsg("");}
  };

  const findQ=(sid,cid)=>pg.sections.find(s=>s.id===sid)?.hints.find(h=>h[0]===cid)?.[1]||cid;

  /* ── HINT PAGE GENERATION ── */
  const HINTBOOK_PROMPT=docType=>`You are an expert document forensics specialist building a "HintBook" — a structured checklist system for multimodal AI document fraud detection.
  Generate a complete, research-grade hint page for: "${docType}"
  Each hint is a binary question a multimodal LLM can answer from a document image to detect forgeries.
  CRITICAL: Return ONLY valid JSON. No markdown fences, no backticks, no preamble.
  JSON STRUCTURE (follow exactly — the app parses this directly):
  {
    "id": "snake_case_no_spaces",
    "title": "Short human-readable title (max 35 chars)",
    "color": "#hex from issuing country/region national colors",
    "subtitle": "Gen YYYY · Gen YYYY · Gen YYYY (all currently valid generations)",
    "sources": ["Official gov source", "ICAO/AAMVA/EU spec", "Forensic reference", ...],
    "sections": [
      {
        "id": "A",
        "title": "Section title",
        "hints": [
          ["A.1", "Specific binary question?", "Note with forensic significance, generation context, or source citation — or null", "YES|NO|CONTEXT"]
        ]
      }
    ]
  }

EXPECT VALUES:
- "YES" → feature MUST be present on a genuine document. Absence = forgery indicator.
- "NO" → feature must NOT be present. Presence = red flag.
- "CONTEXT" → generation-dependent or context-dependent; note explains what each generation shows.

══ PROVEN METHODOLOGY (replicate this rigor) ══

From CA DL research:
• DL number is exactly 1 letter + 7 digits (e.g. A1234567) — all-numeric numbers (like 58754758) caught real fraud
• REAL ID: gold bear+star OR "FEDERAL LIMITS APPLY" must appear on post-Jan 2018 cards; absence of both = forgery
• Barcode cross-checks: S14 section compares name/DOB/sex/height/DL# between printed fields and PDF417 barcode data — catches data-layer tampering invisible to visual inspection
• Validity: ~5 years (deviation, e.g. 23-month expiry, was caught as fraudulent)
• Under-21 marker: red "AGE 21 IN [YEAR]" bar — year must match DOB+21

From US Green Card research:
• Category code "EB5" is INVALID — real EB-5 codes are E51/E52/E53 (forgers use the informal program name)
• MRZ must start "C1USA" or "C2USA" — these specific prefixes identify genuine USCIS green cards
• Document number: 13 chars, first 3 = recognized service center code (MSC/VSC/LIN/SRC/WAC/NBC/IOE)
• Ghost security overprint name must match printed cardholder name — mismatch = fabricated stock
• Name "BELINDA" + Sex field "M" = critical cross-field contradiction (name/sex inconsistency)
• Category CR → 2-year validity; non-CR → 10-year validity; mismatch = structural contradiction
• 4-digit years in expiry fields (2029 not 29)

From German Personalausweis research:
• Document number: 9 chars, first char from {L,M,N,P,R,T,V,W,X,Y} only; remaining from digits + {C,F,G,H,J,K,L,M,N,P,R,T,V,W,X,Y,Z}; NO vowels, NO B/D/Q/S at any position
• Germany uses UNIQUE 1-letter ICAO country code "D" → MRZ Line 1 starts "IDD<<" NOT "IDDEUT"  
• Dates in DD.MM.YYYY format (not MM/DD/YYYY or YYYY-MM-DD) — US format = forgery indicator
• Height in centimeters (metric), eye color in German terms only (blau, braun, grau, grün...)
• Validity: 10 years for age 24+; 6 years for under-24 AT TIME OF ISSUE
• Gen 2021+: EU flag with "DE" in white, no signature field, optically variable stripe on back
• Innosec Fusion® photo fused into polycarbonate — raised edge = non-genuine

══ SECTIONS TO INCLUDE (adapt to document type) ══
1. Generation identification (CONTEXT expects — visual, feature, and design differences per generation)
2. Header, labels & national symbols (official text, national seal/crest, document type label)
3. Name fields (case, character set, script, transliteration for non-Latin, order: family/given)
4. Document/ID number format (exact character pattern, length, forbidden chars, check digit)
5. Date fields & validity (country's date format, validity periods by age/category, expiry logic)
6. Physical descriptors (height metric vs imperial, eye color codes/language, sex field values)
7. Card Access Number or equivalent (if applicable — PACE chip access on EU cards)
8. MRZ — if present (TD1: 3×30 chars, TD2: 2×36, TD3: 2×44; country code; line structure; check digits)
9. Security features — visual (specific hologram imagery, OVI color shift, laser engraving, CLI, substrate)
10. UV / ultraviolet features
11. Back of document (address, barcodes, MRZ position, additional data fields)
12. Cross-field consistency (catches sophisticated fakes — the most important section)
    Required: MRZ vs printed data, name vs sex field, validity period vs DOB, generation features coexist

QUALITY REQUIREMENTS:
• 8-13 sections, 3-8 hints per section, minimum 50 total hints
• Every question must be answerable from a document image (no lab equipment required for visual checks)
• Be specific: not "Is a hologram present?" but "Does the hologram show [specific imagery] when tilted?"
• Use exact date format for the issuing country; exact height units (metric vs imperial)
• Use field labels in the document's own language (e.g. German: Familienname, French: Nom de famille)
• For MRZ: specify exact ICAO line positions
• For number formats: specify exact character classes and forbidden characters
• Include at least 6 cross-field consistency checks
• Note any country-specific ICAO deviations (e.g. Germany's 1-letter code, USA's non-standard MRZ prefixes)
• Cover currently valid generations only (current year is 2026)
• Cite specific regulations, standards, or official press releases in notes where possible`;

  const generateHintPage=async()=>{
    if(!addInput.trim()||genBusy)return;
    setGenBusy(true);setGenErr(null);
    try{
      const resp=await fetch("/api/llm/chat/completions",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"deepseek-ai/DeepSeek-V4-Pro",
          max_tokens:6000,
          messages:[{role:"user",content:HINTBOOK_PROMPT(addInput.trim())}]
        })
      });
      const data=await resp.json();
      if(data.error)throw new Error(data.error.message||"API error");
      const raw=data.choices?.[0]?.message?.content||"";
      const page=JSON.parse(raw.replace(/```(?:json)?\s*|\s*```/g,"").trim());
      if(!page.id||!page.sections)throw new Error("Malformed response — missing id or sections");
      setDynPages(prev=>({...prev,[page.id]:page}));
      setPgId(page.id);setAddInput("");setAddOpen(false);setResult(null);setImgs([]);setOpen({});
    }catch(e){setGenErr(e.message||"Generation failed. Try again.");}
    finally{setGenBusy(false);}
  };

  const openAdd=()=>{clearTimeout(leaveTimer.current);setAddOpen(true);setTimeout(()=>addInputRef.current?.focus(),50);};
  const closeAdd=()=>{leaveTimer.current=setTimeout(()=>{if(document.activeElement!==addInputRef.current)setAddOpen(false);},200);};
  const vc=VCFG[result?.verdict]||VCFG.CANNOT_DETERMINE;
  const fmtSize=b=>b>1e6?`${(b/1e6).toFixed(1)}MB`:`${(b/1024).toFixed(0)}KB`;

  return(
    <>
      <style>{`
        html,body,#root{margin:0;padding:0;height:100%;overflow:hidden;}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .sp{display:inline-block;animation:spin .7s linear infinite}.pu{animation:pulse 1.4s ease-in-out infinite}
        .hs{scrollbar-width:thin;scrollbar-color:#334155 #0f172a}.hs::-webkit-scrollbar{width:4px}.hs::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}
        .cs,.rs{scrollbar-width:thin;scrollbar-color:#cbd5e1 #f8fafc}.cs::-webkit-scrollbar,.rs::-webkit-scrollbar{width:4px}.cs::-webkit-scrollbar-thumb,.rs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}
        .row:hover{background:#f8fafc}.secbtn:hover{background:#f1f5f9!important}.pgbtn:hover{background:rgba(255,255,255,.06)!important}
        .imgdel:hover{background:rgba(0,0,0,.8)!important}.upbtn:hover{background:#f1f5f9!important}.abtn:not(:disabled):hover{background:#1d4ed8!important}
        .divider:hover{background:#94a3b8!important}.addslot:hover{background:#f1f5f9!important;border-color:#94a3b8!important}.dropz:hover{border-color:#94a3b8!important;background:#f1f5f9!important}
      `}</style>
      <div style={{display:"flex",height:"100vh",width:"100%",background:"#0f172a",overflow:"hidden",fontFamily:"system-ui,sans-serif",fontSize:"13px",color:"#0f172a"}}>

        {/* LEFT NAV */}
        <div style={{width:"233px",flexShrink:0,background:"#0f172a",display:"flex",flexDirection:"column",borderRight:"1px solid #1e293b"}}>
          <div style={{padding:"14px 13px 12px",borderBottom:"1px solid #1e293b"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,background:"#2563eb",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}><i className="ti ti-notebook" style={{fontSize:14,color:"white"}}/></div>
              <div><div style={{fontSize:"13px",fontWeight:700,color:"white"}}>HintBook</div><div style={{fontSize:"9px",color:"#64748b",marginTop:1,letterSpacing:".05em",textTransform:"uppercase"}}>Doc Assessment</div></div>
            </div>
          </div>
          <div style={{padding:"10px 13px 5px",fontSize:"9px",fontWeight:600,color:"#475569",letterSpacing:".08em",textTransform:"uppercase"}}>Hint Pages</div>
          <div style={{flex:1,padding:"0 7px",overflowY:"auto"}} className="hs">
            {Object.values(allPages).map(p=>{const active=pgId===p.id;const isDyn=!!dynPages[p.id];return(
              <div key={p.id} style={{position:"relative",marginBottom:4}}>
                <button className="pgbtn" onClick={()=>{setPgId(p.id);setResult(null);setImgs([]);setErr(null);setOpen({});}}
                  style={{display:"block",width:"100%",padding:"10px 10px",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",background:active?"rgba(37,99,235,.15)":"transparent",outline:active?`1.5px solid ${p.color}`:"none",outlineOffset:"-1.5px",transition:"background .12s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{width:8,height:8,borderRadius:"50%",background:active?p.color:"#334155",flexShrink:0,transition:"background .12s"}}/><span style={{fontSize:"11px",fontWeight:600,color:active?"white":"#94a3b8",lineHeight:1.3}}>{p.title}</span>{isDyn&&<span style={{fontSize:"8px",background:"rgba(37,99,235,.25)",color:"#60a5fa",borderRadius:3,padding:"1px 4px",marginLeft:"auto",flexShrink:0}}>GEN</span>}</div>
                  <div style={{fontSize:"10px",color:"#475569",lineHeight:1.4,paddingLeft:15}}>{p.subtitle}</div>
                  <div style={{fontSize:"9px",color:active?p.color:"#334155",paddingLeft:15,marginTop:4,fontFamily:"monospace"}}>{p.sections.length}s · {p.sections.reduce((a,s)=>a+s.hints.length,0)} checks</div>
                </button>
                {isDyn&&<button onClick={e=>{e.stopPropagation();exportPage(p);}} title="Export as .js file"
                  style={{position:"absolute",top:6,right:6,background:"rgba(37,99,235,.15)",border:"none",borderRadius:4,padding:"3px 5px",cursor:"pointer",color:"#60a5fa",display:"flex",alignItems:"center"}}>
                  <i className="ti ti-download" style={{fontSize:11}}/>
                </button>}
              </div>
            );})}
          </div>
          <div onMouseEnter={openAdd} onMouseLeave={closeAdd}
            style={{borderTop:"1px solid #1e293b",flexShrink:0}}>
            {/* Sliding input panel */}
            <div style={{maxHeight:addOpen?"130px":"0px",overflow:"hidden",transition:"max-height .22s ease-out"}}>
              <div style={{padding:"10px 9px 6px"}}>
                <div style={{fontSize:"9px",fontWeight:600,color:"#475569",letterSpacing:".06em",textTransform:"uppercase",marginBottom:6}}>Document type to add</div>
                <input ref={addInputRef} value={addInput}
                  onChange={e=>{setAddInput(e.target.value);setGenErr(null);}}
                  onKeyDown={e=>e.key==="Enter"&&generateHintPage()}
                  onFocus={()=>{clearTimeout(leaveTimer.current);setAddOpen(true);}}
                  onBlur={closeAdd}
                  placeholder="e.g. UK Passport, Texas DL…"
                  style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #334155",background:"#1e293b",color:"white",fontSize:"12px",outline:"none",boxSizing:"border-box",fontFamily:"system-ui,sans-serif",caretColor:"#60a5fa"}}/>
                {genErr&&<div style={{marginTop:5,fontSize:"10px",color:"#f87171",lineHeight:1.4,background:"rgba(239,68,68,.1)",padding:"4px 8px",borderRadius:5}}>{genErr}</div>}
              </div>
            </div>
            {/* Add button */}
            <div style={{padding:"8px 9px"}}>
              <button onClick={generateHintPage}
                disabled={genBusy}
                style={{width:"100%",padding:"8px 12px",border:`1.5px dashed ${addOpen&&addInput.trim()?"#60a5fa":"#334155"}`,borderRadius:8,background:addOpen&&addInput.trim()?"rgba(37,99,235,.12)":"transparent",cursor:"pointer",color:addOpen&&addInput.trim()?"#60a5fa":"#475569",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:"12px",fontFamily:"system-ui,sans-serif",transition:"all .2s",fontWeight:addOpen&&addInput.trim()?600:400}}>
                <i className={`ti ${genBusy?"ti-loader sp":"ti-plus"}`} style={{fontSize:13}}/>
                {genBusy?"Generating hint page…":"+ Add Hint Page"}
              </button>
            </div>
          </div>
          <div style={{padding:"8px 13px",borderTop:"1px solid #1e293b"}}><div style={{fontSize:"9px",color:"#334155",lineHeight:1.5}}>Assessment: Qwen3-VL<br/><span style={{color:"#475569"}}>HintGen: DeepSeek V4 Pro</span></div></div>
        </div>

        {/* CENTER: HINT PAGE */}
        <div style={{width:centerW,flexShrink:0,background:"#f8fafc",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid #e2e8f0",background:"white",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><div style={{width:9,height:9,borderRadius:"50%",background:pg.color}}/><span style={{fontSize:"13px",fontWeight:700,color:"#0f172a"}}>{pg.title}</span></div>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:9}}>{pg.subtitle}</div>
            <div style={{display:"flex",gap:6}}><button onClick={allOpen} style={{flex:1,fontSize:"11px",padding:"4px 0",border:"1px solid #e2e8f0",borderRadius:6,background:"white",cursor:"pointer",color:"#475569"}}>Expand all</button><button onClick={allClose} style={{flex:1,fontSize:"11px",padding:"4px 0",border:"1px solid #e2e8f0",borderRadius:6,background:"white",cursor:"pointer",color:"#475569"}}>Collapse</button></div>
          </div>
          <div className="cs" style={{flex:1,overflowY:"auto",padding:"8px"}}>
            {pg.sections.map(sec=>{
              const opn=isOpen(sec.id);const rs=result?.sections?.find(s=>s.id===sec.id);
              const hasFail=rs?.checks?.some(c=>c.answer==="NO");const hasWarn=rs?.checks?.some(c=>c.answer==="WARN");
              return(<div key={sec.id} style={{marginBottom:6,border:"1px solid #e2e8f0",borderRadius:9,overflow:"hidden",background:"white"}}>
                <button className="secbtn" onClick={()=>flip(sec.id)} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 11px",background:"white",border:"none",cursor:"pointer",textAlign:"left",transition:"background .1s"}}>
                  <span style={{fontSize:"10px",fontFamily:"monospace",fontWeight:700,color:pg.color,flexShrink:0}}>{sec.id}</span>
                  <span style={{fontSize:"12px",fontWeight:600,flex:1,color:"#1e293b",lineHeight:1.3}}>{sec.title}</span>
                  <div style={{display:"flex",gap:3,alignItems:"center"}}>
                    {hasFail&&<span style={{width:7,height:7,borderRadius:"50%",background:"#dc2626",display:"block"}}/>}
                    {hasWarn&&<span style={{width:7,height:7,borderRadius:"50%",background:"#d97706",display:"block"}}/>}
                    <span style={{fontSize:"10px",color:"#94a3b8",fontFamily:"monospace"}}>{sec.hints.length}</span>
                    <i className={`ti ${opn?"ti-chevron-up":"ti-chevron-down"}`} style={{fontSize:12,color:"#94a3b8"}}/>
                  </div>
                </button>
                {opn&&<div style={{borderTop:"1px solid #f1f5f9"}}>
                  {sec.hints.map(h=>{const chk=rs?.checks?.find(c=>c.id===h[0]);return(
                    <div key={h[0]} style={{padding:"7px 11px",borderBottom:"1px solid #f8fafc"}}>
                      <div style={{display:"flex",gap:6,alignItems:"flex-start"}}><span style={{fontSize:"9px",fontFamily:"monospace",color:"#94a3b8",flexShrink:0,paddingTop:2,minWidth:36}}>{h[0]}</span><span style={{fontSize:"12px",color:"#334155",lineHeight:1.45,flex:1}}>{h[1]}</span></div>
                      {h[2]&&<div style={{fontSize:"10px",color:"#94a3b8",paddingLeft:42,marginTop:2,lineHeight:1.4,fontStyle:"italic"}}>{h[2]}</div>}
                      <div style={{display:"flex",gap:5,paddingLeft:42,marginTop:4,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:"10px",padding:"2px 7px",borderRadius:999,fontWeight:600,background:h[3]==="YES"?"#dcfce7":h[3]==="NO"?"#fee2e2":"#eff6ff",color:h[3]==="YES"?"#15803d":h[3]==="NO"?"#dc2626":"#2563eb"}}>Expect {h[3]}</span>
                        {chk&&<span style={{fontSize:"10px",padding:"2px 7px",borderRadius:999,fontWeight:600,background:AB(chk.answer),color:AC(chk.answer),border:`1px solid ${ABd(chk.answer)}`}}>{chk.answer}</span>}
                      </div>
                    </div>
                  );})}
                </div>}
              </div>);
            })}
            <div style={{margin:"6px 0 14px",padding:"10px 11px",background:"white",border:"1px solid #e2e8f0",borderRadius:9}}>
              <div style={{fontSize:"10px",fontWeight:700,color:"#64748b",letterSpacing:".05em",textTransform:"uppercase",marginBottom:6}}>Sources</div>
              {pg.sources.map((s,i)=><div key={i} style={{fontSize:"10px",color:"#94a3b8",lineHeight:1.5,marginBottom:3,paddingLeft:9,borderLeft:"2px solid #e2e8f0"}}>{s}</div>)}
            </div>
          </div>
        </div>

        {/* DRAG DIVIDER */}
        <div className="divider" onMouseDown={onDivDown} style={{width:"5px",flexShrink:0,background:"#e2e8f0",cursor:"col-resize",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s",zIndex:10}}>
          <div style={{width:2,height:32,background:"#94a3b8",borderRadius:2,opacity:.6}}/>
        </div>

        {/* RIGHT PANEL */}
        <div style={{flex:1,display:"flex",flexDirection:"column",background:"white",overflow:"hidden",minWidth:0}}>
          {/* Upload */}
          <div style={{flexShrink:0,borderBottom:"1px solid #e2e8f0",padding:"13px 15px",background:"white"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
              <div><div style={{fontSize:"13px",fontWeight:700,color:"#0f172a"}}>Document Assessment</div><div style={{fontSize:"11px",color:"#64748b",marginTop:2}}>Using <span style={{color:pg.color,fontWeight:600}}>{pg.title}</span> · {total} hint checks · images resized to 1024px</div></div>
              <div style={{display:"flex",gap:8}}>
                <button className="upbtn" onClick={()=>fileRef.current?.click()} style={{fontSize:"12px",padding:"6px 13px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",color:"#334155",display:"flex",alignItems:"center",gap:6,fontWeight:500,transition:"background .1s"}}><i className="ti ti-upload" style={{fontSize:13}}/>Upload</button>
                <button className="abtn" onClick={doAssess} disabled={!imgs.length||busy} style={{fontSize:"12px",padding:"6px 15px",borderRadius:8,border:"none",cursor:imgs.length&&!busy?"pointer":"not-allowed",background:imgs.length&&!busy?"#2563eb":"#e2e8f0",color:imgs.length&&!busy?"white":"#94a3b8",display:"flex",alignItems:"center",gap:6,fontWeight:600,transition:"background .15s"}}>
                  <i className={`ti ${busy?"ti-loader sp":"ti-scan"}`} style={{fontSize:13}}/>{busy?"Assessing…":"Assess"}
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>processFiles(e.target.files,false)}/>
            <input ref={addRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>processFiles(e.target.files,true)}/>
            {imgs.length===0?(
              <div className="dropz" onClick={()=>fileRef.current?.click()} onDrop={e=>{e.preventDefault();processFiles(e.dataTransfer.files,false);}} onDragOver={e=>e.preventDefault()}
                style={{height:"165px",border:"1.5px dashed #cbd5e1",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexDirection:"column",gap:10,transition:"all .15s",color:"#94a3b8",background:"#f8fafc"}}>
                <i className="ti ti-photo-up" style={{fontSize:32}}/>
                <div style={{textAlign:"center",lineHeight:1.6}}><div style={{fontSize:"13px",fontWeight:500}}>Click or drag document image(s) here</div><div style={{fontSize:"11px",marginTop:2}}>Front + Back · max 2 images · auto-resized to 1024px longest side</div></div>
              </div>
            ):(
              <div style={{display:"flex",gap:12,alignItems:"stretch"}}>
                {imgs.map((img,i)=>(
                  <div key={i} style={{flex:1,position:"relative",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden",display:"flex",flexDirection:"column"}}>
                    <div style={{flex:1,height:"150px",display:"flex",alignItems:"center",justifyContent:"center",padding:"8px",background:"#f8fafc"}}>
                      <img src={img.preview} alt={`doc${i+1}`} style={{maxWidth:"100%",maxHeight:"100%",width:"auto",height:"auto",objectFit:"contain",display:"block",borderRadius:6,boxShadow:"0 1px 6px rgba(0,0,0,.12)"}}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px",background:"#f1f5f9",borderTop:"1px solid #e2e8f0"}}>
                      <div><span style={{fontSize:"11px",fontWeight:600,color:"#475569",marginRight:6}}>{i===0?"Front":"Back"}</span><span style={{fontSize:"10px",color:"#94a3b8"}}>{fmtSize(img.size)}</span></div>
                      <button className="imgdel" onClick={()=>setImgs(p=>p.filter((_,j)=>j!==i))} style={{background:"rgba(0,0,0,.35)",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",color:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:0,transition:"background .1s"}}><i className="ti ti-x" style={{fontSize:10}}/></button>
                    </div>
                  </div>
                ))}
                {imgs.length<2&&(<div className="addslot" onClick={()=>addRef.current?.click()} style={{flex:1,height:"174px",border:"1.5px dashed #cbd5e1",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#94a3b8",gap:7,background:"#f8fafc",transition:"all .15s"}}><i className="ti ti-plus" style={{fontSize:24}}/><span style={{fontSize:"12px",fontWeight:500}}>Add back</span></div>)}
              </div>
            )}
            {busy&&<div className="pu" style={{marginTop:9,fontSize:"12px",color:"#2563eb",display:"flex",alignItems:"center",gap:7}}><i className="ti ti-loader sp" style={{fontSize:12}}/>{bmsg}</div>}
          </div>

          {/* Results */}
          <div className="rs" style={{flex:1,overflowY:"auto",padding:"13px 15px"}}>
            {!result&&!err&&!busy&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14,color:"#94a3b8"}}><div style={{width:60,height:60,borderRadius:16,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center"}}><i className="ti ti-clipboard-list" style={{fontSize:30,color:"#cbd5e1"}}/></div><div style={{textAlign:"center",maxWidth:240}}><div style={{fontSize:"14px",fontWeight:600,color:"#334155",marginBottom:5}}>No assessment yet</div><div style={{fontSize:"12px",lineHeight:1.6,color:"#94a3b8"}}>Upload a document image and click <strong style={{color:"#334155"}}>Assess</strong> to run all <strong style={{color:pg.color}}>{total} checks</strong> from the <strong style={{color:pg.color}}>{pg.title}</strong> hint page</div></div></div>)}
            {err&&(<div style={{padding:"12px 14px",background:"#fef2f2",borderRadius:10,border:"1px solid #fca5a5",display:"flex",gap:10,alignItems:"flex-start"}}><i className="ti ti-alert-circle" style={{fontSize:18,color:"#dc2626",flexShrink:0,marginTop:1}}/><div><div style={{fontSize:"13px",fontWeight:600,color:"#991b1b",marginBottom:2}}>Assessment failed</div><div style={{fontSize:"12px",color:"#b91c1c",lineHeight:1.5}}>{err}</div></div></div>)}
            {result&&(<div>
              <div style={{padding:"13px 15px",borderRadius:11,background:vc.bg,border:`2px solid ${vc.border}`,marginBottom:13,display:"flex",gap:12,alignItems:"flex-start"}}>
                <i className={`ti ${vc.icon}`} style={{fontSize:24,color:vc.text,flexShrink:0,marginTop:1}}/><div><div style={{fontWeight:700,color:vc.text,fontSize:"14px",marginBottom:5}}>{vc.label}</div><div style={{fontSize:"12px",color:vc.text,lineHeight:1.6,opacity:.9}}>{result.summary}</div></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:13}}>
                {[["Passed",result.passes,"#f0fdf4","#15803d","#86efac"],["Crit. fails",result.criticalFails,"#fef2f2","#dc2626","#fca5a5"],["Warnings",result.warnings,"#fffbeb","#d97706","#fde68a"],["Unverifiable",result.unverifiable,"#f8fafc","#475569","#e2e8f0"]].map(([lb,v,bg,tx,bd])=>(
                  <div key={lb} style={{background:bg,borderRadius:10,padding:"9px 5px",textAlign:"center",border:`1px solid ${bd}`}}><div style={{fontSize:"22px",fontWeight:800,color:tx,lineHeight:1}}>{v}</div><div style={{fontSize:"11px",color:tx,marginTop:4,fontWeight:500,opacity:.85}}>{lb}</div></div>
                ))}
              </div>
              {result.sections?.map(sec=>{
                const fails=sec.checks?.filter(c=>c.answer==="NO").length||0;const warns=sec.checks?.filter(c=>c.answer==="WARN").length||0;
                return(<div key={sec.id} style={{marginBottom:9,border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"8px 13px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:"11px",fontFamily:"monospace",fontWeight:700,color:pg.color}}>{sec.id}</span>
                    <span style={{fontSize:"13px",fontWeight:600,flex:1,color:"#1e293b"}}>{sec.title}</span>
                    <div style={{display:"flex",gap:5}}>
                      {fails>0&&<span style={{fontSize:"11px",background:"#fef2f2",color:"#dc2626",border:"1px solid #fca5a5",padding:"2px 8px",borderRadius:999,fontWeight:600}}>{fails} fail</span>}
                      {warns>0&&<span style={{fontSize:"11px",background:"#fffbeb",color:"#d97706",border:"1px solid #fde68a",padding:"2px 8px",borderRadius:999,fontWeight:600}}>{warns} warn</span>}
                      {fails===0&&warns===0&&<span style={{fontSize:"11px",background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac",padding:"2px 8px",borderRadius:999,fontWeight:600}}>✓ pass</span>}
                    </div>
                  </div>
                  {sec.checks?.map(c=>{const ac=AC(c.answer),ab=AB(c.answer),abd=ABd(c.answer),ai=AI(c.answer);return(
                    <div key={c.id} className="row" style={{padding:"8px 13px",borderBottom:"1px solid #f8fafc",display:"grid",gridTemplateColumns:"17px 1fr 84px",gap:9,alignItems:"start",transition:"background .1s"}}>
                      <i className={`ti ${ai}`} style={{fontSize:14,color:ac,paddingTop:2}}/>
                      <div><div style={{fontSize:"12px",color:"#1e293b",lineHeight:1.45,fontWeight:500}}>{findQ(sec.id,c.id)}</div>{c.finding&&<div style={{fontSize:"11px",color:"#64748b",marginTop:3,lineHeight:1.45}}>{c.finding}</div>}</div>
                      <div style={{textAlign:"right",paddingTop:1}}><span style={{fontSize:"11px",padding:"2px 8px",borderRadius:999,fontWeight:700,background:ab,color:ac,border:`1px solid ${abd}`,display:"inline-block"}}>{c.answer}</span></div>
                    </div>
                  );})}
                </div>);
              })}
            </div>)}
          </div>
        </div>
      </div>
    </>
  );
}
