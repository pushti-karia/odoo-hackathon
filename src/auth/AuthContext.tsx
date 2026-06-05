import { createContext, useState, useEffect, ReactNode } from "react";

/* ── types ── */
export type Role = "Procurement Officer" | "Vendor" | "Manager" | "Admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  vendorId?: string;
}

interface AuthState {
  user: AuthUser | null;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

/* ── storage keys ── */
const STORAGE_KEY = "vb_users";
const SESSION_KEY = "vb_session";

/* ── helpers ── */
function getUsers(): Record<string, { name: string; email: string; passwordHash: string; role: Role; vendorId?: string }> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveUsers(u: ReturnType<typeof getUsers>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
}

function hashPw(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  return h.toString(16);
}

function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function makeUser(email: string, record: ReturnType<typeof getUsers>[string]): AuthUser {
  return {
    id:       "u_" + email.replace(/[^a-z0-9]/gi, "_"),
    name:     record.name,
    email:    record.email,
    role:     record.role,
    avatar:   initials(record.name),
    vendorId: record.vendorId,
  };
}

/* ── seed demo accounts once ── */
function seedDemoAccounts() {
  const users = getUsers();
  const demos = [
    { email:"officer@demo.com", name:"Kavya Reddy",  role:"Procurement Officer" as Role, pw:"demo1234" },
    { email:"vendor@demo.com",  name:"Arjun Mehta",  role:"Vendor"              as Role, pw:"demo1234", vendorId:"V001" },
    { email:"manager@demo.com", name:"Rohan Desai",  role:"Manager"             as Role, pw:"demo1234" },
    { email:"admin@demo.com",   name:"Anita Sharma", role:"Admin"               as Role, pw:"demo1234" },
  ];
  let changed = false;
  for (const d of demos) {
    if (!users[d.email]) {
      users[d.email] = { name:d.name, email:d.email, passwordHash:hashPw(d.pw), role:d.role, ...(d.vendorId ? { vendorId:d.vendorId } : {}) };
      changed = true;
    }
  }
  if (changed) saveUsers(users);
}

/* ── context ── */
export const AuthContext = createContext<AuthState>({
  user: null,
  error: "",
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  /* restore session synchronously so there's no blank flash */
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      seedDemoAccounts();
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState("");

  /* keep demo accounts seeded on every mount */
  useEffect(() => { seedDemoAccounts(); }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError("");
    const key    = email.trim().toLowerCase();
    const users  = getUsers();
    const record = users[key];
    if (!record) { setError("No account found with that email."); return false; }
    if (record.passwordHash !== hashPw(password)) { setError("Incorrect password."); return false; }
    const u = makeUser(key, record);
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return true;
  };

  const signup = async (name: string, email: string, password: string, role: Role): Promise<boolean> => {
    setError("");
    const key = email.trim().toLowerCase();
    if (!name.trim() || !key || !password) { setError("All fields are required."); return false; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return false; }
    const users = getUsers();
    if (users[key]) { setError("An account with this email already exists."); return false; }
    users[key] = { name: name.trim(), email: key, passwordHash: hashPw(password), role };
    saveUsers(users);
    return login(key, password);
  };

  const logout = () => {
    setUser(null);
    setError("");
    localStorage.removeItem(SESSION_KEY);
  };

  const clearError = () => setError("");

  return (
    <AuthContext.Provider value={{ user, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
