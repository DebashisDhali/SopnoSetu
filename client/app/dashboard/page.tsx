"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import CandidateDashboard from '@/components/dashboard/CandidateDashboard';
import MentorDashboard from '@/components/dashboard/MentorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2, LayoutDashboard, MessageSquare } from 'lucide-react';
import ChatSection from '@/components/chat/ChatSection';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const activeView = searchParams.get('view') || 'overview';
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = async () => {
        try {
            const { data } = await api.get('/chat/unread-count');
            setUnreadCount(data.count);
        } catch (e) { }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
                fetchUnread();
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const interval = setInterval(() => {
            fetchUnread();
        }, 10000);

        return () => clearInterval(interval);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium tracking-tight">Please wait...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Dashboard Header/Tabs */}
            <div className="bg-white border-b sticky top-16 z-20 shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Welcome back, <span className="text-brand-600">{user.name}</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${user.role === 'mentor' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                {user.role === 'mentor' ? 'Verified Mentor' : user.role === 'admin' ? 'System Administrator' : 'Student Dashboard'}
                            </p>
                        </div>

                        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => router.push(`/dashboard?view=${tab.id}`)}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all relative ${activeView === tab.id
                                        ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                    {tab.id === 'messages' && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 absolute -top-1 -right-1 border-2 border-white shadow-sm animate-bounce">
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
                {activeView === 'overview' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {user.role === 'mentor' ? (
                            <MentorDashboard user={user} />
                        ) : user.role === 'admin' ? (
                            <AdminDashboard />
                        ) : (
                            <CandidateDashboard />
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ChatSection />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium tracking-tight">Loading Dashboard...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

