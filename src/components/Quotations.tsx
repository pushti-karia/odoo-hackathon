import { useState } from "react";
import { uid, fmt, fmtD, inp, FG, Row2, Modal, Tbl, TD, Badge, BtnPrimary, BtnSecondary, BtnGhost, PH } from "./ui";

export default function Quotations({ quotations, setQuotations, rfqs, setRfqs, vendors, user, addLog, approvals, setApprovals }: any) {
  const [show, setShow] = useState(false);
  const blank = { rfqId:"", unitPrice:"", delivery:"", notes:"" };
  const [f, setF] = useState(blank);

  const myVid    = user.vendorId;
  const list     = myVid ? quotations.filter((q: any) => q.vendorId === myVid) : quotations;

  // Vendor sees only RFQs they are assigned to; everyone else sees all open/quoted
  const openRfqs = rfqs.filter((r: any) => {
    const isOpen = r.status === "Open" || r.status === "Quoted";
    if (!myVid) return isOpen;
    return isOpen && Array.isArray(r.vendors) && r.vendors.includes(myVid);
  });

  const submit = () => {
    if (!f.rfqId || !f.unitPrice) return alert("RFQ and unit price required");
    const rfq = rfqs.find((r: any) => r.id === f.rfqId);
    const qty = rfq?.quantity || 1;
    const q = {
      id: uid("Q"), rfqId:f.rfqId, vendorId:myVid || "V001",
      unitPrice:parseInt(f.unitPrice), totalPrice:parseInt(f.unitPrice) * qty,
      delivery:f.delivery, notes:f.notes, status:"Submitted",
      submittedAt:new Date().toISOString().split("T")[0],
    };
    setQuotations((qs: any[]) => [q, ...qs]);
    setRfqs((rs: any[]) => rs.map(r => r.id === f.rfqId ? { ...r, status:"Quoted" } : r));
    addLog("Quotation Submitted", `${q.id} for ${f.rfqId}`, user.id);
    setShow(false); setF(blank);
  };

  const sendApproval = (q: any) => {
    if (approvals.find((a: any) => a.quotationId === q.id)) return alert("Already submitted for approval");
    const apr = {
      id:uid("APR"), rfqId:q.rfqId, quotationId:q.id, status:"Pending",
      remarks:"", approvedBy:null, approvedAt:null,
      timeline:[{ action:"Submitted for approval", by:user.id, at:new Date().toLocaleString() }],
    };
    setApprovals((as: any[]) => [apr, ...as]);
    setQuotations((qs: any[]) => qs.map(x => x.id === q.id ? { ...x, status:"Pending Approval" } : x));
    addLog("Sent for Approval", q.id, user.id);
    alert(`${q.id} sent for manager approval!`);
  };

  return (
    <div>
      {/* ── Vendor: show assigned RFQs they can quote on ── */}
      {myVid && (
        <div style={{ marginBottom:20 }}>
          <PH title="RFQs Assigned to You" sub={`${openRfqs.length} open`} />
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
            {openRfqs.length === 0 ? (
              <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"20px 0" }}>
                No RFQs assigned to you yet. The procurement team will notify you when one is ready.
              </p>
            ) : (
              <Tbl cols={["RFQ ID","Title","Product","Qty","Deadline","Status","Action"]}
                rows={openRfqs.map((r: any) => {
                  const alreadyQuoted = quotations.some((q: any) => q.rfqId === r.id && q.vendorId === myVid);
                  return (
                    <tr key={r.id}>
                      <TD mono muted>{r.id}</TD>
                      <TD bold>{r.title}</TD>
                      <TD>{r.product}</TD>
                      <TD>{r.quantity} {r.unit}</TD>
                      <TD>{fmtD(r.deadline)}</TD>
                      <TD><Badge s={r.status} /></TD>
                      <TD>
                        {alreadyQuoted
                          ? <span style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>✓ Quoted</span>
                          : <BtnGhost onClick={() => { setF({...blank, rfqId: r.id}); setShow(true); }}>
                              Submit Quote
                            </BtnGhost>
                        }
                      </TD>
                    </tr>
                  );
                })} empty="No assigned RFQs" />
            )}
          </div>
        </div>
      )}

      {/* ── Quotations table ── */}
      <PH title={myVid ? "My Submitted Quotations" : "Quotations"} sub={`${list.length} total`}
        action={myVid && openRfqs.length > 0 && <BtnPrimary onClick={() => setShow(true)}>+ Submit Quotation</BtnPrimary>} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["Quote ID","RFQ","Vendor","Unit Price","Total","Delivery","Notes","Status","Actions"]}
          rows={list.map((q: any) => {
            const rfq    = rfqs.find((r: any) => r.id === q.rfqId);
            const vendor = vendors.find((v: any) => v.id === q.vendorId);
            const hasApr = approvals.find((a: any) => a.quotationId === q.id);
            return (
              <tr key={q.id}>
                <TD mono muted>{q.id}</TD>
                <TD>{rfq?.title || q.rfqId}</TD>
                <TD bold>{vendor?.name || q.vendorId}</TD>
                <TD>{fmt(q.unitPrice)}</TD>
                <TD bold>{fmt(q.totalPrice)}</TD>
                <TD>{q.delivery}</TD>
                <TD muted>{q.notes || "—"}</TD>
                <TD><Badge s={q.status} /></TD>
                <TD>
                  {user.id === "officer" && q.status === "Submitted" && !hasApr &&
                    <BtnGhost onClick={() => sendApproval(q)}>Send for Approval</BtnGhost>}
                </TD>
              </tr>
            );
          })} empty="No quotations yet" />
      </div>

      {show && (
        <Modal title="Submit Quotation" onClose={() => setShow(false)}>
          <FG label="Select RFQ *">
            <select style={inp} value={f.rfqId} onChange={e => setF({...f, rfqId:e.target.value})}>
              <option value="">-- Select RFQ --</option>
              {openRfqs.map((r: any) => <option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
            </select>
          </FG>
          <Row2>
            <FG label="Unit Price (₹) *"><input style={inp} type="number" value={f.unitPrice} onChange={e => setF({...f, unitPrice:e.target.value})} /></FG>
            <FG label="Delivery Timeline"><input style={inp} value={f.delivery} onChange={e => setF({...f, delivery:e.target.value})} placeholder="10 days" /></FG>
          </Row2>
          <FG label="Notes"><textarea style={{...inp, resize:"vertical"}} rows={3} value={f.notes} onChange={e => setF({...f, notes:e.target.value})} /></FG>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnSecondary onClick={() => setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={submit}>Submit</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}
