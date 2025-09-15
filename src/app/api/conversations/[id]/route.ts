import { NextRequest, NextResponse } from "next/server";
import { ChatStorage } from "@/lib/redis";

// Simple user ID generation for demo (in production, use proper auth)
function getUserId(req: NextRequest): string {
  const userAgent = req.headers.get('user-agent') || 'anonymous';
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  return Buffer.from(`${userAgent}-${ip}`).toString('base64').substring(0, 16);
}

// GET /api/conversations/[id] - Get specific conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const conversationId = params.id;
    
    console.log(`📖 Getting conversation ${conversationId} for user ${userId}`);
    
    const conversation = await ChatStorage.getConversation(userId, conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete specific conversation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const conversationId = params.id;
    
    console.log(`🗑️ Deleting conversation ${conversationId} for user ${userId}`);
    
    const deleted = await ChatStorage.deleteConversation(userId, conversationId);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete conversation or conversation not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id] - Add message to conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId(req);
    const conversationId = params.id;
    const body = await req.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message data is required' },
        { status: 400 }
      );
    }
    
    console.log(`💬 Adding message to conversation ${conversationId} for user ${userId}`);
    
    const added = await ChatStorage.addMessageToConversation(userId, conversationId, message);
    
    if (added) {
      return NextResponse.json({
        success: true,
        message: 'Message added successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to add message or conversation not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('❌ Error adding message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    );
  }
}
