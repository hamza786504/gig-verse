"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [canApprove, setCanApprove] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'manager')) {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchPendingOrders();
    }
  }, [status, session, router]);

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/manager/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      
      if (data.orders) {
        setOrders(data.orders);
        setCanApprove(data.canApprove);
      } else {
        // Fallback for legacy format or errors
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId, action) => {
    setActionLoading(orderId);
    try {
      const res = await fetch('/api/manager/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action })
      });
      
      if (res.ok) {
        // Remove order from list
        setOrders(orders.filter(o => o._id !== orderId));
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || status === 'loading') return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading manager portal...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-secondary tracking-tight">Manager Dashboard</h1>
      
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-soft border border-gray-50 overflow-hidden">
        <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-gray-100 text-secondary">Pending JazzCash Approvals</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100">{error}</div>}
        {!canApprove && !loading && !error && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl mb-6 font-medium border border-yellow-200 flex items-center gap-3">
            <span className="text-xl">⚠️</span> You do not have permission to approve transactions. Please contact the administrator to request access.
          </div>
        )}
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 dashed">
            <p className="text-gray-500 text-lg">No pending orders require approval at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b-2 border-gray-100 rounded-tl-xl">Order ID</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b-2 border-gray-100">Client</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b-2 border-gray-100">Service</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b-2 border-gray-100">Amount</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b-2 border-gray-100">Transaction ID (TID)</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b-2 border-gray-100">Date</th>
                  <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b-2 border-gray-100 rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 font-mono">...{order._id.slice(-6)}</td>
                    <td className="p-4 font-medium text-secondary">{order.clientId?.name}</td>
                    <td className="p-4 text-secondary">{order.serviceId?.title}</td>
                    <td className="p-4 font-bold text-secondary">${order.payment.amount}</td>
                    <td className="p-4 font-mono font-bold text-primary bg-primary/5 rounded-md my-2 inline-block px-3 py-1">{order.payment.transaction_id}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(order.timeline.created_at).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(order._id, 'approve')}
                          disabled={actionLoading === order._id || !canApprove}
                          className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-colors ${canApprove ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'} disabled:opacity-50`}
                          title={!canApprove ? "You don't have permission" : ""}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(order._id, 'reject')}
                          disabled={actionLoading === order._id || !canApprove}
                          className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-colors ${canApprove ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'} disabled:opacity-50`}
                          title={!canApprove ? "You don't have permission" : ""}
                        >
                          Reject
                        </button>
                      </div>
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
