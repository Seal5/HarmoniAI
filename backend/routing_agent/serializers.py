from rest_framework import serializers
from .models import UserConversation, RoutingDecision

class ClinicalScoresSerializer(serializers.Serializer):
    """Serializer for clinical assessment scores."""
    phq9 = serializers.IntegerField(min_value=0, max_value=27, required=False, default=0)
    gad7 = serializers.IntegerField(min_value=0, max_value=21, required=False, default=0)
    pcl5 = serializers.IntegerField(min_value=0, max_value=32, required=False, default=0)
    
    # Individual question scores for detailed analysis
    phq9_1 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_2 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_3 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_4 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_5 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_6 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_7 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_8 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    phq9_9 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    
    gad7_1 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    gad7_2 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    gad7_3 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    gad7_4 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    gad7_5 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    gad7_6 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    gad7_7 = serializers.IntegerField(min_value=0, max_value=3, required=False, default=0)
    
    pcl5_1 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)
    pcl5_2 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)
    pcl5_3 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)
    pcl5_4 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)
    pcl5_5 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)
    pcl5_6 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)
    pcl5_7 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)
    pcl5_8 = serializers.IntegerField(min_value=0, max_value=4, required=False, default=0)

class ConversationRequestSerializer(serializers.Serializer):
    """Serializer for conversation classification requests."""
    user_id = serializers.CharField(max_length=100)
    session_id = serializers.CharField(max_length=100)
    initial_message = serializers.CharField(max_length=2000)
    clinical_scores = ClinicalScoresSerializer(required=False, default=dict)

class ClassificationResponseSerializer(serializers.Serializer):
    """Serializer for classification response."""
    conversation_id = serializers.IntegerField()
    user_id = serializers.CharField()
    session_id = serializers.CharField()
    
    # Classification results
    category = serializers.CharField()
    severity = serializers.CharField()
    confidence = serializers.FloatField()
    reasoning = serializers.CharField()
    
    # Routing decision
    primary_agent = serializers.CharField()
    urgency_level = serializers.CharField()
    requires_immediate_attention = serializers.BooleanField()
    immediate_actions = serializers.ListField(child=serializers.CharField())
    treatment_plan = serializers.DictField()
    
    # Crisis resources (if applicable)
    crisis_resources = serializers.DictField(required=False, allow_null=True)
    
    # Analysis details
    text_analysis = serializers.DictField()
    clinical_analysis = serializers.DictField()

class UserConversationSerializer(serializers.ModelSerializer):
    """Serializer for UserConversation model."""
    class Meta:
        model = UserConversation
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class RoutingDecisionSerializer(serializers.ModelSerializer):
    """Serializer for RoutingDecision model."""
    class Meta:
        model = RoutingDecision
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class MessageSerializer(serializers.Serializer):
    """Serializer for adding messages to conversations."""
    message = serializers.CharField(max_length=2000)
    is_user = serializers.BooleanField(default=True) 