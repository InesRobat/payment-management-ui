from datetime import datetime
from pymongo.collection import Collection
from pymongo.database import Database 
from bson import ObjectId
from fastapi import HTTPException, UploadFile
import os
import gridfs
from typing import List, Dict, Any, Optional
from bson import ObjectId
from fastapi.responses import FileResponse
from collections import defaultdict
from datetime import datetime

# Set the max file size limit (e.g., 10MB)
MAX_FILE_SIZE_MB = 10

from datetime import datetime
from typing import Optional, Dict
from pymongo.collection import Collection

def get_payments(db: Collection, search: str, page: int, page_size: int) -> dict:
    today = datetime.today().date()

    query = {}
    # if filters.get("payee_name"):
    #     query["payee_first_name"] = {"$regex": filters["payee_name"], "$options": "i"}
    # if filters.get("status"):
    #     query["payee_payment_status"] = filters["status"]
    
    # Handle search term
    if search:
        query["$or"] = [
            {"payee_first_name": {"$regex": search, "$options": "i"}},
            {"payee_last_name": {"$regex": search, "$options": "i"}},
            {"currency": {"$regex": search, "$options": "i"}},
        ]

    # Total count of payments
    total_count = db.count_documents(query)

    # Pagination
    skip = (page - 1) * page_size
    payments_cursor = db.find(query).skip(skip).limit(page_size)

    payments = []
    total_due = 0

    for payment in payments_cursor:
        # Calculate total_due for each individual payment
        payment["total_due"] = calculate_total_due(
            payment["due_amount"],
            payment.get("discount_percent", 0),
            payment.get("tax_percent", 0)
        )

        # Update payment status based on due_date
        payee_due_date = payment.get("payee_due_date")
        if payee_due_date:
            if payee_due_date.date() == today:
                payment["payee_payment_status"] = "due_now"
            elif payee_due_date.date() < today:
                payment["payee_payment_status"] = "overdue"

        total_due += payment["total_due"]
        payments.append(payment)

    return objectid_to_str({
        "payments": payments,
    })

def calculate_total_due(due_amount: float, discount_percent: float, tax_percent: float) -> float:
    """Calculate the total due with discount and tax"""
    discount = (discount_percent / 100) * due_amount
    tax = (tax_percent / 100) * due_amount
    total_due = due_amount - discount + tax
    return total_due

