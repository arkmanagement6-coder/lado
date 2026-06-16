'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Shield, Search, Star, Users, CheckCircle, 
  Menu, X, Sun, Moon, ArrowRight, Phone, Mail, MapPin, 
  Smartphone, Award, Sparkles, MessageCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';

// Seed values for filters
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi'];
const LANGUAGES = ['Hindi', 'Punjabi', 'Bengali', 'Telugu', 'Tamil', 'Gujarati', 'Marathi', 'Malayalam', 'Kannada', 'English'];
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE'];

function getAge(dobString?: string): number {
  if (!dobString) return 28;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Search Box states
  const [lookingFor, setLookingFor] = useState('Bride');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('30');
  const [religion, setReligion] = useState('Hindu');
  const [language, setLanguage] = useState('Hindi');
  const [country, setCountry] = useState('India');

  // Slider 1 states (Banner Slider)
  const bannerSlides = [
    { text: "Find your soulmate with trusted profiles", sub: "100% verified members with manual background screenings." },
    { text: "Thousands of verified profiles waiting for you", sub: "Explore matches in your community, city, and profession." },
    { text: "Start your journey today towards a happy marriage", sub: "Connect securely with chat, audio, and video calling tools." }
  ];
  const [activeBanner, setActiveBanner] = useState(0);

  // Slider 2 states (Success Stories)
  const [stories, setStories] = useState<any[]>([]);
  const [activeStory, setActiveStory] = useState(0);

  // Slider 3 states (Testimonials)
  const testimonials = [
    { name: "Rahul & Pooja Verma", photo: "https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=150&q=80", rating: 5, review: "Lado Matrimonial is amazing. We found each other within 3 weeks of registering. The AI matchmaking score was 94% correct!" },
    { name: "Devendra & Ritu Singh", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80", rating: 5, review: "The Relationship Manager support was highly professional. They coordinated parents calls and simplified our alliance process." },
    { name: "Karthik & Madhuri Iyer", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80", rating: 5, review: "Privacy options are state-of-the-art. I could hide my photo and share it only with approved profiles. Found my perfect partner!" }
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Featured Profiles
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([]);

  // Toggle Dark Mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
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

  // Auto Sliders
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % bannerSlides.length);
    }, 4500);

    const testimonialInterval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  // Fetch blogs & stories & profiles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storiesRes = await fetch('/api/stories');
        if (storiesRes.ok) {
          const data = await storiesRes.json();
          setStories(data);
        }
        
        // Mock featured profiles fetch
        const profilesRes = await fetch('/api/matches?gender=Bride');
        if (profilesRes.ok) {
          const data = await profilesRes.json();
          setFeaturedProfiles(data.slice(0, 4)); // Get first 4
        }
      } catch (err) {
        console.error("Home page fetching error:", err);
      }
    };
    fetchData();
  }, []);

  // Handle Hero Find Matches Click
  const handleFindMatches = (e: React.FormEvent) => {
    e.preventDefault();
    const query = `?gender=${lookingFor}&ageFrom=${ageFrom}&ageTo=${ageTo}&religion=${religion}&motherTongue=${language}&country=${country}`;
    if (user) {
      router.push(`/dashboard/matches${query}`);
    } else {
      router.push(`/register${query}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* 1. Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white shadow-md shadow-primary/20">
                <Heart className="w-6 h-6 fill-white" />
              </span>
              <span className="text-2xl font-extrabold tracking-tight gradient-text">Lado Matrimonial</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href={user ? "/dashboard/matches" : "/register"} className="hover:text-primary transition-colors">Search Profiles</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Premium Plans</Link>
            <Link href="#stories" className="hover:text-primary transition-colors">Success Stories</Link>
            <Link href="#why-choose" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">Contact Us</Link>
          </nav>

          {/* Right Header items */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all text-primary"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href={user.role === 'ADMIN' ? "/admin/dashboard" : "/dashboard"} 
                  className="px-5 h-11 flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all text-sm font-semibold"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout} 
                  className="px-5 h-11 flex items-center justify-center rounded-full gradient-bg text-white hover:opacity-95 transition-all text-sm font-semibold shadow-md shadow-primary/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/register" className="text-sm font-semibold hover:text-primary transition-colors mr-2">Login</Link>
                <Link 
                  href="/register" 
                  className="px-6 h-11 flex items-center justify-center rounded-full gradient-bg text-white hover:opacity-95 transition-all text-sm font-semibold shadow-md shadow-primary/20"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 text-primary">
              {darkMode ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-primary">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-background border-t border-white/10 overflow-hidden px-4 py-6 flex flex-col gap-4 text-center font-medium shadow-xl"
            >
              <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 block border-b border-primary/5">Home</Link>
              <Link href={user ? "/dashboard/matches" : "/register"} onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 block border-b border-primary/5">Search Profiles</Link>
              <Link href="#pricing" onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 block border-b border-primary/5">Premium Plans</Link>
              <Link href="#stories" onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 block border-b border-primary/5">Success Stories</Link>
              <Link href="#why-choose" onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 block border-b border-primary/5">About Us</Link>
              <Link href="#contact" onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 block border-b border-primary/5">Contact Us</Link>
              
              {user ? (
                <div className="flex flex-col gap-3 pt-4">
                  <Link 
                    href={user.role === 'ADMIN' ? "/admin/dashboard" : "/dashboard"} 
                    onClick={() => setMenuOpen(false)} 
                    className="w-full h-11 flex items-center justify-center rounded-full border border-primary text-primary"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { logout(); setMenuOpen(false); }} 
                    className="w-full h-11 flex items-center justify-center rounded-full gradient-bg text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4">
                  <Link 
                    href="/register" 
                    onClick={() => setMenuOpen(false)} 
                    className="w-full h-11 flex items-center justify-center rounded-full border border-primary text-primary"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setMenuOpen(false)} 
                    className="w-full h-11 flex items-center justify-center rounded-full gradient-bg text-white"
                  >
                    Register Free
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[90vh] py-16 lg:py-24 flex items-center justify-center overflow-hidden">
        {/* Background Wedding Image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 filter blur-[2px]" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50 dark:from-background dark:via-background/95 dark:to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          {/* Tagline Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 100% Verified Profiles
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-foreground dark:text-white">
              Finding <span className="gradient-text">Perfect Matches</span>, Building Lifelong Relationships.
            </h1>
            <p className="text-lg text-foreground/80 dark:text-white/80 max-w-xl mx-auto lg:mx-0">
              India's premium and trusted matrimony portal. Begin your journey toward finding your perfect soulmate backed by state-of-the-art security and AI compatibility scoring.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link href="/register" className="h-12 px-8 flex items-center gap-2 rounded-full gradient-bg text-white font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#stories" className="h-12 px-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-foreground/15 text-foreground font-semibold hover:bg-white/20 transition-all">
                Success Stories
              </Link>
            </div>
          </div>

          {/* Quick Search Widget Column */}
          <div className="lg:col-span-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg mx-auto glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl relative"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" /> Find Your Soulmate
              </h3>

              <form onSubmit={handleFindMatches} className="space-y-4">
                
                {/* 1. Looking for */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLookingFor('Bride')}
                    className={`h-11 rounded-xl font-semibold text-sm transition-all border ${
                      lookingFor === 'Bride'
                        ? 'gradient-bg text-white border-transparent'
                        : 'border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    Looking for a Bride
                  </button>
                  <button
                    type="button"
                    onClick={() => setLookingFor('Groom')}
                    className={`h-11 rounded-xl font-semibold text-sm transition-all border ${
                      lookingFor === 'Groom'
                        ? 'gradient-bg text-white border-transparent'
                        : 'border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    Looking for a Groom
                  </button>
                </div>

                {/* 2. Age Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1 opacity-70">Age From</label>
                    <select
                      value={ageFrom}
                      onChange={(e) => setAgeFrom(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-primary/20 glass-input"
                    >
                      {Array.from({ length: 53 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age} className="text-black">{age} Years</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 opacity-70">Age To</label>
                    <select
                      value={ageTo}
                      onChange={(e) => setAgeTo(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-primary/20 glass-input"
                    >
                      {Array.from({ length: 53 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age} className="text-black">{age} Years</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Religion and Mother Tongue */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1 opacity-70">Religion</label>
                    <select
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-primary/20 glass-input text-sm"
                    >
                      {RELIGIONS.map(r => (
                        <option key={r} value={r} className="text-black">{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 opacity-70">Mother Tongue</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-primary/20 glass-input text-sm"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l} value={l} className="text-black">{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Country */}
                <div>
                  <label className="text-xs font-semibold block mb-1 opacity-70">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-primary/20 glass-input text-sm"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c} className="text-black">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full h-12 mt-4 rounded-xl gradient-bg text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] hover:opacity-95 transition-all cursor-pointer"
                >
                  <Search className="w-5 h-5" /> Find Matches
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Slider 1: Premium Banner Slider */}
      <section className="bg-primary/5 py-12 border-y border-primary/10 overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4 text-center relative h-28 flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">{bannerSlides[activeBanner].text}</h2>
              <p className="text-foreground/70 text-sm sm:text-base">{bannerSlides[activeBanner].sub}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex gap-2 mt-6 justify-center">
            {bannerSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`w-2 h-2 rounded-full transition-all ${activeBanner === idx ? 'w-6 bg-primary' : 'bg-primary/30'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section id="why-choose" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Why Choose <span className="gradient-text">Lado Matrimonial</span></h2>
          <p className="text-foreground/70 text-sm sm:text-base">We prioritize safety, verified alliances, and smart search integrations to bring you closer to your life partner.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold">Verified Profiles</h4>
            <p className="text-sm text-foreground/70">100% verified members with manual background and ID proof screenings.</p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold">Privacy Protection</h4>
            <p className="text-sm text-foreground/70">Complete control over who sees your photo, bio, phone, and gallery files.</p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold">Smart Matchmaking</h4>
            <p className="text-sm text-foreground/70">AI compatibility ratings calculate preferences, lifestyles, and fields overlap.</p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Phone className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold">Dedicated Support</h4>
            <p className="text-sm text-foreground/70">24x7 customer helpline and personal relationship manager options.</p>
          </div>

        </div>
      </section>

      {/* 5. Slider 2: Success Stories */}
      {stories.length > 0 && (
        <section id="stories" className="bg-primary/5 py-20 border-y border-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold">Lado <span className="gradient-text">Success Stories</span></h2>
              <p className="text-foreground/70">Matches made in heaven, connected by Lado Matrimonial.</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStory}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-background glass-panel rounded-3xl overflow-hidden grid md:grid-cols-12 shadow-xl border border-primary/15"
                >
                  <div className="md:col-span-5 relative h-64 md:h-full min-h-[300px]">
                    <img 
                      src={stories[activeStory].coupleImage} 
                      alt="Couple" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-4">
                    <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Heart className="w-5 h-5 fill-primary" />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold">{stories[activeStory].brideName} & {stories[activeStory].groomName}</h3>
                    <p className="text-xs text-primary font-bold">Wedding Date: {stories[activeStory].weddingDate}</p>
                    <p className="text-sm sm:text-base text-foreground/85 italic leading-relaxed">"{stories[activeStory].story}"</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Arrows */}
              <button 
                onClick={() => setActiveStory(prev => (prev - 1 + stories.length) % stories.length)}
                className="absolute left-[-20px] top-[50%] translate-y-[-50%] w-10 h-10 rounded-full bg-background border border-primary/20 shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveStory(prev => (prev + 1) % stories.length)}
                className="absolute right-[-20px] top-[50%] translate-y-[-50%] w-10 h-10 rounded-full bg-background border border-primary/20 shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 6. Featured Profiles */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Featured <span className="gradient-text">Premium Profiles</span></h2>
          <p className="text-foreground/70">Connect with these active, premium verified members seeking alliances.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featuredProfiles.length > 0 ? (
            featuredProfiles.map((p: any) => (
              <div key={p.id} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden shadow-md border border-white/20 flex flex-col justify-between">
                
                {/* Photo Header */}
                <div className="relative h-64 w-full bg-primary/5">
                  <img 
                    src={p.profilePhoto || 'https://placehold.co/400x400/png?text=Photo'} 
                    alt={p.user?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 uppercase">
                    <Star className="w-3 h-3 fill-black" /> Featured
                  </div>
                  {p.user?.isVerified && (
                    <div className="absolute bottom-3 left-3 bg-green-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 fill-white text-green-600" /> Verified
                    </div>
                  )}
                </div>

                {/* Profile detail details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold">{p.user?.name}</h4>
                    <p className="text-xs text-primary font-bold">{p.religion} • {p.caste}</p>
                    
                    <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-foreground/75 pt-2">
                      <div><span className="opacity-60">Age / Ht:</span> {p.dob ? getAge(p.dob) : 26} yrs / {p.height}</div>
                      <div><span className="opacity-60">Lang:</span> {p.motherTongue}</div>
                      <div className="col-span-2"><span className="opacity-60">Job:</span> {p.occupation}</div>
                      <div className="col-span-2"><span className="opacity-60">Edu:</span> {p.highestQualification?.substring(0, 30)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/5">
                    <Link 
                      href={user ? `/dashboard/matches?id=${p.id}` : "/register"}
                      className="h-9 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center justify-center"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => router.push(user ? '/dashboard/matches' : '/register')}
                      className="h-9 rounded-lg gradient-bg text-white hover:opacity-95 transition-all text-xs font-bold flex items-center justify-center"
                    >
                      Express Interest
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            // Static grid fallback if API list is loading
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden shadow-md border border-white/20 animate-pulse h-[400px]">
                <div className="h-64 bg-primary/5" />
                <div className="p-5 space-y-4">
                  <div className="h-4 bg-primary/10 rounded w-2/3" />
                  <div className="h-3 bg-primary/10 rounded w-1/2" />
                  <div className="h-3 bg-primary/10 rounded w-3/4" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 7. Membership Plans */}
      <section id="pricing" className="bg-primary/5 py-20 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Upgrade to <span className="gradient-text">Premium Memberships</span></h2>
            <p className="text-foreground/70">Accelerate your partner search with personalized tools and higher rankings.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* Plan 1 */}
            <div className="glass-panel bg-background p-8 rounded-3xl border border-white/10 flex flex-col justify-between shadow-md">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">Basic Tier</span>
                <h3 className="text-2xl font-bold">Basic Plan</h3>
                <div className="text-3xl font-extrabold text-foreground">Free</div>
                
                <ul className="space-y-2 text-sm text-foreground/80 pt-4 border-t border-primary/5">
                  <li className="flex items-center gap-2">✔ Free Profile Registration</li>
                  <li className="flex items-center gap-2">✔ basic Search Filters</li>
                  <li className="flex items-center gap-2">✔ View up to 5 profiles daily</li>
                  <li className="flex items-center gap-2 opacity-50">❌ Unlimited Interests</li>
                  <li className="flex items-center gap-2 opacity-50">❌ Direct Contact details</li>
                  <li className="flex items-center gap-2 opacity-50">❌ Private Chat access</li>
                </ul>
              </div>

              <Link href="/register" className="w-full h-11 mt-8 rounded-xl border border-primary text-primary flex items-center justify-center font-bold text-sm hover:bg-primary hover:text-white transition-all">
                Get Started
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="glass-panel p-8 rounded-3xl border-2 border-primary flex flex-col justify-between relative shadow-xl transform scale-[1.03]">
              <div className="absolute top-[-14px] right-6 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">Verified Premium</span>
                <h3 className="text-2xl font-bold">Premium Plan</h3>
                <div className="text-3xl font-extrabold text-foreground">₹2,999<span className="text-sm font-medium text-foreground/75"> / 3 months</span></div>
                
                <ul className="space-y-2 text-sm text-foreground/80 pt-4 border-t border-primary/5">
                  <li className="flex items-center gap-2">✔ Unlimited Interests Express</li>
                  <li className="flex items-center gap-2">✔ View Direct Contact Numbers</li>
                  <li className="flex items-center gap-2">✔ Unlimited Chats & Emojis</li>
                  <li className="flex items-center gap-2">✔ Priority listing in search results</li>
                  <li className="flex items-center gap-2">✔ Profile Boost feature</li>
                  <li className="flex items-center gap-2 opacity-50">❌ Dedicated Relationship Manager</li>
                </ul>
              </div>

              <button 
                onClick={() => router.push(user ? '/dashboard/membership' : '/register')}
                className="w-full h-11 mt-8 rounded-xl gradient-bg text-white flex items-center justify-center font-bold text-sm hover:opacity-95 transition-all shadow-md shadow-primary/20"
              >
                Buy Now
              </button>
            </div>

            {/* Plan 3 */}
            <div className="glass-panel bg-background p-8 rounded-3xl border border-white/10 flex flex-col justify-between shadow-md">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-accent/20 text-accent dark:text-yellow-500">Royal Elite</span>
                <h3 className="text-2xl font-bold">Elite Plan</h3>
                <div className="text-3xl font-extrabold text-foreground">₹9,999<span className="text-sm font-medium text-foreground/75"> / 1 year</span></div>
                
                <ul className="space-y-2 text-sm text-foreground/80 pt-4 border-t border-primary/5">
                  <li className="flex items-center gap-2">✔ Dedicated Relationship Manager</li>
                  <li className="flex items-center gap-2">✔ Private Video calling access</li>
                  <li className="flex items-center gap-2">✔ 100% Top ranking search priority</li>
                  <li className="flex items-center gap-2">✔ Personalized Matchmaking selection</li>
                  <li className="flex items-center gap-2">✔ View Horoscope and Kundali matches</li>
                  <li className="flex items-center gap-2">✔ Hide photo controls activated</li>
                </ul>
              </div>

              <button 
                onClick={() => router.push(user ? '/dashboard/membership' : '/register')}
                className="w-full h-11 mt-8 rounded-xl border border-primary text-primary flex items-center justify-center font-bold text-sm hover:bg-primary hover:text-white transition-all"
              >
                Subscribe
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Slider 3: Testimonials */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-12">What Our Customers Say</h2>
        
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-8 rounded-3xl flex flex-col items-center space-y-4"
            >
              <img 
                src={testimonials[activeTestimonial].photo} 
                alt="Client Avatar" 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
              <h4 className="text-lg font-bold">{testimonials[activeTestimonial].name}</h4>
              
              <div className="flex gap-1 text-accent">
                {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              
              <p className="text-foreground/85 italic max-w-xl leading-relaxed text-sm sm:text-base">
                "{testimonials[activeTestimonial].review}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex gap-2 mt-6 justify-center">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${activeTestimonial === idx ? 'w-4 bg-primary' : 'bg-primary/30'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Mobile App Banner */}
      <section className="bg-primary/5 py-16 border-t border-primary/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Download our <span className="gradient-text">Mobile App</span>
            </h2>
            <p className="text-foreground/75 max-w-xl mx-auto lg:mx-0">
              Access your matrimony portal on the go. Swipe profiles, express interest, receive real-time notifications, and chat with matches instantly. Available for iOS and Android.
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <button className="h-14 px-6 rounded-2xl bg-foreground text-background font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-md shadow-black/10">
                <Smartphone className="w-6 h-6" />
                <div className="text-left leading-none">
                  <div className="text-[10px] opacity-60">GET IT ON</div>
                  <div className="text-base font-extrabold">Google Play</div>
                </div>
              </button>
              <button className="h-14 px-6 rounded-2xl bg-foreground text-background font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-md shadow-black/10">
                <Smartphone className="w-6 h-6" />
                <div className="text-left leading-none">
                  <div className="text-[10px] opacity-60">Download on the</div>
                  <div className="text-base font-extrabold">App Store</div>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Mock mobile frame */}
            <div className="w-64 h-[450px] bg-foreground rounded-[40px] p-3 shadow-2xl relative border-4 border-foreground/80 flex flex-col items-center">
              <div className="w-24 h-4 bg-foreground rounded-full absolute top-1 z-20" />
              <div className="w-full h-full bg-background rounded-[32px] overflow-hidden p-4 relative flex flex-col justify-between border border-white/10">
                
                <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                  <span className="text-[9px] font-bold gradient-text">Lado Matrimonial</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                
                <div className="my-auto text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
                    <Heart className="w-8 h-8 fill-primary text-primary" />
                  </div>
                  <div className="text-xs font-extrabold">AI Compatibility Check</div>
                  <p className="text-[9px] text-foreground/70">Connecting matches in your community in real time.</p>
                </div>

                <button className="w-full h-8 rounded-lg gradient-bg text-white text-[10px] font-bold">
                  Open App
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. Footer */}
      <footer id="contact" className="bg-foreground text-background pt-16 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-background/10">
          
          {/* Column 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">Lado Matrimonial</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Lado Matrimonial is India's premium portal for finding perfect matches and building lifelong relationships. We facilitate trusted matches within your communities.
            </p>
            <div className="flex gap-3 text-background/80 pt-2">
              {/* Social mock icons */}
              <Link href="#" className="p-2 rounded-full bg-background/5 hover:bg-background/15 transition-all text-white"><Users className="w-4 h-4" /></Link>
              <Link href="#" className="p-2 rounded-full bg-background/5 hover:bg-background/15 transition-all text-white"><MessageCircle className="w-4 h-4" /></Link>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href={user ? "/dashboard/matches" : "/register"} className="hover:text-primary transition-colors">Search Profiles</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Premium Plans</Link></li>
              <li><Link href="#stories" className="hover:text-primary transition-colors">Success Stories</Link></li>
              <li><Link href="#why-choose" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><Link href={user ? "/dashboard/matches?gender=Bride" : "/register"} className="hover:text-primary transition-colors">Bride Search</Link></li>
              <li><Link href={user ? "/dashboard/matches?gender=Groom" : "/register"} className="hover:text-primary transition-colors">Groom Search</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Premium Membership</Link></li>
              <li><Link href={user ? "/dashboard" : "/register"} className="hover:text-primary transition-colors">Relationship Manager Support</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>+91 98765 43210<br />+91 11 2345 6789</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>support@lado.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>102, Wedding Plaza, Ring Road, New Delhi - 110001</span>
              </li>
            </ul>
            {/* Map Placeholder */}
            <div className="w-full h-24 rounded-xl overflow-hidden relative border border-background/10 bg-background/5">
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-background/40 font-bold bg-slate-900">
                Google Map Sandbox
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-background/55 gap-4">
          <div>
            © 2026 Lado Matrimonial. All Rights Reserved.
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms & Conditions</Link>
            <Link href="#" className="hover:underline">Refund Policy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
