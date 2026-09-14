import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Person, CreatePerson, UpdatePerson
from app.database import PersonRow

router = APIRouter(prefix="/people", tags=["people"])


@router.get("", response_model=list[Person])
def get_people(db: Session = Depends(get_db)) -> list[Person]:
    rows = db.query(PersonRow).all()
    return [Person(id=r.id, name=r.name) for r in rows]


@router.post("", response_model=Person, status_code=201)
def create_person(body: CreatePerson, db: Session = Depends(get_db)) -> Person:
    person = PersonRow(id=str(uuid.uuid4()), name=body.name)
    db.add(person)
    db.commit()
    return Person(id=person.id, name=person.name)


@router.put("/{person_id}", response_model=Person)
def update_person(person_id: str, body: UpdatePerson, db: Session = Depends(get_db)) -> Person:
    row = db.query(PersonRow).filter(PersonRow.id == person_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Person not found")
    row.name = body.name
    db.commit()
    return Person(id=row.id, name=row.name)


@router.delete("/{person_id}", status_code=204)
def delete_person(person_id: str, db: Session = Depends(get_db)) -> None:
    row = db.query(PersonRow).filter(PersonRow.id == person_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Person not found")
    db.delete(row)
    db.commit()
