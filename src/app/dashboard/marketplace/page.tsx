'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MapPin, Star, Sparkles, Filter, Grid, CheckCircle, 
  ArrowRight, ShieldCheck, X, Phone, Calendar, MessageSquare, Briefcase
} from 'lucide-react';

const CATEGORIES = ['All', 'Photographer', 'Makeup Artist', 'Banquet Hall', 'Pandit', 'Caterer'];

export default function WeddingMarketplace() {
  const { user } = useAuth();
  
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Selected Vendor details
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  
  // Booking Form states
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS'>('IDLE');

  const fetchVendors = async (category = activeCategory) => {
    setLoading(true);
    try {
      const catParam = category !== 'All' ? `?category=${category}` : '';
      const res = await fetch(`/api/marketplace${catParam}`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (err) {
      console.error("Marketplace fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [activeCategory]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) return;
    setBookingStatus('SUBMITTING');

    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorProfileId: selectedVendor.id,
          eventDate,
          notes
        })
      });

      if (res.ok) {
        setBookingStatus('SUCCESS');
        setTimeout(() => {
          setBookingStatus('IDLE');
          setSelectedVendor(null);
          setEventDate('');
          setNotes('');
        }, 2000);
      } else {
        setBookingStatus('IDLE');
        alert("Booking failed. Please try again.");
      }
    } catch (err) {
      setBookingStatus('IDLE');
      console.error("Booking error", err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" /> Wedding Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">Plan Your Big Day</h1>
          <p className="text-sm text-foreground/70">Connect with handpicked, verified wedding vendors and secure special discounts for Lado couples.</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 h-10 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
              activeCategory === cat 
                ? 'gradient-bg text-white border-transparent' 
                : 'border-primary/10 text-foreground hover:bg-primary/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {vendors.length > 0 ? (
            vendors.map((vendor: any) => (
              <div key={vendor.id} className="glass-panel rounded-2xl overflow-hidden border border-primary/10 flex flex-col justify-between hover:scale-[1.01] transition-all">
                <div className="relative h-48 w-full bg-primary/5">
                  <img 
                    src={vendor.portfolioPhotos?.split(',')[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80'} 
                    alt={vendor.companyName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    {vendor.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-extrabold truncate max-w-[180px]">{vendor.companyName}</h3>
                      <div className="flex items-center gap-1 text-yellow-600 font-bold text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> {vendor.rating}
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {vendor.location}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedVendor(vendor)}
                    className="w-full h-10 rounded-xl gradient-bg text-white font-bold text-xs cursor-pointer"
                  >
                    View Packages & Book
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-16 text-center text-sm opacity-60">
              No wedding vendors found in this category.
            </div>
          )}
        </div>
      )}

      {/* Vendor Details & Booking Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-primary/20 max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-60 w-full bg-primary/5">
                <img 
                  src={selectedVendor.portfolioPhotos?.split(',')[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80'} 
                  alt={selectedVendor.companyName}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedVendor(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {selectedVendor.category}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold">{selectedVendor.companyName}</h2>
                  <div className="flex items-center gap-4 text-xs opacity-75">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {selectedVendor.location}</span>
                    <span className="flex items-center gap-1 text-yellow-600 font-bold"><Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {selectedVendor.rating} Rating</span>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-primary">Service Packages Rates</h4>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                    {selectedVendor.packagesDetails || 'Custom quotation on request.'}
                  </p>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-primary/15">
                  <h4 className="text-xs font-bold uppercase opacity-65">Inquire & Book Service</h4>
                  
                  {bookingStatus === 'SUCCESS' ? (
                    <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" /> Booking request submitted successfully! The vendor will contact you.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-[10px] font-bold block mb-1 opacity-70">Tentative Wedding Date</label>
                        <input
                          type="date"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold block mb-1 opacity-70">Custom requests or details</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Please mention event requirements, guest size, or customizations"
                          rows={3}
                          className="w-full p-3 rounded-xl border border-primary/15 glass-input text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={bookingStatus === 'SUBMITTING'}
                        className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {bookingStatus === 'SUBMITTING' ? 'Submitting request...' : 'Book Lado Partner Discount'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
