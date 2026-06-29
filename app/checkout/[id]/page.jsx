"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function Checkout({ params }) {
  const { id: serviceId } = params;
  const router = useRouter();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    transaction_id: '',
    client_notes: ''
  });
  const [error, setError] = useState('');

  // Dummy JazzCash Account Details
  const JAZZCASH_ACCOUNT_NAME = "GigVerse Manager";
  const JAZZCASH_ACCOUNT_NUMBER = "03001234567";

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${serviceId}`);
        if (!res.ok) throw new Error('Service not found');
        const data = await res.json();
        setService(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.transaction_id.trim()) {
      setError('Please enter the JazzCash Transaction ID');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          transaction_id: formData.transaction_id,
          client_notes: formData.client_notes
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to client dashboard
        router.push('/client/dashboard?order_placed=true');
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading...</div>;
  if (!service) return <div className="min-h-[60vh] flex items-center justify-center text-red-500 font-medium text-lg">Service not found</div>;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-secondary tracking-tight">Checkout</h1>
      
      <div className="flex flex-col gap-8">
        
        {/* Order Summary */}
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50">
          <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4 text-secondary">Order Summary</h3>
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="font-semibold text-secondary">{service.title}</span>
            <span className="font-black text-primary">${service.price}</span>
          </div>
          <div className="flex justify-between items-center text-gray-500 font-medium">
            <span>Delivery Time</span>
            <span>{service.delivery_time_days} Days</span>
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 text-xl font-black text-secondary">
            <span>Total to Pay</span>
            <span className="text-primary">${service.price}</span>
          </div>
        </div>
        
        {/* Payment Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
          <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500 fill-current" /> JazzCash Payment Instructions
          </h3>
          <p className="text-yellow-800 font-medium mb-6 leading-relaxed">
            Please transfer the total amount to the following JazzCash account. Once transferred, enter the Transaction ID (TID) below.
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100 mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">Account Title:</span>
              <span className="font-bold text-secondary text-lg">{JAZZCASH_ACCOUNT_NAME}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">Account Number:</span>
              <span className="font-black text-primary text-xl tracking-widest">{JAZZCASH_ACCOUNT_NUMBER}</span>
            </div>
          </div>
          <p className="text-sm font-bold text-yellow-700 bg-yellow-100/50 inline-block px-4 py-2 rounded-lg">
            * Note: Your order will start once our manager verifies the payment within 2-3 hours.
          </p>
        </div>
        
        {/* Payment Form */}
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50">
          <h3 className="text-xl font-bold mb-6 text-secondary">Confirm Payment</h3>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">JazzCash Transaction ID (TID) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.transaction_id}
                onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                placeholder="e.g., 1234567890"
                required
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-lg bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Order Requirements / Notes (Optional)</label>
              <textarea 
                value={formData.client_notes}
                onChange={(e) => setFormData({...formData, client_notes: e.target.value})}
                placeholder="Tell the freelancer what you need..."
                rows="4"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-y bg-gray-50 focus:bg-white"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-5 px-6 text-lg font-bold text-white bg-gradient-to-r from-primary to-primary-hover rounded-xl shadow-glow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? 'Submitting...' : 'Submit Payment Request'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
