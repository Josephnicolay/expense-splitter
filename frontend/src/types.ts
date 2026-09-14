export interface Person {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
}

export type SplitType = "equal" | "fixed" | "percentage";

export interface SplitConfig {
  type: SplitType;
  values?: Record<string, number>; // memberId -> amount or percentage
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  payerIds: string[];
  split: SplitConfig;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromPersonId: string;
  toPersonId: string;
  amount: number;
  date: string;
}

export interface Balance {
  fromPersonId: string;
  toPersonId: string;
  amount: number;
}

export type ExpenseCategory =
  | "food"
  | "transport"
  | "lodging"
  | "entertainment"
  | "utilities"
  | "other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "lodging",
  "entertainment",
  "utilities",
  "other",
];
