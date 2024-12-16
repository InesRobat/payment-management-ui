from fastapi import FastAPI, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.staticfiles import StaticFiles
import os
from database import get_db
from pymongo.errors import ServerSelectionTimeoutError
from routers import csv_routes, payment_routes, evidence_routes
import threading
from file_watcher import start_file_watcher
import logging
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Fetch the database connection
db = get_db()
payments_collection = db["payments"]

# Add CORS middleware
origins = [
    "http://localhost:4200",
    "https://payment-management-ui.vercel.app" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample route to check if MongoDB is working and reachable
@app.get("/check_mongo")
async def check_mongo():
    try:
        # Attempt to query the payments collection
        payment = payments_collection.find_one()  # Fetch one document from the collection
        if payment:
            return {"status": "success", "message": "MongoDB is connected and the payments collection has data."}
        else:
            return {"status": "empty", "message": "MongoDB is connected, but the payments collection is empty."}
    except ServerSelectionTimeoutError:
        raise HTTPException(status_code=500, detail="Failed to connect to MongoDB")

# Include the routers for CSV, payments, and evidence
app.include_router(csv_routes.router)
app.include_router(payment_routes.router)
app.include_router(evidence_routes.router)

# Start the file watcher in a separate thread on app startup
def start_file_watcher_thread():
    watcher_thread = threading.Thread(target=start_file_watcher)
    watcher_thread.daemon = True  # Daemonize the thread so it exits when the main program exits
    watcher_thread.start()

# FastAPI event to start the file watcher when the app starts
@app.on_event("startup")
async def startup_event():
    start_file_watcher_thread()  # Start the file watcher in the background
    logging.info("File watcher has been started in the background.")

# Route to check if the file watcher is active
@app.get("/check_file_watcher")
async def check_file_watcher():
    return {"status": "success", "message": "File watcher is running in the background."}

# Root endpoint for health check
@app.get("/api")
async def read_root():
    return {"message": "Payment API is up and running!"}

templates = Jinja2Templates(directory="./dist/browser")

# Mounts the `static` folder within the `build` folder to the `/static` route.
if not Path("./dist/browser/assets").exists():
    logger.error("Directory './dist/browser/assets' does not exist")
else:
    app.mount("/assets", StaticFiles(directory="./dist/browser/assets"), "assets")


# Defines a route handler for `/*` essentially.
# NOTE: this needs to be the last route defined b/c it's a catch all route

@app.get("/{rest_of_path:path}")
async def ui(req: Request, rest_of_path: str):
    return templates.TemplateResponse("index.html", {"request": req})
