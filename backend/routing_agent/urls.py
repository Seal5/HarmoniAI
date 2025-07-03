from django.urls import path
from . import views

urlpatterns = [
    # Main classification endpoint - called when user starts conversation
    path('classify/', views.classify_conversation, name='classify_conversation'),
    
    # Conversation management
    path('conversations/<int:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('conversations/user/<str:user_id>/', views.get_user_conversations, name='get_user_conversations'),
    path('conversations/<int:conversation_id>/messages/', views.add_message, name='add_message'),
    
    # Routing decisions
    path('conversations/<int:conversation_id>/routing/', views.get_routing_decision, name='get_routing_decision'),
    path('conversations/<int:conversation_id>/clinical-scores/', views.update_clinical_scores, name='update_clinical_scores'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
] 