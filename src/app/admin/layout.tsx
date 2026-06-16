'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auth protection guard
  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <span className="text-xs font-semibold text-primary">Verifying Administrator privileges...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* Admin Top Control Bar */}
      <header className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between z-30 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary fill-primary animate-pulse" />
          <span className="text-sm font-extrabold tracking-tight">Lado Matrimonial Administrative Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="h-9 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </header>
      
      {/* Main Admin Page Container */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
