"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserCog, Briefcase, Calendar, Search } from 'lucide-react';

export default function AdminStatsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({ clients: 0, freelancers: 0, managers: 0, activeOrders: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Fetch initial orders
      await fetchFilteredOrders();
      
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredOrders = async (e) => {
    if (e) e.preventDefault();
    setFetchingOrders(true);
    try {
      let url = '/api/admin/orders';
      if (fromDate || toDate) {
        const params = new URLSearchParams();
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch filtered orders', err);
    } finally {
      setFetchingOrders(false);
    }
  };

  if (loading || status === 'loading') return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading statistics...</div>;
  if (!session || session.user.role !== 'admin') return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-0 md:px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary tracking-tight">Platform Statistics</h1>
        <p className="text-gray-500 mt-1">Overview of GigVerse users and active orders.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Clients</p>
            <p className="text-3xl font-bold text-secondary">{stats.clients}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Freelancers</p>
            <p className="text-3xl font-bold text-secondary">{stats.freelancers}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <UserCog className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Managers</p>
            <p className="text-3xl font-bold text-secondary">{stats.managers}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Orders</p>
            <p className="text-3xl font-bold text-secondary">{stats.activeOrders}</p>
          </div>
        </div>
      </div>

      {/* Orders Filter Section */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-50 overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-secondary m-0 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-500" /> Order History
            </h2>
            <p className="text-sm text-gray-500 mt-1">Filter orders by creation date.</p>
          </div>
          
          <form onSubmit={fetchFilteredOrders} className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">From Date</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary min-w-[140px]"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">To Date</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary min-w-[140px]"
              />
            </div>
            <button 
              type="submit"
              disabled={fetchingOrders}
              className="w-full sm:w-auto px-6 py-2.5 bg-secondary hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {fetchingOrders ? '...' : 'GO'}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-gray-100">Order ID</th>
                <th className="px-6 py-4 border-b border-gray-100">Service</th>
                <th className="px-6 py-4 border-b border-gray-100">Client</th>
                <th className="px-6 py-4 border-b border-gray-100">Status</th>
                <th className="px-6 py-4 border-b border-gray-100">Amount</th>
                <th className="px-6 py-4 border-b border-gray-100 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">No orders found for the selected date range.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">...{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 font-medium text-secondary">{order.serviceId?.title || 'Unknown Service'}</td>
                    <td className="px-6 py-4 text-gray-500">{order.clientId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-secondary">${order.payment?.amount || 0}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(order.timeline.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
