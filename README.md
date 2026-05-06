# Rolynq - 12-Dimensional Job Search & Application Engine

A dual-stack application consisting of a Flask-based backend APIs and a React (Vite) frontend for rule-based job scoring, template email generation, and multi-source job aggregation.

## Project Structure
```text
ankur-hunt/
│
├── backend/            # Flask API, Scoring Engine, Integrations
│   └── app.py          # Main backend server
│
├── frontend/           # React + Vite application
│   └── src/            # UI components and pages
│
├── .env                # Secret API Keys and Configurations 
├── .env.example        # Template for .env (Do not put real keys here)
└── requirements.txt    # Python Dependencies
```

## Setup & Installation

### 1. Backend (Python/Flask)
You will need Python installed on your system.

```bash
# In the root 'ankur-hunt' directory, install dependencies
pip install -r requirements.txt
```

### 2. Frontend (React/Vite)
You will need [Node.js](https://nodejs.org/) installed on your system.

```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install
```

### 3. Environment Variables
This project requires several API keys to operate fully (Notion, Google Sheets, Slack, Job APIs). 

1. Create a file named `.env` in the root `ankur-hunt` folder.
2. Copy the contents of `.env.example` into `.env`.
3. Fill in your actual secret keys in `.env`. 

*(Do not share or commit your `.env` file to version control)*

## Running the Application

### Automated (One-Click)
Run the following script from the root directory to launch both Backend and Frontend in separate windows:
```bash
start_app.bat
```

### Manual Method

#### 1. Start the Backend
Open a terminal in the root directory and run:
```bash
venv\Scripts\activate
python backend/app.py
```
*The backend will start on `http://127.0.0.1:5001`.*

#### 2. Start the Frontend
Open a new, separate terminal and run:
```bash
cd frontend
npm run dev
```
*The frontend will start on `http://localhost:5173`.*
