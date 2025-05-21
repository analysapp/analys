@echo off
REM Executa uvicorn após ativação correta e dentro da pasta certa
python -m uvicorn main:app --host 127.0.0.1 --port 8000
