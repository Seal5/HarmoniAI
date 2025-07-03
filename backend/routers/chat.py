from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Message(BaseModel):
    message: str


@router.post("/api/chat")
async def chat_endpoint(msg: Message):
    # Later, you'll use SafetyGuard and route to an LLM agent
    return {"reply": f"Mock response to: {msg.message}"}
