import json
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, GroupRow, GroupMemberRow, ExpenseRow, SettlementRow
from app.models import Balance

router = APIRouter(tags=["balances"])


@router.get("/groups/{group_id}/balances", response_model=list[Balance])
def get_balances(group_id: str, db: Session = Depends(get_db)) -> list[Balance]:
    if not db.query(GroupRow).filter(GroupRow.id == group_id).first():
        raise HTTPException(status_code=400, detail="Group not found")

    member_ids = [
        m.person_id
        for m in db.query(GroupMemberRow).filter(GroupMemberRow.group_id == group_id).all()
    ]

    net: dict[tuple[str, str], float] = defaultdict(float)

    expenses = db.query(ExpenseRow).filter(ExpenseRow.group_id == group_id).all()
    for expense in expenses:
        payer_ids = json.loads(expense.payer_ids)
        if expense.split_type == "equal":
            share = expense.amount / len(member_ids) if member_ids else 0
            for member_id in member_ids:
                if member_id not in payer_ids:
                    for payer_id in payer_ids:
                        net[(member_id, payer_id)] += share
        elif expense.split_type == "fixed" and expense.split_values:
            values = json.loads(expense.split_values)
            for member_id, amount_owed in values.items():
                for payer_id in payer_ids:
                    if member_id != payer_id:
                        net[(member_id, payer_id)] += amount_owed / len(payer_ids)

    settlements = db.query(SettlementRow).filter(SettlementRow.group_id == group_id).all()
    for s in settlements:
        net[(s.from_person_id, s.to_person_id)] -= s.amount

    balances: list[Balance] = []
    seen: set[tuple[str, str]] = set()
    for (from_id, to_id), amount in net.items():
        if amount <= 0:
            continue
        pair = tuple(sorted([from_id, to_id]))
        if pair in seen:
            continue
        seen.add(pair)
        reverse_amount = net.get((to_id, from_id), 0.0)
        if reverse_amount > amount:
            balances.append(Balance(fromPersonId=to_id, toPersonId=from_id, amount=reverse_amount - amount))
        elif amount > reverse_amount:
            balances.append(Balance(fromPersonId=from_id, toPersonId=to_id, amount=amount - reverse_amount))

    return balances
