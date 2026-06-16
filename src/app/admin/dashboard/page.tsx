'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, UserCheck, CreditCard, Sparkles, 
  HeartHandshake, BookOpen, Heart, Eye, Edit3, Trash2, 
  UserMinus, UserPlus, RefreshCw, CheckCircle, AlertCircle, Save, Search 
} from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stories' | 'blogs'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    verifiedProfiles: 0,
    activeMembers: 0,
    premiumMembers: 0,
    totalRevenue: 0,
    newRegistrations: 0,
    interestsSent: 0,
    successfulMatches: 0
  });

  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Blog / Story form states
  const [storyForm, setStoryForm] = useState({ brideName: '', groomName: '', weddingDate: '', story: '', coupleImage: '' });
  const [blogForm, setBlogForm] = useState({ title: '', category: 'Marriage Tips', content: '', image: '' });
  
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // 1. Check permissions
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user]);

  // 2. Fetch stats and users list
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  // 3. User operations (Verify, Suspend, Upgrade)
  const handleUserAction = async (targetUserId: string, action: string, extraData: any = {}) => {
    setActionSuccessMsg('');
    setActionErrorMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          action,
          ...extraData
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccessMsg(data.message);
        loadAdminData(); // Refresh logs
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        setActionErrorMsg(data.error || 'Admin command failed');
        setTimeout(() => setActionErrorMsg(''), 4000);
      }
    } catch (err) {
      setActionErrorMsg('Connection failed');
    }
  };

  // 4. Publish Success Story
  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccessMsg('');
    setActionErrorMsg('');

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyForm)
      });

      if (res.ok) {
        canvasConfetti({ particleCount: 100, colors: ['#E91E63', '#FFD700'] });
        setActionSuccessMsg("Success Story published successfully!");
        setStoryForm({ brideName: '', groomName: '', weddingDate: '', story: '', coupleImage: '' });
        loadAdminData();
      } else {
        setActionErrorMsg("Could not publish story. Verify fields.");
      }
    } catch (err) {
      setActionErrorMsg("Network error");
    }
  };

  // 5. Publish Blog
  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccessMsg('');
    setActionErrorMsg('');

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogForm)
      });

      if (res.ok) {
        canvasConfetti({ particleCount: 100, colors: ['#E91E63', '#FFB6C1'] });
        setActionSuccessMsg("SEO Blog Post published successfully!");
        setBlogForm({ title: '', category: 'Marriage Tips', content: '', image: '' });
        loadAdminData();
      } else {
        setActionErrorMsg("Could not publish blog. Verify fields.");
      }
    } catch (err) {
      setActionErrorMsg("Network error");
    }
  };

  // Filter users based on search
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.mobileNumber && u.mobileNumber.includes(searchTerm))
  );

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background">
        <div className="space-y-4 max-w-sm">
          <Shield className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <h3 className="text-lg font-bold">Forbidden Access</h3>
          <p className="text-xs text-foreground/60 leading-relaxed">This page is reserved for administrators of Lado Matrimonial. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl select-none relative">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-primary/5 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Admin Control Center</h2>
          <p className="text-xs text-foreground/60">Configure verifications, upgrades, and content logs.</p>
        </div>

        <button 
          onClick={loadAdminData}
          className="p-2 rounded-xl border border-primary/10 hover:bg-primary/5 text-primary shrink-0"
          title="Reload Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Admin tabs */}
      <div className="flex border-b border-primary/10 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 text-sm font-bold border-b-2 px-6 transition-all ${
            activeTab === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
          }`}
        >
          Overview Widgets
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 px-6 transition-all ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
          }`}
        >
          User Management ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`pb-3 text-sm font-bold border-b-2 px-6 transition-all ${
            activeTab === 'stories' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
          }`}
        >
          Add Success Story
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`pb-3 text-sm font-bold border-b-2 px-6 transition-all ${
            activeTab === 'blogs' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
          }`}
        >
          Publish Blog
        </button>
      </div>

      {/* Alert Banners */}
      {actionSuccessMsg && (
        <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-4 rounded-2xl text-xs font-bold border border-green-200/50 flex items-center gap-2 shadow-sm animate-pulse">
          <CheckCircle className="w-5 h-5" /> {actionSuccessMsg}
        </div>
      )}

      {actionErrorMsg && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold border border-red-200/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {actionErrorMsg}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW WIDGETS */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-6"
            >
              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <Users className="w-5 h-5 text-primary" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Total Users</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.totalUsers}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <Users className="w-5 h-5 text-blue-500" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Male Users</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.maleUsers}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <Users className="w-5 h-5 text-pink-500" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Female Users</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.femaleUsers}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <UserCheck className="w-5 h-5 text-green-600" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Verified Profiles</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.verifiedProfiles}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Active Members</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.activeMembers}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <Sparkles className="w-5 h-5 text-accent fill-accent/15" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Premium Members</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.premiumMembers}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/15 leading-none space-y-2 text-left col-span-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Total Revenue</div>
                <div className="text-2xl font-extrabold text-primary">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <HeartHandshake className="w-5 h-5 text-primary" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Interests Expressed</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.interestsSent}</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-primary/10 leading-none space-y-2 text-left">
                <Heart className="w-5 h-5 text-primary fill-primary/10" />
                <div className="text-[10px] font-bold opacity-60 uppercase">Connected Matches</div>
                <div className="text-2xl font-extrabold text-foreground">{stats.successfulMatches}</div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: USER DIRECTORY & MANAGEMENT */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Search user bar */}
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-foreground/45 absolute left-3 top-[50%] translate-y-[-50%]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user name or email..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-primary/10 glass-input text-xs"
                />
              </div>

              {/* Table */}
              <div className="glass-panel p-5 rounded-3xl border border-primary/10 overflow-x-auto shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="opacity-60 border-b border-primary/5">
                      <th className="py-2.5">User Details</th>
                      <th>City</th>
                      <th>Role</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-primary/5">
                        
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={u.profilePhoto || 'https://placehold.co/100x100/png?text=Avatar'} 
                              alt="Avatar" 
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-primary/10"
                            />
                            <div className="leading-none text-left">
                              <span className="font-extrabold block text-foreground truncate max-w-[150px]">{u.name}</span>
                              <span className="text-[10px] opacity-65 truncate block max-w-[150px] mt-0.5">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="font-semibold">{u.city || 'N/A'}</td>
                        
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td>
                          <button
                            onClick={() => handleUserAction(u.id, u.isVerified ? 'unverify' : 'verify')}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                              u.isVerified 
                                ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                : 'bg-foreground/5 text-foreground/50 border-foreground/10 hover:border-primary'
                            }`}
                          >
                            {u.isVerified ? 'Verified' : 'Verify'}
                          </button>
                        </td>

                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        <td className="text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUserAction(u.id, u.status === 'ACTIVE' ? 'suspend' : 'activate')}
                              className="p-1.5 rounded-lg border border-primary/10 text-primary hover:bg-primary/5"
                              title={u.status === 'ACTIVE' ? "Suspend User" : "Activate User"}
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(u.id, 'changeRole', { newRole: 'PREMIUM' })}
                              className="p-1.5 rounded-lg border border-primary/10 text-primary hover:bg-primary/5"
                              title="Upgrade to Premium"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(u.id, 'delete')}
                              className="p-1.5 rounded-lg border border-red-500/10 text-red-500 hover:bg-red-500/5"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PUBLISH SUCCESS STORY */}
          {activeTab === 'stories' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm"
            >
              <h3 className="text-base font-extrabold text-primary border-b border-primary/5 pb-3 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary fill-primary/10" /> Add Success Story
              </h3>
              
              <form onSubmit={handlePublishStory} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">Bride's Name</label>
                    <input
                      type="text"
                      required
                      value={storyForm.brideName}
                      onChange={(e) => setStoryForm({...storyForm, brideName: e.target.value})}
                      placeholder="Bride Name"
                      className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Groom's Name</label>
                    <input
                      type="text"
                      required
                      value={storyForm.groomName}
                      onChange={(e) => setStoryForm({...storyForm, groomName: e.target.value})}
                      placeholder="Groom Name"
                      className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">Wedding Date</label>
                    <input
                      type="date"
                      required
                      value={storyForm.weddingDate}
                      onChange={(e) => setStoryForm({...storyForm, weddingDate: e.target.value})}
                      className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Couple Cover Image (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={storyForm.coupleImage}
                        onChange={(e) => setStoryForm({...storyForm, coupleImage: e.target.value})}
                        placeholder="Image URL"
                        className="flex-1 h-10 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setStoryForm({ ...storyForm, coupleImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80' })}
                        className="h-10 px-3 rounded-xl bg-primary text-white text-xs font-bold shrink-0"
                      >
                        Mock
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Story Description</label>
                  <textarea
                    required
                    value={storyForm.story}
                    onChange={(e) => setStoryForm({...storyForm, story: e.target.value})}
                    placeholder="Write how the couple met and connected on Lado Matrimonial..."
                    rows={5}
                    className="w-full p-3 rounded-xl border border-primary/15 glass-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Publish Success Story
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 4: PUBLISH SEO BLOG POST */}
          {activeTab === 'blogs' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm"
            >
              <h3 className="text-base font-extrabold text-primary border-b border-primary/5 pb-3 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Publish SEO Blog Post
              </h3>

              <form onSubmit={handlePublishBlog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold block mb-1">Blog Title</label>
                    <input
                      type="text"
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                      placeholder="e.g. 7 Marriage Tips for Modern Couples"
                      className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">Category</label>
                    <select
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                      className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                    >
                      <option value="Marriage Tips">Marriage Tips</option>
                      <option value="Relationship Advice">Relationship Advice</option>
                      <option value="Wedding Planning">Wedding Planning</option>
                      <option value="Success Stories">Success Stories</option>
                      <option value="Horoscope">Horoscope</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Blog Image (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={blogForm.image}
                        onChange={(e) => setBlogForm({...blogForm, image: e.target.value})}
                        placeholder="Image URL"
                        className="flex-1 h-10 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setBlogForm({ ...blogForm, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80' })}
                        className="h-10 px-3 rounded-xl bg-primary text-white text-xs font-bold shrink-0"
                      >
                        Mock
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Blog Post Content</label>
                  <textarea
                    required
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                    placeholder="Write detailed, SEO-friendly content..."
                    rows={8}
                    className="w-full p-3 rounded-xl border border-primary/15 glass-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Publish Blog Post
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      )}

    </div>
  );
}
