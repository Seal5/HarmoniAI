#!/usr/bin/env python3
"""
Demo script for the Gemini-based HarmoniAI routing agent
Shows how to use Google Gemini 2.5 Flash (FREE) instead of OpenAI
"""

import json
import sys
import os
from pathlib import Path

# Add the training directory to the path
sys.path.append('./training')

def check_gemini_setup():
    """Check if Gemini is properly set up."""
    print("🔍 Checking Gemini setup...")
    
    # Check API key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ Google API key not found!")
        print("\n📝 To get a FREE Google API key:")
        print("   1. Go to https://makersuite.google.com/app/apikey")
        print("   2. Sign in with your Google account")
        print("   3. Click 'Create API key' -> 'Create API key in new project'")
        print("   4. Copy the API key")
        print("   5. Set it as environment variable:")
        print("      export GOOGLE_API_KEY='your-api-key-here'")
        print("\n💡 Gemini 2.5 Flash is completely FREE with generous quotas!")
        return False
    
    # Check dependencies
    try:
        import langchain_google_genai
        print("✅ langchain-google-genai installed")
    except ImportError:
        print("❌ langchain-google-genai not installed")
        print("   Run: pip install langchain-google-genai")
        return False
    
    try:
        import google.generativeai as genai
        print("✅ google-generativeai installed")
    except ImportError:
        print("❌ google-generativeai not installed")
        print("   Run: pip install google-generativeai")
        return False
    
    print("✅ Gemini setup looks good!")
    return True

def demo_gemini_vs_openai():
    """Compare Gemini vs OpenAI approach."""
    print("\n🔄 Gemini vs OpenAI Comparison")
    print("=" * 50)
    
    comparison = [
        ("💰 Cost", "FREE (generous quotas)", "Paid (per token)"),
        ("🤖 Model", "Gemini 2.5 Flash", "GPT-3.5-turbo"),
        ("🚀 Speed", "Very fast", "Fast"),
        ("📊 Quality", "Excellent", "Excellent"),
        ("🔑 API Key", "Free from Google", "Requires payment"),
        ("📈 Rate Limits", "15 RPM, 1M TPM", "Varies by plan"),
        ("🌐 Availability", "Global", "Global"),
        ("📚 Context", "1M tokens", "16K tokens")
    ]
    
    print(f"{'Feature':<15} {'Gemini 2.5 Flash':<25} {'OpenAI GPT-3.5':<20}")
    print("-" * 70)
    
    for feature, gemini, openai in comparison:
        print(f"{feature:<15} {gemini:<25} {openai:<20}")
    
    print("\n🎯 Winner: Gemini 2.5 Flash (FREE + Better Context)")

def demo_simple_routing():
    """Demo simple routing without LangChain to show the concept."""
    print("\n🤖 Simple Routing Demo (No API Required)")
    print("=" * 50)
    
    # Sample assessment data
    sample_cases = [
        {
            "name": "High Anxiety Case",
            "scores": {"phq9": 10, "gad7": 15, "pcl5": 8, "crisis": 0},
            "concern": "anxiety"
        },
        {
            "name": "Depression Case", 
            "scores": {"phq9": 18, "gad7": 7, "pcl5": 5, "crisis": 0},
            "concern": "depression"
        },
        {
            "name": "Trauma Case",
            "scores": {"phq9": 12, "gad7": 11, "pcl5": 25, "crisis": 0},
            "concern": "trauma"
        },
        {
            "name": "CRISIS Case",
            "scores": {"phq9": 20, "gad7": 12, "pcl5": 8, "crisis": 2},
            "concern": "depression"
        },
        {
            "name": "Lifestyle Case",
            "scores": {"phq9": 5, "gad7": 4, "pcl5": 2, "crisis": 0},
            "concern": "lifestyle"
        }
    ]
    
    for case in sample_cases:
        print(f"\n📋 {case['name']}")
        print(f"   Scores: PHQ-9={case['scores']['phq9']}, GAD-7={case['scores']['gad7']}, PCL-5={case['scores']['pcl5']}")
        print(f"   Primary concern: {case['concern']}")
        
        # Simple routing logic
        if case['scores']['crisis'] >= 1:
            category = "🚨 CRISIS"
            reason = "Suicidal ideation detected - immediate intervention required"
        elif case['scores']['pcl5'] >= 20:
            category = "🛡️ TRAUMA"
            reason = f"High trauma symptoms (PCL-5: {case['scores']['pcl5']}) - specialized trauma therapy"
        elif case['scores']['phq9'] >= 15:
            category = "💙 DEPRESSION"
            reason = f"Severe depression (PHQ-9: {case['scores']['phq9']}) - therapy + psychiatric evaluation"
        elif case['scores']['gad7'] >= 10:
            category = "🧠 ANXIETY"
            reason = f"Moderate-severe anxiety (GAD-7: {case['scores']['gad7']}) - CBT recommended"
        elif case['scores']['phq9'] >= 10:
            category = "💙 DEPRESSION (Mild)"
            reason = f"Mild-moderate depression (PHQ-9: {case['scores']['phq9']}) - therapy recommended"
        else:
            category = "✨ LIFESTYLE"
            reason = "Low clinical scores - wellness coaching and prevention focus"
        
        print(f"   🎯 Route to: {category}")
        print(f"   💭 Reasoning: {reason}")

