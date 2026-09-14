import { useState } from "react";
import api from "../services";
import type { Group, Person, Expense, SplitType } from "../types";
import { EXPENSE_CATEGORIES } from "../types";

interface Props {
  group: Group;
  people: Person[];
  expense: Expense | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ExpenseForm({ group, people, expense, onClose, onSaved }: Props) {
  const memberPeople = people.filter((p) => group.memberIds.includes(p.id));

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState(expense?.category ?? "food");
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [payerIds, setPayerIds] = useState<string[]>(expense?.payerIds ?? []);
  const [splitType, setSplitType] = useState<SplitType>(expense?.split?.type ?? "equal");
  const [fixedValues, setFixedValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      for (const m of group.memberIds) {
        initial[m] = expense?.split?.values?.[m]?.toString() ?? "";
      }
      return initial;
    }
  );
  const [percentValues, setPercentValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      for (const m of group.memberIds) {
        initial[m] = expense?.split?.values?.[m]?.toString() ?? "";
      }
      return initial;
    }
  );

  const handleSave = async () => {
    if (!description.trim() || !amount || payerIds.length === 0) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    let splitValues: Record<string, number> | undefined;
    if (splitType === "fixed") {
      splitValues = {};
      for (const m of group.memberIds) {
        const v = parseFloat(fixedValues[m] || "0");
        if (isNaN(v)) return;
        splitValues[m] = v;
      }
    } else if (splitType === "percentage") {
      splitValues = {};
      let total = 0;
      for (const m of group.memberIds) {
        const v = parseFloat(percentValues[m] || "0");
        if (isNaN(v)) return;
        splitValues[m] = v;
        total += v;
      }
      if (Math.abs(total - 100) > 0.01) {
        alert("Percentages must sum to 100%");
        return;
      }
    }

    const data = {
      description: description.trim(),
      amount: parsedAmount,
      date,
      category,
      notes: notes.trim(),
      payerIds,
      split: { type: splitType, values: splitValues },
    };

    if (expense) {
      await api.updateExpense(expense.id, data);
    } else {
      await api.createExpense(group.id, data);
    }
    onSaved();
  };

  const togglePayer = (pid: string) => {
    setPayerIds((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{expense ? "Edit Expense" : "Add Expense"}</h2>

        <div className="form-group">
          <label>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <div className="form-group">
          <label>Paid by</label>
          <div className="checkbox-list">
            {memberPeople.map((p) => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={payerIds.includes(p.id)}
                  onChange={() => togglePayer(p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Split type</label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value as SplitType)}
          >
            <option value="equal">Equal</option>
            <option value="fixed">Fixed amounts</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>

        {splitType === "fixed" && (
          <div className="split-config">
            {memberPeople.map((p) => (
              <div className="form-group" key={p.id}>
                <label>{p.name}</label>
                <input
                  type="number"
                  value={fixedValues[p.id] || ""}
                  onChange={(e) =>
                    setFixedValues((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        )}

        {splitType === "percentage" && (
          <div className="split-config">
            {memberPeople.map((p) => (
              <div className="form-group" key={p.id}>
                <label>{p.name} (%)</label>
                <input
                  type="number"
                  value={percentValues[p.id] || ""}
                  onChange={(e) =>
                    setPercentValues((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {expense ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
