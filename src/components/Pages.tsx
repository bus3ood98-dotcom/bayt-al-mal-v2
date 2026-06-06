"use client";
import { useState, useEffect, useRef } from "react";
import { Expense, Salary, Goal, CATEGORIES, GOAL_ICONS, generateId } from "@/lib/data";
import { ProgressBar, inputStyle, btnGold } from "@/components/ui";

// ─── WHERE DID MY SALARY GO ───────────────────────────────
export function WhereDidMySalaryGo({ expenses, salary }: { expenses: Expense[]; salary: Salary }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCat = CATEGORIES.map(cat => ({
    cat,
    amount: expenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount);

  const saveable = byCat.filter(x => [1, 2, 9, 3].includes(x.cat.id));
  const potentialSaving = saveable.reduce((s, x) => s + x.amount * 0.3, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #162236, #1A2B40)", border: "1px solid #B8860B44", borderRadius: 20, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
        <h2 style={{ color: "#B8860B", fontSize: 22, margin: "0 0 8px" }}>وين راح معاشك؟</h2>
        <p style={{ color: "#8899AA", fontSize: 14, margin: 0 }}>
          صرفت <span style={{ color: "#E8A87C", fontWeight: 700 }}>{total.toFixed(3)} د.ب</span> من راتبك <span style={{ color: "#B8860B", fontWeight: 700 }}>{salary.amount} د.ب</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {byCat.slice(0, 6).map(({ cat, amount }) => {
          const pct = (amount / total) * 100;
          return (
            <div key={cat.id} style={{
              background: "linear-gradient(135deg, #0F1C2E, #162236)",
              border: `1px solid ${cat.color}44`,
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ color: "#F5F0E8", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cat.name}</div>
              <div style={{ color: cat.color, fontSize: 20, fontWeight: 700 }}>{pct.toFixed(0)}٪</div>
              <div style={{ color: "#8899AA", fontSize: 12, marginTop: 4 }}>{amount.toFixed(3)} د.ب</div>
              <div style={{ marginTop: 10 }}><ProgressBar value={amount} max={total} color={cat.color} /></div>
            </div>
          );
        })}
      </div>

      {saveable.length > 0 && (
        <div style={{ background: "#52BE8011", border: "1px solid #52BE8044", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#52BE80", fontSize: 15, margin: "0 0 16px" }}>💡 فرص التوفير</h3>
          {saveable.map(({ cat, amount }) => (
            <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#F5F0E8", fontSize: 13 }}>{cat.icon} بتقليل {cat.name} 30٪</span>
              <span style={{ color: "#52BE80", fontWeight: 600, fontSize: 13 }}>توفر {(amount * 0.3).toFixed(3)} د.ب</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #52BE8033", paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#76D7C4", fontWeight: 700 }}>إجمالي التوفير المحتمل:</span>
            <span style={{ color: "#52BE80", fontWeight: 700, fontSize: 16 }}>{potentialSaving.toFixed(3)} د.ب / شهر</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SALARY SETTINGS ──────────────────────────────────────
export function SalarySettings({ salary, onUpdate }: { salary: Salary; onUpdate: (s: Salary) => void }) {
  const [form, setForm] = useState(salary);
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 28 }}>
        <h3 style={{ color: "#F5F0E8", margin: "0 0 24px", fontSize: 16 }}>⚙️ إعدادات الراتب</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>الراتب الشهري (د.ب)</label>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>يوم نزول الراتب</label>
            <input type="number" min={1} max={31} value={form.payDay} onChange={e => setForm(f => ({ ...f, payDay: parseInt(e.target.value) || 24 }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>دخل إضافي (اختياري)</label>
            <input type="number" value={form.extraIncome} onChange={e => setForm(f => ({ ...f, extraIncome: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>مصدر الدخل الإضافي</label>
            <input value={form.extraNote} onChange={e => setForm(f => ({ ...f, extraNote: e.target.value }))} placeholder="إيجار، عمل حر..." style={inputStyle} />
          </div>
          <div style={{ background: "#0A1628", borderRadius: 12, padding: 16, border: "1px solid #B8860B22" }}>
            <div style={{ color: "#8899AA", fontSize: 12, marginBottom: 4 }}>إجمالي الدخل</div>
            <div style={{ color: "#B8860B", fontSize: 24, fontWeight: 700 }}>{(form.amount + (form.extraIncome || 0)).toFixed(3)} د.ب</div>
          </div>
          <button onClick={() => { onUpdate(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{
            ...btnGold, width: "100%", padding: 14, fontSize: 15,
            background: saved ? "linear-gradient(135deg, #52BE80, #27AE60)" : "linear-gradient(135deg, #B8860B, #D4A017)",
          }}>
            {saved ? "✅ تم الحفظ!" : "💾 حفظ الإعدادات"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GOALS ────────────────────────────────────────────────
export function Goals({ goals, onAdd, onUpdate, onDelete }: {
  goals: Goal[];
  onAdd: (g: Goal) => void;
  onUpdate: (id: string, data: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}) {
  const today = new Date();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", icon: "🎯", targetAmount: "", currentAmount: "", targetDate: "" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#F5F0E8", margin: 0 }}>🎯 الأهداف المالية</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btnGold, padding: "10px 20px", fontSize: 13 }}>
          {showForm ? "إلغاء" : "+ هدف جديد"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 8 }}>اختر أيقونة</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GOAL_ICONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{
                    background: form.icon === icon ? "#B8860B33" : "#0A1628",
                    border: `1px solid ${form.icon === icon ? "#B8860B" : "#B8860B22"}`,
                    borderRadius: 10, padding: "8px 12px", fontSize: 20,
                  }}>{icon}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>اسم الهدف</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="حج، سيارة، مشروع..." style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>المبلغ المطلوب (د.ب)</label>
                <input type="number" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>المدخر حتى الآن</label>
                <input type="number" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>التاريخ المستهدف</label>
              <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} style={inputStyle} />
            </div>
            <button onClick={() => {
              if (!form.title || !form.targetAmount) return;
              onAdd({ id: generateId(), ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0 });
              setForm({ title: "", icon: "🎯", targetAmount: "", currentAmount: "", targetDate: "" });
              setShowForm(false);
            }} style={{ ...btnGold, width: "100%", padding: 14 }}>
              ➕ إضافة الهدف
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {goals.map(goal => {
          const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = goal.targetAmount - goal.currentAmount;
          const monthsLeft = goal.targetDate ? Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))) : null;
          const monthlyNeeded = monthsLeft ? (remaining / monthsLeft).toFixed(3) : null;
          return (
            <div key={goal.id} style={{
              background: "linear-gradient(135deg, #0F1C2E, #162236)",
              border: "1px solid #B8860B33", borderRadius: 16, padding: 24, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.05 }}>{goal.icon}</div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{goal.icon}</div>
              <h4 style={{ color: "#F5F0E8", margin: "0 0 16px", fontSize: 16 }}>{goal.title}</h4>
              <ProgressBar value={goal.currentAmount} max={goal.targetAmount} color="#76D7C4" />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, marginBottom: 16 }}>
                <span style={{ color: "#76D7C4", fontSize: 12 }}>{pct.toFixed(0)}٪ مكتمل</span>
                <span style={{ color: "#8899AA", fontSize: 12 }}>{goal.currentAmount} / {goal.targetAmount} د.ب</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#8899AA", fontSize: 12 }}>المتبقي:</span>
                  <span style={{ color: "#E8A87C", fontSize: 12, fontWeight: 600 }}>{remaining.toFixed(3)} د.ب</span>
                </div>
                {monthlyNeeded && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8899AA", fontSize: 12 }}>مطلوب شهرياً:</span>
                    <span style={{ color: "#B8860B", fontSize: 12, fontWeight: 600 }}>{monthlyNeeded} د.ب</span>
                  </div>
                )}
                {monthsLeft && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8899AA", fontSize: 12 }}>المدة المتبقية:</span>
                    <span style={{ color: "#85C1E9", fontSize: 12 }}>{monthsLeft} شهر</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => {
                  const add = parseFloat(prompt("أدخل المبلغ المضاف للادخار:") || "0");
                  if (add > 0) onUpdate(goal.id, { currentAmount: goal.currentAmount + add });
                }} style={{ flex: 1, background: "#76D7C422", border: "none", borderRadius: 8, padding: 8, color: "#76D7C4", fontSize: 12 }}>
                  + إضافة ادخار
                </button>
                <button onClick={() => onDelete(goal.id)} style={{ background: "#EC706322", border: "none", borderRadius: 8, padding: "8px 12px", color: "#EC7063", fontSize: 12 }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#667788" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div>لا توجد أهداف حتى الآن. أضف هدفاً مالياً!</div>
        </div>
      )}
    </div>
  );
}

// ─── ASSISTANT ────────────────────────────────────────────
export function Assistant({ expenses, salary }: { expenses: Expense[]; salary: Salary }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "مرحباً! أنا مساعدك المالي في بيت المال. اسألني عن مصروفاتك وأنا أجيبك بناءً على بياناتك الحقيقية 📊" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = salary.amount + salary.extraIncome - total;

  const buildContext = () => {
    const byCat = CATEGORIES.map(cat => ({
      name: cat.name,
      amount: expenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
    })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount);
    const byPlace: Record<string, number> = {};
    expenses.forEach(e => { byPlace[e.place] = (byPlace[e.place] || 0) + e.amount; });
    const topPlaces = Object.entries(byPlace).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return `أنت مساعد مالي شخصي ذكي. هذه بيانات المستخدم هذا الشهر:
- الراتب: ${salary.amount} د.ب، يوم النزول: ${salary.payDay}
- إجمالي المصروفات: ${total.toFixed(3)} د.ب
- المتبقي: ${remaining.toFixed(3)} د.ب
- التصنيفات: ${byCat.map(c => `${c.name}: ${c.amount.toFixed(3)}`).join("، ")}
- أكثر الأماكن: ${topPlaces.map(([p, a]) => `${p}: ${(a as number).toFixed(3)}`).join("، ")}
أجب بالعربية بشكل مختصر وودي وعملي في 2-3 أسطر فقط.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildContext(),
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "bot", text: data.content?.[0]?.text || "عذراً، لم أتمكن من الإجابة." }]);
    } catch {
      setMessages(m => [...m, { role: "bot", text: "حدث خطأ في الاتصال. حاول مرة ثانية." }]);
    }
    setLoading(false);
  };

  const suggestions = ["كم صرفت على المطاعم؟", "وين أكثر مكان أصرف فيه؟", "كيف وضعي المالي؟", "كيف أوفر أكثر؟"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", maxHeight: 580 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "4px 0 16px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end" }}>
            <div style={{
              maxWidth: "80%",
              background: msg.role === "user" ? "#B8860B22" : "linear-gradient(135deg, #0F1C2E, #162236)",
              border: `1px solid ${msg.role === "user" ? "#B8860B44" : "#B8860B22"}`,
              borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              padding: "12px 16px", color: "#F5F0E8", fontSize: 14, lineHeight: 1.6,
            }}>
              {msg.role === "bot" && <span style={{ color: "#B8860B", marginLeft: 6 }}>🤖</span>}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B22", borderRadius: "4px 16px 16px 16px", padding: "12px 20px", color: "#B8860B" }}>
              ✨ يفكر...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            background: "#0A1628", border: "1px solid #B8860B33", borderRadius: 20,
            padding: "6px 12px", color: "#8899AA", fontSize: 11,
          }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="اسأل عن مصروفاتك..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ ...btnGold, padding: "0 20px", fontSize: 18 }}>↩</button>
      </div>
    </div>
  );
}
