import pandas as pd
from datetime import datetime
from app.models.payment_model import Payment  # assuming you have a model for the Payment document
from app.database import db  # Assuming MongoDB connection setup is in database.py
import pytz

def normalize_and_save_csv(file_path: str):
    # Read the CSV file into a DataFrame
    df = pd.read_csv(file_path)

    # Ensure all required fields are present
    required_columns = [
        "payee_first_name", "payee_last_name", "payee_payment_status",
        "payee_added_date_utc", "payee_due_date", "payee_address_line_1", 
        "payee_city", "payee_country", "payee_postal_code", "payee_phone_number", 
        "payee_email", "currency", "due_amount"
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
    
    # Normalize and clean the data
    df['payee_added_date_utc'] = pd.to_datetime(df['payee_added_date_utc'], errors='coerce')
    df['payee_due_date'] = pd.to_datetime(df['payee_due_date'], errors='coerce')
    
    # Fill missing values for optional fields (or handle them as needed)
    df['payee_province_or_state'] = df['payee_province_or_state'].fillna("")
    df['discount_percent'] = df['discount_percent'].fillna(0)
    df['tax_percent'] = df['tax_percent'].fillna(0)

    
    # Handle missing required fields (you can raise an error or fill with defaults)
    df['payee_country'] = df['payee_country'].fillna('Unknown')  # Optional: fill with a default value if needed
    df['payee_phone_number'] = df['payee_phone_number'].fillna('Unknown')
    df['payee_email'] = df['payee_email'].fillna('Unknown')
    
    # Calculate 'total_due' based on the formula
    df['total_due'] = df.apply(lambda row: calculate_total_due(row), axis=1)
    
    # Convert the DataFrame to a list of dictionaries to insert into MongoDB
    payment_records = df.to_dict(orient='records')
    
    # Save the records to MongoDB
    try:
        db.payments.insert_many(payment_records)
    except Exception as e:
        raise ValueError(f"Failed to save data to MongoDB: {str(e)}")

def calculate_total_due(row):
    # Basic formula to calculate the total_due (example)
    discount = row['discount_percent'] / 100 * row['due_amount']
    tax = row['tax_percent'] / 100 * row['due_amount']
    total_due = row['due_amount'] - discount + tax
    return round(total_due, 2)
