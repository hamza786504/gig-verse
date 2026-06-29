"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FreelancerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/freelancer/login');
    } else if (session && session.user.role !== 'freelancer') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/freelancer/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending_approval: { bg: 'bg-yellow-100', color: 'text-yellow-800', text: 'Waiting for Manager' },
      in_progress: { bg: 'bg-blue-100', color: 'text-blue-800', text: 'Active' },
      submitted: { bg: 'bg-green-100', color: 'text-green-800', text: 'Delivered' },
      completed: { bg: 'bg-gray-200', color: 'text-gray-800', text: 'Completed' },
      disputed: { bg: 'bg-red-100', color: 'text-red-800', text: 'Disputed' }
    };
    
    const style = styles[status] || { bg: 'bg-gray-200', color: 'text-gray-800', text: status };
    
    return (
      <span className={`${style.bg} ${style.color} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
        {style.text}
      </span>
    );
  };

  if (loading || status === 'loading') return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading dashboard...</div>;

  const activeOrders = orders.filter(o => o.status === 'in_progress');
  const earnings = orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.payment.amount, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-4xl font-bold text-secondary tracking-tight">Freelancer Dashboard</h1>
        <Link href="/service/create" className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white font-bold rounded-xl shadow-glow hover:shadow-lg transition-all transform hover:-translate-y-0.5">
          Create New Service
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50 flex flex-col justify-center">
          <h3 className="text-gray-500 font-medium mb-2 uppercase tracking-wider text-sm">Active Orders</h3>
          <div className="text-5xl font-black text-primary">{activeOrders.length}</div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50 flex flex-col justify-center">
          <h3 className="text-gray-500 font-medium mb-2 uppercase tracking-wider text-sm">Total Earnings</h3>
          <div className="text-5xl font-black text-green-500">${earnings}</div>
        </div>
      </div>
      
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-soft border border-gray-50">
        <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-gray-100 text-secondary">My Tasks & Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 dashed">
            <p className="text-gray-500 text-lg">You don't have any orders yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map(order => (
              <div key={order._id} className="border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow bg-gray-50/50 hover:bg-white group">
                <div>
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <h3 className="text-xl font-bold text-secondary m-0 group-hover:text-primary transition-colors">{order.serviceId?.title}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    Client: <span className="font-semibold text-secondary">{order.clientId?.name}</span>
                  </p>
                  
                  {order.status === 'in_progress' && order.timeline.deadline && (
                     <p className="text-red-500 text-sm font-medium bg-red-50 inline-block px-3 py-1 rounded-md mt-1">
                       Deadline: <span className="font-bold">{new Date(order.timeline.deadline).toLocaleDateString()}</span>
                     </p>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                  <div className="text-3xl font-black text-secondary">${order.payment.amount}</div>
                  
                  {order.status === 'in_progress' ? (
                    <Link href={`/order/${order._id}`} className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                      Deliver Work
                    </Link>
                  ) : (
                    <Link href={`/order/${order._id}`} className="px-5 py-2.5 bg-white text-secondary border border-gray-200 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
