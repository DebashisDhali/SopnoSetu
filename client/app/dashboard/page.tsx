"use client";
import React, { useEffect, useState, Suspense, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import CandidateDashboard from '@/components/dashboard/CandidateDashboard';
import MentorDashboard from '@/components/dashboard/MentorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2, LayoutDashboard, MessageSquare } from 'lucide-react';
import ChatSection from '@/components/chat/ChatSection';

// Memoized Dashboard Shell to prevent unnecessary re-renders of the frame
const DashboardFrame = memo(({ children, user, tabs, activeView, unreadCount, onTabChange }: any) => {
    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Dashboard Header/Tabs */}
            <div className="bg-white border-b sticky top-16 z-20 shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Welcome, <span className="text-brand-600 italic uppercase">{user.name}</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                <span className={`w-2 h-2 rounded-full ${user.role === 'mentor' ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></span>
                                {user.role === 'mentor' ? 'Verified Mentor' : user.role === 'admin' ? 'System Administrator' : 'Student Access'}
                            </p>
                        </div>

                        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                            {tabs.map((tab: any) => (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeView === tab.id
                                        ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {tab.id === 'messages' && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center font-black absolute -top-1 -right-1 border-2 border-white shadow-md animate-bounce">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
});

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const activeView = searchParams.get('view') || 'overview';

    // Fast Auth Sync
    useEffect(() => {
        const checkAuth = async () => {
            // Priority 1: Instant local check
            const localUser = localStorage.getItem('user');
            if (localUser) {
                try {
                    setUser(JSON.parse(localUser));
                    setLoading(false);
                } catch (e) { /* silent fail */ }
            }

            // Priority 2: Verify with server quietly
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            } catch (error) {
                if (!localUser) router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Unread poll
        const fetchUnread = async () => {
            try {
                const { data } = await api.get('/chat/unread-count');
                setUnreadCount(data.count);
            } catch (e) { }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [router]);

    const handleTabChange = (view: string) => {
        router.push(`/dashboard?view=${view}`, { scroll: false });
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const tabs = [
        { id: 'overview', label: 'Main', icon: LayoutDashboard },
        { id: 'messages', label: 'Inbox', icon: MessageSquare },
    ];

    return (
        <DashboardFrame
            user={user}
            tabs={tabs}
            activeView={activeView}
            unreadCount={unreadCount}
            onTabChange={handleTabChange}
        >
            {activeView === 'overview' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {user.role === 'mentor' ? (
                        <MentorDashboard user={user} />
                    ) : user.role === 'admin' ? (
                        <AdminDashboard />
                    ) : (
                        <CandidateDashboard />
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ChatSection />
                </div>
            )}
        </DashboardFrame>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
