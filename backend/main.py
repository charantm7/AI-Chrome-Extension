from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
from fastapi.middleware.cors import CORSMiddleware
import re




app = FastAPI()




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class AnalyzeRequest(BaseModel):
    text: str
    url: str

@app.post("/api/analyze/")
async def analyze(request: AnalyzeRequest):
    prompt = f"""
    You are Veritas AI, an intelligent assistant designed to analyze web pages.

    Analyze the following webpage content and respond **strictly** in this format:

    Summary: <A concise summary of the page content in no more than 50 words>

    Type: <The type of page, e.g., E-commerce, Service, Blog, News, Educational, etc.>

    Content to analyze:
    {request.text}
    """

    headers = {
        "Authorization": f"Bearer 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",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost", 
        "X-Title": "Veritas-AI-Chrome-Extension"
    }

    data = {
        "model": "mistralai/mistral-7b-instruct",  
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)

    result = response.json()
   

    if "choices" in result and result["choices"]:
        reply = result["choices"][0]["message"]["content"]

        # Use regex to extract summary and type more reliably
        summary_match = re.search(r"Summary:\s*(.+?)(?:\n|$)", reply, re.IGNORECASE | re.DOTALL)
        type_match = re.search(r"Type:\s*(.+?)(?:\n|$)", reply, re.IGNORECASE | re.DOTALL)

        summary = summary_match.group(1).strip() if summary_match else "Not found"
        page_type = type_match.group(1).strip() if type_match else "Unknown"

        print("Summary:", summary)
        print("Page Type:", page_type)

        return {
            "summary": summary,
            "page_type": page_type,
            "raw": result
        }

    else:
        print("Error from OpenRouter:", result)
        raise HTTPException(status_code=500, detail="AI failed to respond properly.")
        