#!/usr/bin/env python3
"""
Demo script to test the HarmoniAI routing agent
Shows how the system routes different user profiles
"""

import json
import sys
sys.path.append('./training')

from train_routing_agent import RoutingAgentTrainer

def create_test_cases():
    """Create test cases representing different user profiles."""
    return [
        {
            "name": "High Anxiety Case",
            "description": "Young professional with severe anxiety symptoms",
            "data": {
                "age_range": "25-34",
                "primary_concern": "anxiety",
                "phq9_1": 1, "phq9_2": 2, "phq9_3": 1, "phq9_4": 2, "phq9_5": 1,
                "phq9_6": 1, "phq9_7": 2, "phq9_8": 0, "phq9_9": 0,
                "gad7_1": 3, "gad7_2": 2, "gad7_3": 3, "gad7_4": 2, 
                "gad7_5": 2, "gad7_6": 1, "gad7_7": 2,
                "pcl5_1": 1, "pcl5_2": 0, "pcl5_3": 0, "pcl5_4": 1,
                "pcl5_5": 1, "pcl5_6": 0, "pcl5_7": 1, "pcl5_8": 0,
                "sleep_quality": 2, "exercise_frequency": "rarely",
                "stress_management": 2, "wellness_goals": ["stress_reduction"],
                "preferred_support_type": "individual_therapy",
                "urgency_level": "within_week"
            }
        },
        {
            "name": "Moderate Depression Case",
            "description": "Mid-career professional with depression symptoms",
            "data": {
                "age_range": "35-44",
                "primary_concern": "depression",
                "phq9_1": 3, "phq9_2": 3, "phq9_3": 2, "phq9_4": 3, "phq9_5": 2,
                "phq9_6": 2, "phq9_7": 2, "phq9_8": 1, "phq9_9": 0,
                "gad7_1": 1, "gad7_2": 1, "gad7_3": 2, "gad7_4": 1, 
                "gad7_5": 0, "gad7_6": 1, "gad7_7": 1,
                "pcl5_1": 0, "pcl5_2": 1, "pcl5_3": 0, "pcl5_4": 0,
                "pcl5_5": 1, "pcl5_6": 2, "pcl5_7": 1, "pcl5_8": 0,
                "sleep_quality": 1, "exercise_frequency": "never",
                "stress_management": 2, "wellness_goals": ["sleep_improvement"],
                "preferred_support_type": "individual_therapy",
                "urgency_level": "within_month"
            }
        },
        {
            "name": "Trauma Survivor Case",
            "description": "Individual with significant trauma history",
            "data": {
                "age_range": "35-44",
                "primary_concern": "trauma",
                "phq9_1": 2, "phq9_2": 2, "phq9_3": 3, "phq9_4": 2, "phq9_5": 1,
                "phq9_6": 1, "phq9_7": 2, "phq9_8": 1, "phq9_9": 0,
                "gad7_1": 2, "gad7_2": 2, "gad7_3": 3, "gad7_4": 2, 
                "gad7_5": 1, "gad7_6": 2, "gad7_7": 3,
                "pcl5_1": 3, "pcl5_2": 4, "pcl5_3": 2, "pcl5_4": 3,
                "pcl5_5": 4, "pcl5_6": 2, "pcl5_7": 3, "pcl5_8": 2,
                "sleep_quality": 1, "exercise_frequency": "several_weekly",
                "stress_management": 1, "wellness_goals": ["stress_reduction", "mindfulness"],
                "preferred_support_type": "individual_therapy",
                "urgency_level": "within_week"
            }
        },
        {
            "name": "Wellness-Focused Case",
            "description": "Health-conscious individual seeking lifestyle optimization",
            "data": {
                "age_range": "25-34",
                "primary_concern": "lifestyle",
                "phq9_1": 1, "phq9_2": 0, "phq9_3": 1, "phq9_4": 1, "phq9_5": 0,
                "phq9_6": 0, "phq9_7": 1, "phq9_8": 0, "phq9_9": 0,
                "gad7_1": 1, "gad7_2": 1, "gad7_3": 1, "gad7_4": 2, 
                "gad7_5": 0, "gad7_6": 1, "gad7_7": 0,
                "pcl5_1": 0, "pcl5_2": 0, "pcl5_3": 0, "pcl5_4": 0,
                "pcl5_5": 0, "pcl5_6": 0, "pcl5_7": 0, "pcl5_8": 0,
                "sleep_quality": 3, "exercise_frequency": "several_weekly",
                "stress_management": 3, "wellness_goals": ["work_life_balance", "productivity", "mindfulness"],
                "preferred_support_type": "coaching",
                "urgency_level": "flexible"
            }
        },
        {
            "name": "Crisis Case",
            "description": "Individual expressing suicidal ideation - URGENT",
            "data": {
                "age_range": "25-34",
                "primary_concern": "depression",
                "phq9_1": 3, "phq9_2": 3, "phq9_3": 3, "phq9_4": 3, "phq9_5": 2,
                "phq9_6": 3, "phq9_7": 3, "phq9_8": 2, "phq9_9": 2,  # Suicidal ideation
                "gad7_1": 2, "gad7_2": 3, "gad7_3": 3, "gad7_4": 2, 
                "gad7_5": 1, "gad7_6": 2, "gad7_7": 3,
                "pcl5_1": 1, "pcl5_2": 2, "pcl5_3": 1, "pcl5_4": 1,
                "pcl5_5": 2, "pcl5_6": 3, "pcl5_7": 2, "pcl5_8": 1,
                "sleep_quality": 1, "exercise_frequency": "never",
                "stress_management": 1, "wellness_goals": ["stress_reduction"],
                "preferred_support_type": "individual_therapy",
                "urgency_level": "immediate"
            }
        }
    ]

