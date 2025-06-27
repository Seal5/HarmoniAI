#!/usr/bin/env python3
"""
Complete HarmoniAI System Demo
Shows the routing agent directing users to specialized individual agents
"""

import sys
import os

# Add agents directory to path
sys.path.append('./agents')

from anxiety_agent import AnxietyAgent
from depression_agent import DepressionAgent

class TraumaAgent:
    """Quick trauma agent for demo purposes."""
    def __init__(self):
        self.agent_type = "TRAUMA"
    
    def get_initial_assessment(self, user_data):
        return {
            "agent": "Trauma Specialist",
            "primary_focus": "Trauma-Informed Care & PTSD Treatment",
            "severity_level": "Moderate-Severe",
            "immediate_actions": [
                "Schedule appointment with trauma-specialized therapist",
                "Begin grounding techniques practice",
                "Implement safety and stabilization strategies"
            ],
            "treatment_plan": {
                "primary_therapy": "EMDR or Trauma-Focused CBT",
                "duration": "20-24 weeks intensive treatment"
            }
        }

class LifestyleAgent:
    """Quick lifestyle agent for demo purposes."""
    def __init__(self):
        self.agent_type = "LIFESTYLE"
    
    def get_initial_assessment(self, user_data):
        return {
            "agent": "Lifestyle & Wellness Coach",
            "primary_focus": "Wellness Optimization & Habit Formation",
            "immediate_actions": [
                "Complete comprehensive wellness assessment",
                "Set SMART wellness goals",
                "Begin daily habit tracking"
            ],
            "coaching_plan": {
                "approach": "Integrated wellness coaching",
                "duration": "12 weeks initial program"
            }
        }

class RoutingSystem:
    """Main routing system that directs users to specialized agents."""
    
    def __init__(self):
        self.agents = {
            'ANXIETY': AnxietyAgent(),
            'DEPRESSION': DepressionAgent(),
            'TRAUMA': TraumaAgent(),
            'LIFESTYLE': LifestyleAgent()
        }
    
    def route_and_direct(self, user_data):
        """Complete routing: assess, route, and direct to specialist."""
        
        # Step 1: Routing Assessment
        routing_decision = self.assess_user(user_data)
        
        # Step 2: Direct to Specialized Agent
        specialist_agent = self.agents[routing_decision['primary_category']]
        specialist_assessment = specialist_agent.get_initial_assessment({
            **user_data,
            'clinical_scores': routing_decision['clinical_scores']
        })
        
        return {
            'routing_decision': routing_decision,
            'specialist_assessment': specialist_assessment
        }
    
    def assess_user(self, user_data):
        """Initial routing assessment (same logic as before)."""
        # Calculate scores
        phq9_score = sum([user_data[f'phq9_{i}'] for i in range(1, 10)])
        gad7_score = sum([user_data[f'gad7_{i}'] for i in range(1, 8)])
        pcl5_score = sum([user_data[f'pcl5_{i}'] for i in range(1, 9)])
        crisis_indicator = user_data['phq9_9']
        
        # Routing logic
        if crisis_indicator >= 1:
            category = "CRISIS"
            confidence = 0.95
        elif pcl5_score >= 20:
            category = "TRAUMA"
            confidence = 0.85
        elif phq9_score >= 15:
            category = "DEPRESSION"
            confidence = 0.88
        elif gad7_score >= 10:
            category = "ANXIETY"
            confidence = 0.82
        elif phq9_score >= 10 or gad7_score >= 5:
            category = "DEPRESSION" if phq9_score > gad7_score else "ANXIETY"
            confidence = 0.75
        else:
            category = "LIFESTYLE"
            confidence = 0.80
        
        return {
            'primary_category': category,
            'confidence': confidence,
            'clinical_scores': {
                'phq9': phq9_score,
                'gad7': gad7_score,
                'pcl5': pcl5_score,
                'crisis_indicator': crisis_indicator
            }
        }

def create_test_cases():
    """Create test cases for all four categories."""
    return [
        {
            "name": "High Anxiety User",
            "data": {
                "primary_concern": "anxiety",
                "phq9_1": 1, "phq9_2": 2, "phq9_3": 1, "phq9_4": 2, "phq9_5": 1,
                "phq9_6": 1, "phq9_7": 2, "phq9_8": 0, "phq9_9": 0,
                "gad7_1": 3, "gad7_2": 2, "gad7_3": 3, "gad7_4": 2, 
                "gad7_5": 2, "gad7_6": 1, "gad7_7": 2,
                "pcl5_1": 1, "pcl5_2": 0, "pcl5_3": 0, "pcl5_4": 1,
                "pcl5_5": 1, "pcl5_6": 0, "pcl5_7": 1, "pcl5_8": 0,
            }
        },
        {
            "name": "Depression User",
            "data": {
                "primary_concern": "depression",
                "phq9_1": 3, "phq9_2": 3, "phq9_3": 2, "phq9_4": 3, "phq9_5": 2,
                "phq9_6": 2, "phq9_7": 2, "phq9_8": 1, "phq9_9": 0,
                "gad7_1": 1, "gad7_2": 1, "gad7_3": 2, "gad7_4": 1, 
                "gad7_5": 0, "gad7_6": 1, "gad7_7": 1,
                "pcl5_1": 0, "pcl5_2": 1, "pcl5_3": 0, "pcl5_4": 0,
                "pcl5_5": 1, "pcl5_6": 2, "pcl5_7": 1, "pcl5_8": 0,
            }
        },
        {
            "name": "Trauma Survivor",
            "data": {
                "primary_concern": "trauma",
                "phq9_1": 2, "phq9_2": 2, "phq9_3": 3, "phq9_4": 2, "phq9_5": 1,
                "phq9_6": 1, "phq9_7": 2, "phq9_8": 1, "phq9_9": 0,
                "gad7_1": 2, "gad7_2": 2, "gad7_3": 3, "gad7_4": 2, 
                "gad7_5": 1, "gad7_6": 2, "gad7_7": 3,
                "pcl5_1": 3, "pcl5_2": 4, "pcl5_3": 2, "pcl5_4": 3,
                "pcl5_5": 4, "pcl5_6": 2, "pcl5_7": 3, "pcl5_8": 2,
            }
        },
        {
            "name": "Wellness-Focused User",
            "data": {
                "primary_concern": "lifestyle",
                "phq9_1": 1, "phq9_2": 0, "phq9_3": 1, "phq9_4": 1, "phq9_5": 0,
                "phq9_6": 0, "phq9_7": 1, "phq9_8": 0, "phq9_9": 0,
                "gad7_1": 1, "gad7_2": 1, "gad7_3": 1, "gad7_4": 2, 
                "gad7_5": 0, "gad7_6": 1, "gad7_7": 0,
                "pcl5_1": 0, "pcl5_2": 0, "pcl5_3": 0, "pcl5_4": 0,
                "pcl5_5": 0, "pcl5_6": 0, "pcl5_7": 0, "pcl5_8": 0,
            }
        }
    ]

