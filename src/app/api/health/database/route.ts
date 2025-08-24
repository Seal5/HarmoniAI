import { NextResponse } from "next/server";
import { PHQ9Service } from "@/lib/database";

export async function GET() {
  try {
    console.log('🔍 Checking database health...');
    
    const health = await PHQ9Service.getHealthStatus();
    
    if (health.connected) {
      return NextResponse.json({
        status: 'healthy',
        database: {
          connected: true,
          userCount: health.userCount,
          responseCount: health.responseCount,
          highRiskCount: health.highRiskCount,
          timestamp: health.timestamp,
        }
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        database: {
          connected: false,
          error: health.error,
          timestamp: health.timestamp,
        }
      }, { status: 503 });
    }
  } catch (error) {
    console.error('❌ Database health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
