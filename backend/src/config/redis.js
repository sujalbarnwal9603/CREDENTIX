import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

redis.on("connect", () => {
  console.log("🔌 Redis connected")
})

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err)
})

export default redis
