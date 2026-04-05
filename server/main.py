from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from server/.env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI()

# Enable CORS for Vite dev server
# Change this block (Lines 16-22):
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Specify exact Vite origins
    allow_credentials=True, # Now this can stay True
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize Groq client
# The SDK automatically looks for GROQ_API_KEY if not provided,
# but we provide it explicitly as requested.
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    # We don't raise here to allow the app to start, 
    # but requests will fail if key isn't set
    print("Warning: GROQ_API_KEY not found in environment variables")
    
client = Groq(api_key=api_key)

# Request model
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str
    isJson: Optional[bool] = False

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Prepare the messages for the Groq SDK
        # Convert Pydantic models to dicts
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Prepare completion arguments
        completion_args = {
            "model": request.model,
            "messages": messages,
        }
        
        # Add response format if requested
        if request.isJson:
            completion_args["response_format"] = {"type": "json_object"}
            
        # Make the API call
        completion = client.chat.completions.create(**completion_args)
        
        # Return the expected format
        return {"content": completion.choices[0].message.content}
        
    except Exception as e:
        # Handle exceptions and return appropriate HTTP status
        raise HTTPException(status_code=500, detail=str(e))
