'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, User, Phone, CheckCircle, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

function RegisterPageContent() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tabs: 'register' | 'login'
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  
  // Registration methods: 'email' | 'otp'
  const [regMethod, setRegMethod] = useState<'email' | 'otp'>('email');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check if profile is complete
      router.push('/profile-setup');
    }
  }, [user]);

  // Pre-fill query parameters if any (e.g. from homepage search)
  useEffect(() => {
    const gender = searchParams.get('gender');
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  // Trigger custom confetti on success
  const celebrate = () => {
    canvasConfetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#E91E63', '#FFB6C1', '#FFD700']
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'register') {
        let payload: any = { method: regMethod };
        if (regMethod === 'otp') {
          payload = { ...payload, mobileNumber, otp, name };
        } else {
          payload = { ...payload, name, email, password, mobileNumber };
        }

        const res = await register(payload);
        if (res.success) {
          celebrate();
          // Redirect to setup wizard after success
          setTimeout(() => {
            router.push('/profile-setup');
          }, 1500);
        } else {
          setFormError(res.error || 'Registration failed');
        }
      } else {
        // Login Submit
        const res = await login(email, password);
        if (res.success) {
          celebrate();
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setFormError(res.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock Request OTP
  const handleRequestOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      setOtpSent(true);
      setIsSubmitting(false);
      alert("Sandbox OTP code is 123456");
    }, 1000);
  };

  // Mock Google Login
  const handleGoogleLogin = async () => {
    setFormError('');
    setIsSubmitting(true);
    
    try {
      // Simulate registering with a Google account
      const mockGoogleEmail = `google_user_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
      const res = await register({
        name: 'Google Member',
        email: mockGoogleEmail,
        password: 'google_oauth_bypass_pass_2026',
        method: 'email'
      });
      
      if (res.success) {
        celebrate();
        setTimeout(() => {
          router.push('/profile-setup');
        }, 1500);
      } else {
        setFormError('Google SSO failed');
      }
    } catch (err) {
      setFormError('Google SSO failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-background select-none">
      
      {/* Visual left panel */}
      <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center p-12 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=1000&q=80')" }}>
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px]" />
        <div className="relative z-10 text-white space-y-6 max-w-md">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-lg">
            <Heart className="w-7 h-7 fill-primary" />
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">Your Search for a Life Partner Ends Here.</h2>
          <p className="text-white/80 leading-relaxed text-sm">
            Join thousands of verified members finding love, trust, and companionship on India's most secure matrimony platform.
          </p>
          <div className="space-y-4 pt-4 border-t border-white/20 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span>100% Manual Profile Verification Screenings</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span>Secure Chats & Protected Photo Controls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form right panel */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center px-4 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Logo Header */}
          <div className="text-center lg:text-left space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white" />
              </span>
              <span className="text-xl font-extrabold tracking-tight gradient-text">Lado Matrimonial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome to Lado</h1>
            <p className="text-sm text-foreground/60">Finding Perfect Matches, Building Lifelong Relationships.</p>
          </div>

          {/* Form container */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-primary/10">
            
            {/* Tabs Toggle */}
            <div className="flex border-b border-primary/10 mb-6">
              <button
                onClick={() => { setActiveTab('register'); setFormError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'register' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => { setActiveTab('login'); setFormError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'login' ? 'border-primary text-primary' : 'border-transparent text-foreground/50'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error Message Box */}
            {formError && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold mb-4 border border-red-200/50">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {activeTab === 'register' && (
                <>
                  {/* Register Option sub-tabs */}
                  <div className="flex bg-primary/5 p-1 rounded-xl gap-1 mb-4 text-xs font-bold border border-primary/10">
                    <button
                      type="button"
                      onClick={() => setRegMethod('email')}
                      className={`flex-1 py-2 rounded-lg transition-all ${
                        regMethod === 'email' ? 'bg-background shadow text-primary' : 'text-foreground/60'
                      }`}
                    >
                      Email Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegMethod('otp')}
                      className={`flex-1 py-2 rounded-lg transition-all ${
                        regMethod === 'otp' ? 'bg-background shadow text-primary' : 'text-foreground/60'
                      }`}
                    >
                      Mobile OTP
                    </button>
                  </div>

                  {/* Name field for both register methods */}
                  <div>
                    <label className="text-xs font-bold block mb-1 opacity-70">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-foreground/40 absolute left-3.5 top-[50%] translate-y-[-50%]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border border-primary/10 glass-input"
                      />
                    </div>
                  </div>

                  {regMethod === 'email' ? (
                    // Email Registration details
                    <>
                      <div>
                        <label className="text-xs font-bold block mb-1 opacity-70">Email Address</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-foreground/40 absolute left-3.5 top-[50%] translate-y-[-50%]" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border border-primary/10 glass-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold block mb-1 opacity-70">Create Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-foreground/40 absolute left-3.5 top-[50%] translate-y-[-50%]" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border border-primary/10 glass-input"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Mobile OTP Registration
                    <>
                      <div>
                        <label className="text-xs font-bold block mb-1 opacity-70">Mobile Number</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="w-4 h-4 text-foreground/40 absolute left-3.5 top-[50%] translate-y-[-50%]" />
                            <input
                              type="tel"
                              required
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              placeholder="10-digit number"
                              className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border border-primary/10 glass-input"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            className="px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-all text-xs font-bold"
                          >
                            Send OTP
                          </button>
                        </div>
                      </div>

                      {otpSent && (
                        <div>
                          <label className="text-xs font-bold block mb-1 opacity-70">Enter OTP</label>
                          <div className="relative">
                            <Smartphone className="w-4 h-4 text-foreground/40 absolute left-3.5 top-[50%] translate-y-[-50%]" />
                            <input
                              type="text"
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="Enter 123456"
                              className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border border-primary/10 glass-input"
                            />
                          </div>
                          <span className="text-[10px] text-primary/75 font-semibold mt-1 block">Verification code sent. Use 123456 for testing.</span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {activeTab === 'login' && (
                // Sign In Form details
                <>
                  <div>
                    <label className="text-xs font-bold block mb-1 opacity-70">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-foreground/40 absolute left-3.5 top-[50%] translate-y-[-50%]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border border-primary/10 glass-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1 opacity-70">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-foreground/40 absolute left-3.5 top-[50%] translate-y-[-50%]" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border border-primary/10 glass-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-sm shadow-md shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {isSubmitting ? 'Processing...' : activeTab === 'register' ? 'Register Free' : 'Sign In'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>

            </form>

            {/* SSO separator */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-primary/10 w-full" />
              <span className="absolute bg-background px-3 text-[10px] text-foreground/45 font-bold uppercase tracking-wider">Or continue with</span>
            </div>

            {/* Google Login button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl border border-primary/20 text-foreground/80 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-semibold text-sm cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.57 15.01 1 12 1 7.35 1 3.4 3.65 1.46 7.54l3.82 2.96C6.24 7.21 8.87 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.51z" />
                <path fill="#FBBC05" d="M5.28 14.5c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.46 6.96C.53 8.82 0 10.9 0 13.1c0 2.21.53 4.29 1.46 6.14l3.82-2.96z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.3.1-4.3 0-3.13 0-5.76-2.17-6.72-5.46L1.46 14.74C3.4 18.63 7.35 23 12 23z" />
              </svg>
              Google Account
            </button>
          </div>

          <div className="text-center text-xs text-foreground/50">
            By continuing, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
          </div>

        </div>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-foreground/75">Loading secure portal...</p>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
