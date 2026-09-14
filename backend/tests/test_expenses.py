class TestExpenses:
    def _setup_group(self, client) -> tuple[str, str]:
        p1 = client.post("/api/people", json={"name": "Alice"}).json()["id"]
        p2 = client.post("/api/people", json={"name": "Bob"}).json()["id"]
        group = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [p1, p2]}
        ).json()
        return group["id"], p1

    def _expense_payload(self, payer_id: str) -> dict:
        return {
            "description": "Dinner",
            "amount": 50.0,
            "date": "2025-01-15",
            "category": "food",
            "notes": "Group dinner",
            "payerIds": [payer_id],
            "split": {"type": "equal"},
        }

    def test_get_expenses_empty(self, client):
        group_id, _ = self._setup_group(client)
        resp = client.get(f"/api/groups/{group_id}/expenses")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_expense(self, client):
        group_id, payer_id = self._setup_group(client)
        resp = client.post(
            f"/api/groups/{group_id}/expenses",
            json=self._expense_payload(payer_id),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["description"] == "Dinner"
        assert data["amount"] == 50.0
        assert data["groupId"] == group_id

    def test_get_expenses_after_create(self, client):
        group_id, payer_id = self._setup_group(client)
        client.post(
            f"/api/groups/{group_id}/expenses",
            json=self._expense_payload(payer_id),
        )
        resp = client.get(f"/api/groups/{group_id}/expenses")
        assert len(resp.json()) == 1

    def test_create_expense_group_not_found(self, client):
        resp = client.post(
            "/api/groups/nonexistent/expenses",
            json={
                "description": "X",
                "amount": 10,
                "date": "2025-01-01",
                "category": "other",
                "notes": "",
                "payerIds": ["x"],
                "split": {"type": "equal"},
            },
        )
        assert resp.status_code == 400

    def test_get_expense(self, client):
        group_id, payer_id = self._setup_group(client)
        create = client.post(
            f"/api/groups/{group_id}/expenses",
            json=self._expense_payload(payer_id),
        )
        expense_id = create.json()["id"]
        resp = client.get(f"/api/expenses/{expense_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == expense_id

    def test_get_expense_not_found(self, client):
        resp = client.get("/api/expenses/nonexistent")
        assert resp.status_code == 404

    def test_update_expense(self, client):
        group_id, payer_id = self._setup_group(client)
        create = client.post(
            f"/api/groups/{group_id}/expenses",
            json=self._expense_payload(payer_id),
        )
        expense_id = create.json()["id"]
        payload = self._expense_payload(payer_id)
        payload["description"] = "Lunch"
        resp = client.put(f"/api/expenses/{expense_id}", json=payload)
        assert resp.status_code == 200
        assert resp.json()["description"] == "Lunch"

    def test_update_expense_not_found(self, client):
        resp = client.put(
            "/api/expenses/nonexistent",
            json={
                "description": "X",
                "amount": 10,
                "date": "2025-01-01",
                "category": "other",
                "notes": "",
                "payerIds": ["x"],
                "split": {"type": "equal"},
            },
        )
        assert resp.status_code == 404

    def test_delete_expense(self, client):
        group_id, payer_id = self._setup_group(client)
        create = client.post(
            f"/api/groups/{group_id}/expenses",
            json=self._expense_payload(payer_id),
        )
        expense_id = create.json()["id"]
        resp = client.delete(f"/api/expenses/{expense_id}")
        assert resp.status_code == 204
        assert client.get(f"/api/groups/{group_id}/expenses").json() == []

    def test_delete_expense_not_found(self, client):
        resp = client.delete("/api/expenses/nonexistent")
        assert resp.status_code == 404
