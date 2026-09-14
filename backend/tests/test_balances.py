class TestBalances:
    def _setup_group(self, client) -> tuple[str, str, str]:
        p1 = client.post("/api/people", json={"name": "Alice"}).json()["id"]
        p2 = client.post("/api/people", json={"name": "Bob"}).json()["id"]
        group = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [p1, p2]}
        ).json()
        return group["id"], p1, p2

    def test_get_balances_empty(self, client):
        group_id, _, _ = self._setup_group(client)
        resp = client.get(f"/api/groups/{group_id}/balances")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_balances_after_equal_expense(self, client):
        group_id, p1, p2 = self._setup_group(client)
        client.post(
            f"/api/groups/{group_id}/expenses",
            json={
                "description": "Dinner",
                "amount": 100.0,
                "date": "2025-01-15",
                "category": "food",
                "notes": "",
                "payerIds": [p1],
                "split": {"type": "equal"},
            },
        )
        resp = client.get(f"/api/groups/{group_id}/balances")
        assert resp.status_code == 200
        balances = resp.json()
        assert len(balances) == 1
        assert balances[0]["fromPersonId"] == p2
        assert balances[0]["toPersonId"] == p1
        assert balances[0]["amount"] == 50.0

    def test_balances_after_settlement(self, client):
        group_id, p1, p2 = self._setup_group(client)
        client.post(
            f"/api/groups/{group_id}/expenses",
            json={
                "description": "Dinner",
                "amount": 100.0,
                "date": "2025-01-15",
                "category": "food",
                "notes": "",
                "payerIds": [p1],
                "split": {"type": "equal"},
            },
        )
        client.post(
            f"/api/groups/{group_id}/settlements",
            json={
                "fromPersonId": p2,
                "toPersonId": p1,
                "amount": 50.0,
                "date": "2025-01-20",
            },
        )
        resp = client.get(f"/api/groups/{group_id}/balances")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_balances_group_not_found(self, client):
        resp = client.get("/api/groups/nonexistent/balances")
        assert resp.status_code == 400

    def test_balances_fixed_split(self, client):
        group_id, p1, p2 = self._setup_group(client)
        client.post(
            f"/api/groups/{group_id}/expenses",
            json={
                "description": "Electricity",
                "amount": 120.0,
                "date": "2025-01-01",
                "category": "utilities",
                "notes": "",
                "payerIds": [p1],
                "split": {"type": "fixed", "values": {p1: 60, p2: 60}},
            },
        )
        resp = client.get(f"/api/groups/{group_id}/balances")
        assert resp.status_code == 200
        balances = resp.json()
        assert len(balances) == 1
        assert balances[0]["fromPersonId"] == p2
        assert balances[0]["toPersonId"] == p1
        assert balances[0]["amount"] == 60.0

    def test_balances_multiple_expenses(self, client):
        group_id, p1, p2 = self._setup_group(client)
        client.post(
            f"/api/groups/{group_id}/expenses",
            json={
                "description": "Dinner",
                "amount": 100.0,
                "date": "2025-01-15",
                "category": "food",
                "notes": "",
                "payerIds": [p1],
                "split": {"type": "equal"},
            },
        )
        client.post(
            f"/api/groups/{group_id}/expenses",
            json={
                "description": "Train",
                "amount": 100.0,
                "date": "2025-01-16",
                "category": "transport",
                "notes": "",
                "payerIds": [p2],
                "split": {"type": "equal"},
            },
        )
        resp = client.get(f"/api/groups/{group_id}/balances")
        assert resp.status_code == 200
        assert resp.json() == []
