import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/useAuth";

interface Props {
  onSuccess: () => void;
  onGoSignup: () => void;
}

export default function Login({ onSuccess, onGoSignup }: Props) {
  const { login, error, clearError } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [busy, setBusy]         = useState(false);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await login(email.trim(), password);
    setBusy(false);
    if (ok) onSuccess();
  };

  const goSignup = () => { clearError(); onGoSignup(); };

  return (
    <div style={pg}>
      <div style={card}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:28, fontWeight:800, color:"#111" }}>
            Vendor<span style={{ color:"#2563eb" }}>Bridge</span>
          </div>
          <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>
            Procurement & Vendor Management ERP
          </div>
        </div>

        <h2 style={{ fontSize:20, fontWeight:700, color:"#111", margin:"0 0 20px" }}>
          Sign in to your account
        </h2>

        {error && <div style={errBox}>{error}</div>}

        <form onSubmit={handle} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={lbl}>Email address</label>
            <input style={inp} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>

          <div>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...inp, paddingRight:40 }}
                type={showPw ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#9ca3af", lineHeight:1 }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={busy}
            style={{ ...btn, opacity:busy ? 0.7 : 1, marginTop:4 }}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop:20, padding:14, background:"#f0f9ff", borderRadius:8, border:"1px solid #bae6fd" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0369a1", marginBottom:8 }}>
            🔑 Demo accounts — password: <code style={{ background:"#e0f2fe", padding:"1px 5px", borderRadius:3 }}>demo1234</code>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {([ ["officer@demo.com","Officer"], ["vendor@demo.com","Vendor"], ["manager@demo.com","Manager"], ["admin@demo.com","Admin"] ] as [string,string][]).map(([em, label]) => (
              <button key={em} type="button"
                onClick={() => { setEmail(em); setPassword("demo1234"); }}
                style={{ fontSize:12, padding:"5px 10px", background:"#fff", border:"1px solid #bae6fd", borderRadius:5, cursor:"pointer", color:"#0369a1", textAlign:"left" }}>
                {label} →
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign:"center", fontSize:13, color:"#6b7280", marginTop:20, margin:"20px 0 0" }}>
          Don't have an account?{" "}
          <button type="button" onClick={goSignup}
            style={{ background:"none", border:"none", color:"#2563eb", fontWeight:600, cursor:"pointer", fontSize:13, padding:0 }}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

const pg:     React.CSSProperties = { minHeight:"100vh", background:"linear-gradient(135deg,#eff6ff 0%,#f3f4f6 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 };
const card:   React.CSSProperties = { background:"#fff", borderRadius:12, padding:36, width:"100%", maxWidth:440, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", border:"1px solid #e5e7eb" };
const lbl:    React.CSSProperties = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };
const inp:    React.CSSProperties = { width:"100%", padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:7, fontSize:14, outline:"none", background:"#fff", boxSizing:"border-box" };
const btn:    React.CSSProperties = { padding:"10px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:7, fontSize:15, fontWeight:600, cursor:"pointer", width:"100%" };
const errBox: React.CSSProperties = { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:7, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:12 };
