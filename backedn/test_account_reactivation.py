#!/usr/bin/env python3
"""
Test script for account reactivation endpoint
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

def test_reactivation():
    """Test the account reactivation endpoint"""
    
    # Test data
    reactivation_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        # Make request to reactivation endpoint
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/account/reactivate",
            json=reactivation_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"Response JSON: {json.dumps(response_json, indent=2)}")
        except json.JSONDecodeError:
            print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ Reactivation endpoint is working correctly!")
        elif response.status_code == 401:
            print("⚠️  Invalid credentials (expected for test)")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the server is running.")
    except Exception as e:
        print(f"❌ Error testing reactivation: {e}")

if __name__ == "__main__":
    print("Testing account reactivation endpoint...")
    test_reactivation()