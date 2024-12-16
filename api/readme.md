# Backend for Payment System

This is the backend implementation of the payment system using Python 3.10.0 and FastAPI. It provides a set of web services to manage payment records, including functionality for uploading and downloading evidence files when the payment status is updated to "completed".

## Setup Instructions

### Clone the Repository

Clone this repository to your local machine using Git.

```bash
git clone https://github.com/your-username/payment-backend.git
```

- Create a Virtual Environment
  Create a virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment:

- For MacOS/Linux:

```bash
source venv/bin/activate
```

### Install Dependencies

The required libraries and dependencies are listed in the requirements.txt file. You can install them by running:

```bash
pip install -r requirements.txt
```

### Set Up MongoDB

Ensure you have MongoDB running locally or use a remote MongoDB instance. If you are running MongoDB locally, use the default URI: mongodb://localhost:27017/.

```bash
brew tap mongodb/brew
```

```bash
brew install mongodb-community
```

- To start MongoDB locally

```bash
brew services start mongodb-community
```

- To stop MongoDB locally

```bash
brew services stop mongodb-community
```

### Run the Application

Once you have set up your environment and dependencies, you can run the FastAPI backend using Uvicorn. Run the following command:

```bash
uvicorn app.main:app --reload
```

This will start the FastAPI server at http://127.0.0.1:8000, with hot reloading enabled during development.

### API Reference
