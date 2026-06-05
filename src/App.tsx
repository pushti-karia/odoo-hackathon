import { useState } from "react";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import { useStore } from "./store/useStore";

import { NAV_LABELS, NAV_ICONS } from "./data/seed";

import Login      from "./components/Login";
import Signup     from "./components/Signup";
import Dashboard  from "./components/Dashboard";
import Vendors    from "./components/Vendors";
import RFQs       from "./components/RFQs";
import Quotations from "./components/Quotations";
import Compare    from "./components/Compare";
import Approvals  from "./components/Approvals";
import POs        from "./components/POs";
import Invoices   from "./components/Invoices";
import Logs       from "./components/Logs";
import Reports    from "./components/Reports";

/* ── role → nav pages ── */
const ROLE_NAV: Record<string, string[]> = {
  "Procurement Officer": ["dashboard","vendors","rfqs","quotations","compare","pos","invoices","logs","reports"],
  "Vendor":              ["dashboard","quotations","pos","invoices"],
  "Manager":             ["dashboard","approvals","rfqs","pos","reports","logs"],
  "Admin":               ["dashboard","vendors","rfqs","quotations","pos","invoices","logs","reports"],
};

/* ════════════════════════════════════════
   Inner — rendered after auth context ready
════════════════════════════════════════ */
function Inner() {
  const { user, logout } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [page, setPage] = useState("dashboard");

  /* ── shared persistent store ── */
  const {
    vendors,    setVendors,
    rfqs,       setRfqs,
    quotations, setQuotations,
    pos,        setPOs,
    invoices,   setInvoices,
    approvals,  setApprovals,
    logs,
    addLog,
    resetStore,
  } = useStore();

  /* ── auth gate ── */
  if (!user) {
    if (authView === "signup")
      return <Signup onSuccess={() => setPage("dashboard")} onGoLogin={() => setAuthView("login")} />;
    return <Login onSuccess={() => setPage("dashboard")} onGoSignup={() => setAuthView("signup")} />;
  }

  const navItems = ROLE_NAV[user.role] || ROLE_NAV["Procurement Officer"];

  /* map auth user → appUser shape that legacy components expect */
  const vendorId = user.role === "Vendor" ? (user.vendorId || "V001") : user.vendorId;
  const appUser = {
    ...user,
    vendorId,
    id: user.role === "Procurement Officer" ? "officer"
      : user.role === "Vendor"  ? `vendor_${vendorId}`
      : user.role === "Manager" ? "manager"
      : "admin",
  };

  const shared = { vendors, rfqs, quotations, pos, invoices, approvals };

  const renderPage = () => {
    switch (page) {
      case "dashboard":  return <Dashboard  {...shared} user={appUser} onNav={setPage} />;
      case "vendors":    return <Vendors    vendors={vendors} setVendors={setVendors} addLog={addLog} />;
      case "rfqs":       return <RFQs       rfqs={rfqs} setRfqs={setRfqs} vendors={vendors} user={appUser} addLog={addLog} />;
      case "quotations": return <Quotations quotations={quotations} setQuotations={setQuotations} rfqs={rfqs} setRfqs={setRfqs} vendors={vendors} user={appUser} addLog={addLog} approvals={approvals} setApprovals={setApprovals} />;
      case "compare":    return <Compare    quotations={quotations} rfqs={rfqs} vendors={vendors} />;
      case "approvals":  return <Approvals  approvals={approvals} setApprovals={setApprovals} quotations={quotations} setQuotations={setQuotations} rfqs={rfqs} vendors={vendors} pos={pos} setPOs={setPOs} user={appUser} addLog={addLog} />;
      case "pos":        return <POs        pos={pos} vendors={vendors} invoices={invoices} setInvoices={setInvoices} user={appUser} addLog={addLog} />;
      case "invoices":   return <Invoices   invoices={invoices} setInvoices={setInvoices} vendors={vendors} user={appUser} addLog={addLog} />;
      case "logs":       return <Logs       logs={logs} />;
      case "reports":    return <Reports    vendors={vendors} rfqs={rfqs} quotations={quotations} pos={pos} invoices={invoices} />;
      default:           return <Dashboard  {...shared} user={appUser} onNav={setPage} />;
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f3f4f6", fontFamily:"system-ui,sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width:220, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"20px 16px 12px", borderBottom:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:18, fontWeight:800, color:"#111" }}>
            Vendor<span style={{ color:"#2563eb" }}>Bridge</span>
          </div>
          <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>Procurement ERP</div>
        </div>

        <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
          {navItems.map(key => (
            <button key={key} onClick={() => setPage(key)}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 16px", background:page===key?"#eff6ff":"none", color:page===key?"#2563eb":"#374151", border:"none", textAlign:"left", cursor:"pointer", fontSize:14, fontWeight:page===key?600:400, borderLeft:page===key?"3px solid #2563eb":"3px solid transparent" }}>
              <span style={{ fontSize:16 }}>{NAV_ICONS[key]}</span>
              {NAV_LABELS[key]}
            </button>
          ))}
        </nav>

        {/* user card + logout */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid #e5e7eb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#2563eb", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, flexShrink:0 }}>
              {user.avatar}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#111", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
              <div style={{ fontSize:11, color:"#6b7280" }}>{user.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); setPage("dashboard"); }}
            style={{ width:"100%", padding:"6px", background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:5, fontSize:13, cursor:"pointer", color:"#374151", marginBottom:6 }}>
            Sign Out
          </button>
          {/* dev helper — reset all data back to seed */}
          <button onClick={() => { if (confirm("Reset all demo data?")) resetStore(); }}
            style={{ width:"100%", padding:"4px", background:"none", border:"1px dashed #e5e7eb", borderRadius:5, fontSize:11, cursor:"pointer", color:"#9ca3af" }}>
            ↺ Reset demo data
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex:1, padding:24, overflowY:"auto" }}>
        {renderPage()}
      </main>
    </div>
  );
}

/* ── root ── */
export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}
