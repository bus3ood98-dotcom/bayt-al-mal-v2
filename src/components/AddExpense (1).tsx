"use client";
import { useState, useEffect } from "react";
import { CATEGORIES, autoClassify, generateId, Expense } from "@/lib/data";
import { inputStyle, btnGold } from "@/components/ui";

// ── Bank SMS Parser ────────────────────────────────────────
function parseBankSMS(text: string): { amount: number; place: string; placeKnown: boolean } | null {
  const t = text.trim();

  const amountPatterns = [
    /BHD\s*(\d+[\.,]\d+)/i,
    /BD\s*(\d+[\.,]\d+)/i,
    /(\d+[\.,]\d+)\s*BHD/i,
    /(\d+[\.,]\d+)\s*BD/i,
    /(\d+[\.,]\d+)\s*د\.?ب/i,
    /د\.?ب\s*(\d+[\.,]\d+)/i,
    /مبلغ\s+(\d+[\.,]\d+)/i,
  ];

  let amount = 0;
  for (const p of amountPatterns) {
    const m = t.match(p);
    if (m) { amount = parseFloat(m[1].replace(',', '.')); break; }
  }
  if (!amount) return null;

  const placePatterns = [
    /\bat\s+([A-Za-z0-9&'\-. ]{2,30}?)(?:\s+on|\s+\d|\.|,|$)/i,
    /\bfrom\s+([A-Za-z0-9&'\-. ]{2,30}?)(?:\s+on|\s+\d|\.|,|$)/i,
    /(?:لدى|في متجر|عند)\s+(.{2,20}?)(?:\s+بتاريخ|\s+في|\.|،|$)/,
    /merchant[:\s]+([A-Za-z0-9&'\-. ]{2,30}?)(?:\s+date|\s+\d|\.|$)/i,
    /POS\s*[-–]\s*([A-Za-z0-9&'\-. ]{2,30}?)(?:\s|\.|,|$)/i,
  ];

  for (const p of placePatterns) {
    const m = t.match(p);
    if (m) {
      const place = m[1].trim().replace(/[*#]/g, '').trim();
      if (place.length >= 2) return { amount, place, placeKnown: true };
    }
  }

  // المبلغ موجود بس ما في اسم متجر
  let place = "عملية بنكية";
  if (/standing order/i.test(t)) place = "أمر دائم";
  else if (/transfer/i.test(t)) place = "تحويل";
  else if (/atm/i.test(t)) place = "صراف آلي";
  else if (/purchase/i.test(t)) place = "مشتريات";
  return { amount, place, placeKnown: false };
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
  const [smsResult, setSmsResult] = useState<{ amount: number; place: string; placeKnown: boolean } | null>(null);
  const [smsError, setSmsError] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "sms">("manual");
  const [manualPlace, setManualPlace] = useState("");
  const [placeDone, setPlaceDone] = useState(false);

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
      setSmsError(false);
      if (result.placeKnown) {
        setPlace(result.place);
        setPlaceDone(true);
      } else {
        setPlace(result.place);
        setPlaceDone(false);
        setManualPlace("");
      }
    } else {
      setSmsResult(null);
      setSmsError(true);
      setPlaceDone(false);
    }
  };

  const confirmPlace = () => {
    const p = manualPlace.trim() || place;
    setPlace(p);
    setCategory(autoClassify(p));
    setPlaceDone(true);
  };

  const handleSubmit = () => {
    if (!amount || !place) return;
    onAdd({ id: generateId(), amount: parseFloat(amount), place, category, note, date: new Date(date).toISOString() });
    setAmount(""); setPlace(""); setNote(""); setSmsText(""); setSmsResult(null); setPlaceDone(false); setManualPlace("");
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

  const showForm = activeTab === "manual" || (smsResult !== null && placeDone);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>

      {/* Quick Input */}
      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: "#B8860B", margin: "0 0 8px", fontSize: 15 }}>⚡ إدخال سريع</h3>
        <p style={{ color: "#667788", fontSize: 12, margin: "0 0 12px" }}>مثال: 3.5 - مطعم الوليد</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={quickInput} onChange={e => setQuickInput(e.target.value)} onKeyDown={e => e.key === "Enter" && parseQuick(quickInput)} placeholder="3.5 - مطعم الدوحة" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => parseQuick(quickInput)} style={{ ...btnGold, padding: "0 20px", borderRadius: 12 }}>تحليل</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "linear-gradient(135deg, #0F1C2E, #162236)", border: "1px solid #B8860B33", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", gap: 8, background: "#0A1628", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          <button style={tabStyle(activeTab === "manual")} onClick={() => { setActiveTab("manual"); setSmsResult(null); setPlaceDone(false); }}>✏️ إدخال يدوي</button>
          <button style={tabStyle(activeTab === "sms")} onClick={() => setActiveTab("sms")}>📱 رسالة البنك</button>
        </div>

        {/* SMS Tab */}
        {activeTab === "sms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ color: "#8899AA", fontSize: 12, display: "block", marginBottom: 6 }}>الصق نص رسالة البنك هنا</label>
              <textarea
                value={smsText}
                onChange={e => { setSmsText(e.target.value); setSmsError(false); setSmsResult(null); setPlaceDone(false); }}
                placeholder="Your account has been debited with BHD5.000 at Al-Reef Bakery..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            <button onClick={handleParseSMS} style={{ ...btnGold, width: "100%", padding: 12 }}>
              🔍 تحليل الرسالة
            </button>

            {/* نجح التحليل */}
            {smsResult && (
              <div style={{ background: "#52BE8022", border: "1px solid #52BE8044", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#52BE80", fontFamily: "Cairo, sans-serif", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>
                  ✅ قرأت المبلغ: {smsResult.amount.toFixed(3)} د.ب
                </div>

                {/* إذا المكان معروف */}
                {smsResult.placeKnown && (
                  <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 13 }}>
                    📍 المكان: <span style={{ color: "#B8860B", fontWeight: 700 }}>{smsResult.place}</span>
                  </div>
                )}

                {/* إذا المكان مجهول — اسأل */}
                {!smsResult.placeKnown && !placeDone && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: "#F7DC6F", fontFamily: "Cairo, sans-serif", fontSize: 13, marginBottom: 10 }}>
                      ⚠️ ما قدرت أحدد المكان. وين كانت هذه العملية؟
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={manualPlace}
                        onChange={e => setManualPlace(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && confirmPlace()}
                        placeholder="مثال: مطعم، صيدلية، محطة وقود..."
                        style={{ ...inputStyle, flex: 1, padding: "10px 14px" }}
                        autoFocus
                      />
                      <button onClick={confirmPlace} style={{ ...btnGold, padding: "0 16px", borderRadius: 12, whiteSpace: "nowrap" }}>
                        تأكيد
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {["تحويل بنكي", "فاتورة", "أمر دائم", "صراف آلي", "أخرى"].map(s => (
                        <button key={s} onClick={() => { setManualPlace(s); }} style={{
                          background: manualPlace === s ? "#B8860B33" : "#0A1628",
                          border: `1px solid ${manualPlace === s ? "#B8860B" : "#B8860B22"}`,
                          borderRadius: 20, padding: "5px 12px",
                          color: manualPlace === s ? "#B8860B" : "#667788",
                          fontSize: 12, cursor: "pointer",
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {placeDone && (
                  <div style={{ color: "#F5F0E8", fontFamily: "Cairo, sans-serif", fontSize: 13, marginTop: 4 }}>
                    📍 المكان: <span style={{ color: "#B8860B", fontWeight: 700 }}>{place}</span>
                  </div>
                )}
              </div>
            )}

            {/* فشل التحليل */}
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

        {/* التصنيف والزر */}
        {showForm && (
          <>
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
            <button onClick={handleSubmit} style={{
              ...btnGold, width: "100%", padding: 14, fontSize: 15, marginTop: 20,
              background: success ? "linear-gradient(135deg, #52BE80, #27AE60)" : "linear-gradient(135deg, #B8860B, #D4A017)",
              transition: "all 0.3s",
            }}>
              {success ? "✅ تمت الإضافة!" : "➕ إضافة المصروف"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
