import { useState } from "react";

/* ── tiny helpers ── */
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const uid  = (p) => p + "-" + Date.now().toString(36).toUpperCase();

/* ── seed data ── */
const VENDORS0 = [
  { id:"V001", name:"TechSupply Co.",   category:"Electronics", gst:"27AABCT1234C1Z5", contact:"Arjun Mehta",  email:"arjun@techsupply.in",  phone:"+91-98765-43210", status:"Active",   rating:4.8 },
  { id:"V002", name:"OfficeWorks Ltd.", category:"Stationery",  gst:"27BBBOF5678D2Z6", contact:"Priya Shah",   email:"priya@officeworks.in", phone:"+91-98765-12345", status:"Active",   rating:4.2 },
  { id:"V003", name:"Industrial Gear",  category:"Machinery",   gst:"27CCCIG9012E3Z7", contact:"Rahul Patel",  email:"rahul@igear.in",       phone:"+91-98765-67890", status:"Active",   rating:3.9 },
  { id:"V004", name:"CloudKit Pvt.",    category:"Software",    gst:"27DDDCK3456F4Z8", contact:"Sneha Joshi",  email:"sneha@cloudkit.in",    phone:"+91-98765-11111", status:"Inactive", rating:4.5 },
];
const RFQS0 = [
  { id:"RFQ-001", title:"Office Laptops Q4",   product:"Dell Latitude 5540", quantity:25, unit:"units",  deadline:"2024-12-20", vendors:["V001","V004"], status:"Quoted",  createdBy:"officer", createdAt:"2024-12-01" },
  { id:"RFQ-002", title:"Printer Cartridges",  product:"HP LaserJet Carts",  quantity:100,unit:"packs",  deadline:"2024-12-15", vendors:["V002"],        status:"Open",    createdBy:"officer", createdAt:"2024-12-05" },
];
const QUOTES0 = [
  { id:"Q-001", rfqId:"RFQ-001", vendorId:"V001", unitPrice:78000, totalPrice:1950000, delivery:"10 days", notes:"Includes 1yr warranty",      status:"Submitted", submittedAt:"2024-12-03" },
  { id:"Q-002", rfqId:"RFQ-001", vendorId:"V004", unitPrice:82000, totalPrice:2050000, delivery:"7 days",  notes:"Express delivery available",  status:"Submitted", submittedAt:"2024-12-04" },
];
const POS0 = [
  { id:"PO-001", rfqId:"RFQ-001", quotationId:"Q-001", vendorId:"V001", product:"Dell Latitude 5540", quantity:25, unitPrice:78000, subtotal:1950000, tax:351000, total:2301000, status:"Active", createdAt:"2024-12-06" },
];
const INVOICES0 = [
  { id:"INV-001", poId:"PO-001", vendorId:"V001", product:"Dell Latitude 5540", quantity:25, subtotal:1950000, tax:351000, total:2301000, status:"Sent", createdAt:"2024-12-07", dueDate:"2024-12-21" },
];
const APPROVALS0 = [
  { id:"APR-001", rfqId:"RFQ-001", quotationId:"Q-001", status:"Approved", remarks:"Best value", approvedBy:"manager", approvedAt:"2024-12-05",
    timeline:[{action:"Submitted for approval",by:"officer",at:"2024-12-04 14:30"},{action:"Approved",by:"manager",at:"2024-12-05 09:15"}] },
];
const LOGS0 = [
  { id:1, action:"RFQ Created",        detail:"RFQ-001: Office Laptops Q4",       by:"officer", at:"2024-12-01 10:00", type:"rfq"      },
  { id:2, action:"Quotation Received", detail:"Q-001 from TechSupply Co.",         by:"vendor",  at:"2024-12-03 11:30", type:"quote"    },
  { id:3, action:"Quotation Approved", detail:"APR-001 approved by manager",       by:"manager", at:"2024-12-05 09:15", type:"approval" },
  { id:4, action:"PO Generated",       detail:"PO-001 created",                   by:"officer", at:"2024-12-06 10:00", type:"po"       },
  { id:5, action:"Invoice Sent",       detail:"INV-001 emailed to vendor",        by:"officer", at:"2024-12-07 14:00", type:"invoice"  },
];
const USERS = [
  { id:"officer",    name:"Kavya Reddy",  role:"Procurement Officer", avatar:"KR" },
  { id:"vendor_V001",name:"Arjun Mehta",  role:"Vendor",              avatar:"AM", vendorId:"V001" },
  { id:"manager",    name:"Rohan Desai",  role:"Manager",             avatar:"RD" },
  { id:"admin",      name:"Anita Sharma", role:"Admin",               avatar:"AS" },
];
const NAV = {
  officer:    ["dashboard","vendors","rfqs","quotations","compare","pos","invoices","logs","reports"],
  vendor_V001:["dashboard","quotations","pos","invoices"],
  manager:    ["dashboard","approvals","rfqs","pos","reports","logs"],
  admin:      ["dashboard","vendors","rfqs","quotations","pos","invoices","logs","reports"],
};
const NAV_LABELS = { dashboard:"Dashboard", vendors:"Vendors", rfqs:"RFQs", quotations:"Quotations", compare:"Compare Quotes", pos:"Purchase Orders", invoices:"Invoices", approvals:"Approvals", logs:"Activity Logs", reports:"Reports" };
const NAV_ICONS  = { dashboard:"🏠", vendors:"🏢", rfqs:"📋", quotations:"💬", compare:"⚖️", pos:"📦", invoices:"🧾", approvals:"✅", logs:"📜", reports:"📊" };

/* ── status badge ── */
const BADGE_COLORS = {
  Active:"#16a34a", Inactive:"#dc2626", Open:"#2563eb", Quoted:"#d97706",
  Approved:"#16a34a", Rejected:"#dc2626", Pending:"#d97706", Submitted:"#7c3aed",
  Invoiced:"#0891b2", Sent:"#0891b2", Draft:"#6b7280", Closed:"#6b7280",
  "Pending Approval":"#d97706",
};
const Badge = ({ s }) => {
  const c = BADGE_COLORS[s] || "#6b7280";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:99, fontSize:12, fontWeight:600, background:c+"18", color:c, border:`1px solid ${c}44` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c, display:"inline-block" }} />
      {s}
    </span>
  );
};

