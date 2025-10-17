# analysis/main.py
from fastapi import FastAPI
from fastapi import Query
from typing import List
from analysis.services.medicine_suggestions import get_doctor_medicine_suggestions, MedicineSuggestion
from analysis.db import prescriptions_collection  # MongoDB connection

app = FastAPI(title="Hospital Management API")

# Root route
@app.get("/")
async def root():
    return {"message": "FastAPI server is running!"}

# Test MongoDB connection
@app.get("/test-db")
async def test_db():
    count = await prescriptions_collection.count_documents({})
    return {"prescriptions_count": count}

# Medicine suggestions route
@app.get("/prescriptions", response_model=List[MedicineSuggestion])
async def prescriptions_route(
    doctor_id: str,
    complaints: List[str] = Query(...)
):
    """
    Get medicine suggestions based on doctor ID and list of complaints
    Example query:
    /prescriptions?doctor_id=123&complaints=fever&complaints=cough
    """
    return await get_doctor_medicine_suggestions(doctor_id, complaints)
