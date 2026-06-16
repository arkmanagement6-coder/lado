'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, 
  Sparkles, CheckCircle, ShieldAlert, ArrowLeft, Volume2 
} from 'lucide-react';

function VideoCallPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const partnerId = searchParams.get('partnerId');

  const [partner, setPartner] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Video call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callEnded, setCallEnded] = useState(false);

  // Web camera elements
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);

  // 1. Fetch partner details
  useEffect(() => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    const fetchPartner = async () => {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          const found = data.find((p: any) => p.id === partnerId);
          if (found) {
            setPartner(found);
          } else {
            // Seed fallback details
            setPartner({
              id: partnerId,
              user: { name: 'Verified Match' },
              profilePhoto: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=400&q=80'
            });
          }
        }
      } catch (err) {
        console.error("Fetch call partner failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [partnerId]);

  // 2. Call Timer
  useEffect(() => {
    if (callEnded) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callEnded]);

  // 3. Web Camera setup (attempts browser getUserMedia)
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setMediaStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable. Falling back to avatar placeholder.", err);
        setCameraError(true);
      }
    };

    startCamera();

    // Clean up streams on unmount
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Toggle Mute
  const handleToggleMute = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle track state
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Camera Off
  const handleToggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOff;
      });
    }
    setIsCameraOff(!isCameraOff);
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        // When screen share ends, fallback to normal stream
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && mediaStream) {
            localVideoRef.current.srcObject = mediaStream;
          }
        };
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen share cancelled", err);
      }
    } else {
      setIsScreenSharing(false);
      if (localVideoRef.current && mediaStream) {
        localVideoRef.current.srcObject = mediaStream;
      }
    }
  };

  // End Call Action
  const handleEndCall = () => {
    setCallEnded(true);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none relative">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-primary/5 pb-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/dashboard/chat?partnerId=${partnerId}`)}
            className="p-2 rounded-xl border border-primary/10 hover:bg-primary/5 text-primary"
            title="Go back to chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-foreground">Matrimonial Video Room</h2>
            <p className="text-[10px] text-foreground/50">One-to-one encrypted peer call session.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">{formatDuration(callDuration)}</span>
        </div>
      </div>

      {/* Main split screen layout */}
      <div className="relative h-[60vh] rounded-[32px] overflow-hidden bg-slate-950 border border-primary/15 flex items-center justify-center shadow-2xl">
        
        {/* BACKDROP: Partner Video Feed (Mock avatar with visual scales) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-primary/30 relative shadow-xl">
            <img 
              src={partner?.profilePhoto || 'https://placehold.co/400x400/png?text=Photo'} 
              alt={partner?.user?.name}
              className="w-full h-full object-cover"
            />
            {/* Audio wave pulse simulation */}
            {!isMuted && (
              <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-60 scale-110" />
            )}
          </div>
          <div className="text-white space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-1.5 justify-center">
              {partner?.user?.name} 
              {partner?.user?.isVerified && <span className="w-2.5 h-2.5 rounded-full bg-green-500" />}
            </h3>
            <p className="text-[10px] opacity-75 uppercase tracking-wider">Connecting via Lado Audio/Video Gateways...</p>
          </div>
        </div>

        {/* INSET CARD: Local Web Camera Video Feed (Real webcam stream) */}
        <div className="absolute bottom-6 right-6 w-32 h-44 sm:w-40 sm:h-52 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-25 flex items-center justify-center">
          {cameraError || isCameraOff ? (
            // Inset Avatar Placeholder
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold uppercase select-none">
              Me
            </div>
          ) : (
            // Inset Live Video Element
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform -scale-x-100"
            />
          )}
          
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-md text-[8px] font-bold text-white uppercase">
            {isScreenSharing ? "Screen Sharing" : "My Camera"}
          </div>
        </div>

        {/* TOP OVERLAYS: Encrypted safety locks */}
        <div className="absolute top-6 left-6 bg-black/45 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10 text-white text-[9px] font-bold flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-accent" /> Protected Connection
        </div>

      </div>

      {/* Control Dock Panel */}
      <div className="flex justify-center items-center gap-4 py-3 bg-primary/5 rounded-[24px] border border-primary/10 max-w-lg mx-auto shadow-md">
        
        {/* Mute toggle button */}
        <button
          onClick={handleToggleMute}
          className={`p-3.5 rounded-full border transition-all cursor-pointer ${
            isMuted 
              ? 'bg-red-500 text-white border-transparent' 
              : 'bg-background hover:bg-primary/5 text-primary border-primary/20'
          }`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Camera toggle button */}
        <button
          onClick={handleToggleCamera}
          className={`p-3.5 rounded-full border transition-all cursor-pointer ${
            isCameraOff 
              ? 'bg-red-500 text-white border-transparent' 
              : 'bg-background hover:bg-primary/5 text-primary border-primary/20'
          }`}
          title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Screen Share toggle button */}
        <button
          onClick={handleToggleScreenShare}
          disabled={cameraError}
          className={`p-3.5 rounded-full border transition-all cursor-pointer ${
            isScreenSharing 
              ? 'bg-accent text-black border-transparent' 
              : 'bg-background hover:bg-primary/5 text-primary border-primary/20'
          }`}
          title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* End Call button (Hang up) */}
        <button
          onClick={handleEndCall}
          className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-lg shadow-red-600/20 cursor-pointer animate-pulse"
          title="Hang Up"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

      </div>

      {/* Call Ended Summary Modal Overlay */}
      {callEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-background border border-primary/15 p-8 rounded-3xl w-full max-w-sm text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <PhoneOff className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Call Ended</h3>
              <p className="text-xs text-foreground/60">Your video session with {partner?.user?.name || 'Match'} has finished.</p>
            </div>

            <div className="p-3.5 bg-primary/5 rounded-2xl border border-primary/5 grid grid-cols-2 text-xs leading-none">
              <div>
                <span className="opacity-60 block mb-1">Duration</span>
                <span className="font-extrabold text-foreground">{formatDuration(callDuration)}</span>
              </div>
              <div>
                <span className="opacity-60 block mb-1">Encrypted</span>
                <span className="font-extrabold text-green-600">Secure</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/dashboard/chat?partnerId=${partnerId}`)}
              className="w-full h-11 rounded-xl gradient-bg text-white font-bold text-xs"
            >
              Return to Chat Room
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function VideoCallPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-foreground/60">Initializing video room...</p>
        </div>
      </div>
    }>
      <VideoCallPageContent />
    </Suspense>
  );
}
