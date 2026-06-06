"use client";
import { CATEGORIES } from "@/lib/data";

export const GoldDivider = () => (
  <div style={{
    height: 1,
    background: "linear-gradient(90deg, transparent, #B8860B44, #B8860B88, #B8860B44, transparent)",
  }} />
);

export const StatCard = ({
  label, value, sub, accent, icon,
}: {
  label: string; value: string; sub?: string; accent?: string; icon: string;
}) => (
  <div style={{
    background: "linear-gradient(135deg, #0F1C2E 0%, #162236 100%)",
    border: "1px solid #B8860B33",
    borderRadius: 16,
    padding: "20px 24px",
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, right: 0, width: 80, height: 80,
      background: `radial-gradient(circle at top right, ${accent || "#B8860B"}22, transparent 70%)`,
    }} />
    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
    <div style={{ color: "#8899AA", fontSize: 12, marginBottom: 4 }}>{label}</div>
    <div style={{ color: accent || "#B8860B", fontSize: 22, fontWeight: 700 }}>{value}</div>
    {sub && <div style={{ color: "#667788", fontSize: 11, marginTop: 4 }}>{sub}</div>}
  </div>
);

export const Badge = ({ catId }: { catId: number }) => {
  const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[14];
  return (
    <span style={{
      background: cat.color + "22",
      color: cat.color,
      border: `1px solid ${cat.color}44`,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 12,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap",
    }}>
      {cat.icon} {cat.name}
    </span>
  );
};

export const ProgressBar = ({
  value, max, color,
}: {
  value: number; max: number; color?: string;
}) => {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  return (
    <div style={{ background: "#0F1C2E", borderRadius: 99, height: 8, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`,
        height: "100%",
        background: `linear-gradient(90deg, ${color || "#B8860B"}, ${color || "#D4A017"})`,
        borderRadius: 99,
        transition: "width 0.6s ease",
      }} />
    </div>
  );
};

export const inputStyle: React.CSSProperties = {
  background: "#0A1628",
  border: "1px solid #B8860B33",
  borderRadius: 12,
  padding: "12px 16px",
  color: "#F5F0E8",
  fontFamily: "Cairo, sans-serif",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

export const btnGold: React.CSSProperties = {
  background: "linear-gradient(135deg, #B8860B, #D4A017)",
  color: "#0A1628",
  border: "none",
  borderRadius: 12,
  padding: "12px 24px",
  fontFamily: "Cairo, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
