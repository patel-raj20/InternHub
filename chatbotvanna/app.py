"""
app.py
======
FastAPI application server for the InternHub Text-to-SQL chatbot.

AUTHENTICATION REMOVED: In testing mode as requested.
This allows any user to access the chatbot and run SQL queries.
"""

import os
import logging
import pandas as pd
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any, Literal
import re

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from vanna_setup import vn, connect_to_postgres

load_dotenv(override=True)

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

# ── Config ─────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
]
ALLOW_NULL_ORIGIN = os.getenv("ALLOW_NULL_ORIGIN", "true").lower() == "true"

# ── Models ─────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    role: Optional[Literal["DEPT_ADMIN", "SUPER_ADMIN"]] = None
    organization_id: Optional[str] = None
    department_id: Optional[str] = None


def _build_scoped_question(payload: ChatRequest) -> str:
    """Inject strict scope instructions into NL question before SQL generation."""
    if payload.role != "DEPT_ADMIN":
        return payload.question

    if not payload.department_id:
        raise HTTPException(403, "Department scope is required for DEPT_ADMIN")

    scope_guard = (
        "You MUST generate a single SELECT query scoped strictly to one department. "
        f"Always include a filter that restricts results to users.department_id = '{payload.department_id}'. "
        "Do not return data from any other department."
    )

    return f"{scope_guard}\n\nUser question: {payload.question}"


def _validate_scoped_sql(sql: str, payload: ChatRequest) -> None:
    """Fail closed if SQL is unsafe or missing DEPT_ADMIN scope."""
    sql_l = (sql or "").lower()

    # Read-only guard
    if not (sql_l.strip().startswith("select") or sql_l.strip().startswith("with")):
        raise HTTPException(403, "Only read-only SQL is allowed")

    # Block multi-statement attempts
    if ";" in sql.strip().rstrip(";"):
        raise HTTPException(403, "Multiple SQL statements are not allowed")

    if payload.role == "DEPT_ADMIN":
        if not payload.department_id:
            raise HTTPException(403, "Department scope is required for DEPT_ADMIN")

        dept_id = payload.department_id.lower()
        has_dept_col = "department_id" in sql_l
        has_exact_dept = dept_id in sql_l

        # Ensure generated SQL explicitly contains the caller department id and department filter usage.
        if not (has_dept_col and has_exact_dept):
            raise HTTPException(403, "Query rejected: missing required department scope")

        # Ensure query cannot reference another department id literal.
        uuid_like = re.findall(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", sql_l)
        for value in uuid_like:
            if value != dept_id:
                raise HTTPException(403, "Query rejected: cross-department filter detected")

# ── Lifespan ───────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up InternHub AI Server (TESTING MODE - AUTH DISABLED)")
    try:
        connect_to_postgres()
    except Exception as e:
        logger.error(f"Postgres connection failed: {e}")
        raise RuntimeError("Database connection failed during startup") from e
    yield
    logger.info("Shutting down InternHub AI Server.")

# ── App Init ───────────────────────────────────────────────────────────
app = FastAPI(lifespan=lifespan, title="InternHub Vanna 2.0 API (Testing)")

allow_all_origins = "*" in ALLOWED_ORIGINS
effective_origins = ALLOWED_ORIGINS.copy()
if not allow_all_origins and ALLOW_NULL_ORIGIN and "null" not in effective_origins:
    effective_origins.append("null")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else effective_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Endpoints ──────────────────────────────────────────────────────────

@app.get("/api/v0/config")
async def get_config():
    """Vanna-chat compatible discovery endpoint."""
    return {
        "api_base":    "/api/v0",
        "product":     "InternHub AI SQL",
        "llm_model":   os.getenv("GROQ_MODEL", "llama3-70b-8192"),
    }

@app.get("/health")
async def health():
    try:
        vn.run_sql("SELECT 1 AS ok;")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "degraded", "database": "disconnected", "error": str(e)},
        )

@app.post("/api/v0/generate_sql")
async def generate_sql(payload: ChatRequest):
    """Generate SQL from natural language (Auth Disabled)."""
    try:
        scoped_question = _build_scoped_question(payload)
        sql = vn.generate_sql(question=scoped_question)
        _validate_scoped_sql(sql, payload)
        return {"sql": sql}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SQL generation failed: {e}")
        raise HTTPException(500, f"Error generating SQL: {str(e)}")

@app.post("/api/v0/run_sql")
async def run_sql(payload: Dict[str, str]):
    """Execute raw SQL result (Auth Disabled)."""
    sql = payload.get("sql")
    if not sql:
        raise HTTPException(400, "SQL missing")

    scoped_payload = ChatRequest(
        question="run_sql",
        role=payload.get("role"),
        organization_id=payload.get("organization_id"),
        department_id=payload.get("department_id"),
    )

    _validate_scoped_sql(sql, scoped_payload)
    
    try:
        df = vn.run_sql(sql)
        if df is None or df.empty:
            return {"results": [], "columns": []}
        
        return {
            "results": df.to_dict(orient="records"),
            "columns": list(df.columns)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SQL execution failed: {e}")
        raise HTTPException(500, f"Database error: {str(e)}")

@app.post("/api/v0/ask")
async def ask(payload: ChatRequest):
    """Full natural language query lifecycle (Auth Disabled)."""
    try:
        scoped_question = _build_scoped_question(payload)
        sql = vn.generate_sql(question=scoped_question)
        _validate_scoped_sql(sql, payload)
        df = vn.run_sql(sql)
        
        results = []
        columns = []
        if df is not None and not df.empty:
            results = df.to_dict(orient="records")
            columns = list(df.columns)
        
        return {
            "question": payload.question,
            "sql": sql,
            "results": results,
            "columns": columns
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ask query failed: {e}")
        raise HTTPException(500, f"Error processing query: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
