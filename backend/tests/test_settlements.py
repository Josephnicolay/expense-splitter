class TestSettlements:
    def _setup_group(self, client) -> tuple[str, str, str]:
        p1 = client.post("/api/people", json={"name": "Alice"}).json()["id"]
        p2 = client.post("/api/people", json={"name": "Bob"}).json()["id"]
        group = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [p1, p2]}
        ).json()
        return group["id"], p1, p2

    def _settlement_payload(self, from_id: str, to_id: str) -> dict:
        return {
            "fromPersonId": from_id,
            "toPersonId": to_id,
            "amount": 25.0,
            "date": "2025-01-20",
        }

    def test_get_settlements_empty(self, client):
        group_id, _, _ = self._setup_group(client)
        resp = client.get(f"/api/groups/{group_id}/settlements")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_settlement(self, client):
        group_id, p1, p2 = self._setup_group(client)
        resp = client.post(
            f"/api/groups/{group_id}/settlements",
            json=self._settlement_payload(p1, p2),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["fromPersonId"] == p1
        assert data["toPersonId"] == p2
        assert data["amount"] == 25.0

    def test_create_settlement_group_not_found(self, client):
        resp = client.post(
            "/api/groups/nonexistent/settlements",
            json={
                "fromPersonId": "x",
                "toPersonId": "y",
                "amount": 10,
                "date": "2025-01-01",
            },
        )
        assert resp.status_code == 400

    def test_delete_settlement(self, client):
        group_id, p1, p2 = self._setup_group(client)
        create = client.post(
            f"/api/groups/{group_id}/settlements",
            json=self._settlement_payload(p1, p2),
        )
        settlement_id = create.json()["id"]
        resp = client.delete(f"/api/settlements/{settlement_id}")
        assert resp.status_code == 204
        assert client.get(f"/api/groups/{group_id}/settlements").json() == []

    def test_delete_settlement_not_found(self, client):
        resp = client.delete("/api/settlements/nonexistent")
        assert resp.status_code == 404
