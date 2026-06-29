"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Shield, UserCog } from 'lucide-react';

export default function AdminManagers() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newManager, setNewManager] = useState({ name: '', email: '', password: '', canApproveTransactions: false });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchManagers();
    }
  }, [status, session, router]);

  const fetchManagers = async () => {
    try {
      const res = await fetch('/api/admin/managers');
      if (res.ok) {
        const data = await res.json();
        setManagers(data);
      }
    } catch (error) {
      console.error('Failed to fetch managers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newManager)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewManager({ name: '', email: '', password: '', canApproveTransactions: false });
        fetchManagers();
      } else {
        const data = await res.json();
        alert(data.message || 'Error creating manager');
      }
    } catch (err) {
      alert('Error creating manager');
    } finally {
      setAddLoading(false);
    }
  };

  const handleTogglePermission = async (id, currentPermission) => {
    try {
      const res = await fetch(`/api/admin/managers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canApproveTransactions: !currentPermission })
      });
      if (res.ok) {
        fetchManagers();
      }
    } catch (err) {
      console.error('Failed to update permission', err);
    }
  };

  const handleDeleteManager = async (id) => {
    if (!confirm('Are you sure you want to delete this manager?')) return;
    try {
      const res = await fetch(`/api/admin/managers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchManagers();
      }
    } catch (err) {
      console.error('Failed to delete manager', err);
    }
  };

  if (loading || status === 'loading') return <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg animate-pulse">Loading managers...</div>;
  if (!session || session.user.role !== 'admin') return null;

  const filteredManagers = managers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full max-w-7xl mx-auto px-0 md:px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight">Manage Managers</h1>
          <p className="text-gray-500 mt-1">Add, remove, and update platform managers.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white font-bold rounded-xl shadow-glow hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Manager
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-50 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h2 className="text-xl font-bold text-secondary m-0 flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-500" /> Manager Directory
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-gray-100">Name</th>
                <th className="px-6 py-4 border-b border-gray-100">Email</th>
                <th className="px-6 py-4 border-b border-gray-100">Approve Transactions</th>
                <th className="px-6 py-4 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">No managers found matching your search.</td>
                </tr>
              ) : (
                filteredManagers.map((manager) => (
                  <tr key={manager._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 font-semibold text-secondary">{manager.name}</td>
                    <td className="px-6 py-5 text-gray-500">{manager.email}</td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => handleTogglePermission(manager._id, manager.permissions?.canApproveTransactions)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${manager.permissions?.canApproveTransactions ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${manager.permissions?.canApproveTransactions ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="ml-3 text-sm font-medium text-gray-600">
                        {manager.permissions?.canApproveTransactions ? 'Granted' : 'Denied'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDeleteManager(manager._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Manager"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-secondary">Add New Manager</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddManager} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newManager.name}
                  onChange={(e) => setNewManager({...newManager, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newManager.email}
                  onChange={(e) => setNewManager({...newManager, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="e.g. jane@gigverse.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  value={newManager.password}
                  onChange={(e) => setNewManager({...newManager, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Secure password"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="canApprove"
                  checked={newManager.canApproveTransactions}
                  onChange={(e) => setNewManager({...newManager, canApproveTransactions: e.target.checked})}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="canApprove" className="text-sm font-bold text-secondary cursor-pointer select-none">
                  Can approve transactions
                </label>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addLoading}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-70"
                >
                  {addLoading ? 'Creating...' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
