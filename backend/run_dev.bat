@echo off
echo Starting FastAPI dev server with isolated reload path to avoid infinite loops...
if not exist "data" (
    mkdir "data"
)
.venv\Scripts\uvicorn app.main:app --reload --reload-dir app
