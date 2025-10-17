# analysis/db.py
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "Hospitalmanagement")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]

prescriptions_collection = db["prescriptions"]
doctors_collection = db["doctors"]
patients_collection = db["patients"]
