"use client";
import { useState } from "react";
import { generateId } from "@/lib/data";
import { inputStyle, btnGold } from "@/components/ui";

export interface Investment {
  id: string;
  name: string;
  icon: string;
  amount: number;
  note: string;
}

const INVEST_ICONS = ["📈", "💱", "🏢", "🥇", "💹", "🌍", "⚡", "🔷", "💎", "🏦"];

function ConfirmModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#00000088", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #EC706344", borderRadius: 20, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 16, margin: "0 0 8px" }}>حذف الاستثمار</h3>
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

export default function Investments({
  investments, onAdd, onUpdate, onDelete,
}: {
  investments: Investment[];
  onAdd: (i: Investment) => void;
  onUpdate: (id: string, data: Partial<Investment>) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "📈", amount: "", note: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"add" | "subtract">("add");
  const [deleteTarget, setDeleteTarget] = useState<Investment | null>(null);

  const total = investments.reduce((s, i) => s + i.amount, 0);

  const handleAdd = () => {
    if (!form.name || !form.amount) return;
    onAdd({ id: generateId(), name: form.name, icon: form.icon, amount: parseFloat(form.amount), note: form.note });
    setForm({ name: "", icon: "📈", amount: "", note: "" });
    setShowForm(false);
  };

  const handleUpdate = (inv: Investment) => {
    const val = parseFloat(editAmount);
    if (!val) return;
    const newAmount = editType === "add" ? inv.amount + val : Math.max(0, inv.amount - val);
    onUpdate(inv.id, { amount: newAmount });
    setEditId(null);
    setEditAmount("");
  };

  const card = { background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 };

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

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1A1A2E, #162236)", border: "1px solid #5DADE244", borderRadius: 20, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📈</div>
          <h2 style={{ color: "#5DADE2", fontFamily: "Cairo, sans-serif", fontSize: 18, margin: "0 0 6px" }}>استثماراتي</h2>
          <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 26, fontWeight: 700 }}>
            {total.toFixed(3)} <span style={{ fontSize: 14, color: "#667788" }}>د.ب</span>
          </div>
          <div style={{ color: "#667788", fontFamily: "Cairo, sans-serif", fontSize: 12, marginTop: 4 }}>
            {investments.length} استثمار
          </div>
        </div>

        {/* Add Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", margin: 0, fontSize: 15 }}>محفظتي الاستثمارية</h3>
          <button onClick={() => setShowForm(!showForm)} style={{ ...btnGold, padding: "10px 20px", fontSize: 13 }}>
            {showForm ? "إلغاء" : "+ استثمار جديد"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={card}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 8, fontFamily: "Cairo, sans-serif" }}>اختر أيقونة</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {INVEST_ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{
                      background: form.icon === icon ? "#5DADE233" : "#0A1628",
                      border: `1px solid ${form.icon === icon ? "#5DADE2" : "#B8860B22"}`,
                      borderRadius: 10, padding: "8px 12px", fontSize: 20, cursor: "pointer",
                    }}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>نوع الاستثمار</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: أسهم، عملات رقمية، عقار..." style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>المبلغ المستثمر (د.ب)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.000" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "Cairo, sans-serif" }}>ملاحظة (اختياري)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="تفاصيل إضافية..." style={inputStyle} />
              </div>
              <button onClick={handleAdd} style={{ ...btnGold, width: "100%", padding: 14 }}>➕ إضافة الاستثمار</button>
            </div>
          </div>
        )}

        {/* Investments List */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {investments.map(inv => {
            const pct = total > 0 ? (inv.amount / total) * 100 : 0;
            return (
              <div key={inv.id} style={{ ...card, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -15, left: -15, fontSize: 70, opacity: 0.05 }}>{inv.icon}</div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#5DADE222", border: "1px solid #5DADE244", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {inv.icon}
                    </div>
                    <div>
                      <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14 }}>{inv.name}</div>
                      {inv.note && <div style={{ color: "#667788", fontFamily: "Cairo, sans-serif", fontSize: 11, marginTop: 2 }}>{inv.note}</div>}
                    </div>
                  </div>
                  <button onClick={() => setDeleteTarget(inv)} style={{ background: "#EC706311", border: "none", borderRadius: 8, padding: "4px 8px", color: "#EC7063", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                </div>

                <div style={{ color: "#5DADE2", fontSize: 24, fontWeight: 700, fontFamily: "Cairo, sans-serif", marginBottom: 6 }}>
                  {inv.amount.toFixed(3)} <span style={{ fontSize: 13, color: "#667788" }}>د.ب</span>
                </div>
                <div style={{ color: "#445566", fontFamily: "Cairo, sans-serif", fontSize: 11, marginBottom: 14 }}>
                  {pct.toFixed(1)}٪ من إجمالي الاستثمار
                </div>

                {/* Progress bar */}
                <div style={{ background: "#0A1628", borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #5DADE2, #85C1E9)", borderRadius: 99 }} />
                </div>

                {editId === inv.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditType("add")} style={{
                        flex: 1, background: editType === "add" ? "#5DADE233" : "#0A1628",
                        border: `1px solid ${editType === "add" ? "#5DADE2" : "#B8860B22"}`,
                        borderRadius: 8, padding: "8px", color: editType === "add" ? "#5DADE2" : "#667788",
                        fontFamily: "Cairo, sans-serif", fontSize: 12, cursor: "pointer",
                      }}>+ إضافة</button>
                      <button onClick={() => setEditType("subtract")} style={{
                        flex: 1, background: editType === "subtract" ? "#EC706333" : "#0A1628",
                        border: `1px solid ${editType === "subtract" ? "#EC7063" : "#B8860B22"}`,
                        borderRadius: 8, padding: "8px", color: editType === "subtract" ? "#EC7063" : "#667788",
                        fontFamily: "Cairo, sans-serif", fontSize: 12, cursor: "pointer",
                      }}>- سحب</button>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="0.000" style={{ ...inputStyle, flex: 1, padding: "10px 14px" }} autoFocus />
                      <button onClick={() => handleUpdate(inv)} style={{ ...btnGold, padding: "0 16px", borderRadius: 12 }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ background: "#667788", border: "none", borderRadius: 12, padding: "0 12px", color: "#fff", cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setEditId(inv.id); setEditAmount(""); }} style={{
                    width: "100%", background: "#5DADE211", border: "1px solid #5DADE233",
                    borderRadius: 10, padding: 10, color: "#5DADE2",
                    fontFamily: "Cairo, sans-serif", fontSize: 13, cursor: "pointer",
                  }}>💱 تحديث المبلغ</button>
                )}
              </div>
            );
          })}
        </div>

        {investments.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#667788", fontFamily: "Cairo, sans-serif" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
            <div>لا توجد استثمارات. أضف استثمارك الأول!</div>
          </div>
        )}
      </div>
    </>
  );
}
