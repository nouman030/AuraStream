import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '', role: 'USER' });
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "An error occurred during authentication.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto fade-in mt-12">
      <div className="glass-card p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/20 blur-[50px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-teal/20 blur-[50px] rounded-full"></div>
        
        <h2 className="text-3xl font-bold font-heading mb-6 relative z-10 text-center">
          {isLogin ? 'Welcome Back' : 'Join AuraStream'}
        </h2>
        
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-4 text-center relative z-10">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Username" 
              className="input-field" 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required 
            />
          )}
          
          <input 
            type="email" 
            placeholder="Email Address" 
            className="input-field"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required 
          />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="input-field pr-12" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {!isLogin && (
            <div className="flex flex-col gap-2 mt-2 text-sm text-zinc-300">
              <label className="font-medium">Account Role:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="USER" checked={formData.role === 'USER'} onChange={e => setFormData({...formData, role: e.target.value})} className="accent-brand-violet" /> Listener
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="ARTIST" checked={formData.role === 'ARTIST'} onChange={e => setFormData({...formData, role: e.target.value})} className="accent-brand-violet"/> Artist
                </label>
              </div>
            </div>
          )}
          
          <button type="submit" className="btn-primary mt-4 w-full">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-zinc-400 relative z-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }} className="text-brand-teal hover:underline font-medium">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
