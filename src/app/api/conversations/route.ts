import { NextRequest, NextResponse } from "next/server";
import { ChatStorage } from "@/lib/redis";

// Simple user ID generation for demo (in production, use proper auth)
function getUserId(req: NextRequest): string {
  // In production, extract from JWT token or session
  const userAgent = req.headers.get('user-agent') || 'anonymous';
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  
  // Create a simple hash-based user ID (for demo purposes)
  return Buffer.from(`${userAgent}-${ip}`).toString('base64').substring(0, 16);
}

// GET /api/conversations - Get all conversations for user
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log(`📚 Getting conversations for user ${userId}`);
    
    const conversations = await ChatStorage.getUserConversations(userId, limit);
    
    return NextResponse.json({
      success: true,
      conversations,
      userId, // For debugging
    });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const { conversation } = body;
    
    if (!conversation || !conversation.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation data' },
        { status: 400 }
      );
    }
    
    console.log(`💾 Creating conversation ${conversation.id} for user ${userId}`);
    
    const saved = await ChatStorage.saveConversation(userId, conversation);
    
    if (saved) {
      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        message: 'Conversation saved successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save conversation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations - Update existing conversation
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const { conversation } = body;
    
    if (!conversation || !conversation.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation data' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 Updating conversation ${conversation.id} for user ${userId}`);
    
    const saved = await ChatStorage.saveConversation(userId, conversation);
    
    if (saved) {
      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        message: 'Conversation updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update conversation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error updating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}
