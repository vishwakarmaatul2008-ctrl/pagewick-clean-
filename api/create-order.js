// Vercel Node.js API Route (converted from Netlify Functions format).
// Vercel auto-parses JSON request bodies into req.body.

function redact(str, secret) {
  if (!str || !secret) return str;
  return str.split(secret).join('[REDACTED]');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error('[create-order] wrong method:', req.method);
    res.status(405).json({ error: `Method not allowed: ${req.method}` });
    return;
  }

  const body = req.body || {};
  const { amount, currency = 'INR', receipt } = body;

  if (!Number.isInteger(amount) || amount < 100) {
    console.error('[create-order] invalid amount:', amount);
    res.status(400).json({
      error: `amount must be an integer in paise, minimum 100 (got: ${JSON.stringify(amount)})`,
    });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[create-order] missing env vars — keyId present:', !!keyId, 'keySecret present:', !!keySecret);
    res.status(500).json({
      error: `Razorpay credentials are not configured on the server (RAZORPAY_KEY_ID ${keyId ? 'present' : 'MISSING'})`,
    });
    return;
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ amount, currency, receipt }),
    });

    if (response.status === 401) {
      const details = redact(await response.text(), keySecret);
      console.error('[create-order] Razorpay auth failed:', details);
      res.status(401).json({
        error: 'Razorpay authentication failed — check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET on the server',
        details,
      });
      return;
    }

    if (!response.ok) {
      const details = redact(await response.text(), keySecret);
      console.error('[create-order] Razorpay API error:', response.status, details);
      res.status(500).json({
        error: `Razorpay order creation failed (HTTP ${response.status})`,
        details,
      });
      return;
    }

    const order = await response.json();

    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err) {
    const message = redact(err.message, keySecret);
    console.error('[create-order] unexpected error:', err.name, message);
    res.status(500).json({ error: `Unexpected server error creating order: ${message}` });
  }
                  }
