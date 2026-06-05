import { useState, FormEvent } from "react";
import { useAuth } from "../auth/useAuth";
import type { Role } from "../auth/useAuth";

interface Props {
  onSuccess: () => void;
  onGoLogin: () => void;
}

const ROLES: Role[] = ["Procurement Officer", "Vendor", "Manager", "Admin"];

export default function Signup({ onSuccess, onGoLogin }: Props) {
  const { signup, error, clearError } = useAuth();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPw]       = useState("");
  const [confirm, setConfirm]   = useState("");
  const [role, setRole]         = useState<Role>("Procurement Officer");
  const [showPw, setShowPw]     = useState(false);
  const [busy, setBusy]         = useState(false);
  const [localErr, setLocalErr] = useState("");

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setLocalErr("");
    if (password !== confirm) { setLocalErr("Passwords do not match."); return; }
    setBusy(true);
    const ok = await signup(name.trim(), email.trim().toLowerCase(), password, role);
    setBusy(false);
    if (ok) onSuccess();
  };

  const goLogin = () => { clearError(); setLocalErr(""); onGoLogin(); };
  const displayErr = localErr || error;

  return (
    <div style={pg}>
      <div style={card}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:28, fontWeight:800, color:"#111" }}>
            Vendor<span style={{ color:"#2563eb" }}>Bridge</span>
          </div>
          <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>
            Procurement & Vendor Management ERP
          </div>
        </div>

        <h2 style={{ fontSize:20, fontWeight:700, color:"#111", margin:"0 0 20px" }}>
          Create your account
        </h2>

        {displayErr && <div style={errBox}>{displayErr}</div>}

        <form onSubmit={handle} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={lbl}>Full Name</label>
            <input style={inp} type="text" placeholder="Kavya Reddy"
              value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </div>

          <div>
            <label style={lbl}>Email address</label>
            <input style={inp} type="email" placeholder="you@company.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div>
            <label style={lbl}>Role</label>
            <select style={inp} value={role} onChange={e => setRole(e.target.value as Role)} required>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>
              Password <span style={{ fontWeight:400, color:"#9ca3af", fontSize:12 }}>(min. 6 characters)</span>
            </label>
            <div style={{ position:"relative" }}>
              <input style={{ ...inp, paddingRight:40 }}
                type={showPw ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={e => setPw(e.target.value)} required minLength={6} />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#9ca3af", lineHeight:1 }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
            {/* strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop:6 }}>
                <div style={{ height:4, borderRadius:2, background:"#f3f4f6", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:2, width:strength(password).pct+"%", background:strength(password).color, transition:"width .25s,background .25s" }} />
                </div>
                <span style={{ fontSize:11, color:strength(password).color }}>{strength(password).label}</span>
              </div>
            )}
          </div>

          <div>
            <label style={lbl}>Confirm Password</label>
            <input style={inp} type={showPw ? "text" : "password"} placeholder="••••••••"
              value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>

          <button type="submit" disabled={busy}
            style={{ ...btn, opacity:busy ? 0.7 : 1, marginTop:4 }}>
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign:"center", fontSize:13, color:"#6b7280", marginTop:20, margin:"20px 0 0" }}>
          Already have an account?{" "}
          <button type="button" onClick={goLogin}
            style={{ background:"none", border:"none", color:"#2563eb", fontWeight:600, cursor:"pointer", fontSize:13, padding:0 }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

/* ── password strength ── */
function strength(pw: string) {
  let s = 0;
  if (pw.length >= 6)            s++;
  if (pw.length >= 10)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  const colors = ["#dc2626","#dc2626","#d97706","#2563eb","#16a34a","#16a34a"];
  const labels = ["","Weak","Fair","Good","Strong","Very strong"];
  return { pct:(s/5)*100, color:colors[s], label:labels[s] };
}

const pg:     React.CSSProperties = { minHeight:"100vh", background:"linear-gradient(135deg,#eff6ff 0%,#f3f4f6 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 };
const card:   React.CSSProperties = { background:"#fff", borderRadius:12, padding:36, width:"100%", maxWidth:440, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", border:"1px solid #e5e7eb" };
const lbl:    React.CSSProperties = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };
const inp:    React.CSSProperties = { width:"100%", padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:7, fontSize:14, outline:"none", background:"#fff", boxSizing:"border-box" };
const btn:    React.CSSProperties = { padding:"10px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:7, fontSize:15, fontWeight:600, cursor:"pointer", width:"100%" };
const errBox: React.CSSProperties = { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:7, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:12 };
