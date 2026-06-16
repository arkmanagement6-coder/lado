'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Save, ArrowLeft, Upload, Check } from 'lucide-react';

const HEIGHTS = ["4'8\"", "4'9\"", "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\""];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi'];
const LANGUAGES = ['Hindi', 'Punjabi', 'Bengali', 'Telugu', 'Tamil', 'Gujarati', 'Marathi', 'Malayalam', 'Kannada', 'English'];
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE'];
const FAMILY_TYPES = ['Nuclear', 'Joint'];
const FAMILY_STATUSES = ['Middle Class', 'Upper Middle Class', 'Rich', 'Elite'];
const DIETS = ['Veg', 'Non-Veg', 'Eggetarian', 'Vegan'];
const HABITS = ['No', 'Yes', 'Occasionally'];

export default function EditProfilePage() {
  const { profile, refreshMe } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<any>({
    gender: 'Bride',
    dob: '1998-01-01',
    maritalStatus: 'Never Married',
    height: "5'4\"",
    weight: '55 kg',
    bloodGroup: 'B+',
    religion: 'Hindu',
    caste: 'Brahmin',
    subCaste: '',
    motherTongue: 'Hindi',
    gothra: '',
    highestQualification: '',
    college: '',
    occupation: '',
    annualIncome: '1200000',
    fatherOccupation: '',
    motherOccupation: '',
    brothers: '0',
    sisters: '0',
    familyType: 'Nuclear',
    familyStatus: 'Upper Middle Class',
    diet: 'Veg',
    smoking: 'No',
    drinking: 'No',
    hobbies: '',
    country: 'India',
    state: '',
    city: '',
    address: '',
    profilePhoto: '',
    galleryPhotos: '',
    horoscope: '',
    idProof: '',
    prefAgeFrom: '24',
    prefAgeTo: '32',
    prefHeightFrom: "5'6\"",
    prefHeightTo: "6'2\"",
    prefReligion: 'Hindu',
    prefCaste: 'Any',
    bio: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        gender: profile.gender || 'Bride',
        dob: profile.dob || '1998-01-01',
        maritalStatus: profile.maritalStatus || 'Never Married',
        height: profile.height || "5'4\"",
        weight: profile.weight || '',
        bloodGroup: profile.bloodGroup || 'B+',
        religion: profile.religion || 'Hindu',
        caste: profile.caste || '',
        subCaste: profile.subCaste || '',
        motherTongue: profile.motherTongue || 'Hindi',
        gothra: profile.gothra || '',
        highestQualification: profile.highestQualification || '',
        college: profile.college || '',
        occupation: profile.occupation || '',
        annualIncome: profile.annualIncome ? profile.annualIncome.toString() : '',
        fatherOccupation: profile.fatherOccupation || '',
        motherOccupation: profile.motherOccupation || '',
        brothers: profile.brothers !== undefined ? profile.brothers.toString() : '0',
        sisters: profile.sisters !== undefined ? profile.sisters.toString() : '0',
        familyType: profile.familyType || 'Nuclear',
        familyStatus: profile.familyStatus || 'Upper Middle Class',
        diet: profile.diet || 'Veg',
        smoking: profile.smoking || 'No',
        drinking: profile.drinking || 'No',
        hobbies: profile.hobbies || '',
        country: profile.country || 'India',
        state: profile.state || '',
        city: profile.city || '',
        address: profile.address || '',
        profilePhoto: profile.profilePhoto || '',
        galleryPhotos: profile.galleryPhotos || '',
        horoscope: profile.horoscope || '',
        idProof: profile.idProof || '',
        prefAgeFrom: profile.prefAgeFrom ? profile.prefAgeFrom.toString() : '24',
        prefAgeTo: profile.prefAgeTo ? profile.prefAgeTo.toString() : '32',
        prefHeightFrom: profile.prefHeightFrom || "5'6\"",
        prefHeightTo: profile.prefHeightTo || "6'2\"",
        prefReligion: profile.prefReligion || 'Hindu',
        prefCaste: profile.prefCaste || 'Any',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleMockUpload = (field: string, text: string) => {
    let mockUrl = '';
    if (field === 'profilePhoto') {
      mockUrl = formData.gender === 'Bride' 
        ? 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&q=80' 
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80';
    } else {
      mockUrl = `https://placehold.co/400x300/png?text=${encodeURIComponent(text)}`;
    }
    handleInputChange(field, mockUrl);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        await refreshMe();
        setTimeout(() => {
          setSuccess(false);
          router.push('/dashboard/profile');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save profile modifications');
      }
    } catch (err) {
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 select-none">
      
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-primary/5 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="p-2 rounded-xl border border-primary/10 hover:bg-primary/5 text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Edit Profile</h2>
            <p className="text-xs text-foreground/60">Update your credentials to optimize matchmaking ratios.</p>
          </div>
        </div>
      </div>

      {/* Forms Wrapper */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold border border-red-200/50">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-4 rounded-2xl text-xs font-bold border border-green-200/50 flex items-center gap-2">
            <Check className="w-5 h-5" /> Profile modifications saved successfully!
          </div>
        )}

        {/* 1. Basic Details */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-primary border-b border-primary/5 pb-3">1. Basic Details</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
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
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">Marital Status</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
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
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
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
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Religion Details */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-primary border-b border-primary/5 pb-3">2. Religion Details</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5">Religion</label>
              <select
                value={formData.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
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
                value={formData.caste}
                onChange={(e) => handleInputChange('caste', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">Sub Caste</label>
              <input
                type="text"
                value={formData.subCaste}
                onChange={(e) => handleInputChange('subCaste', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">Mother Tongue</label>
              <select
                value={formData.motherTongue}
                onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              >
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Education & Career */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-primary border-b border-primary/5 pb-3">3. Education & Career</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5">Highest Qualification</label>
              <input
                type="text"
                value={formData.highestQualification}
                onChange={(e) => handleInputChange('highestQualification', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">College</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">Annual Income (INR)</label>
              <input
                type="number"
                value={formData.annualIncome}
                onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>
          </div>
        </div>

        {/* 4. Upload Media Assets */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-primary border-b border-primary/5 pb-3">4. Media Uploads</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5">Profile Photo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.profilePhoto}
                  onChange={(e) => handleInputChange('profilePhoto', e.target.value)}
                  placeholder="URL or use mock"
                  className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs text-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleMockUpload('profilePhoto', 'Profile Photo')}
                  className="h-11 px-4 rounded-xl bg-primary text-white text-xs font-bold shrink-0"
                >
                  Mock
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">Horoscope Document (URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.horoscope}
                  onChange={(e) => handleInputChange('horoscope', e.target.value)}
                  placeholder="Horoscope URL"
                  className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-xs text-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleMockUpload('horoscope', 'Horoscope Kundali')}
                  className="h-11 px-4 rounded-xl bg-primary text-white text-xs font-bold shrink-0"
                >
                  Mock
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Partner Preferences */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-primary border-b border-primary/5 pb-3">5. Partner Preferences</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5">Preferred Age (From)</label>
              <select
                value={formData.prefAgeFrom}
                onChange={(e) => handleInputChange('prefAgeFrom', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
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
                onChange={(e) => handleInputChange('prefAgeTo', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
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
                onChange={(e) => handleInputChange('prefReligion', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
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
                onChange={(e) => handleInputChange('prefCaste', e.target.value)}
                placeholder="e.g. Brahmin, Any"
                className="w-full h-11 px-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold block mb-1.5">Profile Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Describe yourself..."
                rows={4}
                className="w-full p-3 rounded-xl border border-primary/15 glass-input text-sm text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Submit controls */}
        <div className="flex justify-end gap-3 pt-4 border-t border-primary/5">
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-8 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
          >
            {loading ? 'Saving details...' : 'Save Profile Changes'}
            <Save className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
}
