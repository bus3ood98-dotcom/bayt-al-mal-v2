import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkryiqwtmtdsnxrzllyj.supabase.co';
const supabaseKey = 'sb_publishable_nNLzpBPJC1yPxC32x8_qoA_S-Fq8no9';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Types ──────────────────────────────────────────────────
export interface DBExpense {
  id: string;
  amount: number;
  place: string;
  category: number;
  note: string;
  date: string;
  created_at?: string;
}

export interface DBSalary {
  id?: string;
  amount: number;
  pay_day: number;
  extra_income: number;
  extra_note: string;
}

export interface DBGoal {
  id: string;
  title: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

// ── Expenses ───────────────────────────────────────────────
export async function fetchExpenses(): Promise<DBExpense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function insertExpense(exp: DBExpense) {
  const { error } = await supabase.from('expenses').insert(exp);
  if (error) console.error(error);
}

export async function updateExpense(id: string, data: Partial<DBExpense>) {
  const { error } = await supabase.from('expenses').update(data).eq('id', id);
  if (error) console.error(error);
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) console.error(error);
}

// ── Salary ─────────────────────────────────────────────────
export async function fetchSalary(): Promise<DBSalary | null> {
  const { data, error } = await supabase
    .from('salary')
    .select('*')
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function upsertSalary(s: DBSalary) {
  const existing = await fetchSalary();
  if (existing?.id) {
    await supabase.from('salary').update(s).eq('id', existing.id);
  } else {
    await supabase.from('salary').insert(s);
  }
}

// ── Goals ──────────────────────────────────────────────────
export async function fetchGoals(): Promise<DBGoal[]> {
  const { data, error } = await supabase.from('goals').select('*');
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function insertGoal(g: DBGoal) {
  const { error } = await supabase.from('goals').insert(g);
  if (error) console.error(error);
}

export async function updateGoal(id: string, data: Partial<DBGoal>) {
  const { error } = await supabase.from('goals').update(data).eq('id', id);
  if (error) console.error(error);
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) console.error(error);
}

// ── Savings Accounts ───────────────────────────────────────
export interface DBSavingsAccount {
  id: string;
  name: string;
  icon: string;
  amount: number;
  note: string;
  created_at?: string;
}

export async function fetchSavings(): Promise<DBSavingsAccount[]> {
  try {
    const { data, error } = await supabase.from('savings').select('*').order('created_at', { ascending: true });
    if (error) { console.error('fetchSavings error:', error); return []; }
    return data || [];
  } catch (e) {
    console.error('fetchSavings exception:', e);
    return [];
  }
}

export async function insertSaving(s: DBSavingsAccount) {
  const { error } = await supabase.from('savings').insert(s);
  if (error) console.error(error);
}

export async function updateSaving(id: string, data: Partial<DBSavingsAccount>) {
  const { error } = await supabase.from('savings').update(data).eq('id', id);
  if (error) console.error(error);
}

export async function deleteSaving(id: string) {
  const { error } = await supabase.from('savings').delete().eq('id', id);
  if (error) console.error(error);
}

// ── Investments ────────────────────────────────────────────
export interface DBInvestment {
  id: string;
  name: string;
  icon: string;
  amount: number;
  note: string;
  created_at?: string;
}

export async function fetchInvestments(): Promise<DBInvestment[]> {
  try {
    const { data, error } = await supabase.from('investments').select('*').order('created_at', { ascending: true });
    if (error) { console.error('fetchInvestments error:', error); return []; }
    return data || [];
  } catch (e) {
    console.error('fetchInvestments exception:', e);
    return [];
  }
}

export async function insertInvestment(i: DBInvestment) {
  const { error } = await supabase.from('investments').insert(i);
  if (error) console.error(error);
}

export async function updateInvestment(id: string, data: Partial<DBInvestment>) {
  const { error } = await supabase.from('investments').update(data).eq('id', id);
  if (error) console.error(error);
}

export async function deleteInvestment(id: string) {
  const { error } = await supabase.from('investments').delete().eq('id', id);
  if (error) console.error(error);
}

// ── Extra Income ───────────────────────────────────────────
export interface DBExtraIncome {
  id: string;
  amount: number;
  source: string;
  date: string;
  created_at?: string;
}

export async function fetchExtraIncome(): Promise<DBExtraIncome[]> {
  try {
    const { data, error } = await supabase.from('extra_income').select('*').order('date', { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
  } catch (e) { return []; }
}

export async function insertExtraIncome(i: DBExtraIncome) {
  const { error } = await supabase.from('extra_income').insert(i);
  if (error) console.error(error);
}

export async function deleteExtraIncome(id: string) {
  const { error } = await supabase.from('extra_income').delete().eq('id', id);
  if (error) console.error(error);
}
