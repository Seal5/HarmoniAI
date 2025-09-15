import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, save the client to the global variable to prevent hot reloading issues
if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;

// PHQ-9 specific database operations
export class PHQ9Service {
  // Calculate depression severity based on total score
  static calculateSeverity(totalScore: number): 'MINIMAL' | 'MILD' | 'MODERATE' | 'MODERATELY_SEVERE' | 'SEVERE' {
    if (totalScore <= 4) return 'MINIMAL';
    if (totalScore <= 9) return 'MILD';
    if (totalScore <= 14) return 'MODERATE';
    if (totalScore <= 19) return 'MODERATELY_SEVERE';
    return 'SEVERE';
  }

  // Calculate risk level based on responses
  static calculateRiskLevel(question9Score: number, totalScore: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    // Question 9 is about thoughts of death or self-harm
    if (question9Score >= 3) return 'CRITICAL';
    if (question9Score >= 2) return 'HIGH';
    if (question9Score >= 1) return 'MODERATE';
    if (totalScore >= 20) return 'HIGH';
    if (totalScore >= 15) return 'MODERATE';
    return 'LOW';
  }

  // Create or update user
  static async createOrUpdateUser(userData: {
    email?: string;
    username?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: Date;
      gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY' | 'OTHER';
    };
  }) {
    try {
      const user = await prisma.user.upsert({
        where: {
          email: userData.email || 'anonymous@example.com'
        },
        update: {
          updatedAt: new Date(),
          profile: userData.profile ? {
            upsert: {
              create: userData.profile,
              update: userData.profile
            }
          } : undefined
        },
        create: {
          email: userData.email,
          username: userData.username,
          profile: userData.profile ? {
            create: userData.profile
          } : undefined
        },
        include: {
          profile: true
        }
      });

      console.log(`✅ User created/updated: ${user.id}`);
      return user;
    } catch (error) {
      console.error('❌ Error creating/updating user:', error);
      throw error;
    }
  }

  // Create PHQ-9 response
  static async createPHQ9Response(userId: string, responses: {
    question1Score: number;
    question2Score: number;
    question3Score: number;
    question4Score: number;
    question5Score: number;
    question6Score: number;
    question7Score: number;
    question8Score: number;
    question9Score: number;
    functionalImpairment?: 'NOT_DIFFICULT_AT_ALL' | 'SOMEWHAT_DIFFICULT' | 'VERY_DIFFICULT' | 'EXTREMELY_DIFFICULT';
    notes?: string;
  }) {
    try {
      // Calculate total score
      const totalScore = Object.values(responses)
        .filter(value => typeof value === 'number')
        .reduce((sum, score) => sum + score, 0);

      // Calculate severity and risk levels
      const severityLevel = this.calculateSeverity(totalScore);
      const riskLevel = this.calculateRiskLevel(responses.question9Score, totalScore);
      const suicidalIdeation = responses.question9Score > 0;

      const phq9Response = await prisma.pHQ9Response.create({
        data: {
          userId,
          ...responses,
          totalScore,
          severityLevel,
          riskLevel,
          suicidalIdeation,
          isCompleted: true,
          completedAt: new Date(),
          flaggedForReview: riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
        },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      });

      console.log(`✅ PHQ-9 response created: ${phq9Response.id}, Total Score: ${totalScore}, Severity: ${severityLevel}, Risk: ${riskLevel}`);
      
      // Log high-risk cases
      if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
        console.warn(`⚠️ HIGH RISK PHQ-9 Response: User ${userId}, Score: ${totalScore}, Risk: ${riskLevel}`);
      }

      return phq9Response;
    } catch (error) {
      console.error('❌ Error creating PHQ-9 response:', error);
      throw error;
    }
  }

  // Get user's PHQ-9 responses
  static async getUserPHQ9Responses(userId: string, limit: number = 10) {
    try {
      const responses = await prisma.pHQ9Response.findMany({
        where: { userId },
        orderBy: { assessmentDate: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          }
        }
      });

      console.log(`📊 Retrieved ${responses.length} PHQ-9 responses for user ${userId}`);
      return responses;
    } catch (error) {
      console.error('❌ Error getting PHQ-9 responses:', error);
      throw error;
    }
  }

  // Get latest PHQ-9 response for user
  static async getLatestPHQ9Response(userId: string) {
    try {
      const response = await prisma.pHQ9Response.findFirst({
        where: { userId },
        orderBy: { assessmentDate: 'desc' },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      });

      if (response) {
        console.log(`📊 Latest PHQ-9 response for user ${userId}: Score ${response.totalScore}, Severity ${response.severityLevel}`);
      } else {
        console.log(`📊 No PHQ-9 responses found for user ${userId}`);
      }

      return response;
    } catch (error) {
      console.error('❌ Error getting latest PHQ-9 response:', error);
      throw error;
    }
  }

  // Get high-risk responses (for monitoring)
  static async getHighRiskResponses(limit: number = 50) {
    try {
      const responses = await prisma.pHQ9Response.findMany({
        where: {
          OR: [
            { riskLevel: 'HIGH' },
            { riskLevel: 'CRITICAL' },
            { suicidalIdeation: true }
          ]
        },
        orderBy: { assessmentDate: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      console.log(`🚨 Retrieved ${responses.length} high-risk PHQ-9 responses`);
      return responses;
    } catch (error) {
      console.error('❌ Error getting high-risk responses:', error);
      throw error;
    }
  }

  // Update response with review
  static async reviewPHQ9Response(responseId: string, reviewData: {
    reviewNotes: string;
    reviewedBy: string;
  }) {
    try {
      const response = await prisma.pHQ9Response.update({
        where: { id: responseId },
        data: {
          ...reviewData,
          reviewedAt: new Date(),
          flaggedForReview: false
        }
      });

      console.log(`✅ PHQ-9 response reviewed: ${responseId}`);
      return response;
    } catch (error) {
      console.error('❌ Error reviewing PHQ-9 response:', error);
      throw error;
    }
  }

  // Get database health status
  static async getHealthStatus() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      
      const userCount = await prisma.user.count();
      const responseCount = await prisma.pHQ9Response.count();
      const highRiskCount = await prisma.pHQ9Response.count({
        where: {
          OR: [
            { riskLevel: 'HIGH' },
            { riskLevel: 'CRITICAL' }
          ]
        }
      });

      return {
        connected: true,
        userCount,
        responseCount,
        highRiskCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
