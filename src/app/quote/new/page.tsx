"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Send, FileText, User, ChevronLeft, Loader2 } from 'lucide-react';

export default function NewQuote() {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Initialize qty and price as empty strings so they act as placeholders
  const [lineItems, setLineItems] = useState<any[]>([{ id: 1, name: '', qty: '', price: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('id, name').order('name');
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientName.toLowerCase())
  );

  const addItem = () => setLineItems([...lineItems, { id: Date.now(), name: '', qty: '', price: '' }]);
  const removeItem = (id: number) => setLineItems(lineItems.filter(item => item.id !== id));
  
  const updateItem = (id: number, field: string, value: string | number) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  
  // Safely calculate total even if fields are empty
  const total = lineItems.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.price) || 0)), 0);

  const handleSaveQuote = async (status: 'DRAFT' | 'SENT') => {
    if (!clientName.trim()) { alert("Please enter a client name."); return; }
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const userId = session.user.id;

      let clientId;
      const { data: existingClient } = await supabase.from('clients').select('id').eq('name', clientName.trim()).eq('user_id', userId).maybeSingle();
      if (existingClient) clientId = existingClient.id;
      else {
        const { data: newClient, error: clientError } = await supabase.from('clients').insert([{ user_id: userId, name: clientName.trim() }]).select('id').single();
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      const { data: newQuote, error: quoteError } = await supabase.from('quotes').insert([{ user_id: userId, client_id: clientId, total_amount: total, status: status }]).select('id').single();
      if (quoteError) throw quoteError;

      // Ensure empty fields default to 1 qty and 0 price on the backend
      const itemsToInsert = lineItems
        .filter(item => item.name.trim() !== '')
        .map(item => ({ 
          quote_id: newQuote.id, 
          description: item.name, 
          quantity: Number(item.qty) || 1, 
          price: Number(item.price) || 0 
        }));
        
      if (itemsToInsert.length > 0) {
        const { error: lineItemsError } = await supabase.from('quote_line_items').insert(itemsToInsert);
        if (lineItemsError) throw lineItemsError;
      }
      router.push('/');
    } catch (error) {
      console.error("Error saving quote:", error);
      alert("Failed to save quote. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 relative font-sans sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        
        <header className="bg-[#059669] text-white p-6 pt-12 sm:pt-10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <Link href="/" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors pointer-events-auto">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Create Quote</h1>
              <p className="text-emerald-100 text-xs mt-0.5">Draft #INV-004</p>
            </div>
          </div>
          <button onClick={() => handleSaveQuote('DRAFT')} disabled={isSaving} className="text-xs font-bold tracking-wide uppercase bg-white text-[#059669] px-4 py-2 rounded-full shadow-sm hover:bg-emerald-50 transition-colors disabled:opacity-50">
            {isSaving ? '...' : 'Save'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
          <section className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-400 mb-3">
              <User size={18} />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Client Details</h2>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                value={clientName} 
                onChange={(e) => {
                  setClientName(e.target.value);
                  setShowDropdown(true);
                }} 
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Tap to select or type client..." 
                className="w-full text-lg font-bold text-slate-900 p-2 border-b-2 border-slate-100 focus:outline-none focus:border-[#059669] bg-transparent placeholder-slate-300 transition-colors" 
              />
              
              {showDropdown && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto overflow-hidden">
                  {filteredClients.length > 0 ? (
                    filteredClients.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setClientName(c.name);
                          setShowDropdown(false);
                        }}
                        className="p-4 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0 font-semibold text-slate-700 transition-colors"
                      >
                        {c.name}
                      </div>
                    ))
                  ) : clientName.trim() ? (
                    <div className="p-4 text-sm text-slate-500 bg-slate-50">
                      Create new client: <span className="font-bold text-[#059669]">{clientName}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <FileText size={18} className="text-slate-400" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Services & Materials</h2>
            </div>
            {lineItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col space-y-4 relative group">
                <div className="flex justify-between items-start">
                  <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder="Item description (e.g. Labor)" className="font-bold text-slate-900 focus:outline-none w-full bg-transparent placeholder-slate-300" />
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><Trash2 size={18} /></button>
                </div>
                <div className="flex items-center space-x-3">
                  
                  {/* Updated Qty Input */}
                  <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Qty</span>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="1"
                      value={item.qty} 
                      onChange={(e) => updateItem(item.id, 'qty', e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full bg-transparent focus:outline-none text-right font-bold text-slate-700 placeholder-slate-300" 
                    />
                  </div>
                  
                  {/* Updated Price Input */}
                  <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">$</span>
                    <input 
                      type="number" 
                      min="0" 
                      placeholder="0.00"
                      value={item.price} 
                      onChange={(e) => updateItem(item.id, 'price', e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full bg-transparent focus:outline-none text-right font-bold text-slate-700 placeholder-slate-300" 
                    />
                  </div>
                  
                </div>
              </div>
            ))}
            <button onClick={addItem} className="w-full py-4 flex items-center justify-center space-x-2 text-[#059669] bg-emerald-50 hover:bg-emerald-100 rounded-2xl font-bold transition-colors border border-emerald-100 border-dashed">
              <Plus size={20} /><span>Add Another Item</span>
            </button>
          </section>
        </main>
        
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Total Estimate</span>
            <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>
          <button onClick={() => handleSaveQuote('SENT')} disabled={isSaving} className="w-full bg-[#059669] hover:bg-emerald-700 text-white py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-2 shadow-[0_8px_20px_rgba(5,150,105,0.3)] transition-transform active:scale-[0.98] disabled:opacity-70">
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /><span>Save & Send Quote</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}