"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';

export default function CreateService() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    delivery_time_days: '',
    skills_tags: '',
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'freelancer')) {
      router.push('/');
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (content) => {
    setFormData({ ...formData, description: content });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || formData.description.trim() === '') {
      setError('Description is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert comma-separated string to array
      const tagsArray = formData.skills_tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      const imagesArray = formData.imageUrl ? [formData.imageUrl] : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        delivery_time_days: Number(formData.delivery_time_days),
        skills_tags: tagsArray,
        images: imagesArray
      };

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/service/${data._id}`); // Redirect to the newly created service page
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create service');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading...</div>;

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary tracking-tight">Create a New Service</h1>
          <p className="text-gray-500 text-lg md:text-xl">Detail your expertise and set your price to attract clients.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-10 items-start">
          
          {/* Form Side */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-soft border border-gray-100">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-medium border border-red-100">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Title Section */}
              <div className="pb-8 border-b border-gray-100">
                <label className="block mb-2 text-xl font-bold text-secondary">Service Title <span className="text-red-500">*</span></label>
                <p className="text-gray-500 mb-4 text-sm font-medium">Give your service a catchy title that explains exactly what you will do.</p>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="I will design a modern web app for you"
                  required
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 text-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              {/* Description Section */}
              <div className="pb-8 border-b border-gray-100">
                <label className="block mb-2 text-xl font-bold text-secondary">Service Description <span className="text-red-500">*</span></label>
                <p className="text-gray-500 mb-4 text-sm font-medium">Provide a detailed description. Use formatting to highlight key features.</p>
                
                <div className="rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                  <RichTextEditor 
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe what the client will get, your process, and why they should choose you..."
                  />
                </div>
              </div>
              
              {/* Pricing and Delivery Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-100">
                <div>
                  <label className="block mb-2 text-xl font-bold text-secondary">Price ($) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-lg">$</span>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleChange} 
                      min="5"
                      placeholder="100"
                      required
                      className="w-full py-4 pr-5 pl-10 rounded-xl border border-gray-200 text-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-xl font-bold text-secondary">Delivery Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="delivery_time_days" 
                      value={formData.delivery_time_days} 
                      onChange={handleChange} 
                      min="1"
                      placeholder="3"
                      required
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 text-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Days</span>
                  </div>
                </div>
              </div>
              
              {/* Media and Metadata Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block mb-2 text-xl font-bold text-secondary">Skills / Tags</label>
                  <input 
                    type="text" 
                    name="skills_tags" 
                    value={formData.skills_tags} 
                    onChange={handleChange} 
                    placeholder="React, Node.js, Design"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xl font-bold text-secondary">Cover Image URL</label>
                  <input 
                    type="url" 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleChange} 
                    placeholder="https://example.com/cover.jpg"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 px-6 text-xl font-bold text-white bg-gradient-to-r from-primary to-primary-hover rounded-xl shadow-glow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Publishing Service...' : 'Publish Service'}
              </button>
            </form>
          </div>

          {/* Live Preview Side */}
          <div className="sticky top-24">
            <h3 className="mb-6 text-gray-400 font-bold text-lg text-center uppercase tracking-widest">Live Preview</h3>
            
            <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-50 group">
              
              {/* Image Preview */}
              <div 
                className="h-56 bg-gray-100 flex items-center justify-center relative overflow-hidden"
                style={formData.imageUrl ? { backgroundImage: `url(${formData.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {!formData.imageUrl && <span className="text-gray-400 font-medium">No Cover Image</span>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-bold text-secondary text-sm">{session?.user?.name || 'Your Name'}</span>
                </div>
                
                {/* Title */}
                <h3 className={`text-lg font-bold mb-5 leading-snug h-[3em] line-clamp-2 ${formData.title ? 'text-secondary' : 'text-gray-400'}`}>
                  {formData.title || 'I will design a modern web app for you'}
                </h3>
                
                {/* Tags preview */}
                <div className="flex gap-2 flex-wrap mb-6">
                  {formData.skills_tags ? formData.skills_tags.split(',').map((tag, idx) => {
                    const t = tag.trim();
                    if(!t) return null;
                    return (
                      <span key={idx} className="bg-indigo-50 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {t}
                      </span>
                    )
                  }).slice(0, 3) : (
                    <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Skill Tag</span>
                  )}
                </div>
                
                {/* Footer (Price & Delivery) */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <span className="text-lg">⏱</span> {formData.delivery_time_days ? `${formData.delivery_time_days} days` : 'X days'}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest mb-1">Starting At</span>
                    <span className="text-2xl font-black text-secondary">
                      ${formData.price || '100'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
