from fastapi import FastAPI

from app.database import init_db
from app.routers import people, groups, expenses, settlements, balances

app = FastAPI(title="WeSplit API", version="1.0.0")

app.include_router(people.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(settlements.router, prefix="/api")
app.include_router(balances.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    init_db()
