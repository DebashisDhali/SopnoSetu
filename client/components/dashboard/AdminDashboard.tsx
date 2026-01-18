"use client";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, CheckCircle, XCircle, Eye, ShieldCheck, Mail, Building, FileText, Ban, History, Activity, TrendingUp, Wallet, CreditCard, ArrowUpRight, Users } from 'lucide-react';
import { toast } from 'sonner';

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
}

const AdminDashboard = () => {
    const [applications, setApplications] = useState<MentorApplication[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'applications' | 'stats' | 'settings'>('applications');

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

    // Custom Confirmation State
    const [isDeclineConfirmOpen, setIsDeclineConfirmOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appRes, statsRes, settingsRes, transRes] = await Promise.all([
                api.get('/admin/mentor-applications'),
                api.get('/admin/stats'),
                api.get('/admin/settings'),
                api.get('/admin/transactions')
            ]);
            setApplications(appRes.data);
            setStats(statsRes.data);
            setSettings(settingsRes.data);
            setTransactions(transRes.data);
            setAdminNumber(settingsRes.data.adminPaymentNumber);
            setCommRate(settingsRes.data.commissionRate.toString());
            setMonthlyPrice(settingsRes.data.monthlyPrice?.toString() || '500');
            setYearlyPrice(settingsRes.data.yearlyPrice?.toString() || '5000');
            setMonthlyMentors(settingsRes.data.monthlyMentorLimit?.toString() || '2');
            setYearlyMentors(settingsRes.data.yearlyMentorLimit?.toString() || '5');
            setMonthlySessions(settingsRes.data.monthlySessionLimit?.toString() || '10');
            setYearlySessions(settingsRes.data.yearlySessionLimit?.toString() || '100');
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        } catch (e) {
            toast.error("Failed to update settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const handlePayout = async (mentorId: string, balance: number) => {
        // Validation
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

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
    );

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
                    {/* Header Section */}
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
                            <Loader2 className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Sync Ledger
                        </Button>
                    </div>

                    {/* Stats Grid */}
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
                        {/* Mentor Wallet Table */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]" />
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Mentor Ledgers</h4>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{applications.filter(a => a.user?.isMentorVerified).length} Mentors Online</span>
                            </div>

                            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
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
                                                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                                                        {app.user?.name?.charAt(0) || 'M'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-slate-900 tracking-tight leading-none">{app.user?.name || 'Unknown'}</p>
                                                                        <div className="flex flex-col gap-2 mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center text-white">
                                                                                    <CreditCard size={10} />
                                                                                </div>
                                                                                <span className="text-[10px] font-black text-slate-700 tracking-tight">
                                                                                    {app.paymentNumber || app.user?.phone || 'No Number Set'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {app.paymentMethods?.length > 0 ? (
                                                                                    app.paymentMethods.map((m: string) => (
                                                                                        <span key={m} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${m.toLowerCase() === 'bkash' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                                                                                            m.toLowerCase() === 'nagad' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                                                'bg-slate-100 text-slate-600 border-slate-200'
                                                                                            }`}>
                                                                                            {m}
                                                                                        </span>
                                                                                    ))
                                                                                ) : (
                                                                                    <span className="text-[8px] font-bold text-slate-400 italic">No method pref.</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`font-black text-xl tracking-tighter ${app.walletBalance > 0 ? 'text-brand-600' : 'text-slate-300'}`}>৳{app.walletBalance || 0}</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                {(app.walletBalance || 0) > 0 ? (
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => openPayoutDialog(app)}
                                                                                className="bg-slate-950 hover:bg-brand-600 text-white font-black text-[9px] uppercase tracking-[0.15em] h-9 px-5 rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all flex items-center gap-2 ml-auto"
                                                                            >
                                                                                <ArrowUpRight size={12} /> Payout
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="rounded-[2.5rem] border-slate-100 max-w-sm p-8 shadow-2xl overflow-hidden backdrop-blur-3xl bg-white/90">
                                                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-600" />
                                                                            <DialogHeader>
                                                                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Settlement Request</DialogTitle>
                                                                                <DialogDescription className="font-medium text-slate-500 text-xs">
                                                                                    Initiating financial transfer for <strong>{app.user?.name}</strong>.
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div className="space-y-6 py-6">
                                                                                <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200 flex flex-col gap-4 relative overflow-hidden">
                                                                                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-brand-600 opacity-50" />
                                                                                    <div className="flex justify-between items-start">
                                                                                        <div>
                                                                                            <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Recipient Number</p>
                                                                                            <p className="font-black text-slate-900 text-sm tracking-tight">{app.paymentNumber || app.user?.phone || 'N/A'}</p>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Due Balance</p>
                                                                                            <p className="font-black text-brand-600 text-lg tracking-tighter">৳{app.walletBalance}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="pt-3 border-t border-slate-200/50">
                                                                                        <p className="text-[8px] uppercase font-black text-slate-400 mb-2 tracking-widest">Preferred Platforms</p>
                                                                                        <div className="flex gap-2">
                                                                                            {app.paymentMethods?.map((m: string) => (
                                                                                                <span key={m} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase text-slate-600 shadow-sm">{m}</span>
                                                                                            )) || <span className="text-[8px] font-bold text-slate-400 italic">No preference set</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Transfer Amount</label>
                                                                                    <div className="relative">
                                                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">৳</span>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl pl-10 pr-5 font-black text-2xl text-slate-900 focus:border-brand-500 transition-all outline-none shadow-sm"
                                                                                            placeholder={app.walletBalance.toString()}
                                                                                            value={payoutAmount}
                                                                                            onChange={(e) => setPayoutAmount(e.target.value)}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">External Transaction ID</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl px-5 font-bold text-sm text-slate-900 focus:border-brand-500 transition-all outline-none shadow-sm uppercase placeholder:normal-case"
                                                                                        placeholder="Ref / TXID"
                                                                                        value={payoutTxId}
                                                                                        onChange={(e) => setPayoutTxId(e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <Button
                                                                                    className="w-full h-14 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-brand-500/30 rounded-2xl transition-all active:scale-[0.98]"
                                                                                    disabled={processingPayout}
                                                                                    onClick={() => handlePayout(app.user?._id, app.walletBalance)}
                                                                                >
                                                                                    {processingPayout ? <Loader2 className="animate-spin" /> : 'Settle Now'}
                                                                                </Button>
                                                                            </div>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                ) : (
                                                                    <Button disabled size="sm" className="bg-slate-100 text-slate-400 font-black text-[9px] uppercase tracking-[0.15em] h-9 px-5 rounded-xl border border-slate-200 cursor-not-allowed flex items-center gap-2 ml-auto shadow-none">
                                                                        <CheckCircle size={12} className="text-emerald-500" /> Settled
                                                                    </Button>
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

                        {/* Recent Transactions History */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="flex items-center gap-2 px-4">
                                <History className="text-slate-400" size={18} />
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Global Audit Log</h4>
                            </div>
                            <Card className="border-0 shadow-2xl rounded-3xl h-full flex flex-col bg-white/80 backdrop-blur-xl">
                                <CardContent className="p-0 flex-1 overflow-y-auto max-h-[600px] scrollbar-hide">
                                    <div className="divide-y divide-slate-50">
                                        {transactions.map((t: any) => (
                                            <div key={t._id} className="p-6 hover:bg-slate-50 transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-colors ${t.type === 'payout'
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white'
                                                        }`}>
                                                        {t.type.replace('_', ' ')}
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black text-slate-900 tracking-tight">
                                                            {t.type === 'payout' ? (
                                                                <span className="flex items-center gap-1.5"><ArrowUpRight size={12} className="text-rose-400" /> {t.mentor?.name || 'Mentor'}</span>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5"><CreditCard size={12} className="text-emerald-400" /> {t.user?.name || 'User'}</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[9px] text-slate-400 font-bold font-mono tracking-tight bg-slate-100 px-1.5 py-0.5 rounded w-fit">{t.transactionId || 'NO_REF'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-slate-900 tracking-tighter">৳{t.amount}</p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Settled</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {transactions.length === 0 && (
                                            <div className="p-20 text-center space-y-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                                                    <History className="text-slate-200" size={24} />
                                                </div>
                                                <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Transaction Ledger Empty</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'applications' && (
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
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100 flex items-center gap-1">
                                                        <CreditCard size={8} /> {app.paymentNumber || 'N/A'}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        {app.paymentMethods?.slice(0, 2).map((m: string) => (
                                                            <span key={m} className="text-[7px] font-black uppercase text-slate-400">{m}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {app.user?.isMentorVerified ? (
                                                        <span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-1 rounded-md font-black uppercase flex items-center border border-emerald-100 ring-2 ring-emerald-50/50">
                                                            <CheckCircle size={10} className="mr-1" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="bg-amber-50 text-amber-700 text-[9px] px-2 py-1 rounded-md font-black uppercase flex items-center border border-amber-100 ring-2 ring-amber-50/50">
                                                            <XCircle size={10} className="mr-1" /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openReviewDialog(app)}
                                                    className="font-black text-[9px] uppercase tracking-widest h-8 px-4 hover:bg-slate-200"
                                                >
                                                    <Eye size={14} className="mr-1.5 align-middle" /> Review
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {applications.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <p className="text-slate-400 font-bold uppercase text-xs">No applications found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="shadow-lg border-0 bg-white ring-1 ring-slate-100">
                        <CardHeader className="pb-6 border-b border-slate-50 bg-slate-50/30">
                            <CardTitle className="text-xl flex items-center gap-2 font-black">
                                <ShieldCheck className="text-brand-600" /> Platform Configuration
                            </CardTitle>
                            <CardDescription className="font-medium">Set commission rate and central bKash/Nagad number.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleUpdateSettings} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                                        bKash/Nagad Agent/Personal Number
                                        <span className="text-brand-600 font-bold tracking-tight lowercase">central account</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={adminNumber}
                                            onChange={(e) => setAdminNumber(e.target.value)}
                                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-black text-lg text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none shadow-inner"
                                            placeholder="017XX-XXXXXX"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2">
                                            <span className="px-2 py-1 bg-brand-100 text-brand-700 text-[8px] font-black rounded uppercase">Active</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                                        Warning: This number will be shown to students during mentor booking.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                                        Platform Commission Rate
                                        <span className="text-emerald-600 font-bold tracking-tight lowercase">platform profit</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={commRate}
                                            onChange={(e) => setCommRate(e.target.value)}
                                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-black text-2xl text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none shadow-inner"
                                            placeholder="20"
                                            max="100"
                                            min="0"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">%</div>
                                    </div>
                                    <div className="flex justify-between items-center bg-brand-50/50 p-4 rounded-xl border border-brand-100/50">
                                        <div className="text-center flex-1 border-r border-brand-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Mentor Share</p>
                                            <p className="text-xl font-black text-slate-900">{100 - Number(commRate)}%</p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Platform Share</p>
                                            <p className="text-xl font-black text-brand-600">{commRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Rules */}
                                <div className="pt-6 border-t border-slate-100 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-600">Subscription Business Rules</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Monthly Price (৳)</label>
                                            <input type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-sm outline-none focus:border-brand-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Yearly Price (৳)</label>
                                            <input type="number" value={yearlyPrice} onChange={(e) => setYearlyPrice(e.target.value)} className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-sm outline-none focus:border-brand-500" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest underline decoration-brand-200">Usage Limits</p>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Monthly: Mentors</label>
                                                <input type="number" value={monthlyMentors} onChange={(e) => setMonthlyMentors(e.target.value)} className="w-full h-10 bg-white border-slate-100 rounded-lg px-3 font-bold text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Yearly: Mentors</label>
                                                <input type="number" value={yearlyMentors} onChange={(e) => setYearlyMentors(e.target.value)} className="w-full h-10 bg-white border-slate-100 rounded-lg px-3 font-bold text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Monthly: Sessions</label>
                                                <input type="number" value={monthlySessions} onChange={(e) => setMonthlySessions(e.target.value)} className="w-full h-10 bg-white border-slate-100 rounded-lg px-3 font-bold text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Yearly: Sessions</label>
                                                <input type="number" value={yearlySessions} onChange={(e) => setYearlySessions(e.target.value)} className="w-full h-10 bg-white border-slate-100 rounded-lg px-3 font-bold text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full h-14 shadow-xl hover:shadow-2xl transition-all font-black uppercase tracking-widest text-xs rounded-2xl" disabled={savingSettings}>
                                    {savingSettings ? <Loader2 className="animate-spin" /> : 'Save All Settings'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full -mr-40 -mt-40 blur-3xl transition-all group-hover:bg-brand-500/20"></div>
                            <CardHeader>
                                <CardTitle className="text-xl text-white font-black uppercase tracking-tight">Admin Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 relative z-10">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                                    <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                        Commission rate changes only apply to future sessions. Mentors will see money in their wallet only after a session is successfully marked as 'Completed'.
                                    </p>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-600/10 border border-brand-500/20">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/40">
                                        <ShieldCheck size={24} className="text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-wider text-brand-400">Pro Tip</p>
                                        <p className="text-xs font-bold leading-relaxed text-slate-300">When sending money to a personal bKash/Nagad number, always use 'Send Money' and verify the Transaction ID.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-dashed border-slate-200 bg-transparent shadow-none">
                            <CardContent className="py-10 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                    <Mail className="text-slate-400" size={20} />
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">System Log</h4>
                                <p className="text-[10px] text-slate-500 font-medium">All transactions and payment history are being stored in the database.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Profile Review Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <ShieldCheck className="text-brand-600" /> Mentor Profile Review
                        </DialogTitle>
                        <DialogDescription>
                            Review the details below. Ensure the information matches their ID card before verifying.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Personal Info</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Full Name</label>
                                        <p className="font-medium text-slate-900">{selectedApp.user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Email Address</label>
                                        <p className="font-medium text-slate-900 flex items-center gap-2">
                                            <Mail size={14} /> {selectedApp.user.email}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Phone</label>
                                        <p className="font-medium text-slate-900">{selectedApp.user.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Academic & Payment Info */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Academic Info</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold">University</label>
                                            <p className="font-medium text-slate-900 flex items-center gap-2">
                                                <Building size={14} /> {selectedApp.university}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold">Department</label>
                                            <p className="font-medium text-slate-900">{selectedApp.department}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Payment & Withdrawal</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold">Payment Number</label>
                                            <p className="font-black text-brand-600 text-lg tracking-tight">{selectedApp.paymentNumber || 'No Number Set'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Preferred Methods</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApp.paymentMethods?.map(m => (
                                                    <span key={m} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-600 border border-slate-200">
                                                        {m}
                                                    </span>
                                                )) || <span className="text-xs text-slate-400 italic">No methods selected</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ID Document Logic */}
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Verification Document</h3>
                                <div className="bg-slate-100 w-full h-80 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                                    {selectedApp.user.studentIdUrl ? (
                                        <img
                                            src={selectedApp.user.studentIdUrl}
                                            alt="Student ID"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <FileText size={48} className="mx-auto mb-2 opacity-50" />
                                            <p>No document uploaded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        {selectedApp && !selectedApp.user.isMentorVerified && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDeclineConfirmOpen(true)}
                                    className="rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-100"
                                >
                                    <Ban className="mr-2" size={16} /> Decline
                                </Button>
                                <Button
                                    onClick={() => handleVerify(selectedApp.user._id)}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={verifying}
                                >
                                    {verifying ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle className="mr-2" size={16} />}
                                    Approve & Verify
                                </Button>
                            </>
                        )}
                        {selectedApp && selectedApp.user.isMentorVerified && (
                            <Button
                                variant="outline"
                                onClick={() => handleUnverify(selectedApp.user._id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                disabled={verifying}
                            >
                                <Ban className="mr-2" size={16} /> Unverify Mentor
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Confirmation Dialog */}
            <Dialog open={isDeclineConfirmOpen} onOpenChange={setIsDeclineConfirmOpen}>
                <DialogContent className="max-w-[400px] border-red-100 rounded-3xl overflow-hidden p-0">
                    <div className="bg-red-50 p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-red-200/50 flex items-center justify-center mb-4 ring-4 ring-red-100">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <DialogTitle className="text-xl font-black text-red-900 mb-2">Delete Application?</DialogTitle>
                        <DialogDescription className="text-red-700/80 font-medium leading-relaxed">
                            Are you sure you want to decline this application? This will <span className="font-black underline">permanently delete</span> their mentor profile data.
                        </DialogDescription>
                    </div>
                    <div className="p-6 bg-white flex flex-col gap-3">
                        <Button
                            variant="destructive"
                            className="h-12 w-full font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200 hover:shadow-red-300 transition-all rounded-xl"
                            onClick={() => selectedApp && handleDecline(selectedApp.user._id)}
                            disabled={declining}
                        >
                            {declining ? <Loader2 className="animate-spin mr-2" /> : <Ban className="mr-2" size={16} />}
                            Yes, Decline & Delete
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 w-full font-bold text-slate-500 border-slate-100 hover:bg-slate-50 rounded-xl"
                            onClick={() => setIsDeclineConfirmOpen(false)}
                            disabled={declining}
                        >
                            No, Take Me Back
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
