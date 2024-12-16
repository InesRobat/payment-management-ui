from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class Payment(BaseModel):
    payee_first_name: str
    payee_last_name: str
    payee_payment_status: str  # completed, due_now, overdue, pending
    payee_added_date_utc: datetime
    payee_due_date: datetime
    payee_address_line_1: str
    payee_address_line_2: Optional[str] = None
    payee_city: str
    payee_country: str  # ISO 3166-1 alpha-2
    payee_province_or_state: Optional[str] = None
    payee_postal_code: str
    payee_phone_number: str  # E.164 format
    payee_email: EmailStr
    currency: str  # ISO 4217
    discount_percent: Optional[float] = None
    tax_percent: Optional[float] = None
    due_amount: float
    total_due: Optional[float] = None  # This will be calculated

    class Config:
        orm_mode = True  # To allow the model to work with MongoDB documents
