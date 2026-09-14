import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, SettlementRow, GroupRow
from app.models import Settlement, CreateSettlement

router = APIRouter(tags=["settlements"])


def _settlement_to_model(row: SettlementRow) -> Settlement:
    return Settlement(
        id=row.id,
        groupId=row.group_id,
        fromPersonId=row.from_person_id,
        toPersonId=row.to_person_id,
        amount=row.amount,
        date=row.date,
    )


@router.get("/groups/{group_id}/settlements", response_model=list[Settlement])
def get_settlements(group_id: str, db: Session = Depends(get_db)) -> list[Settlement]:
    if not db.query(GroupRow).filter(GroupRow.id == group_id).first():
        raise HTTPException(status_code=400, detail="Group not found")
    rows = db.query(SettlementRow).filter(SettlementRow.group_id == group_id).all()
    return [_settlement_to_model(r) for r in rows]


@router.post("/groups/{group_id}/settlements", response_model=Settlement, status_code=201)
def create_settlement(group_id: str, body: CreateSettlement, db: Session = Depends(get_db)) -> Settlement:
    if not db.query(GroupRow).filter(GroupRow.id == group_id).first():
        raise HTTPException(status_code=400, detail="Group not found")
    row = SettlementRow(
        id=str(uuid.uuid4()),
        group_id=group_id,
        from_person_id=body.fromPersonId,
        to_person_id=body.toPersonId,
        amount=body.amount,
        date=body.date,
    )
    db.add(row)
    db.commit()
    return _settlement_to_model(row)


@router.delete("/settlements/{settlement_id}", status_code=204)
def delete_settlement(settlement_id: str, db: Session = Depends(get_db)) -> None:
    row = db.query(SettlementRow).filter(SettlementRow.id == settlement_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Settlement not found")
    db.delete(row)
    db.commit()
