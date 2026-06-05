import { useState, useEffect, useCallback } from "react";
import { VENDORS0, RFQS0, QUOTES0, POS0, INVOICES0, APPROVALS0, LOGS0 } from "../data/seed";

/* ─────────────────────────────────────────
   localStorage keys
───────────────────────────────────────── */
const KEYS = {
  vendors:    "vb_vendors",
  rfqs:       "vb_rfqs",
  quotations: "vb_quotations",
  pos:        "vb_pos",
  invoices:   "vb_invoices",
  approvals:  "vb_approvals",
  logs:       "vb_logs",
} as const;

/* ─────────────────────────────────────────
   helpers
───────────────────────────────────────── */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota */ }
}

/* ─────────────────────────────────────────
   persisted state factory
───────────────────────────────────────── */
function usePersisted<T>(key: string, seed: T) {
  const [val, setVal] = useState<T>(() => load(key, seed));

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setVal(prev => {
      const next = typeof updater === "function"
        ? (updater as (p: T) => T)(prev)
        : updater;
      save(key, next);
      return next;
    });
  }, [key]);

  return [val, set] as const;
}

/* ─────────────────────────────────────────
   main store hook
───────────────────────────────────────── */
export function useStore() {
  const [vendors,    setVendors]    = usePersisted(KEYS.vendors,    VENDORS0);
  const [rfqs,       setRfqs]       = usePersisted(KEYS.rfqs,       RFQS0);
  const [quotations, setQuotations] = usePersisted(KEYS.quotations, QUOTES0);
  const [pos,        setPOs]        = usePersisted(KEYS.pos,        POS0);
  const [invoices,   setInvoices]   = usePersisted(KEYS.invoices,   INVOICES0);
  const [approvals,  setApprovals]  = usePersisted(KEYS.approvals,  APPROVALS0);
  const [logs,       setLogs]       = usePersisted(KEYS.logs,       LOGS0);

  const addLog = useCallback((action: string, detail: string, by: string) => {
    setLogs(ls => {
      const entry = { id: Date.now(), action, detail, by, at: new Date().toLocaleString(), type: "" };
      return [entry, ...ls];
    });
  }, [setLogs]);

  /* expose a reset helper for development / demo reset */
  const resetStore = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setVendors(VENDORS0);
    setRfqs(RFQS0);
    setQuotations(QUOTES0);
    setPOs(POS0);
    setInvoices(INVOICES0);
    setApprovals(APPROVALS0);
    setLogs(LOGS0);
  }, []);

  return {
    vendors,    setVendors,
    rfqs,       setRfqs,
    quotations, setQuotations,
    pos,        setPOs,
    invoices,   setInvoices,
    approvals,  setApprovals,
    logs,       setLogs,
    addLog,
    resetStore,
  };
}
