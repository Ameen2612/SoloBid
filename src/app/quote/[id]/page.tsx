"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Download, Loader2, FileText, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { QuotePDF } from '@/components/QuotePDF';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false, loading: () => <button className="w-full bg-slate-200 text-slate-500 py-4 rounded-full font-bold flex items-center justify-center"><Loader2 className="animate-spin mr-2" size={20} /> Loading PDF Engine...</button> }
);

export default function QuoteDetail() {
  const params = useParams();
  const id = params.id as string;
  const [quote, setQuote] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      const { data: qData } = await supabase.from('quotes').select('*').eq('id', id).single();
      if (qData) {
        setQuote(qData);
        
        // Fetch Client
        const { data: cData } = await supabase.from('clients').select('*').eq('id', qData.client_id).single();
        setClient(cData);
        
        // Fetch Line Items
        const { data: lData } = await supabase.from('quote_line_items').select('*').eq('quote_id', id);
        setLineItems(lData || []);

        // Fetch User Profile for PDF Branding
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', qData.user_id).single();
        setProfile(pData);
      }
      setLoading(false);
    };
    if (id) fetchQuoteDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-900 flex justify-center items-center"><Loader2 className="animate-spin text-white" size={40} /></div>;
  if (!quote) return <div className="min-h-screen bg-slate-900 flex justify-center items-center text-white">Quote not found.</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 relative font-sans sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        
        <header className="bg-[#059669] text-white p-6 pt-12 sm:pt-10 flex items-center space-x-3 shrink-0">
          <Link href="/" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors pointer-events-auto">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Quote Details</h1>
            <p className="text-emerald-100 text-xs mt-0.5">#{quote.id.substring(0, 6).toUpperCase()}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
          <section className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-400 mb-4">
              <User size={18} />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Client Info</h2>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{client?.name}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Status: <span className="text-[#059669] font-bold">{quote.status}</span></p>
          </section>

          <section className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-400 mb-4">
              <FileText size={18} />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Items ({lineItems.length})</h2>
            </div>
            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-900">{item.description}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Total Estimate</span>
            <span className="text-3xl font-bold text-slate-900">${Number(quote.total_amount).toFixed(2)}</span>
          </div>
          
          <PDFDownloadLink 
            document={<QuotePDF quote={quote} client={client} lineItems={lineItems} profile={profile} />} 
            fileName={`Quote_${client?.name?.replace(/\s+/g, '_')}_${quote.id.substring(0,6)}.pdf`}
            className="w-full block"
          >
            {({ loading }) => (
              <button 
                disabled={loading}
                className="w-full bg-[#059669] hover:bg-emerald-700 text-white py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-2 shadow-[0_8px_20px_rgba(5,150,105,0.3)] transition-transform active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Download size={20} /><span>Download PDF</span></>}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}