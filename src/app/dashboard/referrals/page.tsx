'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Gift, Users, Wallet, Share2, Mail, CheckCircle, 
  Copy, ArrowRight, ShieldCheck, Ticket, Calendar
} from 'lucide-react';

export default function ReferralHub() {
  const { user } = useAuth();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [inviteesCount, setInviteesCount] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  
  const [emailInput, setEmailInput] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals);
        setWalletBalance(data.walletBalance);
        setInviteesCount(data.inviteesCount);
        setReferralCode(data.referralCode);
      }
    } catch (err) {
      console.error("Referral fetch error", err);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setInviteStatus('SENDING');

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteeEmail: emailInput })
      });
      if (res.ok) {
        setInviteStatus('SUCCESS');
        await fetchReferrals();
        setTimeout(() => {
          setInviteStatus('IDLE');
          setEmailInput('');
        }, 2000);
      } else {
        setInviteStatus('IDLE');
        alert("Invitation failed. Please try again.");
      }
    } catch (err) {
      setInviteStatus('IDLE');
      console.error("Invite error", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    alert('Referral Code copied to clipboard!');
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" /> Referral Program
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">Invite Friends, Earn Rewards</h1>
          <p className="text-sm text-foreground/70">Help friends find their soulmates. Earn ₹500 credits and free Premium Membership days for every signup.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold opacity-60">Wallet Balance</span>
            <div className="text-2xl font-extrabold text-green-600">₹{walletBalance.toFixed(2)}</div>
          </div>
          <Wallet className="w-8 h-8 text-green-600" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold opacity-60">Friends Registered</span>
            <div className="text-2xl font-extrabold text-foreground">{inviteesCount} Invites</div>
          </div>
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold opacity-60">Redeemable Coupons</span>
            <div className="text-2xl font-extrabold text-foreground">2 Active</div>
          </div>
          <Ticket className="w-8 h-8 text-accent text-yellow-600" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Invite Code & Share Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-primary/10 space-y-5">
            <h3 className="text-base font-bold">Your Unique Invite Code</h3>
            
            <div className="flex gap-2">
              <div className="flex-1 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center font-extrabold text-primary text-sm tracking-wider">
                {referralCode || 'LOADING...'}
              </div>
              <button 
                onClick={copyToClipboard}
                className="w-12 h-12 rounded-xl border border-primary/20 hover:bg-primary/5 flex items-center justify-center text-primary cursor-pointer"
                title="Copy Code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 pt-4 border-t border-primary/10">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Invite Friends via Email
              </h3>

              {inviteStatus === 'SUCCESS' ? (
                <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Invitation email sent successfully!
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3.5 opacity-40 text-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="friend@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-primary/15 glass-input text-xs"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={inviteStatus === 'SENDING'}
                    className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                  >
                    {inviteStatus === 'SENDING' ? 'Sending Invite...' : 'Send Referral Email'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Right Side: Invite History */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-primary/10 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Invite History Log
            </h3>
            
            {referrals.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {referrals.map((ref) => (
                  <div key={ref.id} className="p-3 rounded-xl bg-primary/5 border border-primary/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold">{ref.inviteeId}</div>
                      <span className="text-[10px] opacity-60">Invited: {new Date(ref.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right leading-none">
                      <div className="text-green-600 font-bold">+₹{ref.rewardAmount}</div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 mt-1 inline-block uppercase">Credited</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs opacity-60 border border-dashed border-primary/10 rounded-xl">
                No active referrals yet. Share your code to start earning.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
