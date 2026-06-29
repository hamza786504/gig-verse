"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Eye } from 'lucide-react';

export default function ManagerActiveOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'manager')) {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchActiveOrders();
    }
  }, [status, session, router]);

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch('/api/manager/active-orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading active orders...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-secondary tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 md:w-10 md:h-10 text-primary" /> Active Orders
        </h1>
        <p className="text-gray-500 mt-2">Monitor all currently in-progress orders and inspect their communication.</p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-gray-50 overflow-hidden">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100">{error}</div>}
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 dashed">
            <p className="text-gray-500 text-lg font-medium">No active orders at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider font-bold">
                  <th className="px-6 py-4 border-b border-gray-100 rounded-tl-xl">Order ID</th>
                  <th className="px-6 py-4 border-b border-gray-100">Service</th>
                  <th className="px-6 py-4 border-b border-gray-100">Client</th>
                  <th className="px-6 py-4 border-b border-gray-100">Freelancer</th>
                  <th className="px-6 py-4 border-b border-gray-100">Started</th>
                  <th className="px-6 py-4 border-b border-gray-100 text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 text-sm text-gray-500 font-mono">...{order._id.slice(-6)}</td>
                    <td className="px-6 py-5 font-medium text-secondary">{order.serviceId?.title}</td>
                    <td className="px-6 py-5 text-gray-600">{order.clientId?.name}</td>
                    <td className="px-6 py-5 text-gray-600">{order.freelancerId?.name}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {order.timeline?.started_at ? new Date(order.timeline.started_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/order/${order._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-primary font-bold rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" /> Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
