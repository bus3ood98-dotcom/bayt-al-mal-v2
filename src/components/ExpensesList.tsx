"use client";
import { useState } from "react";
import { Expense, CATEGORIES, formatDate } from "@/lib/data";
import { Badge, inputStyle } from "@/components/ui";

// ── Confirm Delete Modal ───────────────────────────────────
function ConfirmModal({ place, onConfirm, onCancel }: { place: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "#00000088", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0F1C2E, #162236)",
        border: "1px solid #EC706344",
        borderRadius: 20, padding: 28, maxWidth: 360, width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 16, margin: "0 0 8px" }}>
          حذف المصروف
        </h3>
        <p style={{ color: "#8899AA", fontFamily: "Cairo, sans-serif", fontSize: 13, margin: "0 0 24px" }}>
          هل أنت متأكد من حذف <span style={{ color: "#E8A87C", fontWeight: 700 }}>{place}</span>؟
          <br />لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, background: "#162236", border: "1px solid #445566",
            borderRadius: 12, padding: 12, color: "#8899AA",
            fontFamily: "Cairo, sans-serif", fontSize: 14, cursor: "pointer",
          }}>إلغاء</button>
          <button onClick={onConfirm} style={{
            flex: 1, background: "linear-gradient(135deg, #EC7063, #C0392B)",
            border: "none", borderRadius: 12, padding: 12, color: "#fff",
            fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>نعم، احذف</button>
        </div>
      </div>
    </div>
  );
}

export default function ExpensesList({
  expenses, onDelete, onUpdate,
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Expense>) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Expense>>({});
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const filtered = expenses
    .filter(e => {
      const s = search.toLowerCase();
      return (e.place.toLowerCase().includes(s) || (e.note || "").toLowerCase().includes(s))
        && (filterCat === 0 || e.category === filterCat);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px", fontSize: 13, fontFamily: "Cairo, sans-serif",
  };

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          place={deleteTarget.place}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 بحث..." style={{ ...inputStyle, flex: "1 1 200px" }} />
            <select value={filterCat} onChange={e => setFilterCat(Number(e.target.value))} style={{ ...inputStyle, width: "auto", flex: "0 0 auto" }}>
              <option value={0}>كل التصنيفات</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <div style={{ color: "#B8860B", fontWeight: 600, whiteSpace: "nowrap", fontSize: 14 }}>
              {filtered.length} عملية · {total.toFixed(3)} د.ب
            </div>
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Cairo, sans-serif" }}>
              <thead>
                <tr style={{ background: "#0A1628" }}>
                  {["التاريخ", "المكان", "المبلغ", "التصنيف", "ملاحظة", ""].map((h, i) => (
                    <th key={i} style={{ padding: "14px 16px", color: "#B8860B", fontSize: 12, textAlign: "right", fontWeight: 600, borderBottom: "1px solid #B8860B22" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp, i) => {
                  const isEditing = editId === exp.id;
                  return (
                    <tr key={exp.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #B8860B11" : "none" }}>
                      <td style={{ ...tdStyle, color: "#8899AA" }}>{formatDate(exp.date)}</td>
                      <td style={{ ...tdStyle, color: "#F5F0E8" }}>
                        {isEditing
                          ? <input defaultValue={exp.place} onChange={e => setEditData(d => ({ ...d, place: e.target.value }))} style={{ ...inputStyle, width: 120, padding: "6px 10px", borderRadius: 8 }} />
                          : exp.place}
                      </td>
                      <td style={{ ...tdStyle, color: "#E8A87C", fontWeight: 700 }}>
                        {isEditing
                          ? <input type="number" defaultValue={exp.amount} onChange={e => setEditData(d => ({ ...d, amount: parseFloat(e.target.value) }))} style={{ ...inputStyle, width: 85, padding: "6px 10px", borderRadius: 8 }} />
                          : `${exp.amount.toFixed(3)} د.ب`}
                      </td>
                      <td style={tdStyle}><Badge catId={exp.category} /></td>
                      <td style={{ ...tdStyle, color: "#667788" }}>
                        {isEditing
                          ? <input defaultValue={exp.note || ""} onChange={e => setEditData(d => ({ ...d, note: e.target.value }))} placeholder="ملاحظة..." style={{ ...inputStyle, width: 110, padding: "6px 10px", borderRadius: 8 }} />
                          : exp.note || "—"}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {isEditing ? (
                            <>
                              <button onClick={() => { onUpdate(exp.id, editData); setEditId(null); }} style={{ background: "#52BE80", border: "none", borderRadius: 6, padding: "4px 10px", color: "#0A1628", fontSize: 12 }}>حفظ</button>
                              <button onClick={() => setEditId(null)} style={{ background: "#667788", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", fontSize: 12 }}>إلغاء</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditId(exp.id); setEditData({ place: exp.place, amount: exp.amount, note: exp.note }); }} style={{ background: "#B8860B22", border: "none", borderRadius: 6, padding: "4px 10px", color: "#B8860B", fontSize: 12 }}>✏️</button>
                              <button onClick={() => setDeleteTarget(exp)} style={{ background: "#EC706322", border: "none", borderRadius: 6, padding: "4px 10px", color: "#EC7063", fontSize: 12 }}>🗑️</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#667788" }}>لا توجد نتائج</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
