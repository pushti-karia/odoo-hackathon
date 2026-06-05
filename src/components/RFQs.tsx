import { useState } from "react";
import { uid, fmtD, inp, FG, Row2, Modal, Tbl, TD, Badge, BtnPrimary, BtnSecondary, BtnGhost, PH } from "./ui";

export default function RFQs({ rfqs, setRfqs, vendors, user, addLog }: any) {
  const [show, setShow] = useState(false);
  const blank = { title:"", product:"", quantity:"", unit:"units", deadline:"", vendors:[] as string[] };
  const [f, setF] = useState(blank);

  const create = () => {
    if (!f.title || !f.product) return alert("Title and product required");
    const r = { id:uid("RFQ"), ...f, quantity:parseInt(f.quantity) || 1, status:"Open", createdBy:user.id, createdAt:new Date().toISOString().split("T")[0] };
    setRfqs((rs: any[]) => [r, ...rs]);
    addLog("RFQ Created", `${r.id}: ${r.title}`, user.id);
    setShow(false); setF(blank);
  };

  return (
    <div>
      <PH
        title="Request for Quotation"
        sub={`${rfqs.filter((r: any) => r.status === "Open").length} open`}
        action={(user.id === "officer" || user.id === "admin") && <BtnPrimary onClick={() => setShow(true)}>+ Create RFQ</BtnPrimary>}
      />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["RFQ ID","Title","Product","Qty","Deadline","Vendors","Status","Actions"]}
          rows={rfqs.map((r: any) => (
            <tr key={r.id}>
              <TD mono muted>{r.id}</TD>
              <TD bold>{r.title}</TD>
              <TD>{r.product}</TD>
              <TD>{r.quantity} {r.unit}</TD>
              <TD>{fmtD(r.deadline)}</TD>
              <TD>
                {(r.vendors || []).map((vid: string) => {
                  const v = vendors.find((x: any) => x.id === vid);
                  return v ? <span key={vid} style={{ fontSize:11, background:"#f3f4f6", padding:"2px 6px", borderRadius:4, marginRight:4, color:"#374151" }}>{v.name}</span> : null;
                })}
                {(!r.vendors || r.vendors.length === 0) && <span style={{ color:"#9ca3af", fontSize:12 }}>—</span>}
              </TD>
              <TD><Badge s={r.status} /></TD>
              <TD>
                {r.status !== "Closed" && (user.id === "officer" || user.id === "admin") &&
                  <BtnGhost onClick={() => setRfqs((rs: any[]) => rs.map(x => x.id === r.id ? { ...x, status:"Closed" } : x))}>Close</BtnGhost>}
              </TD>
            </tr>
          ))} empty="No RFQs yet" />
      </div>

      {show && (
        <Modal title="Create RFQ" onClose={() => setShow(false)}>
          <FG label="RFQ Title *"><input style={inp} value={f.title} onChange={e => setF({...f, title:e.target.value})} placeholder="Office Laptops Q4" /></FG>
          <FG label="Product / Service *"><input style={inp} value={f.product} onChange={e => setF({...f, product:e.target.value})} placeholder="Dell Latitude 5540" /></FG>
          <Row2>
            <FG label="Quantity"><input style={inp} type="number" value={f.quantity} onChange={e => setF({...f, quantity:e.target.value})} /></FG>
            <FG label="Unit">
              <select style={inp} value={f.unit} onChange={e => setF({...f, unit:e.target.value})}>
                {["units","packs","kg","liters","sets","nos"].map(u => <option key={u}>{u}</option>)}
              </select>
            </FG>
          </Row2>
          <FG label="Deadline"><input style={inp} type="date" value={f.deadline} onChange={e => setF({...f, deadline:e.target.value})} /></FG>
          <FG label="Assign Vendors">
            <div style={{ border:"1px solid #d1d5db", borderRadius:6, padding:10, maxHeight:140, overflowY:"auto" }}>
              {vendors.filter((v: any) => v.status === "Active").map((v: any) => (
                <label key={v.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, fontSize:14, cursor:"pointer" }}>
                  <input type="checkbox" checked={f.vendors.includes(v.id)}
                    onChange={e => setF({...f, vendors: e.target.checked ? [...f.vendors, v.id] : f.vendors.filter(x => x !== v.id)})} />
                  {v.name} <span style={{ color:"#9ca3af", fontSize:12 }}>({v.category})</span>
                </label>
              ))}
            </div>
          </FG>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnSecondary onClick={() => setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={create}>Create RFQ</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}
