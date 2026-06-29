"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, Bell, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetch(`/api/services/suggestions?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data);
            setShowSuggestions(true);
          })
          .catch(err => console.error(err));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e, keyword = null) => {
    if (e) e.preventDefault();
    const finalSearch = keyword || searchQuery;
    if (finalSearch.trim()) {
      setShowSuggestions(false);
      setSearchQuery(''); // Optional: clear search bar after navigate
      router.push(`/explore?search=${encodeURIComponent(finalSearch)}`);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="bg-surface/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-[100] py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="logo shrink-0">
          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-hover transition-colors tracking-tighter">
            GigVerse<span className="text-secondary">.</span>
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block" ref={searchRef}>
          <form onSubmit={(e) => handleSearchSubmit(e)} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Find services..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() === '') {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0 && searchQuery.trim() !== '') {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary"
              />
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden z-50">
                <ul className="py-2 m-0 list-none">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion._id}>
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit(null, suggestion.title)}
                        className="w-full text-left px-5 py-3 text-sm text-secondary hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{suggestion.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
        
        <div className="flex gap-6 items-center">
          <Link href="/explore" className="text-secondary hover:text-primary font-medium transition-colors">Explore Services</Link>
          
          {session ? (
            <>
              {session.user.role === 'client' && <Link href="/client/dashboard" className="text-secondary hover:text-primary font-medium transition-colors">Dashboard</Link>}
              {session.user.role === 'freelancer' && <Link href="/freelancer/dashboard" className="text-secondary hover:text-primary font-medium transition-colors">Dashboard</Link>}
              {session.user.role === 'manager' && <Link href="/manager/dashboard" className="text-secondary hover:text-primary font-medium transition-colors">Manager Portal</Link>}
              {session.user.role === 'admin' && <Link href="/admin/dashboard" className="text-secondary hover:text-primary font-medium transition-colors">Admin Portal</Link>}
              
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    if (!showDropdown && unreadCount > 0) handleMarkAsRead();
                  }}
                  className="bg-transparent border-none cursor-pointer text-gray-600 relative hover:scale-110 transition-transform p-1"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-12 w-80 bg-surface shadow-soft rounded-xl border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 font-bold text-secondary">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-gray-500">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <Link href={n.link || '#'} key={n._id} onClick={() => setShowDropdown(false)} className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${n.is_read ? 'bg-transparent' : 'bg-primary/5'}`}>
                          <p className="m-0 text-sm text-secondary font-medium">{n.content}</p>
                          <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
                <span className="font-semibold text-secondary">{session.user.name}</span>
                <button onClick={() => signOut()} className="px-4 py-2 text-sm font-medium text-secondary bg-surface border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">Sign Out</button>
              </div>
            </>
          ) : (
            <div className="flex gap-3 ml-4">
              <Link href="/login" className="px-5 py-2 text-sm font-medium text-secondary bg-surface border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">Log In</Link>
              <Link href="/register" className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-hover rounded-full hover:shadow-glow transition-all transform hover:-translate-y-0.5">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
