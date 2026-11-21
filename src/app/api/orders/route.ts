import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) {
      return denied;
    }

    const orders = await db.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            artwork: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Error fetching orders' },
      { status: 500 }
    );
  }
}