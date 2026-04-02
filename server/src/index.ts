import app from './app.js';
import { config } from './config/index.js';
import { pool } from './config/database.js';

async function start() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Connected to NeonDB');
    client.release();
    
    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Frontend: ${config.frontend.url}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