/* ── modal ── */
const Modal = ({ title, onClose, children, wide }) => (
  <div onClick={e => e.target===e.currentTarget && onClose()}
    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}>
    <div style={{ background:"#fff", borderRadius:8, padding:24, width:"100%", maxWidth:wide?680:500, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 8px 30px rgba(0,0,0,0.15)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h3 style={{ fontSize:17, fontWeight:700, color:"#111" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#888", lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

/* ── shared form styles ── */
const inp = { width:"100%", padding:"7px 10px", border:"1px solid #d1d5db", borderRadius:6, fontSize:14, outline:"none", background:"#fff", boxSizing:"border-box" };
const lbl = { fontSize:13, fontWeight:600, color:"#374151", marginBottom:3, display:"block" };
const FG  = ({ label, children, half }) => (
  <div style={{ marginBottom:12, ...(half?{}:{}) }}>
    {label && <label style={lbl}>{label}</label>}
    {children}
  </div>
);
const Row2 = ({ children }) => <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>{children}</div>;
const BtnPrimary  = ({ onClick, children, style }) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:6, fontSize:14, fontWeight:600, cursor:"pointer", ...style }}>{children}</button>;
const BtnSecondary= ({ onClick, children, style }) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#fff", color:"#374151", border:"1px solid #d1d5db", borderRadius:6, fontSize:14, cursor:"pointer", ...style }}>{children}</button>;
const BtnDanger   = ({ onClick, children, style }) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#dc2626", color:"#fff", border:"none", borderRadius:6, fontSize:14, fontWeight:600, cursor:"pointer", ...style }}>{children}</button>;
const BtnSuccess  = ({ onClick, children, style }) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#16a34a", color:"#fff", border:"none", borderRadius:6, fontSize:14, fontWeight:600, cursor:"pointer", ...style }}>{children}</button>;
const BtnGhost    = ({ onClick, children, style }) => <button onClick={onClick} style={{ padding:"5px 10px", background:"none", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:5, fontSize:13, cursor:"pointer", ...style }}>{children}</button>;

/* ── table ── */
const Tbl = ({ cols, rows, empty }) => (
  <div style={{ overflowX:"auto" }}>
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
      <thead>
        <tr style={{ background:"#f9fafb" }}>
          {cols.map(c => <th key={c} style={{ padding:"9px 12px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6b7280", borderBottom:"1px solid #e5e7eb", whiteSpace:"nowrap" }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ padding:"32px", textAlign:"center", color:"#9ca3af", fontSize:14 }}>{empty || "No data found"}</td></tr>
          : rows}
      </tbody>
    </table>
  </div>
);
const TD = ({ children, bold, mono, muted }) => (
  <td style={{ padding:"10px 12px", borderBottom:"1px solid #f3f4f6", color: muted?"#9ca3af":bold?"#111":"#374151", fontWeight:bold?600:400, fontFamily:mono?"monospace":"inherit", fontSize:14, verticalAlign:"middle" }}>
    {children}
  </td>
);

/* ── page header ── */
const PH = ({ title, sub, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:"#111", margin:0 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:"#6b7280", margin:"3px 0 0" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

/* ── stat card ── */
const Stat = ({ label, value, color }) => (
  <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"16px 20px", borderLeft:`4px solid ${color||"#2563eb"}` }}>
    <div style={{ fontSize:12, color:"#6b7280", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:700, color:"#111" }}>{value}</div>
  </div>
);

/* ════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════ */
const Login = ({ onLogin }) => {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ minHeight:"100vh", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:10, padding:32, width:"100%", maxWidth:440, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:26, fontWeight:800, color:"#111" }}>Vendor<span style={{ color:"#2563eb" }}>Bridge</span></div>
          <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>Procurement & Vendor Management ERP</div>
        </div>
        <p style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:12 }}>Select your role</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {USERS.map(u => (
            <div key={u.id} onClick={() => setSel(u)}
              style={{ padding:14, border:`2px solid ${sel?.id===u.id?"#2563eb":"#e5e7eb"}`, borderRadius:8, cursor:"pointer", background:sel?.id===u.id?"#eff6ff":"#fff" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#2563eb", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, marginBottom:8 }}>{u.avatar}</div>
              <div style={{ fontWeight:600, fontSize:14, color:"#111" }}>{u.name}</div>
              <div style={{ fontSize:12, color:"#6b7280" }}>{u.role}</div>
            </div>
          ))}
        </div>
        <BtnPrimary onClick={() => sel && onLogin(sel)} style={{ width:"100%", padding:"10px" }}>
          {sel ? `Continue as ${sel.name}` : "Select a role"}
        </BtnPrimary>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════ */
const Dashboard = ({ user, vendors, rfqs, quotations, pos, invoices, approvals, onNav }) => {
  const pending = approvals.filter(a => a.status==="Pending").length;
  const activeRfqs = rfqs.filter(r => r.status==="Open"||r.status==="Quoted").length;
  const spend = pos.reduce((s,p) => s+p.total, 0);
  return (
    <div>
      <PH title={`Welcome, ${user.name} 👋`} sub={user.role} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        <Stat label="Active RFQs"       value={activeRfqs}                          color="#2563eb" />
        <Stat label="Pending Approvals" value={pending}                             color="#d97706" />
        <Stat label="Active Vendors"    value={vendors.filter(v=>v.status==="Active").length} color="#16a34a" />
        <Stat label="Total Spend"       value={fmt(spend)}                          color="#7c3aed" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:15 }}>Recent RFQs</span>
            <BtnGhost onClick={() => onNav("rfqs")}>View all →</BtnGhost>
          </div>
          {rfqs.slice(0,4).map(r => (
            <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#111" }}>{r.title}</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>Due {fmtD(r.deadline)}</div>
              </div>
              <Badge s={r.status} />
            </div>
          ))}
          {rfqs.length===0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No RFQs yet</p>}
        </div>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontWeight:700, fontSize:15 }}>Recent Invoices</span>
            <BtnGhost onClick={() => onNav("invoices")}>View all →</BtnGhost>
          </div>
          {invoices.slice(0,4).map(inv => (
            <div key={inv.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#111" }}>{inv.id}</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>{fmt(inv.total)}</div>
              </div>
              <Badge s={inv.status} />
            </div>
          ))}
          {invoices.length===0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No invoices yet</p>}
        </div>
      </div>
      {(user.id==="officer"||user.id==="admin") && (
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Quick Actions</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <BtnPrimary onClick={() => onNav("rfqs")}>+ Create RFQ</BtnPrimary>
            <BtnSecondary onClick={() => onNav("vendors")}>+ Add Vendor</BtnSecondary>
            <BtnSecondary onClick={() => onNav("compare")}>Compare Quotes</BtnSecondary>
            <BtnSecondary onClick={() => onNav("reports")}>Reports</BtnSecondary>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   VENDORS
════════════════════════════════════════════ */
const Vendors = ({ vendors, setVendors, addLog }) => {
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);
  const blank = { name:"", category:"Electronics", gst:"", contact:"", email:"", phone:"" };
  const [f, setF] = useState(blank);

  const list = vendors.filter(v => v.name.toLowerCase().includes(q.toLowerCase()) || v.category.toLowerCase().includes(q.toLowerCase()));

  const save = () => {
    if (!f.name || !f.email) return alert("Name and email required");
    if (edit) {
      setVendors(vs => vs.map(v => v.id===edit.id ? { ...v, ...f } : v));
    } else {
      const id = "V" + String(vendors.length+1).padStart(3,"0");
      setVendors(vs => [...vs, { id, rating:4.0, status:"Active", ...f }]);
      addLog("Vendor Registered", f.name, "admin");
    }
    setShow(false); setEdit(null); setF(blank);
  };

  return (
    <div>
      <PH title="Vendor Management" sub={`${vendors.filter(v=>v.status==="Active").length} active vendors`}
        action={<BtnPrimary onClick={() => { setF(blank); setEdit(null); setShow(true); }}>+ Register Vendor</BtnPrimary>} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <input style={{ ...inp, maxWidth:320, marginBottom:16 }} placeholder="Search by name or category…" value={q} onChange={e=>setQ(e.target.value)} />
        <Tbl cols={["ID","Name","Category","GST","Contact","Rating","Status","Actions"]}
          rows={list.map(v => (
            <tr key={v.id} style={{ background:"#fff" }}>
              <TD mono muted>{v.id}</TD>
              <TD bold>{v.name}<br/><span style={{ fontSize:12, fontWeight:400, color:"#9ca3af" }}>{v.email}</span></TD>
              <TD>{v.category}</TD>
              <TD mono>{v.gst||"—"}</TD>
              <TD>{v.contact}<br/><span style={{ fontSize:12, color:"#9ca3af" }}>{v.phone}</span></TD>
              <TD><span style={{ color:"#d97706", fontWeight:600 }}>★ {v.rating}</span></TD>
              <TD><Badge s={v.status} /></TD>
              <TD>
                <div style={{ display:"flex", gap:6 }}>
                  <BtnGhost onClick={() => { setF({...v}); setEdit(v); setShow(true); }}>Edit</BtnGhost>
                  <BtnGhost onClick={() => setVendors(vs => vs.map(x => x.id===v.id ? {...x, status:x.status==="Active"?"Inactive":"Active"} : x))}>
                    {v.status==="Active"?"Disable":"Enable"}
                  </BtnGhost>
                </div>
              </TD>
            </tr>
          ))} />
      </div>
      {show && (
        <Modal title={edit?"Edit Vendor":"Register Vendor"} onClose={() => setShow(false)}>
          <Row2>
            <FG label="Company Name *"><input style={inp} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="TechSupply Co." /></FG>
            <FG label="Category"><select style={inp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
              {["Electronics","Stationery","Machinery","Software","Furniture","Services"].map(c=><option key={c}>{c}</option>)}
            </select></FG>
          </Row2>
          <FG label="GST Number"><input style={inp} value={f.gst} onChange={e=>setF({...f,gst:e.target.value})} placeholder="27AABCT1234C1Z5" /></FG>
          <Row2>
            <FG label="Contact Person"><input style={inp} value={f.contact} onChange={e=>setF({...f,contact:e.target.value})} /></FG>
            <FG label="Phone"><input style={inp} value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} /></FG>
          </Row2>
          <FG label="Email *"><input style={inp} value={f.email} onChange={e=>setF({...f,email:e.target.value})} type="email" /></FG>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnSecondary onClick={() => setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={save}>{edit?"Save Changes":"Register"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   RFQs
════════════════════════════════════════════ */
const RFQs = ({ rfqs, setRfqs, vendors, user, addLog }) => {
  const [show, setShow] = useState(false);
  const blank = { title:"", product:"", quantity:"", unit:"units", deadline:"", vendors:[] };
  const [f, setF] = useState(blank);

  const create = () => {
    if (!f.title || !f.product) return alert("Title and product required");
    const r = { id:uid("RFQ"), ...f, quantity:parseInt(f.quantity)||1, status:"Open", createdBy:user.id, createdAt:new Date().toISOString().split("T")[0] };
    setRfqs(rs => [r,...rs]);
    addLog("RFQ Created", `${r.id}: ${r.title}`, user.id);
    setShow(false); setF(blank);
  };

  return (
    <div>
      <PH title="Request for Quotation" sub={`${rfqs.filter(r=>r.status==="Open").length} open`}
        action={(user.id==="officer"||user.id==="admin") && <BtnPrimary onClick={() => setShow(true)}>+ Create RFQ</BtnPrimary>} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["RFQ ID","Title","Product","Qty","Deadline","Vendors","Status","Actions"]}
          rows={rfqs.map(r => (
            <tr key={r.id}>
              <TD mono muted>{r.id}</TD>
              <TD bold>{r.title}</TD>
              <TD>{r.product}</TD>
              <TD>{r.quantity} {r.unit}</TD>
              <TD>{fmtD(r.deadline)}</TD>
              <TD>
                {(r.vendors||[]).map(vid => { const v=vendors.find(x=>x.id===vid); return v ? <span key={vid} style={{ fontSize:11, background:"#f3f4f6", padding:"2px 6px", borderRadius:4, marginRight:4, color:"#374151" }}>{v.name}</span> : null; })}
                {(!r.vendors||r.vendors.length===0) && <span style={{ color:"#9ca3af", fontSize:12 }}>—</span>}
              </TD>
              <TD><Badge s={r.status} /></TD>
              <TD>
                {r.status!=="Closed" && (user.id==="officer"||user.id==="admin") &&
                  <BtnGhost onClick={() => setRfqs(rs=>rs.map(x=>x.id===r.id?{...x,status:"Closed"}:x))}>Close</BtnGhost>}
              </TD>
            </tr>
          ))} empty="No RFQs yet" />
      </div>
      {show && (
        <Modal title="Create RFQ" onClose={() => setShow(false)}>
          <FG label="RFQ Title *"><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Office Laptops Q4" /></FG>
          <FG label="Product / Service *"><input style={inp} value={f.product} onChange={e=>setF({...f,product:e.target.value})} placeholder="Dell Latitude 5540" /></FG>
          <Row2>
            <FG label="Quantity"><input style={inp} type="number" value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})} /></FG>
            <FG label="Unit"><select style={inp} value={f.unit} onChange={e=>setF({...f,unit:e.target.value})}>
              {["units","packs","kg","liters","sets","nos"].map(u=><option key={u}>{u}</option>)}
            </select></FG>
          </Row2>
          <FG label="Deadline"><input style={inp} type="date" value={f.deadline} onChange={e=>setF({...f,deadline:e.target.value})} /></FG>
          <FG label="Assign Vendors">
            <div style={{ border:"1px solid #d1d5db", borderRadius:6, padding:10, maxHeight:140, overflowY:"auto" }}>
              {vendors.filter(v=>v.status==="Active").map(v => (
                <label key={v.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, fontSize:14, cursor:"pointer" }}>
                  <input type="checkbox" checked={f.vendors.includes(v.id)}
                    onChange={e=>setF({...f,vendors:e.target.checked?[...f.vendors,v.id]:f.vendors.filter(x=>x!==v.id)})} />
                  {v.name} <span style={{ color:"#9ca3af", fontSize:12 }}>({v.category})</span>
                </label>
              ))}
            </div>
          </FG>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnSecondary onClick={()=>setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={create}>Create RFQ</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   QUOTATIONS
════════════════════════════════════════════ */
const Quotations = ({ quotations, setQuotations, rfqs, setRfqs, vendors, user, addLog, approvals, setApprovals }) => {
  const [show, setShow] = useState(false);
  const blank = { rfqId:"", unitPrice:"", delivery:"", notes:"" };
  const [f, setF] = useState(blank);
  const myVid = user.vendorId;
  const list = myVid ? quotations.filter(q=>q.vendorId===myVid) : quotations;
  const openRfqs = rfqs.filter(r=>r.status==="Open"||r.status==="Quoted");

  const submit = () => {
    if (!f.rfqId || !f.unitPrice) return alert("RFQ and unit price required");
    const rfq = rfqs.find(r=>r.id===f.rfqId);
    const qty = rfq?.quantity||1;
    const q = { id:uid("Q"), rfqId:f.rfqId, vendorId:myVid||"V001", unitPrice:parseInt(f.unitPrice), totalPrice:parseInt(f.unitPrice)*qty, delivery:f.delivery, notes:f.notes, status:"Submitted", submittedAt:new Date().toISOString().split("T")[0] };
    setQuotations(qs=>[q,...qs]);
    setRfqs(rs=>rs.map(r=>r.id===f.rfqId?{...r,status:"Quoted"}:r));
    addLog("Quotation Submitted", `${q.id} for ${f.rfqId}`, user.id);
    setShow(false); setF(blank);
  };

  const sendApproval = (q) => {
    if (approvals.find(a=>a.quotationId===q.id)) return alert("Already submitted for approval");
    const apr = { id:uid("APR"), rfqId:q.rfqId, quotationId:q.id, status:"Pending", remarks:"", approvedBy:null, approvedAt:null,
      timeline:[{action:"Submitted for approval",by:user.id,at:new Date().toLocaleString()}] };
    setApprovals(as=>[apr,...as]);
    setQuotations(qs=>qs.map(x=>x.id===q.id?{...x,status:"Pending Approval"}:x));
    addLog("Sent for Approval", q.id, user.id);
    alert(`${q.id} sent for manager approval!`);
  };

  return (
    <div>
      <PH title="Quotations" sub={`${list.length} total`}
        action={user.role==="Vendor" && <BtnPrimary onClick={()=>setShow(true)}>+ Submit Quotation</BtnPrimary>} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["Quote ID","RFQ","Vendor","Unit Price","Total","Delivery","Notes","Status","Actions"]}
          rows={list.map(q => {
            const rfq=rfqs.find(r=>r.id===q.rfqId); const vendor=vendors.find(v=>v.id===q.vendorId);
            const hasApr=approvals.find(a=>a.quotationId===q.id);
            return (
              <tr key={q.id}>
                <TD mono muted>{q.id}</TD>
                <TD>{rfq?.title||q.rfqId}</TD>
                <TD bold>{vendor?.name||q.vendorId}</TD>
                <TD>{fmt(q.unitPrice)}</TD>
                <TD bold>{fmt(q.totalPrice)}</TD>
                <TD>{q.delivery}</TD>
                <TD muted>{q.notes||"—"}</TD>
                <TD><Badge s={q.status} /></TD>
                <TD>
                  {user.id==="officer" && q.status==="Submitted" && !hasApr &&
                    <BtnGhost onClick={()=>sendApproval(q)}>Send for Approval</BtnGhost>}
                </TD>
              </tr>
            );
          })} empty="No quotations yet" />
      </div>
      {show && (
        <Modal title="Submit Quotation" onClose={()=>setShow(false)}>
          <FG label="Select RFQ *">
            <select style={inp} value={f.rfqId} onChange={e=>setF({...f,rfqId:e.target.value})}>
              <option value="">-- Select RFQ --</option>
              {openRfqs.map(r=><option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
            </select>
          </FG>
          <Row2>
            <FG label="Unit Price (₹) *"><input style={inp} type="number" value={f.unitPrice} onChange={e=>setF({...f,unitPrice:e.target.value})} /></FG>
            <FG label="Delivery Timeline"><input style={inp} value={f.delivery} onChange={e=>setF({...f,delivery:e.target.value})} placeholder="10 days" /></FG>
          </Row2>
          <FG label="Notes"><textarea style={{...inp,resize:"vertical"}} rows={3} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} /></FG>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnSecondary onClick={()=>setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={submit}>Submit</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   COMPARE
════════════════════════════════════════════ */
const Compare = ({ quotations, rfqs, vendors }) => {
  const [rfqId, setRfqId] = useState(rfqs[0]?.id||"");
  const withQuotes = rfqs.filter(r=>quotations.some(q=>q.rfqId===r.id));
  const quotes = quotations.filter(q=>q.rfqId===rfqId);
  const minP = quotes.length ? Math.min(...quotes.map(q=>q.totalPrice)) : 0;
  const minD = quotes.length ? Math.min(...quotes.map(q=>parseInt(q.delivery)||999)) : 0;
  return (
    <div>
      <PH title="Compare Quotations" />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20, marginBottom:16 }}>
        <FG label="Select RFQ">
          <select style={{...inp, maxWidth:360}} value={rfqId} onChange={e=>setRfqId(e.target.value)}>
            <option value="">-- Select --</option>
            {withQuotes.map(r=><option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
          </select>
        </FG>
      </div>
      {rfqId && quotes.length===0 && <p style={{ color:"#9ca3af", textAlign:"center", padding:32 }}>No quotations for this RFQ yet.</p>}
      {quotes.length>0 && (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(quotes.length,3)},1fr)`, gap:14 }}>
          {quotes.map(q => {
            const v=vendors.find(x=>x.id===q.vendorId);
            const isLowest=q.totalPrice===minP;
            const isFastest=(parseInt(q.delivery)||999)===minD;
            return (
              <div key={q.id} style={{ background:"#fff", border:`2px solid ${isLowest?"#16a34a":"#e5e7eb"}`, borderRadius:8, padding:20, position:"relative" }}>
                {isLowest && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#16a34a", color:"#fff", padding:"2px 12px", borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>✓ Best Price</div>}
                <div style={{ fontWeight:700, fontSize:16, color:"#111", marginBottom:2 }}>{v?.name}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:14 }}>⭐ {v?.rating} · {v?.category}</div>
                <div style={{ background:"#f9fafb", borderRadius:6, padding:"12px", marginBottom:12 }}>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>Unit Price</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#111", marginBottom:4 }}>{fmt(q.unitPrice)}</div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>Total Amount</div>
                  <div style={{ fontSize:22, fontWeight:800, color:isLowest?"#16a34a":"#2563eb" }}>{fmt(q.totalPrice)}</div>
                </div>
                <div style={{ fontSize:13, marginBottom:6 }}>
                  <span style={{ color:"#6b7280" }}>Delivery: </span>
                  <span style={{ fontWeight:isFastest?700:400, color:isFastest?"#0891b2":"#111" }}>{isFastest?"⚡ ":""}{q.delivery}</span>
                </div>
                <Badge s={q.status} />
                {q.notes && <div style={{ fontSize:12, color:"#6b7280", background:"#f9fafb", borderRadius:6, padding:"8px", marginTop:10 }}>{q.notes}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   APPROVALS
════════════════════════════════════════════ */
const Approvals = ({ approvals, setApprovals, quotations, setQuotations, rfqs, vendors, pos, setPOs, user, addLog }) => {
  const [sel, setSel] = useState(null);
  const [remarks, setRemarks] = useState("");

  const decide = (apr, decision) => {
    const updated = { ...apr, status:decision, remarks, approvedBy:user.id, approvedAt:new Date().toLocaleString(),
      timeline:[...apr.timeline,{action:decision,by:user.id,at:new Date().toLocaleString()}] };
    setApprovals(as=>as.map(a=>a.id===apr.id?updated:a));
    setQuotations(qs=>qs.map(q=>q.id===apr.quotationId?{...q,status:decision}:q));
    if (decision==="Approved") {
      const q=quotations.find(x=>x.id===apr.quotationId); const rfq=rfqs.find(r=>r.id===apr.rfqId);
      if (q&&rfq) {
        const po = { id:uid("PO"), rfqId:rfq.id, quotationId:q.id, vendorId:q.vendorId, product:rfq.product, quantity:rfq.quantity, unitPrice:q.unitPrice, subtotal:q.totalPrice, tax:Math.round(q.totalPrice*0.18), total:q.totalPrice+Math.round(q.totalPrice*0.18), status:"Active", createdAt:new Date().toISOString().split("T")[0] };
        setPOs(ps=>[po,...ps]);
        addLog("PO Generated", `${po.id}`, user.id);
      }
    }
    addLog(`Quotation ${decision}`, apr.quotationId, user.id);
    setSel(null); setRemarks("");
  };

  const pending = approvals.filter(a=>a.status==="Pending");
  const done    = approvals.filter(a=>a.status!=="Pending");

  return (
    <div>
      <PH title="Approval Workflow" sub={`${pending.length} pending`} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Pending ({pending.length})</div>
          {pending.length===0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No pending approvals 🎉</p>}
          {pending.map(a => {
            const q=quotations.find(x=>x.id===a.quotationId); const rfq=rfqs.find(r=>r.id===a.rfqId); const v=vendors.find(x=>x.id===q?.vendorId);
            return (
              <div key={a.id} onClick={()=>setSel(a)}
                style={{ padding:12, border:`1px solid ${sel?.id===a.id?"#2563eb":"#e5e7eb"}`, borderRadius:6, marginBottom:8, cursor:"pointer", background:sel?.id===a.id?"#eff6ff":"#fff" }}>
                <div style={{ fontWeight:600, fontSize:14, color:"#111" }}>{rfq?.title||a.rfqId}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{v?.name} · {fmt(q?.totalPrice||0)}</div>
                <div style={{ marginTop:6 }}><Badge s={a.status} /></div>
              </div>
            );
          })}
          {done.length>0 && (
            <>
              <div style={{ fontWeight:700, fontSize:14, margin:"16px 0 10px", color:"#6b7280" }}>Decisions</div>
              {done.map(a=>(
                <div key={a.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6", fontSize:13 }}>
                  <span style={{ color:"#374151" }}>{a.quotationId}</span><Badge s={a.status} />
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          {!sel && <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"40px 0" }}>← Select an approval to review</p>}
          {sel && (() => {
            const q=quotations.find(x=>x.id===sel.quotationId); const rfq=rfqs.find(r=>r.id===sel.rfqId); const v=vendors.find(x=>x.id===q?.vendorId);
            return (
              <div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Review: {sel.quotationId}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                  {[["RFQ",rfq?.title],["Vendor",v?.name],["Amount",fmt(q?.totalPrice||0)],["Delivery",q?.delivery]].map(([k,val])=>(
                    <div key={k} style={{ background:"#f9fafb", borderRadius:6, padding:10 }}>
                      <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600 }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#111", marginTop:2 }}>{val||"—"}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>Timeline</div>
                  {sel.timeline.map((t,i)=>(
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:13 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:"#2563eb", marginTop:4, flexShrink:0 }} />
                      <div><span style={{ color:"#111" }}>{t.action}</span> <span style={{ color:"#9ca3af" }}>— {t.at} · {t.by}</span></div>
                    </div>
                  ))}
                </div>
                <FG label="Remarks">
                  <textarea style={{...inp,resize:"vertical"}} rows={2} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add your remarks…" />
                </FG>
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <BtnSuccess onClick={()=>decide(sel,"Approved")} style={{ flex:1 }}>✓ Approve</BtnSuccess>
                  <BtnDanger  onClick={()=>decide(sel,"Rejected")} style={{ flex:1 }}>✗ Reject</BtnDanger>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   PURCHASE ORDERS
════════════════════════════════════════════ */
const POs = ({ pos, vendors, invoices, setInvoices, user, addLog }) => {
  const myVid = user.vendorId;
  const list = myVid ? pos.filter(p=>p.vendorId===myVid) : pos;

  const genInvoice = (po) => {
    if (invoices.find(i=>i.poId===po.id)) return alert("Invoice already exists for this PO");
    const inv = { id:uid("INV"), poId:po.id, vendorId:po.vendorId, product:po.product, quantity:po.quantity, subtotal:po.subtotal, tax:po.tax, total:po.total, status:"Draft", createdAt:new Date().toISOString().split("T")[0], dueDate:new Date(Date.now()+14*86400000).toISOString().split("T")[0] };
    setInvoices(is=>[inv,...is]);
    addLog("Invoice Generated", inv.id, user.id);
    alert(`✅ Invoice ${inv.id} generated!`);
  };

  return (
    <div>
      <PH title="Purchase Orders" sub={`${list.length} total`} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["PO Number","Product","Vendor","Qty","Subtotal","Tax 18%","Total","Date","Status","Action"]}
          rows={list.map(po => {
            const v=vendors.find(x=>x.id===po.vendorId); const has=invoices.find(i=>i.poId===po.id);
            return (
              <tr key={po.id}>
                <TD mono>{po.id}</TD>
                <TD bold>{po.product}</TD>
                <TD>{v?.name}</TD>
                <TD>{po.quantity}</TD>
                <TD>{fmt(po.subtotal)}</TD>
                <TD>{fmt(po.tax)}</TD>
                <TD bold>{fmt(po.total)}</TD>
                <TD>{fmtD(po.createdAt)}</TD>
                <TD><Badge s={has?"Invoiced":po.status} /></TD>
                <TD>
                  {!has && (user.id==="officer"||user.id==="admin")
                    ? <BtnGhost onClick={()=>genInvoice(po)}>Generate Invoice</BtnGhost>
                    : has ? <span style={{ fontSize:12, color:"#16a34a" }}>✓ Done</span> : null}
                </TD>
              </tr>
            );
          })} empty="No purchase orders yet" />
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   INVOICES
════════════════════════════════════════════ */
const Invoices = ({ invoices, setInvoices, vendors, user, addLog }) => {
  const [view, setView] = useState(null);
  const myVid = user.vendorId;
  const list = myVid ? invoices.filter(i=>i.vendorId===myVid) : invoices;

  const send = (inv) => {
    const v=vendors.find(x=>x.id===inv.vendorId);
    setInvoices(is=>is.map(i=>i.id===inv.id?{...i,status:"Sent"}:i));
    addLog("Invoice Sent", `${inv.id} → ${v?.email}`, user.id);
    alert(`📧 Invoice ${inv.id} sent to ${v?.email}!`);
    if (view?.id===inv.id) setView({...inv,status:"Sent"});
  };

  const print = (inv) => {
    const v=vendors.find(x=>x.id===inv.vendorId);
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>Invoice ${inv.id}</title><style>
      body{font-family:Arial;padding:40px;color:#111} h1{color:#2563eb;font-size:26px}
      .grid{display:flex;justify-content:space-between;margin:20px 0}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{padding:10px 14px;border:1px solid #e5e7eb;text-align:left}
      th{background:#f9fafb} .total{font-size:18px;font-weight:700;color:#16a34a}
    </style></head><body>
      <h1>VendorBridge</h1><p>Procurement & Vendor Management ERP</p><hr/>
      <div class="grid">
        <div><b>${inv.id}</b><br/>Date: ${fmtD(inv.createdAt)}<br/>Due: ${fmtD(inv.dueDate)}</div>
        <div><b>Vendor:</b><br/>${v?.name}<br/>${v?.email}<br/>GST: ${v?.gst}</div>
      </div>
      <table><tr><th>Product</th><th>Qty</th><th>Subtotal</th><th>Tax (18%)</th><th>Total</th></tr>
      <tr><td>${inv.product}</td><td>${inv.quantity}</td><td>${fmt(inv.subtotal)}</td><td>${fmt(inv.tax)}</td><td class="total">${fmt(inv.total)}</td></tr></table>
      <p style="margin-top:30px;color:#6b7280">Thank you for your business!</p>
    </body></html>`);
    w.document.close(); w.print();
    addLog("Invoice Printed", inv.id, user.id);
  };

  return (
    <div>
      <PH title="Invoices" sub={`${list.length} total`} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["Invoice ID","PO Ref","Vendor","Product","Subtotal","Tax","Total","Due Date","Status","Actions"]}
          rows={list.map(inv => {
            const v=vendors.find(x=>x.id===inv.vendorId);
            return (
              <tr key={inv.id}>
                <TD mono>{inv.id}</TD>
                <TD mono muted>{inv.poId}</TD>
                <TD bold>{v?.name}</TD>
                <TD>{inv.product}</TD>
                <TD>{fmt(inv.subtotal)}</TD>
                <TD>{fmt(inv.tax)}</TD>
                <TD bold>{fmt(inv.total)}</TD>
                <TD>{fmtD(inv.dueDate)}</TD>
                <TD><Badge s={inv.status} /></TD>
                <TD>
                  <div style={{ display:"flex", gap:5 }}>
                    <BtnGhost onClick={()=>setView(inv)}>View</BtnGhost>
                    {(user.id==="officer"||user.id==="admin") && <>
                      <BtnGhost onClick={()=>print(inv)}>Print</BtnGhost>
                      {inv.status!=="Sent" && <BtnGhost onClick={()=>send(inv)} style={{ color:"#16a34a", borderColor:"#bbf7d0" }}>Send Email</BtnGhost>}
                    </>}
                  </div>
                </TD>
              </tr>
            );
          })} empty="No invoices yet" />
      </div>
      {view && (
        <Modal title={`Invoice: ${view.id}`} onClose={()=>setView(null)} wide>
          {(() => { const v=vendors.find(x=>x.id===view.vendorId); return (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                <div><div style={{ fontSize:22, fontWeight:800, color:"#2563eb" }}>VendorBridge</div><div style={{ fontSize:12, color:"#6b7280" }}>Procurement ERP</div></div>
                <div style={{ textAlign:"right", fontSize:13 }}>
                  <div style={{ fontWeight:700, fontSize:16 }}>{view.id}</div>
                  <div style={{ color:"#6b7280" }}>Date: {fmtD(view.createdAt)}</div>
                  <div style={{ color:"#6b7280" }}>Due: {fmtD(view.dueDate)}</div>
                </div>
              </div>
              <div style={{ background:"#f9fafb", borderRadius:6, padding:14, marginBottom:16, fontSize:13 }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>Vendor: {v?.name}</div>
                <div style={{ color:"#6b7280" }}>{v?.email} · {v?.phone}</div>
                <div style={{ color:"#6b7280", fontFamily:"monospace" }}>GST: {v?.gst}</div>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14, marginBottom:16 }}>
                <thead><tr style={{ background:"#f9fafb" }}>
                  <th style={{ padding:"9px 12px", textAlign:"left", border:"1px solid #e5e7eb" }}>Product</th>
                  <th style={{ padding:"9px 12px", textAlign:"left", border:"1px solid #e5e7eb" }}>Qty</th>
                  <th style={{ padding:"9px 12px", textAlign:"left", border:"1px solid #e5e7eb" }}>Subtotal</th>
                  <th style={{ padding:"9px 12px", textAlign:"left", border:"1px solid #e5e7eb" }}>Tax 18%</th>
                  <th style={{ padding:"9px 12px", textAlign:"left", border:"1px solid #e5e7eb" }}>Total</th>
                </tr></thead>
                <tbody><tr>
                  <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{view.product}</td>
                  <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{view.quantity}</td>
                  <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{fmt(view.subtotal)}</td>
                  <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{fmt(view.tax)}</td>
                  <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb", fontWeight:700, color:"#16a34a", fontSize:16 }}>{fmt(view.total)}</td>
                </tr></tbody>
              </table>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <Badge s={view.status} />
                <div style={{ display:"flex", gap:8 }}>
                  <BtnSecondary onClick={()=>print(view)}>🖨 Print</BtnSecondary>
                  {view.status!=="Sent" && (user.id==="officer"||user.id==="admin") && <BtnPrimary onClick={()=>send(view)}>📧 Send Email</BtnPrimary>}
                </div>
              </div>
            </div>
          );})()}
        </Modal>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   LOGS
════════════════════════════════════════════ */
const Logs = ({ logs }) => (
  <div>
    <PH title="Activity Logs" sub={`${logs.length} events`} />
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
      {logs.map((l,i) => (
        <div key={l.id} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:i<logs.length-1?"1px solid #f3f4f6":"none" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#2563eb", marginTop:6, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <span style={{ fontWeight:600, fontSize:14, color:"#111" }}>{l.action}</span>
            <span style={{ fontSize:13, color:"#6b7280", marginLeft:8 }}>{l.detail}</span>
          </div>
          <div style={{ textAlign:"right", fontSize:12, color:"#9ca3af", whiteSpace:"nowrap" }}>
            <div>{l.at}</div><div style={{ color:"#2563eb" }}>{l.by}</div>
          </div>
        </div>
      ))}
      {logs.length===0 && <p style={{ color:"#9ca3af", textAlign:"center", padding:32 }}>No activity yet</p>}
    </div>
  </div>
);

/* ════════════════════════════════════════════
   REPORTS
════════════════════════════════════════════ */
const Reports = ({ vendors, rfqs, quotations, pos, invoices }) => {
  const spend = pos.reduce((s,p)=>s+p.total,0);
  const vendPerf = vendors.map(v=>({ ...v, quotes:quotations.filter(q=>q.vendorId===v.id).length, pos:pos.filter(p=>p.vendorId===v.id).length, spend:pos.filter(p=>p.vendorId===v.id).reduce((s,p)=>s+p.total,0) })).sort((a,b)=>b.spend-a.spend);
  return (
    <div>
      <PH title="Reports & Analytics" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
        <Stat label="Total PO Value"  value={fmt(spend)}           color="#16a34a" />
        <Stat label="Total RFQs"      value={rfqs.length}          color="#2563eb" />
        <Stat label="Quotes Received" value={quotations.length}    color="#7c3aed" />
        <Stat label="Invoices Issued" value={invoices.length}      color="#0891b2" />
      </div>
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Vendor Performance</div>
        <Tbl cols={["Vendor","Category","Rating","Quotes","POs","Total Spend","Spend Share"]}
          rows={vendPerf.map(v=>(
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
                    <div style={{ height:"100%", width:spend?`${(v.spend/spend)*100}%`:"0%", background:"#2563eb", borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:12, color:"#6b7280" }}>{spend?Math.round((v.spend/spend)*100):0}%</span>
                </div>
              </TD>
            </tr>
          ))} />
      </div>
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>RFQ Status</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {["Open","Quoted","Closed"].map(s=>{
            const c=rfqs.filter(r=>r.status===s).length;
            return (
              <div key={s} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"14px 24px", minWidth:100 }}>
                <Badge s={s} />
                <div style={{ fontSize:28, fontWeight:700, color:"#111", margin:"8px 0 0" }}>{c}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   APP SHELL
════════════════════════════════════════════ */
export default function App() {
  const [user, setUser]       = useState(null);
  const [screen, setScreen]   = useState("dashboard");
  const [vendors, setVendors] = useState(VENDORS0);
  const [rfqs,    setRfqs]    = useState(RFQS0);
  const [quotes,  setQuotes]  = useState(QUOTES0);
  const [pos,     setPOs]     = useState(POS0);
  const [invs,    setInvs]    = useState(INVOICES0);
  const [aprs,    setAprs]    = useState(APPROVALS0);
  const [logs,    setLogs]    = useState(LOGS0);

  const addLog = (action, detail, by) => {
    const typeMap = { RFQ:"rfq", Quote:"quote", Quotation:"quote", Approval:"approval", PO:"po", Invoice:"invoice", Vendor:"vendor" };
    const type = Object.keys(typeMap).find(k=>action.includes(k)) ? typeMap[Object.keys(typeMap).find(k=>action.includes(k))] : "rfq";
    setLogs(ls => [{ id:Date.now(), action, detail, by, at:new Date().toLocaleString("en-IN"), type }, ...ls]);
  };

  if (!user) return <Login onLogin={u=>{ setUser(u); setScreen("dashboard"); }} />;

  const navItems = NAV[user.id] || NAV.officer;

  const SCREENS = {
    dashboard:  <Dashboard  user={user} vendors={vendors} rfqs={rfqs} quotations={quotes} pos={pos} invoices={invs} approvals={aprs} onNav={setScreen} />,
    vendors:    <Vendors    vendors={vendors} setVendors={setVendors} addLog={addLog} />,
    rfqs:       <RFQs       rfqs={rfqs} setRfqs={setRfqs} vendors={vendors} user={user} addLog={addLog} />,
    quotations: <Quotations quotations={quotes} setQuotations={setQuotes} rfqs={rfqs} setRfqs={setRfqs} vendors={vendors} user={user} addLog={addLog} approvals={aprs} setApprovals={setAprs} />,
    compare:    <Compare    quotations={quotes} rfqs={rfqs} vendors={vendors} />,
    approvals:  <Approvals  approvals={aprs} setApprovals={setAprs} quotations={quotes} setQuotations={setQuotes} rfqs={rfqs} vendors={vendors} pos={pos} setPOs={setPOs} user={user} addLog={addLog} />,
    pos:        <POs        pos={pos} vendors={vendors} invoices={invs} setInvoices={setInvs} user={user} addLog={addLog} />,
    invoices:   <Invoices   invoices={invs} setInvoices={setInvs} vendors={vendors} user={user} addLog={addLog} />,
    logs:       <Logs       logs={logs} />,
    reports:    <Reports    vendors={vendors} rfqs={rfqs} quotations={quotes} pos={pos} invoices={invs} />,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f3f4f6", fontFamily:"system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width:220, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"18px 20px", borderBottom:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:20, fontWeight:800, color:"#111" }}>Vendor<span style={{ color:"#2563eb" }}>Bridge</span></div>
          <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>Procurement ERP</div>
        </div>
        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {navItems.map(id => (
            <button key={id} onClick={()=>setScreen(id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:6, border:"none", cursor:"pointer", fontSize:14, fontWeight:screen===id?600:400, background:screen===id?"#eff6ff":"transparent", color:screen===id?"#2563eb":"#374151", marginBottom:2, textAlign:"left" }}>
              <span>{NAV_ICONS[id]}</span>{NAV_LABELS[id]}
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px 8px", borderTop:"1px solid #e5e7eb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:"#f9fafb", borderRadius:6, marginBottom:8 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"#2563eb", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11, flexShrink:0 }}>{user.avatar}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#111" }}>{user.name}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{user.role}</div>
            </div>
          </div>
          <button onClick={()=>{ setUser(null); setScreen("dashboard"); }}
            style={{ width:"100%", padding:"8px 12px", background:"none", border:"1px solid #e5e7eb", borderRadius:6, cursor:"pointer", fontSize:13, color:"#6b7280", textAlign:"left" }}>
            🚪 Sign out
          </button>
        </div>
      </div>
      {/* Main */}
      <main style={{ flex:1, padding:24, overflowY:"auto", maxHeight:"100vh" }}>
        {SCREENS[screen] || SCREENS.dashboard}
      </main>
    </div>
  );
}