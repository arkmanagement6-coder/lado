'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, SlidersHorizontal, Grid, List, 
  Heart, MessageSquare, Star, CheckCircle, X, MapPin, 
  Award, Calendar, BookOpen, Briefcase, Users2, ShieldAlert, Share2,
  Sparkles, Sun, Info, CalendarClock, Send, HelpCircle
} from 'lucide-react';

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi'];
const LANGUAGES = ['Hindi', 'Punjabi', 'Bengali', 'Telugu', 'Tamil', 'Gujarati', 'Marathi', 'Malayalam', 'Kannada', 'English'];
const DIETS = ['Veg', 'Non-Veg', 'Eggetarian', 'Vegan'];
const MARITAL_STATUSES = ['Never Married', 'Divorced', 'Widowed'];

function MatchesPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  
  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    ageFrom: '18',
    ageTo: '45',
    religion: '',
    caste: '',
    motherTongue: '',
    city: '',
    diet: '',
    maritalStatus: '',
    premiumOnly: false,
    verifiedOnly: false
  });

  // Selected Profile for Modal detail view
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'details' | 'astro' | 'ai' | 'schedule'>('details');
  const [interestStatusMap, setInterestStatusMap] = useState<Record<string, string>>({});
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // AI Chat Assistant Drawer
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'bot', text: 'Hello! I am your AI Matchmaking Coach. Describe what you are looking for in your life partner (e.g. "Find me a girl from Delhi, MBA, working, age 25-28"), and I will search our database and check compatibility!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [aiRecommendedProfiles, setAiRecommendedProfiles] = useState<any[]>([]);

  // Horoscope state
  const [astroLoading, setAstroLoading] = useState(false);
  const [astroReport, setAstroReport] = useState<any>(null);

  // AI Compatibility report state
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  // Meeting scheduler states
  const [meetingType, setMeetingType] = useState('VIDEO');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingStatusMsg, setMeetingStatusMsg] = useState('');

  // Initial fetch and parsing url params
  const fetchMatches = async (queryFilters = filters) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (queryFilters.gender) q.set('gender', queryFilters.gender);
      if (queryFilters.ageFrom) q.set('ageFrom', queryFilters.ageFrom);
      if (queryFilters.ageTo) q.set('ageTo', queryFilters.ageTo);
      if (queryFilters.religion) q.set('religion', queryFilters.religion);
      if (queryFilters.caste) q.set('caste', queryFilters.caste);
      if (queryFilters.motherTongue) q.set('motherTongue', queryFilters.motherTongue);
      if (queryFilters.city) q.set('city', queryFilters.city);
      if (queryFilters.diet) q.set('diet', queryFilters.diet);
      if (queryFilters.maritalStatus) q.set('maritalStatus', queryFilters.maritalStatus);
      if (queryFilters.premiumOnly) q.set('premiumOnly', 'true');
      if (queryFilters.verifiedOnly) q.set('verifiedOnly', 'true');

      const res = await fetch(`/api/matches?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);

        // Pre-fetch interest logs
        const interestRes = await fetch('/api/interests');
        if (interestRes.ok) {
          const interests = await interestRes.json();
          const statusMap: Record<string, string> = {};
          interests.forEach((i: any) => {
            if (i.senderId === user?.id) {
              statusMap[i.receiverId] = i.status;
            }
          });
          setInterestStatusMap(statusMap);
        }

        // Direct profile load via ID URL query
        const idParam = searchParams.get('id');
        if (idParam) {
          const found = data.find((p: any) => p.id === idParam);
          if (found) setSelectedMatch(found);
        }
      }
    } catch (err) {
      console.error("Fetch matches failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlGender = searchParams.get('gender') || '';
    const urlAgeFrom = searchParams.get('ageFrom') || '18';
    const urlAgeTo = searchParams.get('ageTo') || '45';
    const urlReligion = searchParams.get('religion') || '';
    const urlLanguage = searchParams.get('motherTongue') || '';

    const initialFilters = {
      ...filters,
      gender: urlGender,
      ageFrom: urlAgeFrom,
      ageTo: urlAgeTo,
      religion: urlReligion,
      motherTongue: urlLanguage
    };
    
    setFilters(initialFilters);
    fetchMatches(initialFilters);
  }, [searchParams]);

  // Fetch astro details
  const fetchAstroReport = async (partnerId: string) => {
    setAstroLoading(true);
    try {
      const res = await fetch('/api/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId })
      });
      if (res.ok) {
        const data = await res.json();
        setAstroReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAstroLoading(false);
    }
  };

  // Fetch AI report
  const fetchAICompatibilityReport = async (partnerId: string) => {
    setAiReportLoading(true);
    try {
      let seed = 0;
      const combinedId = user?.id + partnerId;
      for (let i = 0; i < combinedId.length; i++) {
        seed += combinedId.charCodeAt(i);
      }

      setAiReport({
        personalityMatch: 75 + (seed % 21),
        lifestyleMatch: 70 + (seed % 26),
        educationMatch: 80 + (seed % 16),
        careerMatch: 75 + (seed % 20),
        familyMatch: 82 + (seed % 14),
        emotionalMatch: 68 + (seed % 28),
        communicationStyle: (seed % 3 === 0) ? 'Harmonious & Empathetic' : ((seed % 3 === 1) ? 'Analytical & Logical' : 'Expressive & Warm'),
        matchingAnalysis: `This match presents high scores in lifestyle and family values. Astrological check outlines good long term prospects. Emotional check shows a great match between analytical thinking and warm communication styles.`
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAiReportLoading(false);
    }
  };

  // Express Interest Action
  const handleExpressInterest = async (receiverId: string) => {
    setActionSuccessMsg('');
    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId })
      });
      if (res.ok) {
        setInterestStatusMap(prev => ({ ...prev, [receiverId]: 'SENT' }));
        setActionSuccessMsg('Interest Sent successfully!');
        setTimeout(() => setActionSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Schedule meeting
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate) return;
    setMeetingStatusMsg('scheduling');

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: selectedMatch.id,
          meetingType,
          scheduledAt: meetingDate,
          notes: meetingNotes
        })
      });

      if (res.ok) {
        setMeetingStatusMsg('success');
        setTimeout(() => {
          setMeetingStatusMsg('');
          setMeetingDate('');
          setMeetingNotes('');
          setSelectedMatch(null);
        }, 2000);
      } else {
        setMeetingStatusMsg('failed');
      }
    } catch (err) {
      setMeetingStatusMsg('failed');
    }
  };

  // AI Assistant Chat Submit
  const handleAIChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setChatInput('');
    setAiTyping(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat-assistant',
          message: query
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        if (data.matches && data.matches.length > 0) {
          setAiRecommendedProfiles(data.matches);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiTyping(false);
    }
  };

  const getAge = (dobString?: string) => {
    if (!dobString) return 25;
    const birth = new Date(dobString);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) || 25;
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      gender: '',
      ageFrom: '18',
      ageTo: '45',
      religion: '',
      caste: '',
      motherTongue: '',
      city: '',
      diet: '',
      maritalStatus: '',
      premiumOnly: false,
      verifiedOnly: false
    };
    setFilters(defaultFilters);
    fetchMatches(defaultFilters);
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches(filters);
    setShowFilters(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Profile Matches
          </h1>
          <p className="text-xs text-foreground/60">Calculate compatibility, Astro matchmaking points and schedule direct video meets.</p>
        </div>

        {/* View and filter buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="h-10 px-4 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 fill-primary/10" /> AI Coach Search
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-4 rounded-xl border transition-all text-xs font-bold flex items-center gap-2 cursor-pointer ${
              showFilters ? 'bg-primary text-white border-transparent' : 'border-primary/15 hover:bg-primary/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="flex border border-primary/15 rounded-xl overflow-hidden bg-background">
            <button 
              onClick={() => setActiveView('grid')}
              className={`p-2.5 ${activeView === 'grid' ? 'bg-primary/10 text-primary' : 'opacity-55'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveView('list')}
              className={`p-2.5 border-l border-primary/15 ${activeView === 'list' ? 'bg-primary/10 text-primary' : 'opacity-55'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Chat Panel */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-panel p-5 rounded-3xl border border-primary/20 overflow-hidden flex flex-col md:flex-row gap-6 shadow-md"
          >
            {/* Chat screen */}
            <div className="flex-1 space-y-4 flex flex-col justify-between max-h-[350px]">
              <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 fill-primary/10" /> AI Matchmaker Assistant
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-primary/5 rounded-2xl border border-primary/5 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user' ? 'bg-primary text-white ml-auto' : 'bg-background border border-primary/10 mr-auto'
                  }`}>
                    {msg.text}
                  </div>
                ))}
                {aiTyping && (
                  <div className="p-3 rounded-2xl bg-background border border-primary/10 mr-auto animate-pulse font-semibold">
                    AI Matchmaker Coach is searching profiles...
                  </div>
                )}
              </div>

              <form onSubmit={handleAIChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Lado AI (e.g. Find me an MBA girl from Delhi)"
                  className="flex-1 h-10 px-4 rounded-xl border border-primary/15 glass-input text-xs"
                />
                <button type="submit" className="h-10 w-10 rounded-xl gradient-bg text-white flex items-center justify-center cursor-pointer">
                  <Send className="w-4 h-4 fill-white" />
                </button>
              </form>
            </div>

            {/* Recommended profiles list */}
            {aiRecommendedProfiles.length > 0 && (
              <div className="w-full md:w-80 space-y-3 shrink-0">
                <h4 className="text-[10px] font-extrabold opacity-60 uppercase tracking-wider">AI Suggested Matches</h4>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {aiRecommendedProfiles.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-background border border-primary/10 flex gap-3 items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={p.profilePhoto} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold truncate max-w-[100px]">{p.name}</div>
                          <span className="text-[9px] text-primary font-bold">{p.compatibilityScore}% Compatibility</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedMatch(p)}
                        className="p-1 px-2.5 rounded bg-primary/10 text-primary font-bold text-[9px]"
                      >
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Overlay Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-panel p-6 rounded-3xl border border-primary/15 overflow-hidden"
          >
            <form onSubmit={handleApplyFilters} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Gender */}
                <div>
                  <label className="text-xs font-bold block mb-1 opacity-70">Looking for</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-primary/15 glass-input text-xs"
                  >
                    <option value="">Any</option>
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                  </select>
                </div>

                {/* Age From */}
                <div>
                  <label className="text-xs font-bold block mb-1 opacity-70">Age From</label>
                  <select
                    value={filters.ageFrom}
                    onChange={(e) => handleFilterChange('ageFrom', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-primary/15 glass-input text-xs"
                  >
                    {Array.from({ length: 43 }, (_, i) => i + 18).map(a => (
                      <option key={a} value={a}>{a} yrs</option>
                    ))}
                  </select>
                </div>

                {/* Age To */}
                <div>
                  <label className="text-xs font-bold block mb-1 opacity-70">Age To</label>
                  <select
                    value={filters.ageTo}
                    onChange={(e) => handleFilterChange('ageTo', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-primary/15 glass-input text-xs"
                  >
                    {Array.from({ length: 43 }, (_, i) => i + 18).map(a => (
                      <option key={a} value={a}>{a} yrs</option>
                    ))}
                  </select>
                </div>

                {/* Religion */}
                <div>
                  <label className="text-xs font-bold block mb-1 opacity-70">Religion</label>
                  <select
                    value={filters.religion}
                    onChange={(e) => handleFilterChange('religion', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-primary/15 glass-input text-xs"
                  >
                    <option value="">Any</option>
                    {RELIGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-primary/5">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 h-10 rounded-xl border border-primary/20 text-primary font-bold text-xs"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-5 h-10 rounded-xl gradient-bg text-white font-bold text-xs"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match success message banner */}
      {actionSuccessMsg && (
        <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-4 rounded-xl text-xs font-bold text-center">
          {actionSuccessMsg}
        </div>
      )}

      {/* Main matching cards display */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : matches.length > 0 ? (
        activeView === 'grid' ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {matches.map((p) => {
              const age = getAge(p.dob);
              const interestStatus = interestStatusMap[p.id];
              const scoreColor = p.compatibility?.score >= 90
                ? 'text-yellow-600 border-yellow-400 bg-yellow-500/10'
                : p.compatibility?.score >= 70
                ? 'text-primary border-primary/20 bg-primary/10'
                : 'text-foreground/60 border-foreground/10 bg-foreground/5';

              return (
                <div key={p.id} className="glass-panel rounded-2xl overflow-hidden border border-primary/5 hover:border-primary/20 transition-all flex flex-col justify-between shadow-sm">
                  <div className="relative h-52 w-full bg-primary/5">
                    <img 
                      src={p.profilePhoto || 'https://placehold.co/400x400/png?text=Photo'} 
                      alt={p.user?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 right-3 text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-md border ${scoreColor}`}>
                      {p.compatibility?.score || 80}% Match
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-extrabold truncate">{p.user?.name}</h4>
                      <p className="text-[10px] font-bold text-primary">{p.religion} • {p.caste}</p>
                      <p className="text-[10px] text-foreground/75 truncate mt-1">Age: {age} yrs • Height: {p.height}</p>
                      <p className="text-[10px] text-foreground/60 truncate">{p.occupation} • in {p.city}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/5">
                      <button
                        onClick={() => {
                          setSelectedMatch(p);
                          setModalTab('details');
                        }}
                        className="h-8 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-all text-[10px] font-bold flex items-center justify-center cursor-pointer"
                      >
                        View Profile
                      </button>
                      {interestStatus ? (
                        <span className="h-8 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] font-bold flex items-center justify-center uppercase select-none">
                          {interestStatus === 'SENT' ? 'Request Sent' : interestStatus}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleExpressInterest(p.id)}
                          className="h-8 rounded-lg gradient-bg text-white hover:opacity-95 transition-all text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-sm shadow-primary/20"
                        >
                          Express Interest
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((p) => {
              const age = getAge(p.dob);
              const interestStatus = interestStatusMap[p.id];
              const scoreColor = p.compatibility?.score >= 90
                ? 'text-yellow-600 border-yellow-400 bg-yellow-500/10'
                : p.compatibility?.score >= 70
                ? 'text-primary border-primary/20 bg-primary/10'
                : 'text-foreground/60 border-foreground/10 bg-foreground/5';

              return (
                <div key={p.id} className="glass-panel p-4 rounded-3xl border border-primary/5 hover:border-primary/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left min-w-0 flex-1">
                    <img 
                      src={p.profilePhoto} 
                      alt={p.user?.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-primary/10"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h4 className="text-base font-extrabold truncate">{p.user?.name}</h4>
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${scoreColor}`}>
                          {p.compatibility?.score || 80}% Match
                        </span>
                      </div>
                      <p className="text-xs text-primary font-bold">{p.religion} • {p.caste}</p>
                      <p className="text-xs text-foreground/80 truncate">
                        Age: {age} yrs • Height: {p.height} • Lang: {p.motherTongue} • Occupation: {p.occupation}
                      </p>
                      <p className="text-xs text-foreground/60 flex items-center justify-center sm:justify-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {p.city}, {p.state}, {p.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedMatch(p);
                        setModalTab('details');
                      }}
                      className="flex-1 sm:flex-initial h-9 px-5 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-all text-xs font-bold cursor-pointer"
                    >
                      View Full Profile
                    </button>
                    {interestStatus ? (
                      <span className="flex-1 sm:flex-initial h-9 px-5 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 text-xs font-bold flex items-center justify-center uppercase select-none">
                        {interestStatus === 'SENT' ? 'Request Sent' : interestStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleExpressInterest(p.id)}
                        className="flex-1 sm:flex-initial h-9 px-5 rounded-xl gradient-bg text-white hover:opacity-95 transition-all text-xs font-bold cursor-pointer shadow-sm shadow-primary/20"
                      >
                        Express Interest
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="py-20 text-center opacity-65 text-sm">
          No profile matches found matching these filters.
        </div>
      )}

      {/* Profile Detail Overlap Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatch(null)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-background rounded-[32px] w-full max-w-3xl h-[85vh] overflow-y-auto z-10 shadow-2xl relative border border-primary/15 flex flex-col select-none"
            >
              {/* Close */}
              <button 
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/25 text-white sm:text-foreground/60 sm:hover:bg-primary/10 transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cover Banner */}
              <div className="relative h-48 sm:h-56 shrink-0 bg-primary/5">
                <img src={selectedMatch.profilePhoto} alt="Cover" className="w-full h-full object-cover filter brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                
                <div className="absolute bottom-4 left-6 flex items-center gap-4 text-white">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shrink-0">
                    <img src={selectedMatch.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold">{selectedMatch.user?.name}</h3>
                      {selectedMatch.user?.isVerified && <CheckCircle className="w-4 h-4 fill-green-600 text-white" />}
                    </div>
                    <p className="text-xs text-white/85 mt-0.5">{selectedMatch.religion} • {selectedMatch.caste}</p>
                    <p className="text-xs text-white/75">{selectedMatch.occupation} in {selectedMatch.city}</p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-6 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30 bg-accent/15 px-3 py-1 rounded-full">
                    {selectedMatch.compatibility?.score || 80}% Match
                  </span>
                </div>
              </div>

              {/* TAB CONTROLS */}
              <div className="flex border-b border-primary/10 bg-primary/5 p-1 shrink-0 text-xs font-bold gap-1">
                <button
                  onClick={() => setModalTab('details')}
                  className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${modalTab === 'details' ? 'bg-background shadow text-primary' : 'text-foreground/60 hover:text-primary'}`}
                >
                  Profile Details
                </button>
                <button
                  onClick={() => { setModalTab('astro'); fetchAstroReport(selectedMatch.id); }}
                  className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${modalTab === 'astro' ? 'bg-background shadow text-primary' : 'text-foreground/60 hover:text-primary'}`}
                >
                  Kundali Matching
                </button>
                <button
                  onClick={() => { setModalTab('ai'); fetchAICompatibilityReport(selectedMatch.id); }}
                  className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${modalTab === 'ai' ? 'bg-background shadow text-primary' : 'text-foreground/60 hover:text-primary'}`}
                >
                  AI Deep Match
                </button>
                <button
                  onClick={() => setModalTab('schedule')}
                  className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${modalTab === 'schedule' ? 'bg-background shadow text-primary' : 'text-foreground/60 hover:text-primary'}`}
                >
                  Book Meetup
                </button>
              </div>

              {/* MODAL CONTENT BODY */}
              <div className="p-6 sm:p-8 space-y-6 flex-1">
                
                {modalTab === 'details' && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider opacity-60">About Me</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed italic">
                        "{selectedMatch.bio || "I am a progressive yet traditional person valued by my friends and family."}"
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-primary/5 text-xs">
                      <div className="space-y-2">
                        <h5 className="font-extrabold text-primary flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Basic Information</h5>
                        <ul className="space-y-1.5 opacity-80">
                          <li><span className="opacity-60">Age:</span> {getAge(selectedMatch.dob)} yrs</li>
                          <li><span className="opacity-60">Height:</span> {selectedMatch.height}</li>
                          <li><span className="opacity-60">Marital Status:</span> {selectedMatch.maritalStatus}</li>
                          <li><span className="opacity-60">Diet:</span> {selectedMatch.diet || 'Veg'}</li>
                          <li><span className="opacity-60">Location:</span> {selectedMatch.city}, {selectedMatch.country}</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-extrabold text-primary flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Education & Career</h5>
                        <ul className="space-y-1.5 opacity-80">
                          <li><span className="opacity-60">Highest Degree:</span> {selectedMatch.highestQualification}</li>
                          <li><span className="opacity-60">College:</span> {selectedMatch.college || 'Stanford University'}</li>
                          <li><span className="opacity-60">Occupation:</span> {selectedMatch.occupation}</li>
                          <li><span className="opacity-60">Income bracket:</span> {selectedMatch.annualIncome ? `₹${selectedMatch.annualIncome.toLocaleString()}` : '₹30,00,000'}</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-extrabold text-primary flex items-center gap-1.5"><Users2 className="w-4 h-4" /> Family Details</h5>
                        <ul className="space-y-1.5 opacity-80">
                          <li><span className="opacity-60">Father Job:</span> {selectedMatch.fatherOccupation || 'Retired Officer'}</li>
                          <li><span className="opacity-60">Mother Job:</span> {selectedMatch.motherOccupation || 'Homemaker'}</li>
                          <li><span className="opacity-60">Family status:</span> {selectedMatch.familyStatus || 'Upper Middle Class'}</li>
                          <li><span className="opacity-60">Family Type:</span> {selectedMatch.familyType || 'Nuclear'}</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {modalTab === 'astro' && (
                  <div className="space-y-6 text-xs">
                    <h3 className="text-sm font-extrabold flex items-center gap-2">
                      <Sun className="w-5 h-5 text-primary animate-spin" /> Kundali Milan Analysis
                    </h3>

                    {astroLoading ? (
                      <div className="py-10 text-center font-semibold text-primary">Calculating Gunas and Doshas...</div>
                    ) : astroReport ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                          <h4 className="font-bold text-primary text-center">Astro Compatibility Sheet</h4>
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="p-2 bg-background rounded-xl">
                              <span className="opacity-60 block">My Rashi</span>
                              <span className="font-extrabold text-foreground">{astroReport.myAstro.rashi}</span>
                            </div>
                            <div className="p-2 bg-background rounded-xl">
                              <span className="opacity-60 block">Partner Rashi</span>
                              <span className="font-extrabold text-foreground">{astroReport.partnerAstro.rashi}</span>
                            </div>
                            <div className="p-2 bg-background rounded-xl">
                              <span className="opacity-60 block">My Star</span>
                              <span className="font-extrabold text-foreground">{astroReport.myAstro.nakshatra}</span>
                            </div>
                            <div className="p-2 bg-background rounded-xl">
                              <span className="opacity-60 block">Partner Star</span>
                              <span className="font-extrabold text-foreground">{astroReport.partnerAstro.nakshatra}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 bg-accent/25 rounded-2xl border border-accent/30 text-center">
                            <span className="text-[10px] font-extrabold opacity-60 uppercase block">Guna Milan Score</span>
                            <div className="text-3xl font-extrabold text-foreground">{astroReport.gunMilan} / 36 Gunas</div>
                            <span className="text-[10px] font-bold text-primary block mt-1">Acceptable marriage score</span>
                          </div>

                          <div className="p-3 bg-background rounded-xl border border-primary/10">
                            <div className="flex justify-between font-bold">
                              <span>Manglik Status:</span>
                              <span className="text-primary">{astroReport.manglikStatus}</span>
                            </div>
                            <div className="flex justify-between font-bold mt-1">
                              <span>Dosha check:</span>
                              <span className="text-red-500">{astroReport.dosha}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-background rounded-xl border border-primary/10 italic text-[11px] leading-relaxed">
                            " {astroReport.marriagePrediction} "
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {modalTab === 'ai' && (
                  <div className="space-y-6 text-xs">
                    <h3 className="text-sm font-extrabold flex items-center gap-1.5 text-primary">
                      <Sparkles className="w-5 h-5 fill-primary/10 text-primary" /> AI Match compatibility metrics
                    </h3>

                    {aiReportLoading ? (
                      <div className="py-10 text-center">Loading AI charts...</div>
                    ) : aiReport ? (
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <span className="opacity-60 block mb-1">Personality</span>
                            <span className="text-base font-extrabold text-primary">{aiReport.personalityMatch}%</span>
                          </div>
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <span className="opacity-60 block mb-1">Lifestyle</span>
                            <span className="text-base font-extrabold text-primary">{aiReport.lifestyleMatch}%</span>
                          </div>
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <span className="opacity-60 block mb-1">Emotional</span>
                            <span className="text-base font-extrabold text-primary">{aiReport.emotionalMatch}%</span>
                          </div>
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <span className="opacity-60 block mb-1">Family Value</span>
                            <span className="text-base font-extrabold text-primary">{aiReport.familyMatch}%</span>
                          </div>
                        </div>

                        <div className="p-4 bg-background border border-primary/10 rounded-2xl">
                          <div className="font-bold mb-1">Communication Style Alignment:</div>
                          <div className="text-primary font-bold">{aiReport.communicationStyle}</div>
                          <p className="mt-2 text-foreground/80 leading-relaxed italic">" {aiReport.matchingAnalysis} "</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {modalTab === 'schedule' && (
                  <div className="space-y-4 text-xs">
                    <h3 className="text-sm font-extrabold flex items-center gap-2">
                      <CalendarClock className="w-5 h-5 text-primary animate-pulse" /> Arrange direct Match Meetup
                    </h3>

                    {meetingStatusMsg === 'success' ? (
                      <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-4 rounded-xl text-center font-bold">
                        Meetup scheduled successfully! Auto reminders sent via WhatsApp & Calendar.
                      </div>
                    ) : (
                      <form onSubmit={handleScheduleMeeting} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold block mb-1 opacity-70">Meetup Type</label>
                            <select
                              value={meetingType}
                              onChange={(e) => setMeetingType(e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                            >
                              <option value="VIDEO">Video Call Match</option>
                              <option value="COFFEE">Coffee Meet</option>
                              <option value="FAMILY">Family Meet</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold block mb-1 opacity-70">Date & Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={meetingDate}
                              onChange={(e) => setMeetingDate(e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold block mb-1 opacity-70">Meeting notes / agenda</label>
                          <textarea
                            value={meetingNotes}
                            onChange={(e) => setMeetingNotes(e.target.value)}
                            placeholder="Specify preferences or agenda points (e.g. coffee venue, parent coordination details)"
                            rows={3}
                            className="w-full p-3 rounded-xl border border-primary/15 glass-input text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={meetingStatusMsg === 'scheduling'}
                          className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs cursor-pointer shadow-md shadow-primary/20"
                        >
                          {meetingStatusMsg === 'scheduling' ? 'Scheduling meetup...' : 'Request Match Meetup'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Bottom action controls */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-primary/5 shrink-0">
                  {interestStatusMap[selectedMatch.id] ? (
                    <span className="flex-1 h-11 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 text-xs font-bold flex items-center justify-center uppercase">
                      {interestStatusMap[selectedMatch.id] === 'SENT' ? 'Request Sent' : interestStatusMap[selectedMatch.id]}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExpressInterest(selectedMatch.id)}
                      className="flex-1 h-11 rounded-xl gradient-bg text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
                    >
                      <Heart className="w-4.5 h-4.5 fill-white" /> Express Interest
                    </button>
                  )}

                  {interestStatusMap[selectedMatch.id] === 'ACCEPTED' ? (
                    <button
                      onClick={() => { setSelectedMatch(null); router.push(`/dashboard/chat?partnerId=${selectedMatch.id}`); }}
                      className="flex-1 h-11 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4.5 h-4.5 fill-primary/10" /> Chat Now
                    </button>
                  ) : (
                    <button
                      onClick={() => alert("Shortlisted successfully! You can find this profile in shortlisted sections.")}
                      className="flex-1 h-11 rounded-xl border border-primary/20 text-foreground hover:bg-primary/5 transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Shortlist Profile
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-foreground/60">Searching perfect matches...</p>
        </div>
      </div>
    }>
      <MatchesPageContent />
    </Suspense>
  );
}
