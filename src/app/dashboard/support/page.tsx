'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, LifeBuoy, FileText, CheckCircle, Clock, 
  ArrowRight, ShieldCheck, X, Plus, MessageSquare, AlertCircle
} from 'lucide-react';

const CATEGORIES = ['Profile Setup', 'Billing', 'Safety', 'Tech Issue', 'Feedback'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export default function SupportCenter() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Profile Setup');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [statusMsg, setStatusMsg] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Tickets fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    setStatusMsg('SENDING');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          category,
          priority,
          description
        })
      });

      if (res.ok) {
        setStatusMsg('SUCCESS');
        await fetchTickets();
        setTimeout(() => {
          setStatusMsg('IDLE');
          setSubject('');
          setDescription('');
        }, 2000);
      } else {
        setStatusMsg('IDLE');
        alert("Failed to submit ticket. Please try again.");
      }
    } catch (err) {
      setStatusMsg('IDLE');
      console.error("Ticket submit error", err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5" /> Support Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">Help & Customer Support</h1>
          <p className="text-sm text-foreground/70">Need assistance? Lodge a support ticket below. Our dedicated relationship team will resolve it within 24 hours.</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Create Support Ticket */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-primary/10 space-y-5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Create Support Ticket
            </h3>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              {statusMsg === 'SUCCESS' ? (
                <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Ticket raised successfully! Relationship managers notified.
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold block mb-1 opacity-70">Subject / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Briefly state your concern"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold block mb-1 opacity-70">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold block mb-1 opacity-70">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                      >
                        {PRIORITIES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold block mb-1 opacity-70">Detailed Description</label>
                    <textarea
                      required
                      placeholder="Explain your technical issue, billing mismatch, or safety concern in detail"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-xl border border-primary/15 glass-input text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={statusMsg === 'SENDING'}
                    className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                  >
                    {statusMsg === 'SENDING' ? 'Raising Ticket...' : 'Submit Support Ticket'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Right Side: Ticket History logs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-primary/10 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Filed Ticket History
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-primary/5 border border-primary/5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold">{t.subject}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold ${
                        t.status === 'RESOLVED' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-500'
                      }`}>{t.status}</span>
                    </div>
                    <p className="opacity-70">Category: {t.category} • Priority: {t.priority}</p>
                    <p className="opacity-85 text-[11px] leading-relaxed">{t.description}</p>
                    <p className="text-[9px] opacity-50 block pt-1 border-t border-primary/5">Filed: {new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs opacity-60 border border-dashed border-primary/10 rounded-xl">
                No active support tickets found.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
