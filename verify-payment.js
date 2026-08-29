// Netlify Functions equivalent of api/verify-payment.js — same HMAC
// signature verification, plus durable purchase persistence (Netlify
// Blobs) so lifetime access survives a cleared browser or a new device,
// not just localStorage. See restore-purchase.js for the read side.
//
// This project's package.json has "type": "module", so every .js file here
// is loaded as an ES module by Node — must use `import`/`export`, not the
// CommonJS `require`/`exports.handler`.

import crypto from 'crypto'
import { getStore } from '@netlify/blobs'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, storySlug } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keySecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Razorpay credentials are not configured on the server' }),
    }
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return { statusCode: 400, body: JSON.stringify({ verified: false, error: 'Signature mismatch' }) }
  }

  // Payment is genuinely verified at this point. Everything below is
  // secondary bookkeeping for cross-device restore — it must never be able
  // to turn a genuine payment into a failure response if it has trouble.
  let persisted = false
  if (storySlug) {
    try {
      const store = getStore('purchases')
      await store.setJSON(razorpay_payment_id, {
        storySlug,
        orderId: razorpay_order_id,
        purchasedAt: Date.now(),
      })
      persisted = true
    } catch (err) {
      console.error('[verify-payment] Netlify Blobs write failed:', err.message)
      // Deliberately not returned as an error — the payment is still real
      // and the buyer still gets access on this device via localStorage.
      // persisted stays false so this is visible in logs/response for
      // diagnosis without blocking the purchase.
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ verified: true, persisted }),
  }
}
