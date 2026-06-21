'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, ArrowRight, Save, Upload, Sparkles, Check, Info } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

// Dropdown lists
const HEIGHTS = ["4'8\"", "4'9\"", "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\""];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi'];
const LANGUAGES = ['Hindi', 'Punjabi', 'Bengali', 'Telugu', 'Tamil', 'Gujarati', 'Marathi', 'Malayalam', 'Kannada', 'English'];
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE'];
const FAMILY_TYPES = ['Nuclear', 'Joint'];
const FAMILY_STATUSES = ['Middle Class', 'Upper Middle Class', 'Rich', 'Elite'];
const DIETS = ['Veg', 'Non-Veg', 'Eggetarian', 'Vegan'];
const HABITS = ['No', 'Yes', 'Occasionally'];

export default function ProfileSetupPage() {
  const { user, profile, refreshMe } = useAuth();
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    // Step 1: Basic
    gender: 'Bride',
    dob: '1998-01-01',
    maritalStatus: 'Never Married',
    height: "5'4\"",
    weight: '55 kg',
    bloodGroup: 'B+',
    // Step 2: Religion
    religion: 'Hindu',
    caste: 'Brahmin',
    subCaste: '',
    motherTongue: 'Hindi',
    gothra: '',
    // Step 3: Education
    highestQualification: '',
    college: '',
    occupation: '',
    annualIncome: '1200000',
    // Step 4: Family
    fatherOccupation: '',
    motherOccupation: '',
    brothers: '0',
    sisters: '0',
    familyType: 'Nuclear',
    familyStatus: 'Upper Middle Class',
    // Step 5: Lifestyle
    diet: 'Veg',
    smoking: 'No',
    drinking: 'No',
    hobbies: '',
    // Step 6: Location
    country: 'India',
    state: '',
    city: '',
    address: '',
    // Step 7: Media
    profilePhoto: '',
    galleryPhotos: '',
    horoscope: '',
    idProof: '',
    // Step 8: Preferences
    prefAgeFrom: '24',
    prefAgeTo: '32',
    prefHeightFrom: "5'6\"",
    prefHeightTo: "6'2\"",
    prefReligion: 'Hindu',
    prefCaste: 'Any',
    prefEducation: '',
    prefOccupation: '',
    prefLocation: '',
    bio: ''
  });

  // Load existing profile details if any
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        gender: profile.gender || prev.gender,
        dob: profile.dob || prev.dob,
        maritalStatus: profile.maritalStatus || prev.maritalStatus,
        height: profile.height || prev.height,
        weight: profile.weight || prev.weight,
        bloodGroup: profile.bloodGroup || prev.bloodGroup,
        religion: profile.religion || prev.religion,
        caste: profile.caste || prev.caste,
        subCaste: profile.subCaste || prev.subCaste,
        motherTongue: profile.motherTongue || prev.motherTongue,
        gothra: profile.gothra || prev.gothra,
        highestQualification: profile.highestQualification || prev.highestQualification,
        college: profile.college || prev.college,
        occupation: profile.occupation || prev.occupation,
        annualIncome: profile.annualIncome ? profile.annualIncome.toString() : prev.annualIncome,
        fatherOccupation: profile.fatherOccupation || prev.fatherOccupation,
        motherOccupation: profile.motherOccupation || prev.motherOccupation,
        brothers: profile.brothers ? profile.brothers.toString() : prev.brothers,
        sisters: profile.sisters ? profile.sisters.toString() : prev.sisters,
        familyType: profile.familyType || prev.familyType,
        familyStatus: profile.familyStatus || prev.familyStatus,
        diet: profile.diet || prev.diet,
        smoking: profile.smoking || prev.smoking,
        drinking: profile.drinking || prev.drinking,
        hobbies: profile.hobbies || prev.hobbies,
        country: profile.country || prev.country,
        state: profile.state || prev.state,
        city: profile.city || prev.city,
        address: profile.address || prev.address,
        profilePhoto: profile.profilePhoto || prev.profilePhoto,
        galleryPhotos: profile.galleryPhotos || prev.galleryPhotos,
        horoscope: profile.horoscope || prev.horoscope,
        idProof: profile.idProof || prev.idProof,
        prefAgeFrom: profile.prefAgeFrom ? profile.prefAgeFrom.toString() : prev.prefAgeFrom,
        prefAgeTo: profile.prefAgeTo ? profile.prefAgeTo.toString() : prev.prefAgeTo,
        prefHeightFrom: profile.prefHeightFrom || prev.prefHeightFrom,
        prefHeightTo: profile.prefHeightTo || prev.prefHeightTo,
        prefReligion: profile.prefReligion || prev.prefReligion,
        prefCaste: profile.prefCaste || prev.prefCaste,
        prefEducation: profile.prefEducation || prev.prefEducation,
        prefOccupation: profile.prefOccupation || prev.prefOccupation,
        prefLocation: profile.prefLocation || prev.prefLocation,
        bio: profile.bio || prev.bio
      }));
    }
  }, [profile]);

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Move forward
  const nextStep = () => {
    if (step < 8) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // Move back
  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle mock file uploads (sets direct URLs for styling sandbox)
  const handleMockUpload = (field: string, text: string) => {
    let mockUrl = '';
    if (field === 'profilePhoto') {
      mockUrl = formData.gender === 'Bride' 
        ? 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&q=80' 
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80';
    } else {
      mockUrl = `https://placehold.co/400x300/png?text=${encodeURIComponent(text)}`;
    }
    updateField(field, mockUrl);
  };

  // Handle real file uploads (reads as Base64 data URLs)
  const handleRealUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Limit to 3MB to keep base64 strings reasonable
    if (file.size > 3 * 1024 * 1024) {
      alert("File size should be less than 3MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        updateField(field, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save full profile details to Backend
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // Celebrate and redirect
        canvasConfetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#E91E63', '#FFB6C1', '#FFD700']
        });
        await refreshMe();
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save profile details');
      }
    } catch (err) {
      setError('Connection failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const stepPercentage = Math.round((step / 8) * 100);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-background flex flex-col justify-between">
      
      {/* Wizard Header */}
      <div className="max-w-3xl mx-auto w-full mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight gradient-text">Lado Matrimonial</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/10 uppercase tracking-wider">
            Step {step} of 8
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold opacity-65">
            <span>Profile Wizard Setup</span>
            <span>{stepPercentage}% Completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
            <motion.div 
              className="h-full gradient-bg" 
              initial={{ width: 0 }}
              animate={{ width: `${stepPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full glass-panel p-6 sm:p-10 rounded-3xl shadow-xl border border-primary/10 relative overflow-hidden">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold mb-6 border border-red-200/50">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -15, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 1: Basic Information</h3>
                    <p className="text-xs text-foreground/60">Help potential matches learn about your basic statistics.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1.5">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => updateField('gender', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        <option value="Bride">Bride (Female)</option>
                        <option value="Groom">Groom (Male)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateField('dob', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Marital Status</label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => updateField('maritalStatus', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Height</label>
                      <select
                        value={formData.height}
                        onChange={(e) => updateField('height', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {HEIGHTS.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Weight (kg)</label>
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={(e) => updateField('weight', e.target.value)}
                        placeholder="e.g. 60 kg"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Blood Group</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => updateField('bloodGroup', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Religion */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 2: Religion details</h3>
                    <p className="text-xs text-foreground/60">Community matches are highly driven by religion and caste parameters.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1.5">Religion</label>
                      <select
                        value={formData.religion}
                        onChange={(e) => updateField('religion', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {RELIGIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Caste</label>
                      <input
                        type="text"
                        required
                        value={formData.caste}
                        onChange={(e) => updateField('caste', e.target.value)}
                        placeholder="e.g. Brahmin, Patel, Rajput"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Sub Caste (Optional)</label>
                      <input
                        type="text"
                        value={formData.subCaste}
                        onChange={(e) => updateField('subCaste', e.target.value)}
                        placeholder="e.g. Saraswat, Kadva"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Mother Tongue</label>
                      <select
                        value={formData.motherTongue}
                        onChange={(e) => updateField('motherTongue', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {LANGUAGES.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold block mb-1.5">Gothra (Optional)</label>
                      <input
                        type="text"
                        value={formData.gothra}
                        onChange={(e) => updateField('gothra', e.target.value)}
                        placeholder="e.g. Kashyap, Bhardwaj"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Education */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 3: Education & Career</h3>
                    <p className="text-xs text-foreground/60">Share details about your academic achievements and work profile.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1.5">Highest Qualification</label>
                      <input
                        type="text"
                        required
                        value={formData.highestQualification}
                        onChange={(e) => updateField('highestQualification', e.target.value)}
                        placeholder="e.g. MBA, B.Tech, MD"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">College / University</label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => updateField('college', e.target.value)}
                        placeholder="College Name"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Occupation</label>
                      <input
                        type="text"
                        required
                        value={formData.occupation}
                        onChange={(e) => updateField('occupation', e.target.value)}
                        placeholder="e.g. Software Engineer, Business Owner"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Annual Income (INR)</label>
                      <input
                        type="number"
                        required
                        value={formData.annualIncome}
                        onChange={(e) => updateField('annualIncome', e.target.value)}
                        placeholder="e.g. 1500000"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Family Details */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 4: Family Details</h3>
                    <p className="text-xs text-foreground/60">Indian weddings are alliances of families. Provide family background details.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1.5">Father's Occupation</label>
                      <input
                        type="text"
                        value={formData.fatherOccupation}
                        onChange={(e) => updateField('fatherOccupation', e.target.value)}
                        placeholder="Father's job profile"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Mother's Occupation</label>
                      <input
                        type="text"
                        value={formData.motherOccupation}
                        onChange={(e) => updateField('motherOccupation', e.target.value)}
                        placeholder="Mother's job profile"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">No. of Brothers</label>
                      <input
                        type="number"
                        value={formData.brothers}
                        onChange={(e) => updateField('brothers', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">No. of Sisters</label>
                      <input
                        type="number"
                        value={formData.sisters}
                        onChange={(e) => updateField('sisters', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Family Type</label>
                      <select
                        value={formData.familyType}
                        onChange={(e) => updateField('familyType', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {FAMILY_TYPES.map(ft => (
                          <option key={ft} value={ft}>{ft} Family</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Family Status</label>
                      <select
                        value={formData.familyStatus}
                        onChange={(e) => updateField('familyStatus', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {FAMILY_STATUSES.map(fs => (
                          <option key={fs} value={fs}>{fs}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Lifestyle */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 5: Lifestyle</h3>
                    <p className="text-xs text-foreground/60">Share details about your daily routines and personal habits.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1.5">Dietary Preference</label>
                      <select
                        value={formData.diet}
                        onChange={(e) => updateField('diet', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {DIETS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Smoking Habits</label>
                      <select
                        value={formData.smoking}
                        onChange={(e) => updateField('smoking', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {HABITS.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Drinking Habits</label>
                      <select
                        value={formData.drinking}
                        onChange={(e) => updateField('drinking', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {HABITS.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Hobbies & Interests</label>
                      <input
                        type="text"
                        required
                        value={formData.hobbies}
                        onChange={(e) => updateField('hobbies', e.target.value)}
                        placeholder="e.g. Reading, Hiking, Music, Coding"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Location */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 6: Location details</h3>
                    <p className="text-xs text-foreground/60">Provide geographical parameters to find nearby matches.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1.5">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">State</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="e.g. Maharashtra, Delhi"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="e.g. Mumbai, New Delhi"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Full Address"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Uploads */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 7: Document & Photo Uploads</h3>
                    <p className="text-xs text-foreground/60">Upload files to establish trust and verification badges. Photos can be set to private.</p>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Profile Photo */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-primary/10 rounded-2xl bg-primary/5 gap-3">
                      <div>
                        <h4 className="text-sm font-bold">Profile Photo</h4>
                        <p className="text-[10px] opacity-65">Displays on search pages. High resolution face shot.</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {formData.profilePhoto ? (
                          <div className="flex items-center gap-2">
                            {formData.profilePhoto.startsWith('data:') && (
                              <img src={formData.profilePhoto} className="w-8 h-8 rounded-full object-cover border border-primary/20" alt="Preview" />
                            )}
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Added</span>
                            <button
                              type="button"
                              onClick={() => updateField('profilePhoto', '')}
                              className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold ml-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <label className="h-9 px-4 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" /> Select File
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleRealUpload(e, 'profilePhoto')} 
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleMockUpload('profilePhoto', 'Profile Photo')}
                              className="h-9 px-3 rounded-xl border border-primary/20 text-foreground/70 hover:bg-primary/5 text-[10px] font-semibold cursor-pointer"
                            >
                              Auto Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gallery Photos */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-primary/10 rounded-2xl bg-primary/5 gap-3">
                      <div>
                        <h4 className="text-sm font-bold">Gallery Photos (Optional)</h4>
                        <p className="text-[10px] opacity-65">Additional lifestyle/family photographs.</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {formData.galleryPhotos ? (
                          <div className="flex items-center gap-2">
                            {formData.galleryPhotos.startsWith('data:') && (
                              <img src={formData.galleryPhotos} className="w-8 h-8 rounded-full object-cover border border-primary/20" alt="Preview" />
                            )}
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Added</span>
                            <button
                              type="button"
                              onClick={() => updateField('galleryPhotos', '')}
                              className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold ml-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <label className="h-9 px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-bold flex items-center gap-2 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" /> Select Files
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleRealUpload(e, 'galleryPhotos')} 
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleMockUpload('galleryPhotos', 'Gallery Photo')}
                              className="h-9 px-3 rounded-xl border border-primary/20 text-foreground/70 hover:bg-primary/5 text-[10px] font-semibold cursor-pointer"
                            >
                              Auto Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Horoscope */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-primary/10 rounded-2xl bg-primary/5 gap-3">
                      <div>
                        <h4 className="text-sm font-bold">Horoscope / Kundali (Optional)</h4>
                        <p className="text-[10px] opacity-65">PDF/Image file showing your birth charts.</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {formData.horoscope ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Added</span>
                            <button
                              type="button"
                              onClick={() => updateField('horoscope', '')}
                              className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold ml-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <label className="h-9 px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-bold flex items-center gap-2 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" /> Upload File
                              <input 
                                type="file" 
                                accept="image/*,application/pdf" 
                                className="hidden" 
                                onChange={(e) => handleRealUpload(e, 'horoscope')} 
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleMockUpload('horoscope', 'Kundali Document')}
                              className="h-9 px-3 rounded-xl border border-primary/20 text-foreground/70 hover:bg-primary/5 text-[10px] font-semibold cursor-pointer"
                            >
                              Auto Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ID Proof */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-primary/10 rounded-2xl bg-primary/5 gap-3">
                      <div>
                        <h4 className="text-sm font-bold">Aadhaar Card / Passport (Required for Verification)</h4>
                        <p className="text-[10px] opacity-65">Confidential. Used solely for verification. Verification earns a profile badge.</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {formData.idProof ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Added</span>
                            <button
                              type="button"
                              onClick={() => updateField('idProof', '')}
                              className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold ml-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <label className="h-9 px-4 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" /> Select ID Proof
                              <input 
                                type="file" 
                                accept="image/*,application/pdf" 
                                className="hidden" 
                                onChange={(e) => handleRealUpload(e, 'idProof')} 
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleMockUpload('idProof', 'Government ID Proof')}
                              className="h-9 px-3 rounded-xl border border-primary/20 text-foreground/70 hover:bg-primary/5 text-[10px] font-semibold cursor-pointer"
                            >
                              Auto Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Step 8: Partner Preferences */}
              {step === 8 && (
                <div className="space-y-6">
                  <div className="border-b border-primary/5 pb-4">
                    <h3 className="text-xl font-bold">Step 8: Partner Preferences</h3>
                    <p className="text-xs text-foreground/60">Configure partner preferences. These determine your AI compatibility index.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1.5">Preferred Age (From)</label>
                      <select
                        value={formData.prefAgeFrom}
                        onChange={(e) => updateField('prefAgeFrom', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {Array.from({ length: 33 }, (_, i) => i + 18).map(age => (
                          <option key={age} value={age}>{age} Years</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Preferred Age (To)</label>
                      <select
                        value={formData.prefAgeTo}
                        onChange={(e) => updateField('prefAgeTo', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        {Array.from({ length: 33 }, (_, i) => i + 18).map(age => (
                          <option key={age} value={age}>{age} Years</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Preferred Religion</label>
                      <select
                        value={formData.prefReligion}
                        onChange={(e) => updateField('prefReligion', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      >
                        <option value="Any">Any Religion</option>
                        {RELIGIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5">Preferred Caste</label>
                      <input
                        type="text"
                        value={formData.prefCaste}
                        onChange={(e) => updateField('prefCaste', e.target.value)}
                        placeholder="e.g. Brahmin, Any"
                        className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold block mb-1.5">Brief Bio (About Me)</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => updateField('bio', e.target.value)}
                        placeholder="Write a brief description of yourself, your expectations, and your life goals..."
                        rows={4}
                        className="w-full p-3 rounded-xl border border-primary/15 glass-input text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-primary/10">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || loading}
              className={`h-11 px-5 rounded-xl border border-primary/20 text-foreground font-bold text-xs flex items-center gap-2 hover:bg-primary/5 transition-all ${
                step === 1 ? 'opacity-40 pointer-events-none' : 'cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 8 ? (
              <button
                type="button"
                onClick={nextStep}
                className="h-11 px-5 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={loading}
                className="h-11 px-6 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-2 hover:opacity-95 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                {loading ? 'Saving details...' : 'Save Profile'}
                <Save className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Info footer banner */}
      <div className="max-w-md mx-auto mt-6 text-center text-[10px] text-foreground/45 flex items-center gap-1.5 justify-center">
        <Info className="w-3.5 h-3.5 text-primary" />
        <span>Your data is protected. You can toggle photo visibility in dashboard privacy settings.</span>
      </div>

    </div>
  );
}
