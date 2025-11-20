import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productType } = req.body;

  const products = {
    'genz-roast': {
      name: '😭 Chaotic Gen-Z Roast',
      price: 299, // $2.99 in cents
      description: 'Get roasted in Gen-Z slang with chaotic energy!'
    },
    'gentle-roast': {
      name: '😌 Gentle Comedy Roast',
      price: 299, // $2.99 in cents
      description: 'Kind but comedic feedback on your resume'
    },
    'basic-analysis': {
      name: '🎭 Bias Filters + 7-Second Analysis',
      price: 199, // $1.99 in cents
      description: 'Unlock hiring manager perspectives and deeper scan analysis'
    },
    'full-analysis': {
      name: '💎 Full Analysis Unlock',
      price: 799, // $7.99 in cents
      description: 'All bias filters, persona modes, industries + resume rebuilding'
    }
  };

  const product = products[productType as keyof typeof products];
  if (!product) {
    return res.status(400).json({ error: 'Invalid product type' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?product=${productType}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      metadata: {
        productType,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
}
