"use client";
import { Expense, Salary, Goal, CATEGORIES, formatDate } from "@/lib/data";
import { StatCard, ProgressBar, GoldDivider, Badge } from "@/components/ui";

export default function Dashboard({
  expenses, salary, goals,
}: {
  expenses: Expense[]; salary: Salary; goals: Goal[];
}) {
  const today = new Date();
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = salary.amount + salary.extraIncome;
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
        <StatCard label="الراتب الشهري" value={`${salary.amount} د.ب`} sub={salary.extraIncome > 0 ? `+ ${salary.extraIncome} إضافي` : `يوم ${salary.payDay} كل شهر`} icon="📅" />
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
    </div>
  );
}
