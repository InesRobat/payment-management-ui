from pymongo import MongoClient
from pymongo.database import Database
import gridfs

# Database connection URI (localhost for development)
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "payments_db"

# Establish connection to MongoDB
client = MongoClient(MONGO_URI)

# Get the database
db: Database = client[DB_NAME]
fs = gridfs.GridFS(db)
def get_db():
    return db
