"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Link as LinkIcon, MessageSquare } from 'lucide-react';

export default function OrderDetail({ params }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workUrl, setWorkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchOrderDetails();
      fetchMessages();
    }
  }, [status, session, router, id]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?orderId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages');
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    // Setup polling for messages if no pusher configured
    const interval = setInterval(() => {
      if (status === 'authenticated') {
        fetchMessages();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status, id]);

  const fetchOrderDetails = async () => {
    try {
      let endpoint = '';
      if (session.user.role === 'client') endpoint = '/api/client/orders';
      else if (session.user.role === 'freelancer') endpoint = '/api/freelancer/orders';
      else if (session.user.role === 'manager') endpoint = '/api/manager/active-orders';
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const currentOrder = data.find(o => o._id === id);
        if (currentOrder) {
          setOrder(currentOrder);
        } else {
          setError('Order not found');
        }
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistic UI update
    const tempMsg = {
      _id: Date.now().toString(),
      text: newMessage,
      senderId: { _id: session.user.id, name: session.user.name },
      createdAt: new Date().toISOString()
    };
    setMessages([...messages, tempMsg]);
    setNewMessage('');

    try {
      const receiverId = session.user.role === 'client' ? order.freelancerId._id : order.clientId._id;
      
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          orderId: id,
          text: tempMsg.text
        })
      });
      fetchMessages(); // Refresh to get exact DB object
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  const handleAction = async (action) => {
    if (action === 'submit_work' && !workUrl.trim()) {
      alert('Please provide a link to your work.');
      return;
    }

    setSubmitting(true);
    const endpoint = session.user.role === 'client' ? '/api/client/orders' : '/api/freelancer/orders';
    
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, action, workUrl })
      });
      
      if (res.ok) {
        alert('Success!');
        fetchOrderDetails(); // Refresh
      } else {
        const data = await res.json();
        alert(data.message || 'An error occurred');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === 'loading') return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading order details...</div>;
  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-red-500 font-medium text-lg">{error}</div>;
  if (!order) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-secondary tracking-tight">Order Details</h1>
      
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-soft border border-gray-50 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-gray-100 pb-8 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-secondary">{order.serviceId?.title}</h2>
            <p className="text-gray-400 font-mono text-sm">Order ID: {order._id}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-4xl font-black text-primary mb-3">${order.payment.amount}</div>
            <div className="inline-block px-4 py-1.5 bg-indigo-50 text-primary rounded-full font-bold text-xs uppercase tracking-wider">
              Status: {order.status.replace('_', ' ')}
            </div>
          </div>
        </div>
        
        {/* Order Meta Data (TID & Requirements) */}
        <div className="mb-10 space-y-6">
          {order.payment?.transaction_id && (
            <div>
              <h3 className="mb-3 text-lg font-bold text-secondary">JazzCash Transaction ID (TID)</h3>
              <div className="bg-indigo-50/50 p-4 rounded-xl text-primary font-mono font-bold border border-indigo-100 inline-block">
                {order.payment.transaction_id}
              </div>
            </div>
          )}

          {order.client_notes && (
            <div>
              <h3 className="mb-3 text-lg font-bold text-secondary">Order Requirements / Notes</h3>
              <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                {order.client_notes}
              </div>
            </div>
          )}
        </div>
        
        {/* Timeline */}
        <div className="mb-10">
          <h3 className="mb-4 text-lg font-bold text-secondary">Timeline</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-gray-600">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Ordered on: <span className="font-semibold text-secondary">{new Date(order.timeline.created_at).toLocaleString()}</span>
            </li>
            {order.timeline.started_at && (
              <li className="flex items-center gap-3 text-gray-600">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Started on: <span className="font-semibold text-secondary">{new Date(order.timeline.started_at).toLocaleString()}</span>
              </li>
            )}
            {order.timeline.submitted_at && (
              <li className="flex items-center gap-3 text-gray-600">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Work Submitted on: <span className="font-semibold text-secondary">{new Date(order.timeline.submitted_at).toLocaleString()}</span>
              </li>
            )}
          </ul>
        </div>
        
        {/* Work Submissions */}
        {order.work_attachments && order.work_attachments.length > 0 && (
          <div className="mb-10">
             <h3 className="mb-4 text-lg font-bold text-secondary">Delivered Work</h3>
             <ul className="space-y-3">
               {order.work_attachments.map((link, idx) => (
                 <li key={idx}>
                   <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors text-primary font-medium break-all">
                     <LinkIcon className="w-5 h-5 flex-shrink-0" /> {link}
                   </a>
                 </li>
               ))}
             </ul>
          </div>
        )}
        
        {/* Actions based on role and status */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          {session.user.role === 'freelancer' && order.status === 'in_progress' && (
            <div>
              <h3 className="mb-4 text-lg font-bold text-secondary">Submit Your Work</h3>
              <input 
                type="text" 
                placeholder="Paste link to your work (Google Drive, Dropbox, etc.)" 
                value={workUrl}
                onChange={(e) => setWorkUrl(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all mb-4 bg-gray-50 focus:bg-white"
              />
              <button 
                onClick={() => handleAction('submit_work')}
                disabled={submitting}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary-hover text-white font-bold rounded-xl shadow-glow hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Deliver Work'}
              </button>
            </div>
          )}
          
          {session.user.role === 'client' && order.status === 'submitted' && (
            <div>
              <h3 className="mb-4 text-lg font-bold text-secondary">Review Delivery</h3>
              <p className="text-gray-500 mb-6 font-medium">
                Please review the work submitted by the freelancer. If everything looks good, confirm the completion. Note: Orders are automatically completed 4 days after submission.
              </p>
              <button 
                onClick={() => handleAction('complete')}
                disabled={submitting}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Approve & Complete Order'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-50 overflow-hidden flex flex-col h-[600px]">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-secondary m-0">Order Messages</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-white">
          {chatLoading ? (
            <div className="text-center text-gray-400 font-medium m-auto">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 font-medium m-auto bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 dashed flex flex-col items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId?._id === session.user.id || msg.senderId === session.user.id;
              return (
                <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%] ${isMine ? 'self-end' : 'self-start'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isMine ? 'You' : msg.senderId?.name}</span>
                  </div>
                  <div className={`
                    px-5 py-3.5 
                    ${isMine 
                      ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl rounded-br-sm shadow-md' 
                      : 'bg-gray-100 text-secondary rounded-2xl rounded-bl-sm border border-gray-200'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {session.user.role !== 'manager' && (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-3 bg-white">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
            />
            <button type="submit" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-colors shadow-sm whitespace-nowrap">
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
