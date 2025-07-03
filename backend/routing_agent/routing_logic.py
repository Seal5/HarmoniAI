"""
Routing Agent Logic
Handles user classification and routing decisions
"""

import re
from typing import Dict, List, Any, Tuple
import json

class RoutingAgent:
    """Main routing agent that classifies users and determines appropriate care."""
    
    def __init__(self):
        self.crisis_keywords = [
            'suicide', 'kill myself', 'want to die', 'end it all', 'no reason to live',
            'better off dead', 'hurt myself', 'self-harm', 'cutting', 'overdose',
            'plan to die', 'suicidal', 'ending my life', 'give up'
        ]
        
        self.anxiety_keywords = [
            'anxiety', 'anxious', 'worry', 'worried', 'panic', 'panic attack',
            'fear', 'afraid', 'scared', 'nervous', 'stressed',
            'overwhelmed', 'overthinking', 'racing thoughts', 'restless',
            'tension', 'tightness', 'breathing', 'heart racing'
        ]
        
        self.depression_keywords = [
            'depression', 'depressed', 'sad', 'sadness', 'hopeless', 'hopelessness',
            'worthless', 'guilt', 'guilty', 'shame', 'tired', 'fatigue',
            'exhausted', 'no energy', 'no motivation', 'can\'t sleep',
            'sleeping too much', 'appetite', 'weight loss', 'weight gain',
            'concentration', 'focus', 'memory', 'thoughts of death'
        ]
        
        self.trauma_keywords = [
            'trauma', 'traumatic', 'ptsd', 'flashback', 'nightmare',
            'nightmares', 'trigger', 'triggered', 'abuse', 'assault',
            'accident', 'disaster', 'war', 'combat', 'violence',
            'sexual assault', 'domestic violence', 'childhood trauma'
        ]
    
    def classify_user(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main classification method that analyzes user input and determines routing.
        
        Args:
            conversation_data: Dictionary containing user conversation and clinical data
            
        Returns:
            Dictionary with classification results and routing decision
        """
        # Extract data
        initial_message = conversation_data.get('initial_message', '')
        clinical_scores = conversation_data.get('clinical_scores', {})
        
        # Perform text analysis
        text_analysis = self._analyze_text(initial_message)
        
        # Analyze clinical scores
        clinical_analysis = self._analyze_clinical_scores(clinical_scores)
        
        # Combine analyses for final classification
        classification = self._combine_analyses(text_analysis, clinical_analysis)
        
        # Generate routing decision
        routing_decision = self._generate_routing_decision(classification)
        
        return {
            'classification': classification,
            'routing_decision': routing_decision,
            'text_analysis': text_analysis,
            'clinical_analysis': clinical_analysis
        }
    
    def _analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze text content for keywords and sentiment."""
        text_lower = text.lower()
        
        # Check for crisis indicators first
        crisis_score = 0
        for keyword in self.crisis_keywords:
            if keyword in text_lower:
                crisis_score += 1
        
        # Check for other categories
        anxiety_score = sum(1 for keyword in self.anxiety_keywords if keyword in text_lower)
        depression_score = sum(1 for keyword in self.depression_keywords if keyword in text_lower)
        trauma_score = sum(1 for keyword in self.trauma_keywords if keyword in text_lower)
        
        # Sentiment analysis (simple approach)
        positive_words = ['good', 'better', 'improving', 'hope', 'helpful', 'support']
        negative_words = ['bad', 'worse', 'terrible', 'hopeless', 'useless', 'alone']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        sentiment_score = positive_count - negative_count
        
        return {
            'crisis_score': crisis_score,
            'anxiety_score': anxiety_score,
            'depression_score': depression_score,
            'trauma_score': trauma_score,
            'sentiment_score': sentiment_score,
            'text_length': len(text),
            'has_crisis_keywords': crisis_score > 0
        }
    
    def _analyze_clinical_scores(self, clinical_scores: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze clinical assessment scores."""
        phq9_score = clinical_scores.get('phq9', 0)
        gad7_score = clinical_scores.get('gad7', 0)
        pcl5_score = clinical_scores.get('pcl5', 0)
        
        # Determine severity levels
        phq9_severity = self._get_phq9_severity(phq9_score)
        gad7_severity = self._get_gad7_severity(gad7_score)
        pcl5_severity = self._get_pcl5_severity(pcl5_score)
        
        # Check for crisis indicators
        crisis_indicator = clinical_scores.get('phq9_9', 0)  # Suicidal ideation question
        
        return {
            'phq9_score': phq9_score,
            'gad7_score': gad7_score,
            'pcl5_score': pcl5_score,
            'phq9_severity': phq9_severity,
            'gad7_severity': gad7_severity,
            'pcl5_severity': pcl5_severity,
            'crisis_indicator': crisis_indicator,
            'has_crisis_risk': crisis_indicator >= 1
        }
    
    def _combine_analyses(self, text_analysis: Dict[str, Any], clinical_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Combine text and clinical analyses for final classification."""
        
        # Crisis check (highest priority)
        if text_analysis['has_crisis_keywords'] or clinical_analysis['has_crisis_risk']:
            return {
                'category': 'crisis',
                'severity': 'crisis',
                'confidence': 0.95,
                'reasoning': 'Crisis indicators detected in text or clinical scores'
            }
        
        # Clinical score-based classification
        phq9_score = clinical_analysis['phq9_score']
        gad7_score = clinical_analysis['gad7_score']
        pcl5_score = clinical_analysis['pcl5_score']
        
        # Trauma classification (high PCL-5 scores)
        if pcl5_score >= 20:
            return {
                'category': 'trauma',
                'severity': clinical_analysis['pcl5_severity'],
                'confidence': 0.85,
                'reasoning': f'High trauma symptoms (PCL-5: {pcl5_score})'
            }
        
        # Depression classification
        if phq9_score >= 15:
            return {
                'category': 'depression',
                'severity': clinical_analysis['phq9_severity'],
                'confidence': 0.88,
                'reasoning': f'Severe depression symptoms (PHQ-9: {phq9_score})'
            }
        
        # Anxiety classification
        if gad7_score >= 10:
            return {
                'category': 'anxiety',
                'severity': clinical_analysis['gad7_severity'],
                'confidence': 0.82,
                'reasoning': f'Moderate-severe anxiety (GAD-7: {gad7_score})'
            }
        
        # Mild-moderate cases
        if phq9_score >= 10 or gad7_score >= 5:
            if phq9_score > gad7_score:
                return {
                    'category': 'depression',
                    'severity': clinical_analysis['phq9_severity'],
                    'confidence': 0.75,
                    'reasoning': f'Mild-moderate depression (PHQ-9: {phq9_score})'
                }
            else:
                return {
                    'category': 'anxiety',
                    'severity': clinical_analysis['gad7_severity'],
                    'confidence': 0.75,
                    'reasoning': f'Mild-moderate anxiety (GAD-7: {gad7_score})'
                }
        
        # Text-based classification for cases with low clinical scores
        text_scores = {
            'anxiety': text_analysis['anxiety_score'],
            'depression': text_analysis['depression_score'],
            'trauma': text_analysis['trauma_score']
        }
        
        max_text_score = max(text_scores.values())
        if max_text_score > 0:
            dominant_category = max(text_scores, key=lambda k: text_scores[k])
            return {
                'category': dominant_category,
                'severity': 'mild',
                'confidence': 0.65,
                'reasoning': f'Text analysis suggests {dominant_category} concerns'
            }
        
        # Default to lifestyle coaching
        return {
            'category': 'lifestyle',
            'severity': 'minimal',
            'confidence': 0.80,
            'reasoning': 'Low clinical scores - wellness and lifestyle optimization focus'
        }
    
    def _generate_routing_decision(self, classification: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed routing decision based on classification."""
        category = classification['category']
        severity = classification['severity']
        
        routing_map = {
            'crisis': {
                'primary_agent': 'Crisis Intervention',
                'urgency_level': 'immediate',
                'requires_immediate_attention': True,
                'immediate_actions': [
                    'Contact crisis hotline immediately',
                    'Seek emergency mental health services',
                    'Contact trusted support person',
                    'Remove access to harmful means'
                ],
                'treatment_plan': {
                    'primary_therapy': 'Crisis Intervention',
                    'secondary_approaches': ['Safety Planning', 'Emergency Services'],
                    'duration': 'Immediate - 24 hours'
                },
                'crisis_resources': {
                    'crisis_text_line': 'Text HOME to 741741',
                    'suicide_prevention_lifeline': '988',
                    'emergency': '911'
                }
            },
            'trauma': {
                'primary_agent': 'Trauma Specialist',
                'urgency_level': 'within_week',
                'requires_immediate_attention': False,
                'immediate_actions': [
                    'Schedule appointment with trauma specialist',
                    'Begin grounding techniques',
                    'Create safety plan',
                    'Consider EMDR therapy'
                ],
                'treatment_plan': {
                    'primary_therapy': 'Trauma-Focused CBT',
                    'secondary_approaches': ['EMDR', 'Prolonged Exposure'],
                    'duration': '16-20 weeks'
                }
            },
            'depression': {
                'primary_agent': 'Depression Specialist',
                'urgency_level': 'within_week' if severity in ['moderate', 'severe'] else 'within_month',
                'requires_immediate_attention': False,
                'immediate_actions': [
                    'Schedule appointment with therapist',
                    'Begin mood tracking',
                    'Implement daily routine',
                    'Consider medication evaluation'
                ],
                'treatment_plan': {
                    'primary_therapy': 'Cognitive Behavioral Therapy',
                    'secondary_approaches': ['Interpersonal Therapy', 'Behavioral Activation'],
                    'duration': '12-16 weeks'
                }
            },
            'anxiety': {
                'primary_agent': 'Anxiety Specialist',
                'urgency_level': 'within_week' if severity in ['moderate', 'severe'] else 'within_month',
                'requires_immediate_attention': False,
                'immediate_actions': [
                    'Schedule appointment with anxiety specialist',
                    'Begin breathing exercises',
                    'Start anxiety tracking',
                    'Implement stress management'
                ],
                'treatment_plan': {
                    'primary_therapy': 'Cognitive Behavioral Therapy',
                    'secondary_approaches': ['Exposure Therapy', 'Mindfulness'],
                    'duration': '12-16 weeks'
                }
            },
            'lifestyle': {
                'primary_agent': 'Wellness Coach',
                'urgency_level': 'flexible',
                'requires_immediate_attention': False,
                'immediate_actions': [
                    'Schedule wellness consultation',
                    'Begin lifestyle assessment',
                    'Set wellness goals',
                    'Explore self-help resources'
                ],
                'treatment_plan': {
                    'primary_approach': 'Lifestyle Coaching',
                    'focus_areas': ['Stress Management', 'Work-Life Balance', 'Mindfulness'],
                    'duration': '8-12 weeks'
                }
            }
        }
        
        return routing_map.get(category, routing_map['lifestyle'])
    
    def _get_phq9_severity(self, score: int) -> str:
        """Get PHQ-9 severity level."""
        if score >= 20:
            return 'severe'
        elif score >= 15:
            return 'moderate'
        elif score >= 10:
            return 'mild'
        else:
            return 'minimal'
    
    def _get_gad7_severity(self, score: int) -> str:
        """Get GAD-7 severity level."""
        if score >= 15:
            return 'severe'
        elif score >= 10:
            return 'moderate'
        elif score >= 5:
            return 'mild'
        else:
            return 'minimal'
    
    def _get_pcl5_severity(self, score: int) -> str:
        """Get PCL-5 severity level."""
        if score >= 31:
            return 'severe'
        elif score >= 20:
            return 'moderate'
        elif score >= 10:
            return 'mild'
        else:
            return 'minimal' 