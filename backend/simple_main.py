from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import os

app = FastAPI(title="Mental Health Routing API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SurveyResponse(BaseModel):
    responses: Dict[str, int]

class RoutingResult(BaseModel):
    primary_category: str
    confidence: float
    risk_level: str
    recommendations: List[str]
    next_steps: List[str]
    reasoning: str

def load_survey_data():
    """Load survey questions from JSON file"""
    try:
        with open('data/intake_survey.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback survey data
        return {
            "sections": [
                {
                    "name": "Depression (PHQ-9)",
                    "description": "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
                    "questions": [
                        {"id": "phq9_1", "text": "Little interest or pleasure in doing things", "scale": "0-3"},
                        {"id": "phq9_2", "text": "Feeling down, depressed, or hopeless", "scale": "0-3"},
                        {"id": "phq9_3", "text": "Trouble falling or staying asleep, or sleeping too much", "scale": "0-3"},
                        {"id": "phq9_4", "text": "Feeling tired or having little energy", "scale": "0-3"},
                        {"id": "phq9_5", "text": "Poor appetite or overeating", "scale": "0-3"},
                        {"id": "phq9_6", "text": "Feeling bad about yourself", "scale": "0-3"},
                        {"id": "phq9_7", "text": "Trouble concentrating on things", "scale": "0-3"},
                        {"id": "phq9_8", "text": "Moving or speaking slowly, or being fidgety", "scale": "0-3"},
                        {"id": "phq9_9", "text": "Thoughts that you would be better off dead", "scale": "0-3"}
                    ]
                },
                {
                    "name": "Anxiety (GAD-7)",
                    "description": "Over the last 2 weeks, how often have you been bothered by the following problems?",
                    "questions": [
                        {"id": "gad7_1", "text": "Feeling nervous, anxious or on edge", "scale": "0-3"},
                        {"id": "gad7_2", "text": "Not being able to stop or control worrying", "scale": "0-3"},
                        {"id": "gad7_3", "text": "Worrying too much about different things", "scale": "0-3"},
                        {"id": "gad7_4", "text": "Trouble relaxing", "scale": "0-3"},
                        {"id": "gad7_5", "text": "Being so restless that it is hard to sit still", "scale": "0-3"},
                        {"id": "gad7_6", "text": "Becoming easily annoyed or irritable", "scale": "0-3"},
                        {"id": "gad7_7", "text": "Feeling afraid as if something awful might happen", "scale": "0-3"}
                    ]
                },
                {
                    "name": "Trauma (PCL-5 Sample)",
                    "description": "In the past month, how much were you bothered by:",
                    "questions": [
                        {"id": "pcl5_1", "text": "Repeated, disturbing memories, thoughts, or images", "scale": "0-4"},
                        {"id": "pcl5_2", "text": "Repeated, disturbing dreams", "scale": "0-4"},
                        {"id": "pcl5_3", "text": "Suddenly acting or feeling as if a stressful experience were happening again", "scale": "0-4"},
                        {"id": "pcl5_4", "text": "Feeling very upset when something reminded you of a stressful experience", "scale": "0-4"},
                        {"id": "pcl5_5", "text": "Having physical reactions when reminded of a stressful experience", "scale": "0-4"}
                    ]
                },
                {
                    "name": "Lifestyle",
                    "description": "Please rate the following areas of your life:",
                    "questions": [
                        {"id": "lifestyle_1", "text": "How satisfied are you with your current sleep quality?", "scale": "1-5"},
                        {"id": "lifestyle_2", "text": "How often do you engage in physical exercise?", "scale": "1-5"},
                        {"id": "lifestyle_3", "text": "How would you rate your current stress management?", "scale": "1-5"},
                        {"id": "lifestyle_4", "text": "How satisfied are you with your work-life balance?", "scale": "1-5"},
                        {"id": "lifestyle_5", "text": "How would you rate your social connections?", "scale": "1-5"}
                    ]
                }
            ]
        }

def calculate_scores(responses: Dict[str, int]) -> Dict[str, int]:
    """Calculate clinical scores from responses"""
    scores = {}
    
    # PHQ-9 Depression Score
    phq9_items = [f"phq9_{i}" for i in range(1, 10)]
    scores['depression'] = sum(responses.get(item, 0) for item in phq9_items)
    
    # GAD-7 Anxiety Score
    gad7_items = [f"gad7_{i}" for i in range(1, 8)]
    scores['anxiety'] = sum(responses.get(item, 0) for item in gad7_items)
    
    # PCL-5 Trauma Score (sample)
    pcl5_items = [f"pcl5_{i}" for i in range(1, 6)]
    scores['trauma'] = sum(responses.get(item, 0) for item in pcl5_items)
    
    # Lifestyle Score
    lifestyle_items = [f"lifestyle_{i}" for i in range(1, 6)]
    scores['lifestyle'] = sum(responses.get(item, 0) for item in lifestyle_items)
    
    return scores

def route_user(scores: Dict[str, int]) -> RoutingResult:
    """Simple routing logic without LangChain"""
    
    # Clinical thresholds
    depression_severe = scores['depression'] >= 15
    depression_moderate = scores['depression'] >= 10
    anxiety_severe = scores['anxiety'] >= 15
    anxiety_moderate = scores['anxiety'] >= 10
    trauma_moderate = scores['trauma'] >= 12
    lifestyle_low = scores['lifestyle'] <= 15
    
    # Crisis check (PHQ-9 item 9 or high scores)
    suicidal_ideation = any(k.startswith('phq9_9') and v > 0 for k, v in scores.items() if isinstance(v, int))
    if suicidal_ideation or scores['depression'] >= 20:
        return RoutingResult(
            primary_category="CRISIS",
            confidence=0.95,
            risk_level="HIGH",
            recommendations=[
                "🚨 IMMEDIATE CRISIS INTERVENTION NEEDED",
                "Contact emergency services: 988 (Suicide & Crisis Lifeline)",
                "Go to nearest emergency room",
                "Contact a trusted friend or family member"
            ],
            next_steps=[
                "Immediate safety planning",
                "Professional crisis intervention",
                "24/7 crisis support connection"
            ],
            reasoning="High risk indicators detected requiring immediate intervention"
        )
    
    # Determine primary category
    if depression_severe and anxiety_severe:
        category = "DEPRESSION" if scores['depression'] > scores['anxiety'] else "ANXIETY"
        confidence = 0.85
    elif depression_moderate or depression_severe:
        category = "DEPRESSION"
        confidence = 0.80 if depression_severe else 0.70
    elif anxiety_moderate or anxiety_severe:
        category = "ANXIETY"
        confidence = 0.80 if anxiety_severe else 0.70
    elif trauma_moderate:
        category = "TRAUMA"
        confidence = 0.75
    elif lifestyle_low:
        category = "LIFESTYLE"
        confidence = 0.65
    else:
        category = "LIFESTYLE"
        confidence = 0.60
    
    # Generate recommendations based on category
    recommendations_map = {
        "DEPRESSION": [
            "🧠 Connect with Depression Specialist Agent",
            "Consider therapy (CBT, IPT, or behavioral activation)",
            "Explore medication evaluation with psychiatrist",
            "Develop daily routine and activity scheduling",
            "Build support network and social connections"
        ],
        "ANXIETY": [
            "😰 Connect with Anxiety Specialist Agent",
            "Learn anxiety management techniques (breathing, grounding)",
            "Consider Cognitive Behavioral Therapy (CBT)",
            "Practice progressive muscle relaxation",
            "Explore exposure therapy for specific fears"
        ],
        "TRAUMA": [
            "🛡️ Connect with Trauma Specialist Agent",
            "Consider trauma-focused therapy (EMDR, CPT, TF-CBT)",
            "Learn grounding and stabilization techniques",
            "Develop safety and coping strategies",
            "Build trauma-informed support network"
        ],
        "LIFESTYLE": [
            "🌱 Connect with Lifestyle Coach Agent",
            "Optimize sleep hygiene and routine",
            "Develop regular exercise schedule",
            "Learn stress management techniques",
            "Improve work-life balance strategies",
            "Strengthen social connections"
        ]
    }
    
    next_steps_map = {
        "DEPRESSION": [
            "Complete comprehensive depression assessment",
            "Begin behavioral activation exercises",
            "Schedule regular check-ins with specialist"
        ],
        "ANXIETY": [
            "Start anxiety monitoring and tracking",
            "Practice daily relaxation techniques",
            "Begin graduated exposure if appropriate"
        ],
        "TRAUMA": [
            "Establish safety and stabilization",
            "Begin trauma processing when ready",
            "Develop comprehensive treatment plan"
        ],
        "LIFESTYLE": [
            "Set specific, measurable wellness goals",
            "Create daily wellness routine",
            "Track progress and adjust strategies"
        ]
    }
    
    risk_level = "HIGH" if (depression_severe or anxiety_severe) else "MODERATE" if (depression_moderate or anxiety_moderate or trauma_moderate) else "LOW"
    
    return RoutingResult(
        primary_category=category,
        confidence=confidence,
        risk_level=risk_level,
        recommendations=recommendations_map[category],
        next_steps=next_steps_map[category],
        reasoning=f"Primary indicators: {category.lower()} score = {scores.get(category.lower(), 0)}, risk level = {risk_level}"
    )

@app.get("/")
async def root():
    return {"message": "Mental Health Routing API is running"}

@app.get("/survey")
async def get_survey():
    """Get survey questions"""
    return load_survey_data()

@app.post("/route", response_model=RoutingResult)
async def route_user_endpoint(survey_response: SurveyResponse):
    """Route user based on survey responses"""
    try:
        scores = calculate_scores(survey_response.responses)
        result = route_user(scores)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 