# Expense Splitter — Specification

## Scope
- Multi-group support (e.g. "Trip to Japan", "Apartment 4B")
- Shared people/contacts pool across groups — same person can belong to multiple groups
- Shared data storage — all users of the app see the same live data (no auth/login)

## Groups
- Each group has its own name and member list
- Members are drawn from a shared people pool (add once, reuse across groups)

## Expenses
- Fields: description, amount, date, category, notes, payer(s), split
- Multiple payers per expense supported (e.g. Alice + Bob both paid)
- Split types:
  - Equal split
  - Custom fixed amounts
  - Percentage / shares-based split
- Categories: food, transport, lodging, etc. (predefined + custom)

## Balances
- Simple pairwise ledger — tracks exact amounts each person owes each other person within a group
- No debt-simplification algorithm — raw pairwise debts shown as-is
- Balances update live as expenses are added

## Settlements
- Explicit "settle up" action — records a payment between two people (e.g. "Alice paid Bob $20")
- Settlements are their own transaction type, separate from expenses
- Settlements reduce the relevant pairwise balance

## Platform
- Single-page web app artifact
- Persistent **shared** key-value storage (data survives across sessions and is visible/editable by anyone using the app — no per-person login or data isolation)

## Open Questions / Future Considerations
- Currency handling (single currency vs. multi-currency)
- How balances are displayed (per-person summary vs. full pairwise matrix)
- Edit/delete rules for past expenses and settlements