def objectid_to_str(data):
    """Recursively converts all ObjectId instances in a dictionary or list to strings"""
    if isinstance(data, dict):
        return {key: objectid_to_str(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [objectid_to_str(item) for item in data]
    elif isinstance(data, ObjectId):
        return str(data)
    return data

def create_payment(db: Collection, payment_data: Dict):
    """
    Creates a new payment record.
    """
    required_fields = [
        "payee_first_name", "payee_last_name", "payee_payment_status",
        "payee_added_date_utc", "payee_due_date", "due_amount", "currency"
    ]
    
    for field in required_fields:
        if field not in payment_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Calculate total_due
    payment_data["total_due"] = calculate_total_due(
        payment_data["due_amount"],
        payment_data.get("discount_percent", 0),
        payment_data.get("tax_percent", 0)
    )
    
    # Insert into MongoDB
    result = db.insert_one(payment_data)
    return str(result.inserted_id)

def update_payment(db: Collection, payment_id: str, update_data: Dict):
    """
    Updates a payment record by ID.
    """
    if "payee_payment_status" in update_data and update_data["payee_payment_status"] == "completed":
        # Validate that evidence file exists
        if "evidence_file_id" not in update_data or not update_data["evidence_file_id"]:
            raise HTTPException(status_code=400, detail="Evidence file is required to mark payment as completed")
    
    result = db.update_one({"_id": ObjectId(payment_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"message": "Payment updated successfully"}

def delete_payment(db: Collection, payment_id: str):
    """
    Deletes a payment record by ID.
    """
    result = db.delete_one({"_id": ObjectId(payment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"message": "Payment deleted successfully"}
def upload_evidence(db: Collection, payment_id: str, file):
    """
    Upload an evidence file (PDF, PNG, JPG) and associate it with a payment.
    """
    # Ensure db is the correct instance of Database
    if not isinstance(db, Database):
        raise HTTPException(status_code=500, detail="Invalid database connection")
    
    fs = gridfs.GridFS(db)  # Initialize GridFS with the correct db instance

    try:
        # Storing the file
        file_id = fs.put(file.file, filename=file.filename, content_type=file.content_type)

        # Update the payment with the evidence file ID and change status to completed
        db.payments.update_one(
            {"_id": ObjectId(payment_id)},
            {"$set": {"evidence_file_id": file_id, "payee_payment_status": "completed"}}
        )

        return {"message": "Evidence uploaded successfully", "file_id": str(file_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading evidence: {str(e)}")
def download_evidence(db: Database, file_id: str):
    """Download an evidence file by its file_id from MongoDB GridFS."""
    try:
        # Initialize GridFS
        fs = gridfs.GridFS(db)

        # Convert the file_id to ObjectId
        file_object_id = ObjectId(file_id)

        # Get the file from GridFS using the file_id
        file = fs.get(file_object_id)

        # Return a FileResponse to allow download
        # Assuming the file has a 'filename' attribute (you might need to adjust if different)
        file_path = os.path.join("/tmp", file.filename)  # Temporary path to save the file

        # Save the file temporarily (this is optional if you want to send it directly)
        with open(file_path, 'wb') as f:
            f.write(file.read())

        # Return the file as a downloadable response
        return FileResponse(file_path, media_type="application/octet-stream", filename=file.filename)
        
    except gridfs.errors.NoFile:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
from pymongo.collection import Collection

def format_number(value):
        return "{:,.0f}".format(value).replace(",", " ")
def get_payment_stats(db: Collection):
    try:
        # Aggregation pipeline to calculate required stats in a single query
        pipeline = [
            {
                "$group": {
                    "_id": None,  # Group all documents together
                    "total_payments": {"$sum": 1},  # Count of all payments
                    "total_due_amount": {"$sum": {"$toDouble": "$total_due"}},  # Sum of total_due field
                    "overdue_payments": {
                        "$sum": {"$cond": [{"$eq": ["$payee_payment_status", "overdue"]}, 1, 0]}
                    },
                    "pending_payments": {
                        "$sum": {"$cond": [{"$eq": ["$payee_payment_status", "pending"]}, 1, 0]}
                    },
                    "completed_payments": {
                        "$sum": {"$cond": [{"$eq": ["$payee_payment_status", "completed"]}, 1, 0]}
                    }
                }
            }
        ]
        
        result = db.aggregate(pipeline)
        stats = list(result)

        # If there are results, extract the stats from the aggregation result
        if stats:
            stats = stats[0]
            response = [
                {"name": "Total Payments", "value": format_number(stats["total_payments"])},
                {"name": "Total Due Amount", "value": format_number(round(stats["total_due_amount"], 2))},
                {"name": "Overdue Payments", "value": format_number(stats["overdue_payments"])},
                {"name": "Pending Payments", "value": format_number(stats["pending_payments"])},
                {"name": "Completed Payments", "value": format_number(stats["completed_payments"])}
            ]
            return response
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve payment stats")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while calculating stats: {str(e)}")


# Existing function for payment status distribution
def get_payment_status_distribution(db: Collection):
    # Initialize a dictionary to hold the count for each status
    status_counts = defaultdict(int)
    total_due_by_status = defaultdict(float)

    # Loop through payments and calculate the counts and total due by status
    payments_cursor = db.find({}, {"payee_payment_status": 1, "total_due": 1})
    for payment in payments_cursor:
        status = payment.get("payee_payment_status")
        total_due = payment.get("total_due", 0)

        if status:
            status_counts[status] += 1
            total_due_by_status[status] += total_due

    return {
        "status_counts": dict(status_counts),
        "total_due_by_status": {key: round(value, 2) for key, value in total_due_by_status.items()}
    }

# New function to get payments grouped by currency
def get_payment_by_currency(db: Collection):
    currency_counts = defaultdict(int)
    total_due_by_currency = defaultdict(float)

    # Loop through payments and calculate the counts and total due by currency
    payments_cursor = db.find({}, {"currency": 1, "total_due": 1})
    for payment in payments_cursor:
        currency = payment.get("currency")
        total_due = payment.get("total_due", 0)

        if currency:
            currency_counts[currency] += 1
            total_due_by_currency[currency] += total_due

    return {
        "currency_counts": dict(currency_counts),
        "total_due_by_currency": {key: round(value, 2) for key, value in total_due_by_currency.items()}
    }

# New function to get payments grouped by country
def get_payment_by_country(db: Collection):
    country_counts = defaultdict(int)
    total_due_by_country = defaultdict(float)

    # Loop through payments and calculate the counts and total due by country
    payments_cursor = db.find({}, {"payee_country": 1, "total_due": 1})
    for payment in payments_cursor:
        country = payment.get("payee_country")
        total_due = payment.get("total_due", 0)

        if country:
            country_counts[country] += 1
            total_due_by_country[country] += total_due

    return {
        "country_counts": dict(country_counts),
        "total_due_by_country": {key: round(value, 2) for key, value in total_due_by_country.items()}
    }