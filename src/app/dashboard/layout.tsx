'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, LayoutDashboard, User, UserCheck, MessageSquare, 
  Video, Image, CreditCard, Bell, Settings, LogOut, Menu, X, 
  Sun, Moon, Users, HeartHandshake, EyeOff, Edit3, ShieldAlert
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Load theme preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Poll notifications count
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const unread = data.filter((n: any) => !n.isRead).length;
          setNotificationCount(unread);
        }
      } catch (err) {
        console.error("Notifications count check failed", err);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [user]);

  // Auth Protection Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-primary">Loading Lado Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  let sidebarLinks = [];

  if (user.role === 'PARENT') {
    sidebarLinks = [
      { name: 'Parent Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Child Profile', href: '/dashboard/profile', icon: User },
      { name: 'Search Matches', href: '/dashboard/matches', icon: Users },
      { name: 'Chat Timelines', href: '/dashboard/chat', icon: MessageSquare },
      { name: 'Video Call Match', href: '/dashboard/video-call', icon: Video },
      { name: 'Wedding Marketplace', href: '/dashboard/marketplace', icon: Heart },
      { name: 'Astro Matcher', href: '/dashboard/matches?tab=astro', icon: Sun },
      { name: 'Membership', href: '/dashboard/membership', icon: CreditCard },
      { name: 'Support Tickets', href: '/dashboard/support', icon: Settings },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, count: notificationCount },
    ];
  } else if (user.role === 'RELATIONSHIP_MANAGER') {
    sidebarLinks = [
      { name: 'Manager Panel', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Client Matches', href: '/dashboard/matches', icon: Users },
      { name: 'Arrange Meetings', href: '/dashboard/matches?tab=meetings', icon: HeartHandshake },
      { name: 'Chat Room', href: '/dashboard/chat', icon: MessageSquare },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, count: notificationCount },
    ];
  } else if (user.role === 'VENDOR' || user.role === 'WEDDING_VENDOR') {
    sidebarLinks = [
      { name: 'Vendor Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Marketplace View', href: '/dashboard/marketplace', icon: Heart },
      { name: 'Portfolio & Prices', href: '/dashboard/profile', icon: User },
      { name: 'Support Tickets', href: '/dashboard/support', icon: Settings },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, count: notificationCount },
    ];
  } else if (user.role === 'SUPPORT' || user.role === 'SUPPORT_EXECUTIVE') {
    sidebarLinks = [
      { name: 'Support Desk', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Tickets Queue', href: '/dashboard/support', icon: Settings },
      { name: 'Verification Panel', href: '/dashboard/profile', icon: UserCheck },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, count: notificationCount },
    ];
  } else if (user.role === 'FRANCHISE_PARTNER') {
    sidebarLinks = [
      { name: 'Franchise Panel', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Referral System', href: '/dashboard/referrals', icon: Users },
      { name: 'Commission Wallet', href: '/dashboard/membership', icon: CreditCard },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, count: notificationCount },
    ];
  } else {
    // CUSTOMER / PREMIUM / ADMIN
    sidebarLinks = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', href: '/dashboard/profile', icon: User },
      { name: 'Edit Profile', href: '/dashboard/profile/edit', icon: Edit3 },
      { name: 'Matches', href: '/dashboard/matches', icon: Users },
      { name: 'Interests', href: '/dashboard/interests', icon: HeartHandshake },
      { name: 'Chat Room', href: '/dashboard/chat', icon: MessageSquare },
      { name: 'Video Call', href: '/dashboard/video-call', icon: Video },
      { name: 'Wedding Marketplace', href: '/dashboard/marketplace', icon: Heart },
      { name: 'Referral Hub', href: '/dashboard/referrals', icon: Users },
      { name: 'Support Tickets', href: '/dashboard/support', icon: ShieldAlert },
      { name: 'Membership', href: '/dashboard/membership', icon: CreditCard },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, count: notificationCount },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex flex-col w-64 bg-background border-r border-primary/10 shrink-0">
        {/* Brand header */}
        <div className="h-20 px-6 border-b border-primary/5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white">
            <Heart className="w-5 h-5 fill-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight gradient-text">Lado Matrimonial</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`h-11 px-4 rounded-xl flex items-center justify-between text-sm font-semibold transition-all ${
                  active 
                    ? 'gradient-bg text-white shadow-md shadow-primary/20' 
                    : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4.5 h-4.5" />
                  <span>{link.name}</span>
                </div>
                {link.count && link.count > 0 ? (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${active ? 'bg-white text-primary' : 'bg-primary text-white animate-bounce'}`}>
                    {link.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User context footer */}
        <div className="p-4 border-t border-primary/5 space-y-3">
          {/* Debug Role Switcher */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase opacity-60">Role Switcher (Debug)</label>
            <select
              value={user.role}
              onChange={async (e) => {
                const success = await switchRole(e.target.value);
                if (success) {
                  alert(`Switched role to ${e.target.value}!`);
                  router.push('/dashboard');
                } else {
                  alert('Failed to switch role.');
                }
              }}
              className="w-full text-xs font-bold bg-background border border-primary/20 rounded-lg h-9 px-2 outline-none text-primary cursor-pointer"
            >
              <option value="CUSTOMER">Customer / Member</option>
              <option value="PARENT">Parent Account</option>
              <option value="RELATIONSHIP_MANAGER">Relationship Manager</option>
              <option value="VENDOR">Wedding Vendor</option>
              <option value="SUPPORT">Support Executive</option>
              <option value="FRANCHISE_PARTNER">Franchise Partner</option>
              <option value="ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-bold opacity-60">Admin Controls</span>
            {user.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="text-[10px] font-bold uppercase text-primary hover:underline">
                Open Admin
              </Link>
            )}
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="leading-none">
                <div className="text-xs font-bold truncate max-w-[100px]">{user.name}</div>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main wrapper containing top bar and subpages */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header navbar */}
        <header className="h-20 px-4 sm:px-8 border-b border-primary/5 flex items-center justify-between z-30 bg-background/50 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-primary/10 text-primary hover:bg-primary/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold tracking-tight capitalize select-none hidden sm:block">
              {pathname.split('/').pop() || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Dark Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-primary/10 text-primary hover:bg-primary/5 transition-all"
              title="Switch Theme"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-accent" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Verification Status indicator */}
            <div className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold border ${
              user.isVerified 
                ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                : 'bg-primary/10 text-primary border-primary/20 animate-pulse'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-green-600' : 'bg-primary'}`} />
              <span>{user.isVerified ? 'Verified Profile' : 'Pending Verification'}</span>
            </div>

            {/* Quick Profile Icon Link */}
            <Link 
              href="/dashboard/profile"
              className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold uppercase hover:scale-105 transition-all"
            >
              {user.name.charAt(0)}
            </Link>
          </div>
        </header>

        {/* Nested page view */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>

      {/* Drawer menu on Mobile screens */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Sidebar drawer content */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-background border-r border-primary/10 z-50 flex flex-col lg:hidden"
            >
              <div className="h-20 px-6 border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white">
                    <Heart className="w-5 h-5 fill-white" />
                  </span>
                  <span className="text-base font-extrabold tracking-tight gradient-text">Lado Matrimonial</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-foreground/60 hover:bg-primary/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {sidebarLinks.map(link => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`h-11 px-4 rounded-xl flex items-center justify-between text-sm font-semibold transition-all ${
                        active 
                          ? 'gradient-bg text-white shadow-md shadow-primary/20' 
                          : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4.5 h-4.5" />
                        <span>{link.name}</span>
                      </div>
                      {link.count && link.count > 0 ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                          {link.count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-primary/5 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-primary/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="leading-none text-left">
                      <div className="text-xs font-bold">{user.name}</div>
                      <span className="text-[9px] font-bold opacity-60 uppercase">{user.role}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logout(); setSidebarOpen(false); }} 
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
