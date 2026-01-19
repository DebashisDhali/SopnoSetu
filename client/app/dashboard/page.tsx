"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import CandidateDashboard from '@/components/dashboard/CandidateDashboard';
import MentorDashboard from '@/components/dashboard/MentorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';
import ChatSection from '@/components/chat/ChatSection';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const activeView = searchParams.get('view') || 'overview';

    useEffect(() => {
        const checkAuth = async () => {
            // Check local storage first for speed
            const localUser = localStorage.getItem('user');
            if (localUser) {
                try {
                    setUser(JSON.parse(localUser));
                    setLoading(false);
                } catch (e) { }
            }

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
    }, [router]);

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Simple Tab Navigation */}
                <div className="flex border-b border-slate-200 mb-8 space-x-8">
                    <button
                        onClick={() => router.push('/dashboard?view=overview')}
                        className={`pb-4 px-2 text-sm font-bold transition-all ${activeView === 'overview' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => router.push('/dashboard?view=messages')}
                        className={`pb-4 px-2 text-sm font-bold transition-all ${activeView === 'messages' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Messages
                    </button>
                </div>

                {activeView === 'overview' ? (
                    <>
                        {user.role === 'mentor' ? (
                            <MentorDashboard user={user} />
                        ) : user.role === 'admin' ? (
                            <AdminDashboard />
                        ) : (
                            <CandidateDashboard />
                        )}
                    </>
                ) : (
                    <ChatSection />
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}
