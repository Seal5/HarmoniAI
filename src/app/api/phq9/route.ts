import { NextRequest, NextResponse } from "next/server";
import { PHQ9Service } from "@/lib/database";

// Simple user ID generation (same as used in conversations)
function getUserId(req: NextRequest): string {
  const userAgent = req.headers.get('user-agent') || 'anonymous';
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  return Buffer.from(`${userAgent}-${ip}`).toString('base64').substring(0, 16);
}

// POST /api/phq9 - Submit PHQ-9 questionnaire response
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    
    console.log(`📝 Processing PHQ-9 submission for user ${userId}`);
    
    // Validate required fields
    const requiredFields = ['question1Score', 'question2Score', 'question3Score', 'question4Score', 'question5Score', 'question6Score', 'question7Score', 'question8Score', 'question9Score'];
    
    for (const field of requiredFields) {
      if (typeof body[field] !== 'number' || body[field] < 0 || body[field] > 3) {
        return NextResponse.json(
          { success: false, error: `Invalid ${field}: must be a number between 0-3` },
          { status: 400 }
        );
      }
    }

    // Validate functional impairment if provided
    if (body.functionalImpairment && !['NOT_DIFFICULT_AT_ALL', 'SOMEWHAT_DIFFICULT', 'VERY_DIFFICULT', 'EXTREMELY_DIFFICULT'].includes(body.functionalImpairment)) {
      return NextResponse.json(
        { success: false, error: 'Invalid functionalImpairment value' },
        { status: 400 }
      );
    }

    // Extract user profile data if provided
    const userProfile = body.userProfile ? {
      firstName: body.userProfile.firstName,
      lastName: body.userProfile.lastName,
      dateOfBirth: body.userProfile.dateOfBirth ? new Date(body.userProfile.dateOfBirth) : undefined,
      gender: body.userProfile.gender
    } : undefined;

    // Create or update user first
    const user = await PHQ9Service.createOrUpdateUser({
      email: body.email,
      username: body.username,
      profile: userProfile
    });

    // Create PHQ-9 response
    const phq9Response = await PHQ9Service.createPHQ9Response(user.id, {
      question1Score: body.question1Score,
      question2Score: body.question2Score,
      question3Score: body.question3Score,
      question4Score: body.question4Score,
      question5Score: body.question5Score,
      question6Score: body.question6Score,
      question7Score: body.question7Score,
      question8Score: body.question8Score,
      question9Score: body.question9Score,
      functionalImpairment: body.functionalImpairment,
      notes: body.notes
    });

    // Prepare response data
    const responseData = {
      success: true,
      phq9Response: {
        id: phq9Response.id,
        totalScore: phq9Response.totalScore,
        severityLevel: phq9Response.severityLevel,
        riskLevel: phq9Response.riskLevel,
        suicidalIdeation: phq9Response.suicidalIdeation,
        functionalImpairment: phq9Response.functionalImpairment,
        assessmentDate: phq9Response.assessmentDate,
        flaggedForReview: phq9Response.flaggedForReview
      },
      interpretation: getScoreInterpretation(phq9Response.totalScore!, phq9Response.severityLevel!, phq9Response.riskLevel!),
      recommendations: getRecommendations(phq9Response.severityLevel!, phq9Response.riskLevel!, phq9Response.suicidalIdeation)
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ Error processing PHQ-9 submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process PHQ-9 submission' },
      { status: 500 }
    );
  }
}

// GET /api/phq9 - Get user's PHQ-9 responses
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const latest = searchParams.get('latest') === 'true';
    
    console.log(`📊 Getting PHQ-9 responses for user ${userId}`);
    
    let responses;
    if (latest) {
      const latestResponse = await PHQ9Service.getLatestPHQ9Response(userId);
      responses = latestResponse ? [latestResponse] : [];
    } else {
      responses = await PHQ9Service.getUserPHQ9Responses(userId, limit);
    }
    
    return NextResponse.json({
      success: true,
      responses: responses.map(response => ({
        id: response.id,
        totalScore: response.totalScore,
        severityLevel: response.severityLevel,
        riskLevel: response.riskLevel,
        suicidalIdeation: response.suicidalIdeation,
        functionalImpairment: response.functionalImpairment,
        assessmentDate: response.assessmentDate,
        completedAt: response.completedAt,
        notes: response.notes
      })),
      count: responses.length
    });
  } catch (error) {
    console.error('❌ Error getting PHQ-9 responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get PHQ-9 responses' },
      { status: 500 }
    );
  }
}

// Helper function to provide score interpretation
function getScoreInterpretation(totalScore: number, severity: string, riskLevel: string): string {
  const severityDescriptions = {
    'MINIMAL': 'Your responses suggest minimal depression symptoms.',
    'MILD': 'Your responses suggest mild depression symptoms.',
    'MODERATE': 'Your responses suggest moderate depression symptoms.',
    'MODERATELY_SEVERE': 'Your responses suggest moderately severe depression symptoms.',
    'SEVERE': 'Your responses suggest severe depression symptoms.'
  };

  let interpretation = severityDescriptions[severity as keyof typeof severityDescriptions];
  
  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
    interpretation += ' We recommend speaking with a mental health professional as soon as possible.';
  }

  return interpretation;
}

// Helper function to provide recommendations
function getRecommendations(severity: string, riskLevel: string, suicidalIdeation: boolean): string[] {
  const recommendations: string[] = [];

  if (suicidalIdeation) {
    recommendations.push('🚨 If you are having thoughts of self-harm, please contact a crisis helpline immediately or go to your nearest emergency room.');
    recommendations.push('National Suicide Prevention Lifeline: 988 (US)');
  }

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendations.push('Seek immediate professional help from a mental health provider');
    recommendations.push('Consider contacting your primary care physician');
  }

  switch (severity) {
    case 'MINIMAL':
      recommendations.push('Continue maintaining your mental health with regular self-care');
      recommendations.push('Stay connected with friends and family');
      break;
    case 'MILD':
      recommendations.push('Consider talking to a counselor or therapist');
      recommendations.push('Practice stress management techniques');
      recommendations.push('Maintain regular exercise and sleep schedule');
      break;
    case 'MODERATE':
      recommendations.push('We recommend speaking with a mental health professional');
      recommendations.push('Consider therapy or counseling');
      recommendations.push('Discuss your symptoms with your primary care doctor');
      break;
    case 'MODERATELY_SEVERE':
    case 'SEVERE':
      recommendations.push('Seek professional mental health treatment immediately');
      recommendations.push('Consider both therapy and medication options');
      recommendations.push('Build a strong support system');
      break;
  }

  recommendations.push('Regular follow-up assessments can help track your progress');

  return recommendations;
}
