import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV } from './env';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: number, role: string): string {
  return jwt.sign(
    {
      userId,
      role,
    },
    ENV.jwtSecret || 'fallback-secret-key',
    {
      expiresIn: '7d',
    }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const decoded = jwt.verify(
      token,
      ENV.jwtSecret || 'fallback-secret-key'
    ) as { userId: number; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
