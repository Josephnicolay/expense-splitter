class TestGroups:
    def _create_person(self, client, name: str) -> str:
        resp = client.post("/api/people", json={"name": name})
        return resp.json()["id"]

    def test_get_groups_empty(self, client):
        resp = client.get("/api/groups")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_group(self, client):
        pid = self._create_person(client, "Alice")
        resp = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid]}
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Trip"
        assert data["memberIds"] == [pid]

    def test_get_group(self, client):
        pid = self._create_person(client, "Alice")
        create = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid]}
        )
        group_id = create.json()["id"]
        resp = client.get(f"/api/groups/{group_id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Trip"

    def test_get_group_not_found(self, client):
        resp = client.get("/api/groups/nonexistent")
        assert resp.status_code == 404

    def test_update_group(self, client):
        pid = self._create_person(client, "Alice")
        pid2 = self._create_person(client, "Bob")
        create = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid]}
        )
        group_id = create.json()["id"]
        resp = client.put(
            f"/api/groups/{group_id}",
            json={"name": "Vacation", "memberIds": [pid, pid2]},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Vacation"
        assert len(resp.json()["memberIds"]) == 2

    def test_update_group_not_found(self, client):
        resp = client.put(
            "/api/groups/nonexistent",
            json={"name": "X", "memberIds": []},
        )
        assert resp.status_code == 404

    def test_delete_group(self, client):
        pid = self._create_person(client, "Alice")
        create = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid]}
        )
        group_id = create.json()["id"]
        resp = client.delete(f"/api/groups/{group_id}")
        assert resp.status_code == 204
        assert client.get("/api/groups").json() == []

    def test_delete_group_not_found(self, client):
        resp = client.delete("/api/groups/nonexistent")
        assert resp.status_code == 404

    def test_add_group_member(self, client):
        pid = self._create_person(client, "Alice")
        pid2 = self._create_person(client, "Bob")
        create = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid]}
        )
        group_id = create.json()["id"]
        resp = client.put(f"/api/groups/{group_id}/members/{pid2}")
        assert resp.status_code == 200
        assert pid2 in resp.json()["memberIds"]

    def test_add_group_member_not_found_group(self, client):
        pid = self._create_person(client, "Alice")
        resp = client.put(f"/api/groups/nonexistent/members/{pid}")
        assert resp.status_code == 404

    def test_add_group_member_not_found_person(self, client):
        pid = self._create_person(client, "Alice")
        create = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid]}
        )
        group_id = create.json()["id"]
        resp = client.put(f"/api/groups/{group_id}/members/nonexistent")
        assert resp.status_code == 404

    def test_remove_group_member(self, client):
        pid = self._create_person(client, "Alice")
        pid2 = self._create_person(client, "Bob")
        create = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid, pid2]}
        )
        group_id = create.json()["id"]
        resp = client.delete(f"/api/groups/{group_id}/members/{pid2}")
        assert resp.status_code == 200
        assert pid2 not in resp.json()["memberIds"]

    def test_remove_group_member_not_in_group(self, client):
        pid = self._create_person(client, "Alice")
        pid2 = self._create_person(client, "Bob")
        create = client.post(
            "/api/groups", json={"name": "Trip", "memberIds": [pid]}
        )
        group_id = create.json()["id"]
        resp = client.delete(f"/api/groups/{group_id}/members/{pid2}")
        assert resp.status_code == 404
