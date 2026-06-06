"use client";
import { useState } from "react";
import { generateId } from "@/lib/data";
import { ProgressBar, inputStyle, btnGold } from "@/components/ui";
import { Goal } from "@/lib/data";

export interface SavingsAccount {
  id: string;
  name: string;
  icon: string;
  amount: number;
  note: string;
}

const SAVING_ICONS = ["🏦", "💵", "💳", "🏠", "📱", "💼", "🪙", "💎", "🏧", "📊"];

// ── Confirm Modal ──────────────────────────────────────────
function ConfirmModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#00000088", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #EC706344", borderRadius: 20, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 16, margin: "0 0 8px" }}>حذف الحساب</h3>
        <p style={{ color: "#8899AA", fontFamily: "Cairo, sans-serif", fontSize: 13, margin: "0 0 24px" }}>
          هل أنت متأكد من حذف <span style={{ color: "#E8A87C", fontWeight: 700 }}>{name}</span>؟
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, background: "#162236", border: "1px solid #445566", borderRadius: 12, padding: 12, color: "#8899AA", fontFamily: "Cairo, sans-serif", fontSize: 14, cursor: "pointer" }}>إلغاء</button>
          <button onClick={onConfirm} style={{ flex: 1, background: "linear-gradient(135deg, #EC7063, #C0392B)", border: "none", borderRadius: 12, padding: 12, color: "#fff", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>احذف</button>
        </div>
      </div>
    </div>
  );
}