def demo_simple_routing():
    """Demo the simple routing logic without LangChain."""
    print("🤖 HarmoniAI Routing Agent Demo")
    print("=" * 50)
    print()
    
    test_cases = create_test_cases()
    
    for i, case in enumerate(test_cases, 1):
        print(f"Test Case {i}: {case['name']}")
        print(f"Description: {case['description']}")
        print("-" * 30)
        
        # Calculate scores manually
        data = case['data']
        phq9_score = sum([data[f'phq9_{j}'] for j in range(1, 10)])
        gad7_score = sum([data[f'gad7_{j}'] for j in range(1, 8)])
        pcl5_score = sum([data[f'pcl5_{j}'] for j in range(1, 9)])
        crisis_indicator = data['phq9_9']
        
        print(f"Clinical Scores:")
        print(f"  PHQ-9 (Depression): {phq9_score}/27")
        print(f"  GAD-7 (Anxiety): {gad7_score}/21")
        print(f"  PCL-5 (Trauma): {pcl5_score}/32")
        print(f"  Crisis Indicator: {crisis_indicator}")
        print()
        
        # Simple routing logic
        if crisis_indicator >= 1:
            category = "🚨 CRISIS"
            reasoning = "Immediate intervention required due to suicidal ideation"
            confidence = 0.95
        elif pcl5_score >= 20:
            category = "🛡️ TRAUMA"
            reasoning = f"High trauma symptoms (PCL-5: {pcl5_score}) - specialized trauma care recommended"
            confidence = 0.85
        elif phq9_score >= 15:
            category = "💙 DEPRESSION"
            reasoning = f"Severe depression symptoms (PHQ-9: {phq9_score}) - therapy and psychiatric evaluation"
            confidence = 0.88
        elif gad7_score >= 10:
            category = "🧠 ANXIETY"
            reasoning = f"Moderate-severe anxiety (GAD-7: {gad7_score}) - CBT and anxiety management"
            confidence = 0.82
        elif phq9_score >= 10 or gad7_score >= 5:
            if phq9_score > gad7_score:
                category = "💙 DEPRESSION (Mild-Moderate)"
                reasoning = f"Mild-moderate depression (PHQ-9: {phq9_score}) - therapy recommended"
            else:
                category = "🧠 ANXIETY (Mild-Moderate)"
                reasoning = f"Mild-moderate anxiety (GAD-7: {gad7_score}) - anxiety management"
            confidence = 0.75
        else:
            category = "✨ LIFESTYLE COACHING"
            reasoning = "Low clinical scores - wellness and lifestyle optimization focus"
            confidence = 0.80
        
        print(f"🎯 ROUTING DECISION: {category}")
        print(f"📊 Confidence: {confidence:.0%}")
        print(f"💭 Reasoning: {reasoning}")
        
        if crisis_indicator >= 1:
            print()
            print("🚨 CRISIS ALERT:")
            print("   • Crisis Text Line: Text HOME to 741741")
            print("   • National Suicide Prevention Lifeline: 988")
            print("   • Emergency Services: 911")
        
        print()
        print("=" * 50)
        print()

