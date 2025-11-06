import uuid
from app.services.database import DatabaseService
from config import ACCESS_TOKEN_EXPIRE_MINUTES, USERS_DIR,OTP_DIR
from config import logger
import os, re, json, time, secrets, uuid, smtplib
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from email.mime.text import MIMEText
from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError
from app.utils.security import (
    hash_password, verify_password, create_access_token,
    token_required, admin_required
)

from config import OTP_FILE, SMTP_PORT, SMTP_SERVER, EMAIL_PASS,EMAIL_USER 
from email.utils import formataddr
auth_bp = Blueprint('auth', __name__)    

import html

def test_sdk(data):
    data = data.replace("'", "")
    data = data.replace(",", "")
    data = data.replace("=", "")
    data = data.replace(";", "")
    data = data.replace("--", "")
    data = data.replace("+", "")
    data = data.strip()
    data = data.replace("\\", "") 
    data = html.escape(data)
    return data



@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data or not all(k in data for k in ('name', 'email', 'password')):
            return jsonify({"error": "Missing required fields"}), 400

        try:

            if data['email'].endswith(('@example.com', '@test.com', '@localhost')):   # For development, allow common test domains

                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_pattern, data['email']):
                    raise EmailNotValidError("Invalid email format")
            else:
                validate_email(data['email'])  # Use strict validation for real domains
        except EmailNotValidError:
            return jsonify({"error": "Invalid email address"}), 400


        if len(data['password']) < 5:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        # Check if OTP was recently verified for this email
        otp_code = data.get('otp', '')
        if not otp_code:
            return jsonify({"error": "OTP is required for registration"}), 400
        
        if not otp_code.isdigit() or len(otp_code) != 4:
            return jsonify({"error": "OTP must be a 4-digit number"}), 400
            
        if not DatabaseService.check_otp_verified(data['email'], otp_code):
            return jsonify({"error": "OTP verification required. Please verify your email first."}), 400

        if DatabaseService.get_user_by_email(data['email']):
            return jsonify({"error": "Email already registered"}), 400

        # Create new user
        hashed_password = hash_password(data['password'])
        new_user = DatabaseService.create_user(
            name=data['name'],
            email=test_sdk(data['email']),
            password=hashed_password,
            role="user"
        )

        if not new_user:
            return jsonify({"error": "Failed to create user"}), 500

        user_dir = os.path.join(USERS_DIR, new_user.id)
        os.makedirs(user_dir, exist_ok=True)

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.id, "role": new_user.role}, expires_delta=access_token_expires
        )

        user_response = new_user.to_dict()

        # Send welcome email
        try:
            send_welcome_email(data['email'], data['name'])
            logger.info(f"Welcome email sent to {data['email']}")
        except Exception as email_error:
            logger.error(f"Failed to send welcome email to {data['email']}: {email_error}")
            # Don't fail registration if email fails

        logger.info(f"New user registered: {data['email']}")

        return jsonify({
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        })
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/admin/register', methods=['POST'])
def admin_register():
    try:
        data = request.get_json()

        if not data or not all(k in data for k in ('name', 'email', 'password')):
            return jsonify({"error": "Missing required fields"}), 400

        try:

            if data['email'].endswith(('@example.com', '@test.com', '@localhost')):   # For development, allow common test domains

                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_pattern, data['email']):
                    raise EmailNotValidError("Invalid email format")
            else:
                validate_email(data['email'])  # Use strict validation for real domains
        except EmailNotValidError:
            return jsonify({"error": "Invalid email address"}), 400


        if len(data['password']) < 5:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        # Check if OTP is verified for this email
        if not DatabaseService.verify_otp(data['email'], data.get('otp', '')):
            return jsonify({"error": "OTP verification required. Please verify your email first."}), 400

        if DatabaseService.get_user_by_email(data['email']):
            return jsonify({"error": "Email already registered"}), 400

        # Create new admin user
        hashed_password = hash_password(data['password'])
        new_user = DatabaseService.create_user(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            role="admin"
        )

        if not new_user:
            return jsonify({"error": "Failed to create admin user"}), 500

        user_dir = os.path.join(USERS_DIR, new_user.id)
        os.makedirs(user_dir, exist_ok=True)

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.id, "role": new_user.role}, expires_delta=access_token_expires
        )

        user_response = new_user.to_dict()

        # Send welcome email
        try:
            send_welcome_email(data['email'], data['name'])
            logger.info(f"Welcome email sent to admin {data['email']}")
        except Exception as email_error:
            logger.error(f"Failed to send welcome email to admin {data['email']}: {email_error}")
            # Don't fail registration if email fails

        logger.info(f"New admin user registered: {data['email']}")

        return jsonify({
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        })
    except Exception as e:
        logger.error(f"Admin registration error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('email', 'password')):
            return jsonify({"error": "Missing email or password"}), 400
        
        email = test_sdk(data['email'])
        # password = data['password'].strip()
        
        # user_obj = DatabaseService.get_user_by_email(data['email'])
        user_obj = DatabaseService.get_user_by_email(email)
        
        # Check if user doesn't exist
        if not user_obj:
            return jsonify({"error": "User not found", "error_code": "USER_NOT_FOUND"}), 404
        
        # Check if password is incorrect
        if not verify_password(data['password'], user_obj.password):
            return jsonify({"error": "Incorrect password"}), 401
        
        if not user_obj.is_active:
            return jsonify({"error": "Inactive user"}), 400
    
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_obj.id, "role": user_obj.role}, expires_delta=access_token_expires
        )
        
        user_response = user_obj.to_dict()
        
        logger.info(f"User logged in: {data['email']}")
        return jsonify({
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        })
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/me')
@token_required
def get_current_user_info(current_user):
    return jsonify({
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "created_at": current_user["created_at"],
        "role": current_user["role"]
    })

