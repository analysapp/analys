@echo off
title Iniciando Plataforma Analys

REM --- Inicia o servidor Ollama ---
start "" /MIN cmd /k "ollama serve"

REM --- Inicia o Backend FastAPI com ambiente virtual ---
start "" cmd /k "cd /d D:\testeanalys\api-inferencia && call venv\Scripts\activate && uvicorn main:app --reload --port 8000"

REM --- Inicia o Frontend Next.js ---
start "" cmd /k "cd /d D:\testeanalys && npm run dev"

echo Plataforma Analys iniciada!
pause
