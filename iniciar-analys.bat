@echo off
title Iniciando Plataforma Analys

REM === Inicia o BACKEND - FASTAPI ===
start "BACKEND - FASTAPI" cmd /k "cd /d D:\testeanalys\api-inferencia && call venv\Scripts\activate.bat && call run_backend.bat"

REM === Inicia o FRONTEND - NEXT.JS ===
start "FRONTEND - NEXTJS" cmd /k "cd /d D:\testeanalys && npm run dev"

echo Plataforma Analys iniciada!
pause
