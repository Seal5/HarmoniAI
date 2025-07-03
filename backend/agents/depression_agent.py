"""
Specialized Depression Agent
Provides targeted support for depression-related concerns
"""

from typing import Dict, List, Any


class DepressionAgent:
    def __init__(self):
        self.agent_type = "DEPRESSION"
        self.specializations = [
            "Major Depressive Disorder",
            "Persistent Depressive Disorder",
            "Seasonal Affective Disorder",
            "Postpartum Depression",
            "Behavioral Activation",
        ]

    def get_initial_assessment(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct depression-specific assessment."""
        phq9_score = user_data.get("clinical_scores", {}).get("phq9", 0)
        crisis_indicator = user_data.get("clinical_scores", {}).get(
            "crisis_indicator", 0
        )

        depression_profile = self._analyze_depression_profile(user_data)

        return {
            "agent": "Depression Specialist",
            "primary_focus": "Depression Treatment & Recovery",
            "severity_level": self._get_severity_level(phq9_score),
            "depression_profile": depression_profile,
            "crisis_assessment": self._assess_crisis_level(crisis_indicator),
            "immediate_actions": self._get_immediate_actions(
                phq9_score, crisis_indicator
            ),
            "treatment_plan": self._create_treatment_plan(
                depression_profile, phq9_score
            ),
            "behavioral_interventions": self._get_behavioral_interventions(),
            "safety_planning": (
                self._create_safety_plan() if crisis_indicator >= 1 else None
            ),
        }

    def _analyze_depression_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze specific depression patterns."""
        # In production, this would analyze individual PHQ-9 responses

        return {
            "primary_symptoms": [
                "Persistent low mood",
                "Loss of interest/pleasure",
                "Fatigue and low energy",
                "Sleep disturbances",
            ],
            "functional_impact": [
                "Work/school performance",
                "Social relationships",
                "Self-care activities",
                "Daily responsibilities",
            ],
            "risk_factors": [
                "Previous depressive episodes",
                "Family history",
                "Recent life stressors",
                "Social isolation",
            ],
            "protective_factors": [
                "Social support system",
                "Previous therapy success",
                "Coping strategies",
                "Treatment motivation",
            ],
        }

    def _get_severity_level(self, phq9_score: int) -> str:
        """Determine depression severity level."""
        if phq9_score >= 20:
            return "Severe"
        elif phq9_score >= 15:
            return "Moderately Severe"
        elif phq9_score >= 10:
            return "Moderate"
        elif phq9_score >= 5:
            return "Mild"
        else:
            return "Minimal"

    def _assess_crisis_level(self, crisis_indicator: int) -> Dict[str, Any]:
        """Assess suicide risk level."""
        if crisis_indicator >= 1:
            return {
                "risk_level": "ELEVATED",
                "immediate_action_required": True,
                "recommendation": "Immediate professional intervention",
                "safety_resources": [
                    "Crisis Text Line: Text HOME to 741741",
                    "National Suicide Prevention Lifeline: 988",
                    "Emergency Services: 911",
                ],
            }
        return {
            "risk_level": "LOW",
            "immediate_action_required": False,
            "recommendation": "Continue monitoring mood and safety",
        }

    def _get_immediate_actions(
        self, phq9_score: int, crisis_indicator: int
    ) -> List[str]:
        """Get immediate action steps based on severity."""
        if crisis_indicator >= 1:
            return [
                "🚨 URGENT: Contact crisis helpline immediately",
                "🚨 Go to emergency room if having active suicidal thoughts",
                "🚨 Alert trusted friend/family member",
                "🚨 Remove means of self-harm from environment",
                "🚨 Schedule emergency psychiatric evaluation",
            ]
        elif phq9_score >= 20:
            return [
                "Schedule urgent appointment with psychiatrist",
                "Contact primary care physician",
                "Consider intensive outpatient program",
                "Implement daily safety check-ins",
                "Begin structured daily routine immediately",
            ]
        elif phq9_score >= 15:
            return [
                "Schedule appointment with mental health professional",
                "Consider medication evaluation",
                "Begin behavioral activation techniques",
                "Establish daily structure and routine",
                "Engage support system",
            ]
        elif phq9_score >= 10:
            return [
                "Schedule therapy appointment",
                "Start mood tracking daily",
                "Implement self-care routine",
                "Increase social activities",
                "Consider support group participation",
            ]
        else:
            return [
                "Monitor mood patterns",
                "Maintain healthy lifestyle habits",
                "Practice preventive mental health strategies",
                "Consider counseling for life stressors",
            ]

    def _create_treatment_plan(
        self, depression_profile: Dict[str, Any], phq9_score: int
    ) -> Dict[str, Any]:
        """Create personalized depression treatment plan."""
        plan = {
            "primary_therapy": "Cognitive Behavioral Therapy (CBT)",
            "duration": "16-20 weeks initial treatment",
            "session_frequency": "Weekly",
            "treatment_goals": [
                "Reduce depressive symptoms",
                "Improve daily functioning",
                "Develop coping strategies",
                "Prevent relapse",
            ],
        }

        # Add specific interventions based on severity
        if phq9_score >= 15:
            plan["additional_interventions"] = [
                "Behavioral Activation Therapy",
                "Interpersonal Therapy (IPT)",
                "Mindfulness-based approaches",
            ]
            plan["medication_consideration"] = {
                "recommended": True,
                "note": "Psychiatric evaluation for antidepressant medication",
                "typical_options": ["SSRIs", "SNRIs", "Atypical antidepressants"],
            }
        elif phq9_score >= 10:
            plan["additional_interventions"] = [
                "Behavioral Activation",
                "Problem-solving therapy",
                "Social skills training",
            ]

        return plan

    def _get_behavioral_interventions(self) -> List[Dict[str, str]]:
        """Get depression-specific behavioral interventions."""
        return [
            {
                "intervention": "Daily Activity Scheduling",
                "description": "Plan and engage in one pleasurable and one mastery activity daily",
                "goal": "Increase positive experiences and sense of accomplishment",
            },
            {
                "intervention": "Mood and Activity Monitoring",
                "description": "Track daily mood ratings and activities to identify patterns",
                "goal": "Understand mood triggers and effective coping strategies",
            },
            {
                "intervention": "Social Activation",
                "description": "Schedule regular social interactions, even when not feeling motivated",
                "goal": "Combat isolation and maintain support connections",
            },
            {
                "intervention": "Sleep Hygiene Protocol",
                "description": "Establish consistent sleep schedule and bedtime routine",
                "goal": "Improve sleep quality and regulate circadian rhythms",
            },
            {
                "intervention": "Physical Activity Prescription",
                "description": "Start with 10-15 minutes daily movement, gradually increase",
                "goal": "Boost mood through endorphin release and achievement",
            },
        ]

    def _create_safety_plan(self) -> Dict[str, Any]:
        """Create comprehensive safety plan for suicide risk."""
        return {
            "warning_signs": [
                "Increased hopelessness",
                "Social withdrawal",
                "Sleep disturbances",
                "Increased substance use",
                "Giving away possessions",
            ],
            "coping_strategies": [
                "Call trusted friend or family member",
                "Use grounding techniques",
                "Go to public place",
                "Engage in physical activity",
                "Listen to calming music",
            ],
            "support_contacts": [
                "Trusted friend/family: [Name and phone]",
                "Therapist: [Name and phone]",
                "Primary care doctor: [Name and phone]",
                "Crisis helpline: 988",
            ],
            "environmental_safety": [
                "Remove or secure means of self-harm",
                "Have someone else hold medications",
                "Stay with supportive person when needed",
                "Avoid alcohol and drugs",
            ],
            "professional_resources": [
                "Crisis Text Line: Text HOME to 741741",
                "National Suicide Prevention Lifeline: 988",
                "Local emergency room",
                "Mobile crisis team: [Local number]",
            ],
        }


def demo_depression_agent():
    """Demo the depression agent functionality."""
    print("💙 DEPRESSION SPECIALIST AGENT")
    print("=" * 50)

    # Mock user data from routing agent
    user_data = {
        "clinical_scores": {"phq9": 18, "gad7": 7, "crisis_indicator": 0},
        "primary_concern": "depression",
        "age_range": "35-44",
    }

    agent = DepressionAgent()
    assessment = agent.get_initial_assessment(user_data)

    print(f"👨‍⚕️ Agent: {assessment['agent']}")
    print(f"🎯 Focus: {assessment['primary_focus']}")
    print(f"📊 Severity: {assessment['severity_level']}")
    print(f"🛡️ Crisis Risk: {assessment['crisis_assessment']['risk_level']}")
    print()

    print("📋 IMMEDIATE ACTION PLAN:")
    for i, action in enumerate(assessment["immediate_actions"], 1):
        print(f"   {i}. {action}")
    print()

    print("🗺️ TREATMENT PLAN:")
    plan = assessment["treatment_plan"]
    print(f"   Primary: {plan['primary_therapy']}")
    print(f"   Duration: {plan['duration']}")
    print(f"   Goals: {', '.join(plan['treatment_goals'][:2])}")
    print()

    print("🎯 BEHAVIORAL INTERVENTIONS:")
    for intervention in assessment["behavioral_interventions"][:3]:
        print(f"   • {intervention['intervention']}: {intervention['description']}")


if __name__ == "__main__":
    demo_depression_agent()
