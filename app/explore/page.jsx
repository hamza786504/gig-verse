"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, Image as ImageIcon } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(searchParamQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      let queryUrl = '/api/services?';
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (selectedLevel) params.append('level', selectedLevel);
      
      const res = await fetch(queryUrl + params.toString());
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setServices(data);
      } else {
        console.error('Failed to fetch services:', data.message || 'Unknown error');
        setServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParamQuery !== search) {
      setSearch(searchParamQuery);
    }
  }, [searchParamQuery]);

  useEffect(() => {
    fetchServices();
  }, [selectedLevel, search]); // Re-fetch automatically if level dropdown or search changes



  const handleClearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedLevel('');
    // Need to trigger a fresh fetch after states clear. We use a setTimeout to let state settle
    setTimeout(() => {
      setLoading(true);
      fetch('/api/services').then(res => res.json()).then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    }, 0);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-5 border-b border-gray-200 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-secondary">Explore Services</h1>
          <p className="text-gray-500">Find the perfect freelance services for your business</p>
          {search && (
            <p className="text-primary font-medium mt-2">Showing results for: "{search}"</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
        
        {/* Sidebar Filters */}
        <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-secondary m-0">Filters</h3>
            <button onClick={handleClearFilters} className="bg-transparent border-none text-primary cursor-pointer text-sm font-bold hover:underline">Clear All</button>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Price Filter */}
            <div className="mb-8">
              <label className="block font-bold mb-3 text-sm text-secondary">Price Range</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-primary transition-colors bg-background"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-primary transition-colors bg-background"
                />
              </div>
            </div>

            {/* User Level Filter */}
            <div className="mb-8">
              <label className="block font-bold mb-3 text-sm text-secondary">Freelancer Level</label>
              <select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-primary transition-colors bg-background appearance-none cursor-pointer"
              >
                <option value="">Any Level</option>
                <option value="New User">New User</option>
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Top Rated">Top Rated</option>
              </select>
            </div>

            <button type="submit" className="w-full py-3 bg-secondary text-white font-medium rounded-xl hover:bg-black transition-colors">Apply Filters</button>
          </form>
        </div>

        {/* Results Area */}
        <div>
          {loading ? (
            <div className="text-center py-20 text-gray-500 text-lg animate-pulse">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-50 shadow-soft">
              <h3 className="text-gray-400 mb-3 text-xl font-medium">No services found.</h3>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map(service => (
                <Link href={`/service/${service._id}`} key={service._id} className="block bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-lg border border-gray-50 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {service.images && service.images.length > 0 ? (
                      <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {service.freelancerId?.name?.charAt(0) || 'F'}
                        </div>
                        <span className="font-semibold text-secondary text-sm truncate max-w-[100px]">{service.freelancerId?.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-primary rounded-full uppercase tracking-wider">
                        {service.freelancerId?.profile?.level || 'New'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-4 text-secondary leading-snug line-clamp-2 h-[2.8em] group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center text-yellow-500 text-sm">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        <span className="text-secondary font-bold">{service.rating > 0 ? service.rating.toFixed(1) : 'New'}</span>
                      </div>
                      <div className="font-black text-lg text-secondary">
                        <span className="text-xs text-gray-400 font-medium mr-1 uppercase">From</span>
                        ${service.price}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExploreServices() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500 text-lg animate-pulse">Loading explore page...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
