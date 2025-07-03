from fastapi import FastAPI  # type: ignore
from routers import chat

app = FastAPI()
app.include_router(chat.router)
