// Looks up a purchase by its Razorpay Payment ID, written by verify-payment.js
// at the moment of a verified purchase, via Upstash Redis.
//
// Deliberately NOT email-based: an open "look up purchases by email" endpoint
// would let anyone who knows or guesses a buyer's email address gain reading
// access to content that buyer paid for. A Payment ID is not practically
// guessable, so looking one up doesn't have that problem.

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const { paymentId } = body;

  if (!paymentId || typeof paymentId !== 'string') {
    res.status(400).json({ error: 'Missing required field: paymentId' });
    return;
  }

  try {
    const record = await redis.get(`purchase:${paymentId}`);

    if (!record) {
      res.status(404).json({
        found: false,
        error: 'No purchase found for that Payment ID. Double-check it against your Razorpay receipt.',
      });
      return;
    }

    res.status(200).json({
      found: true,
      storySlug: record.storySlug,
      orderId: record.orderId,
      paymentId,
    });
  } catch (err) {
    console.error('[restore-purchase] Upstash Redis read failed:', err.message);
    res.status(500).json({ error: 'Could not check purchase records right now. Please try again shortly.' });
  }
                  }
