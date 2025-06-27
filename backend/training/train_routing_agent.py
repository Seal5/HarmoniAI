"""
Mental Health Routing Agent Training System
Uses LangChain to train a model for classifying users into appropriate care categories
"""

import json
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
import os
from pathlib import Path

from langchain.llms import OpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.document_loaders import JSONLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain.prompts import PromptTemplate

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RoutingAgentTrainer:
    def __init__(self, openai_api_key: str = None):
        """Initialize the routing agent trainer."""
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required")
        
        self.llm = OpenAI(
            temperature=0.1,
            openai_api_key=self.openai_api_key,
            model_name="gpt-3.5-turbo-instruct"
        )
        self.embeddings = OpenAIEmbeddings(openai_api_key=self.openai_api_key)
        self.vectorstore = None
        self.routing_chain = None
        
    def load_training_data(self) -> List[Document]:
        """Load and prepare training data for the routing agent."""
        training_data = []
        
        # Clinical guidelines and routing rules
        clinical_guidelines = [
            Document(
                page_content="""
                ANXIETY ROUTING CRITERIA:
                - GAD-7 score >= 10 (moderate to severe anxiety)
                - Primary concern is anxiety-related
                - Physical symptoms of anxiety (restlessness, fatigue, concentration issues)
                - Avoidance behaviors due to anxiety
                - Panic attacks or excessive worry
                
                RECOMMENDED INTERVENTIONS:
                - Cognitive Behavioral Therapy (CBT)
                - Anxiety management techniques
                - Exposure therapy for specific phobias
                - Mindfulness-based interventions
                """,
                metadata={"category": "anxiety", "type": "clinical_guideline"}
            ),
            Document(
                page_content="""
                DEPRESSION ROUTING CRITERIA:
                - PHQ-9 score >= 10 (moderate to severe depression)
                - Persistent low mood, hopelessness
                - Loss of interest in activities (anhedonia)
                - Sleep disturbances, appetite changes
                - Fatigue, concentration difficulties
                - Self-worth issues, guilt
                
                CRISIS INDICATORS:
                - PHQ-9 item 9 score >= 1 (suicidal ideation)
                - Requires immediate professional intervention
                
                RECOMMENDED INTERVENTIONS:
                - Individual psychotherapy
                - Behavioral activation
                - Interpersonal therapy
                - Consider psychiatric evaluation
                """,
                metadata={"category": "depression", "type": "clinical_guideline"}
            ),
            Document(
                page_content="""
                TRAUMA ROUTING CRITERIA:
                - PCL-5 score >= 20 (probable PTSD)
                - History of traumatic events
                - Intrusive memories, nightmares, flashbacks
                - Avoidance of trauma-related stimuli
                - Hypervigilance, exaggerated startle response
                - Emotional numbing, detachment
                
                RECOMMENDED INTERVENTIONS:
                - Trauma-focused therapy (EMDR, CPT, PE)
                - Specialized trauma therapists
                - Somatic approaches
                - Group therapy for trauma survivors
                """,
                metadata={"category": "trauma", "type": "clinical_guideline"}
            ),
            Document(
                page_content="""
                LIFESTYLE COACHING ROUTING CRITERIA:
                - Low to mild scores on clinical assessments
                - Primary focus on wellness and prevention
                - Stress management needs
                - Lifestyle improvement goals
                - Work-life balance issues
                - Habit formation and behavior change
                
                RECOMMENDED INTERVENTIONS:
                - Life coaching sessions
                - Wellness programs
                - Stress management workshops
                - Fitness and nutrition guidance
                - Mindfulness training
                - Productivity coaching
                """,
                metadata={"category": "lifestyle", "type": "clinical_guideline"}
            )
        ]
        
        # Sample case studies for training
        case_studies = [
            Document(
                page_content="""
                Case: 28-year-old professional
                PHQ-9: 12, GAD-7: 15, PCL-5: 8
                Primary concern: Constant worry about work performance
                Symptoms: Racing thoughts, difficulty sleeping, muscle tension
                Sleep quality: Poor, Exercise: Rarely
                ROUTING: ANXIETY - High GAD-7 score with worry-focused symptoms
                """,
                metadata={"category": "anxiety", "type": "case_study"}
            ),
            Document(
                page_content="""
                Case: 35-year-old parent
                PHQ-9: 16, GAD-7: 8, PCL-5: 5
                Primary concern: Feeling hopeless and unmotivated
                Symptoms: No interest in activities, fatigue, poor concentration
                Sleep quality: Poor (too much sleep), Exercise: Never
                ROUTING: DEPRESSION - High PHQ-9 with anhedonia and fatigue
                """,
                metadata={"category": "depression", "type": "case_study"}
            ),
            Document(
                page_content="""
                Case: 42-year-old veteran
                PHQ-9: 11, GAD-7: 13, PCL-5: 28
                Primary concern: Nightmares and flashbacks from military service
                Symptoms: Hypervigilance, avoiding crowds, emotional detachment
                Sleep quality: Very poor, Exercise: Several times weekly
                ROUTING: TRAUMA - High PCL-5 score with clear PTSD symptoms
                """,
                metadata={"category": "trauma", "type": "case_study"}
            ),
            Document(
                page_content="""
                Case: 29-year-old entrepreneur
                PHQ-9: 6, GAD-7: 7, PCL-5: 3
                Primary concern: Better work-life balance and stress management
                Symptoms: Mild stress, wants to optimize productivity
                Sleep quality: Fair, Exercise: Several times weekly
                Goals: Stress reduction, better habits, mindfulness
                ROUTING: LIFESTYLE - Low clinical scores with wellness focus
                """,
                metadata={"category": "lifestyle", "type": "case_study"}
            )
        ]
        
        training_data.extend(clinical_guidelines)
        training_data.extend(case_studies)
        
        return training_data
    
    def create_vectorstore(self, documents: List[Document]):
        """Create a vector store from training documents."""
        logger.info("Creating vector store from training data...")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        splits = text_splitter.split_documents(documents)
        self.vectorstore = FAISS.from_documents(splits, self.embeddings)
        
        logger.info(f"Vector store created with {len(splits)} document chunks")
    
    def create_routing_prompt(self) -> PromptTemplate:
        """Create the prompt template for routing decisions."""
        template = """
        You are a clinical mental health routing agent. Based on the intake assessment data provided, 
        determine the most appropriate care category for this individual.
        
        Use the following clinical guidelines and assessment scores to make your routing decision:
        
        Context from clinical guidelines:
        {context}
        
        Assessment Data:
        {assessment_data}
        
        Routing Categories:
        1. ANXIETY - For individuals with significant anxiety symptoms (GAD-7 >= 10)
        2. DEPRESSION - For individuals with significant depressive symptoms (PHQ-9 >= 10)
        3. TRAUMA - For individuals with trauma-related symptoms (PCL-5 >= 20)
        4. LIFESTYLE - For individuals focused on wellness and prevention (low clinical scores)
        
        CRITICAL: If PHQ-9 item 9 (suicidal ideation) >= 1, flag as CRISIS and recommend immediate intervention.
        
        Provide your routing decision in the following format:
        
        PRIMARY_CATEGORY: [ANXIETY|DEPRESSION|TRAUMA|LIFESTYLE|CRISIS]
        CONFIDENCE: [0.0-1.0]
        SECONDARY_CONSIDERATIONS: [Any additional categories to consider]
        REASONING: [Brief clinical reasoning for the decision]
        RECOMMENDATIONS: [Specific intervention recommendations]
        
        Routing Decision:
        """
        
        return PromptTemplate(
            template=template,
            input_variables=["context", "assessment_data"]
        )
    
    def build_routing_chain(self):
        """Build the routing chain using retrieval-augmented generation."""
        if not self.vectorstore:
            raise ValueError("Vector store must be created first")
        
        prompt = self.create_routing_prompt()
        
        self.routing_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 4}),
            chain_type_kwargs={"prompt": prompt}
        )
        
        logger.info("Routing chain created successfully")
    
    def route_user(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Route a user based on their assessment data."""
        if not self.routing_chain:
            raise ValueError("Routing chain must be built first")
        
        # Calculate clinical scores
        scores = self.calculate_clinical_scores(assessment_data)
        
        # Format assessment data for the prompt
        formatted_data = self.format_assessment_data(assessment_data, scores)
        
        # Get routing decision
        result = self.routing_chain.run(assessment_data=formatted_data)
        
        # Parse the result
        routing_decision = self.parse_routing_result(result, scores)
        
        return routing_decision
    
    def calculate_clinical_scores(self, assessment_data: Dict[str, Any]) -> Dict[str, int]:
        """Calculate PHQ-9, GAD-7, and PCL-5 scores from assessment data."""
        scores = {}
        
        # PHQ-9 score (depression)
        phq9_items = [f'phq9_{i}' for i in range(1, 10)]
        scores['phq9'] = sum(assessment_data.get(item, 0) for item in phq9_items)
        
        # GAD-7 score (anxiety)
        gad7_items = [f'gad7_{i}' for i in range(1, 8)]
        scores['gad7'] = sum(assessment_data.get(item, 0) for item in gad7_items)
        
        # PCL-5 brief score (trauma)
        pcl5_items = [f'pcl5_{i}' for i in range(1, 9)]
        scores['pcl5'] = sum(assessment_data.get(item, 0) for item in pcl5_items)
        
        # Crisis indicator (suicidal ideation)
        scores['crisis_indicator'] = assessment_data.get('phq9_9', 0)
        
        return scores
    
    def format_assessment_data(self, assessment_data: Dict[str, Any], scores: Dict[str, int]) -> str:
        """Format assessment data for the routing prompt."""
        formatted = f"""
        Clinical Scores:
        - PHQ-9 (Depression): {scores['phq9']}/27
        - GAD-7 (Anxiety): {scores['gad7']}/21
        - PCL-5 Brief (Trauma): {scores['pcl5']}/32
        - Crisis Indicator (Suicidal Ideation): {scores['crisis_indicator']}
        
        Primary Concern: {assessment_data.get('primary_concern', 'Not specified')}
        Age Range: {assessment_data.get('age_range', 'Not specified')}
        Sleep Quality: {assessment_data.get('sleep_quality', 'Not specified')}
        Exercise Frequency: {assessment_data.get('exercise_frequency', 'Not specified')}
        Stress Management: {assessment_data.get('stress_management', 'Not specified')}
        Wellness Goals: {', '.join(assessment_data.get('wellness_goals', []))}
        Support Preference: {assessment_data.get('preferred_support_type', 'Not specified')}
        Urgency: {assessment_data.get('urgency_level', 'Not specified')}
        """
        
        return formatted
    
    def parse_routing_result(self, result: str, scores: Dict[str, int]) -> Dict[str, Any]:
        """Parse the routing result from the LLM response."""
        lines = result.strip().split('\n')
        routing_decision = {
            'primary_category': 'LIFESTYLE',  # default
            'confidence': 0.5,
            'secondary_considerations': [],
            'reasoning': '',
            'recommendations': [],
            'clinical_scores': scores,
            'crisis_flag': scores['crisis_indicator'] > 0
        }
        
        for line in lines:
            line = line.strip()
            if line.startswith('PRIMARY_CATEGORY:'):
                routing_decision['primary_category'] = line.split(':', 1)[1].strip()
            elif line.startswith('CONFIDENCE:'):
                try:
                    routing_decision['confidence'] = float(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('SECONDARY_CONSIDERATIONS:'):
                considerations = line.split(':', 1)[1].strip()
                routing_decision['secondary_considerations'] = [c.strip() for c in considerations.split(',') if c.strip()]
            elif line.startswith('REASONING:'):
                routing_decision['reasoning'] = line.split(':', 1)[1].strip()
            elif line.startswith('RECOMMENDATIONS:'):
                routing_decision['recommendations'] = [line.split(':', 1)[1].strip()]
        
        return routing_decision
    
    def train_and_save(self, save_path: str = "models/routing_agent"):
        """Train the routing agent and save the model."""
        logger.info("Starting routing agent training...")
        
        # Load training data
        documents = self.load_training_data()
        
        # Create vector store
        self.create_vectorstore(documents)
        
        # Build routing chain
        self.build_routing_chain()
        
        # Save the model
        os.makedirs(save_path, exist_ok=True)
        self.vectorstore.save_local(os.path.join(save_path, "vectorstore"))
        
        # Save configuration
        config = {
            "model_type": "routing_agent",
            "version": "1.0",
            "categories": ["ANXIETY", "DEPRESSION", "TRAUMA", "LIFESTYLE", "CRISIS"],
            "clinical_thresholds": {
                "phq9_moderate": 10,
                "gad7_moderate": 10,
                "pcl5_probable_ptsd": 20,
                "crisis_threshold": 1
            }
        }
        
        with open(os.path.join(save_path, "config.json"), 'w') as f:
            json.dump(config, f, indent=2)
        
        logger.info(f"Routing agent saved to {save_path}")
        
        return self
    
    def test_routing(self):
        """Test the routing agent with sample cases."""
        logger.info("Testing routing agent...")
        
        test_cases = [
            {
                "name": "High Anxiety Case",
                "data": {
                    "primary_concern": "anxiety",
                    "age_range": "25-34",
                    "phq9_1": 1, "phq9_2": 2, "phq9_3": 1, "phq9_4": 2, "phq9_5": 1,
                    "phq9_6": 1, "phq9_7": 2, "phq9_8": 0, "phq9_9": 0,
                    "gad7_1": 3, "gad7_2": 2, "gad7_3": 3, "gad7_4": 2, 
                    "gad7_5": 2, "gad7_6": 1, "gad7_7": 2,
                    "pcl5_1": 1, "pcl5_2": 0, "pcl5_3": 0, "pcl5_4": 1,
                    "pcl5_5": 1, "pcl5_6": 0, "pcl5_7": 1, "pcl5_8": 0,
                    "sleep_quality": 2, "exercise_frequency": "rarely",
                    "preferred_support_type": "individual_therapy"
                }
            },
            {
                "name": "Depression Case",
                "data": {
                    "primary_concern": "depression",
                    "age_range": "35-44",
                    "phq9_1": 3, "phq9_2": 3, "phq9_3": 2, "phq9_4": 3, "phq9_5": 2,
                    "phq9_6": 2, "phq9_7": 2, "phq9_8": 1, "phq9_9": 0,
                    "gad7_1": 1, "gad7_2": 1, "gad7_3": 2, "gad7_4": 1, 
                    "gad7_5": 0, "gad7_6": 1, "gad7_7": 1,
                    "pcl5_1": 0, "pcl5_2": 1, "pcl5_3": 0, "pcl5_4": 0,
                    "pcl5_5": 1, "pcl5_6": 2, "pcl5_7": 1, "pcl5_8": 0,
                    "sleep_quality": 1, "exercise_frequency": "never",
                    "preferred_support_type": "individual_therapy"
                }
            },
            {
                "name": "Lifestyle Coaching Case",
                "data": {
                    "primary_concern": "lifestyle",
                    "age_range": "25-34",
                    "phq9_1": 1, "phq9_2": 0, "phq9_3": 1, "phq9_4": 1, "phq9_5": 0,
                    "phq9_6": 0, "phq9_7": 1, "phq9_8": 0, "phq9_9": 0,
                    "gad7_1": 1, "gad7_2": 1, "gad7_3": 1, "gad7_4": 2, 
                    "gad7_5": 0, "gad7_6": 1, "gad7_7": 0,
                    "pcl5_1": 0, "pcl5_2": 0, "pcl5_3": 0, "pcl5_4": 0,
                    "pcl5_5": 0, "pcl5_6": 0, "pcl5_7": 0, "pcl5_8": 0,
                    "sleep_quality": 3, "exercise_frequency": "several_weekly",
                    "wellness_goals": ["stress_reduction", "work_life_balance"],
                    "preferred_support_type": "coaching"
                }
            }
        ]
        
        for case in test_cases:
            logger.info(f"\nTesting: {case['name']}")
            result = self.route_user(case['data'])
            logger.info(f"Routing: {result['primary_category']} (Confidence: {result['confidence']:.2f})")
            logger.info(f"Reasoning: {result['reasoning']}")
            logger.info(f"Clinical Scores: PHQ-9={result['clinical_scores']['phq9']}, GAD-7={result['clinical_scores']['gad7']}, PCL-5={result['clinical_scores']['pcl5']}")

def main():
    """Main training function."""
    try:
        trainer = RoutingAgentTrainer()
        trainer.train_and_save()
        trainer.test_routing()
        
        logger.info("Training completed successfully!")
        
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise

if __name__ == "__main__":
    main() 