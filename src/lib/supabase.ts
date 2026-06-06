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
