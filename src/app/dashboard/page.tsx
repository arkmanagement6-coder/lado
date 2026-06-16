'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Heart, Sparkles, AlertCircle, CheckCircle, Flame, 
  ArrowRight, ShieldCheck, HelpCircle, Eye, ThumbsUp, Star,
  Calendar, Users, DollarSign, Wallet, ShieldAlert, Award, FileText, Gift, Settings, ClipboardList
} from 'lucide-react';

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    newInterests: 0,
    visitors: 76,
    shortlistedCount: 14
  });
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [dailySuggestions, setDailySuggestions] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  
  // Custom states for different roles
  const [vendorLeads, setVendorLeads] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [franchiseStats, setFranchiseStats] = useState({
    walletBalance: 12500,
    inviteesCount: 24,
    commissionRate: 15,
    totalReferralsPaid: 8
  });
  const [pendingVerifications, setPendingVerifications] = useState([
    { id: 'user-1', name: 'Rohan Sharma', document: 'Aadhaar Card', docStatus: 'Pending Review' },
    { id: 'user-2', name: 'Priya Patel', document: 'Horoscope Chart', docStatus: 'Pending Verification' }
  ]);

  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch matches
        const matchesRes = await fetch('/api/matches');
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setAiMatches(matchesData.slice(0, 3)); // Top 3
          setDailySuggestions(matchesData.slice(3, 5)); // Next 2
          setStats(prev => ({ ...prev, totalMatches: matchesData.length }));
        }

        // 2. Fetch interests to count incoming SENT interests
        const interestsRes = await fetch('/api/interests');
        if (interestsRes.ok) {
          const interestsData = await interestsRes.json();
          const incomingUnread = interestsData.filter((i: any) => i.receiverId === user.id && i.status === 'SENT').length;
          setStats(prev => ({ ...prev, newInterests: incomingUnread }));
          
          const potentialRecentlyViewed = interestsData.map((i: any) => i.targetProfile).filter(Boolean);
          if (potentialRecentlyViewed.length > 0) {
            setRecentlyViewed(potentialRecentlyViewed.slice(0, 3));
          } else {
            // Fetch opposite gender profiles as fallback
            const profilesRes = await fetch(`/api/matches?gender=${profile?.gender === 'Bride' ? 'Groom' : 'Bride'}`);
            if (profilesRes.ok) {
              const profilesData = await profilesRes.json();
              setRecentlyViewed(profilesData.slice(5, 8));
            }
          }
        }

        // 3. Fetch meetings schedule
        const meetingsRes = await fetch('/api/meetings');
        if (meetingsRes.ok) {
          const data = await meetingsRes.json();
          setMeetings(data);
        }

        // 4. Fetch tickets if support
        if (user.role === 'SUPPORT') {
          const res = await fetch('/api/tickets');
          if (res.ok) {
            const data = await res.json();
            setTickets(data);
          }
        }

        // 5. Fetch referrals if franchise
        if (user.role === 'FRANCHISE_PARTNER') {
          const res = await fetch('/api/referrals');
          if (res.ok) {
            const data = await res.json();
            setFranchiseStats(prev => ({
              ...prev,
              walletBalance: data.walletBalance,
              inviteesCount: data.inviteesCount
            }));
          }
        }

        // 6. Mock vendor leads if vendor
        if (user.role === 'VENDOR') {
          setVendorLeads([
            { id: 'lead-1', userName: 'Rajesh Kumar', eventDate: '2026-11-23', notes: 'Needs premium wedding cinematography', status: 'PENDING' },
            { id: 'lead-2', userName: 'Sunita Sharma', eventDate: '2026-12-14', notes: 'HD Bridal makeup package inquiry', status: 'CONTACTED' }
          ]);
        }
      } catch (err) {
        console.error("Dashboard home data fetching failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // RENDER BLOCKS
  
  // 1. CUSTOMER DASHBOARD
  const renderCustomerDashboard = () => (
    <div className="space-y-8">
      {/* Analytics widgets row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
        <div className="col-span-2 glass-panel p-5 rounded-2xl flex items-center justify-between border border-primary/15">
          <div className="space-y-1.5">
            <span className="text-xs font-bold opacity-60">Profile Completeness</span>
            <div className="text-2xl font-extrabold text-foreground">{profile?.completionPercent || 10}%</div>
            {(profile?.completionPercent || 0) < 100 ? (
              <Link href="/dashboard/profile/edit" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                Complete Profile →
              </Link>
            ) : (
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">Profile 100% Done</span>
            )}
          </div>
          <div className="w-14 h-14 relative flex items-center justify-center rounded-full border border-primary/10 bg-primary/5">
            <Heart className="w-6 h-6 text-primary fill-primary/10" />
            <svg className="w-14 h-14 absolute inset-0 -rotate-90">
              <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(233, 30, 99, 0.1)" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="transparent" stroke="var(--primary)" strokeWidth="4" strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${2 * Math.PI * 24 * (1 - (profile?.completionPercent || 10) / 100)}`} />
            </svg>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-primary/10">
          <span className="text-xs font-bold opacity-60">Total Matches</span>
          <div className="text-2xl font-extrabold text-foreground mt-2">{stats.totalMatches}</div>
          <span className="text-[10px] text-green-600 font-semibold mt-1">Daily updates</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-primary/10">
          <span className="text-xs font-bold opacity-60">New Interests</span>
          <div className={`text-2xl font-extrabold mt-2 ${stats.newInterests > 0 ? 'text-primary animate-bounce' : 'text-foreground'}`}>
            {stats.newInterests}
          </div>
          <span className="text-[10px] opacity-60 mt-1">Awaiting approval</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-primary/10">
          <span className="text-xs font-bold opacity-60">Profile Visitors</span>
          <div className="text-2xl font-extrabold text-foreground mt-2">{stats.visitors}</div>
          <span className="text-[10px] text-green-600 font-semibold mt-1">↑ 12% this week</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-primary/10">
          <span className="text-xs font-bold opacity-60">Shortlisted</span>
          <div className="text-2xl font-extrabold text-foreground mt-2">{stats.shortlistedCount}</div>
          <span className="text-[10px] opacity-60 mt-1">Saved profiles</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Match Recommendations
            </h3>
            <Link href="/dashboard/matches" className="text-xs font-bold text-primary hover:underline">
              See All Matches
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {aiMatches.length > 0 ? (
              aiMatches.map((match: any) => (
                <div key={match.id} className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-primary/5 flex flex-col justify-between">
                  <div className="relative h-48 w-full bg-primary/5">
                    <img src={match.profilePhoto} alt={match.user?.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 right-2.5 bg-primary/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      {match.compatibility.score}% Match
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold truncate">{match.user?.name}</h4>
                      <p className="text-[10px] font-bold text-primary">{match.religion} • {match.caste}</p>
                      <p className="text-[10px] text-foreground/75 truncate mt-1">{match.occupation} in {match.city}</p>
                    </div>
                    <Link href={`/dashboard/matches?id=${match.id}`} className="w-full h-8 rounded-lg gradient-bg text-white text-[10px] font-bold flex items-center justify-center">
                      Connect Profile
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-10 text-center text-sm opacity-60">
                Complete your profile setup to fetch AI Recommendations.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary animate-pulse" /> Daily Match Suggestions
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {dailySuggestions.map((match: any) => (
                <div key={match.id} className="glass-panel p-4 rounded-2xl border border-primary/10 flex gap-4 items-center">
                  <img src={match.profilePhoto} alt={match.user?.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold truncate">{match.user?.name}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/25 text-black">{match.compatibility.score}% Match</span>
                    </div>
                    <p className="text-[10px] text-foreground/60">{match.religion} • {match.motherTongue} • {match.height}</p>
                    <p className="text-[10px] text-foreground/80 truncate">{match.occupation}</p>
                  </div>
                  <Link href={`/dashboard/matches?id=${match.id}`} className="p-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/5">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-primary/15 text-center space-y-4">
            <h4 className="text-xs font-bold opacity-60 uppercase tracking-wider">Subscription Tier</h4>
            <div className="space-y-1">
              <div className="text-xl font-extrabold text-foreground">Basic Member</div>
              <p className="text-[10px] text-foreground/65">Upgrade to unlock direct contact details and chat lines.</p>
            </div>
            <button onClick={() => router.push('/dashboard/membership')} className="w-full h-10 rounded-xl gradient-bg text-white text-xs font-bold shadow-md shadow-primary/20">
              Upgrade to Premium
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Eye className="w-4.5 h-4.5 text-primary" /> Recently Viewed
            </h3>
            <div className="space-y-3">
              {recentlyViewed.map((view: any) => (
                <Link key={view.id} href={`/dashboard/matches?id=${view.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-primary/5 hover:bg-primary/5 transition-all text-left">
                  <img src={view.profilePhoto} alt={view.user?.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0 leading-none">
                    <div className="text-xs font-bold truncate">{view.user?.name}</div>
                    <span className="text-[9px] text-foreground/50 mt-1 block">{view.occupation}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. PARENT DASHBOARD
  const renderParentDashboard = () => (
    <div className="space-y-8">
      {/* Child Summary Card */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase opacity-60">Child Account</span>
            <h4 className="text-sm font-extrabold">{profile?.gender === 'Groom' ? 'Son' : 'Daughter'}'s Profile</h4>
            <span className="text-xs text-primary font-bold">{user?.name}</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase opacity-60">Premium Tier</span>
            <h4 className="text-sm font-extrabold text-yellow-600">Active Membership</h4>
            <span className="text-xs opacity-65">Elite Plus Plan</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase opacity-60">Meetings Scheduled</span>
            <h4 className="text-sm font-extrabold">{meetings.length} Family Meets</h4>
            <span className="text-xs text-green-600 font-bold">1 Upcoming</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Parent Matches Control Room</h3>
            <Link href="/dashboard/matches" className="text-xs text-primary font-bold hover:underline">Browse All Matches</Link>
          </div>
          
          <div className="space-y-4">
            {aiMatches.map((m: any) => (
              <div key={m.id} className="glass-panel p-5 rounded-2xl border border-primary/10 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <img src={m.profilePhoto} alt={m.user?.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold">{m.user?.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.compatibility.score}% Match</span>
                  </div>
                  <p className="text-xs opacity-70">{m.religion} • {m.caste} • {m.motherTongue} • {m.city}</p>
                  <p className="text-xs text-foreground/80 truncate">Education: {m.highestQualification} • Occupation: {m.occupation}</p>
                </div>
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                  <button onClick={() => alert('Interest sent for child successfully')} className="px-4 py-2 rounded-xl gradient-bg text-white font-bold text-xs">
                    Send Interest
                  </button>
                  <button onClick={() => router.push(`/dashboard/matches?id=${m.id}`)} className="px-4 py-2 rounded-xl border border-primary/20 text-primary font-bold text-xs bg-white/50">
                    Astro Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-primary/10 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Family Scheduled Meets
            </h3>
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meet: any) => (
                  <div key={meet.id} className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>{meet.guestName}</span>
                      <span className="text-[10px] uppercase text-primary font-bold">{meet.meetingType}</span>
                    </div>
                    <div className="opacity-70">Date: {meet.scheduledAt}</div>
                    <div className="font-semibold text-green-600">Status: {meet.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs opacity-60">No family meetings scheduled yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 3. RELATIONSHIP MANAGER DASHBOARD
  const renderRMDashboard = () => (
    <div className="space-y-8">
      {/* RM Header */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Assigned Profiles</span>
          <div className="text-3xl font-extrabold text-primary mt-1">28</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Pending Meetings</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{meetings.filter(m => m.status === 'PENDING').length}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Success Rate</span>
          <div className="text-3xl font-extrabold text-green-600 mt-1">94%</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Completed Rites</span>
          <div className="text-3xl font-extrabold text-accent mt-1">12</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Active Clients Directory
            </h3>
            <button onClick={() => alert('Add new client profile')} className="text-xs text-primary font-bold hover:underline">+ Add Client</button>
          </div>
          
          <div className="glass-panel rounded-2xl overflow-hidden border border-primary/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-primary/5 font-bold border-b border-primary/10">
                <tr>
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Assigned Date</th>
                  <th className="p-3">Preferences</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingVerifications.map((client) => (
                  <tr key={client.id} className="border-b border-primary/5 hover:bg-primary/5/10">
                    <td className="p-3 font-bold">{client.name}</td>
                    <td className="p-3 opacity-70">2026-06-12</td>
                    <td className="p-3 opacity-70">MBA, Delhi/Mumbai</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-bold">{client.docStatus}</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => alert('Recommend profile matching')} className="text-primary font-bold hover:underline">Recommend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-primary/10 space-y-4">
            <h3 className="text-base font-bold">RM Scheduler Calendar</h3>
            <button onClick={() => alert('Calendar booking dialog')} className="w-full h-10 rounded-xl border border-primary/20 text-primary font-bold text-xs hover:bg-primary/5">
              + Arrange Match Meeting
            </button>
            <div className="space-y-3 text-xs">
              {meetings.map((meet: any) => (
                <div key={meet.id} className="p-3 rounded-xl bg-background border border-primary/10 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Client: {meet.hostName}</span>
                    <span className="text-primary">{meet.meetingType}</span>
                  </div>
                  <div className="opacity-70">Date/Time: {meet.scheduledAt}</div>
                  <div className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded w-max">RM Assured</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. VENDOR DASHBOARD
  const renderVendorDashboard = () => (
    <div className="space-y-8">
      {/* Vendor Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold opacity-60">Customer Leads</span>
            <div className="text-2xl font-extrabold text-foreground">{vendorLeads.length} Leads</div>
          </div>
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold opacity-60">Earnings (June)</span>
            <div className="text-2xl font-extrabold text-green-600">₹45,000</div>
          </div>
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold opacity-60">Marketplace Rating</span>
            <div className="text-2xl font-extrabold text-foreground">4.9 / 5.0</div>
          </div>
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold opacity-60">Service Category</span>
            <div className="text-base font-extrabold text-foreground uppercase tracking-wider">Photography</div>
          </div>
          <Award className="w-8 h-8 text-accent" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-bold">Booking Inquiry Leads</h3>
          <div className="space-y-4">
            {vendorLeads.map((lead) => (
              <div key={lead.id} className="glass-panel p-5 rounded-2xl border border-primary/10 flex justify-between items-center">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{lead.userName}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">{lead.status}</span>
                  </div>
                  <p className="opacity-70">Event Date: {lead.eventDate}</p>
                  <p className="italic opacity-85">" {lead.notes} "</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => alert('Contacting lead details')} className="px-4 py-2 rounded-xl gradient-bg text-white font-bold text-xs">
                    Contact Client
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-primary/10 space-y-4 text-xs">
            <h3 className="text-base font-bold">Configure My Offerings</h3>
            <p className="opacity-75">Update your wedding packages pricing details, booking availability and services catalog.</p>
            <button onClick={() => router.push('/dashboard/profile')} className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs">
              Edit Marketplace Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. SUPPORT EXECUTIVE DASHBOARD
  const renderSupportDashboard = () => (
    <div className="space-y-8">
      {/* Support Executive Header */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase opacity-65">Unresolved Tickets</span>
            <div className="text-3xl font-extrabold text-primary">{tickets.filter(t => t.status !== 'RESOLVED').length || 1}</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase opacity-65">Pending Verifications</span>
            <div className="text-3xl font-extrabold text-foreground">{pendingVerifications.length}</div>
          </div>
          <FileText className="w-8 h-8 text-foreground" />
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase opacity-65">Avg Resolution Time</span>
            <div className="text-3xl font-extrabold text-green-600">45 Mins</div>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <h3 className="text-lg font-bold">Support Tickets Queue</h3>
          <div className="space-y-4">
            {tickets.length > 0 ? (
              tickets.map((t) => (
                <div key={t.id} className="glass-panel p-5 rounded-2xl border border-primary/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">{t.subject}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.priority === 'HIGH' ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-500'}`}>{t.priority} Priority</span>
                  </div>
                  <p className="opacity-70">Category: {t.category} • Status: {t.status}</p>
                  <p className="opacity-90">{t.description}</p>
                  <button onClick={() => alert('Ticket marked resolved')} className="text-green-600 font-bold hover:underline">Mark Resolved</button>
                </div>
              ))
            ) : (
              <div className="p-5 rounded-2xl bg-primary/5 text-center text-xs opacity-60">No unresolved tickets in queue.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <h3 className="text-lg font-bold">Verification Approvals Panel</h3>
          <div className="space-y-4">
            {pendingVerifications.map((item) => (
              <div key={item.id} className="glass-panel p-5 rounded-2xl border border-primary/10 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="opacity-70">Submitted: {item.document}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => alert('Document Approved!')} className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-bold text-[10px]">
                    Approve
                  </button>
                  <button onClick={() => alert('Document Rejected!')} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-600 font-bold text-[10px]">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 6. FRANCHISE PARTNER DASHBOARD
  const renderFranchiseDashboard = () => (
    <div className="space-y-8">
      {/* Franchise Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Commission Wallet</span>
          <div className="text-3xl font-extrabold text-green-600 mt-1">₹{franchiseStats.walletBalance}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Total Referrals</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{franchiseStats.inviteesCount} Members</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Commission Rate</span>
          <div className="text-3xl font-extrabold text-primary mt-1">{franchiseStats.commissionRate}%</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-center">
          <span className="text-[10px] font-bold uppercase opacity-65">Referral Reward Payouts</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{franchiseStats.totalReferralsPaid}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> Franchise Signups Log
          </h3>
          <div className="glass-panel rounded-2xl overflow-hidden border border-primary/10 text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary/5 font-bold border-b border-primary/10">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Signed Up Date</th>
                  <th className="p-3">Plan Subscribed</th>
                  <th className="p-3">Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-primary/5 hover:bg-primary/5">
                  <td className="p-3 font-bold">FR-0982-A</td>
                  <td className="p-3 opacity-70">2026-06-15</td>
                  <td className="p-3 text-primary font-bold">Premium Tier</td>
                  <td className="p-3 text-green-600 font-bold">₹1,500.00</td>
                </tr>
                <tr className="border-b border-primary/5 hover:bg-primary/5">
                  <td className="p-3 font-bold">FR-0977-B</td>
                  <td className="p-3 opacity-70">2026-06-14</td>
                  <td className="p-3 text-yellow-600 font-bold">Elite Tier</td>
                  <td className="p-3 text-green-600 font-bold">₹3,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-primary/10 text-xs space-y-4">
            <h3 className="text-base font-bold">Franchise Invite Link</h3>
            <p className="opacity-75">Share this invite code with prospective members to credit commission directly to your wallet.</p>
            <div className="p-3 bg-primary/5 rounded-xl text-center font-extrabold text-primary border border-primary/10">
              LADO-FRANCHISE-2026
            </div>
            <button onClick={() => alert('Franchise link copied!')} className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs">
              Copy Invite Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Welcome Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Welcome back
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">Namaste, {user?.name}!</h1>
          <p className="text-sm text-foreground/70">
            {user?.role === 'CUSTOMER' ? 'Here is a quick look at your profile compatibility matches today.' : `Exposing ${user?.role} Workspace dashboard analytics.`}
          </p>
        </div>

        {user?.role === 'CUSTOMER' && (
          <Link 
            href="/dashboard/membership"
            className="px-6 h-12 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-2 hover:opacity-95 transition-all shadow-md shadow-primary/20 shrink-0 self-stretch sm:self-auto text-center justify-center cursor-pointer"
          >
            Upgrade to Premium <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* RENDER CONDITIONAL BODY */}
      {user?.role === 'PARENT' && renderParentDashboard()}
      {user?.role === 'RELATIONSHIP_MANAGER' && renderRMDashboard()}
      {user?.role === 'VENDOR' && renderVendorDashboard()}
      {user?.role === 'SUPPORT' && renderSupportDashboard()}
      {user?.role === 'FRANCHISE_PARTNER' && renderFranchiseDashboard()}
      {(user?.role === 'CUSTOMER' || user?.role === 'PREMIUM' || user?.role === 'ADMIN') && renderCustomerDashboard()}

    </div>
  );
}
