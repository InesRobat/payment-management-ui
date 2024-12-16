from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.csv_service import normalize_and_save_csv  # Adjust import based on actual location
import shutil

router = APIRouter()

@router.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    # Save the uploaded file to a temporary location
    temp_file_path = "uploaded_file.csv"
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Normalize and save the CSV data to MongoDB
        normalize_and_save_csv(temp_file_path)
        return {"message": "CSV data successfully uploaded and saved to MongoDB."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")