# -----------------------------OTP Configuration--------------
def generate_otp(length=4):
    return "".join(secrets.choice("123456789") for _ in range(length))

def send_email(to_email, subject, body):
    # msg = MIMEText(body)
    msg = MIMEText(body, "html") 

    msg["Subject"] = subject

    # Add friendly name here 👇
    msg["From"] = formataddr(("Sambhāṣinī संभाषिणी", EMAIL_USER))
    # msg["From"] = EMAIL_USER
    msg["To"]      = to_email
    # msg["name"]     = "sambhasini"
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)


def send_welcome_email(user_email, user_name):
    """Send welcome email to newly registered user"""
    
    welcome_email_template = f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Sambhāṣinī - Account Created Successfully!</title>
</head>

<body style="font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            color: #333;
            line-height: 1.6;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;">
  
    <div class="email-container" style="max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid rgb(153, 152, 152);
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;">
      
        <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
            padding: 30px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            color: white;
            position: relative;
            overflow: hidden;">
          
            <div class="logo-container" style="display: flex;
            align-items: center;
            margin-bottom: 15px;">
              
                <img src="https://i.postimg.cc/jj4T7GRX/Screenshot-2025-09-28-at-12-44-40-AM-removebg-preview.png"
                    alt="Sambhāṣinī Logo" class="logo" style="height: 50px;
            filter: brightness(0) invert(1);">
            
            </div>
        </div>

        <div class="content" style="padding: 40px 35px;">
            <h2 class="greeting" style="font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1e293b;">🎉 Welcome to Sambhāṣinī, {user_name}!</h2>

            <p class="message" style="margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                Congratulations! Your account has been successfully created. You're now part of the 
                <span class="highlight" style="color: #10b981;
            font-weight: 600;">Sambhāṣinī</span> community, where you can build powerful AI chatbots 
                with ease.
            </p>

            <div class="success-section" style="background: linear-gradient(to right, #d1fae5, #a7f3d0);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #6ee7b7;
            position: relative;
            overflow: hidden;">
                <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
                <p class="success-label" style="font-size: 18px;
            color: #065f46;
            margin-bottom: 10px;
            font-weight: 600;">Account Successfully Created!</p>
                <p style="font-size: 14px;
            color: #047857;
            margin: 0;">You can now start building amazing chatbots</p>
            </div>

            <div class="features-section" style="margin: 30px 0;">
                <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 20px;">🚀 What you can do now:</h3>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
                        <div style="font-size: 24px; margin-right: 15px;">🤖</div>
                        <div>
                            <strong style="color: #1e293b;">Create AI Chatbots</strong>
                            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Build intelligent chatbots with advanced AI capabilities</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 24px; margin-right: 15px;">🌍</div>
                        <div>
                            <strong style="color: #1e293b;">Multi-language Support</strong>
                            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Create chatbots that speak multiple languages</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                        <div style="font-size: 24px; margin-right: 15px;">🎨</div>
                        <div>
                            <strong style="color: #1e293b;">Custom Styling</strong>
                            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Customize your chatbot's appearance and behavior</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://sambhasini.jethat.in/login" 
                   style="display: inline-block;
                          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                          color: white;
                          padding: 15px 30px;
                          text-decoration: none;
                          border-radius: 8px;
                          font-weight: 600;
                          font-size: 16px;
                          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                          transition: all 0.3s ease;">
                    🚀 Start Building Now
                </a>
            </div>

            <div class="tips-section" style="background-color: #fef3cd;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
            font-size: 14px;
            color: #92400e;">
                <strong>💡 Pro Tip:</strong> Start with our templates to quickly create your first chatbot, 
                then customize it to match your brand and requirements.
            </div>

            <p class="message" style="margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                If you have any questions or need help getting started, our support team is here to assist you.
            </p>

            <p class="message" style="margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                Best regards,<br>
                <strong>The Sambhāṣinī Team</strong>
            </p>
        </div>

        <div class="footer" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;">

            <p class="contact-info" style="font-size: 14px;
            color: #cbd5e1;
            margin-bottom: 10px;">
                Phone: <a href="tel:+911204188947" style="color: #10b981;
            text-decoration: none;
            transition: color 0.2s ease;">+91-120 4188947</a> |
                Email: <a href="mailto:ai@jethat.in" style="color: #10b981;
            text-decoration: none;
            transition: color 0.2s ease;">ai@jethat.in</a>
            </p>

            <p class="copyright" style="font-size: 13px;
            color: #94a3b8;
            margin-top: 15px;">
                &copy; 2025 Sambhāṣinī. All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>"""
    
    send_email(user_email, "🎉 Welcome to Sambhāṣinī - Your Account is Ready!", welcome_email_template)


# --------------- OTP Routes -----------------------------
@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    user_email = data.get("email")

    if not user_email:
        return jsonify({"error": "Email is required"}), 400

        user = DatabaseService.get_user_by_email(user_email)
        if not user:
            # For security, don't reveal if email exists
            return jsonify({"message": "If the email exists, an OTP has been sent"}), 200
    
    if not user_email:
        return jsonify({"error": "Email is required"}), 400

    otp = generate_otp()
    DatabaseService.save_otp(user_email, otp, ttl_minutes=5)




    # ---------------Mail Templates ---------------

    mail_otp = f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sambhāṣinī OTP Verification</title>
 
</head>

<body style="font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            color: #333;
            line-height: 1.6;

            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;">
  
  
    <div class="email-container" style="max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid rgb(153, 152, 152);
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;">
      
      
        <div class="header" style=" background: linear-gradient(1135deg, #3d1301 0%, #7e2020 50%, #ff3700 100%);
            padding: 30px;
            width: 100%;
         display: flex;
         justify-content: space-between;
            color: white;
            position: relative;
            overflow: hidden;">
          
          
            <div class="logo-container" style="display: flex;

            align-items: center;
            margin-bottom: 15px;">
              
              
                <img src="https://i.postimg.cc/jj4T7GRX/Screenshot-2025-09-28-at-12-44-40-AM-removebg-preview.png"
                    alt="Sambhāṣinī Logo" class="logo" style="   height: 50px;
            filter: brightness(0) invert(1);">
            
            
            </div>
           
            <!--<h1 class="brand-name">Sambhāṣinī</h1>-->
            <!-- <p class="tagline">Sambhāṣinī(संभाषिणी) - Empowering Conversations</p> -->
        </div>

        <div class="content" style=" padding: 40px 35px;">
            <h2 class="greeting" style="font-size: 22px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1e293b;">Namaste {user_email or 'User'},</h2>

            <p class="message" style=" margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                You're just one step away from accessing your <span class="highlight" style="color: #dc2626;
            font-weight: 600;">
                  
                  Sambhāṣinī</span> account.
                We've sent you a verification code to ensure the security of your account.
            </p>

            <p class="message" style=" margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                This one-time password (OTP) is valid for <span class="highlight" style="            color: #dc2626;
            font-weight: 600;">15 minutes</span> and can only be used
                once.
            </p>

            <div class="otp-section" style=" background: linear-gradient(to right, #fed7aa, #fecdd3);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #fbcfe8;
            position: relative;
            overflow: hidden;">
                <p class="otp-label" style="font-size: 16px;
            color: #7c2d12;
            margin-bottom: 15px;
            font-weight: 500;">Your Verification Code</p>
                <div class="otp-code" onclick="copyOTP(this)" style="  background: #ffffff;
            color: #dc2626;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            padding: 18px 25px;
            border-radius: 10px;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
            border: 1px solid #dbeafe;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            font-family: 'Courier New', monospace;">
                    {otp}
                    <div class="copied-message" id="copiedMsg" style="  position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #10b981;
            color: white;
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
            z-index: 10;">Copied to clipboard!</div>
                </div>
                <p class="otp-instruction" style="font-size: 14px;
            color: #64748b;
            margin-top: 15px;">Click on the code to copy it</p>
            </div>

            <div class="warning" style=" background-color: #fef3cd;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
            font-size: 14px;
            color: #92400e;">
                <strong>Security Notice:</strong> If you did not request this code, please ignore this email or contact
                our support team immediately.
            </div>

            <!-- <p class="message">
                Best regards,<br>
                <strong>The Sambhāṣinī Team</strong>
            </p> -->
        </div>

        <div class="footer" style=" background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;">


            <p class="contact-info" style="font-size: 14px;
            color: #cbd5e1;
            margin-bottom: 10px;">
                Phone: <a href="tel:+911204188947" style="color: #fbbf24;
            text-decoration: none;
            transition: color 0.2s ease;">+91-120 4188947</a> |
                Email: <a href="mailto:ai@jethat.in" style="color: #fbbf24;
            text-decoration: none;
            transition: color 0.2s ease;">ai@jethat.in</a>
            </p>

            <p class="copyright" style=" font-size: 13px;
            color: #94a3b8;
            margin-top: 15px;">
                &copy; 2025 Sambhāṣinī. All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>
    """
    
    
    
    
    
    try:
        send_email(user_email, "Your One-Time Password (OTP)", mail_otp   )
        logger.info(f"OTP sent successfully to {user_email}")
        return jsonify({"message": "OTP sent successfully"})
    except smtplib.SMTPAuthenticationError:
        logger.error(f"SMTP authentication failed for {user_email}")
        return jsonify({"error": "Email service authentication failed. Please contact support."}), 500
    except smtplib.SMTPConnectError:
        logger.error(f"SMTP connection failed for {user_email}")
        return jsonify({"error": "Email service connection failed. Please try again later."}), 500
    except Exception as e:
        logger.error(f"Failed to send OTP to {user_email}: {e}")
        return jsonify({"error": "Failed to send OTP. Please try again."}), 500



