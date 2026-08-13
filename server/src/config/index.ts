import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  jwt: {
    secret: (() => {
      if (!process.env.JWT_SECRET) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET environment variable is required in production');
        }
        console.warn('WARNING: Using fallback JWT secret. Set JWT_SECRET in production!');
        return 'fallback-secret-do-not-use-in-production';
      }
      return process.env.JWT_SECRET;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  email: {
    apiKey: process.env.EMAILIT_API_KEY || '',
    fromEmail: process.env.EMAILIT_FROM_EMAIL || 'notifications@shopmatic.cc',
    fromName: process.env.EMAILIT_FROM_NAME || 'Shopmatic',
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
