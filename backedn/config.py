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
SMTP_SERVER = "jethat.in"  
SMTP_PORT   = 587
EMAIL_USER  =  "noreply@jethat.in"  
EMAIL_PASS  =  "Sdk@1259"  


# Flask Configuration
DEBUG = True
HOST = "0.0.0.0"
PORT = 8000

