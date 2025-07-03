#!/usr/bin/env python3
"""
Test script for HarmoniAI Routing Agent
Demonstrates the routing agent functionality with different user scenarios
"""

import requests
import json
import time

# Django server configuration
BASE_URL = "http://localhost:8000/api/routing"

def test_health_check():
    """Test the health check endpoint."""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health/")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django is running.")
        return False
    return True

def test_anxiety_case():
    """Test classification for an anxiety case."""
    print("\n🧠 Testing Anxiety Case...")
    
    data = {
        "user_id": "user_001",
        "session_id": "session_001",
        "initial_message": "I've been feeling really anxious lately. I can't stop worrying about work and my heart races when I think about upcoming presentations. I'm having trouble sleeping because my mind won't stop racing with thoughts about everything that could go wrong.",
        "clinical_scores": {
            "gad7": 15,  # Severe anxiety
            "phq9": 8,   # Mild depression
            "pcl5": 5,   # Minimal trauma
            "gad7_1": 3, "gad7_2": 2, "gad7_3": 3, "gad7_4": 2,
            "gad7_5": 2, "gad7_6": 1, "gad7_7": 2
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/classify/", json=data)
        if response.status_code == 201:
            result = response.json()
            print("✅ Anxiety case classified successfully")
            print(f"   Category: {result['category']}")
            print(f"   Severity: {result['severity']}")
            print(f"   Confidence: {result['confidence']:.0%}")
            print(f"   Primary Agent: {result['primary_agent']}")
            print(f"   Urgency: {result['urgency_level']}")
            return result['conversation_id']
        else:
            print(f"❌ Classification failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_depression_case():
    """Test classification for a depression case."""
    print("\n💙 Testing Depression Case...")
    
    data = {
        "user_id": "user_002",
        "session_id": "session_002",
        "initial_message": "I feel so sad and hopeless all the time. Nothing brings me joy anymore, not even things I used to love. I'm exhausted all the time and can barely get out of bed. I've been sleeping too much but still feel tired. I just want to be alone.",
        "clinical_scores": {
            "phq9": 18,  # Moderate-severe depression
            "gad7": 6,   # Mild anxiety
            "pcl5": 3,   # Minimal trauma
            "phq9_1": 3, "phq9_2": 3, "phq9_3": 2, "phq9_4": 3,
            "phq9_5": 2, "phq9_6": 2, "phq9_7": 2, "phq9_8": 1, "phq9_9": 0
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/classify/", json=data)
        if response.status_code == 201:
            result = response.json()
            print("✅ Depression case classified successfully")
            print(f"   Category: {result['category']}")
            print(f"   Severity: {result['severity']}")
            print(f"   Confidence: {result['confidence']:.0%}")
            print(f"   Primary Agent: {result['primary_agent']}")
            print(f"   Urgency: {result['urgency_level']}")
            return result['conversation_id']
        else:
            print(f"❌ Classification failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_crisis_case():
    """Test classification for a crisis case."""
    print("\n🚨 Testing Crisis Case...")
    
    data = {
        "user_id": "user_003",
        "session_id": "session_003",
        "initial_message": "I can't take it anymore. I've been thinking about ending my life. I feel like everyone would be better off without me. I have a plan and I don't see any reason to keep going. I'm just so tired of feeling this way.",
        "clinical_scores": {
            "phq9": 22,  # Severe depression
            "gad7": 12,  # Moderate anxiety
            "pcl5": 8,   # Minimal trauma
            "phq9_9": 3  # Suicidal ideation
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/classify/", json=data)
        if response.status_code == 201:
            result = response.json()
            print("✅ Crisis case classified successfully")
            print(f"   Category: {result['category']}")
            print(f"   Severity: {result['severity']}")
            print(f"   Confidence: {result['confidence']:.0%}")
            print(f"   Primary Agent: {result['primary_agent']}")
            print(f"   Urgency: {result['urgency_level']}")
            print(f"   Immediate Attention: {result['requires_immediate_attention']}")
            if result.get('crisis_resources'):
                print("   Crisis Resources Available")
            return result['conversation_id']
        else:
            print(f"❌ Classification failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_trauma_case():
    """Test classification for a trauma case."""
    print("\n🛡️ Testing Trauma Case...")
    
    data = {
        "user_id": "user_004",
        "session_id": "session_004",
        "initial_message": "I keep having flashbacks to the accident. I can't sleep because of the nightmares. Every time I hear a loud noise, I jump and feel like I'm back there. I avoid driving now because it triggers memories. I feel like I'm always on edge.",
        "clinical_scores": {
            "pcl5": 28,  # Severe trauma
            "phq9": 12,  # Mild depression
            "gad7": 14,  # Moderate anxiety
            "pcl5_1": 4, "pcl5_2": 4, "pcl5_3": 3, "pcl5_4": 4,
            "pcl5_5": 4, "pcl5_6": 3, "pcl5_7": 3, "pcl5_8": 3
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/classify/", json=data)
        if response.status_code == 201:
            result = response.json()
            print("✅ Trauma case classified successfully")
            print(f"   Category: {result['category']}")
            print(f"   Severity: {result['severity']}")
            print(f"   Confidence: {result['confidence']:.0%}")
            print(f"   Primary Agent: {result['primary_agent']}")
            print(f"   Urgency: {result['urgency_level']}")
            return result['conversation_id']
        else:
            print(f"❌ Classification failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_lifestyle_case():
    """Test classification for a lifestyle/wellness case."""
    print("\n✨ Testing Lifestyle Case...")
    
    data = {
        "user_id": "user_005",
        "session_id": "session_005",
        "initial_message": "I'm generally doing well, but I'd like to improve my work-life balance and reduce stress. I want to be more mindful and present in my daily life. I'm looking for ways to optimize my wellness routine and be more productive.",
        "clinical_scores": {
            "phq9": 3,   # Minimal depression
            "gad7": 2,   # Minimal anxiety
            "pcl5": 1    # Minimal trauma
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/classify/", json=data)
        if response.status_code == 201:
            result = response.json()
            print("✅ Lifestyle case classified successfully")
            print(f"   Category: {result['category']}")
            print(f"   Severity: {result['severity']}")
            print(f"   Confidence: {result['confidence']:.0%}")
            print(f"   Primary Agent: {result['primary_agent']}")
            print(f"   Urgency: {result['urgency_level']}")
            return result['conversation_id']
        else:
            print(f"❌ Classification failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_add_message(conversation_id):
    """Test adding a message to an existing conversation."""
    print(f"\n💬 Testing message addition to conversation {conversation_id}...")
    
    data = {
        "message": "Thank you for the initial assessment. I'm ready to start working on my anxiety management.",
        "is_user": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/conversations/{conversation_id}/messages/", json=data)
        if response.status_code == 200:
            print("✅ Message added successfully")
        else:
            print(f"❌ Failed to add message: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_get_routing_decision(conversation_id):
    """Test retrieving routing decision for a conversation."""
    print(f"\n🎯 Testing routing decision retrieval for conversation {conversation_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/conversations/{conversation_id}/routing/")
        if response.status_code == 200:
            result = response.json()
            print("✅ Routing decision retrieved successfully")
            print(f"   Primary Agent: {result['primary_agent']}")
            print(f"   Urgency Level: {result['urgency_level']}")
            print(f"   Immediate Actions: {len(result['immediate_actions'])} items")
        else:
            print(f"❌ Failed to get routing decision: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run all tests."""
    print("🤖 HarmoniAI Routing Agent Test Suite")
    print("=" * 50)
    
    # Test health check first
    if not test_health_check():
        print("\n❌ Server is not running. Please start Django with:")
        print("   python manage.py runserver")
        return
    
    # Test different cases
    anxiety_id = test_anxiety_case()
    depression_id = test_depression_case()
    crisis_id = test_crisis_case()
    trauma_id = test_trauma_case()
    lifestyle_id = test_lifestyle_case()
    
    # Test additional functionality
    if anxiety_id:
        test_add_message(anxiety_id)
        test_get_routing_decision(anxiety_id)
    
    print("\n" + "=" * 50)
    print("✅ Test suite completed!")
    print("\nTo test with Postman:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Use POST http://localhost:8000/api/routing/classify/")
    print("3. Send JSON data with user_id, session_id, initial_message, and clinical_scores")

if __name__ == "__main__":
    main() 