import { fmt, Tbl, TD, Stat, PH } from "./ui";

export default function Reports({ vendors, rfqs, quotations, pos, invoices }: any) {
  const spend    = pos.reduce((s: number, p: any) => s + p.total, 0);
  const vendPerf = vendors
    .map((v: any) => ({
      ...v,
      quotes: quotations.filter((q: any) => q.vendorId === v.id).length,
      pos:    pos.filter((p: any) => p.vendorId === v.id).length,
      spend:  pos.filter((p: any) => p.vendorId === v.id).reduce((s: number, p: any) => s + p.total, 0),
    }))
    .sort((a: any, b: any) => b.spend - a.spend);

  return (
    <div>
      <PH title="Reports & Analytics" />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
        <Stat label="Total PO Value"  value={fmt(spend)}        color="#16a34a" />
        <Stat label="Total RFQs"      value={rfqs.length}       color="#2563eb" />
        <Stat label="Quotes Received" value={quotations.length} color="#7c3aed" />
        <Stat label="Invoices Issued" value={invoices.length}   color="#0891b2" />
      </div>

      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Vendor Performance</div>
        <Tbl cols={["Vendor","Category","Rating","Quotes","POs","Total Spend","Spend Share"]}
          rows={vendPerf.map((v: any) => (
            <tr key={v.id}>
              <TD bold>{v.name}</TD>
              <TD>{v.category}</TD>
              <TD><span style={{ color:"#d97706" }}>★ {v.rating}</span></TD>
              <TD>{v.quotes}</TD>
              <TD>{v.pos}</TD>
              <TD bold>{fmt(v.spend)}</TD>
              <TD>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:80, height:6, background:"#f3f4f6", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:"#2563eb", width:`${spend > 0 ? Math.round((v.spend / spend) * 100) : 0}%` }} />
                  </div>
                  <span style={{ fontSize:12, color:"#6b7280" }}>{spend > 0 ? Math.round((v.spend / spend) * 100) : 0}%</span>
                </div>
              </TD>
            </tr>
          ))} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>RFQ Status Breakdown</div>
          {(["Open","Quoted","Closed"] as string[]).map(s => {
            const count = rfqs.filter((r: any) => r.status === s).length;
            const pct   = rfqs.length > 0 ? Math.round((count / rfqs.length) * 100) : 0;
            const colors: Record<string,string> = { Open:"#2563eb", Quoted:"#d97706", Closed:"#6b7280" };
            return (
              <div key={s} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span style={{ color:"#374151" }}>{s}</span>
                  <span style={{ fontWeight:600 }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height:6, background:"#f3f4f6", borderRadius:3 }}>
                  <div style={{ height:"100%", background:colors[s], borderRadius:3, width:`${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Invoice Status</div>
          {(["Draft","Sent","Paid"] as string[]).map(s => {
            const count = invoices.filter((i: any) => i.status === s).length;
            const pct   = invoices.length > 0 ? Math.round((count / invoices.length) * 100) : 0;
            const colors: Record<string,string> = { Draft:"#6b7280", Sent:"#0891b2", Paid:"#16a34a" };
            return (
              <div key={s} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span style={{ color:"#374151" }}>{s}</span>
                  <span style={{ fontWeight:600 }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height:6, background:"#f3f4f6", borderRadius:3 }}>
                  <div style={{ height:"100%", background:colors[s], borderRadius:3, width:`${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
