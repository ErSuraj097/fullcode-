from datetime import timedelta
import os
import json
import ast
from dotenv import load_dotenv
from typing import List

# Load environment variables from .env file if it exists
load_dotenv()





# Set up logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('chatbot_builder.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)





# JWT Configuration
SECRET_KEY = "yethat_chatbot_production_key_2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours



# MySQL Database Configuration
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_DATABASE = "sambhasini"
MYSQL_PORT = 3306





# SQLAlchemy Database URI
DATABASE_URI = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

# Directory setup (keeping for file uploads/storage)
PROJECTS_DIR = "data/chatbots"
USERS_DIR = "data/users"
OTP_DIR = "data/otps"
os.makedirs(OTP_DIR, exist_ok=True)
os.makedirs(PROJECTS_DIR, exist_ok=True)
os.makedirs(USERS_DIR, exist_ok=True)

# Legacy data files (for migration reference)
PROJECTS_FILE = "data/projects.json"
USERS_FILE = "data/users.json"
OTP_FILE  = "data/otps.json"





#Otp configuration
OTP_FILE = "data/otps/otps.json"

# Primary SMTP configuration
SMTP_SERVER = "jethat.in"  
SMTP_PORT   = 587
EMAIL_USER  =  "noreply@jethat.in"  
EMAIL_PASS  =  "Sdk@1259"

# Fallback Gmail SMTP configuration (for testing)
# Uncomment these lines and comment the above if jethat.in doesn't work
# SMTP_SERVER = "smtp.gmail.com"
# SMTP_PORT = 587
# EMAIL_USER = "your-gmail@gmail.com"  # Replace with actual Gmail
# EMAIL_PASS = "your-app-password"     # Use Gmail App Password, not regular password  


# Paytm Configuration
PAYTM_MID = os.getenv('PAYTM_MID', 'Samskr19805871747806')
PAYTM_KEY = os.getenv('PAYTM_KEY', 'esV5D6ui4o4nW5Z7')
PAYTM_ENVIRONMENT = os.getenv('PAYTM_ENVIRONMENT', 'PROD')  # PROD for production
PAYTM_WEBSITE = os.getenv('PAYTM_WEBSITE', 'DEFAULT')  # DEFAULT for production

# Production callback URL - must be accessible from internet
PAYTM_CALLBACK_URL = os.getenv('PAYTM_CALLBACK_URL', 'https://yourdomain.com/api/v1/payments/paytm_callback')

# Frontend URL for Paytm redirects
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://yourdomain.com')

# Flask Configuration
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'  # Production default: False
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 8000))

