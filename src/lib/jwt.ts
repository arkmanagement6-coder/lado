import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lado_fallback_secret_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

// Helper to extract JWT from request cookies or authorization headers
export function getAuthUser(req: Request): TokenPayload | null {
  try {
    const authHeader = req.headers.get('Authorization');
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try cookie parsing
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, c) => {
          const [key, val] = c.trim().split('=');
          acc[key] = val;
          return acc;
        }, {} as Record<string, string>);
        token = cookies['lado_auth_token'];
      }
    }

    if (!token) return null;
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}
