import { fmt, fmtD, Badge, Stat, PH, BtnGhost, BtnPrimary, BtnSecondary } from "./ui";
import ChatBox from "./ChatBox";

export default function Dashboard({ user, vendors, rfqs, quotations, pos, invoices, approvals, onNav }: any) {
  const pending    = approvals.filter((a: any) => a.status === "Pending").length;
  const activeRfqs = rfqs.filter((r: any) => r.status === "Open" || r.status === "Quoted").length;
  const spend      = pos.reduce((s: number, p: any) => s + p.total, 0);

  return (
    <div>
      <PH title={`Welcome, ${user.name} 👋`} sub={user.role} />

      {/* ── stat cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        <Stat label="Active RFQs"       value={activeRfqs}                                           color="#2563eb" />
        <Stat label="Pending Approvals" value={pending}                                               color="#d97706" />
        <Stat label="Active Vendors"    value={vendors.filter((v: any) => v.status==="Active").length} color="#16a34a" />
        <Stat label="Total Spend"       value={fmt(spend)}                                            color="#7c3aed" />
      </div>

      {/* ── recent cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        {/* Recent RFQs */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:15 }}>Recent RFQs</span>
            <BtnGhost onClick={() => onNav("rfqs")}>View all →</BtnGhost>
          </div>
          {rfqs.slice(0, 4).map((r: any) => (
            <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#111" }}>{r.title}</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>Due {fmtD(r.deadline)}</div>
              </div>
              <Badge s={r.status} />
            </div>
          ))}
          {rfqs.length === 0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No RFQs yet</p>}
        </div>

        {/* Recent Invoices */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:15 }}>Recent Invoices</span>
            <BtnGhost onClick={() => onNav("invoices")}>View all →</BtnGhost>
          </div>
          {invoices.slice(0, 4).map((inv: any) => (
            <div key={inv.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#111" }}>{inv.id}</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>{fmt(inv.total)}</div>
              </div>
              <Badge s={inv.status} />
            </div>
          ))}
          {invoices.length === 0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No invoices yet</p>}
        </div>
      </div>

      {/* ── quick actions ── */}
      {(user.id === "officer" || user.id === "admin") && (
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Quick Actions</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <BtnPrimary   onClick={() => onNav("rfqs")}>+ Create RFQ</BtnPrimary>
            <BtnSecondary onClick={() => onNav("vendors")}>+ Add Vendor</BtnSecondary>
            <BtnSecondary onClick={() => onNav("compare")}>Compare Quotes</BtnSecondary>
            <BtnSecondary onClick={() => onNav("reports")}>Reports</BtnSecondary>
          </div>
        </div>
      )}

      {/* ── floating chatbox ── */}
      <ChatBox
        user={user}
        vendors={vendors}
        rfqs={rfqs}
        quotations={quotations}
        pos={pos}
        invoices={invoices}
        approvals={approvals}
      />
    </div>
  );
}
