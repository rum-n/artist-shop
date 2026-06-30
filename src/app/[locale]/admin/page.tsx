import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminNavbar from '@/components/AdminNavbar';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl mb-4">Manage Artworks</h2>
            <p className="text-gray-600 mb-4">Add, edit, or remove artworks from your portfolio.</p>
            <Link
              href="/admin/artworks"
              className="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Manage Artworks
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl mb-4">Orders</h2>
            <p className="text-gray-600 mb-4">View and manage customer orders.</p>
            <Link
              href="/admin/orders"
              className="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              View Orders
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl mb-4">Site Settings</h2>
            <p className="text-gray-600 mb-4">Update homepage hero image and other site settings.</p>
            <Link
              href="/admin/settings"
              className="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Site Settings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}