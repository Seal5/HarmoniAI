import { NextRequest, NextResponse } from 'next/server';
import { PHQ9Service } from '@/lib/database';

// Simple user ID generation for session-based identification
function getUserId(req: NextRequest): string {
  const userAgent = req.headers.get('user-agent') || 'anonymous';
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  return Buffer.from(`${userAgent}-${ip}`).toString('base64').substring(0, 16);
}

// Define the expected quiz data structure
interface QuizSubmission {
  answers: string[];
  userId?: string;
  email?: string;
  username?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body: QuizSubmission = await request.json();
    
    console.log(`📝 Processing quiz submission for user ${userId}`);
    
    // Validate the data
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data: answers array is required' },
        { status: 400 }
      );
    }

    // Validate that we have 10 answers (PHQ-9 has 9 questions + 1 functional impairment question)
    if (body.answers.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid data: exactly 10 answers are required' },
        { status: 400 }
      );
    }

    // Map PHQ-9 answers to scores
    const scoreMap: { [key: string]: number } = {
      'Not at all': 0,
      'Several days': 1,
      'More than half the days': 2,
      'Nearly every day': 3
    };

    // Convert first 9 answers to scores
    const phqAnswers = body.answers.slice(0, 9);
    const scores = phqAnswers.map(answer => scoreMap[answer] ?? 0);
    
    // Map functional impairment (last question) to enum
    const functionalImpairmentMap: { [key: string]: string } = {
      'Not difficult at all': 'NOT_DIFFICULT_AT_ALL',
      'Somewhat difficult': 'SOMEWHAT_DIFFICULT', 
      'Very difficult': 'VERY_DIFFICULT',
      'Extremely difficult': 'EXTREMELY_DIFFICULT'
    };
    
    const functionalImpairment = functionalImpairmentMap[body.answers[9]] || 'NOT_DIFFICULT_AT_ALL';

    // Create or update user first
    const user = await PHQ9Service.createOrUpdateUser({
      email: body.email,
      username: body.username
    });

    // Create PHQ-9 response
    const phq9Response = await PHQ9Service.createPHQ9Response(user.id, {
      question1Score: scores[0],
      question2Score: scores[1], 
      question3Score: scores[2],
      question4Score: scores[3],
      question5Score: scores[4],
      question6Score: scores[5],
      question7Score: scores[6],
      question8Score: scores[7],
      question9Score: scores[8],
      functionalImpairment: functionalImpairment as any,
      notes: `Submitted via web quiz interface at ${new Date().toISOString()}`
    });

    // Prepare response
    const responseData = {
      success: true,
      data: {
        id: phq9Response.id,
        phq9Score: phq9Response.totalScore,
        severityLevel: phq9Response.severityLevel,
        riskLevel: phq9Response.riskLevel,
        suicidalIdeation: phq9Response.suicidalIdeation,
        submittedAt: phq9Response.assessmentDate,
        message: 'PHQ-9 questionnaire completed successfully'
      },
      interpretation: getScoreInterpretation(phq9Response.totalScore!, phq9Response.severityLevel!),
      recommendations: getRecommendations(phq9Response.severityLevel!, phq9Response.riskLevel!, phq9Response.suicidalIdeation)
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('❌ Error processing quiz submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process quiz submission' },
      { status: 500 }
    );
  }
}

// Helper function to provide score interpretation
function getScoreInterpretation(totalScore: number, severity: string): string {
  const severityDescriptions = {
    'MINIMAL': 'Your responses suggest minimal depression symptoms.',
    'MILD': 'Your responses suggest mild depression symptoms.',
    'MODERATE': 'Your responses suggest moderate depression symptoms.',
    'MODERATELY_SEVERE': 'Your responses suggest moderately severe depression symptoms.',
    'SEVERE': 'Your responses suggest severe depression symptoms.'
  };

  return severityDescriptions[severity as keyof typeof severityDescriptions] || 'Assessment complete.';
}

// Helper function to provide recommendations
function getRecommendations(severity: string, riskLevel: string, suicidalIdeation: boolean): string[] {
  const recommendations: string[] = [];

  if (suicidalIdeation) {
    recommendations.push('🚨 If you are having thoughts of self-harm, please contact a crisis helpline immediately.');
    recommendations.push('National Suicide Prevention Lifeline: 988 (US)');
  }

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendations.push('We recommend speaking with a mental health professional as soon as possible.');
  }

  switch (severity) {
    case 'MINIMAL':
      recommendations.push('Continue maintaining your mental health with regular self-care');
      break;
    case 'MILD':
      recommendations.push('Consider talking to a counselor if symptoms persist');
      break;
    case 'MODERATE':
    case 'MODERATELY_SEVERE':
    case 'SEVERE':
      recommendations.push('We recommend speaking with a mental health professional');
      break;
  }

  recommendations.push('Regular self-assessment can help track your mental health progress');
  return recommendations;
}

// GET endpoint to test the API
export async function GET() {
  return NextResponse.json({
    message: 'PHQ-9 Quiz submission API is ready',
    endpoint: 'POST /api/quiz/submit',
    expectedData: {
      answers: ['array of 10 strings (PHQ-9 + functional impairment)'],
      email: 'optional string',
      username: 'optional string'
    },
    note: 'This API now uses Prisma with PostgreSQL for proper PHQ-9 data storage'
  });
}
