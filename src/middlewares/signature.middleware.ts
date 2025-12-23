import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const usedNonces = new Map<string, number>(); // key: nonce, value: expiresAt

function cleanupExpiredNonces() {
  const now = Date.now();
  for (const [nonce, exp] of usedNonces.entries()) {
    if (exp <= now) usedNonces.delete(nonce);
  }
}

// Signature format (hex): HMAC_SHA256(secret, `${method}\n${path}\n${timestamp}\n${nonce}\n${body}`)
export function requireSignedRequests(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const tsHeader = req.header('x-timestamp');
      const nonce = req.header('x-nonce');
      const signature = req.header('x-signature');

      if (!tsHeader || !nonce || !signature) {
        return res.status(401).json({ error: 'Missing signature headers' });
      }

      const ts = Number(tsHeader);
      if (!Number.isFinite(ts)) {
        return res.status(401).json({ error: 'Invalid timestamp' });
      }

      const now = Date.now();
      if (Math.abs(now - ts) > WINDOW_MS) {
        return res.status(401).json({ error: 'Timestamp outside allowed window' });
      }

      // Replay protection
      cleanupExpiredNonces();
      if (usedNonces.has(nonce)) {
        return res.status(401).json({ error: 'Replay detected' });
      }

      const bodyStr = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : '';
      const payload = `${req.method.toUpperCase()}\n${req.path}\n${ts}\n${nonce}\n${bodyStr}`;
      const calc = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(calc, 'hex'), Buffer.from(signature, 'hex'))) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Mark nonce as used
      usedNonces.set(nonce, now + WINDOW_MS);
      next();
    } catch {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  };
}
