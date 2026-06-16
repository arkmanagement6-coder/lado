'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, Heart, MessageSquare, Sparkles, CreditCard, 
  CheckCircle, Trash2, ShieldAlert, CheckCheck 
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' });
      if (res.ok) {
        // Toggle local state
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        alert("All notifications marked as read");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'INTEREST_RECEIVED':
        return <Heart className="w-5 h-5 text-primary fill-primary/10" />;
      case 'CHAT_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-blue-500 fill-blue-500/10" />;
      case 'MATCH_FOUND':
        return <Sparkles className="w-5 h-5 text-accent fill-accent/10" />;
      case 'SUBSCRIPTION_EXPIRY':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-3xl space-y-6 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-primary/5 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Notification Feed</h2>
          <p className="text-xs text-foreground/60">Real-time alerts regarding interest expressions, chats, and subscriptions.</p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="h-9 px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Output list */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-xs opacity-60 border border-dashed border-primary/10 rounded-3xl">
          No notifications recorded in your inbox.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`glass-panel p-4 rounded-2xl border transition-all flex items-start gap-4 shadow-sm ${
                !n.isRead 
                  ? 'border-primary bg-primary/5' 
                  : 'border-primary/5 bg-background'
              }`}
            >
              {/* Notification Type Icon */}
              <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                {getIcon(n.type)}
              </div>

              {/* Title & Body */}
              <div className="flex-1 min-w-0 leading-tight space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold">{n.title}</h4>
                  <span className="text-[9px] opacity-45">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-foreground/75 leading-relaxed">{n.content}</p>
              </div>

              {/* Unread Ping indicator */}
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center animate-pulse" />
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
