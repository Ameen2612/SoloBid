"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Home, Users, Settings, Building2, LogOut, Loader2, Save, UploadCloud, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [profile, setProfile] = useState({ 
    business_name: '', 
    contact_email: '', 
    logo_url: '',
    payment_instructions: '',
    terms_conditions: ''
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);
      
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (data) {
        setProfile({ 
          business_name: data.business_name || '', 
          contact_email: data.contact_email || session.user.email, 
          logo_url: data.logo_url || '',
          payment_instructions: data.payment_instructions || '',
          terms_conditions: data.terms_conditions || ''
        });
      } else {
        setProfile({ business_name: '', contact_email: session.user.email || '', logo_url: '', payment_instructions: '', terms_conditions: '' });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file || !userId) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      
      setProfile({ ...profile, logo_url: publicUrl });
      await supabase.from('profiles').upsert({ id: userId, logo_url: publicUrl });

    } catch (error) {
      alert('Error uploading logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ 
      id: userId, 
      business_name: profile.business_name, 
      contact_email: profile.contact_email, 
      logo_url: profile.logo_url,
      payment_instructions: profile.payment_instructions,
      terms_conditions: profile.terms_conditions
    });
    setSaving(false);
    if (!error) alert("Settings saved!");
  };

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail: profile.contact_email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Failed to start checkout. Check your Stripe keys.");
      }
    } catch (error) {
      alert("Something went wrong.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex justify-center items-center"><Loader2 className="animate-spin text-white" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-slate-50 relative font-sans sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#059669] p-6 pt-12 sm:pt-10 text-white z-10 shrink-0">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <div className="mt-6 bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-lg">
            <div className="relative w-16 h-16 shrink-0 group cursor-pointer">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-100" />
              ) : (
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-[#059669] font-bold text-xl uppercase">
                  {profile.business_name ? profile.business_name.substring(0, 2) : 'ME'}
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? <Loader2 className="animate-spin text-white" size={20} /> : <UploadCloud className="text-white" size={20} />}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="flex-1 overflow-hidden">
              <h2 className="text-slate-900 font-bold text-lg truncate">{profile.business_name || 'Your Business'}</h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5 truncate">{profile.contact_email}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="space-y-6">
            
            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Business Profile</h3>
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Company Name</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} placeholder="e.g. Apex Plumbing" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 font-medium focus:outline-none focus:border-[#059669] transition-all" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Invoice Defaults</h3>
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Payment Instructions</label>
                  <textarea 
                    rows={3} 
                    value={profile.payment_instructions} 
                    onChange={e => setProfile({...profile, payment_instructions: e.target.value})} 
                    placeholder="e.g. Make checks payable to Apex Plumbing..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#059669] transition-all resize-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Terms & Conditions</label>
                  <textarea 
                    rows={3} 
                    value={profile.terms_conditions} 
                    onChange={e => setProfile({...profile, terms_conditions: e.target.value})} 
                    placeholder="e.g. Estimate valid for 30 days..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#059669] transition-all resize-none" 
                  />
                </div>
                <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center space-x-2 bg-[#059669] hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 mt-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /><span>Save Changes</span></>}
                </button>
              </div>
            </section>

            {/* Upgrade Banner */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#059669] rounded-full blur-[60px] opacity-40"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <CreditCard size={20} className="text-emerald-400" />
                  <span>SoloBid Pro</span>
                </h3>
                <p className="text-slate-300 text-sm mt-2 mb-4 leading-relaxed">
                  Remove watermarks, unlock unlimited clients, and accept payments directly on your invoices.
                </p>
                <button 
                  onClick={handleUpgrade}
                  disabled={isCheckingOut}
                  className="w-full bg-[#059669] hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center space-x-2 shadow-[0_4px_12px_rgba(5,150,105,0.3)]"
                >
                  {isCheckingOut ? <Loader2 className="animate-spin" size={18} /> : <span>Upgrade to Pro — $15/mo</span>}
                </button>
              </div>
            </section>

            <button onClick={handleSignOut} className="w-full flex items-center justify-center space-x-2 text-red-500 font-bold py-4 bg-red-50 hover:bg-red-100 rounded-2xl mt-4 active:scale-95 transition-all">
              <LogOut size={20} /><span>Sign Out</span>
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center pt-4 pb-6 px-2 z-20">
          <Link href="/" className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-100 transition-opacity">
            <Home size={24} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Home</span>
          </Link>
          <Link href="/clients" className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-100 transition-opacity">
            <Users size={24} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Clients</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center space-y-1">
            <Settings size={24} className="text-[#059669]" />
            <span className="text-[10px] font-bold text-[#059669] tracking-wide uppercase">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}