export default function Savings({
  accounts, goals,
  onAdd, onUpdate, onDelete,
}: {
  accounts: SavingsAccount[];
  goals: Goal[];
  onAdd: (a: SavingsAccount) => void;
  onUpdate: (id: string, data: Partial<SavingsAccount>) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "🏦", amount: "", note: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"add" | "subtract">("add");
  const [deleteTarget, setDeleteTarget] = useState<SavingsAccount | null>(null);

  const totalSavings = accounts.reduce((s, a) => s + a.amount, 0);
  const totalGoals = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalsSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  const handleAdd = () => {
    if (!form.name || !form.amount) return;
    onAdd({ id: generateId(), name: form.name, icon: form.icon, amount: parseFloat(form.amount), note: form.note });
    setForm({ name: "", icon: "🏦", amount: "", note: "" });
    setShowForm(false);
  };

  const handleUpdateAmount = (acc: SavingsAccount) => {
    const val = parseFloat(editAmount);
    if (!val) return;
    const newAmount = editType === "add" ? acc.amount + val : Math.max(0, acc.amount - val);
    onUpdate(acc.id, { amount: newAmount });
    setEditId(null);
    setEditAmount("");
  };

  const card = {
    background: "linear-gradient(135deg, #0F1C2E, #162236)",
    border: "1px solid #B8860B33",
    borderRadius: 16,
    padding: 24,
  };

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          name={deleteTarget.name}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          <div style={{ ...card, background: "linear-gradient(135deg, #0F2E1A, #0F1C2E)", border: "1px solid #52BE8044" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💰</div>
            <div style={{ color: "#8899AA", fontSize: 12, fontFamily: "Cairo, sans-serif", marginBottom: 4 }}>إجمالي المدخرات</div>
            <div style={{ color: "#52BE80", fontSize: 22, fontWeight: 700, fontFamily: "Cairo, sans-serif" }}>{totalSavings.toFixed(3)} د.ب</div>
            <div style={{ color: "#445566", fontSize: 11, fontFamily: "Cairo, sans-serif", marginTop: 4 }}>{accounts.length} حساب</div>
          </div>

          <div style={{ ...card }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ color: "#8899AA", fontSize: 12, fontFamily: "Cairo, sans-serif", marginBottom: 4 }}>مخصص للأهداف</div>
            <div style={{ color: "#B8860B", fontSize: 22, fontWeight: 700, fontFamily: "Cairo, sans-serif" }}>{totalGoalsSaved.toFixed(3)} د.ب</div>
            <div style={{ color: "#445566", fontSize: 11, fontFamily: "Cairo, sans-serif", marginTop: 4 }}>من {totalGoals.toFixed(3)} د.ب مطلوب</div>
          </div>

          <div style={{ ...card }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
            <div style={{ color: "#8899AA", fontSize: 12, fontFamily: "Cairo, sans-serif", marginBottom: 4 }}>فائض الادخار</div>
            <div style={{ color: totalSavings - totalGoalsSaved >= 0 ? "#76D7C4" : "#EC7063", fontSize: 22, fontWeight: 700, fontFamily: "Cairo, sans-serif" }}>
              {(totalSavings - totalGoalsSaved).toFixed(3)} د.ب
            </div>
            <div style={{ color: "#445566", fontSize: 11, fontFamily: "Cairo, sans-serif", marginTop: 4 }}>بعد خصم الأهداف</div>
          </div>
        </div>

        {/* Add Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", margin: 0, fontSize: 16 }}>🏦 حسابات الادخار</h2>
          <button onClick={() => setShowForm(!showForm)} style={{ ...btnGold, padding: "10px 20px", fontSize: 13 }}>
            {showForm ? "إلغاء" : "+ حساب جديد"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={card}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 8, fontFamily: "Cairo, sans-serif" }}>اختر أيقونة</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SAVING_ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{
                      background: form.icon === icon ? "#B8860B33" : "#0A1628",
                      border: `1px solid ${form.icon === icon ? "#B8860B" : "#B8860B22"}`,
                      borderRadius: 10, padding: "8px 12px", fontSize: 20, cursor: "pointer",
                    }}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>اسم الحساب</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: بنك البحرين الوطني" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>المبلغ الحالي (د.ب)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.000" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>ملاحظة (اختياري)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="مثال: حساب توفير، حساب جاري..." style={inputStyle} />
              </div>
              <button onClick={handleAdd} style={{ ...btnGold, width: "100%", padding: 14 }}>➕ إضافة الحساب</button>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {accounts.map(acc => (
            <div key={acc.id} style={{ ...card, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -15, left: -15, fontSize: 70, opacity: 0.05 }}>{acc.icon}</div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#52BE8022", border: "1px solid #52BE8044", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {acc.icon}
                  </div>
                  <div>
                    <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14 }}>{acc.name}</div>
                    {acc.note && <div style={{ color: "#667788", fontFamily: "Cairo, sans-serif", fontSize: 11, marginTop: 2 }}>{acc.note}</div>}
                  </div>
                </div>
                <button onClick={() => setDeleteTarget(acc)} style={{ background: "#EC706311", border: "none", borderRadius: 8, padding: "4px 8px", color: "#EC7063", cursor: "pointer", fontSize: 14 }}>🗑️</button>
              </div>

              <div style={{ color: "#52BE80", fontSize: 26, fontWeight: 700, fontFamily: "Cairo, sans-serif", marginBottom: 16 }}>
                {acc.amount.toFixed(3)} <span style={{ fontSize: 14, color: "#667788" }}>د.ب</span>
              </div>

              {/* Update Amount */}
              {editId === acc.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditType("add")} style={{
                      flex: 1, background: editType === "add" ? "#52BE8033" : "#0A1628",
                      border: `1px solid ${editType === "add" ? "#52BE80" : "#B8860B22"}`,
                      borderRadius: 8, padding: "8px", color: editType === "add" ? "#52BE80" : "#667788",
                      fontFamily: "Cairo, sans-serif", fontSize: 12, cursor: "pointer",
                    }}>+ إيداع</button>
                    <button onClick={() => setEditType("subtract")} style={{
                      flex: 1, background: editType === "subtract" ? "#EC706333" : "#0A1628",
                      border: `1px solid ${editType === "subtract" ? "#EC7063" : "#B8860B22"}`,
                      borderRadius: 8, padding: "8px", color: editType === "subtract" ? "#EC7063" : "#667788",
                      fontFamily: "Cairo, sans-serif", fontSize: 12, cursor: "pointer",
                    }}>- سحب</button>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      placeholder="0.000"
                      style={{ ...inputStyle, flex: 1, padding: "10px 14px" }}
                      autoFocus
                    />
                    <button onClick={() => handleUpdateAmount(acc)} style={{ ...btnGold, padding: "0 16px", borderRadius: 12 }}>✓</button>
                    <button onClick={() => setEditId(null)} style={{ background: "#667788", border: "none", borderRadius: 12, padding: "0 12px", color: "#fff", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setEditId(acc.id); setEditAmount(""); }} style={{
                  width: "100%", background: "#52BE8011", border: "1px solid #52BE8033",
                  borderRadius: 10, padding: 10, color: "#52BE80",
                  fontFamily: "Cairo, sans-serif", fontSize: 13, cursor: "pointer",
                }}>
                  💱 تحديث المبلغ
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Goals vs Savings */}
        {goals.length > 0 && totalSavings > 0 && (
          <div style={card}>
            <h3 style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 15, margin: "0 0 20px" }}>🎯 الأهداف مقابل المدخرات</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {goals.map(g => {
                const pct = Math.min(100, (totalSavings / g.targetAmount) * 100);
                return (
                  <div key={g.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "Cairo, sans-serif" }}>
                      <span style={{ color: "#F5F0E8", fontSize: 13 }}>{g.icon} {g.title}</span>
                      <span style={{ color: "#B8860B", fontSize: 12 }}>
                        {totalSavings >= g.targetAmount ? "✅ يكفي!" : `${(g.targetAmount - totalSavings).toFixed(3)} د.ب ناقص`}
                      </span>
                    </div>
                    <ProgressBar value={totalSavings} max={g.targetAmount} color={totalSavings >= g.targetAmount ? "#52BE80" : "#B8860B"} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {accounts.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#667788", fontFamily: "Cairo, sans-serif" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
            <div>لا توجد حسابات ادخار. أضف حسابك الأول!</div>
          </div>
        )}
      </div>
    </>
  );
}
