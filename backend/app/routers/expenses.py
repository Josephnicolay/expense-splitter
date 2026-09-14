import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, ExpenseRow, GroupRow
from app.models import Expense, CreateExpense, UpdateExpense, SplitConfig, SplitType

router = APIRouter(tags=["expenses"])


def _expense_to_model(row: ExpenseRow) -> Expense:
    return Expense(
        id=row.id,
        groupId=row.group_id,
        description=row.description,
        amount=row.amount,
        date=row.date,
        category=row.category,
        notes=row.notes,
        payerIds=json.loads(row.payer_ids),
        split=SplitConfig(
            type=SplitType(row.split_type),
            values=json.loads(row.split_values) if row.split_values else None,
        ),
    )


@router.get("/groups/{group_id}/expenses", response_model=list[Expense])
def get_expenses(group_id: str, db: Session = Depends(get_db)) -> list[Expense]:
    if not db.query(GroupRow).filter(GroupRow.id == group_id).first():
        raise HTTPException(status_code=400, detail="Group not found")
    rows = db.query(ExpenseRow).filter(ExpenseRow.group_id == group_id).all()
    return [_expense_to_model(r) for r in rows]


@router.post("/groups/{group_id}/expenses", response_model=Expense, status_code=201)
def create_expense(group_id: str, body: CreateExpense, db: Session = Depends(get_db)) -> Expense:
    if not db.query(GroupRow).filter(GroupRow.id == group_id).first():
        raise HTTPException(status_code=400, detail="Group not found")
    row = ExpenseRow(
        id=str(uuid.uuid4()),
        group_id=group_id,
        description=body.description,
        amount=body.amount,
        date=body.date,
        category=body.category.value,
        notes=body.notes,
        payer_ids=json.dumps(body.payerIds),
        split_type=body.split.type.value,
        split_values=json.dumps(body.split.values) if body.split.values else None,
    )
    db.add(row)
    db.commit()
    return _expense_to_model(row)


@router.get("/expenses/{expense_id}", response_model=Expense)
def get_expense(expense_id: str, db: Session = Depends(get_db)) -> Expense:
    row = db.query(ExpenseRow).filter(ExpenseRow.id == expense_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Expense not found")
    return _expense_to_model(row)


@router.put("/expenses/{expense_id}", response_model=Expense)
def update_expense(expense_id: str, body: UpdateExpense, db: Session = Depends(get_db)) -> Expense:
    row = db.query(ExpenseRow).filter(ExpenseRow.id == expense_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Expense not found")
    row.description = body.description
    row.amount = body.amount
    row.date = body.date
    row.category = body.category.value
    row.notes = body.notes
    row.payer_ids = json.dumps(body.payerIds)
    row.split_type = body.split.type.value
    row.split_values = json.dumps(body.split.values) if body.split.values else None
    db.commit()
    return _expense_to_model(row)


@router.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: str, db: Session = Depends(get_db)) -> None:
    row = db.query(ExpenseRow).filter(ExpenseRow.id == expense_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(row)
    db.commit()
