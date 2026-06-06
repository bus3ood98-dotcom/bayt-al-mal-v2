"use client";
import { useState, useEffect } from "react";
import { Expense, Salary, Goal, DEMO_SALARY } from "@/lib/data";
import {
  fetchExpenses, insertExpense, updateExpense as dbUpdateExpense, deleteExpense as dbDeleteExpense,
  fetchSalary, upsertSalary,
  fetchGoals, insertGoal, updateGoal as dbUpdateGoal, deleteGoal as dbDeleteGoal,
} from "@/lib/supabase";
import Dashboard from "@/components/Dashboard";
import AddExpense from "@/components/AddExpense";
import ExpensesList from "@/components/ExpensesList";
import Analytics from "@/components/Analytics";
import { WhereDidMySalaryGo, SalarySettings, Goals, Assistant } from "@/components/Pages";
import Savings, { SavingsAccount } from "@/components/Savings";
import Investments, { Investment } from "@/components/Investments";
import { fetchSavings, insertSaving, updateSaving as dbUpdateSaving, deleteSaving as dbDeleteSaving, fetchInvestments, insertInvestment, updateInvestment as dbUpdateInvestment, deleteInvestment as dbDeleteInvestment } from "@/lib/supabase";

type PageId = "dashboard" | "add" | "expenses" | "analytics" | "where" | "goals" | "salary" | "assistant" | "savings" | "investments";

const NAV_ITEMS: { id: PageId; label: string; icon: string }[] = [
  { id: "dashboard",  label: "لوحة التحكم", icon: "🏠" },
  { id: "add",        label: "إضافة",        icon: "➕" },
  { id: "expenses",   label: "المصروفات",    icon: "📋" },
  { id: "analytics",  label: "التحليلات",    icon: "📊" },
  { id: "where",      label: "وين راح؟",     icon: "💸" },
  { id: "goals",      label: "الأهداف",      icon: "🎯" },
  { id: "salary",     label: "الراتب",       icon: "⚙️" },
  { id: "assistant",  label: "المساعد",      icon: "🤖" },
  { id: "savings",    label: "خزينتي",      icon: "🏦" },
  { id: "investments", label: "استثماراتي",  icon: "📈" },
];

