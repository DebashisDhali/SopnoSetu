"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Info, MessageCircle, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error: any) {
            console.error("FAILED TO FETCH NOTIFICATIONS:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const markRead = async (id: string, link?: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (link) {
                router.push(link);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) { }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_message': return <MessageCircle size={14} className="text-blue-500" />;
            case 'session_request':
            case 'session_accepted':
            case 'session_cancelled': return <Calendar size={14} className="text-emerald-500" />;
            case 'review_received': return <Star size={14} className="text-amber-500" />;
            default: return <Info size={14} className="text-slate-500" />;
        }
    };

    const formatNotificationTime = (dateStr: string) => {
        if (!isMounted) return '';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            if (date.toLocaleDateString() !== now.toLocaleDateString()) {
                return date.toLocaleDateString();
            }
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    }

    if (!isMounted) return (
        <div className="p-2 rounded-full">
            <Bell size={20} className="text-slate-400 opacity-50" />
        </div>
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors">
                    <Bell size={20} className="text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center font-bold px-1 border-2 border-white animate-in zoom-in">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl border-brand-100 shadow-2xl" align="end">
                <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Notifications</h3>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider">
                            Mark all as read
                        </button>
                    )}
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-12 px-4 text-center text-slate-400 text-sm italic">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => markRead(n._id, n.link)}
                                className={`p-4 border-b flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-brand-50/50' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100 opacity-60'}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="space-y-0.5">
                                    <p className={`text-[13px] leading-tight ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                                        {n.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                        {formatNotificationTime(n.createdAt)}
                                    </p>
                                </div>
                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />}
                            </div>
                        ))
                    )}
                </div>
                <div className="p-2 bg-slate-50 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold text-slate-600" onClick={() => router.push('/dashboard?view=notifications')}>
                        View All Activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
