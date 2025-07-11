const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST requests allowed')
  }

  try {
    const buffers = []
    for await (const chunk of req) {
      buffers.push(chunk)
    }
    const rawBody = Buffer.concat(buffers).toString()
    const { amount, message } = JSON.parse(rawBody)

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      metadata: { message: message || '' },
    })

    return res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    return res.status(500).json({ error: 'Stripe failed' })
  }
}
