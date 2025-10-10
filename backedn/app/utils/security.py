# Utility functions
import os
# import json
import functools
from datetime import datetime, timedelta
from typing import Optional
from flask import request, jsonify
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from app.services.database import DatabaseService
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from config import logger

def hash_password(password: str) -> str:
    return generate_password_hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return check_password_hash(hashed_password, plain_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    user = DatabaseService.get_user_by_email(email)
    return user.to_dict() if user else None

def get_user_by_id(user_id: str):
    user = DatabaseService.get_user_by_id(user_id)
    return user.to_dict() if user else None

def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                return jsonify({'message': 'Invalid token'}), 401

            current_user = get_user_by_id(user_id)
            if current_user is None:
                return jsonify({'message': 'User not found'}), 401

            # Add role from payload to current_user
            current_user["role"] = payload.get("role", "user")

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def admin_required(f):
    @functools.wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.get("role") != "admin":
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)

    return decorated
