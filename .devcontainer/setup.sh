#!/bin/bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Generate a real SECRET_KEY for this Codespace
SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
printf "SECRET_KEY=%s\nALGORITHM=HS256\nACCESS_TOKEN_EXPIRE_MINUTES=30\n" "$SECRET" > .env

# Install Node dependencies
cd ../agri_sys
npm install

echo "✅ Setup complete. The servers will start automatically."
