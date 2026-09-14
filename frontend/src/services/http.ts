import type {
  Person,
  Group,
  Expense,
  Settlement,
  Balance,
} from "../types";
import type { ExpenseSplitterAPI } from "./api";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export class HttpAPI implements ExpenseSplitterAPI {
  // --- People ---

  async getPeople(): Promise<Person[]> {
    return request<Person[]>("/api/people");
  }

  async createPerson(name: string): Promise<Person> {
    return request<Person>("/api/people", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async updatePerson(id: string, name: string): Promise<Person> {
    return request<Person>(`/api/people/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }

  async deletePerson(id: string): Promise<void> {
    await request(`/api/people/${id}`, { method: "DELETE" });
  }

  // --- Groups ---

  async getGroups(): Promise<Group[]> {
    return request<Group[]>("/api/groups");
  }

  async getGroup(id: string): Promise<Group> {
    return request<Group>(`/api/groups/${id}`);
  }

  async createGroup(name: string, memberIds: string[]): Promise<Group> {
    return request<Group>("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name, memberIds }),
    });
  }

  async updateGroup(
    id: string,
    name: string,
    memberIds: string[]
  ): Promise<Group> {
    return request<Group>(`/api/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, memberIds }),
    });
  }

  async deleteGroup(id: string): Promise<void> {
    await request(`/api/groups/${id}`, { method: "DELETE" });
  }

  // --- Group members ---

  async addGroupMember(groupId: string, personId: string): Promise<Group> {
    return request<Group>(`/api/groups/${groupId}/members/${personId}`, {
      method: "PUT",
    });
  }

  async removeGroupMember(groupId: string, personId: string): Promise<Group> {
    return request<Group>(`/api/groups/${groupId}/members/${personId}`, {
      method: "DELETE",
    });
  }

  // --- Expenses ---

  async getExpenses(groupId: string): Promise<Expense[]> {
    return request<Expense[]>(`/api/groups/${groupId}/expenses`);
  }

  async getExpense(id: string): Promise<Expense> {
    return request<Expense>(`/api/expenses/${id}`);
  }

  async createExpense(
    groupId: string,
    data: Omit<Expense, "id" | "groupId">
  ): Promise<Expense> {
    return request<Expense>(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExpense(
    id: string,
    data: Omit<Expense, "id" | "groupId">
  ): Promise<Expense> {
    return request<Expense>(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string): Promise<void> {
    await request(`/api/expenses/${id}`, { method: "DELETE" });
  }

  // --- Settlements ---

  async getSettlements(groupId: string): Promise<Settlement[]> {
    return request<Settlement[]>(`/api/groups/${groupId}/settlements`);
  }

  async createSettlement(
    groupId: string,
    data: Omit<Settlement, "id" | "groupId">
  ): Promise<Settlement> {
    return request<Settlement>(`/api/groups/${groupId}/settlements`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteSettlement(id: string): Promise<void> {
    await request(`/api/settlements/${id}`, { method: "DELETE" });
  }

  // --- Balances ---

  async getBalances(groupId: string): Promise<Balance[]> {
    return request<Balance[]>(`/api/groups/${groupId}/balances`);
  }
}
