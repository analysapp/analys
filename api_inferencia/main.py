from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_inferencia.api.analisar import router as analisar_router
from api_inferencia.api.guianormativo import router as guia_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas
app.include_router(analisar_router)
app.include_router(guia_router)
