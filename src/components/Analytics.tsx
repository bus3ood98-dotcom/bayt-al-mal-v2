"use client";
import { Expense, Salary, CATEGORIES } from "@/lib/data";
import { ProgressBar } from "@/components/ui";

export default function Analytics({ expenses, salary }: { expenses: Expense[]; salary: Salary }) {
  const today = new Date();
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const byCat = CATEGORIES.map(cat => ({
    cat,
    amount: expenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount);

  const byPlace: Record<string, number> = {};
  expenses.forEach(e => { byPlace[e.place] = (byPlace[e.place] || 0) + e.amount; });
  const topPlaces = Object.entries(byPlace).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxPlace = topPlaces[0]?.[1] || 1;

  const byDay: Record<number, number> = {};
  expenses.forEach(e => {
    const day = new Date(e.date).getDate();
    byDay[day] = (byDay[day] || 0) + e.amount;
  });
  const maxDay = Math.max(...Object.values(byDay), 1);

  const card = {
    background: "linear-gradient(135deg, #0F1C2E, #162236)",
    border: "1px solid #B8860B33",
    borderRadius: 16,
    padding: 24,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Category Bars */}
      <div style={card}>
        <h3 style={{ color: "#F5F0E8", fontSize: 15, margin: "0 0 20px" }}>توزيع المصروفات حسب التصنيف</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {byCat.slice(0, 8).map(({ cat, amount }) => (
            <div key={cat.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#F5F0E8", fontSize: 13 }}>{cat.icon} {cat.name}</span>
                <span style={{ color: cat.color, fontSize: 13, fontWeight: 600 }}>
                  {amount.toFixed(3)} د.ب · {((amount / total) * 100).toFixed(1)}٪
                </span>
              </div>
              <ProgressBar value={amount} max={total} color={cat.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Visual Bubbles */}
      <div style={card}>
        <h3 style={{ color: "#F5F0E8", fontSize: 15, margin: "0 0 20px" }}>🫧 توزيع بصري</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          {byCat.map(({ cat, amount }) => {
            const pct = (amount / total) * 100;
            const size = Math.max(56, pct * 2.8);
            return (
              <div key={cat.id} style={{
                width: size, height: size, borderRadius: 16,
                background: cat.color + "22",
                border: `2px solid ${cat.color}55`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              }}>
                <span style={{ fontSize: size > 80 ? 22 : 15 }}>{cat.icon}</span>
                {size > 65 && <span style={{ color: cat.color, fontSize: 10 }}>{pct.toFixed(0)}٪</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Places */}
      <div style={card}>
        <h3 style={{ color: "#F5F0E8", fontSize: 15, margin: "0 0 20px" }}>📍 أكثر الأماكن صرفاً</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {topPlaces.map(([place, amount], i) => (
            <div key={place}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#F5F0E8", fontSize: 13 }}>
                  <span style={{ color: "#B8860B", marginLeft: 8, fontSize: 11 }}>#{i + 1}</span>
                  {place}
                </span>
                <span style={{ color: "#E8A87C", fontWeight: 600, fontSize: 13 }}>{amount.toFixed(3)} د.ب</span>
              </div>
              <ProgressBar value={amount} max={maxPlace} color="#E8A87C" />
            </div>
          ))}
        </div>
      </div>

      {/* Daily Bar Chart */}
      <div style={card}>
        <h3 style={{ color: "#F5F0E8", fontSize: 15, margin: "0 0 20px" }}>📅 الصرف اليومي هذا الشهر</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, overflowX: "auto", paddingBottom: 4 }}>
          {Array.from({ length: today.getDate() }, (_, i) => i + 1).map(day => {
            const amt = byDay[day] || 0;
            const h = (amt / maxDay) * 100;
            return (
              <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "0 0 auto", minWidth: 24 }}>
                <div title={`${day}: ${amt.toFixed(3)} د.ب`} style={{
                  width: 20, height: `${h}%`, minHeight: amt > 0 ? 4 : 0,
                  background: day === today.getDate()
                    ? "linear-gradient(180deg, #D4A017, #B8860B)"
                    : "linear-gradient(180deg, #B8860B66, #B8860B33)",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.3s",
                }} />
                <span style={{ color: "#445566", fontSize: 9 }}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
