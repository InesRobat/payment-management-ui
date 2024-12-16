from fastapi import APIRouter, HTTPException, File, UploadFile, Depends, Query
from app.services.payment_service import get_payments, create_payment, update_payment, delete_payment, upload_evidence, download_evidence, get_payment_stats, get_payment_status_distribution, get_payment_by_currency, get_payment_by_country
from app.database import db
from typing import Dict, Optional, List
import json

router = APIRouter()
@router.get("/get-payments")
async def fetch_payments(
    search: Optional[str] = Query(''),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1)
):
    # Use the search, page, and page_size parameters to fetch data
    result = get_payments(db.payments,search, page, page_size)
    total = len(list(db.payments.find({})))

    return {"items": result, "total": total}

@router.post("/create-payment")
async def create_new_payment(payment_data: Dict):
    """
    Create a new payment record.
    """
    payment_id = create_payment(db.payments, payment_data)
    return {"payment_id": payment_id}

@router.put("/update-payment/{payment_id}")
async def update_existing_payment(payment_id: str, update_data: Dict):
    """
    Update payment record by ID.
    """
    try:
        result = update_payment(db.payments, payment_id, update_data)
        return result
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.delete("/delete-payment/{payment_id}")
async def remove_payment(payment_id: str):
    """
    Delete payment record by ID.
    """
    try:
        result = delete_payment(db.payments, payment_id)
        return result
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.get("/stats")
async def get_stats():
    stats = get_payment_stats(db.payments)
    return stats

# Existing route for payment stats
@router.get("/payment-status-stats")
async def payment_status_stats():
    stats = get_payment_status_distribution(db)
    return stats

# New route for payments grouped by currency
@router.get("/payment-currency-stats")
async def payment_currency_stats():
    stats = get_payment_by_currency(db)
    return stats

# New route for payments grouped by country
@router.get("/payment-country-stats")
async def payment_country_stats():
    stats = get_payment_by_country(db)
    return stats