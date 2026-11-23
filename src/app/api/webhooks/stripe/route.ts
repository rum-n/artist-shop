import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt';
import type Stripe from 'stripe';
import stripe from '@/lib/stripe';
import { db } from '@/lib/db';

/**
 * Buyers check out as guests, but `Order.customer` is a required relation, so
 * a user row has to exist. It gets an unguessable random password it is never
 * told, so the row can't be used to sign in.
 */
async function findOrCreateCustomer(email: string, name: string | null) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return existing;
  }

  return db.user.create({
    data: {
      email,
      name: name || '',
      password: await hash(randomBytes(32).toString('hex'), 10),
      role: 'customer',
    },
  });
}

/**
 * Pulls the delivery details out of a completed session. Stripe moved shipping
 * from `shipping_details` to `collected_information.shipping_details`, so both
 * shapes are read; whichever the pinned API version returns is used.
 */
function extractDelivery(session: Stripe.Checkout.Session) {
  type ShippingLike = {
    name?: string | null;
    phone?: string | null;
    address?: Stripe.Address | null;
  };

  const loose = session as unknown as {
    shipping_details?: ShippingLike | null;
    collected_information?: { shipping_details?: ShippingLike | null } | null;
  };

  const shipping =
    loose.collected_information?.shipping_details ??
    loose.shipping_details ??
    null;

  const address = shipping?.address ?? session.customer_details?.address ?? null;

  const courierOffice =
    session.custom_fields?.find((field) => field.key === 'courier_office')?.text
      ?.value || null;

  return {
    name: shipping?.name ?? session.customer_details?.name ?? null,
    phone: shipping?.phone ?? session.customer_details?.phone ?? null,
    email: session.customer_details?.email ?? null,
    courierOffice,
    address: address
      ? {
          line1: address.line1 ?? null,
          line2: address.line2 ?? null,
          city: address.city ?? null,
          state: address.state ?? null,
          postalCode: address.postal_code ?? null,
          country: address.country ?? null,
        }
      : null,
  };
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ message: 'Missing stripe signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ message: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const artworkId = session.metadata?.artworkId;

      if (!artworkId) {
        // Nothing to record, and retrying can't change that.
        console.error('Missing artworkId in session metadata', session.id);
        return NextResponse.json({ received: true });
      }

      /*
       * Stripe redelivers on any non-2xx, so every step below has to be safe
       * to repeat. The order is keyed on the session id, which lets a retry
       * recognise work that already landed and finish whatever didn't.
       */
      const existingOrder = await db.order.findUnique({
        where: { orderNumber: session.id },
      });

      if (existingOrder) {
        // A previous delivery may have created the order but failed before
        // marking the piece sold, so that update is reapplied here.
        await db.artwork.update({
          where: { id: artworkId },
          data: { inStock: false },
        });
        return NextResponse.json({ received: true });
      }

      const delivery = extractDelivery(session);

      // Guests always have an email on a completed session, but the order must
      // never be lost if one is somehow missing.
      const email = session.customer_details?.email;
      if (!email) {
        console.warn('Completed session without a customer email', session.id);
      }
      const customer = await findOrCreateCustomer(
        email || `guest-${session.id}@no-email.invalid`,
        delivery.name
      );

      // Fill in a name for a returning buyer who had none on file.
      if (!customer.name && delivery.name) {
        await db.user.update({
          where: { id: customer.id },
          data: { name: delivery.name },
        });
      }

      const total = (session.amount_total ?? 0) / 100;

      // The order is recorded before the artwork is delisted: if this throws,
      // the piece stays on sale and Stripe's retry tries again, rather than
      // the shop losing a painting with no record of who bought it.
      await db.order.create({
        data: {
          orderNumber: session.id,
          customer: { connect: { id: customer.id } },
          items: {
            create: {
              artwork: { connect: { id: artworkId } },
              price: total,
              quantity: 1,
            },
          },
          total,
          status: 'processing',
          // Everything needed to actually post the painting.
          shippingAddress: delivery,
          paymentIntent:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        },
      });

      await db.artwork.update({
        where: { id: artworkId },
        data: { inStock: false },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // A 500 tells Stripe to redeliver, which the idempotency above makes safe.
    console.error('Webhook handler failed:', error);
    return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
  }
}
