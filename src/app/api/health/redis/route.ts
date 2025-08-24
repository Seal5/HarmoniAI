import { NextResponse } from "next/server";
import { ChatStorage } from "@/lib/redis";

export async function GET() {
  try {
    console.log('🔍 Checking Redis health...');
    
    const health = await ChatStorage.getHealthStatus();
    
    if (health.connected) {
      return NextResponse.json({
        status: 'healthy',
        redis: {
          connected: true,
          timestamp: health.timestamp,
          memory_info: health.memory?.split('\r\n').filter(line => 
            line.includes('used_memory') || line.includes('used_memory_human')
          ),
        }
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        redis: {
          connected: false,
          error: health.error,
          timestamp: health.timestamp,
        }
      }, { status: 503 });
    }
  } catch (error) {
    console.error('❌ Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
