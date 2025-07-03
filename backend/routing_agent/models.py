from django.db import models
from django.contrib.auth.models import User
import json

class UserConversation(models.Model):
    """Model to store user conversations and routing decisions."""
    
    SEVERITY_CHOICES = [
        ('minimal', 'Minimal'),
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('crisis', 'Crisis'),
    ]
    
    CATEGORY_CHOICES = [
        ('anxiety', 'Anxiety'),
        ('depression', 'Depression'),
        ('trauma', 'Trauma'),
        ('lifestyle', 'Lifestyle Coaching'),
        ('crisis', 'Crisis'),
    ]
    
    # User identification
    user_id = models.CharField(max_length=100, unique=True)
    session_id = models.CharField(max_length=100)
    
    # Conversation data
    initial_message = models.TextField()
    conversation_history = models.JSONField(default=list)
    
    # Clinical assessment data
    clinical_scores = models.JSONField(default=dict)
    
    # Routing decision
    classified_category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    severity_level = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    confidence_score = models.FloatField(default=0.0)
    routing_reasoning = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Conversation {self.id} - {self.user_id} ({self.classified_category})"
    
    def add_message(self, message, is_user=True):
        """Add a message to the conversation history."""
        if not self.conversation_history:
            self.conversation_history = []
        
        self.conversation_history.append({
            'message': message,
            'is_user': is_user,
            'timestamp': models.DateTimeField(auto_now_add=True).value_from_object(self)
        })
        self.save()
    
    def update_clinical_scores(self, scores):
        """Update clinical assessment scores."""
        self.clinical_scores = scores
        self.save()
    
    def get_conversation_summary(self):
        """Get a summary of the conversation for routing analysis."""
        return {
            'user_id': self.user_id,
            'initial_message': self.initial_message,
            'message_count': len(self.conversation_history),
            'clinical_scores': self.clinical_scores,
            'current_category': self.classified_category,
            'severity_level': self.severity_level
        }

class RoutingDecision(models.Model):
    """Model to store detailed routing decisions and recommendations."""
    
    conversation = models.ForeignKey(UserConversation, on_delete=models.CASCADE, related_name='routing_decisions')
    
    # Decision details
    primary_agent = models.CharField(max_length=50)
    secondary_agents = models.JSONField(default=list)
    urgency_level = models.CharField(max_length=20)
    
    # Recommendations
    immediate_actions = models.JSONField(default=list)
    treatment_plan = models.JSONField(default=dict)
    self_help_tools = models.JSONField(default=list)
    
    # Crisis handling
    crisis_resources = models.JSONField(default=dict, null=True, blank=True)
    requires_immediate_attention = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Routing Decision for {self.conversation.user_id} - {self.primary_agent}"
