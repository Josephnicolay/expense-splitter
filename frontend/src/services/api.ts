import type { Person, Group, Expense, Settlement, Balance } from "../types";

export interface ExpenseSplitterAPI {
  // People (shared pool)
  getPeople(): Promise<Person[]>;
  createPerson(name: string): Promise<Person>;
  updatePerson(id: string, name: string): Promise<Person>;
  deletePerson(id: string): Promise<void>;

  // Groups
  getGroups(): Promise<Group[]>;
  getGroup(id: string): Promise<Group>;
  createGroup(name: string, memberIds: string[]): Promise<Group>;
  updateGroup(id: string, name: string, memberIds: string[]): Promise<Group>;
  deleteGroup(id: string): Promise<void>;

  // Group members
  addGroupMember(groupId: string, personId: string): Promise<Group>;
  removeGroupMember(groupId: string, personId: string): Promise<Group>;

  // Expenses
  getExpenses(groupId: string): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense>;
  createExpense(
    groupId: string,
    expense: Omit<Expense, "id" | "groupId">
  ): Promise<Expense>;
  updateExpense(
    id: string,
    expense: Omit<Expense, "id" | "groupId">
  ): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  // Settlements
  getSettlements(groupId: string): Promise<Settlement[]>;
  createSettlement(
    groupId: string,
    settlement: Omit<Settlement, "id" | "groupId">
  ): Promise<Settlement>;
  deleteSettlement(id: string): Promise<void>;

  // Balances
  getBalances(groupId: string): Promise<Balance[]>;
}
