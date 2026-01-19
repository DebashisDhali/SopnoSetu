"use client";
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Eye, ShieldCheck, History, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/services/api';

interface MentorApplication {
    _id: string;
    university: string;
    department: string;
    bio: string;
    paymentNumber?: string;
    user: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
        isMentorVerified: boolean;
        studentIdUrl?: string;
    };
    walletBalance: number;
}

const AdminDashboard = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [applications, setApplications] = useState<MentorApplication[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'applications' | 'stats' | 'settings'>('applications');

    // Data Presence Tracking
    const [fetched, setFetched] = useState<{ [key: string]: boolean }>({
        applications: false,
        stats: false,
        settings: false
    });

    // Granular Loading States
    const [fetchingApps, setFetchingApps] = useState(false);
    const [fetchingStats, setFetchingStats] = useState(false);
    const [fetchingSettings, setFetchingSettings] = useState(false);
    const [fetchingTrans, setFetchingTrans] = useState(false);

    // Dialog & Form States
    const [selectedApp, setSelectedApp] = useState<MentorApplication | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutTxId, setPayoutTxId] = useState('');
    const [processingPayout, setProcessingPayout] = useState(false);

    const [adminNumber, setAdminNumber] = useState('');
    const [commRate, setCommRate] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [yearlyPrice, setYearlyPrice] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    const [isDeclineConfirmOpen, setIsDeclineConfirmOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchApplications = useCallback(async (force = false) => {
        if (!force && fetched.applications) return;
        setFetchingApps(true);
        try {
            const { data } = await api.get('/admin/mentor-applications');
            setApplications(Array.isArray(data) ? data : []);
            setFetched(prev => ({ ...prev, applications: true }));
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setFetchingApps(false);
        }
    }, [fetched.applications]);

    const fetchStats = useCallback(async (force = false) => {
        if (!force && fetched.stats) return;
        setFetchingStats(true);
        setFetchingTrans(true);
        try {
            const [statsRes, transRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/transactions')
            ]);
            setStats(statsRes.data);
            setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
            setFetched(prev => ({ ...prev, stats: true }));
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setFetchingStats(false);
            setFetchingTrans(false);
        }
    }, [fetched.stats]);

    const fetchSettings = useCallback(async (force = false) => {
        if (!force && fetched.settings) return;
        setFetchingSettings(true);
        try {
            const { data } = await api.get('/admin/settings');
            if (data) {
                setAdminNumber(data.adminPaymentNumber || '');
                setCommRate(data.commissionRate?.toString() || '20');
                setMonthlyPrice(data.monthlyPrice?.toString() || '500');
                setYearlyPrice(data.yearlyPrice?.toString() || '5000');
                setFetched(prev => ({ ...prev, settings: true }));
            }
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setFetchingSettings(false);
        }
    }, [fetched.settings]);

    useEffect(() => {
        if (!isMounted) return;
        if (activeTab === 'applications') fetchApplications();
        if (activeTab === 'stats') fetchStats();
        if (activeTab === 'settings') fetchSettings();
    }, [activeTab, isMounted, fetchApplications, fetchStats, fetchSettings]);

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await api.put('/admin/settings', {
                adminPaymentNumber: adminNumber,
                commissionRate: Number(commRate),
                monthlyPrice: Number(monthlyPrice),
                yearlyPrice: Number(yearlyPrice)
            });
            toast.success("Settings updated successfully");
            fetchSettings(true);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setSavingSettings(false);
        }
    };

    const handlePayout = async (mentorId: string, balance: number) => {
        const amount = Number(payoutAmount);
        if (!payoutAmount || amount <= 0) {
            toast.error("Enter valid amount");
            return;
        }
        if (amount > balance) {
            toast.error("Insufficient balance");
            return;
        }

        setProcessingPayout(true);
        try {
            await api.post(`/admin/payout/${mentorId}`, {
                amount: amount,
                transactionId: payoutTxId || `MANUAL-${Date.now()}`
            });
            toast.success("Payout marked as completed");
            setPayoutAmount('');
            setPayoutTxId('');
            fetchStats(true);
        } catch (e: any) {
            toast.error(getErrorMessage(e) || "Payout failed");
        } finally {
            setProcessingPayout(false);
        }
    };

    const handleVerify = async (userId: string) => {
        if (!userId) return;
        setVerifying(true);
        try {
            await api.put(`/admin/verify-mentor/${userId}`);
            toast.success("Mentor verified");
            fetchApplications(true);
            setIsDialogOpen(false);
        } catch (e: any) {
            toast.error(getErrorMessage(e));
        } finally {
            setVerifying(false);
        }
    };

    const handleUnverify = async (userId: string) => {
        if (!userId) return;
        setVerifying(true);
        try {
            await api.put(`/admin/unverify-mentor/${userId}`);
            toast.success("Mentor unverified");
            fetchApplications(true);
            setIsDialogOpen(false);
        } catch (e: any) {
            toast.error(getErrorMessage(e));
        } finally {
            setVerifying(false);
        }
    };

    const [declining, setDeclining] = useState(false);
    const handleDecline = async (userId: string) => {
        if (!userId) return;
        setDeclining(true);
        try {
            await api.delete(`/admin/decline-mentor/${userId}`);
            toast.success("Deleted application");
            fetchApplications(true);
            setIsDeclineConfirmOpen(false);
            setIsDialogOpen(false);
        } catch (e: any) {
            toast.error(getErrorMessage(e));
        } finally {
            setDeclining(false);
        }
    };

    const openReviewDialog = (app: MentorApplication) => {
        setSelectedApp(app);
        setIsDialogOpen(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) { return 'N/A'; }
    };

    if (!isMounted) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Control Center</h2>
                    <p className="text-slate-500 font-medium">Data-driven platform management.</p>
                </div>
                <div className="flex p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
                    <button onClick={() => setActiveTab('applications')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Mentors</button>
                    <button onClick={() => setActiveTab('stats')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Finances</button>
                    <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Config</button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Gross Revenue", val: stats?.totalRevenue, sub: "Total Inflow", color: "bg-slate-900 text-white" },
                            { label: "Platform Profit", val: stats?.totalCommission, sub: "Service Fee", color: "bg-white text-emerald-600" },
                            { label: "Total Payouts", val: stats?.totalMentorPayout, sub: "Settled", color: "bg-white text-slate-900" },
                            { label: "Wallet Balance", val: stats?.totalPendingBalance, sub: "Liabilities", color: "bg-brand-600 text-white" }
                        ].map((card, i) => (
                            <Card key={i} className={`border-slate-100 shadow-sm rounded-3xl overflow-hidden ${card.color}`}>
                                <CardContent className="p-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{card.label}</p>
                                    {fetchingStats ? (
                                        <div className="h-8 w-24 bg-slate-500/20 animate-pulse rounded-lg mt-2 mb-2" />
                                    ) : (
                                        <p className="text-3xl font-black tracking-tighter">৳{card.val || 0}</p>
                                    )}
                                    <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-tighter">{card.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-4">Payout Ledger</h4>
                            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden bg-white">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Mentor</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Available</th>
                                                    <th className="px-6 py-4 text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {fetchingStats ? (
                                                    [1, 2, 3].map(i => (
                                                        <tr key={i} className="animate-pulse">
                                                            <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                                                            <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                                                            <td className="px-6 py-4"><div className="h-8 w-20 bg-slate-100 rounded ml-auto" /></td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    applications.filter(a => a.user?.isMentorVerified && a.walletBalance > 0).map(app => (
                                                        <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-6">
                                                                <p className="font-black text-slate-900">{app.user?.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{app.user?.phone}</p>
                                                            </td>
                                                            <td className="px-6 py-6 font-black text-lg tracking-tighter">৳{app.walletBalance}</td>
                                                            <td className="px-6 py-6 text-right">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button size="sm" onClick={() => { setPayoutAmount(app.walletBalance.toString()); setPayoutTxId(''); }} className="bg-slate-900 hover:bg-brand-600 text-white font-black text-[9px] uppercase px-4 rounded-xl">Settlement</Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="rounded-3xl max-w-sm">
                                                                        <DialogHeader><DialogTitle className="font-black">Confirm Payout</DialogTitle></DialogHeader>
                                                                        <div className="space-y-4 py-4">
                                                                            <div className="bg-slate-50 p-4 rounded-2xl">
                                                                                <p className="text-[9px] uppercase font-black text-slate-400">To {app.user?.name}</p>
                                                                                <p className="text-xl font-black">৳{app.walletBalance}</p>
                                                                            </div>
                                                                            <input type="number" placeholder="Amount" className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 font-black" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} />
                                                                            <input type="text" placeholder="TX ID (Optional)" className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 font-bold" value={payoutTxId} onChange={e => setPayoutTxId(e.target.value)} />
                                                                        </div>
                                                                        <Button className="w-full h-14 bg-brand-600 font-black uppercase" onClick={() => app.user?._id && handlePayout(app.user._id, app.walletBalance)} disabled={processingPayout}>
                                                                            {processingPayout ? <Loader2 className="animate-spin" /> : "Complete Payout"}
                                                                        </Button>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-4">History</h4>
                            <Card className="rounded-3xl border-0 shadow-sm bg-slate-900 text-white overflow-hidden">
                                <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                                    {fetchingTrans ? (
                                        <div className="p-6 space-y-4">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-white/5 animate-pulse rounded-lg" />)}
                                        </div>
                                    ) : (
                                        transactions.map(t => (
                                            <div key={t._id} className="p-5 border-b border-white/5 flex justify-between items-center group hover:bg-white/5 transition-colors">
                                                <div>
                                                    <p className="text-xs font-black">{t.type === 'payout' ? t.mentor?.name : t.user?.name || 'User'}</p>
                                                    <p className="text-[9px] font-mono opacity-40">{t.transactionId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black">৳{t.amount}</p>
                                                    <p className="text-[8px] font-black uppercase opacity-40">{t.type}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'applications' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b p-6">
                            <CardTitle className="text-lg font-black">Mentor Verification Queue</CardTitle>
                            <CardDescription className="text-xs">Filter and evaluate pending applications.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-[10px] font-black uppercase text-slate-400">
                                            <th className="px-6 py-4 text-left">Candidate</th>
                                            <th className="px-6 py-4 text-left">Academic Background</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {fetchingApps ? (
                                            [1, 2, 3, 4].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-6 py-6"><div className="h-10 w-40 bg-slate-100 rounded-xl" /></td>
                                                    <td className="px-6 py-6"><div className="h-10 w-48 bg-slate-100 rounded-xl" /></td>
                                                    <td className="px-6 py-6"><div className="h-6 w-20 bg-slate-100 rounded-lg mx-auto" /></td>
                                                    <td className="px-6 py-6"><div className="h-10 w-24 bg-slate-100 rounded-xl ml-auto" /></td>
                                                </tr>
                                            ))
                                        ) : (
                                            applications.map(app => (
                                                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-6">
                                                        <p className="font-black text-slate-900">{app.user?.name || 'Incomplete Profile'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{app.user?.email}</p>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <p className="font-bold text-slate-700">{app.university}</p>
                                                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-tighter">{app.department}</p>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        {app.user?.isMentorVerified ? (
                                                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-emerald-100">Verified</span>
                                                        ) : (
                                                            <span className="bg-amber-50 text-amber-700 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-amber-100">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <Button size="sm" variant="outline" onClick={() => openReviewDialog(app)} className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-brand-50 hover:text-brand-600">Review Application</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
                    <Card className="rounded-3xl border-0 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <CardTitle className="text-xl font-black flex items-center gap-2"><ShieldCheck /> Platform Settings</CardTitle>
                            <p className="text-slate-400 text-xs mt-1">Configure global pricing and commissions.</p>
                        </CardHeader>
                        <CardContent className="p-8">
                            {fetchingSettings ? (
                                <div className="space-y-6">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-50 animate-pulse rounded-2xl" />)}
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateSettings} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment Bkash/Nagad</label>
                                        <input type="text" value={adminNumber} onChange={e => setAdminNumber(e.target.value)} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-5 text-lg font-black focus:ring-2 ring-brand-500 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Revenue Share (%)</label>
                                        <input type="number" value={commRate} onChange={e => setCommRate(e.target.value)} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-5 text-2xl font-black focus:ring-2 ring-brand-500 transition-all outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Monthly Cost</label>
                                            <input type="number" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-5 font-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Yearly Cost</label>
                                            <input type="number" value={yearlyPrice} onChange={e => setYearlyPrice(e.target.value)} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-5 font-black" />
                                        </div>
                                    </div>
                                    <Button className="w-full h-16 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-sm rounded-2xl shadow-lg shadow-brand-500/20" disabled={savingSettings}>
                                        {savingSettings ? <Loader2 className="animate-spin" /> : "Broadcast Global Settings"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Profile Review Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl rounded-[2rem] overflow-hidden border-0 shadow-2xl p-0">
                    {selectedApp && (
                        <div className="flex flex-col">
                            <div className="bg-slate-900 text-white p-8">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white italic">
                                        {(selectedApp.user?.name || '?')[0]}
                                    </div>
                                    {selectedApp.user?.name || 'Unknown Candidate'}
                                </h2>
                                <p className="text-brand-400 font-bold text-xs uppercase tracking-widest mt-2 ml-14">{selectedApp.university} &bull; {selectedApp.department}</p>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Contact Email</p>
                                        <p className="font-bold text-slate-800">{selectedApp.user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Phone Number</p>
                                        <p className="font-bold text-slate-800">{selectedApp.user?.phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Personal Bio</p>
                                        <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedApp.bio || 'No bio provided'}"</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Verification Document</p>
                                    <div className="aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-100 flex items-center justify-center relative group">
                                        {selectedApp.user?.studentIdUrl ? (
                                            <img src={selectedApp.user.studentIdUrl} alt="ID" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <p className="text-slate-300 font-bold uppercase text-[10px]">No image uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 flex gap-3 border-t">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Back</Button>
                                {selectedApp.user && !selectedApp.user.isMentorVerified && (
                                    <>
                                        <Button variant="destructive" onClick={() => setIsDeclineConfirmOpen(true)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6" disabled={declining}>Drop Application</Button>
                                        <Button onClick={() => handleVerify(selectedApp.user._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-8 ml-auto" disabled={verifying}>Approve Mentor</Button>
                                    </>
                                )}
                                {selectedApp.user?.isMentorVerified && (
                                    <Button variant="outline" onClick={() => handleUnverify(selectedApp.user._id)} className="rounded-xl font-black uppercase text-[10px] tracking-widest text-red-500 border-red-100 ml-auto" disabled={verifying}>Revoke Verification</Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={isDeclineConfirmOpen} onOpenChange={setIsDeclineConfirmOpen}>
                <DialogContent className="max-w-sm rounded-[2rem] p-8 text-center space-y-4">
                    <h2 className="text-2xl font-black text-slate-900">Final Warning</h2>
                    <p className="text-slate-500 text-sm">Deleting this application is permanent. The candidate will need to apply again.</p>
                    <div className="flex flex-col gap-2 pt-4">
                        <Button variant="destructive" className="h-14 rounded-2xl font-black uppercase tracking-widest" onClick={() => selectedApp?.user?._id && handleDecline(selectedApp.user._id)} disabled={declining}>Delete Permanently</Button>
                        <Button variant="ghost" onClick={() => setIsDeclineConfirmOpen(false)}>Cancel</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
