'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { formatPrice } from '@/lib/price';

type OrderSummary = {
  orderNumber: string;
  total: number;
  status: string;
  items: { title: string; price: number; quantity: number }[];
};

function Spinner() {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t border-b border-ink"></div>
    </div>
  );
}

// Create a separate component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('CheckoutPage');
  const locale = useLocale();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-subhead">{t('title')}</h1>
      <p className="mb-8">{t('processed')}</p>

      {loading ? (
        <Spinner />
      ) : (
        order && (
          <div className="max-w-md mx-auto mb-8 text-left border border-line p-6">
            <p className="text-menu text-ink/60 mb-1">{t('orderNumber')}</p>
            <p className="mb-4 break-all">{order.orderNumber}</p>

            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-t border-line">
                <span>{item.title}</span>
                <span>{formatPrice(item.price, locale)}</span>
              </div>
            ))}

            <div className="flex justify-between py-2 border-t border-line">
              <span>{t('total')}</span>
              <span>{formatPrice(order.total, locale)}</span>
            </div>
          </div>
        )
      )}

      <p className="mb-8">{t('emailed')}</p>

      <div className="mt-8">
        <Link
          href="/gallery"
          className="inline-block bg-ink text-white py-3 px-6 hover:opacity-80 transition-opacity"
        >
          {t('continue')}
        </Link>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function CheckoutSuccess() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <Spinner />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
