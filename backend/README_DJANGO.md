# HarmoniAI Routing Agent - Django Backend

A Django-based routing agent that classifies users and determines appropriate mental health care routing based on their initial conversation and clinical assessment scores.

## Features

- **User Classification**: Analyzes user messages and clinical scores to classify into categories (Anxiety, Depression, Trauma, Crisis, Lifestyle)
- **Clinical Assessment Integration**: Supports PHQ-9, GAD-7, and PCL-5 clinical scales
- **Crisis Detection**: Automatically detects crisis situations and provides immediate resources
- **RESTful API**: Full REST API for integration with frontend applications
- **Conversation Management**: Tracks conversation history and routing decisions
- **Postman Integration**: Ready for testing with Postman

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements-django.txt
```

### 2. Run Migrations

```bash
python manage.py migrate
```

### 3. Start the Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/routing/`

## API Endpoints

### Main Classification Endpoint

**POST** `/api/routing/classify/`

This is the primary endpoint called whenever a user starts a conversation.

**Request Body:**
```json
{
    "user_id": "user_123",
    "session_id": "session_456",
    "initial_message": "I've been feeling really anxious lately...",
    "clinical_scores": {
        "phq9": 15,
        "gad7": 12,
        "pcl5": 8,
        "phq9_1": 2,
        "phq9_2": 3,
        "phq9_3": 2,
        "phq9_4": 3,
        "phq9_5": 2,
        "phq9_6": 1,
        "phq9_7": 2,
        "phq9_8": 0,
        "phq9_9": 0,
        "gad7_1": 2,
        "gad7_2": 3,
        "gad7_3": 2,
        "gad7_4": 2,
        "gad7_5": 1,
        "gad7_6": 1,
        "gad7_7": 1,
        "pcl5_1": 1,
        "pcl5_2": 2,
        "pcl5_3": 1,
        "pcl5_4": 1,
        "pcl5_5": 1,
        "pcl5_6": 1,
        "pcl5_7": 0,
        "pcl5_8": 0
    }
}
```

**Response:**
```json
{
    "conversation_id": 1,
    "user_id": "user_123",
    "session_id": "session_456",
    "category": "anxiety",
    "severity": "moderate",
    "confidence": 0.82,
    "reasoning": "Moderate-severe anxiety (GAD-7: 12) - CBT and anxiety management",
    "primary_agent": "Anxiety Specialist",
    "urgency_level": "within_week",
    "requires_immediate_attention": false,
    "immediate_actions": [
        "Schedule appointment with anxiety specialist",
        "Begin breathing exercises",
        "Start anxiety tracking",
        "Implement stress management"
    ],
    "treatment_plan": {
        "primary_therapy": "Cognitive Behavioral Therapy",
        "secondary_approaches": ["Exposure Therapy", "Mindfulness"],
        "duration": "12-16 weeks"
    },
    "crisis_resources": null,
    "text_analysis": {
        "crisis_score": 0,
        "anxiety_score": 3,
        "depression_score": 1,
        "trauma_score": 0,
        "sentiment_score": -1,
        "text_length": 89,
        "has_crisis_keywords": false
    },
    "clinical_analysis": {
        "phq9_score": 15,
        "gad7_score": 12,
        "pcl5_score": 8,
        "phq9_severity": "moderate",
        "gad7_severity": "moderate",
        "pcl5_severity": "minimal",
        "crisis_indicator": 0,
        "has_crisis_risk": false
    }
}
```

### Additional Endpoints

- **GET** `/api/routing/health/` - Health check
- **GET** `/api/routing/conversations/{id}/` - Get conversation details
- **GET** `/api/routing/conversations/user/{user_id}/` - Get user's conversations
- **POST** `/api/routing/conversations/{id}/messages/` - Add message to conversation
- **GET** `/api/routing/conversations/{id}/routing/` - Get routing decision
- **POST** `/api/routing/conversations/{id}/clinical-scores/` - Update clinical scores

## Classification Categories

### 1. Crisis 🚨
- **Triggers**: Suicidal ideation, self-harm mentions, crisis keywords
- **Urgency**: Immediate
- **Primary Agent**: Crisis Intervention
- **Actions**: Emergency resources, immediate intervention

### 2. Trauma 🛡️
- **Triggers**: PCL-5 score ≥ 20, trauma-related keywords
- **Urgency**: Within week
- **Primary Agent**: Trauma Specialist
- **Actions**: Trauma-focused therapy, grounding techniques

