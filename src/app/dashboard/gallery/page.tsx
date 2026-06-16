'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Image as ImageIcon, Upload, Lock, Unlock, Eye, 
  EyeOff, CheckCircle, ShieldCheck, Trash2, Shield 
} from 'lucide-react';

export default function GalleryPage() {
  const { profile, refreshMe } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoPrivacy, setPhotoPrivacy] = useState<'PUBLIC' | 'HIDDEN' | 'PREMIUM_ONLY'>('PUBLIC');
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

  // Load profile values
  useEffect(() => {
    if (profile) {
      setPhotoPrivacy(profile.photoPrivacy || 'PUBLIC');
      if (profile.galleryPhotos) {
        setGalleryPhotos(profile.galleryPhotos.split(',').filter(Boolean));
      }
    }
  }, [profile]);

  // Update Privacy Selection
  const handleUpdatePrivacy = async (privacy: 'PUBLIC' | 'HIDDEN' | 'PREMIUM_ONLY') => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoPrivacy: privacy })
      });

      if (res.ok) {
        setPhotoPrivacy(privacy);
        setSuccess(true);
        await refreshMe();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError("Could not update privacy configurations");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Mock Upload Image
  const handleMockUpload = async () => {
    setLoading(true);
    setError('');
    try {
      // Seed a random beautiful wedding/portrait image from Unsplash
      const mockImages = [
        'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
        'https://images.unsplash.com/photo-1588001291548-948fec6b2660?w=500&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80'
      ];
      const randomUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
      
      const nextPhotos = [...galleryPhotos, randomUrl];
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryPhotos: nextPhotos.join(',') })
      });

      if (res.ok) {
        setGalleryPhotos(nextPhotos);
        await refreshMe();
      }
    } catch (err) {
      setError("Mock upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete Image
  const handleDeletePhoto = async (idxToDelete: number) => {
    if (!confirm("Are you sure you want to remove this photo from your gallery?")) return;
    setLoading(true);
    try {
      const nextPhotos = galleryPhotos.filter((_, idx) => idx !== idxToDelete);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryPhotos: nextPhotos.join(',') })
      });

      if (res.ok) {
        setGalleryPhotos(nextPhotos);
        await refreshMe();
      }
    } catch (err) {
      setError("Photo delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 select-none">
      
      {/* Header bar */}
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Photo Gallery & Privacy</h2>
        <p className="text-xs text-foreground/60">Upload album files and configure who can see your media assets.</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-4 rounded-2xl text-xs font-bold border border-green-200/50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Privacy settings updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold border border-red-200/50">
          {error}
        </div>
      )}

      {/* Double column layout */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Gallery images */}
        <div className="md:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-primary/5 pb-3">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5"><ImageIcon className="w-5 h-5 text-primary" /> Album Images</h3>
            <button
              onClick={handleMockUpload}
              disabled={loading}
              className="h-9 px-4 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Add Photo
            </button>
          </div>

          {galleryPhotos.length === 0 ? (
            <div className="py-16 text-center text-xs opacity-60 border border-dashed border-primary/10 rounded-2xl">
              Your gallery is empty. Upload some photos to increase match rates.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryPhotos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-primary/5 shadow-inner">
                  <img src={photo} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDeletePhoto(idx)}
                      className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Privacy locks */}
        <div className="md:col-span-4 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-primary/15 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold uppercase opacity-65 flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> Photo Privacy</h4>
            
            <div className="space-y-2">
              {/* Option 1: Public */}
              <button
                onClick={() => handleUpdatePrivacy('PUBLIC')}
                disabled={loading}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  photoPrivacy === 'PUBLIC'
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-foreground/10 hover:bg-primary/5 opacity-70'
                }`}
              >
                <Eye className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="leading-none text-xs">
                  <div className="font-extrabold mb-1">Public</div>
                  <span className="opacity-60 text-[10px]">Everyone can view my photos.</span>
                </div>
              </button>

              {/* Option 2: Premium only */}
              <button
                onClick={() => handleUpdatePrivacy('PREMIUM_ONLY')}
                disabled={loading}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  photoPrivacy === 'PREMIUM_ONLY'
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-foreground/10 hover:bg-primary/5 opacity-70'
                }`}
              >
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="leading-none text-xs">
                  <div className="font-extrabold mb-1">Premium Only</div>
                  <span className="opacity-60 text-[10px]">Visible only to upgraded members.</span>
                </div>
              </button>

              {/* Option 3: Hidden */}
              <button
                onClick={() => handleUpdatePrivacy('HIDDEN')}
                disabled={loading}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  photoPrivacy === 'HIDDEN'
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-foreground/10 hover:bg-primary/5 opacity-70'
                }`}
              >
                <EyeOff className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="leading-none text-xs">
                  <div className="font-extrabold mb-1">Hidden / Private</div>
                  <span className="opacity-60 text-[10px]">Hide photos. Viewable upon request.</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-[10px] text-foreground/60 leading-relaxed flex items-start gap-2 select-none">
            <ShieldCheck className="w-4.5 h-4.5 text-primary shrink-0" />
            <span>Adding verified photos significantly boosts matching rates. All uploaded ID cards remain strictly confidential.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
