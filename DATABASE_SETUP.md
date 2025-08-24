# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for storing PHQ-9 (Patient Health Questionnaire) data in HarmoniAI.

## 🏥 About PHQ-9

The **PHQ-9** (Patient Health Questionnaire-9) is a validated depression screening tool used by healthcare professionals. It consists of 9 questions that assess depression severity based on DSM-IV criteria.

### Scoring:
- **0-4**: Minimal depression
- **5-9**: Mild depression  
- **10-14**: Moderate depression
- **15-19**: Moderately severe depression
- **20-27**: Severe depression

## 🚀 Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop/

2. **Start PostgreSQL with Docker Compose**
   ```bash
   docker-compose up -d postgres
   ```

3. **Verify PostgreSQL is running**
   ```bash
   docker ps | grep postgres
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Run Database Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Access pgAdmin (Web UI)**
   Visit: http://localhost:8080
   - Email: admin@harmoni.ai
   - Password: admin123

## 🔧 Database Configuration

### Environment Variables (.env.local)
```env
# PostgreSQL Configuration
DATABASE_URL="postgresql://harmoni:harmoni123@localhost:5432/harmonidb?schema=public"
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=harmonidb
POSTGRES_USER=harmoni
POSTGRES_PASSWORD=harmoni123
```

### Production Settings
For production, consider:
- Use strong passwords: `POSTGRES_PASSWORD=your-secure-password`
- Enable SSL: `?sslmode=require`
- Use connection pooling
- Set up regular backups
- Use managed services (AWS RDS, Google Cloud SQL, etc.)

## 🏗️ Database Schema

### Core Tables

#### **Users** (`users`)
- `id` - Unique user identifier (CUID)
- `email` - User email (optional, unique)
- `username` - Username (optional, unique)
- `createdAt`, `updatedAt` - Timestamps
- `isActive` - Account status

#### **User Profiles** (`user_profiles`)
- Personal information (name, DOB, gender)
- Emergency contact details
- Medical information (medications, allergies)
- Preferences (language, timezone)

#### **PHQ-9 Responses** (`phq9_responses`)
- All 9 question scores (0-3 each)
- `totalScore` - Sum of all questions (0-27)
- `severityLevel` - Depression severity category
- `riskLevel` - Risk assessment (LOW/MODERATE/HIGH/CRITICAL)
- `suicidalIdeation` - Boolean flag for question 9 > 0
- `functionalImpairment` - Difficulty level
- Metadata (notes, review status, timestamps)

#### **Conversations** (`conversations`)
- Chat conversation data
- Links to related PHQ-9 assessments
- Message history and metadata

## 📊 Database Features

### ✅ **PHQ-9 Questionnaire System**
- **Complete PHQ-9 implementation** with all 9 questions
- **Automatic scoring** and severity calculation
- **Risk assessment** with suicide ideation detection
- **Functional impairment** tracking
- **Professional review** system for high-risk cases

### ✅ **Advanced Analytics**
- **Longitudinal tracking** of depression scores over time
- **Risk trend analysis** and early warning system
- **Automated flagging** of high-risk responses
- **Comprehensive reporting** for healthcare providers

### ✅ **Security & Compliance**
- **Data isolation** per user
- **Audit trails** for all operations
- **Role-based access** (readonly, backup roles)
- **HIPAA-ready** architecture (with proper deployment)

## 🛠️ API Endpoints

### PHQ-9 Operations
- `POST /api/phq9` - Submit questionnaire response
- `GET /api/phq9` - Get user's responses
- `GET /api/phq9?latest=true` - Get latest response
- `GET /api/health/database` - Database health check

### Example PHQ-9 Submission
```javascript
const response = await fetch('/api/phq9', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question1Score: 2,    // Little interest or pleasure
    question2Score: 1,    // Feeling down or hopeless
    question3Score: 3,    // Sleep problems
    question4Score: 2,    // Feeling tired
    question5Score: 1,    // Poor appetite
    question6Score: 0,    // Feeling bad about yourself
    question7Score: 1,    // Trouble concentrating
    question8Score: 0,    // Moving slowly or restless
    question9Score: 0,    // Thoughts of death/self-harm
    functionalImpairment: 'SOMEWHAT_DIFFICULT',
    notes: 'Feeling stressed about work'
  })
});
```

### Response Format
```javascript
{
  "success": true,
  "phq9Response": {
    "id": "clm123...",
    "totalScore": 10,
    "severityLevel": "MODERATE",
    "riskLevel": "MODERATE",
    "suicidalIdeation": false,
    "functionalImpairment": "SOMEWHAT_DIFFICULT",
    "assessmentDate": "2025-08-10T20:15:30Z"
  },
  "interpretation": "Your responses suggest moderate depression symptoms.",
  "recommendations": [
    "We recommend speaking with a mental health professional",
    "Consider therapy or counseling",
    "Discuss your symptoms with your primary care doctor"
  ]
}
```

## 🔍 Monitoring & Management

### Health Checks
Visit: http://localhost:3001/api/health/database

### pgAdmin (Database UI)
Visit: http://localhost:8080
- Server: harmoni-postgres
- Database: harmonidb
- Username: harmoni
- Password: harmoni123

### CLI Access
```bash
# Connect to PostgreSQL
docker exec -it harmoni-postgres psql -U harmoni -d harmonidb

