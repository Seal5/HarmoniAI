"""
Specialized Anxiety Agent
Provides targeted support for anxiety-related concerns
"""

from typing import Dict, List, Any
import json

class AnxietyAgent:
    def __init__(self):
        self.agent_type = "ANXIETY"
        self.specializations = [
            "Generalized Anxiety Disorder",
            "Panic Disorder", 
            "Social Anxiety",
            "Specific Phobias",
            "Anxiety Management"
        ]
        
    def get_initial_assessment(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct anxiety-specific assessment."""
        gad7_score = user_data.get('clinical_scores', {}).get('gad7', 0)
        
        # Determine anxiety subtype and severity
        anxiety_profile = self._analyze_anxiety_profile(user_data)
        
        return {
            "agent": "Anxiety Specialist",
            "primary_focus": "Anxiety Management & Treatment",
            "severity_level": self._get_severity_level(gad7_score),
            "anxiety_profile": anxiety_profile,
            "immediate_actions": self._get_immediate_actions(gad7_score),
            "treatment_plan": self._create_treatment_plan(anxiety_profile, gad7_score),
            "self_help_tools": self._get_self_help_tools(),
            "crisis_resources": self._get_crisis_resources() if gad7_score >= 15 else None
        }
    
    def _analyze_anxiety_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze specific anxiety patterns."""
        # This would analyze individual GAD-7 responses for patterns
        primary_concerns = user_data.get('primary_concern', '')
        
        # Mock analysis - in production, this would be more sophisticated
        if 'social' in primary_concerns.lower():
            subtype = "Social Anxiety"
            focus_areas = ["Social situations", "Performance anxiety", "Fear of judgment"]
        elif 'panic' in primary_concerns.lower():
            subtype = "Panic Disorder"
            focus_areas = ["Panic attacks", "Catastrophic thinking", "Avoidance behaviors"]
        else:
            subtype = "Generalized Anxiety"
            focus_areas = ["Excessive worry", "Restlessness", "Concentration issues"]
            
        return {
            "likely_subtype": subtype,
            "focus_areas": focus_areas,
            "triggers": ["Work stress", "Social situations", "Health concerns"],
            "coping_patterns": ["Avoidance", "Overthinking", "Physical tension"]
        }
    
    def _get_severity_level(self, gad7_score: int) -> str:
        """Determine anxiety severity level."""
        if gad7_score >= 15:
            return "Severe"
        elif gad7_score >= 10:
            return "Moderate"
        elif gad7_score >= 5:
            return "Mild"
        else:
            return "Minimal"
    
    def _get_immediate_actions(self, gad7_score: int) -> List[str]:
        """Get immediate action steps based on severity."""
        if gad7_score >= 15:
            return [
                "Schedule urgent appointment with mental health professional",
                "Contact your primary care physician",
                "Implement daily grounding techniques",
                "Consider intensive outpatient program",
                "Alert support system about your anxiety levels"
            ]
        elif gad7_score >= 10:
            return [
                "Schedule appointment with therapist specializing in anxiety",
                "Begin daily mindfulness practice",
                "Start anxiety management app or program",
                "Implement stress reduction techniques",
                "Consider support group participation"
            ]
        else:
            return [
                "Explore self-help resources for anxiety management",
                "Practice relaxation techniques daily",
                "Monitor anxiety triggers and patterns",
                "Consider preventive therapy sessions",
                "Maintain healthy lifestyle habits"
            ]
    
    def _create_treatment_plan(self, anxiety_profile: Dict[str, Any], gad7_score: int) -> Dict[str, Any]:
        """Create personalized anxiety treatment plan."""
        subtype = anxiety_profile.get('likely_subtype', 'Generalized Anxiety')
        
        # Base treatment approaches
        treatment_approaches = {
            "primary_therapy": "Cognitive Behavioral Therapy (CBT)",
            "secondary_approaches": [],
            "duration": "12-16 weeks initial treatment",
            "session_frequency": "Weekly"
        }
        
        # Customize based on subtype
        if subtype == "Social Anxiety":
            treatment_approaches["secondary_approaches"] = [
                "Exposure therapy",
                "Social skills training",
                "Group therapy"
            ]
        elif subtype == "Panic Disorder":
            treatment_approaches["secondary_approaches"] = [
                "Panic-focused CBT",
                "Interoceptive exposure",
                "Breathing retraining"
            ]
        else:  # Generalized Anxiety
            treatment_approaches["secondary_approaches"] = [
                "Worry management techniques",
                "Progressive muscle relaxation",
                "Mindfulness-based interventions"
            ]
        
        # Add medications consideration for severe cases
        if gad7_score >= 15:
            treatment_approaches["medication_consideration"] = {
                "recommended": True,
                "note": "Consider psychiatric evaluation for medication management",
                "typical_options": ["SSRIs", "SNRIs", "Buspirone"]
            }
        
        return treatment_approaches
    
    def _get_self_help_tools(self) -> List[Dict[str, str]]:
        """Get anxiety-specific self-help tools."""
        return [
            {
                "tool": "4-7-8 Breathing Technique",
                "description": "Inhale for 4, hold for 7, exhale for 8 to calm anxiety",
                "when_to_use": "During acute anxiety episodes"
            },
            {
                "tool": "5-4-3-2-1 Grounding",
                "description": "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste",
                "when_to_use": "When feeling disconnected or overwhelmed"
            },
            {
                "tool": "Progressive Muscle Relaxation",
                "description": "Systematically tense and relax muscle groups",
                "when_to_use": "Before sleep or during high stress"
            },
            {
                "tool": "Thought Challenging Worksheet",
                "description": "Identify and challenge anxious thoughts with evidence",
                "when_to_use": "When caught in worry cycles"
            },
            {
                "tool": "Anxiety Tracking Journal",
                "description": "Monitor triggers, symptoms, and coping strategies",
                "when_to_use": "Daily for pattern recognition"
            }
        ]
    
    def _get_crisis_resources(self) -> Dict[str, str]:
        """Get crisis resources for severe anxiety."""
        return {
            "crisis_text_line": "Text HOME to 741741",
            "anxiety_helpline": "ADAA Helpline: 1-800-950-6264",
            "emergency": "Call 911 for immediate crisis",
            "online_support": "7cups.com for immediate chat support"
        }
    
    def provide_ongoing_support(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide ongoing anxiety management support."""
        return {
            "check_in_frequency": "Weekly initially, then bi-weekly",
            "progress_metrics": [
                "GAD-7 score reduction",
                "Anxiety episode frequency",
                "Functional impairment level",
                "Quality of life measures"
            ],
            "adjustment_triggers": [
                "No improvement after 4 weeks",
                "Worsening symptoms",
                "New life stressors",
                "Side effects from treatment"
            ],
            "graduation_criteria": [
                "GAD-7 score below 5 for 4 consecutive weeks",
                "Successful completion of exposure goals",
                "Independent use of coping strategies",
                "Return to baseline functioning"
            ]
        }

def demo_anxiety_agent():
    """Demo the anxiety agent functionality."""
    print("🧠 ANXIETY SPECIALIST AGENT")
    print("=" * 50)
    
    # Mock user data from routing agent
    user_data = {
        "clinical_scores": {"gad7": 15, "phq9": 8},
        "primary_concern": "anxiety",
        "age_range": "25-34"
    }
    
    agent = AnxietyAgent()
    assessment = agent.get_initial_assessment(user_data)
    
    print(f"👨‍⚕️ Agent: {assessment['agent']}")
    print(f"🎯 Focus: {assessment['primary_focus']}")
    print(f"📊 Severity: {assessment['severity_level']}")
    print(f"🧬 Likely Subtype: {assessment['anxiety_profile']['likely_subtype']}")
    print()
    
    print("📋 IMMEDIATE ACTION PLAN:")
    for i, action in enumerate(assessment['immediate_actions'], 1):
        print(f"   {i}. {action}")
    print()
    
    print("🗺️  TREATMENT PLAN:")
    plan = assessment['treatment_plan']
    print(f"   Primary: {plan['primary_therapy']}")
    print(f"   Duration: {plan['duration']}")
    print(f"   Frequency: {plan['session_frequency']}")
    print()
    
    print("🛠️  SELF-HELP TOOLS:")
    for tool in assessment['self_help_tools'][:3]:  # Show first 3
        print(f"   • {tool['tool']}: {tool['description']}")
    print()
    
    if assessment.get('crisis_resources'):
        print("🚨 CRISIS RESOURCES:")
        for resource, contact in assessment['crisis_resources'].items():
            print(f"   • {resource}: {contact}")

if __name__ == "__main__":
    demo_anxiety_agent() 