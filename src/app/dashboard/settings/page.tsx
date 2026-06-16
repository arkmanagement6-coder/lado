'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Settings, Lock, Shield, Eye, ShieldCheck, 
  Smartphone, History, CheckCircle, Save, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
export default function SettingsPage() {
  const { user, profile, refreshMe } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Settings States
  const [twoFactor, setTwoFactor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load user settings
  useEffect(() => {
    if (user) {
      setTwoFactor(user.twoFactorEnabled || false);
    }
  }, [user]);

  // Handle 2FA Toggle
  const handleToggle2FA = async (enabled: boolean) => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: enabled })
      });

      if (res.ok) {
        setTwoFactor(enabled);
        setSuccess(`Two-Factor Authentication has been ${enabled ? 'enabled' : 'disabled'}`);
        await refreshMe();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError("Failed to update security preferences");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      // Direct call to user settings endpoint
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      if (res.ok) {
        setSuccess("Password updated successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Could not reset password");
      }
    } catch (err) {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Account Settings</h2>
        <p className="text-xs text-foreground/60">Configure security permissions, passwords, and track devices.</p>
      </div>

      {/* Success/Error banner */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-4 rounded-2xl text-xs font-bold border border-green-200/50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold border border-red-200/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Main Settings layouts */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Security and Password */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Two Factor Authentication */}
          <div className="glass-panel p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-primary flex items-center gap-2 border-b border-primary/5 pb-3">
              <Shield className="w-5 h-5 text-primary" /> Security Features
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-bold">Two-Factor Authentication (2FA)</h4>
                <p className="text-[10px] opacity-60 max-w-md leading-relaxed">
                  Protect your account with an extra verification code sent to your registered mobile number upon log in.
                </p>
              </div>

              {/* Slider Toggle */}
              <button
                type="button"
                onClick={() => handleToggle2FA(!twoFactor)}
                disabled={loading}
                className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                  twoFactor ? 'bg-primary justify-end' : 'bg-foreground/15 justify-start'
                }`}
              >
                <motion.span 
                  layout 
                  className="w-4 h-4 bg-background rounded-full shadow-md"
                />
              </button>
            </div>
          </div>

          {/* Reset Password Form */}
          <div className="glass-panel p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-primary flex items-center gap-2 border-b border-primary/5 pb-3">
              <Lock className="w-5 h-5 text-primary" /> Reset Password
            </h3>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full h-10 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Password
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Device Logs */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Active Devices Log */}
          <div className="glass-panel p-6 rounded-2xl border border-primary/15 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold uppercase opacity-65 flex items-center gap-1.5">
              <History className="w-4 h-4 text-primary" /> Active Sessions
            </h4>

            <div className="space-y-3.5 text-xs text-left">
              {/* Session 1 */}
              <div className="border-b border-primary/5 pb-3 space-y-1 leading-none">
                <div className="font-extrabold flex items-center justify-between">
                  <span>Chrome / Windows OS</span>
                  <span className="text-[8px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">Active Now</span>
                </div>
                <p className="text-[10px] opacity-65">IP: 192.168.1.45 • New Delhi, IN</p>
              </div>

              {/* Session 2 */}
              <div className="space-y-1 leading-none opacity-70">
                <div className="font-extrabold flex items-center justify-between">
                  <span>Safari / iOS Device</span>
                  <span className="text-[8px] opacity-45">2 hours ago</span>
                </div>
                <p className="text-[10px] opacity-65">IP: 103.54.21.11 • Mumbai, IN</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-[10px] text-foreground/60 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-primary shrink-0" />
            <span>Secure encryption logs are managed via JWT. If you suspect unauthorized access, click End Sessions in your settings page.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
