import type {
  Person,
  Group,
  Expense,
  Settlement,
  Balance,
} from "../types";
import type { ExpenseSplitterAPI } from "./api";

let nextId = 1;
function genId(): string {
  return String(nextId++);
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class MockAPI implements ExpenseSplitterAPI {
  private people: Person[] = [];
  private groups: Group[] = [];
  private expenses: Expense[] = [];
  private settlements: Settlement[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const alice = this.createPersonSync("Alice");
    const bob = this.createPersonSync("Bob");
    const charlie = this.createPersonSync("Charlie");

    const trip = this.createGroupSync("Trip to Japan", [alice.id, bob.id, charlie.id]);
    const apt = this.createGroupSync("Apartment 4B", [alice.id, bob.id]);

    this.createExpenseSync(trip.id, {
      description: "Dinner at ramen shop",
      amount: 4500,
      date: "2026-09-10",
      category: "food",
      notes: "",
      payerIds: [alice.id],
      split: { type: "equal" },
    });

    this.createExpenseSync(trip.id, {
      description: "Train tickets",
      amount: 12000,
      date: "2026-09-11",
      category: "transport",
      notes: "Kyoto day trip",
      payerIds: [bob.id, charlie.id],
      split: { type: "equal" },
    });

    this.createExpenseSync(apt.id, {
      description: "Electricity bill",
      amount: 120,
      date: "2026-09-01",
      category: "utilities",
      notes: "",
      payerIds: [alice.id],
      split: { type: "fixed", values: { [alice.id]: 60, [bob.id]: 60 } },
    });
  }

  private createPersonSync(name: string): Person {
    const p: Person = { id: genId(), name };
    this.people.push(p);
    return p;
  }

  private createGroupSync(name: string, memberIds: string[]): Group {
    const g: Group = { id: genId(), name, memberIds: [...memberIds] };
    this.groups.push(g);
    return g;
  }

  private createExpenseSync(
    groupId: string,
    data: Omit<Expense, "id" | "groupId">
  ): Expense {
    const e: Expense = { id: genId(), groupId, ...data };
    this.expenses.push(e);
    return e;
  }

  // --- People ---

  async getPeople(): Promise<Person[]> {
    return clone(this.people);
  }

  async createPerson(name: string): Promise<Person> {
    const p = this.createPersonSync(name);
    return clone(p);
  }

  async updatePerson(id: string, name: string): Promise<Person> {
    const p = this.people.find((x) => x.id === id);
    if (!p) throw new Error("Person not found");
    p.name = name;
    return clone(p);
  }

  async deletePerson(id: string): Promise<void> {
    this.people = this.people.filter((x) => x.id !== id);
    for (const g of this.groups) {
      g.memberIds = g.memberIds.filter((m) => m !== id);
    }
    for (const e of this.expenses) {
      e.payerIds = e.payerIds.filter((p) => p !== id);
    }
    this.settlements = this.settlements.filter(
      (s) => s.fromPersonId !== id && s.toPersonId !== id
    );
  }

  // --- Groups ---

  async getGroups(): Promise<Group[]> {
    return clone(this.groups);
  }

  async getGroup(id: string): Promise<Group> {
    const g = this.groups.find((x) => x.id === id);
    if (!g) throw new Error("Group not found");
    return clone(g);
  }

  async createGroup(
    name: string,
    memberIds: string[]
  ): Promise<Group> {
    const g = this.createGroupSync(name, memberIds);
    return clone(g);
  }

  async updateGroup(
    id: string,
    name: string,
    memberIds: string[]
  ): Promise<Group> {
    const g = this.groups.find((x) => x.id === id);
    if (!g) throw new Error("Group not found");
    g.name = name;
    g.memberIds = [...memberIds];
    return clone(g);
  }

  async deleteGroup(id: string): Promise<void> {
    this.groups = this.groups.filter((x) => x.id !== id);
    this.expenses = this.expenses.filter((e) => e.groupId !== id);
    this.settlements = this.settlements.filter((s) => s.groupId !== id);
  }

  async addGroupMember(
    groupId: string,
    personId: string
  ): Promise<Group> {
    const g = this.groups.find((x) => x.id === groupId);
    if (!g) throw new Error("Group not found");
    if (!g.memberIds.includes(personId)) {
      g.memberIds.push(personId);
    }
    return clone(g);
  }

  async removeGroupMember(
    groupId: string,
    personId: string
  ): Promise<Group> {
    const g = this.groups.find((x) => x.id === groupId);
    if (!g) throw new Error("Group not found");
    g.memberIds = g.memberIds.filter((m) => m !== personId);
    return clone(g);
  }

  // --- Expenses ---

  async getExpenses(groupId: string): Promise<Expense[]> {
    return clone(this.expenses.filter((e) => e.groupId === groupId));
  }

  async getExpense(id: string): Promise<Expense> {
    const e = this.expenses.find((x) => x.id === id);
    if (!e) throw new Error("Expense not found");
    return clone(e);
  }

  async createExpense(
    groupId: string,
    data: Omit<Expense, "id" | "groupId">
  ): Promise<Expense> {
    const e = this.createExpenseSync(groupId, data);
    return clone(e);
  }

  async updateExpense(
    id: string,
    data: Omit<Expense, "id" | "groupId">
  ): Promise<Expense> {
    const e = this.expenses.find((x) => x.id === id);
    if (!e) throw new Error("Expense not found");
    Object.assign(e, data);
    return clone(e);
  }

  async deleteExpense(id: string): Promise<void> {
    this.expenses = this.expenses.filter((x) => x.id !== id);
  }

  // --- Settlements ---

  async getSettlements(groupId: string): Promise<Settlement[]> {
    return clone(this.settlements.filter((s) => s.groupId === groupId));
  }

  async createSettlement(
    groupId: string,
    data: Omit<Settlement, "id" | "groupId">
  ): Promise<Settlement> {
    const s: Settlement = { id: genId(), groupId, ...data };
    this.settlements.push(s);
    return clone(s);
  }

  async deleteSettlement(id: string): Promise<void> {
    this.settlements = this.settlements.filter((x) => x.id !== id);
  }

  // --- Balances ---

  async getBalances(groupId: string): Promise<Balance[]> {
    const debts = new Map<string, number>();

    const key = (a: string, b: string) => `${a}->${b}`;

    const addDebt = (from: string, to: string, amount: number) => {
      if (from === to || amount === 0) return;
      const k = key(from, to);
      debts.set(k, (debts.get(k) || 0) + amount);
    };

    // Process expenses
    const groupExpenses = this.expenses.filter((e) => e.groupId === groupId);
    for (const exp of groupExpenses) {
      const { payerIds, split, amount } = exp;

      if (split.type === "equal") {
        const share = amount / payerIds.length;
        for (const payer of payerIds) {
          for (const member of this.getGroupMembers(groupId)) {
            if (payer !== member) {
              addDebt(member, payer, share);
            }
          }
        }
      } else if (split.type === "fixed" && split.values) {
        for (const payer of payerIds) {
          for (const [memberId, amt] of Object.entries(split.values)) {
            if (payer !== memberId) {
              addDebt(memberId, payer, amt / payerIds.length);
            }
          }
        }
      } else if (split.type === "percentage" && split.values) {
        for (const payer of payerIds) {
          for (const [memberId, pct] of Object.entries(split.values)) {
            if (payer !== memberId) {
              addDebt(memberId, payer, (amount * pct) / 100 / payerIds.length);
            }
          }
        }
      }
    }

    // Process settlements
    const groupSettlements = this.settlements.filter(
      (s) => s.groupId === groupId
    );
    for (const s of groupSettlements) {
      addDebt(s.fromPersonId, s.toPersonId, -s.amount);
    }

    // Convert to balances array
    const result: Balance[] = [];
    for (const [k, v] of debts) {
      const [from, to] = k.split("->");
      const rounded = Math.round(v * 100) / 100;
      if (rounded > 0) {
        result.push({ fromPersonId: from, toPersonId: to, amount: rounded });
      }
    }

    return result;
  }

  private getGroupMembers(groupId: string): string[] {
    const g = this.groups.find((x) => x.id === groupId);
    return g ? g.memberIds : [];
  }
}
