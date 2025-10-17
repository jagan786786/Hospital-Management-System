# analysis/services/medicine_suggestions.py
from typing import List
from pydantic import BaseModel
from analysis.db import prescriptions_collection
from bson import ObjectId
from datetime import datetime

class Prescription(BaseModel):
    appointment_id: str
    patient_id: dict
    doctor_id: dict
    blood_pressure: str
    pulse: str
    height: str
    weight: str
    bmi: str
    spo2: str
    complaints: List[str]
    medicines: List[dict]
    advice: str
    tests_prescribed: str
    next_visit: str
    doctor_notes: str
    visit_date: str
    status: str  # optional, can default if missing

class MedicineSuggestion(BaseModel):
    name: str
    frequency: int

async def get_doctor_medicine_suggestions(doctor_id: str, complaints: List[str]) -> List[MedicineSuggestion]:
    # Convert doctor_id string to ObjectId for Mongo query
    query = {
        "doctor_id": ObjectId(doctor_id),
        "complaints": {"$in": complaints}
    }

    cursor = prescriptions_collection.find(query)
    prescriptions_list = []

    async for prescription in cursor:
        # Normalize document for Pydantic
        prescription_data = {
            "appointment_id": str(prescription.get("appointment_id")),
            "patient_id": {"_id": str(prescription.get("patient_id"))},
            "doctor_id": {"_id": str(prescription.get("doctor_id"))},
            "blood_pressure": prescription.get("blood_pressure", ""),
            "pulse": prescription.get("pulse", ""),
            "height": prescription.get("height", ""),
            "weight": prescription.get("weight", ""),
            "bmi": prescription.get("bmi", ""),
            "spo2": prescription.get("spo2", ""),
            "complaints": prescription.get("complaints", []),
            "medicines": prescription.get("medicines", []),
            "advice": prescription.get("advice", ""),
            "tests_prescribed": prescription.get("tests_prescribed", ""),
            "next_visit": prescription.get("next_visit", ""),
            "doctor_notes": prescription.get("doctor_notes", ""),
            "status": prescription.get("status", "completed"),
        }

        # Convert datetime to ISO string
        visit_date = prescription.get("visit_date")
        if isinstance(visit_date, datetime):
            prescription_data["visit_date"] = visit_date.isoformat()
        else:
            prescription_data["visit_date"] = str(visit_date)

        prescriptions_list.append(Prescription(**prescription_data).dict())

    # Count medicine occurrences
    medicine_counts = {}
    for prescription in prescriptions_list:
        for medicine in prescription["medicines"]:
            name = medicine.get("name")
            if name:
                medicine_counts[name] = medicine_counts.get(name, 0) + 1

    # Prepare suggestions list
    suggestions = [MedicineSuggestion(name=name, frequency=count) for name, count in medicine_counts.items()]
    return suggestions
