import { uid, fmt, fmtD, Tbl, TD, Badge, BtnGhost, PH } from "./ui";

export default function POs({ pos, vendors, invoices, setInvoices, user, addLog }: any) {
  const myVid = user.vendorId;
  const list  = myVid ? pos.filter((p: any) => p.vendorId === myVid) : pos;

  const genInvoice = (po: any) => {
    if (invoices.find((i: any) => i.poId === po.id)) return alert("Invoice already exists for this PO");
    const inv = {
      id:uid("INV"), poId:po.id, vendorId:po.vendorId, product:po.product,
      quantity:po.quantity, subtotal:po.subtotal, tax:po.tax, total:po.total,
      status:"Draft", createdAt:new Date().toISOString().split("T")[0],
      dueDate:new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    };
    setInvoices((is: any[]) => [inv, ...is]);
    addLog("Invoice Generated", inv.id, user.id);
    alert(`✅ Invoice ${inv.id} generated!`);
  };

  return (
    <div>
      <PH title="Purchase Orders" sub={`${list.length} total`} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["PO Number","Product","Vendor","Qty","Subtotal","Tax 18%","Total","Date","Status","Action"]}
          rows={list.map((po: any) => {
            const v   = vendors.find((x: any) => x.id === po.vendorId);
            const has = invoices.find((i: any) => i.poId === po.id);
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
                <TD><Badge s={has ? "Invoiced" : po.status} /></TD>
                <TD>
                  {!has && (user.id === "officer" || user.id === "admin")
                    ? <BtnGhost onClick={() => genInvoice(po)}>Generate Invoice</BtnGhost>
                    : has ? <span style={{ fontSize:12, color:"#16a34a" }}>✓ Done</span> : null}
                </TD>
              </tr>
            );
          })} empty="No purchase orders yet" />
      </div>
    </div>
  );
}
