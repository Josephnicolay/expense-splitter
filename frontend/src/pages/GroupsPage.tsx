import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services";
import type { Group, Person } from "../types";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMembers, setNewMembers] = useState<string[]>([]);

  const load = async () => {
    const [g, p] = await Promise.all([api.getGroups(), api.getPeople()]);
    setGroups(g);
    setPeople(p);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await api.createGroup(newName.trim(), newMembers);
    setNewName("");
    setNewMembers([]);
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this group and all its expenses?")) return;
    await api.deleteGroup(id);
    load();
  };

  const personName = (id: string) =>
    people.find((p) => p.id === id)?.name ?? "Unknown";

  return (
    <div>
      <div className="page-header">
        <h1>Groups</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <p>No groups yet. Create one to get started!</p>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.id} className="card group-card">
            <Link to={`/groups/${g.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
              <h3>{g.name}</h3>
              <p>
                {g.memberIds.length} member{g.memberIds.length !== 1 ? "s" : ""}:{" "}
                {g.memberIds.map(personName).join(", ")}
              </p>
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleDelete(g.id)}
            >
              Delete
            </button>
          </div>
        ))
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Group</h2>
            <div className="form-group">
              <label>Group Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Trip to Japan"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Members</label>
              <div className="checkbox-list">
                {people.map((p) => (
                  <label key={p.id}>
                    <input
                      type="checkbox"
                      checked={newMembers.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewMembers([...newMembers, p.id]);
                        } else {
                          setNewMembers(newMembers.filter((m) => m !== p.id));
                        }
                      }}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
              {people.length === 0 && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                  No people in the pool yet. Add people first from a group page.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreate}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
