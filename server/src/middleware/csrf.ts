import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';

export interface CsrfTokenData {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateCsrfToken(userId: string): string {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const tokenData: CsrfTokenData = {
    token,
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_LIFETIME_MS,
  };
  
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

export function validateCsrfToken(token: string, userId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenData: CsrfTokenData = JSON.parse(decoded);
    
    if (tokenData.userId !== userId) {
      return false;
    }
    
    if (Date.now() > tokenData.expiresAt) {
      return false;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(`${tokenData.token}:${tokenData.userId}:${tokenData.createdAt}`)
      .digest('hex');
    
    const signature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(token)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = req.headers[CSRF_HEADER_NAME] as string;
  
  if (!token) {
    return res.status(403).json({ 
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  if (!validateCsrfToken(token, userId)) {
    return res.status(403).json({ 
      error: 'Invalid or expired CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  next();
}

export function getCsrfTokenForUser(userId: string): string {
  return generateCsrfToken(userId);
}
