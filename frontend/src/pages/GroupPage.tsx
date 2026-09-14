import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services";
import type { Group, Person, Expense, Balance, Settlement } from "../types";
import ExpenseForm from "../components/ExpenseForm";
import SettlementForm from "../components/SettlementForm";

type Tab = "expenses" | "balances" | "settlements" | "members";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [tab, setTab] = useState<Tab>("expenses");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [g, allPeople, exp, bal, sett] = await Promise.all([
      api.getGroup(id),
      api.getPeople(),
      api.getExpenses(id),
      api.getBalances(id),
      api.getSettlements(id),
    ]);
    setGroup(g);
    setPeople(allPeople);
    setExpenses(exp);
    setBalances(bal);
    setSettlements(sett);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const personName = (pid: string) =>
    people.find((p) => p.id === pid)?.name ?? "Unknown";

  const memberName = (pid: string) => {
    if (!group) return "Unknown";
    const m = group.memberIds.find((mid) => mid === pid);
    return m ? personName(pid) : "Unknown";
  };

  const handleDeleteExpense = async (eid: string) => {
    if (!confirm("Delete this expense?")) return;
    await api.deleteExpense(eid);
    load();
  };

  const handleDeleteSettlement = async (sid: string) => {
    if (!confirm("Delete this settlement?")) return;
    await api.deleteSettlement(sid);
    load();
  };

  const handleAddPerson = async () => {
    const name = prompt("Enter person name:");
    if (!name?.trim()) return;
    const p = await api.createPerson(name.trim());
    if (group) {
      await api.addGroupMember(group.id, p.id);
    }
    load();
  };

  const handleRemoveMember = async (pid: string) => {
    if (!group) return;
    if (!confirm(`Remove this person from ${group.name}?`)) return;
    await api.removeGroupMember(group.id, pid);
    load();
  };

  if (!group) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{group.name}</h1>
      </div>

      <div className="tabs">
        {(["expenses", "balances", "settlements", "members"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "expenses" && (
        <div>
          <div className="card-header">
            <h2>Expenses</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingExpense(null);
                setShowExpenseForm(true);
              }}
            >
              + Add Expense
            </button>
          </div>
          {expenses.length === 0 ? (
            <div className="empty-state card">
              <p>No expenses yet.</p>
            </div>
          ) : (
            <div className="table-wrapper card">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Paid by</th>
                    <th>Split</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td>
                        {e.description}
                        {e.notes && (
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {e.notes}
                          </div>
                        )}
                      </td>
                      <td>{e.amount.toLocaleString()}</td>
                      <td>{e.payerIds.map(personName).join(", ")}</td>
                      <td>
                        <span className="badge">{e.split.type}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setEditingExpense(e);
                            setShowExpenseForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteExpense(e.id)}
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "balances" && (
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Pairwise Balances</h2>
          {balances.length === 0 ? (
            <div className="empty-state">
              <p>No outstanding balances.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b, i) => (
                    <tr key={i}>
                      <td>{memberName(b.fromPersonId)}</td>
                      <td>{memberName(b.toPersonId)}</td>
                      <td className="balance-negative">
                        {b.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "settlements" && (
        <div>
          <div className="card-header">
            <h2>Settlements</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowSettlementForm(true)}
            >
              + Settle Up
            </button>
          </div>
          {settlements.length === 0 ? (
            <div className="empty-state card">
              <p>No settlements yet.</p>
            </div>
          ) : (
            <div className="table-wrapper card">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => (
                    <tr key={s.id}>
                      <td>{s.date}</td>
                      <td>{memberName(s.fromPersonId)}</td>
                      <td>{memberName(s.toPersonId)}</td>
                      <td>{s.amount.toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteSettlement(s.id)}
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "members" && (
        <div className="card">
          <div className="card-header">
            <h2>Members</h2>
            <button className="btn btn-primary btn-sm" onClick={handleAddPerson}>
              + Add Person
            </button>
          </div>
          {group.memberIds.length === 0 ? (
            <div className="empty-state">
              <p>No members in this group.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {group.memberIds.map((pid) => (
                    <tr key={pid}>
                      <td>{personName(pid)}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleRemoveMember(pid)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showExpenseForm && group && (
        <ExpenseForm
          group={group}
          people={people}
          expense={editingExpense}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          onSaved={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
            load();
          }}
        />
      )}

      {showSettlementForm && group && (
        <SettlementForm
          group={group}
          people={people}
          onClose={() => setShowSettlementForm(false)}
          onSaved={() => {
            setShowSettlementForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}
