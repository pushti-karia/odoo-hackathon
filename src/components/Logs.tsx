import { PH } from "./ui";

export default function Logs({ logs }: any) {
  return (
    <div>
      <PH title="Activity Logs" sub={`${logs.length} events`} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        {logs.map((l: any, i: number) => (
          <div key={l.id} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:i < logs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#2563eb", marginTop:6, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <span style={{ fontWeight:600, fontSize:14, color:"#111" }}>{l.action}</span>
              <span style={{ fontSize:13, color:"#6b7280", marginLeft:8 }}>{l.detail}</span>
            </div>
            <div style={{ textAlign:"right", fontSize:12, color:"#9ca3af", whiteSpace:"nowrap" }}>
              <div>{l.at}</div>
              <div style={{ color:"#2563eb" }}>{l.by}</div>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p style={{ color:"#9ca3af", textAlign:"center", padding:32 }}>No activity yet</p>}
      </div>
    </div>
  );
}
