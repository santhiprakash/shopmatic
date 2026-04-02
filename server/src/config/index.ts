import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  email: {
    apiKey: process.env.EMAILIT_API_KEY || '',
    fromEmail: process.env.EMAILIT_FROM_EMAIL || 'notifications@shopmatic.cc',
    fromName: process.env.EMAILIT_FROM_NAME || 'eComJunction',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:8080',
  },
  
  bcrypt: {
    rounds: 12,
  },
  
  emailTokens: {
    expiresIn: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  passwordReset: {
    expiresIn: 60 * 60 * 1000, // 1 hour
  },
};
