import { useState } from "react";
import api from "../services";
import type { Group, Person } from "../types";

interface Props {
  group: Group;
  people: Person[];
  onClose: () => void;
  onSaved: () => void;
}

export default function SettlementForm({ group, people, onClose, onSaved }: Props) {
  const memberPeople = people.filter((p) => group.memberIds.includes(p.id));

  const [fromPersonId, setFromPersonId] = useState(memberPeople[0]?.id ?? "");
  const [toPersonId, setToPersonId] = useState(memberPeople[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = async () => {
    if (!fromPersonId || !toPersonId || fromPersonId === toPersonId) {
      alert("Select two different people");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    await api.createSettlement(group.id, {
      fromPersonId,
      toPersonId,
      amount: parsedAmount,
      date,
    });
    onSaved();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settle Up</h2>

        <div className="form-group">
          <label>From (who paid)</label>
          <select value={fromPersonId} onChange={(e) => setFromPersonId(e.target.value)}>
            {memberPeople.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>To (who received)</label>
          <select value={toPersonId} onChange={(e) => setToPersonId(e.target.value)}>
            {memberPeople.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
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

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Record Settlement
          </button>
        </div>
      </div>
    </div>
  );
}
