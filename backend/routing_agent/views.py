from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import UserConversation, RoutingDecision
from .serializers import (
    ConversationRequestSerializer,
    ClassificationResponseSerializer,
    UserConversationSerializer,
    RoutingDecisionSerializer,
    MessageSerializer
)
from .routing_logic import RoutingAgent

@api_view(['POST'])
@permission_classes([AllowAny])
def classify_conversation(request):
    """
    Classify a user conversation and determine routing.
    
    This endpoint is called whenever a user starts a conversation.
    It analyzes the initial message and clinical scores to classify
    the user and determine appropriate care routing.
    """
    serializer = ConversationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    try:
        with transaction.atomic():
            # Create conversation record
            conversation = UserConversation.objects.create(
                user_id=data['user_id'],
                session_id=data['session_id'],
                initial_message=data['initial_message'],
                clinical_scores=data.get('clinical_scores', {})
            )
            
            # Initialize routing agent
            routing_agent = RoutingAgent()
            
            # Classify the user
            classification_result = routing_agent.classify_user({
                'initial_message': data['initial_message'],
                'clinical_scores': data.get('clinical_scores', {})
            })
            
            # Update conversation with classification results
            classification = classification_result['classification']
            conversation.classified_category = classification['category']
            conversation.severity_level = classification['severity']
            conversation.confidence_score = classification['confidence']
            conversation.routing_reasoning = classification['reasoning']
            conversation.save()
            
            # Create routing decision record
            routing_decision = RoutingDecision.objects.create(
                conversation=conversation,
                primary_agent=classification_result['routing_decision']['primary_agent'],
                secondary_agents=classification_result['routing_decision'].get('secondary_agents', []),
                urgency_level=classification_result['routing_decision']['urgency_level'],
                immediate_actions=classification_result['routing_decision']['immediate_actions'],
                treatment_plan=classification_result['routing_decision']['treatment_plan'],
                self_help_tools=classification_result['routing_decision'].get('self_help_tools', []),
                crisis_resources=classification_result['routing_decision'].get('crisis_resources'),
                requires_immediate_attention=classification_result['routing_decision']['requires_immediate_attention']
            )
            
            # Prepare response
            response_data = {
                'conversation_id': conversation.id,
                'user_id': conversation.user_id,
                'session_id': conversation.session_id,
                'category': classification['category'],
                'severity': classification['severity'],
                'confidence': classification['confidence'],
                'reasoning': classification['reasoning'],
                'primary_agent': routing_decision.primary_agent,
                'urgency_level': routing_decision.urgency_level,
                'requires_immediate_attention': routing_decision.requires_immediate_attention,
                'immediate_actions': routing_decision.immediate_actions,
                'treatment_plan': routing_decision.treatment_plan,
                'crisis_resources': routing_decision.crisis_resources,
                'text_analysis': classification_result['text_analysis'],
                'clinical_analysis': classification_result['clinical_analysis']
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response(
            {'error': f'Classification failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_conversation(request, conversation_id):
    """Get conversation details by ID."""
    conversation = get_object_or_404(UserConversation, id=conversation_id)
    serializer = UserConversationSerializer(conversation)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_conversations(request, user_id):
    """Get all conversations for a specific user."""
    conversations = UserConversation.objects.filter(user_id=user_id)
    serializer = UserConversationSerializer(conversations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_message(request, conversation_id):
    """Add a message to an existing conversation."""
    conversation = get_object_or_404(UserConversation, id=conversation_id)
    
    serializer = MessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    conversation.add_message(data['message'], data['is_user'])
    
    return Response({'message': 'Message added successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_routing_decision(request, conversation_id):
    """Get routing decision for a conversation."""
    conversation = get_object_or_404(UserConversation, id=conversation_id)
    routing_decisions = conversation.routing_decisions.all()
    
    if not routing_decisions.exists():
        return Response(
            {'error': 'No routing decision found for this conversation'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Return the most recent routing decision
    latest_decision = routing_decisions.first()
    serializer = RoutingDecisionSerializer(latest_decision)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def update_clinical_scores(request, conversation_id):
    """Update clinical scores for an existing conversation."""
    conversation = get_object_or_404(UserConversation, id=conversation_id)
    
    clinical_scores = request.data.get('clinical_scores', {})
    if not clinical_scores:
        return Response(
            {'error': 'Clinical scores are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    conversation.update_clinical_scores(clinical_scores)
    
    # Re-classify with updated scores
    routing_agent = RoutingAgent()
    classification_result = routing_agent.classify_user({
        'initial_message': conversation.initial_message,
        'clinical_scores': clinical_scores
    })
    
    # Update conversation with new classification
    classification = classification_result['classification']
    conversation.classified_category = classification['category']
    conversation.severity_level = classification['severity']
    conversation.confidence_score = classification['confidence']
    conversation.routing_reasoning = classification['reasoning']
    conversation.save()
    
    # Create new routing decision
    routing_decision = RoutingDecision.objects.create(
        conversation=conversation,
        primary_agent=classification_result['routing_decision']['primary_agent'],
        secondary_agents=classification_result['routing_decision'].get('secondary_agents', []),
        urgency_level=classification_result['routing_decision']['urgency_level'],
        immediate_actions=classification_result['routing_decision']['immediate_actions'],
        treatment_plan=classification_result['routing_decision']['treatment_plan'],
        self_help_tools=classification_result['routing_decision'].get('self_help_tools', []),
        crisis_resources=classification_result['routing_decision'].get('crisis_resources'),
        requires_immediate_attention=classification_result['routing_decision']['requires_immediate_attention']
    )
    
    return Response({
        'message': 'Clinical scores updated and re-classified',
        'new_classification': {
            'category': classification['category'],
            'severity': classification['severity'],
            'confidence': classification['confidence'],
            'reasoning': classification['reasoning']
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'healthy',
        'service': 'HarmoniAI Routing Agent',
        'version': '1.0.0'
    })