// ── Loading Screen ─────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: "#070E1A",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{
        width: 64, height: 64,
        background: "linear-gradient(135deg, #B8860B, #D4A017)",
        borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        animation: "pulse 1.5s ease-in-out infinite",
      }}>🏛️</div>
      <div style={{ color: "#B8860B", fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 700 }}>بيت المال</div>
      <div style={{ color: "#445566", fontFamily: "Cairo, sans-serif", fontSize: 12 }}>جاري تحميل بياناتك...</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(.95)} }`}</style>
    </div>
  );
}

export default function Home() {
  const getInitialPage = (): PageId => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("page") as PageId;
      if (param && NAV_ITEMS.find(n => n.id === param)) return param;
    }
    return "dashboard";
  };

  const [page, setPage]         = useState<PageId>(getInitialPage);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalary]     = useState<Salary>(DEMO_SALARY);
  const [goals, setGoals]       = useState<Goal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [savings, setSavings]     = useState<SavingsAccount[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [showBanner, setShowBanner]       = useState(false);

  // ── Load data from Supabase ────────────────────────────
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [exps, sal, gls, savs, invs] = await Promise.all([fetchExpenses(), fetchSalary(), fetchGoals(), fetchSavings(), fetchInvestments()]);
      setInvestments(invs.map(i => ({ id: i.id, name: i.name, icon: i.icon, amount: i.amount, note: i.note || "" })));
      setSavings(savs.map(s => ({ id: s.id, name: s.name, icon: s.icon, amount: s.amount, note: s.note || "" })));
      setExpenses(exps.map(e => ({ id: e.id, amount: e.amount, place: e.place, category: e.category, note: e.note || "", date: e.date })));
      if (sal) setSalary({ amount: sal.amount, payDay: sal.pay_day, extraIncome: sal.extra_income, extraNote: sal.extra_note });
      setGoals(gls.map(g => ({ id: g.id, title: g.title, icon: g.icon, targetAmount: g.target_amount, currentAmount: g.current_amount, targetDate: g.target_date })));
      setLoading(false);
    }
    loadAll();
  }, []);

  // ── PWA Install ────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) { setIsInstalled(true); return; }
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setShowBanner(true); };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    window.addEventListener("appinstalled", () => { setIsInstalled(true); setShowBanner(false); });
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setIsInstalled(true); setShowBanner(false); }
    setInstallPrompt(null);
  };

  // ── Expense Actions ────────────────────────────────────
  const addExpense = async (e: Expense) => {
    setExpenses(prev => [e, ...prev]);
    await insertExpense({ id: e.id, amount: e.amount, place: e.place, category: e.category, note: e.note, date: e.date });
  };
  const removeExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await dbDeleteExpense(id);
  };
  const editExpense = async (id: string, data: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    await dbUpdateExpense(id, data);
  };

  // ── Salary Actions ─────────────────────────────────────
  const saveSalary = async (s: Salary) => {
    setSalary(s);
    await upsertSalary({ amount: s.amount, pay_day: s.payDay, extra_income: s.extraIncome, extra_note: s.extraNote });
  };

  // ── Investment Actions ─────────────────────────────────
  const addInvestment = async (i: Investment) => {
    setInvestments(prev => [...prev, i]);
    await insertInvestment({ id: i.id, name: i.name, icon: i.icon, amount: i.amount, note: i.note });
  };
  const editInvestment = async (id: string, data: Partial<Investment>) => {
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    await dbUpdateInvestment(id, data);
  };
  const removeInvestment = async (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
    await dbDeleteInvestment(id);
  };

  // ── Savings Actions ────────────────────────────────────
  const addToSavings = async (id: string, amount: number) => {
    const acc = savings.find(a => a.id === id);
    if (!acc) return;
    const newAmount = acc.amount + amount;
    setSavings(prev => prev.map(a => a.id === id ? { ...a, amount: newAmount } : a));
    await dbUpdateSaving(id, { amount: newAmount });
  };

  const addSaving = async (a: SavingsAccount) => {
    setSavings(prev => [...prev, a]);
    await insertSaving({ id: a.id, name: a.name, icon: a.icon, amount: a.amount, note: a.note });
  };
  const editSaving = async (id: string, data: Partial<SavingsAccount>) => {
    setSavings(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    await dbUpdateSaving(id, data);
  };
  const removeSaving = async (id: string) => {
    setSavings(prev => prev.filter(a => a.id !== id));
    await dbDeleteSaving(id);
  };

  // ── Goal Actions ───────────────────────────────────────
  const addGoal = async (g: Goal) => {
    setGoals(prev => [...prev, g]);
    await insertGoal({ id: g.id, title: g.title, icon: g.icon, target_amount: g.targetAmount, current_amount: g.currentAmount, target_date: g.targetDate });
  };
  const editGoal = async (id: string, data: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    const dbData: any = {};
    if (data.currentAmount !== undefined) dbData.current_amount = data.currentAmount;
    if (data.targetAmount !== undefined) dbData.target_amount = data.targetAmount;
    if (data.title !== undefined) dbData.title = data.title;
    await dbUpdateGoal(id, dbData);
  };
  const removeGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await dbDeleteGoal(id);
  };

  if (loading) return <LoadingScreen />;

  const currentNav = NAV_ITEMS.find(n => n.id === page)!;

  return (
    <div style={{ minHeight: "100vh", background: "#070E1A", direction: "rtl" }}>

      {/* Install Banner */}
      {showBanner && !isInstalled && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 999, width: "calc(100% - 48px)", maxWidth: 420,
          background: "linear-gradient(135deg, #0F1C2E, #162236)",
          border: "1px solid #B8860B66", borderRadius: 18, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 8px 32px #00000088",
        }}>
          <div style={{ width: 48, height: 48, flexShrink: 0, background: "linear-gradient(135deg, #B8860B, #D4A017)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏛️</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>ثبّت بيت المال</div>
            <div style={{ color: "#8899AA", fontFamily: "Cairo, sans-serif", fontSize: 11 }}>أضفه لشاشتك الرئيسية</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setShowBanner(false)} style={{ background: "transparent", border: "1px solid #445566", borderRadius: 10, padding: "7px 12px", color: "#667788", fontFamily: "Cairo, sans-serif", fontSize: 12, cursor: "pointer" }}>لاحقاً</button>
            <button onClick={handleInstall} style={{ background: "linear-gradient(135deg, #B8860B, #D4A017)", border: "none", borderRadius: 10, padding: "7px 16px", color: "#0A1628", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>📲 ثبّت</button>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside style={{ position: "fixed", top: 0, right: 0, width: 220, height: "100vh", background: "linear-gradient(180deg, #0A1628 0%, #0D1E35 100%)", borderLeft: "1px solid #B8860B22", display: "flex", flexDirection: "column", zIndex: 100 }} className="sidebar">
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #B8860B22" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #B8860B, #D4A017)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏛️</div>
            <div>
              <div style={{ color: "#B8860B", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>بيت المال</div>
              <div style={{ color: "#445566", fontSize: 10, marginTop: 2 }}>Bayt Al-Mal</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              background: page === item.id ? "linear-gradient(135deg, #B8860B22, #B8860B11)" : "transparent",
              border: page === item.id ? "1px solid #B8860B44" : "1px solid transparent",
              borderRadius: 10, padding: "10px 14px",
              color: page === item.id ? "#B8860B" : "#667788",
              fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              textAlign: "right", width: "100%", transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        {!isInstalled && installPrompt && (
          <div style={{ padding: "12px", borderTop: "1px solid #B8860B22" }}>
            <button onClick={handleInstall} style={{ width: "100%", background: "#B8860B22", border: "1px solid #B8860B44", borderRadius: 10, padding: "10px 14px", color: "#B8860B", fontFamily: "Cairo, sans-serif", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              📲 تثبيت التطبيق
            </button>
          </div>
        )}
        <div style={{ padding: "12px 24px", borderTop: "1px solid #B8860B22" }}>
          <div style={{ color: "#334455", fontSize: 10, textAlign: "center" }}>بيت المال v2.0 · 1447هـ</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "#0A1628", borderBottom: "1px solid #B8860B22", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 200 }} className="mobile-header">
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#B8860B", fontSize: 22 }}>{menuOpen ? "✕" : "☰"}</button>
        <span style={{ color: "#B8860B", fontWeight: 700, fontSize: 15 }}>🏛️ بيت المال</span>
        {!isInstalled && installPrompt
          ? <button onClick={handleInstall} style={{ background: "none", border: "none", color: "#B8860B", fontSize: 20, cursor: "pointer" }}>📲</button>
          : <span style={{ color: "#667788", fontSize: 16 }}>{currentNav.icon}</span>
        }
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 60, right: 0, width: "100%", background: "#0A1628", borderBottom: "1px solid #B8860B22", zIndex: 150, padding: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false); }} style={{
              background: page === item.id ? "#B8860B22" : "#0F1C2E",
              border: `1px solid ${page === item.id ? "#B8860B44" : "#B8860B22"}`,
              borderRadius: 10, padding: "8px 14px",
              color: page === item.id ? "#B8860B" : "#8899AA",
              fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Main */}
      <main style={{ marginRight: 220, padding: "32px", minHeight: "100vh" }} className="main">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: "#F5F0E8", fontSize: 22, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
            {currentNav.icon} {currentNav.label}
          </h1>
          <div style={{ height: 2, width: 40, background: "linear-gradient(90deg, #B8860B, transparent)", borderRadius: 1 }} />
        </div>

        {page === "dashboard"  && <Dashboard expenses={expenses} salary={salary} goals={goals} />}
        {page === "add"        && <AddExpense onAdd={async (e) => { await addExpense(e); setPage("dashboard"); }} savingsAccounts={savings} onAddToSavings={addToSavings} />}
        {page === "expenses"   && <ExpensesList expenses={expenses} onDelete={removeExpense} onUpdate={editExpense} />}
        {page === "analytics"  && <Analytics expenses={expenses} salary={salary} />}
        {page === "where"      && <WhereDidMySalaryGo expenses={expenses} salary={salary} />}
        {page === "goals"      && <Goals goals={goals} onAdd={addGoal} onUpdate={editGoal} onDelete={removeGoal} />}
        {page === "salary"     && <SalarySettings salary={salary} onUpdate={saveSalary} />}
        {page === "assistant"  && <Assistant expenses={expenses} salary={salary} />}
        {page === "savings"    && <Savings accounts={savings} goals={goals} onAdd={addSaving} onUpdate={editSaving} onDelete={removeSaving} />}
        {page === "investments" && <Investments investments={investments} onAdd={addInvestment} onUpdate={editInvestment} onDelete={removeInvestment} />}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main { margin-right: 0 !important; padding: 80px 16px 32px !important; }
        }
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  );
}