@auth_bp.route("/verify-otp", methods=["POST"])
def verify():
    try:
        data = request.get_json()
        email = data.get("email")
        otp = data.get("otp")
        
        if not email or not otp:
            return jsonify({"error": "Email and OTP are required"}), 400
        
        # Validate OTP format (should be 4 digits)
        if not otp.isdigit() or len(otp) != 4:
            return jsonify({"error": "OTP must be a 4-digit number"}), 400

        if DatabaseService.verify_otp(email, otp):
            logger.info(f"OTP verified successfully for {email}")
            return jsonify({"message": "OTP verified successfully"})
        else:
            logger.warning(f"Invalid or expired OTP attempt for {email}")
            return jsonify({"error": "Invalid or expired OTP. Please check your code or request a new one."}), 400
            
    except Exception as e:
        logger.error(f"OTP verification error: {e}")
        return jsonify({"error": "OTP verification failed. Please try again."}), 500

@auth_bp.route("/check-user-existence", methods=["POST"])
def check_user_existence():
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = DatabaseService.get_user_by_email(email)
        exists = user is not None

        return jsonify({"exists": exists})
    except Exception as e:
        logger.error(f"Error checking user existence: {e}")
        return jsonify({"error": "Failed to check user existence"}), 500


# @auth_bp.route('/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
#         if not data or not all(k in data for k in ('email', 'password')):
#             return jsonify({"error": "Missing email or password"}), 400

