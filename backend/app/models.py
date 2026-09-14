from enum import Enum
from pydantic import BaseModel


class ExpenseCategory(str, Enum):
    food = "food"
    transport = "transport"
    lodging = "lodging"
    entertainment = "entertainment"
    utilities = "utilities"
    other = "other"


class SplitType(str, Enum):
    equal = "equal"
    fixed = "fixed"
    percentage = "percentage"


class SplitConfig(BaseModel):
    type: SplitType
    values: dict[str, float] | None = None


class Person(BaseModel):
    id: str
    name: str


class CreatePerson(BaseModel):
    name: str


class UpdatePerson(BaseModel):
    name: str


class Group(BaseModel):
    id: str
    name: str
    memberIds: list[str]


class CreateGroup(BaseModel):
    name: str
    memberIds: list[str]


class UpdateGroup(BaseModel):
    name: str
    memberIds: list[str]


class Expense(BaseModel):
    id: str
    groupId: str
    description: str
    amount: float
    date: str
    category: ExpenseCategory
    notes: str
    payerIds: list[str]
    split: SplitConfig


class CreateExpense(BaseModel):
    description: str
    amount: float
    date: str
    category: ExpenseCategory
    notes: str
    payerIds: list[str]
    split: SplitConfig


class UpdateExpense(BaseModel):
    description: str
    amount: float
    date: str
    category: ExpenseCategory
    notes: str
    payerIds: list[str]
    split: SplitConfig


class Settlement(BaseModel):
    id: str
    groupId: str
    fromPersonId: str
    toPersonId: str
    amount: float
    date: str


class CreateSettlement(BaseModel):
    fromPersonId: str
    toPersonId: str
    amount: float
    date: str


class Balance(BaseModel):
    fromPersonId: str
    toPersonId: str
    amount: float
