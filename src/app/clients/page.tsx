"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Home, Users, Settings, Phone, Mail, ChevronRight, Loader2 } from 'lucide-react';

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data, error } = await supabase.from('clients').select(`*, quotes ( total_amount )`).order('name');
      if (!error && data) {
        const clientsWithLTV = data.map(client => {
          const totalSpent = client.quotes.reduce((sum: number, quote: any) => sum + Number(quote.total_amount || 0), 0);
          return { ...client, totalSpent };
        });
        setClients(clientsWithLTV);
      }
      setLoading(false);
    };
    fetchClients();
  }, [router]);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 relative font-sans sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-[#059669] p-6 pt-12 sm:pt-10 text-white z-10 shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><Plus size={24} /></button>
          </div>
          <div className="mt-6 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200" />
            <input type="text" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-12 pr-4 text-white placeholder-emerald-200 focus:outline-none focus:bg-white/20 transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#059669]" size={30} /></div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">No clients found.</div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 active:scale-95 transition-transform cursor-pointer group">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                      {client.company && <p className="text-xs font-semibold text-[#059669]">{client.company}</p>}
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-[#059669] transition-colors" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex space-x-3">
                      <a href={`tel:${client.phone}`} onClick={e => !client.phone && e.preventDefault()} className={`bg-slate-50 p-2 rounded-full transition-colors ${client.phone ? 'text-[#059669] hover:bg-emerald-50' : 'text-slate-300'}`}><Phone size={16} /></a>
                      <a href={`mailto:${client.email}`} onClick={e => !client.email && e.preventDefault()} className={`bg-slate-50 p-2 rounded-full transition-colors ${client.email ? 'text-[#059669] hover:bg-emerald-50' : 'text-slate-300'}`}><Mail size={16} /></a>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">LTV</span>
                      <span className="font-bold text-slate-900">${client.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center pt-4 pb-6 px-2 z-20">
          <Link href="/" className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-100 transition-opacity">
            <Home size={24} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Home</span>
          </Link>
          <Link href="/clients" className="flex flex-col items-center space-y-1">
            <Users size={24} className="text-[#059669]" />
            <span className="text-[10px] font-bold text-[#059669] tracking-wide uppercase">Clients</span>
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