def demo_langchain_routing():
    """Demo the LangChain-based routing (requires OpenAI API key)."""
    try:
        print("🤖 LangChain Routing Agent Demo")
        print("=" * 50)
        
        # Check if OpenAI API key is available
        import os
        if not os.getenv("OPENAI_API_KEY"):
            print("⚠️  OpenAI API key not found. Set OPENAI_API_KEY environment variable to test LangChain routing.")
            print("Falling back to simple routing demo...")
            print()
            demo_simple_routing()
            return
        
        print("🚀 Initializing LangChain routing agent...")
        trainer = RoutingAgentTrainer()
        trainer.train_and_save()
        
        print("✅ Training complete! Testing routing decisions...")
        print()
        
        trainer.test_routing()
        
    except Exception as e:
        print(f"❌ Error with LangChain routing: {str(e)}")
        print("Falling back to simple routing demo...")
        print()
        demo_simple_routing()

def show_clinical_info():
    """Show information about clinical assessments."""
    print("📋 Clinical Assessment Information")
    print("=" * 50)
    print()
    
    assessments = {
        "PHQ-9 (Patient Health Questionnaire-9)": {
            "purpose": "Screens for depression severity",
            "range": "0-27 points",
            "interpretation": {
                "0-4": "Minimal depression",
                "5-9": "Mild depression",
                "10-14": "Moderate depression", 
                "15-19": "Moderately severe depression",
                "20-27": "Severe depression"
            },
            "note": "Item 9 screens for suicidal ideation"
        },
        "GAD-7 (Generalized Anxiety Disorder-7)": {
            "purpose": "Screens for anxiety severity",
            "range": "0-21 points",
            "interpretation": {
                "0-4": "Minimal anxiety",
                "5-9": "Mild anxiety",
                "10-14": "Moderate anxiety",
                "15-21": "Severe anxiety"
            },
            "note": "Validated for generalized anxiety disorder screening"
        },
        "PCL-5 Brief (PTSD Checklist for DSM-5)": {
            "purpose": "Screens for PTSD symptoms",
            "range": "0-32 points (brief version)",
            "interpretation": {
                "0-19": "Low trauma symptoms",
                "20+": "Probable PTSD"
            },
            "note": "Full version has 20 items (0-80 range)"
        }
    }
    
    for name, info in assessments.items():
        print(f"🔬 {name}")
        print(f"   Purpose: {info['purpose']}")
        print(f"   Range: {info['range']}")
        print(f"   Interpretation:")
        for score_range, meaning in info['interpretation'].items():
            print(f"     • {score_range}: {meaning}")
        if info.get('note'):
            print(f"   Note: {info['note']}")
        print()

if __name__ == "__main__":
    print("🎯 HarmoniAI Mental Health Routing Agent")
    print("Intelligent triage system for mental health care")
    print()
    
    while True:
        print("Choose an option:")
        print("1. Demo simple routing logic")
        print("2. Demo LangChain-based routing (requires OpenAI API key)")
        print("3. Show clinical assessment information")
        print("4. Exit")
        print()
        
        try:
            choice = input("Enter your choice (1-4): ").strip()
            print()
            
            if choice == "1":
                demo_simple_routing()
            elif choice == "2":
                demo_langchain_routing()
            elif choice == "3":
                show_clinical_info()
            elif choice == "4":
                print("👋 Thank you for trying HarmoniAI!")
                break
            else:
                print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")
                print()
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            print() 