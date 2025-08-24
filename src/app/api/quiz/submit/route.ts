import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Define the expected quiz data structure
interface QuizSubmission {
  answers: string[];
  userId?: string; // Optional if user is logged in
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: QuizSubmission = await request.json();
    
    // Validate the data
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Invalid data: answers array is required' },
        { status: 400 }
      );
    }

    // Validate that we have 10 answers (PHQ-9 has 9 questions + 1 difficulty question)
    if (body.answers.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid data: exactly 10 answers are required' },
        { status: 400 }
      );
    }

    // Calculate PHQ-9 score (first 9 questions)
    const phqAnswers = body.answers.slice(0, 9);
    const scoreMap: { [key: string]: number } = {
      'Not at all': 0,
      'Several days': 1,
      'More than half the days': 2,
      'Nearly every day': 3
    };

    let totalScore = 0;
    for (const answer of phqAnswers) {
      totalScore += scoreMap[answer] || 0;
    }

    // Prepare data for database insertion
    const timestamp = new Date().toISOString();
    const userId = body.userId || null;
    const difficultyAnswer = body.answers[9]; // Last question about difficulty

    // Insert into database
    // Note: Your teammate will need to create this table structure
    const insertQuery = `
      INSERT INTO quiz_responses (
        user_id, 
        answers, 
        phq9_score, 
        difficulty_level, 
        submitted_at
      ) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, submitted_at
    `;

    const values = [
      userId,
      JSON.stringify(body.answers), // Store answers as JSON
      totalScore,
      difficultyAnswer,
      timestamp
    ];

    const result = await query(insertQuery, values);
    
    // Return success response with the inserted record info
    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        phq9Score: totalScore,
        submittedAt: result.rows[0].submitted_at,
        message: 'Quiz response saved successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving quiz response:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('relation "quiz_responses" does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database table not ready. Please contact your team member to set up the database.',
            details: 'The quiz_responses table needs to be created.'
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error while saving quiz response' },
      { status: 500 }
    );
  }
}

// GET endpoint to test the API
export async function GET() {
  return NextResponse.json({
    message: 'Quiz submission API is ready',
    endpoint: 'POST /api/quiz/submit',
    expectedData: {
      answers: ['array of 10 strings'],
      userId: 'optional string',
    },
    tableSchema: {
      note: 'Your teammate needs to create this table:',
      sql: `
        CREATE TABLE quiz_responses (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255),
          answers JSONB NOT NULL,
          phq9_score INTEGER NOT NULL,
          difficulty_level VARCHAR(100),
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    }
  });
}
