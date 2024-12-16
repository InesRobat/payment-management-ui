from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pymongo import MongoClient
from bson import ObjectId
from app.database import db, get_db
from app.services.payment_service import upload_evidence, download_evidence
from pymongo.database import Database 

router = APIRouter()

@router.post("/upload-evidence/{payment_id}")
async def upload_evidence_file(payment_id: str, file: UploadFile = File(...)):
    # Ensure that payment_id is a valid ObjectId format and that file is provided
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Call the service function for file upload
    return upload_evidence(db, payment_id, file)

@router.get("/download-evidence/{file_id}")
async def download_evidence_file(file_id: str, db: Database = Depends(get_db)):
    """Route to download an evidence file by its file_id."""
    return download_evidence(db, file_id)