import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const denied = await requireAdmin();
    if (denied) {
      return denied;
    }

    const order = await db.order.findUnique({
      where: { id: (await params).orderId },
      include: {
        customer: true,
        items: {
          include: {
            artwork: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Error fetching order' },
      { status: 500 }
    );
  }
}