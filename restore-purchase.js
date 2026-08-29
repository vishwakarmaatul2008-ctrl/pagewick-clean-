// Looks up a purchase by its Razorpay Payment ID, written by
// verify-payment.js at the moment of a verified purchase. This is the
// cross-device/cross-browser restore mechanism: a buyer's Payment ID is
// unique, effectively non-guessable, and already durably available to them
// via Razorpay's own payment receipt (email/SMS) independent of anything
// Pagewick does — so it works even if the buyer never saved anything from
// Pagewick's own UI.
//
// Deliberately NOT email-based: an open "look up purchases by email"
// endpoint would let anyone who knows or guesses a buyer's email address
// gain reading access to content that buyer paid for. A Payment ID is not
// practically guessable, so looking one up doesn't have that problem.

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

  const { paymentId } = body

  if (!paymentId || typeof paymentId !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required field: paymentId' }) }
  }

  try {
    const store = getStore('purchases')
    const record = await store.get(paymentId, { type: 'json' })

    if (!record) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          found: false,
          error: 'No purchase found for that Payment ID. Double-check it against your Razorpay receipt.',
        }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        found: true,
        storySlug: record.storySlug,
        orderId: record.orderId,
        paymentId,
      }),
    }
  } catch (err) {
    console.error('[restore-purchase] Netlify Blobs read failed:', err.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not check purchase records right now. Please try again shortly.' }),
    }
  }
}
