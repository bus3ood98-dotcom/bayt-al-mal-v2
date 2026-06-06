export const CATEGORIES = [
  { id: 1,  name: "مطاعم",      nameEn: "Restaurants",    icon: "🍽️", color: "#E8A87C" },
  { id: 2,  name: "قهوة",       nameEn: "Coffee",         icon: "☕",  color: "#C8956C" },
  { id: 3,  name: "تسوق",       nameEn: "Shopping",       icon: "🛍️", color: "#85C1E9" },
  { id: 4,  name: "ملابس",      nameEn: "Clothing",       icon: "👔",  color: "#A8D8EA" },
  { id: 5,  name: "وقود",       nameEn: "Fuel",           icon: "⛽",  color: "#F1948A" },
  { id: 6,  name: "مواصلات",   nameEn: "Transport",      icon: "🚗",  color: "#F7DC6F" },
  { id: 7,  name: "منزل",       nameEn: "Home",           icon: "🏠",  color: "#82E0AA" },
  { id: 8,  name: "اتصالات",   nameEn: "Telecom",        icon: "📱",  color: "#BB8FCE" },
  { id: 9,  name: "ترفيه",      nameEn: "Entertainment",  icon: "🎮",  color: "#F0B27A" },
  { id: 10, name: "صدقات",     nameEn: "Charity",        icon: "🤲",  color: "#76D7C4" },
  { id: 11, name: "كفالة يتيم", nameEn: "Orphan Sponsor", icon: "💚",  color: "#52BE80" },
  { id: 12, name: "سفر",        nameEn: "Travel",         icon: "✈️",  color: "#5DADE2" },
  { id: 13, name: "تعليم",      nameEn: "Education",      icon: "📚",  color: "#F8C471" },
  { id: 14, name: "صحة",        nameEn: "Health",         icon: "🏥",  color: "#EC7063" },
  { id: 15, name: "أخرى",       nameEn: "Other",          icon: "📌",  color: "#AAB7B8" },
  { id: 16, name: "ادخار",      nameEn: "Savings",        icon: "💰",  color: "#52BE80" },
  { id: 17, name: "استثمار",   nameEn: "Investment",     icon: "📈",  color: "#5DADE2" },
];

export const GOAL_ICONS = ["🕋","🕌","🚗","💍","💼","🏡","📱","✈️","🎓","💰","🎯","🏖️"];

export const autoClassify = (text: string): number => {
  const t = text.toLowerCase();
  if (/مطعم|برجر|بيتزا|شاورما|كنتاكي|ماكدونالدز|rest|food|lunch|dinner|talabat/.test(t)) return 1;
  if (/قهوة|كافيه|coffee|cafe|cappuccino/.test(t)) return 2;
  if (/سوق|تسوق|mall|amazon/.test(t)) return 3;
  if (/ملابس|cloth|fashion/.test(t)) return 4;
  if (/وقود|بنزين|محطة|fuel|petrol|gas/.test(t)) return 5;
  if (/تاكسي|أوبر|uber|careem|مواصلات/.test(t)) return 6;
  if (/إيجار|فاتورة|كهرباء|ماء|rent|electric/.test(t)) return 7;
  if (/اتصال|موبايل|انترنت/.test(t)) return 8;
  if (/سينما|ترفيه|لعب|cinema|game|شاهد/.test(t)) return 9;
  if (/صدقة|تبرع|جمعية|charity/.test(t)) return 10;
  if (/يتيم|كفالة|orphan/.test(t)) return 11;
  if (/سفر|فندق|طيران|hotel|flight|travel/.test(t)) return 12;
  if (/دراسة|مدرسة|جامعة|school|university/.test(t)) return 13;
  if (/صيدلية|دكتور|مستشفى|pharmacy|doctor/.test(t)) return 14;
  if (/ادخار|saving/i.test(t)) return 16;
  if (/استثمار|invest/i.test(t)) return 17;
  return 15;
};

export const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString("ar-BH", {
    day: "numeric", month: "short", year: "numeric",
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export interface Expense {
  id: string;
  amount: number;
  place: string;
  category: number;
  note: string;
  date: string;
}

export interface Salary {
  amount: number;
  payDay: number;
  extraIncome: number;
  extraNote: string;
}

export interface Goal {
  id: string;
  title: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

// Demo data
const today = new Date();
const m = today.getMonth();
const y = today.getFullYear();
const d = today.getDate();

export const DEMO_EXPENSES: Expense[] = [
  { id: "e1",  amount: 8.5,  place: "قهوة البحرين",             category: 2,  date: new Date(y,m,d-0).toISOString(), note: "قهوة الصباح" },
  { id: "e2",  amount: 23,   place: "مطعم الريف",           category: 1,  date: new Date(y,m,d-1).toISOString(), note: "غداء" },
  { id: "e3",  amount: 45,   place: "محطة وقود جيزة",       category: 5,  date: new Date(y,m,d-1).toISOString(), note: "بنزين" },
  { id: "e4",  amount: 120,  place: "محل ملابس",      category: 4,  date: new Date(y,m,d-2).toISOString(), note: "" },
  { id: "e5",  amount: 15,   place: "مطعم البرجر",           category: 1,  date: new Date(y,m,d-2).toISOString(), note: "عشاء" },
  { id: "e6",  amount: 5,    place: "قهوة عدن",             category: 2,  date: new Date(y,m,d-3).toISOString(), note: "" },
  { id: "e7",  amount: 30,   place: "جمعية خيرية",          category: 10, date: new Date(y,m,d-3).toISOString(), note: "صدقة" },
  { id: "e8",  amount: 85,   place: "سوبرماركت",     category: 3,  date: new Date(y,m,d-4).toISOString(), note: "مشتريات البيت" },
  { id: "e9",  amount: 12,   place: "Talabat",              category: 1,  date: new Date(y,m,d-5).toISOString(), note: "" },
  { id: "e10", amount: 18,   place: "نتفليكس + شاهد",       category: 9,  date: new Date(y,m,d-6).toISOString(), note: "اشتراكات" },
  { id: "e11", amount: 7.5,  place: "قهوة الرفاع",       category: 2,  date: new Date(y,m,d-7).toISOString(), note: "" },
  { id: "e12", amount: 35,   place: "محل أزياء",    category: 4,  date: new Date(y,m,d-8).toISOString(), note: "" },
  { id: "e13", amount: 6,    place: "أوبر",                 category: 6,  date: new Date(y,m,d-8).toISOString(), note: "" },
  { id: "e14", amount: 20,   place: "صيدلية البحرين",       category: 14, date: new Date(y,m,d-9).toISOString(), note: "دواء" },
  { id: "e15", amount: 50,   place: "شركة اتصالات",              category: 8,  date: new Date(y,m,d-10).toISOString(), note: "فاتورة الجوال" },
];

export const DEMO_SALARY: Salary = {
  amount: 800, payDay: 24, extraIncome: 0, extraNote: "",
};

export const DEMO_GOALS: Goal[] = [
  { id: "g1", title: "حج", icon: "🕋", targetAmount: 3000, currentAmount: 450, targetDate: new Date(y+1,2,1).toISOString() },
  { id: "g2", title: "سيارة جديدة", icon: "🚗", targetAmount: 8000, currentAmount: 1200, targetDate: new Date(y+2,0,1).toISOString() },
];
