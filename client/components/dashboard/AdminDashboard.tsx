"use client";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, CheckCircle, XCircle, Eye, ShieldCheck, Mail, Building, FileText, Ban, History, Activity, TrendingUp, Wallet, CreditCard, ArrowUpRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import { StatusAlert } from '@/components/ui/status-alert';
import { getErrorMessage } from '@/services/api';

interface MentorApplication {
    _id: string; // This is the MentorProfile ID
    university: string;
    department: string;
    bio: string;
    paymentNumber?: string;
    paymentMethods?: string[];
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
    const [applications, setApplications] = useState<MentorApplication[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'applications' | 'stats' | 'settings'>('applications');

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
    const [monthlyMentors, setMonthlyMentors] = useState('');
    const [yearlyMentors, setYearlyMentors] = useState('');
    const [monthlySessions, setMonthlySessions] = useState('');
    const [yearlySessions, setYearlySessions] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    const [isDeclineConfirmOpen, setIsDeclineConfirmOpen] = useState(false);

    const fetchApplications = async () => {
        setFetchingApps(true);
        try {
            const { data } = await api.get('/admin/mentor-applications');
            setApplications(data);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setFetchingApps(false);
        }
    };

    const fetchStats = async () => {
        setFetchingStats(true);
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setFetchingStats(false);
        }
    };

    const fetchSettings = async () => {
        setFetchingSettings(true);
        try {
            const { data } = await api.get('/admin/settings');
            setAdminNumber(data.adminPaymentNumber);
            setCommRate(data.commissionRate.toString());
            setMonthlyPrice(data.monthlyPrice?.toString() || '500');
            setYearlyPrice(data.yearlyPrice?.toString() || '5000');
            setMonthlyMentors(data.monthlyMentorLimit?.toString() || '2');
            setYearlyMentors(data.yearlyMentorLimit?.toString() || '5');
            setMonthlySessions(data.monthlySessionLimit?.toString() || '10');
            setYearlySessions(data.yearlySessionLimit?.toString() || '100');
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setFetchingSettings(false);
        }
    };

    const fetchTransactions = async () => {
        setFetchingTrans(true);
        try {
            const { data } = await api.get('/admin/transactions');
            setTransactions(data);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setFetchingTrans(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'applications') fetchApplications();
        if (activeTab === 'stats') {
            fetchStats();
            fetchTransactions();
        }
        if (activeTab === 'settings') fetchSettings();
    }, [activeTab]);