# View PHQ-9 responses
SELECT * FROM phq9_responses ORDER BY assessment_date DESC LIMIT 10;

# Check high-risk cases
SELECT * FROM phq9_responses WHERE risk_level IN ('HIGH', 'CRITICAL');

# Get user statistics
SELECT 
  severity_level,
  COUNT(*) as count,
  AVG(total_score) as avg_score
FROM phq9_responses 
GROUP BY severity_level;
```

## 📈 Advanced Features

### Risk Monitoring
- Automatic flagging of high-risk responses
- Real-time alerts for suicidal ideation
- Healthcare provider review system

### Longitudinal Analysis
```sql
-- Track depression scores over time
SELECT 
  assessment_date,
  total_score,
  severity_level
FROM phq9_responses 
WHERE user_id = 'user_id_here'
ORDER BY assessment_date DESC;
```

### Reporting
- Depression severity trends
- Risk level distribution
- Functional impairment analysis
- Intervention effectiveness

## 🛡️ Security Best Practices

1. **Database Security**
   - Use strong passwords in production
   - Enable SSL connections
   - Regular security updates
   - Network isolation

2. **Data Privacy**
   - Encrypt sensitive data
   - Regular backups
   - Access logging
   - Data retention policies

3. **Compliance**
   - HIPAA considerations for healthcare data
   - GDPR compliance for EU users
   - Regular security audits

## 🚨 Crisis Management

### Automatic Risk Detection
- Question 9 > 0: Flags suicidal ideation
- Total score ≥ 20: High risk
- Immediate professional referral recommendations

### Crisis Response Protocol
1. **CRITICAL Risk** - Immediate intervention needed
2. **HIGH Risk** - Professional consultation recommended
3. **MODERATE Risk** - Regular monitoring
4. **LOW Risk** - Self-care and prevention focus

## 🚀 Next Steps

1. **Start Database**: `docker-compose up -d postgres`
2. **Run Migrations**: `npx prisma migrate dev`
3. **Generate Client**: `npx prisma generate`
4. **Test Connection**: Visit http://localhost:3001/api/health/database
5. **Access Admin**: Visit http://localhost:8080

Your HarmoniAI system now has a comprehensive, HIPAA-ready database for mental health assessments! 🏥

## 🔗 Integration with Chat System

The database is designed to integrate seamlessly with your existing Redis chat system:
- Link PHQ-9 assessments to chat conversations
- Trigger assessments based on chat content analysis
- Provide personalized therapy recommendations
- Track progress through conversation sentiment analysis

This creates a complete mental health platform combining real-time chat support with validated clinical assessments.