#         email = data['email']
#         password = data['password']

#         users = load_users()
#         user = get_user_by_email(email)

#         if not user or not verify_password(password, user['password']):
#             return jsonify({"error": "Invalid email or password"}), 401

#         if not user.get('is_active', True):
#             return jsonify({"error": "Account is deactivated"}), 401

#         # Create access token with user data including role
#         access_token = create_access_token(
#             data={
#                 "user_id": user["id"],
#                 "email": user["email"],
#                 "name": user["name"],
#                 "role": user.get("role", "user")
#             }
#         )

#         return jsonify({
#             "access_token": access_token,
#             "user": {
#                 "id": user["id"],
#                 "name": user["name"],
#                 "email": user["email"],
#                 "role": user.get("role", "user")
#             }
#         })

#     except Exception as e:
#         logger.error(f"Login error: {e}")
#         return jsonify({"error": "Login failed"}), 500

# ----------------------------- Forgot Password Routes ------------------------------

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = DatabaseService.get_user_by_email(email)
        if not user:
            # For security, don't reveal if email exists
            return jsonify({"message": "If the email exists, an OTP has been sent"}), 200

        otp = generate_otp()
        DatabaseService.save_otp(email, otp, ttl_minutes=5)

        # Email template for forgot password
        mail_forgot = f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sambhāṣinī Password Reset</title>
