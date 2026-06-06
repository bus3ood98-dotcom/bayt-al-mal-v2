"use client";
import { useState, useEffect } from "react";
import { CATEGORIES, autoClassify, generateId, Expense } from "@/lib/data";
import { inputStyle, btnGold } from "@/components/ui";

// ── Bank SMS Parser ────────────────────────────────────────
function parseBankSMS(text: string): { amount: number; place: string } | null {
  // بنك البحرين الوطني / بنك البحرين والكويت وغيرها
  const patterns = [
    // "تم الخصم بمبلغ 5.000 د.ب من حسابك لدى ستاربكس"
    /(?:تم الخصم|خُصم|خصم).*?(\d+[\.,]\d+)\s*(?:د\.?ب|BHD|BD).*?(?:لدى|في|من)\s+(.+?)(?:\s|$)/i,
    // "Purchase of BD 12.500 at McDonald's"
    /(?:purchase|payment|spent).*?(?:BD|BHD)\s*(\d+[\.,]\d+).*?(?:at|@)\s+(.+?)(?:\s+on|\s+date|$)/i,
    // "5.000 BD - ستاربكس"
    /(\d+[\.,]\d+)\s*(?:BD|BHD|د\.?ب)\s*[-–]\s*(.+)/i,
    // "Amount: 3.500 BD Merchant: Costa Coffee"
    /amount[:\s]+(\d+[\.,]\d+).*?merchant[:\s]+(.+?)(?:\s+date|$)/i,
    // "قيمة المشتريات 8.750 د.ب - سيتي سنتر"
    /(?:قيمة|مبلغ).*?(\d+[\.,]\d+)\s*(?:د\.?ب|BD).*?[-–]\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      const place = match[2].trim().replace(/[*#]/g, '').trim();
      if (amount > 0 && place) return { amount, place };
    }
  }
  return null;
}

export default function AddExpense({ onAdd }: { onAdd: (e: Expense) => void }) {
  const [amount, setAmount] = useState("");
  const [place, setPlace] = useState("");
  const [category, setCategory] = useState(15);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [success, setSuccess] = useState(false);
  const [quickInput, setQuickInput] = useState("");
  const [smsText, setSmsText] = useState("");
  const [smsResult, setSmsResult] = useState<{ amount: number; place: string } | null>(null);
  const [smsError, setSmsError] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "sms">("manual");

  useEffect(() => {
    if (place) setCategory(autoClassify(place));
  }, [place]);

  const parseQuick = (text: string) => {
    const match = text.match(/([\d.]+)\s*(?:د\.?ب|bd|BHD)?\s*[-–]\s*(.+)/i);
    if (match) {
      setAmount(String(parseFloat(match[1])));
      setPlace(match[2].trim());
      setQuickInput("");
    }
  };

  const handleParseSMS = () => {
    const result = parseBankSMS(smsText);
    if (result) {
      setSmsResult(result);
      setAmount(String(result.amount));
      setPlace(result.place);
      setCategory(autoClassify(result.place));
      setSmsError(false);
    } else {
      setSmsResult(null);
      setSmsError(true);
    }
  };

  const handleSubmit = () => {
    if (!amount || !place) return;
    onAdd({ id: generateId(), amount: parseFloat(amount), place, category, note, date: new Date(date).toISOString() });
    setAmount(""); setPlace(""); setNote(""); setSmsText(""); setSmsResult(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: "10px", border: "none", borderRadius: 10,
    background: active ? "linear-gradient(135deg, #B8860B, #D4A017)" : "transparent",
    color: active ? "#0A1628" : "#667788",
    fontFamily: "Cairo, sans-serif", fontWeight: active ? 700 : 400,
    fontSize: 13, cursor: "pointer", transition: "all 0.2s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>

      {/* Quick Input */}
      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: "#B8860B", margin: "0 0 8px", fontSize: 15 }}>⚡ إدخال سريع</h3>
        <p style={{ color: "#667788", fontSize: 12, margin: "0 0 12px" }}>مثال: 3.5 - ستاربكس</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={quickInput} onChange={e => setQuickInput(e.target.value)} onKeyDown={e => e.key === "Enter" && parseQuick(quickInput)} placeholder="3.5 - مطعم البيك" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => parseQuick(quickInput)} style={{ ...btnGold, padding: "0 20px", borderRadius: 12 }}>تحليل</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", gap: 8, background: "#0A1628", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          <button style={tabStyle(activeTab === "manual")} onClick={() => setActiveTab("manual")}>✏️ إدخال يدوي</button>
          <button style={tabStyle(activeTab === "sms")} onClick={() => setActiveTab("sms")}>📱 رسالة البنك</button>
        </div>

        {/* SMS Tab */}
        {activeTab === "sms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>الصق نص رسالة البنك هنا</label>
              <textarea
                value={smsText}
                onChange={e => { setSmsText(e.target.value); setSmsError(false); setSmsResult(null); }}
                placeholder="مثال: تم الخصم بمبلغ 5.000 د.ب من حسابك لدى ستاربكس..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            <button onClick={handleParseSMS} style={{ ...btnGold, width: "100%", padding: 12 }}>
              🔍 تحليل الرسالة
            </button>
            {smsResult && (
              <div style={{ background: "#52BE8022", border: "1px solid #52BE8044", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#52BE80", fontFamily: "Cairo, sans-serif", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>✅ تم التحليل بنجاح!</div>
                <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 14 }}>
                  <span style={{ color: "#8899AA" }}>المبلغ: </span>{smsResult.amount.toFixed(3)} د.ب
                  <span style={{ color: "#8899AA", marginRight: 16 }}>المكان: </span>{smsResult.place}
                </div>
              </div>
            )}
            {smsError && (
              <div style={{ background: "#EC706322", border: "1px solid #EC706344", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#EC7063", fontFamily: "Cairo, sans-serif", fontSize: 13 }}>
                  ⚠️ ما قدرت أقرأ الرسالة. جرب الإدخال اليدوي أو تأكد من نسخ الرسالة كاملة.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === "manual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>المبلغ (د.ب)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.000" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>التاريخ</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>المكان / المتجر</label>
              <input value={place} onChange={e => setPlace(e.target.value)} placeholder="مطعم، محل، متجر..." style={inputStyle} />
            </div>
            <div>
              <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>ملاحظة (اختياري)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="تفاصيل إضافية..." style={inputStyle} />
            </div>
          </div>
        )}

        {/* Category - shown in both tabs */}
        {(activeTab === "manual" || smsResult) && (
          <div style={{ marginTop: 16 }}>
            <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 8 }}>التصنيف</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                  background: category === cat.id ? cat.color + "33" : "#0A1628",
                  border: `1px solid ${category === cat.id ? cat.color : "#B8860B22"}`,
                  borderRadius: 20, padding: "6px 14px",
                  color: category === cat.id ? cat.color : "#667788",
                  fontSize: 12, transition: "all 0.2s",
                }}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {(activeTab === "manual" || smsResult) && (
          <button onClick={handleSubmit} style={{
            ...btnGold, width: "100%", padding: 14, fontSize: 15, marginTop: 20,
            background: success ? "linear-gradient(135deg, #52BE80, #27AE60)" : "linear-gradient(135deg, #B8860B, #D4A017)",
            transition: "all 0.3s",
          }}>
            {success ? "✅ تمت الإضافة!" : "➕ إضافة المصروف"}
          </button>
        )}
      </div>
    </div>
  );
}
