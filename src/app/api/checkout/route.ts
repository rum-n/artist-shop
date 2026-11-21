import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import stripe from '@/lib/stripe';

/**
 * `description` is stored as a JSON string of { en, bg }. Handing that to
 * Stripe put raw JSON on the payment page, so it is parsed and reduced to a
 * single line of plain text here.
 */
function checkoutDescription(
  artwork: { description: string; medium: string; year: number },
  locale: string
) {
  let text = '';
  try {
    const parsed = JSON.parse(artwork.description);
    text = parsed?.[locale] || parsed?.en || '';
  } catch {
    text = artwork.description || '';
  }

  const fallback = `${artwork.medium}, ${artwork.year}`;
  const description = (text || fallback).replace(/\s+/g, ' ').trim();

  // Stripe rejects descriptions over 1000 characters.
  return description.length > 500
    ? `${description.slice(0, 497)}...`
    : description;
}

export async function POST(request: Request) {
  try {
    const { artworkId, locale } = await request.json();

    // Get the host from the request headers for URL construction
    const { headers } = request;
    const host = headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    // Fetch artwork details
    const artwork = await db.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      return NextResponse.json({ message: 'Artwork not found' }, { status: 404 });
    }

    if (!artwork.inStock) {
      return NextResponse.json({ message: 'Artwork is not available for purchase' }, { status: 400 });
    }

    // Create Stripe checkout session - omit images entirely for now
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: artwork.title,
              description: checkoutDescription(
                artwork,
                typeof locale === 'string' ? locale : 'en'
              ),
              // Omitting images to avoid URL issues
            },
            unit_amount: Math.round(artwork.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/artwork/${artwork.slug}`,
      metadata: {
        artworkId: artwork.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { message: 'Error creating checkout session', error: (error as Error).message },
      { status: 500 }
    );
  }
}