"""
FastAPI backend for the HarmoniAI routing agent - Gemini Version
Uses FREE Google Gemini 2.5 Flash instead of paid OpenAI
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import os
import json
import logging
from pathlib import Path
import sys

# Add training directory to path
sys.path.append("./training")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="HarmoniAI Gemini Routing Agent API",
    description="Mental health triage and routing system using FREE Google Gemini",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class SurveyResponse(BaseModel):
    responses: Dict[str, Any]  # Simplified to accept any survey response format


class ClinicalScores(BaseModel):
    phq9: int
    gad7: int
    pcl5: int
    crisis_indicator: int


class RoutingDecision(BaseModel):
    primary_category: str
    confidence: float
    secondary_considerations: List[str]
    reasoning: str
    recommendations: List[str]
    clinical_scores: ClinicalScores
    crisis_flag: bool
    risk_level: str
    next_steps: List[str]


# Global routing agent instance
routing_agent = None


def initialize_routing_agent():
    """Initialize the Gemini routing agent."""
    global routing_agent

    # Check if we have Google API key
    if not os.getenv("GOOGLE_API_KEY"):
        logger.warning("Google API key not found. Using fallback routing.")
        return None

    try:
        from train_routing_agent_gemini import GeminiRoutingAgentTrainer

        logger.info("Initializing Gemini routing agent...")
        agent = GeminiRoutingAgentTrainer()

        # Check if model exists, if not train it
        model_path = "models/routing_agent_gemini"
        if not os.path.exists(model_path):
            logger.info("Training Gemini routing agent...")
            agent.train_and_save(model_path)
        else:
            logger.info("Loading existing Gemini routing agent...")
            # Load existing model (simplified for demo)
            documents = agent.load_training_data()
            agent.create_vectorstore(documents)
            agent.build_routing_chain()

        routing_agent = agent
        logger.info("Gemini routing agent initialized successfully!")
        return agent

    except Exception as e:
        logger.error(f"Failed to initialize Gemini routing agent: {e}")
        return None


def fallback_routing(responses: Dict[str, Any]) -> RoutingDecision:
    """Fallback routing logic when Gemini is not available."""
    # Calculate clinical scores
    phq9_score = sum(responses.get(f"phq9_{i}", 0) for i in range(1, 10))
    gad7_score = sum(responses.get(f"gad7_{i}", 0) for i in range(1, 8))
    pcl5_score = sum(responses.get(f"pcl5_{i}", 0) for i in range(1, 9))
    crisis_indicator = responses.get("phq9_9", 0)

    scores = ClinicalScores(
        phq9=phq9_score,
        gad7=gad7_score,
        pcl5=pcl5_score,
        crisis_indicator=crisis_indicator,
    )

    # Routing logic
    if crisis_indicator >= 1:
        return RoutingDecision(
            primary_category="CRISIS",
            confidence=0.95,
            secondary_considerations=[],
            reasoning="Immediate intervention required due to suicidal ideation",
            recommendations=[
                "Contact crisis hotline immediately",
                "Consider emergency department evaluation",
                "Establish safety plan",
                "Schedule urgent psychiatric evaluation",
            ],
            clinical_scores=scores,
            crisis_flag=True,
            risk_level="HIGH",
            next_steps=[
                "Immediate crisis intervention",
                "Safety planning",
                "Professional evaluation",
            ],
        )
    elif pcl5_score >= 20:
        return RoutingDecision(
            primary_category="TRAUMA",
            confidence=0.85,
            secondary_considerations=(
                ["anxiety", "depression"] if gad7_score >= 5 or phq9_score >= 5 else []
            ),
            reasoning=f"High trauma symptoms (PCL-5: {pcl5_score}) indicate probable PTSD",
            recommendations=[
                "Trauma-focused therapy (EMDR, CPT, or PE)",
                "Specialized trauma therapist referral",
                "Consider group therapy for trauma survivors",
            ],
            clinical_scores=scores,
            crisis_flag=False,
            risk_level="MODERATE",
            next_steps=["Trauma-informed therapy", "Specialized provider referral"],
        )
    elif phq9_score >= 15:
        return RoutingDecision(
            primary_category="DEPRESSION",
            confidence=0.88,
            secondary_considerations=["anxiety"] if gad7_score >= 5 else [],
            reasoning=f"Severe depression symptoms (PHQ-9: {phq9_score})",
            recommendations=[
                "Individual psychotherapy",
                "Consider psychiatric evaluation",
                "Behavioral activation therapy",
            ],
            clinical_scores=scores,
            crisis_flag=False,
            risk_level="MODERATE",
            next_steps=["Therapy appointment", "Psychiatric consultation"],
        )
    elif gad7_score >= 10:
        return RoutingDecision(
            primary_category="ANXIETY",
            confidence=0.82,
            secondary_considerations=["depression"] if phq9_score >= 5 else [],
            reasoning=f"Moderate to severe anxiety (GAD-7: {gad7_score})",
            recommendations=[
                "Cognitive Behavioral Therapy (CBT)",
                "Anxiety management techniques",
                "Mindfulness-based interventions",
            ],
            clinical_scores=scores,
            crisis_flag=False,
            risk_level="MODERATE",
            next_steps=["CBT therapy", "Anxiety management training"],
        )
    elif phq9_score >= 10:
        return RoutingDecision(
            primary_category="DEPRESSION",
            confidence=0.75,
            secondary_considerations=["anxiety"] if gad7_score >= 5 else [],
            reasoning=f"Moderate depression symptoms (PHQ-9: {phq9_score})",
            recommendations=[
                "Individual psychotherapy",
                "Behavioral activation",
                "Regular monitoring",
            ],
            clinical_scores=scores,
            crisis_flag=False,
            risk_level="LOW",
            next_steps=["Therapy appointment", "Self-care strategies"],
        )
    else:
        return RoutingDecision(
            primary_category="LIFESTYLE",
            confidence=0.80,
            secondary_considerations=[],
            reasoning="Low clinical scores indicate wellness and prevention focus",
            recommendations=[
                "Life coaching sessions",
                "Wellness programs",
                "Stress management workshops",
            ],
            clinical_scores=scores,
            crisis_flag=False,
            risk_level="LOW",
            next_steps=["Wellness coaching", "Preventive strategies"],
        )


@app.on_event("startup")
async def startup_event():
    """Initialize the routing agent on startup."""
    initialize_routing_agent()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "HarmoniAI Gemini Routing Agent API",
        "version": "1.0.0",
        "ai_model": "Google Gemini 2.5 Flash (FREE)",
        "status": "ready",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    gemini_status = "enabled" if routing_agent else "fallback"
    return {
        "status": "healthy",
        "gemini_agent": gemini_status,
        "api_key_set": bool(os.getenv("GOOGLE_API_KEY")),
    }


@app.post("/route", response_model=RoutingDecision)
async def route_user(survey_data: SurveyResponse):
    """Route user based on survey responses."""
    try:
        logger.info("Processing routing request...")

        # Use Gemini agent if available, otherwise fallback
        if routing_agent:
            logger.info("Using Gemini routing agent...")
            try:
                result = routing_agent.route_user(survey_data.responses)

                # Convert to our response format
                return RoutingDecision(
                    primary_category=result.get("primary_category", "LIFESTYLE"),
                    confidence=result.get("confidence", 0.5),
                    secondary_considerations=result.get("secondary_considerations", []),
                    reasoning=result.get("reasoning", ""),
                    recommendations=result.get("recommendations", []),
                    clinical_scores=ClinicalScores(**result.get("clinical_scores", {})),
                    crisis_flag=result.get("crisis_flag", False),
                    risk_level=result.get("risk_level", "LOW"),
                    next_steps=result.get("next_steps", []),
                )
            except Exception as e:
                logger.error(f"Gemini routing failed: {e}")
                logger.info("Falling back to simple routing...")
                return fallback_routing(survey_data.responses)
        else:
            logger.info("Using fallback routing...")
            return fallback_routing(survey_data.responses)

    except Exception as e:
        logger.error(f"Routing error: {e}")
        raise HTTPException(status_code=500, detail=f"Routing failed: {str(e)}")


@app.get("/survey")
async def get_survey():
    """Get survey configuration."""
    try:
        # Load survey data from JSON file
        survey_path = Path("data/intake_survey.json")
        if survey_path.exists():
            with open(survey_path, "r") as f:
                survey_data = json.load(f)
            return survey_data
        else:
            raise HTTPException(
                status_code=404, detail="Survey configuration not found"
            )
    except Exception as e:
        logger.error(f"Error loading survey: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load survey: {str(e)}")


@app.get("/clinical-thresholds")
async def get_clinical_thresholds():
    """Get clinical thresholds for scoring."""
    return {
        "phq9": {
            "minimal": "0-4",
            "mild": "5-9",
            "moderate": "10-14",
            "moderately_severe": "15-19",
            "severe": "20-27",
        },
        "gad7": {
            "minimal": "0-4",
            "mild": "5-9",
            "moderate": "10-14",
            "severe": "15-21",
        },
        "pcl5": {"minimal": "0-19", "probable_ptsd": "20-32"},
        "crisis_threshold": 1,
    }


@app.get("/gemini-status")
async def get_gemini_status():
    """Get Gemini agent status."""
    return {
        "gemini_enabled": routing_agent is not None,
        "api_key_configured": bool(os.getenv("GOOGLE_API_KEY")),
        "model": "gemini-2.5-flash" if routing_agent else "fallback",
        "cost": "FREE" if routing_agent else "No cost (fallback)",
        "setup_url": "https://makersuite.google.com/app/apikey",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
