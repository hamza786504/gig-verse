"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ServiceDetail({ params }) {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) {
          throw new Error('Service not found');
        }
        const data = await res.json();
        setService(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleOrder = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session.user.role !== 'client') {
      alert('Only clients can place orders.');
      return;
    }
    
    // Redirect to checkout/payment page
    router.push(`/checkout/${id}`);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading service details...</div>;
  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-red-500 font-medium text-lg">{error}</div>;
  if (!service) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Left Column: Details */}
        <div className="flex-1 w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-secondary tracking-tight leading-tight">{service.title}</h1>
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-soft">
              {service.freelancerId?.name?.charAt(0) || 'F'}
            </div>
            <div>
              <div className="font-bold text-secondary text-lg">{service.freelancerId?.name}</div>
              <div className="flex items-center text-yellow-500 text-sm mt-1">
                ★ <span className="text-gray-500 ml-1 font-medium">{service.rating > 0 ? service.rating.toFixed(1) : 'New seller'} <span className="text-gray-400">({service.reviews_count} reviews)</span></span>
              </div>
            </div>
          </div>
          
          <div className="mb-10 w-full h-[400px] md:h-[500px] bg-gray-100 rounded-3xl overflow-hidden shadow-soft border border-gray-100">
             {service.images && service.images.length > 0 ? (
                <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                  No Image Available
                </div>
              )}
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50 mb-10">
            <h3 className="text-2xl font-bold mb-6 text-secondary">About This Service</h3>
            <div 
              className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          </div>
          
          {service.skills_tags && service.skills_tags.length > 0 && (
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50">
              <h4 className="text-xl font-bold mb-5 text-secondary">Skills & Expertise</h4>
              <div className="flex gap-3 flex-wrap">
                {service.skills_tags.map(tag => (
                  <span key={tag} className="px-5 py-2.5 bg-indigo-50 text-primary rounded-full font-medium text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column: Order Box */}
        <div className="w-full lg:w-[400px] sticky top-24">
          <div className="border border-gray-100 rounded-3xl p-8 bg-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600"></div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-500">Price</span>
              <span className="text-4xl font-black text-secondary">${service.price}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600 mb-8 font-medium bg-gray-50 p-4 rounded-xl">
              <span className="text-xl">⏱</span> {service.delivery_time_days} Days Delivery
            </div>
            
            <button 
              onClick={handleOrder}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-hover text-white text-lg font-bold rounded-xl hover:shadow-glow transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2"
            >
              Continue (${service.price})
            </button>
            
            <p className="text-center mt-4 text-sm text-gray-400 font-medium">
              You won't be charged yet
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
