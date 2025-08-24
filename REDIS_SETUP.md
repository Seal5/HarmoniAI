# Redis Chat Storage Setup Guide

This guide will help you set up Redis for persistent chat storage in HarmoniAI.

## 🚀 Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop/

2. **Start Redis with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Verify Redis is running**
   ```bash
   docker ps
   ```

4. **Test Redis connection**
   Visit: http://localhost:8081 (Redis Commander Web UI)

### Option 2: Using Docker directly

```bash
# Start Redis container
docker run -d \
  --name harmoni-redis \
  -p 6379:6379 \
  -v harmoni-redis-data:/data \
  redis:7-alpine redis-server --appendonly yes

# Test connection
docker exec -it harmoni-redis redis-cli ping
```

## 💻 Local Installation (Alternative)

### Windows
1. Download Redis from: https://github.com/MicrosoftArchive/redis/releases
2. Extract and run `redis-server.exe`

### macOS
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## 🔧 Configuration

### Environment Variables (.env.local)
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Production Settings
For production, consider:
- Setting a password: `REDIS_PASSWORD=your-secure-password`
- Using Redis Cluster for high availability
- Setting up Redis backups
- Using Redis Cloud services (AWS ElastiCache, Redis Cloud, etc.)

## 📊 Features Provided

### Chat Storage
- ✅ **Persistent chat history** - Conversations survive browser refreshes
- ✅ **Cross-device access** - Access chats from any device (same user)
- ✅ **Automatic backups** - Redis persistence enabled
- ✅ **Fast retrieval** - In-memory performance with disk persistence
- ✅ **TTL support** - Conversations expire after 30 days (configurable)

### API Endpoints
- `GET /api/conversations` - Get all user conversations
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations` - Update existing conversation
- `GET /api/conversations/[id]` - Get specific conversation
- `DELETE /api/conversations/[id]` - Delete conversation
- `POST /api/conversations/[id]` - Add message to conversation
- `GET /api/health/redis` - Redis health check

### Data Structure
```javascript
{
  "id": "1754857522434",
  "title": "Anxiety & Worries",
  "date": "2025-08-10",
  "userId": "user_hash_12345",
  "lastUpdated": "2025-08-10T20:25:22.434Z",
  "messages": [
    {
      "id": "init",
      "role": "model",
      "content": "Hello! I'm Harmoni...",
      "timestamp": "2025-08-10T20:25:22.434Z"
    }
  ]
}
```

## 🔍 Monitoring & Debugging

### Redis CLI Commands
```bash
# Connect to Redis CLI
docker exec -it harmoni-redis redis-cli

# View all chat keys
KEYS chat:*

# Get conversation
GET chat:1754857522434

# View user's conversations
SMEMBERS user_chats:user_hash_12345

# Check Redis memory usage
INFO memory
```

### Health Check
Visit: http://localhost:3001/api/health/redis

### Web UI (Redis Commander)
Visit: http://localhost:8081

## 🛡️ Security Considerations

1. **Production Password**: Always set `REDIS_PASSWORD` in production
2. **Network Security**: Use VPN or private networks for Redis access
3. **Data Encryption**: Consider Redis Enterprise for encryption at rest
4. **Backup Strategy**: Implement regular Redis backups
5. **Access Control**: Use Redis ACLs for fine-grained permissions

## 🔧 Troubleshooting

### Common Issues

**Redis Connection Error**
```bash
# Check if Redis is running
docker ps | grep redis

# View Redis logs
docker logs harmoni-redis

# Test connection
redis-cli -h localhost -p 6379 ping
```

**Memory Issues**
```bash
# Check Redis memory usage
redis-cli INFO memory

# Set memory limit (example: 100MB)
redis-cli CONFIG SET maxmemory 100mb
```

**Performance Tuning**
- Enable Redis persistence: `--appendonly yes`
- Set appropriate memory limits
- Use Redis clustering for large datasets
- Monitor with Redis insights

## 📈 Scaling

For high-traffic applications:
1. **Redis Cluster** - Horizontal scaling
2. **Read Replicas** - Read scaling
3. **Redis Sentinel** - High availability
4. **Cloud Redis** - Managed services (AWS, Google Cloud, Azure)

## 🚀 Next Steps

1. Start Redis: `docker-compose up -d`
2. Run the app: `npm run dev`
3. Start chatting - conversations will be saved to Redis!
4. Monitor at: http://localhost:8081

Your HarmoniAI chatbot now has persistent, reliable chat storage! 🎉
