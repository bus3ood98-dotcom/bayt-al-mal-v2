"use client";
import { useState } from "react";
import { Expense, Salary, Goal, CATEGORIES, formatDate, generateId } from "@/lib/data";
import { StatCard, ProgressBar, GoldDivider, Badge } from "@/components/ui";

export interface ExtraIncome {
  id: string;
  amount: number;
  source: string;
  date: string;
}


// ── Top Category Card ──────────────────────────────────────
function TopCatCard({ expenses }: { expenses: Expense[] }) {
  const byCat = expenses.reduce((acc: Record<number, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const topEntry = Object.entries(byCat).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const topCat = topEntry ? CATEGORIES.find(c => c.id === Number(topEntry[0])) : null;
  return (
    <StatCard
      label="أكثر تصنيف صرفاً"
      value={topCat ? `${topCat.icon} ${topCat.name}` : "—"}
      sub={topEntry ? `${Number(topEntry[1]).toFixed(3)} د.ب` : ""}
      accent={topCat?.color}
      icon="🏆"
    />
  );
}

export default function Dashboard({
  expenses, salary, goals, extraIncomes, onAddExtraIncome, onDeleteExtraIncome,
}: {
  expenses: Expense[]; salary: Salary; goals: Goal[];
  extraIncomes: ExtraIncome[];
  onAddExtraIncome: (i: ExtraIncome) => void;
  onDeleteExtraIncome: (id: string) => void;
}) {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const today = new Date();
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const thisMonthExtra = extraIncomes
    .filter(i => { const d = new Date(i.date); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); })
    .reduce((s, i) => s + i.amount, 0);
  const totalIncome = salary.amount + salary.extraIncome + thisMonthExtra;
  const remaining = totalIncome - totalSpent;
  const spentPct = Math.min(100, (totalSpent / Math.max(1, totalIncome)) * 100);

  const daysUntilPay = (() => {
    const payDate = new Date(today.getFullYear(), today.getMonth(), salary.payDay);
    if (today >= payDate) payDate.setMonth(payDate.getMonth() + 1);
    return Math.max(0, Math.ceil((payDate.getTime() - today.getTime()) / 86400000));
  })();

  const avgDaily = totalSpent / Math.max(1, today.getDate());
  const suggestedDaily = remaining / Math.max(1, daysUntilPay);

  const alerts: { type: string; msg: string }[] = [];
  if (spentPct > 70) alerts.push({ type: "warn", msg: `تم صرف ${spentPct.toFixed(0)}٪ من الراتب الحالي` });
  if (daysUntilPay <= 7) alerts.push({ type: "info", msg: `بقي ${daysUntilPay} ${daysUntilPay === 1 ? "يوم" : "أيام"} على الراتب القادم` });
  if (avgDaily > suggestedDaily * 1.3 && suggestedDaily > 0) alerts.push({ type: "warn", msg: "معدل الصرف أعلى من المعتاد هذا الأسبوع" });

  const recentExp = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Quick Add Extra Income Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setShowIncomeModal(true)} style={{
          background: "linear-gradient(135deg, #52BE8022, #27AE6011)",
          border: "1px solid #52BE8044",
          borderRadius: 12, padding: "10px 18px",
          color: "#52BE80", fontFamily: "Cairo, sans-serif",
          fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          💵 + إضافة دخل استثنائي
        </button>
      </div>

      {/* Extra Income Modal */}
      {showIncomeModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#00000088", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #52BE8044", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%" }}>
            <h3 style={{ color: "#52BE80", fontFamily: "Cairo, sans-serif", fontSize: 16, margin: "0 0 20px" }}>💵 إضافة دخل استثنائي</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>المبلغ (د.ب)</label>
                <input type="number" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} placeholder="0.000"
                  style={{ background: "#0A1628", border: "1px solid #52BE8033", borderRadius: 12, padding: "12px 16px", color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" as any }} />
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>المصدر</label>
                <input value={incomeSource} onChange={e => setIncomeSource(e.target.value)} placeholder="عيدية، مكافأة، عمل حر..."
                  style={{ background: "#0A1628", border: "1px solid #52BE8033", borderRadius: 12, padding: "12px 16px", color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" as any }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["عيدية", "مكافأة", "عمل حر", "بيع", "هدية"].map(s => (
                  <button key={s} onClick={() => setIncomeSource(s)} style={{
                    background: incomeSource === s ? "#52BE8033" : "#0A1628",
                    border: `1px solid ${incomeSource === s ? "#52BE80" : "#52BE8022"}`,
                    borderRadius: 20, padding: "5px 12px", color: incomeSource === s ? "#52BE80" : "#667788",
                    fontFamily: "Cairo, sans-serif", fontSize: 12, cursor: "pointer",
                  }}>{s}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowIncomeModal(false)} style={{ flex: 1, background: "#162236", border: "1px solid #445566", borderRadius: 12, padding: 12, color: "#8899AA", fontFamily: "Cairo, sans-serif", cursor: "pointer" }}>إلغاء</button>
                <button onClick={() => {
                  if (!incomeAmount || !incomeSource) return;
                  onAddExtraIncome({ id: generateId(), amount: parseFloat(incomeAmount), source: incomeSource, date: new Date().toISOString() });
                  setIncomeAmount(""); setIncomeSource(""); setShowIncomeModal(false);
                }} style={{ flex: 1, background: "linear-gradient(135deg, #52BE80, #27AE60)", border: "none", borderRadius: 12, padding: 12, color: "#0A1628", fontFamily: "Cairo, sans-serif", fontWeight: 700, cursor: "pointer" }}>
                  ✅ إضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{
              background: a.type === "warn" ? "#B8860B11" : "#5DADE211",
              border: `1px solid ${a.type === "warn" ? "#B8860B44" : "#5DADE244"}`,
              borderRadius: 12, padding: "12px 16px",
              color: a.type === "warn" ? "#D4A017" : "#5DADE2",
              fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              {a.type === "warn" ? "⚠️" : "💡"} {a.msg}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard label="الرصيد المتبقي" value={`${remaining.toFixed(3)} د.ب`} sub="بعد المصروفات" accent={remaining < 100 ? "#EC7063" : "#52BE80"} icon="💰" />
<TopCatCard expenses={expenses} />
        <StatCard label="إجمالي المصروفات" value={`${totalSpent.toFixed(3)} د.ب`} sub={`${spentPct.toFixed(0)}٪ من الراتب`} accent="#E8A87C" icon="📊" />
        <StatCard label="أيام على الراتب" value={`${daysUntilPay} يوم`} sub="حتى الراتب القادم" accent="#85C1E9" icon="⏳" />
        <StatCard label="متوسط يومي" value={`${avgDaily.toFixed(3)} د.ب`} sub="هذا الشهر" icon="📈" />
        <StatCard label="مقترح يومياً" value={`${suggestedDaily.toFixed(3)} د.ب`} sub="حتى الراتب القادم" accent="#76D7C4" icon="🎯" />
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ color: "#8899AA", fontSize: 13 }}>نسبة الصرف من الراتب</span>
          <span style={{ color: "#B8860B", fontWeight: 700 }}>{spentPct.toFixed(1)}٪</span>
        </div>
        <ProgressBar value={totalSpent} max={totalIncome} color={spentPct > 80 ? "#EC7063" : "#B8860B"} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ color: "#667788", fontSize: 11 }}>صُرف: {totalSpent.toFixed(3)} د.ب</span>
          <span style={{ color: "#667788", fontSize: 11 }}>الراتب: {totalIncome.toFixed(3)} د.ب</span>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "#F5F0E8", fontSize: 15, margin: 0 }}>آخر العمليات</h3>
          <span style={{ color: "#B8860B", fontSize: 12 }}>{expenses.length} عملية هذا الشهر</span>
        </div>
        <GoldDivider />
        {recentExp.map((exp, i) => {
          const cat = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[14];
          return (
            <div key={exp.id}>
              <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#F5F0E8", fontSize: 14, fontWeight: 600 }}>{exp.place}</div>
                  <div style={{ color: "#667788", fontSize: 11 }}>{formatDate(exp.date)} · {cat.name}</div>
                </div>
                <div style={{ color: "#E8A87C", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                  {exp.amount.toFixed(3)} د.ب
                </div>
              </div>
              {i < recentExp.length - 1 && <GoldDivider />}
            </div>
          );
        })}
      </div>

      {goals.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#F5F0E8", fontSize: 15, margin: "0 0 16px" }}>الأهداف المالية</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {goals.map(g => {
              const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
              return (
                <div key={g.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#F5F0E8", fontSize: 14 }}>{g.icon} {g.title}</span>
                    <span style={{ color: "#B8860B", fontSize: 13 }}>{pct.toFixed(0)}٪ · {g.currentAmount} / {g.targetAmount} د.ب</span>
                  </div>
                  <ProgressBar value={g.currentAmount} max={g.targetAmount} color="#76D7C4" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extra Incomes This Month */}
      {extraIncomes.filter(i => { const d = new Date(i.date); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }).length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #0F2E1A, #0F1C2E)", border: "1px solid #52BE8033", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#52BE80", fontFamily: "Cairo, sans-serif", fontSize: 15, margin: "0 0 16px" }}>💵 الدخل الإضافي هذا الشهر</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {extraIncomes.filter(i => { const d = new Date(i.date); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }).map(inc => (
              <div key={inc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #52BE8011" }}>
                <div>
                  <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 14 }}>{inc.source}</div>
                  <div style={{ color: "#667788", fontFamily: "Cairo, sans-serif", fontSize: 11 }}>{formatDate(inc.date)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#52BE80", fontWeight: 700, fontFamily: "Cairo, sans-serif" }}>+{inc.amount.toFixed(3)} د.ب</span>
                  <button onClick={() => onDeleteExtraIncome(inc.id)} style={{ background: "#EC706322", border: "none", borderRadius: 6, padding: "4px 8px", color: "#EC7063", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, fontFamily: "Cairo, sans-serif" }}>
              <span style={{ color: "#8899AA", fontSize: 13 }}>الإجمالي:</span>
              <span style={{ color: "#52BE80", fontWeight: 700, fontSize: 14 }}>+{thisMonthExtra.toFixed(3)} د.ب</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