</head>

<body style="font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            color: #333;
            line-height: 1.6;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;">
  
    <div class="email-container" style="max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid rgb(153, 152, 152);
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;">
      
        <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
            padding: 30px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            color: white;
            position: relative;
            overflow: hidden;">
          
            <div class="logo-container" style="display: flex;
            align-items: center;
            margin-bottom: 15px;">
              
                <img src="https://i.postimg.cc/jj4T7GRX/Screenshot-2025-09-28-at-12-44-40-AM-removebg-preview.png"
                    alt="Sambhāṣinī Logo" class="logo" style="height: 50px;
            filter: brightness(0) invert(1);">
            
            </div>
        </div>

        <div class="content" style="padding: 40px 35px;">
            <h2 class="greeting" style="font-size: 22px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1e293b;">Namaste {user.name if user else 'User'},</h2>
            
            <h3 style="font-size: 18px;
            font-weight: 500;
            margin-bottom: 15px;
            color: #dc2626;">🔐 Password Reset Request</h3>

            <p class="message" style="margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                You requested a password reset for your <span class="highlight" style="color: #dc2626;
            font-weight: 600;">Sambhāṣinī</span> account.
                We've sent you a verification code to reset your password securely.
            </p>

            <p class="message" style="margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                This one-time password (OTP) is valid for <span class="highlight" style="color: #dc2626;
            font-weight: 600;">5 minutes</span> and can only be used once.
            </p>

            <div class="otp-section" style="background: linear-gradient(to right, #fecaca, #fca5a5);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #f87171;
            position: relative;
            overflow: hidden;">
                <p class="otp-label" style="font-size: 16px;
            color: #7f1d1d;
            margin-bottom: 15px;
            font-weight: 500;">Your Password Reset Code</p>
                <div class="otp-code" style="background: #ffffff;
            color: #dc2626;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            padding: 18px 25px;
            border-radius: 10px;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
            border: 1px solid #fecaca;
            font-family: 'Courier New', monospace;">
                    {otp}
                </div>
                <p class="otp-instruction" style="font-size: 14px;
            color: #64748b;
            margin-top: 15px;">Enter this code to reset your password</p>
            </div>

            <div class="warning" style="background-color: #fef3cd;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
            font-size: 14px;
            color: #92400e;">
                <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email 
                or contact our support team immediately. Your account remains secure.
            </div>

            <p class="message" style="margin-bottom: 25px;
            color: #475569;
            font-size: 16px;
            line-height: 1.7;">
                Best regards,<br>
                <strong>The Sambhāṣinī Team</strong>
            </p>
        </div>

        <div class="footer" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;">

            <p class="contact-info" style="font-size: 14px;
            color: #cbd5e1;
            margin-bottom: 10px;">
                Phone: <a href="tel:+911204188947" style="color: #fbbf24;
            text-decoration: none;
            transition: color 0.2s ease;">+91-120 4188947</a> |
                Email: <a href="mailto:ai@jethat.in" style="color: #fbbf24;
            text-decoration: none;
            transition: color 0.2s ease;">ai@jethat.in</a>
            </p>

            <p class="copyright" style="font-size: 13px;
            color: #94a3b8;
            margin-top: 15px;">
                &copy; 2025 Sambhāṣinī. All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>"""

        try:
            send_email(email, "Password Reset OTP", mail_forgot)
            logger.info(f"Password reset OTP sent to {email}")
            return jsonify({"message": "OTP sent successfully"}), 200
        except Exception as e:
            logger.error(f"Failed to send reset OTP to {email}: {e}")
            return jsonify({"error": "Failed to send OTP"}), 500
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        email = data.get("email")
        otp = data.get("otp")
        new_password = data.get("new_password")

        if not all([email, otp, new_password]):
            return jsonify({"error": "Email, OTP, and new password are required"}), 400

        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        if not DatabaseService.verify_otp(email, otp):
            return jsonify({"error": "Invalid or expired OTP"}), 400

        user = DatabaseService.get_user_by_email(email)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update password
        if not DatabaseService.update_user_password(email, hash_password(new_password)):
            return jsonify({"error": "Failed to update password"}), 500

        logger.info(f"Password reset for {email}")
        return jsonify({"message": "Password reset successfully"}), 200
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({"error": "Internal server error"}), 500

# ----------------------------- Admin Routes ------------------------------


@auth_bp.route("/admin/users", methods=["GET"])
@admin_required
def get_all_users(current_user):
    try:
        users = DatabaseService.get_all_users()
        # Return user list without passwords
        user_list = [user.to_dict() for user in users]
        return jsonify(user_list), 200
    except Exception as e:
        logger.error(f"Get all users error: {e}")
        return jsonify({"error": "Internal server error"}), 500

# ----------------------------- Account Management Routes ------------------------------

@auth_bp.route("/account/deactivate", methods=["POST"])
@token_required
def deactivate_account(current_user):
    """Deactivate user's own account"""
    try:
        data = request.get_json()
        password = data.get('password')
        reason = data.get('reason', 'User requested deactivation')
        
        if not password:
            return jsonify({"error": "Password is required to deactivate account"}), 400
        
        # Verify password
        from app.models import User
        user = User.query.filter_by(id=current_user["id"]).first()
        if not user or not verify_password(password, user.password):
            return jsonify({"error": "Invalid password"}), 401
        
        # Deactivate account
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        from app.models import db
        db.session.commit()
        
        logger.info(f"User {user.email} deactivated their account. Reason: {reason}")
        
        # Send deactivation confirmation email
        try:
            send_deactivation_email(user.email, user.name)
        except Exception as email_error:
            logger.warning(f"Failed to send deactivation email: {email_error}")
        
        return jsonify({
            "message": "Account deactivated successfully",
            "deactivated_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Account deactivation error: {e}")
        return jsonify({"error": "Failed to deactivate account"}), 500

@auth_bp.route("/account/delete/initiate", methods=["POST"])
@token_required
def initiate_account_deletion(current_user):
    """Initiate account deletion process by validating password/confirmation and sending OTP"""
    try:
        data = request.get_json()
        password = data.get('password')
        confirmation = data.get('confirmation', '')

        if not password:
            return jsonify({"error": "Password is required to delete account"}), 400

        if confirmation.lower() != 'delete my account':
            return jsonify({"error": "Please type 'DELETE MY ACCOUNT' to confirm"}), 400

        # Verify password
        from app.models import User
        user = User.query.filter_by(id=current_user["id"]).first()
        if not user or not verify_password(password, user.password):
            return jsonify({"error": "Invalid password"}), 401

        # Generate and save OTP for account deletion
        otp = generate_otp()
        DatabaseService.save_otp(user.email, otp, ttl_minutes=5)

        # Send deletion OTP email
        try:
            send_deletion_otp_email(user.email, user.name, otp)
            logger.info(f"Account deletion OTP sent to {user.email}")
        except Exception as email_error:
            logger.error(f"Failed to send deletion OTP to {user.email}: {email_error}")
            return jsonify({"error": "Failed to send verification code. Please try again."}), 500

        return jsonify({
            "message": "Verification code sent to your email. Please verify to complete account deletion.",
            "otp_sent": True
        }), 200

    except Exception as e:
        logger.error(f"Account deletion initiation error: {e}")
        return jsonify({"error": "Failed to initiate account deletion"}), 500


@auth_bp.route("/account/delete", methods=["DELETE"])
@token_required
def delete_account(current_user):
    """Permanently delete user's own account and all associated data after OTP verification"""
    try:
        data = request.get_json()
        otp = data.get('otp')

        if not otp:
            return jsonify({"error": "OTP verification required"}), 400

        if not otp.isdigit() or len(otp) != 4:
            return jsonify({"error": "OTP must be a 4-digit number"}), 400

        # Verify OTP
        from app.models import User
        user = User.query.filter_by(id=current_user["id"]).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not DatabaseService.verify_otp(user.email, otp):
            return jsonify({"error": "Invalid or expired OTP"}), 400

        # Get user data for email before deletion
        user_email = user.email
        user_name = user.name
        from app.models import Project
        user_projects_count = Project.query.filter_by(user_id=user.id).count()

        # Delete all user's projects and associated data
        projects = Project.query.filter_by(user_id=user.id).all()
        for project in projects:
            # Delete project files
            import shutil
            from config import PROJECTS_DIR
            project_dir = os.path.join(PROJECTS_DIR, project.id)
            if os.path.exists(project_dir):
                try:
                    shutil.rmtree(project_dir)
                except Exception as file_error:
                    logger.warning(f"Failed to delete project files for {project.id}: {file_error}")

        # Delete user and all associated data (cascade will handle projects)
        from app.models import db
        db.session.delete(user)
        db.session.commit()

        logger.info(f"User {user_email} permanently deleted their account with {user_projects_count} projects")

        # Send deletion confirmation email
        try:
            send_deletion_email(user_email, user_name, user_projects_count)
        except Exception as email_error:
            logger.warning(f"Failed to send deletion email: {email_error}")

        return jsonify({
            "message": "Account and all associated data deleted successfully",
            "deleted_at": datetime.utcnow().isoformat(),
            "projects_deleted": user_projects_count
        }), 200

    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        return jsonify({"error": "Failed to delete account"}), 500

@auth_bp.route("/account/reactivate", methods=["POST"])
def reactivate_account():
    """Reactivate a deactivated account"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find deactivated user
        from app.models import User
        user = User.query.filter_by(email=email, is_active=False).first()
        if not user or not verify_password(password, user.password):
            return jsonify({"error": "Invalid credentials or account not found"}), 401
        
        # Reactivate account
        user.is_active = True
        user.updated_at = datetime.utcnow()
        
        from app.models import db
        db.session.commit()
        
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "role": user.role}, expires_delta=access_token_expires
        )
        
        logger.info(f"User {user.email} reactivated their account")
        
        # Send reactivation confirmation email
        try:
            send_reactivation_email(user.email, user.name)
        except Exception as email_error:
            logger.warning(f"Failed to send reactivation email: {email_error}")
        
        # Prepare response data
        response_data = {
            "message": "Account reactivated successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": user.to_dict(),
            "reactivated_at": datetime.utcnow().isoformat()
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Account reactivation error: {e}")
        return jsonify({"error": "Failed to reactivate account"}), 500

@auth_bp.route("/account/info", methods=["GET"])
@token_required
def get_account_info(current_user):
    """Get detailed account information"""
    try:
        from app.models import User, Project
        user = User.query.filter_by(id=current_user["id"]).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get account statistics
        projects_count = Project.query.filter_by(user_id=user.id).count()
        trained_models = Project.query.filter_by(user_id=user.id, training_status='trained').count()
        
        account_info = {
            "user": user.to_dict(),
            "statistics": {
                "total_projects": projects_count,
                "trained_models": trained_models,
                "account_age_days": (datetime.utcnow() - user.created_at).days if user.created_at else 0,
                "last_login": user.updated_at.isoformat() if user.updated_at else None
            },
            "account_status": {
                "is_active": user.is_active,
                "can_deactivate": True,
                "can_delete": True,
                "deletion_warning": f"Deleting your account will permanently remove {projects_count} projects and all associated data."
            }
        }
        
        return jsonify(account_info), 200
        
    except Exception as e:
        logger.error(f"Get account info error: {e}")
        return jsonify({"error": "Failed to get account information"}), 500

# Email notification functions
def send_deactivation_email(user_email, user_name):
    """Send account deactivation confirmation email"""
    subject = "Account Deactivated - Sambhasini AI"
    body = f"""
    <html>
    <body>
        <h2>Account Deactivated</h2>
        <p>Hello {user_name},</p>
        <p>Your Sambhasini AI account has been successfully deactivated as requested.</p>
        <p><strong>What this means:</strong></p>
        <ul>
            <li>You can no longer log in to your account</li>
            <li>Your projects and data are preserved</li>
            <li>You can reactivate your account anytime by logging in</li>
        </ul>
        <p>To reactivate your account, simply visit our login page and enter your credentials.</p>
        <p>If you didn't request this deactivation, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>The Sambhasini AI Team</p>
    </body>
    </html>
    """
    send_email(user_email, subject, body)

def send_deletion_otp_email(user_email, user_name, otp):
    """Send OTP email for account deletion confirmation"""
    subject = "Account Deletion Verification - Sambhāṣinī"
    body = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Deletion Verification</title>
</head>
<body style="font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%); color: #333; line-height: 1.6; padding: 20px; min-height: 100vh; display: flex; justify-content: center; align-items: center;">
    <div class="email-container" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid rgb(153, 152, 152); overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);">
        <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); padding: 30px; color: white; text-align: center;">
            <img src="https://i.postimg.cc/jj4T7GRX/Screenshot-2025-09-28-at-12-44-40-AM-removebg-preview.png" alt="Sambhāṣinī Logo" style="height: 50px; filter: brightness(0) invert(1);">
            <h1 style="margin: 10px 0 0 0; font-size: 24px;">Account Deletion Verification</h1>
        </div>
        <div class="content" style="padding: 40px;">
            <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 20px; color: #1e293b;">Hello {user_name},</h2>
            <p style="margin-bottom: 25px; color: #475569; font-size: 16px; line-height: 1.7;">You have requested to permanently delete your Sambhāṣinī account. This action cannot be undone and will remove all your projects, data, and trained models.</p>
            <div style="background: linear-gradient(to right, #fecaca, #fca5a5); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; border: 1px solid #f87171;">
                <p style="font-size: 16px; color: #7f1d1d; margin-bottom: 15px; font-weight: 500;">Your Deletion Verification Code</p>
                <div style="background: #ffffff; color: #dc2626; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 18px 25px; border-radius: 10px; display: inline-block; margin: 10px 0; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15); border: 1px solid #fecaca; font-family: 'Courier New', monospace;">{otp}</div>
                <p style="font-size: 14px; color: #64748b; margin-top: 15px;">Enter this code to confirm account deletion</p>
            </div>
            <div style="background-color: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #92400e;">
                <strong>⚠️ Warning:</strong> This will permanently delete your account and all associated data. If you did not request this, ignore this email and contact support.
            </div>
            <p style="margin-bottom: 25px; color: #475569; font-size: 16px; line-height: 1.7;">Best regards,<br><strong>The Sambhāṣinī Team</strong></p>
        </div>
        <div class="footer" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; color: #cbd5e1;">
            <p style="font-size: 14px; margin-bottom: 10px;">Phone: <a href="tel:+911204188947" style="color: #fbbf24; text-decoration: none;">+91-120 4188947</a> | Email: <a href="mailto:ai@jethat.in" style="color: #fbbf24; text-decoration: none;">ai@jethat.in</a></p>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 15px;">&copy; 2025 Sambhāṣinī. All rights reserved.</p>
        </div>
    </div>
</body>
</html>"""
    send_email(user_email, subject, body)

def send_deletion_email(user_email, user_name, projects_count):
    """Send account deletion confirmation email"""
    subject = "Account Deleted - Sambhasini AI"
    body = f"""
    <html>
    <body>
        <h2>Account Permanently Deleted</h2>
        <p>Hello {user_name},</p>
        <p>Your Sambhasini AI account has been permanently deleted as requested.</p>
        <p><strong>What was deleted:</strong></p>
        <ul>
            <li>Your user account and profile</li>
            <li>{projects_count} projects and all associated data</li>
            <li>All trained models and configurations</li>
            <li>All chat history and analytics</li>
        </ul>
        <p><strong>Important:</strong> This action cannot be undone. All your data has been permanently removed from our systems.</p>
        <p>Thank you for using Sambhasini AI. We're sorry to see you go!</p>
        <p>If you change your mind, you're always welcome to create a new account.</p>
        <br>
        <p>Best regards,<br>The Sambhasini AI Team</p>
    </body>
    </html>
    """
    send_email(user_email, subject, body)

def send_reactivation_email(user_email, user_name):
    """Send account reactivation confirmation email"""
    subject = "Welcome Back - Account Reactivated - Sambhasini AI"
    body = f"""
    <html>
    <body>
        <h2>Welcome Back!</h2>
        <p>Hello {user_name},</p>
        <p>Your Sambhasini AI account has been successfully reactivated!</p>
        <p><strong>Your account is now active:</strong></p>
        <ul>
            <li>You can log in and access all features</li>
            <li>All your projects and data are restored</li>
            <li>Your trained models are ready to use</li>
        </ul>
        <p>We're glad to have you back! Start building amazing chatbots with our AI platform.</p>
        <p>If you have any questions or need assistance, our support team is here to help.</p>
        <br>
        <p>Best regards,<br>The Sambhasini AI Team</p>
    </body>
    </html>
    """
    send_email(user_email, subject, body)