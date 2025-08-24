import { Redis } from 'ioredis';

// Redis client configuration with graceful fallback
let redis: Redis | null = null;
let redisAvailable = false;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3, // Limit retries to prevent infinite loops
    connectTimeout: 5000, // 5 second timeout
    lazyConnect: true, // Don't connect until first command
  });

  redis.on('connect', () => {
    console.log('🔴 Redis connected successfully');
    redisAvailable = true;
  });

  redis.on('error', (error) => {
    console.warn('⚠️ Redis connection error (falling back to localStorage):', error.message);
    redisAvailable = false;
  });

  redis.on('close', () => {
    console.log('🔴 Redis connection closed');
    redisAvailable = false;
  });

} catch (error) {
  console.warn('⚠️ Redis initialization failed (using localStorage only):', error);
  redis = null;
  redisAvailable = false;
}

export default redis;

// Chat storage helper functions
export class ChatStorage {
  private static readonly CHAT_PREFIX = 'chat:';
  private static readonly USER_CHATS_PREFIX = 'user_chats:';
  private static readonly CHAT_LIST_PREFIX = 'chat_list:';

  // Check if Redis is available
  private static async isRedisAvailable(): Promise<boolean> {
    if (!redis) return false;
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  // Store a complete conversation
  static async saveConversation(userId: string, conversation: any) {
    try {
      // Check if Redis is available
      if (!(await this.isRedisAvailable())) {
        console.log(`📝 Redis unavailable, skipping save for conversation ${conversation.id}`);
        return true; // Return true to not break the app flow
      }

      const key = `${this.CHAT_PREFIX}${conversation.id}`;
      
      // Store the conversation data
      await redis!.setex(key, 86400 * 30, JSON.stringify({
        ...conversation,
        userId,
        lastUpdated: new Date().toISOString()
      })); // 30 days TTL
      
      // Add to user's chat list
      const userChatsKey = `${this.USER_CHATS_PREFIX}${userId}`;
      await redis!.sadd(userChatsKey, conversation.id);
      await redis!.expire(userChatsKey, 86400 * 30); // 30 days TTL
      
      // Add to sorted set for ordering by last update
      const chatListKey = `${this.CHAT_LIST_PREFIX}${userId}`;
      await redis!.zadd(chatListKey, Date.now(), conversation.id);
      await redis!.expire(chatListKey, 86400 * 30); // 30 days TTL
      
      console.log(`💾 Saved conversation ${conversation.id} for user ${userId}`);
      return true;
    } catch (error) {
      console.warn('⚠️ Redis save failed, continuing without persistence:', error.message);
      return true; // Return true to not break the app flow
    }
  }

  // Get a specific conversation
  static async getConversation(userId: string, conversationId: string) {
    try {
      const key = `${this.CHAT_PREFIX}${conversationId}`;
      const data = await redis.get(key);
      
      if (!data) return null;
      
      const conversation = JSON.parse(data);
      
      // Verify the conversation belongs to the user
      if (conversation.userId !== userId) {
        console.warn(`⚠️ User ${userId} tried to access conversation ${conversationId} owned by ${conversation.userId}`);
        return null;
      }
      
      return conversation;
    } catch (error) {
      console.error('❌ Error getting conversation:', error);
      return null;
    }
  }

  // Get all conversations for a user
  static async getUserConversations(userId: string, limit: number = 50) {
    try {
      // Check if Redis is available
      if (!(await this.isRedisAvailable())) {
        console.log(`📝 Redis unavailable, returning empty conversations for user ${userId}`);
        return [];
      }

      const chatListKey = `${this.CHAT_LIST_PREFIX}${userId}`;
      
      // Get conversation IDs sorted by last update (newest first)
      const conversationIds = await redis!.zrevrange(chatListKey, 0, limit - 1);
      
      if (conversationIds.length === 0) return [];
      
      // Get all conversations
      const pipeline = redis!.pipeline();
      conversationIds.forEach(id => {
        pipeline.get(`${this.CHAT_PREFIX}${id}`);
      });
      
      const results = await pipeline.exec();
      
      const conversations = results
        ?.map(([error, data]) => {
          if (error || !data) return null;
          try {
            return JSON.parse(data as string);
          } catch {
            return null;
          }
        })
        .filter(Boolean) || [];
      
      console.log(`📚 Retrieved ${conversations.length} conversations for user ${userId}`);
      return conversations;
    } catch (error) {
      console.warn('⚠️ Redis get conversations failed, returning empty list:', error.message);
      return [];
    }
  }

  // Delete a conversation
  static async deleteConversation(userId: string, conversationId: string) {
    try {
      const key = `${this.CHAT_PREFIX}${conversationId}`;
      
      // Verify ownership before deletion
      const conversation = await this.getConversation(userId, conversationId);
      if (!conversation) return false;
      
      // Delete from Redis
      await redis.del(key);
      
      // Remove from user's chat lists
      const userChatsKey = `${this.USER_CHATS_PREFIX}${userId}`;
      const chatListKey = `${this.CHAT_LIST_PREFIX}${userId}`;
      
      await redis.srem(userChatsKey, conversationId);
      await redis.zrem(chatListKey, conversationId);
      
      console.log(`🗑️ Deleted conversation ${conversationId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      return false;
    }
  }

  // Add a message to existing conversation
  static async addMessageToConversation(userId: string, conversationId: string, message: any) {
    try {
      const conversation = await this.getConversation(userId, conversationId);
      if (!conversation) return false;
      
      // Add the message
      conversation.messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      
      // Update last modified time
      conversation.lastUpdated = new Date().toISOString();
      
      // Save back to Redis
      return await this.saveConversation(userId, conversation);
    } catch (error) {
      console.error('❌ Error adding message to conversation:', error);
      return false;
    }
  }

  // Get Redis health status
  static async getHealthStatus() {
    try {
      const pong = await redis.ping();
      const info = await redis.info('memory');
      
      return {
        connected: pong === 'PONG',
        memory: info,
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
