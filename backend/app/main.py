from app.database import engine, Base
import app.models
from fastapi import FastAPI
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.groups import (router as group_router)
from app.routes.memberships import (router as membership_router)
from app.routes.expenses import (router as expense_router)
from app.routes.balances import (router as balance_router)
from app.routes.settlements import (router as settlement_router)
from app.routes.imports import (router as import_router)
from app.routes.anomalies import ( router as anomaly_router)
from app.routes.settlement_suggestions import (router as settlement_suggestion_router)
from app.routes.dashboard import (router as dashboard_router)
from app.routes.analytics import (router as analytics_router)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

print("Tables created successfully")

app.include_router(auth_router)

app.include_router(group_router)

app.include_router(membership_router)

app.include_router(expense_router)  

app.include_router(balance_router)

app.include_router(settlement_router)

app.include_router(import_router)

app.include_router(anomaly_router)

app.include_router(settlement_suggestion_router)

app.include_router(dashboard_router)

app.include_router(analytics_router)