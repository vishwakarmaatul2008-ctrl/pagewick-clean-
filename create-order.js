// Netlify Functions equivalent of api/create-order.js — same logic, same
// diagnostics, different handler signature.
//
// This project's package.json has "type": "module", so every .js file here
// is loaded as an ES module by Node — including Netlify Functions. Must use
// `export const handler`, not the CommonJS `exports.handler`.

function redact(str, secret) {
  if (!str || !secret) return str
  return str.split(secret).join('[REDACTED]')
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    console.error('[create-order] wrong method:', event.httpMethod)
    return { statusCode: 405, body: JSON.stringify({ error: `Method not allowed: ${event.httpMethod}` }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch (err) {
    console.error('[create-order] invalid JSON body:', err.message, 'raw:', event.body)
    return { statusCode: 400, body: JSON.stringify({ error: `Invalid JSON body: ${err.message}` }) }
  }

  const { amount, currency = 'INR', receipt } = body

  if (!Number.isInteger(amount) || amount < 100) {
    console.error('[create-order] invalid amount:', amount)
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `amount must be an integer in paise, minimum 100 (got: ${JSON.stringify(amount)})`,
      }),
    }
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error('[create-order] missing env vars — keyId present:', !!keyId, 'keySecret present:', !!keySecret)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Razorpay credentials are not configured on the server (RAZORPAY_KEY_ID ${keyId ? 'present' : 'MISSING'}, RAZORPAY_KEY_SECRET ${keySecret ? 'present' : 'MISSING'})`,
      }),
    }
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ amount, currency, receipt }),
    })

    if (response.status === 401) {
      const details = redact(await response.text(), keySecret)
      console.error('[create-order] Razorpay auth failed:', details)
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Razorpay authentication failed — check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET on the server',
          details,
        }),
      }
    }

    if (!response.ok) {
      const details = redact(await response.text(), keySecret)
      console.error('[create-order] Razorpay API error:', response.status, details)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Razorpay order creation failed (HTTP ${response.status})`, details }),
      }
    }

    const order = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      }),
    }
  } catch (err) {
    const message = redact(err.message, keySecret)
    console.error('[create-order] unexpected error:', err.name, message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Unexpected server error creating order: ${err.name}: ${message}` }),
    }
  }
}