def demo_gemini_routing():
    """Demo the actual Gemini routing agent."""
    print("\n🤖 Gemini Routing Agent Demo")
    print("=" * 50)
    
    if not check_gemini_setup():
        print("⚠️ Gemini not set up - showing simple routing instead")
        demo_simple_routing()
        return
    
    try:
        from train_routing_agent_gemini import GeminiRoutingAgentTrainer
        
        print("🚀 Initializing Gemini routing agent...")
        trainer = GeminiRoutingAgentTrainer()
        
        print("📚 Training the agent with clinical guidelines...")
        trainer.train_and_save()
        
        print("✅ Training complete! Testing routing decisions...")
        trainer.test_routing()
        
        print("\n🎉 Gemini routing agent is working!")
        
    except Exception as e:
        print(f"❌ Error with Gemini routing: {e}")
        print("⚠️ Falling back to simple routing demo...")
        demo_simple_routing()

def show_installation_guide():
    """Show installation guide for Gemini version."""
    print("\n📦 Gemini Installation Guide")
    print("=" * 50)
    
    steps = [
        "1. Get your FREE Google API key:",
        "   • Go to https://makersuite.google.com/app/apikey",
        "   • Sign in with Google account",
        "   • Create new API key",
        "   • Copy the key",
        "",
        "2. Set the API key:",
        "   export GOOGLE_API_KEY='your-api-key-here'",
        "",
        "3. Install dependencies:",
        "   pip install -r requirements-gemini.txt",
        "",
        "4. Run the Gemini demo:",
        "   python demo_gemini_routing.py",
        "",
        "5. Use in your app:",
        "   from train_routing_agent_gemini import GeminiRoutingAgentTrainer",
        "   trainer = GeminiRoutingAgentTrainer()",
        "   trainer.train_and_save()",
        "",
        "💡 Benefits of Gemini:",
        "   • Completely FREE",
        "   • No credit card required",
        "   • Generous rate limits",
        "   • Better context window (1M tokens)",
        "   • Same quality as GPT-3.5"
    ]
    
    for step in steps:
        print(step)

def main():
    """Main demo function."""
    print("🌟 HarmoniAI Gemini Routing Agent Demo")
    print("=" * 60)
    print("🆓 FREE Google Gemini 2.5 Flash vs 💰 Paid OpenAI")
    print("=" * 60)
    
    while True:
        print("\n🔧 Choose an option:")
        print("1. 📖 Show installation guide")
        print("2. 🔍 Check Gemini setup")
        print("3. 🔄 Compare Gemini vs OpenAI")
        print("4. 🤖 Demo simple routing (no API)")
        print("5. 🚀 Demo Gemini routing agent")
        print("6. 🚪 Exit")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            show_installation_guide()
        elif choice == '2':
            check_gemini_setup()
        elif choice == '3':
            demo_gemini_vs_openai()
        elif choice == '4':
            demo_simple_routing()
        elif choice == '5':
            demo_gemini_routing()
        elif choice == '6':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 