### 3. Depression 💙
- **Triggers**: PHQ-9 score ≥ 15, depression keywords
- **Urgency**: Within week (severe) / within month (mild-moderate)
- **Primary Agent**: Depression Specialist
- **Actions**: CBT, medication evaluation, mood tracking

### 4. Anxiety 🧠
- **Triggers**: GAD-7 score ≥ 10, anxiety keywords
- **Urgency**: Within week (moderate-severe) / within month (mild)
- **Primary Agent**: Anxiety Specialist
- **Actions**: CBT, breathing exercises, anxiety tracking

### 5. Lifestyle ✨
- **Triggers**: Low clinical scores, wellness-focused messages
- **Urgency**: Flexible
- **Primary Agent**: Wellness Coach
- **Actions**: Lifestyle coaching, stress management, mindfulness

## Testing with Postman

### 1. Setup Postman Collection

Create a new collection in Postman with the following requests:

#### Health Check
- **Method**: GET
- **URL**: `http://localhost:8000/api/routing/health/`

#### Classify Conversation
- **Method**: POST
- **URL**: `http://localhost:8000/api/routing/classify/`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "user_id": "test_user_001",
    "session_id": "test_session_001",
    "initial_message": "I've been feeling really anxious lately. I can't stop worrying about work and my heart races when I think about upcoming presentations.",
    "clinical_scores": {
        "gad7": 15,
        "phq9": 8,
        "pcl5": 5
    }
}
```

### 2. Test Different Scenarios

#### Anxiety Case
```json
{
    "user_id": "anxiety_user",
    "session_id": "session_001",
    "initial_message": "I've been feeling really anxious lately. I can't stop worrying about work and my heart races when I think about upcoming presentations. I'm having trouble sleeping because my mind won't stop racing.",
    "clinical_scores": {
        "gad7": 15,
        "phq9": 8,
        "pcl5": 5
    }
}
```

#### Depression Case
```json
{
    "user_id": "depression_user",
    "session_id": "session_002",
    "initial_message": "I feel so sad and hopeless all the time. Nothing brings me joy anymore, not even things I used to love. I'm exhausted all the time and can barely get out of bed.",
    "clinical_scores": {
        "phq9": 18,
        "gad7": 6,
        "pcl5": 3
    }
}
```

#### Crisis Case
```json
{
    "user_id": "crisis_user",
    "session_id": "session_003",
    "initial_message": "I can't take it anymore. I've been thinking about ending my life. I feel like everyone would be better off without me. I have a plan and I don't see any reason to keep going.",
    "clinical_scores": {
        "phq9": 22,
        "gad7": 12,
        "pcl5": 8,
        "phq9_9": 3
    }
}
```

## Running Tests

```bash
python test_routing_agent.py
```

This will test all classification scenarios and demonstrate the routing agent functionality.

## Database Models

### UserConversation
- Stores conversation data and classification results
- Tracks clinical scores and routing decisions
- Maintains conversation history

### RoutingDecision
- Stores detailed routing decisions
- Contains treatment plans and immediate actions
- Handles crisis resources when needed

## Clinical Scales Supported

### PHQ-9 (Patient Health Questionnaire-9)
- **Range**: 0-27
- **Severity**: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-19 (moderately severe), 20-27 (severe)
- **Crisis Indicator**: Question 9 (suicidal ideation)

### GAD-7 (Generalized Anxiety Disorder-7)
- **Range**: 0-21
- **Severity**: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-21 (severe)

### PCL-5 (PTSD Checklist-5)
- **Range**: 0-32
- **Severity**: 0-9 (minimal), 10-19 (mild), 20-30 (moderate), 31-32 (severe)

## Security Considerations

- CORS is enabled for development (configure properly for production)
- All endpoints are currently open (add authentication for production)
- Input validation on all clinical scores
- Crisis detection with immediate resource provision

## Production Deployment

1. Set `DEBUG = False` in settings
2. Configure proper `ALLOWED_HOSTS`
3. Set up proper CORS settings
4. Add authentication and authorization
5. Use environment variables for sensitive data
6. Set up proper database (PostgreSQL recommended)
7. Configure static files and media handling

## Contributing

1. Follow Django best practices
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

This project is part of the HarmoniAI mental health platform. 