import React, { useState, useEffect } from 'react';
import { User, Mail, Save, UserCheck, Shield, Mic2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
    ARTIST: 'bg-brand-violet/20 text-brand-violet border-brand-violet/30',
    USER: 'bg-brand-teal/20 text-brand-teal border-brand-teal/30',
  };
  return (
    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${styles[role] || styles.USER}`}>
      {role}
    </span>
  );
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({ username: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await axiosInstance.put('/auth/update-profile', {
        username: formData.username,
        email: formData.email,
        role: user.role.toLowerCase() 
      });
      
      if (res.data?.user) {
        const updated = res.data.user;
        setUser({ 
           ...user,
           name: updated.username, 
           email: updated.email 
        });
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center text-zinc-500 fade-in">Authenticating...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 justify-center items-center flex rounded-2xl bg-zinc-800 border border-white/5 shadow-2xl">
           <UserCheck className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black font-heading text-white tracking-tight">Your Profile</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your account details and settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="col-span-1 border-r border-dark-border/20 pr-4">
          <div className="glass-card noise-overlay p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] pointer-events-none opacity-20" 
                 style={{ background: user.role === 'ADMIN' ? '#f59e0b' : user.role === 'ARTIST' ? '#7c3aed' : '#06b6d4' }} />
            
            <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center text-4xl font-black text-white relative z-10 font-heading shadow-xl border-4 border-white/5"
                 style={{ 
                   background: user.role === 'ADMIN' 
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                      : user.role === 'ARTIST'
                      ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                      : 'linear-gradient(135deg, #06b6d4, #0891b2)'
                 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">{user.name}</h2>
            <p className="text-zinc-400 text-sm mb-4">{user.email}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Edit Form */}
        <div className="col-span-1 lg:col-span-2">
          <div className="glass-card noise-overlay p-8">
            <h3 className="text-lg font-bold text-white border-b border-dark-border pb-4 mb-6">Account Settings</h3>
            
            {message.text && (
              <div className={`p-4 mb-6 rounded-lg text-sm flex font-medium ${message.type === 'success' ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    className="input-field pl-10 bg-black/20" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="E.g. johndoe"
                    required 
                    minLength={3}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">Must be at least 3 characters. No spaces.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="email"
                    className="input-field pl-10 bg-black/20" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="E.g. user@example.com"
                    required 
                  />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-dark-border">
                <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-bold text-sm">
                  {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
