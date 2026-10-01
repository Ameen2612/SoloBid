"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 relative font-sans sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col justify-center px-8">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgba(5,150,105,0.4)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SoloBid</h1>
          <p className="text-slate-500 font-medium mt-2">Professional quotes in seconds.</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 text-center">{error}</div>}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-transform active:scale-[0.98] disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>{isSignUp ? 'Create Account' : 'Sign In'}</span><ArrowRight size={20} /></>}
          </button>
        </form>
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-slate-500 font-medium text-sm hover:text-slate-900 transition-colors">
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}