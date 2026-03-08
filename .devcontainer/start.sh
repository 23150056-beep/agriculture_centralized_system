#!/bin/bash
# Start backend
(cd backend && uvicorn main:app --host 0.0.0.0 --port 8001 --reload > /tmp/backend.log 2>&1) &

# Start frontend
(cd agri_sys && npm run dev -- --host > /tmp/frontend.log 2>&1) &

echo "🚀 Backend on port 8001 | Frontend on port 5173"
