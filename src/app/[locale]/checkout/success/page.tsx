'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Create a separate component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/orders/session/${sessionId}`);
        const data = await response.json();
        setOrderDetails(data.order);
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
      <h1 className="text-3xl mb-4">Thank You for Your Purchase!</h1>
      <p className="text-xl mb-8">Your order has been successfully processed.</p>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        orderDetails && (
          <div className="mb-8">
            <p>Your order details have been sent to your email.</p>
          </div>
        )
      )}

      <div className="mt-8">
        <Link
          href="/gallery"
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-md"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl mb-4">Thank You for Your Purchase!</h1>
        <p className="text-xl mb-8">Loading your order details...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}