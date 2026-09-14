import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, GroupRow, GroupMemberRow, PersonRow
from app.models import Group, CreateGroup, UpdateGroup

router = APIRouter(prefix="/groups", tags=["groups"])


def _group_to_model(row: GroupRow, db: Session) -> Group:
    member_ids = [
        m.person_id
        for m in db.query(GroupMemberRow).filter(GroupMemberRow.group_id == row.id).all()
    ]
    return Group(id=row.id, name=row.name, memberIds=member_ids)


@router.get("", response_model=list[Group])
def get_groups(db: Session = Depends(get_db)) -> list[Group]:
    rows = db.query(GroupRow).all()
    return [_group_to_model(r, db) for r in rows]


@router.post("", response_model=Group, status_code=201)
def create_group(body: CreateGroup, db: Session = Depends(get_db)) -> Group:
    group = GroupRow(id=str(uuid.uuid4()), name=body.name)
    db.add(group)
    db.flush()
    for pid in body.memberIds:
        db.add(GroupMemberRow(group_id=group.id, person_id=pid))
    db.commit()
    return _group_to_model(group, db)


@router.get("/{group_id}", response_model=Group)
def get_group(group_id: str, db: Session = Depends(get_db)) -> Group:
    row = db.query(GroupRow).filter(GroupRow.id == group_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Group not found")
    return _group_to_model(row, db)


@router.put("/{group_id}", response_model=Group)
def update_group(group_id: str, body: UpdateGroup, db: Session = Depends(get_db)) -> Group:
    row = db.query(GroupRow).filter(GroupRow.id == group_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Group not found")
    row.name = body.name
    db.query(GroupMemberRow).filter(GroupMemberRow.group_id == group_id).delete()
    for pid in body.memberIds:
        db.add(GroupMemberRow(group_id=group_id, person_id=pid))
    db.commit()
    return _group_to_model(row, db)


@router.delete("/{group_id}", status_code=204)
def delete_group(group_id: str, db: Session = Depends(get_db)) -> None:
    row = db.query(GroupRow).filter(GroupRow.id == group_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Group not found")
    db.query(GroupMemberRow).filter(GroupMemberRow.group_id == group_id).delete()
    db.delete(row)
    db.commit()


@router.put("/{group_id}/members/{person_id}", response_model=Group)
def add_group_member(group_id: str, person_id: str, db: Session = Depends(get_db)) -> Group:
    group = db.query(GroupRow).filter(GroupRow.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if not db.query(PersonRow).filter(PersonRow.id == person_id).first():
        raise HTTPException(status_code=404, detail="Person not found")
    exists = (
        db.query(GroupMemberRow)
        .filter(GroupMemberRow.group_id == group_id, GroupMemberRow.person_id == person_id)
        .first()
    )
    if not exists:
        db.add(GroupMemberRow(group_id=group_id, person_id=person_id))
        db.commit()
    return _group_to_model(group, db)


@router.delete("/{group_id}/members/{person_id}", response_model=Group)
def remove_group_member(group_id: str, person_id: str, db: Session = Depends(get_db)) -> Group:
    group = db.query(GroupRow).filter(GroupRow.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    member = (
        db.query(GroupMemberRow)
        .filter(GroupMemberRow.group_id == group_id, GroupMemberRow.person_id == person_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Person not in group")
    db.delete(member)
    db.commit()
    return _group_to_model(group, db)
