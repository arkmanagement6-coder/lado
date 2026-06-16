'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Send, Smile, Image, Mic, MoreVertical, Video, 
  ChevronLeft, MessageSquare, Check, CheckCheck, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

function ChatPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const partnerIdFromUrl = searchParams.get('partnerId');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Custom mock visual states
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 1. Fetch conversations list
  const fetchConversations = async (autoSelectId?: string) => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        
        // Handle auto selection on page load
        const targetSelectId = autoSelectId || partnerIdFromUrl;
        if (targetSelectId) {
          const found = data.find((c: any) => c.partnerId === targetSelectId);
          if (found) {
            setActivePartner(found);
          } else {
            // Fetch partner details directly if no conversation history exists yet
            const matchesRes = await fetch(`/api/matches`);
            if (matchesRes.ok) {
              const matches = await matchesRes.json();
              const match = matches.find((m: any) => m.id === targetSelectId);
              if (match) {
                const newPartner = {
                  partnerId: match.id,
                  partnerName: match.user?.name,
                  partnerPhoto: match.profilePhoto,
                  partnerVerified: match.user?.isVerified,
                  lastMessage: 'Start a new conversation!',
                  isSeen: true,
                  createdAt: new Date().toISOString()
                };
                setActivePartner(newPartner);
                setConversations(prev => [newPartner, ...prev]);
              }
            }
          }
        } else if (data.length > 0 && !activePartner) {
          // Select first chat by default
          setActivePartner(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [partnerIdFromUrl]);

  // 2. Fetch messages for active partner
  const fetchMessages = async () => {
    if (!activePartner) return;
    try {
      const res = await fetch(`/api/chat?receiverId=${activePartner.partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Poll messages every 4 seconds for real-time response simulation
    const interval = setInterval(() => {
      fetchMessages();
      fetchConversations(activePartner?.partnerId); // Keep last messages sync
    }, 4000);

    return () => clearInterval(interval);
  }, [activePartner]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent, mockFile?: { imageUrl?: string; voiceUrl?: string }) => {
    e.preventDefault();
    if (!inputText.trim() && !mockFile && !activePartner) return;

    const payload = {
      receiverId: activePartner.partnerId,
      content: inputText,
      ...mockFile
    };

    setInputText('');
    setShowEmoji(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newMsg = await res.json();
        // Append local message instantly for UI responsiveness
        setMessages(prev => [...prev, newMsg]);
        
        // Trigger simulated typing indicator on target bot replies
        const botAccounts = ['bride-id-1', 'bride-id-2', 'bride-id-3', 'groom-id-1', 'groom-id-2', 'groom-id-3'];
        if (botAccounts.includes(activePartner.partnerId)) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            fetchMessages(); // Pull fresh replies
          }, 1800);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mock Emoji click helper
  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  // Mock Upload Image or Voice notes
  const handleMockAttachment = (type: 'image' | 'voice') => {
    if (type === 'image') {
      handleSendMessage({ preventDefault: () => {} } as any, { 
        imageUrl: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=400&q=80' 
      });
      alert("Mock photo uploaded and sent!");
    } else {
      handleSendMessage({ preventDefault: () => {} } as any, { 
        voiceUrl: '#mock_audio_bio' 
      });
      alert("Recorded mock voice bio note and sent!");
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="h-[75vh] glass-panel border border-primary/10 rounded-[32px] overflow-hidden flex shadow-xl select-none">
      
      {/* 1. Conversations Sidebar List */}
      <aside className={`w-full md:w-80 border-r border-primary/10 flex flex-col shrink-0 ${activePartner ? 'hidden md:flex' : 'flex'}`}>
        <div className="h-16 px-6 border-b border-primary/5 flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-primary" /> Active Chats</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-primary/5 p-2 space-y-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-60">
              No conversations active. Connect matches from search to unlock chat features.
            </div>
          ) : (
            conversations.map(conv => {
              const active = activePartner?.partnerId === conv.partnerId;
              return (
                <button
                  key={conv.partnerId}
                  onClick={() => setActivePartner(conv)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                    active 
                      ? 'gradient-bg text-white shadow-md shadow-primary/15' 
                      : 'hover:bg-primary/5 text-foreground'
                  }`}
                >
                  <img 
                    src={conv.partnerPhoto || 'https://placehold.co/100x100/png?text=Photo'} 
                    alt={conv.partnerName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/20"
                  />
                  <div className="flex-1 min-w-0 leading-none">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold truncate pr-2">{conv.partnerName}</h4>
                      {!conv.isSeen && conv.senderId !== user?.id && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0" />
                      )}
                    </div>
                    <p className={`text-[10px] truncate ${active ? 'text-white/80' : 'opacity-60'}`}>{conv.lastMessage}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Messages Timeline Chat Box */}
      {activePartner ? (
        <section className="flex-1 flex flex-col justify-between bg-primary/5/30 h-full">
          
          {/* Timeline Title bar */}
          <div className="h-16 px-6 border-b border-primary/5 flex items-center justify-between shrink-0 bg-background/40 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back button on mobile */}
              <button 
                onClick={() => setActivePartner(null)}
                className="md:hidden p-1.5 rounded-lg border border-primary/10 text-primary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <img 
                src={activePartner.partnerPhoto || 'https://placehold.co/100x100/png?text=Photo'} 
                alt={activePartner.partnerName}
                className="w-9 h-9 rounded-xl object-cover border border-primary/15"
              />
              <div className="leading-none min-w-0">
                <h4 className="text-xs font-bold truncate">{activePartner.partnerName}</h4>
                <span className="text-[9px] text-green-600 font-bold">Online</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/video-call?partnerId=${activePartner.partnerId}`)}
                className="p-2 rounded-xl border border-primary/10 text-primary hover:bg-primary/5 transition-all shadow-sm"
                title="Start Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 text-foreground/45">
                <MoreVertical className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Messages Lists */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/25">
            {messages.map((msg) => {
              const isSelf = msg.senderId === user?.id;
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] space-y-1.5 ${isSelf ? 'text-right' : 'text-left'}`}>
                    
                    {/* Message Balloon */}
                    <div className={`p-3.5 rounded-3xl shadow-sm inline-block text-xs leading-relaxed text-left ${
                      isSelf 
                        ? 'gradient-bg text-white rounded-tr-none' 
                        : 'bg-background border border-primary/10 text-foreground rounded-tl-none'
                    }`}>
                      {/* Render text content */}
                      {msg.content && <p>{msg.content}</p>}
                      
                      {/* Render image attachments */}
                      {msg.imageUrl && (
                        <div className="rounded-xl overflow-hidden mt-1 max-w-[200px] border border-white/20">
                          <img src={msg.imageUrl} alt="Chat Attachment" className="w-full h-auto" />
                        </div>
                      )}

                      {/* Render voice notes */}
                      {msg.voiceUrl && (
                        <div className="flex items-center gap-2 mt-1.5 bg-black/10 dark:bg-white/10 p-2 rounded-2xl">
                          <Mic className="w-4 h-4 text-primary shrink-0" />
                          <div className="w-28 h-2 bg-primary/20 rounded-full overflow-hidden relative">
                            <div className="h-full bg-primary w-2/3" />
                          </div>
                          <span className="text-[8px] font-bold opacity-75 shrink-0">0:14</span>
                        </div>
                      )}
                    </div>

                    {/* Time & Read Checkmarks */}
                    <div className="flex items-center gap-1 justify-end text-[8px] opacity-50 px-1">
                      <span>{formatTime(msg.createdAt)}</span>
                      {isSelf && (
                        msg.isSeen ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5" />
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Typing animation block */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background border border-primary/10 p-3.5 rounded-3xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input control bar */}
          <div className="p-4 border-t border-primary/5 bg-background/40 backdrop-blur-md relative shrink-0">
            
            {/* Emoji palette mock overlay */}
            {showEmoji && (
              <div className="absolute bottom-20 left-4 bg-background border border-primary/15 p-3 rounded-2xl shadow-xl z-20 flex gap-2 text-base">
                {['😊', '❤️', '🌹', '✨', '👋', '🎉', '🙏'].map(e => (
                  <button key={e} onClick={() => handleEmojiClick(e)} className="hover:scale-125 transition-all">{e}</button>
                ))}
              </div>
            )}

            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
              
              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 rounded-xl text-primary hover:bg-primary/5"
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleMockAttachment('image')}
                className="p-2 rounded-xl text-primary hover:bg-primary/5"
                title="Attach Photo"
              >
                <Image className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleMockAttachment('voice')}
                className="p-2 rounded-xl text-primary hover:bg-primary/5"
                title="Record Voice note"
              >
                <Mic className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-11 px-4 rounded-xl border border-primary/15 glass-input text-xs"
              />

              <button
                type="submit"
                className="h-11 w-11 rounded-xl gradient-bg text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0 cursor-pointer"
              >
                <Send className="w-4.5 h-4.5 fill-white" />
              </button>

            </form>
          </div>

        </section>
      ) : (
        // Chat placeholder when no contact selected (on desktop size)
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-primary/5/10 p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-base font-extrabold">Your Secure Chat Workspace</h3>
          <p className="text-xs text-foreground/50 max-w-sm">Select an active conversation channel from the sidebar list to connect and start chatting.</p>
        </div>
      )}

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-foreground/60">Loading chat workspace...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
