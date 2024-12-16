import os
import time
import logging
from pathlib import Path
from app.services.csv_service import normalize_and_save_csv 

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger(__name__)

# Directory to watch for new CSV files
WATCH_DIRECTORY = Path("./")  # Assuming the CSVs are in the root directory of the project

def start_file_watcher():
    logger.info("File watcher started, monitoring directory: %s", WATCH_DIRECTORY)

    processed_files = set()

    while True:
        try:
            # Get the list of CSV files in the directory
            for file_path in WATCH_DIRECTORY.glob("*.csv"):  # Watching only CSV files
                if file_path not in processed_files:
                    logger.info("New file detected: %s", file_path)
                    normalize_and_save_csv(file_path)  # Process the new CSV file
                    processed_files.add(file_path)  # Mark the file as processed

            time.sleep(5)  # Check for new files every 5 seconds

        except Exception as e:
            logger.error("Error in file watcher: %s", str(e))
            time.sleep(5)  # Wait a bit before retrying
