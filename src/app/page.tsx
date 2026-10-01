"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Home, Users, Settings, CheckCircle2, Loader2, FileText } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data, error } = await supabase.from('quotes').select(`id, total_amount, status, created_at, clients ( name )`).order('created_at', { ascending: false });
      if (!error && data) setQuotes(data);
      setLoading(false);
    };
    checkAuthAndFetchData();
  }, [router]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
      case 'SENT': return 'bg-amber-100 text-amber-700'; // Amber for contrast
      case 'DRAFT': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const totalRevenue = quotes.reduce((sum, q) => sum + Number(q.total_amount || 0), 0);

  if (loading) return <div className="min-h-screen bg-slate-900 flex justify-center items-center"><Loader2 className="animate-spin text-white" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 relative font-sans sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-[#059669] rounded-b-[2rem] p-6 pt-12 sm:pt-10 text-white z-10 shrink-0">
          <h1 className="text-3xl font-bold tracking-tight">Good afternoon,</h1>
          <p className="text-emerald-100 text-sm mt-1">You have {quotes.length} total quotes.</p>
          <div className="mt-6 bg-white/10 rounded-2xl p-5 border border-white/20 flex justify-between items-center backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-emerald-100/80 mb-1">TOTAL REVENUE</p>
              <p className="text-3xl font-bold tracking-tight">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-full border border-white/10">
              <CheckCircle2 size={24} className="text-white opacity-90" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">Recent Quotes</h2>
            <Search size={20} className="text-slate-400" />
          </div>
          <div className="space-y-4">
            {quotes.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
                <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 font-medium">No quotes created yet.</p>
                <p className="text-xs text-slate-400 mt-1">Tap the + button to start.</p>
              </div>
            ) : (
              quotes.map((quote) => (
                <Link href={`/quote/${quote.id}`} key={quote.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex justify-between items-center transition-transform active:scale-95 block w-full">
                  <div>
                    <h3 className="font-bold text-slate-900">{quote.clients?.name || 'Unknown Client'}</h3>
                    <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400 font-medium">
                      <span>🕒</span>
                      <span>{new Date(quote.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="font-bold text-slate-900">${Number(quote.total_amount).toFixed(2)}</span>
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase ${getStatusStyles(quote.status)}`}>{quote.status}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        <Link href="/quote/new" className="absolute bottom-24 right-6 bg-[#059669] text-white p-4 rounded-full shadow-[0_8px_20px_rgba(5,150,105,0.4)] hover:bg-emerald-700 transition-transform active:scale-90 z-20">
          <Plus size={28} />
        </Link>
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center pt-4 pb-6 px-2 z-20">
          <Link href="/" className="flex flex-col items-center space-y-1">
            <Home size={24} className="text-[#059669]" />
            <span className="text-[10px] font-bold text-[#059669] tracking-wide uppercase">Home</span>
          </Link>
          <Link href="/clients" className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-100 transition-opacity">
            <Users size={24} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Clients</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-100 transition-opacity">
            <Settings size={24} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}