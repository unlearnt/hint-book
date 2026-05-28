import { useState, useEffect, useRef } from "react";

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (import.meta.env.DEV) { setAuthed(true); setChecking(false); return; }
    fetch("/api/auth/check")
      .then(r => r.json())
      .then(d => { if (d.authed) setAuthed(true); })
      .catch(() => {})
      .finally(() => { setChecking(false); setTimeout(() => inputRef.current?.focus(), 50); });
  }, []);

  // Expose a way for the app to kick back to login (e.g. after session expiry)
  useEffect(() => {
    window.__hbLogout = () => setAuthed(false);
    return () => { delete window.__hbLogout; };
  }, []);

  if (checking) return null;
  if (authed) return children;

  const submit = async () => {
    if (!input || loading) return;
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input }),
      });
      if (r.ok) { setAuthed(true); }
      else {
        setShake(true); setInput("");
        setTimeout(() => { setShake(false); inputRef.current?.focus(); }, 500);
      }
    } catch {
      setShake(true); setInput("");
      setTimeout(() => { setShake(false); inputRef.current?.focus(); }, 500);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        html,body,#root{margin:0;padding:0;height:100%;overflow:hidden;}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
        .shake{animation:shake .4s ease}
      `}</style>
      <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a",fontFamily:"system-ui,sans-serif"}}>
        <div style={{width:340,padding:"36px 32px",background:"#1e293b",borderRadius:16,border:"1px solid #334155",boxShadow:"0 24px 48px rgba(0,0,0,.5)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
            <div style={{width:34,height:34,background:"#2563eb",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="ti ti-notebook" style={{fontSize:18,color:"white"}}/>
            </div>
            <div>
              <div style={{fontSize:"15px",fontWeight:700,color:"white"}}>HintBook</div>
              <div style={{fontSize:"10px",color:"#475569",marginTop:1,letterSpacing:".05em",textTransform:"uppercase"}}>Doc Assessment</div>
            </div>
          </div>
          <div style={{marginBottom:8,fontSize:"12px",fontWeight:600,color:"#94a3b8",letterSpacing:".04em"}}>Password</div>
          <div className={shake?"shake":""} style={{position:"relative",marginBottom:16}}>
            <input
              ref={inputRef}
              type={show?"text":"password"}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()}
              placeholder="Enter password"
              disabled={loading}
              style={{width:"100%",padding:"11px 40px 11px 14px",borderRadius:9,border:`1.5px solid ${shake?"#dc2626":"#334155"}`,background:"#0f172a",color:"white",fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"system-ui,sans-serif",caretColor:"#60a5fa",transition:"border-color .15s",opacity:loading?0.6:1}}
              onFocus={e=>e.target.style.borderColor="#2563eb"}
              onBlur={e=>e.target.style.borderColor=shake?"#dc2626":"#334155"}
            />
            <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#475569",padding:0,display:"flex",alignItems:"center"}}>
              <i className={`ti ${show?"ti-eye-off":"ti-eye"}`} style={{fontSize:15}}/>
            </button>
          </div>
          <button onClick={submit} disabled={loading}
            style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:"#2563eb",color:"white",fontSize:"13px",fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"system-ui,sans-serif",opacity:loading?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
            onMouseEnter={e=>{if(!loading)e.currentTarget.style.background="#1d4ed8";}}
            onMouseLeave={e=>e.currentTarget.style.background="#2563eb"}>
            {loading&&<i className="ti ti-loader" style={{fontSize:14,animation:"spin .7s linear infinite"}}/>}
            {loading?"Checking…":"Unlock"}
          </button>
        </div>
      </div>
    </>
  );
}
