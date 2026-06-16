'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  User, Calendar, Heart, Shield, Award, Edit3, 
  MapPin, BookOpen, Briefcase, IndianRupee, Users, 
  Coffee, ShieldAlert, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function ViewProfilePage() {
  const { user, profile } = useAuth();

  if (!profile) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm opacity-60">Profile details not found.</p>
        <Link href="/profile-setup" className="px-5 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs inline-block">
          Complete Profile Setup
        </Link>
      </div>
    );
  }

  // Calculate age from dob
  const getAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const birth = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const infoBlocks = [
    {
      title: "Basic Details",
      icon: User,
      items: [
        { label: "Full Name", value: user?.name },
        { label: "Gender", value: profile.gender },
        { label: "Date of Birth", value: profile.dob ? `${profile.dob} (Age: ${getAge(profile.dob)})` : 'N/A' },
        { label: "Marital Status", value: profile.maritalStatus },
        { label: "Height", value: profile.height },
        { label: "Weight", value: profile.weight },
        { label: "Blood Group", value: profile.bloodGroup },
      ]
    },
    {
      title: "Religion Details",
      icon: Shield,
      items: [
        { label: "Religion", value: profile.religion },
        { label: "Caste", value: profile.caste },
        { label: "Sub Caste", value: profile.subCaste || 'N/A' },
        { label: "Mother Tongue", value: profile.motherTongue },
        { label: "Gothra", value: profile.gothra || 'N/A' },
      ]
    },
    {
      title: "Education & Career",
      icon: BookOpen,
      items: [
        { label: "Highest Qualification", value: profile.highestQualification },
        { label: "College / University", value: profile.college || 'N/A' },
        { label: "Occupation", value: profile.occupation },
        { label: "Annual Income", value: profile.annualIncome ? `₹${profile.annualIncome.toLocaleString('en-IN')}` : 'N/A' },
      ]
    },
    {
      title: "Family Background",
      icon: Users,
      items: [
        { label: "Father's Occupation", value: profile.fatherOccupation || 'N/A' },
        { label: "Mother's Occupation", value: profile.motherOccupation || 'N/A' },
        { label: "Brothers", value: profile.brothers !== undefined ? profile.brothers : 'N/A' },
        { label: "Sisters", value: profile.sisters !== undefined ? profile.sisters : 'N/A' },
        { label: "Family Type", value: profile.familyType ? `${profile.familyType} Family` : 'N/A' },
        { label: "Family Status", value: profile.familyStatus },
      ]
    },
    {
      title: "Lifestyle",
      icon: Coffee,
      items: [
        { label: "Diet", value: profile.diet },
        { label: "Smoking Habits", value: profile.smoking },
        { label: "Drinking Habits", value: profile.drinking },
        { label: "Hobbies & Interests", value: profile.hobbies },
      ]
    },
    {
      title: "Location details",
      icon: MapPin,
      items: [
        { label: "Country", value: profile.country },
        { label: "State", value: profile.state },
        { label: "City", value: profile.city },
        { label: "Address", value: profile.address || 'N/A' },
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl select-none">
      
      {/* Banner Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
        
        {/* Avatar image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shrink-0 border border-primary/20 bg-primary/5">
          <img 
            src={profile.profilePhoto || 'https://placehold.co/400x400/png?text=Add+Photo'} 
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* User name info */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">{user?.name}</h2>
              {user?.isVerified && (
                <span className="bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 fill-white text-green-600" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-primary font-bold uppercase tracking-wider">{profile.gender} • {profile.religion} • {profile.caste}</p>
            <p className="text-xs text-foreground/60">{profile.occupation} • in {profile.city}, {profile.state}</p>
          </div>

          <div className="text-sm text-foreground/80 italic bg-primary/5 p-3.5 rounded-2xl border border-primary/5 leading-relaxed max-w-2xl">
            "{profile.bio || "No profile bio written yet. Click edit to describe yourself, your family and partner expectations."}"
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Link 
              href="/dashboard/profile/edit"
              className="h-10 px-5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile Details
            </Link>
            {profile.profileBoost ? (
              <span className="h-10 px-5 rounded-xl bg-accent/25 text-black border border-accent text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black fill-black" /> Profile Boost Active
              </span>
            ) : (
              <button 
                onClick={async () => {
                  await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profileBoost: true })
                  });
                  alert("Profile Boost Activated! Your profile is now listed at the top of search matches.");
                  window.location.reload();
                }}
                className="h-10 px-5 rounded-xl gradient-bg text-white hover:opacity-95 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm shadow-primary/20"
              >
                <Sparkles className="w-4 h-4 fill-white" /> Boost Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main information grids */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {infoBlocks.map((block, idx) => {
          const Icon = block.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-primary/5 pb-3">
                <Icon className="w-5 h-5 text-primary" /> {block.title}
              </h3>
              
              <div className="space-y-3.5">
                {block.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-start text-xs leading-none">
                    <span className="opacity-60 font-semibold">{item.label}</span>
                    <span className="font-extrabold text-foreground text-right">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Partner Preferences Block */}
        <div className="col-span-1 md:col-span-2 glass-panel p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-primary/5 pb-3">
            <Heart className="w-5 h-5 text-primary fill-primary/10" /> Partner Preferences
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex justify-between items-center text-xs p-3 rounded-xl border border-primary/5 bg-primary/5">
              <span className="opacity-60 font-semibold">Preferred Age:</span>
              <span className="font-extrabold text-primary">{profile.prefAgeFrom} - {profile.prefAgeTo} Years</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3 rounded-xl border border-primary/5 bg-primary/5">
              <span className="opacity-60 font-semibold">Preferred Height:</span>
              <span className="font-extrabold text-primary">{profile.prefHeightFrom || "5'2\""} - {profile.prefHeightTo || "6'0\""}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3 rounded-xl border border-primary/5 bg-primary/5">
              <span className="opacity-60 font-semibold">Preferred Religion:</span>
              <span className="font-extrabold text-primary">{profile.prefReligion || 'Any'}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3 rounded-xl border border-primary/5 bg-primary/5">
              <span className="opacity-60 font-semibold">Preferred Caste:</span>
              <span className="font-extrabold text-primary">{profile.prefCaste || 'Any'}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3 rounded-xl border border-primary/5 bg-primary/5 col-span-1 sm:col-span-2">
              <span className="opacity-60 font-semibold">Preferred Location:</span>
              <span className="font-extrabold text-primary truncate max-w-[200px]">{profile.prefLocation || 'Any'}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