def demo_complete_system():
    """Demo the complete routing system with individual agents."""
    print("🎯 COMPLETE HARMONI AI SYSTEM DEMO")
    print("=" * 60)
    print("Routing Agent → Individual Specialized Agents")
    print("=" * 60)
    print()
    
    routing_system = RoutingSystem()
    test_cases = create_test_cases()
    
    for i, case in enumerate(test_cases, 1):
        print(f"👤 USER {i}: {case['name']}")
        print("-" * 40)
        
        # Get complete assessment
        result = routing_system.route_and_direct(case['data'])
        routing = result['routing_decision']
        specialist = result['specialist_assessment']
        
        # Show routing decision
        category_icons = {
            'ANXIETY': '🧠',
            'DEPRESSION': '💙',
            'TRAUMA': '🛡️',
            'LIFESTYLE': '✨'
        }
        
        icon = category_icons.get(routing['primary_category'], '❓')
        print(f"🔄 ROUTING DECISION: {icon} {routing['primary_category']}")
        print(f"📊 Confidence: {routing['confidence']:.0%}")
        print(f"📈 Clinical Scores: PHQ-9={routing['clinical_scores']['phq9']}, GAD-7={routing['clinical_scores']['gad7']}, PCL-5={routing['clinical_scores']['pcl5']}")
        print()
        
        # Show specialist assignment
        print(f"🎯 DIRECTED TO: {specialist['agent']}")
        print(f"📋 Focus Area: {specialist['primary_focus']}")
        
        if 'severity_level' in specialist:
            print(f"⚡ Severity: {specialist['severity_level']}")
        
        print()
        
        # Show immediate actions from specialist
        print("📝 SPECIALIST RECOMMENDATIONS:")
        actions = specialist.get('immediate_actions', [])
        for j, action in enumerate(actions[:3], 1):  # Show first 3
            clean_action = action.replace("🚨 ", "").replace("🚨", "")
            print(f"   {j}. {clean_action}")
        
        print()
        print("=" * 60)
        print()

def show_system_architecture():
    """Show the system architecture."""
    print("🏗️  HARMONI AI SYSTEM ARCHITECTURE")
    print("=" * 50)
    print()
    print("1️⃣  INTAKE SURVEY")
    print("   ├── PHQ-9 (Depression Assessment)")
    print("   ├── GAD-7 (Anxiety Assessment)")  
    print("   ├── PCL-5 (Trauma Assessment)")
    print("   └── Lifestyle & Wellness Questions")
    print()
    print("2️⃣  ROUTING AGENT (Triage)")
    print("   ├── Clinical Score Calculation")
    print("   ├── AI-Powered Classification")
    print("   ├── Crisis Detection")
    print("   └── Confidence Scoring")
    print()
    print("3️⃣  SPECIALIZED AGENTS")
    print("   ├── 🧠 Anxiety Agent")
    print("   │   ├── CBT protocols")
    print("   │   ├── Exposure therapy")
    print("   │   └── Anxiety management tools")
    print("   ├── 💙 Depression Agent")
    print("   │   ├── Behavioral activation")
    print("   │   ├── Safety planning")
    print("   │   └── Mood tracking")
    print("   ├── 🛡️ Trauma Agent")
    print("   │   ├── EMDR protocols")
    print("   │   ├── Trauma-informed care")
    print("   │   └── Stabilization techniques")
    print("   └── ✨ Lifestyle Agent")
    print("       ├── Wellness coaching")
    print("       ├── Habit formation")
    print("       └── Stress management")
    print()
    print("4️⃣  ONGOING SUPPORT")
    print("   ├── Progress monitoring")
    print("   ├── Treatment adjustments")
    print("   └── Relapse prevention")

if __name__ == "__main__":
    print("🎯 HarmoniAI - Complete Mental Health Routing System")
    print()
    
    while True:
        print("Choose an option:")
        print("1. Demo complete routing system")
        print("2. Show system architecture")
        print("3. Exit")
        print()
        
        try:
            choice = input("Enter your choice (1-3): ").strip()
            print()
            
            if choice == "1":
                demo_complete_system()
            elif choice == "2":
                show_system_architecture()
            elif choice == "3":
                print("👋 Thank you for exploring HarmoniAI!")
                break
            else:
                print("❌ Invalid choice. Please enter 1, 2, or 3.")
                print()
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            print() 