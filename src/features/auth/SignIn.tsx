import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { AUTH_HASH } from '../../shared/utils';

interface SignInProps {
  onLogin: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = user.trim();
    const cleanPass = pass.trim();

    // OBFUSCATION CHECK: Encode input and compare with stored hash
    if (btoa(cleanUser) === AUTH_HASH.U && btoa(cleanPass) === AUTH_HASH.P) {
      onLogin();
    } else {
      setErr('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 animate-fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-brand-600 shadow-inner">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Access</h2>
          <p className="text-slate-500 mt-2">Sign in to manage your world</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
            <input 
              type="text" value={user} 
              onChange={e => { setUser(e.target.value); setErr(''); }} 
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" 
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input 
              type="password" value={pass} 
              onChange={e => { setPass(e.target.value); setErr(''); }} 
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white" 
              placeholder="••••••••"
            />
          </div>
          {err && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg font-medium animate-pulse">{err}</p>}
          <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition shadow-xl shadow-brand-200 hover:shadow-2xl hover:-translate-y-1">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;