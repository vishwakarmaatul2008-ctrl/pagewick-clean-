// Vercel Node.js API Route (converted from Netlify Functions format).
// HMAC signature verification, plus purchase persistence via Upstash Redis
// (replaces @netlify/blobs, which has no Vercel equivalent).

import crypto from 'crypto';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, storySlug } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    res.status(500).json({ error: 'Razorpay credentials are not configured on the server' });
    return;
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400).json({ verified: false, error: 'Signature mismatch' });
    return;
  }

  // Payment is genuinely verified at this point. Everything below is
  // secondary bookkeeping for cross-device restore — it must never be able
  // to turn a genuine payment into a failure response if it has trouble.
  let persisted = false;
  if (storySlug) {
    try {
      await redis.set(`purchase:${razorpay_payment_id}`, {
        storySlug,
        orderId: razorpay_order_id,
        purchasedAt: Date.now(),
      });
      persisted = true;
    } catch (err) {
      console.error('[verify-payment] Upstash Redis write failed:', err.message);
      // Deliberately not returned as an error — the payment is still real
      // and the buyer still gets access on this device via localStorage.
      // persisted stays false so this is visible in logs/response for
      // diagnosis without blocking the purchase.
    }
  }

  res.status(200).json({ verified: true, persisted });
      }
