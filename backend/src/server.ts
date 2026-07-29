import { app } from './app.js';
import { env } from './config/env.js';
import { connectRedis } from './utils/redis.js';


async function startServer() {
  try {
    await connectRedis();
    console.log('✅ Connected to Redis');

    app.listen(env.PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