    const fetchData = async () => {
        if (activeTab === 'applications') fetchApplications();
        if (activeTab === 'stats') {
            fetchStats();
            fetchTransactions();
        }
        if (activeTab === 'settings') fetchSettings();
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await api.put('/admin/settings', {
                adminPaymentNumber: adminNumber,
                commissionRate: Number(commRate),
                monthlyPrice: Number(monthlyPrice),
                yearlyPrice: Number(yearlyPrice),
                monthlyMentorLimit: Number(monthlyMentors),
                yearlyMentorLimit: Number(yearlyMentors),
                monthlySessionLimit: Number(monthlySessions),
                yearlySessionLimit: Number(yearlySessions)
            });
            toast.success("Settings updated successfully");
            fetchData();
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
            fetchData();
        } catch (e) {
            toast.error("Payout failed");
        } finally {
            setProcessingPayout(false);
        }
    };

    const handleVerify = async (userId: string) => {
        setVerifying(true);
        try {
            await api.put(`/admin/verify-mentor/${userId}`);
            toast.success("Mentor verified successfully");
            fetchData();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const handleUnverify = async (userId: string) => {
        setVerifying(true);
        try {
            await api.put(`/admin/unverify-mentor/${userId}`);
            toast.success("Mentor unverified successfully");
            fetchData();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to unverify");
        } finally {
            setVerifying(false);
        }
    };

    const [declining, setDeclining] = useState(false);
    const handleDecline = async (userId: string) => {
        setDeclining(true);
        try {
            await api.delete(`/admin/decline-mentor/${userId}`);
            toast.success("Application declined and removed");
            fetchData();
            setIsDeclineConfirmOpen(false);
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to decline application");
        } finally {
            setDeclining(false);
        }
    };

    const openPayoutDialog = (app: any) => {
        setPayoutAmount(app.walletBalance.toString());
        setPayoutTxId('');
    };

    const openReviewDialog = (app: MentorApplication) => {
        setSelectedApp(app);
        setIsDialogOpen(true);
    };

    const loadingAny = fetchingApps || fetchingStats || fetchingSettings || fetchingTrans;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Moderator Control Panel</h2>
                    <p className="text-slate-500 font-medium">Manage payments, commissions, and mentors.</p>
                </div>
                <div className="flex p-1 bg-slate-100 rounded-xl w-fit border border-slate-200 shadow-sm">
                    <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'applications' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Management</button>
                    <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Finance</button>
                    <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Settings</button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-50 rounded-2xl">
                                <TrendingUp className="text-brand-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Ecosystem</h3>
                                <p className="text-xs font-medium text-slate-500 tracking-wide uppercase mt-0.5">Real-time revenue & payout tracking</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchData}
                            className="bg-white hover:bg-slate-50 border-slate-200 text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl shadow-sm transition-all hover:shadow-md"
                        >
                            <Loader2 className={`mr-2 h-3.5 w-3.5 ${loadingAny ? 'animate-spin' : ''}`} />
                            Sync Ledger
                        </Button>
                    </div>

                    {fetchingStats || fetchingTrans ? (
                        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-brand-600" size={40} /></div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-slate-950 text-white border-0 shadow-2xl relative overflow-hidden group rounded-3xl">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TrendingUp size={80} />
                                    </div>
                                    <CardHeader className="pb-1 px-6 pt-6 relative z-10">
                                        <CardTitle className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Gross Revenue</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 relative z-10">
                                        <p className="text-3xl font-black tracking-tighter">৳{stats?.totalRevenue || 0}</p>
                                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Total Inflow
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-100 shadow-xl rounded-3xl group transition-all hover:bg-emerald-50/30">
                                    <CardHeader className="pb-1 px-6 pt-6">
                                        <CardTitle className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Platform Profit</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 text-emerald-600">
                                        <p className="text-3xl font-black tracking-tighter">৳{stats?.totalCommission || 0}</p>
                                        <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Service Commissions</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-100 shadow-xl rounded-3xl group transition-all hover:bg-slate-50">
                                    <CardHeader className="pb-1 px-6 pt-6">
                                        <CardTitle className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Liquid Payouts</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <p className="text-3xl font-black tracking-tighter text-slate-900">৳{stats?.totalMentorPayout || 0}</p>
                                        <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Successfully Settled</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-brand-600 text-white border-0 shadow-xl rounded-3xl relative overflow-hidden">
                                    <div className="absolute -bottom-4 -right-4 opacity-10">
                                        <Wallet size={100} />
                                    </div>
                                    <CardHeader className="pb-1 px-6 pt-6">
                                        <CardTitle className="text-brand-200 text-[10px] font-black uppercase tracking-[0.2em]">Pending Liabilities</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <p className="text-3xl font-black tracking-tighter">৳{stats?.totalPendingBalance || 0}</p>
                                        <p className="mt-2 text-[10px] text-brand-200 font-bold uppercase tracking-tighter italic">Currently in Wallets</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between px-4">
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Mentor Ledgers</h4>
                                    </div>
                                    <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Mentor Profile</th>
                                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Accrued Balance</th>
                                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Settlement</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {applications
                                                            .filter(a => a.user?.isMentorVerified === true)
                                                            .map((app: any) => (
                                                                <tr key={app._id} className="group hover:bg-slate-50/80 transition-all">
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                                                                                {app.user?.name?.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-black text-slate-900">{app.user?.name}</p>
                                                                                <p className="text-[10px] font-black text-brand-600">{app.paymentNumber || app.user?.phone}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6 font-black text-xl tracking-tighter text-slate-900">
                                                                        ৳{app.walletBalance || 0}
                                                                    </td>
                                                                    <td className="px-8 py-6 text-right">
                                                                        {(app.walletBalance || 0) > 0 && (
                                                                            <Dialog>
                                                                                <DialogTrigger asChild>
                                                                                    <Button size="sm" onClick={() => openPayoutDialog(app)} className="bg-slate-950 hover:bg-brand-600 text-white font-black text-[9px] uppercase tracking-widest h-9 px-5 rounded-xl ml-auto">Payout</Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="rounded-3xl border-slate-100 max-w-sm p-8 shadow-2xl">
                                                                                    <DialogHeader>
                                                                                        <DialogTitle className="text-xl font-black">Settlement Request</DialogTitle>
                                                                                    </DialogHeader>
                                                                                    <div className="space-y-6 py-6">
                                                                                        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-2">
                                                                                            <p className="text-[9px] uppercase font-black text-slate-400">Recipient</p>
                                                                                            <p className="font-black text-slate-900">{app.user?.name}</p>
                                                                                            <p className="font-black text-brand-600 text-lg">৳{app.walletBalance}</p>
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            <label className="text-[10px] font-black uppercase text-slate-500">Amount</label>
                                                                                            <input type="number" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-black" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            <label className="text-[10px] font-black uppercase text-slate-500">TX ID</label>
                                                                                            <input type="text" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold" value={payoutTxId} onChange={(e) => setPayoutTxId(e.target.value)} />
                                                                                        </div>
                                                                                    </div>
                                                                                    <DialogFooter>
                                                                                        <Button className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-xs rounded-xl" onClick={() => handlePayout(app.user._id, app.walletBalance)} disabled={processingPayout}>
                                                                                            {processingPayout ? <Loader2 className="animate-spin" /> : 'Confirm Transfer'}
                                                                                        </Button>
                                                                                    </DialogFooter>
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden self-start bg-slate-900 text-white">
                                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <History size={16} className="text-brand-400" /> Recent Ledger
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                        {transactions.map((t: any) => (
                                            <div key={t._id} className="p-6 border-b border-white/5 hover:bg-white/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${t.type === 'payout' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                        {t.type}
                                                    </span>
                                                    <span className="text-[9px] text-white/30 font-bold">{new Date(t.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-black">{t.type === 'payout' ? t.mentor?.name : t.user?.name}</p>
                                                        <p className="text-[9px] font-mono text-white/40">{t.transactionId}</p>
                                                    </div>
                                                    <p className="text-lg font-black text-white">৳{t.amount}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'applications' && (
                fetchingApps ? (
                    <div className="flex justify-center py-32"><Loader2 className="animate-spin text-brand-600" size={40} /></div>
                ) : (
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Mentor Verification & Management</CardTitle>
                            <CardDescription>Review new applications and manage existing mentor profiles.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] uppercase bg-white text-slate-400 font-extrabold border-b">
                                        <tr>
                                            <th className="px-6 py-4 tracking-widest">Mentor</th>
                                            <th className="px-6 py-4 tracking-widest">University</th>
                                            <th className="px-6 py-4 text-center tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-right tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {applications.map((app) => (
                                            <tr key={app._id} className="bg-white hover:bg-brand-50/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900">{app.user?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">{app.user?.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-600">{app.university}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{app.department}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {app.user?.isMentorVerified ? (
                                                        <span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-1 rounded-md font-black uppercase border border-emerald-100 italic">Verified</span>
                                                    ) : (
                                                        <span className="bg-amber-50 text-amber-700 text-[9px] px-2 py-1 rounded-md font-black uppercase border border-amber-100 italic">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="secondary" onClick={() => openReviewDialog(app)} className="text-xs rounded-lg flex items-center gap-1 ml-auto">
                                                        <Eye size={14} /> Review
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )
            )}

            {activeTab === 'settings' && (
                fetchingSettings ? (
                    <div className="flex justify-center py-32"><Loader2 className="animate-spin text-brand-600" size={40} /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="shadow-lg border-0 bg-white ring-1 ring-slate-100">
                            <CardHeader className="pb-6 border-b border-slate-50 bg-slate-50/30">
                                <CardTitle className="text-xl flex items-center gap-2 font-black">
                                    <ShieldCheck className="text-brand-600" /> Platform Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleUpdateSettings} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Central Payment Number</label>
                                        <input type="text" value={adminNumber} onChange={(e) => setAdminNumber(e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-black text-lg focus:border-brand-500 outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Commission (%)</label>
                                        <input type="number" value={commRate} onChange={(e) => setCommRate(e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-black text-2xl focus:border-brand-500 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t font-black">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-slate-400 uppercase">Monthly Price</label>
                                            <input type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-slate-400 uppercase">Yearly Price</label>
                                            <input type="number" value={yearlyPrice} onChange={(e) => setYearlyPrice(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4" />
                                        </div>
                                    </div>
                                    <Button className="w-full h-14 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-xs rounded-2xl" disabled={savingSettings}>
                                        {savingSettings ? <Loader2 className="animate-spin" /> : 'Save All Settings'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )
            )}

            {/* Profile Review Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <ShieldCheck className="text-brand-600" /> Mentor Profile Review
                        </DialogTitle>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Personal Info</h3>
                                <div className="space-y-3">
                                    <div><label className="text-xs text-slate-500 uppercase font-bold">Name</label><p className="font-medium">{selectedApp.user.name}</p></div>
                                    <div><label className="text-xs text-slate-500 uppercase font-bold">Email</label><p className="font-medium">{selectedApp.user.email}</p></div>
                                    <div><label className="text-xs text-slate-500 uppercase font-bold">Phone</label><p className="font-medium">{selectedApp.user.phone || 'N/A'}</p></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Academic Info</h3>
                                <div className="space-y-3">
                                    <div><label className="text-xs text-slate-500 uppercase font-bold">University</label><p className="font-medium">{selectedApp.university}</p></div>
                                    <div><label className="text-xs text-slate-500 uppercase font-bold">Department</label><p className="font-medium">{selectedApp.department}</p></div>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">ID Document</h3>
                                <div className="bg-slate-100 w-full h-80 rounded-xl flex items-center justify-center border-2 border-dashed overflow-hidden">
                                    {selectedApp.user.studentIdUrl ? (
                                        <img src={selectedApp.user.studentIdUrl} alt="ID" className="h-full w-full object-contain" />
                                    ) : (
                                        <p className="text-slate-400">No document uploaded.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        {selectedApp && !selectedApp.user.isMentorVerified && (
                            <>
                                <Button variant="destructive" onClick={() => setIsDeclineConfirmOpen(true)} disabled={declining}>Decline</Button>
                                <Button onClick={() => handleVerify(selectedApp.user._id)} className="bg-green-600 hover:bg-green-700" disabled={verifying}>Approve</Button>
                            </>
                        )}
                        {selectedApp && selectedApp.user.isMentorVerified && (
                            <Button variant="outline" onClick={() => handleUnverify(selectedApp.user._id)} className="text-red-600 border-red-200">Unverify</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Confirmation */}
            <Dialog open={isDeclineConfirmOpen} onOpenChange={setIsDeclineConfirmOpen}>
                <DialogContent className="max-w-[400px] border-red-100 rounded-3xl p-6">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-black text-red-900">Delete Application?</h2>
                        <p className="text-red-700 text-sm">Are you sure? This will permanently remove their application data.</p>
                        <div className="flex flex-col gap-2 pt-4">
                            <Button variant="destructive" className="h-12 font-black uppercase" onClick={() => selectedApp && handleDecline(selectedApp.user._id)} disabled={declining}>Yes, Delete</Button>
                            <Button variant="outline" className="h-12" onClick={() => setIsDeclineConfirmOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
