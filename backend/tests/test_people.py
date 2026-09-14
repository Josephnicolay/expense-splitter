class TestPeople:
    def test_get_people_empty(self, client):
        resp = client.get("/api/people")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_person(self, client):
        resp = client.post("/api/people", json={"name": "Alice"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Alice"
        assert "id" in data

    def test_get_people_after_create(self, client):
        client.post("/api/people", json={"name": "Alice"})
        client.post("/api/people", json={"name": "Bob"})
        resp = client.get("/api/people")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_update_person(self, client):
        create = client.post("/api/people", json={"name": "Alice"})
        person_id = create.json()["id"]
        resp = client.put(f"/api/people/{person_id}", json={"name": "Alicia"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "Alicia"

    def test_update_person_not_found(self, client):
        resp = client.put("/api/people/nonexistent", json={"name": "X"})
        assert resp.status_code == 404

    def test_delete_person(self, client):
        create = client.post("/api/people", json={"name": "Alice"})
        person_id = create.json()["id"]
        resp = client.delete(f"/api/people/{person_id}")
        assert resp.status_code == 204
        assert client.get("/api/people").json() == []

    def test_delete_person_not_found(self, client):
        resp = client.delete("/api/people/nonexistent")
        assert resp.status_code == 404
