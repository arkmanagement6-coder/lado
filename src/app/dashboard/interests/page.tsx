'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check, X, MessageSquare, ShieldCheck, Trash2, ArrowRight } from 'lucide-react';

export default function InterestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const fetchInterests = async () => {
    try {
      const res = await fetch('/api/interests');
      if (res.ok) {
        const data = await res.json();
        setInterests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  // Accept or Decline Interest Action
  const handleUpdateInterest = async (interestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch('/api/interests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interestId, status })
      });

      if (res.ok) {
        fetchInterests(); // Reload list
        alert(status === 'ACCEPTED' ? "Connection established! You can now start chatting with this profile." : "Interest declined");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel Outgoing Interest Action
  const handleCancelInterest = async (interestId: string) => {
    if (!confirm("Are you sure you want to cancel this interest request?")) return;
    try {
      const res = await fetch(`/api/interests?interestId=${interestId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchInterests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAge = (dobString?: string) => {
    if (!dobString) return 26;
    const birth = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Filter lists based on tab
  const receivedList = interests.filter(i => i.receiverId === user?.id && i.status === 'SENT');
  const sentList = interests.filter(i => i.senderId === user?.id);
  
  // Also collect accepted connections to display in received if user accepted
  const acceptedList = interests.filter(i => i.status === 'ACCEPTED');

  return (
    <div className="space-y-6 max-w-4xl select-none">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Interest Requests</h2>
        <p className="text-xs text-foreground/60">Manage your profile connections and accepted matches.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/10">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 text-sm font-bold border-b-2 px-6 transition-all ${
            activeTab === 'received' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
          }`}
        >
          Received Requests ({receivedList.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 text-sm font-bold border-b-2 px-6 transition-all ${
            activeTab === 'sent' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
          }`}
        >
          Sent Requests ({sentList.length})
        </button>
      </div>

      {/* Lists Output */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : activeTab === 'received' ? (
        
        // RECEIVED INTERESTS LIST
        <div className="space-y-6">
          
          {/* Unread Incoming Sent interests */}
          {receivedList.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-60 border border-dashed border-primary/10 rounded-3xl">
              No pending interest requests received. Keep your profile updated to gain attention!
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase opacity-65 tracking-wider">Awaiting Your Approval</h3>
              <div className="space-y-4">
                {receivedList.map(item => (
                  <div key={item.id} className="glass-panel p-4 rounded-3xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left min-w-0">
                      <img 
                        src={item.targetProfile?.profilePhoto || 'https://placehold.co/400x400/png?text=Photo'} 
                        alt={item.targetUser?.name}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate">{item.targetUser?.name}</h4>
                        <p className="text-[10px] text-primary font-semibold">
                          {item.targetProfile?.religion} • {item.targetProfile?.caste} • {item.targetProfile?.dob ? getAge(item.targetProfile.dob) : 26} yrs
                        </p>
                        <p className="text-[10px] text-foreground/60 truncate mt-0.5">{item.targetProfile?.occupation}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateInterest(item.id, 'ACCEPTED')}
                        className="flex-1 sm:flex-initial h-9 px-4 rounded-xl gradient-bg text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateInterest(item.id, 'DECLINED')}
                        className="flex-1 sm:flex-initial h-9 px-4 rounded-xl border border-foreground/15 hover:bg-red-500/10 hover:text-red-500 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Connections (ACCEPTED) */}
          {acceptedList.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-primary/5">
              <h3 className="text-xs font-extrabold uppercase opacity-65 tracking-wider">Connected Matches (Chat Unlocked)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {acceptedList.map(item => (
                  <div key={item.id} className="glass-panel p-4 rounded-2xl border border-green-500/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-left min-w-0">
                      <img 
                        src={item.targetProfile?.profilePhoto || 'https://placehold.co/400x400/png?text=Photo'} 
                        alt={item.targetUser?.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate">{item.targetUser?.name}</h4>
                        <span className="text-[9px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full uppercase">Connected</span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/chat?partnerId=${item.targetUser?.id}`}
                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        
        // SENT INTERESTS LIST
        <div className="space-y-4">
          {sentList.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-60 border border-dashed border-primary/10 rounded-3xl">
              You haven't sent any interest requests yet. Start search profiles to connect!
            </div>
          ) : (
            sentList.map(item => (
              <div key={item.id} className="glass-panel p-4 rounded-3xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left min-w-0">
                  <img 
                    src={item.targetProfile?.profilePhoto || 'https://placehold.co/400x400/png?text=Photo'} 
                    alt={item.targetUser?.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">{item.targetUser?.name}</h4>
                    <p className="text-[10px] text-primary font-semibold">
                      {item.targetProfile?.religion} • {item.targetProfile?.caste} • {item.targetProfile?.dob ? getAge(item.targetProfile.dob) : 26} yrs
                    </p>
                    <p className="text-[10px] text-foreground/60 truncate mt-0.5">{item.targetProfile?.occupation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  
                  {/* Status Indicator */}
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    item.status === 'ACCEPTED'
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                      : item.status === 'DECLINED'
                      ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                      : 'bg-primary/10 text-primary border border-primary/20 animate-pulse'
                  }`}>
                    {item.status === 'SENT' ? 'Awaiting response' : item.status}
                  </span>

                  {item.status === 'SENT' ? (
                    <button
                      onClick={() => handleCancelInterest(item.id)}
                      className="p-2 rounded-xl border border-foreground/10 text-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Cancel Request"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  ) : item.status === 'ACCEPTED' ? (
                    <Link
                      href={`/dashboard/chat?partnerId=${item.targetUser?.id}`}
                      className="h-9 px-4 rounded-xl gradient-bg text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      Chat Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : null}

                </div>
              </div>
            ))
          )}
        </div>

      )}

    </div>
  );
}
