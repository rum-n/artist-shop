import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { db } from '@/lib/db';

/*
 * Read by the checkout success page, which the buyer reaches as a guest — so
 * this cannot require a session. The Stripe session id acts as the capability:
 * it is unguessable and only the buyer who completed that payment has it. The
 * payment is confirmed with Stripe before anything is returned, and the
 * response carries no personal data the buyer did not already submit.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ message: 'Session id is required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const order = await db.order.findUnique({
      where: { orderNumber: sessionId },
      include: { items: { include: { artwork: true } } },
    });

    if (order) {
      return NextResponse.json({
        order: {
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            title: item.artwork.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      });
    }

    /*
     * The webhook that records the order can land a moment after the buyer is
     * redirected here, so fall back to what Stripe already knows rather than
     * showing them an error for a payment that succeeded.
     */
    const artworkId = session.metadata?.artworkId;
    const artwork = artworkId
      ? await db.artwork.findUnique({ where: { id: artworkId } })
      : null;

    return NextResponse.json({
      order: {
        orderNumber: session.id,
        total: (session.amount_total ?? 0) / 100,
        status: 'processing',
        createdAt: new Date(session.created * 1000),
        items: artwork
          ? [{ title: artwork.title, price: (session.amount_total ?? 0) / 100, quantity: 1 }]
          : [],
      },
    });
  } catch (error) {
    // An unknown session id throws here; that is a 404, not a server fault.
    console.error('Error fetching order for session:', error);
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }
}
