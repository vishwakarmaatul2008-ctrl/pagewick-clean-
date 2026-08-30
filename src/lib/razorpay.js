// Frontend side of Razorpay Standard Checkout. This file never touches
// KEY_SECRET, and does not bake the key_id into the build either — it gets
// key_id at runtime from /api/create-order's response, so no Razorpay value
// ever ends up as literal text in the built frontend bundle. Netlify's
// secret scanner flags exactly that (a configured secret's value appearing
// in build output), which is what a VITE_-prefixed env var would trigger
// since Vite inlines those at build time.

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// TEMPORARY DIAGNOSTICS: reads the raw response body first (works even if
// it isn't valid JSON — e.g. an HTML error page from misrouting), logs the
// full status+body to the console, and throws an error message that
// includes the real HTTP status and response content instead of a generic
// fallback. Remove this verbosity once the real failure is identified.
async function createOrder(amountInPaise, receipt) {
  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountInPaise, currency: 'INR', receipt }),
  })

  const rawText = await res.text()
  let data = {}
  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch {
    // Response wasn't JSON — rawText is kept below for diagnostics instead
    // of being silently discarded.
  }

  console.error('[pagewick:create-order] response', {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get('content-type'),
    parsedJson: data,
    rawBody: rawText.slice(0, 500),
  })

  if (!res.ok) {
    const detail = data.error || data.details || rawText.slice(0, 300) || '(empty response body)'
    throw new Error(`create-order failed — HTTP ${res.status}: ${detail}`)
  }

  if (!data.order_id || !data.key_id) {
    throw new Error(
      `create-order returned HTTP ${res.status} but an unexpected body: ${rawText.slice(0, 300) || '(empty)'}`
    )
  }

  return data
}

async function verifyPayment(payload) {
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.verified) {
    throw new Error(data.error || 'Payment could not be verified.')
  }
  return data
}

// Cross-device/cross-browser restore: looks up a purchase by its Razorpay
// Payment ID (shown to the buyer right after a successful unlock, and also
// present in Razorpay's own payment receipt independent of Pagewick).
export async function restorePurchase(paymentId) {
  const res = await fetch('/api/restore-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.found) {
    throw new Error(data.error || 'No purchase found for that Payment ID.')
  }
  return data
}

// story: { slug, title, priceInPaise }
// onSuccess(razorpayResponse), onError(message), onCancel()
export async function openUnlockCheckout({ story, onSuccess, onError, onCancel }) {
  const scriptReady = await loadRazorpayScript()
  if (!scriptReady || !window.Razorpay) {
    onError('Could not load Razorpay checkout. Check your connection and try again.')
    return
  }

  let order
  try {
    order = await createOrder(story.priceInPaise, `pagewick_${story.slug}_${Date.now()}`)
  } catch (err) {
    onError(err.message)
    return
  }

  const rzp = new window.Razorpay({
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    order_id: order.order_id,
    name: 'Pagewick',
    description: `Unlock — ${story.title}`,
    theme: { color: '#d9a54b' },
    handler: async (response) => {
      try {
        await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          storySlug: story.slug,
        })
        onSuccess(response)
      } catch (err) {
        onError(err.message)
      }
    },
    modal: {
      ondismiss: () => {
        if (onCancel) onCancel()
      },
    },
  })

  rzp.on('payment.failed', (resp) => {
    onError(resp?.error?.description || 'Payment failed. Please try again.')
  })

  rzp.open()
}
