from sqlalchemy import Column, Float, ForeignKey, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


class PersonRow(Base):
    __tablename__ = "people"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)


class GroupRow(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)


class GroupMemberRow(Base):
    __tablename__ = "group_members"

    group_id = Column(String, ForeignKey("groups.id"), primary_key=True)
    person_id = Column(String, ForeignKey("people.id"), primary_key=True)


class ExpenseRow(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)
    category = Column(String, nullable=False)
    notes = Column(String, nullable=False, default="")
    payer_ids = Column(String, nullable=False)  # JSON-encoded list
    split_type = Column(String, nullable=False)
    split_values = Column(String, nullable=True)  # JSON-encoded dict or None


class SettlementRow(Base):
    __tablename__ = "settlements"

    id = Column(String, primary_key=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    from_person_id = Column(String, ForeignKey("people.id"), nullable=False)
    to_person_id = Column(String, ForeignKey("people.id"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)


DATABASE_URL = "sqlite:///./wesplit.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
