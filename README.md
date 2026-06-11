# Product Specification & Technical Drawing Library
**Sv Closures Packaging Solutions**

This repository contains the Product Specification & Technical Drawing Library, built as a working prototype to digitize Sv Closures' packaging closure specifications, technical drawing refs, material standards, and tolerance logs.

## Tech Stack
- **Frontend**: React + Vite, Vanilla CSS, Lucide Icons
- **Backend**: Node.js, Express API router, CORS
- **Database**: Portability-focused JSON file-backed SQLite adapter (no local server compile needed!)
- **Testing**: Automated Rules Engine runner, Integration Test Case logs

---

## Getting Started

### 1. Run the Backend Server
First install dependencies and launch the API server:
```bash
cd backend
npm install
npm start
```
The server will boot on [http://localhost:5000](http://localhost:5000) and automatically seed `database.json` with 5 default records.

### 2. Run the Frontend App
Next, boot up the Vite + React dev server:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Core Logic Rules Tests
To verify the rules parsing engine constraints:
```bash
cd tests
node runTests.js
```
All 10 test cases must run and show `[PASS]` status.
