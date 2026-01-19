"use client";
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Eye, CheckCircle, XCircle, Settings, TrendingUp, History, Wallet, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface MentorApplication {
    _id: string;
    university: string;
    department: string;
    bio: string;
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

export default function AdminDashboard() {
    const [applications, setApplications] = useState<MentorApplication[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'applications' | 'stats' | 'settings' | 'sessions'>('applications');
    const [selectedApp, setSelectedApp] = useState<MentorApplication | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Settings states
    const [adminNumber, setAdminNumber] = useState('');
    const [commRate, setCommRate] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [yearlyPrice, setYearlyPrice] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [appsRes, statsRes, settingsRes, transRes, sessRes] = await Promise.all([
                api.get('/admin/mentor-applications'),
                api.get('/admin/stats'),
                api.get('/admin/settings'),
                api.get('/admin/transactions'),
                api.get('/admin/sessions')
            ]);
            setApplications(appsRes.data);
            setStats(statsRes.data);
            setTransactions(transRes.data);
            setSessions(sessRes.data);

            if (settingsRes.data) {
                setAdminNumber(settingsRes.data.adminPaymentNumber || '');
                setCommRate(settingsRes.data.commissionRate?.toString() || '20');
                setMonthlyPrice(settingsRes.data.monthlyPrice?.toString() || '500');
                setYearlyPrice(settingsRes.data.yearlyPrice?.toString() || '5000');
            }
        } catch (error) {
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleVerify = async (userId: string, status: boolean) => {
        setVerifying(true);
        try {
            if (status) {
                await api.put(`/admin/verify-mentor/${userId}`);
                toast.success("Mentor verified successfully");
            } else {
                await api.put(`/admin/unverify-mentor/${userId}`);
                toast.success("Mentor unverified");
            }
            fetchData();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setVerifying(false);
        }
    };

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
            toast.success("Settings updated");
            fetchData();
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const filteredApplications = applications.filter(app =>
        app.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm">Manage users and platform preferences.</p>
                </div>
                <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'applications' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'sessions' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Sessions
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'stats' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Finances
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'settings' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'applications' && (
                <div className="space-y-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search mentors..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Mentor Applications</CardTitle>
                            <CardDescription>Review and verify mentor registrations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-slate-500">
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">University</th>
                                            <th className="px-4 py-3 text-left">Department</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredApplications.length > 0 ? (
                                            filteredApplications.map((app) => (
                                                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-4 font-semibold text-slate-900">{app.user?.name}</td>
                                                    <td className="px-4 py-4 text-slate-600">{app.university}</td>
                                                    <td className="px-4 py-4 text-slate-600">{app.department}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        {app.user?.isMentorVerified ? (
                                                            <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">Verified</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => { setSelectedApp(app); setIsDialogOpen(true); }}
                                                            className="border-slate-200 hover:bg-brand-50 hover:text-brand-600"
                                                        >
                                                            <Eye size={14} className="mr-2" /> Review
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                    No applications found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="space-y-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>All Sessions</CardTitle>
                            <CardDescription>View and manage all booked sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-slate-500">
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-left">Mentor</th>
                                            <th className="px-4 py-3 text-left">Candidate</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sessions.filter(s =>
                                            (s.mentor?.name && s.mentor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                            (s.candidate?.name && s.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        ).length > 0 ? (
                                            sessions.filter(s =>
                                                (s.mentor?.name && s.mentor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                (s.candidate?.name && s.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            ).map((session) => (
                                                <tr key={session._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-4 text-slate-600">
                                                        <div className="flex items-center">
                                                            <Calendar size={14} className="mr-2 text-slate-400" />
                                                            {new Date(session.startTime).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-slate-400 ml-6">{new Date(session.startTime).toLocaleTimeString()}</div>
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold text-slate-900">{session.mentor?.name}</td>
                                                    <td className="px-4 py-4 text-slate-700">{session.candidate?.name}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${session.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                            session.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                                                session.status === 'accepted' ? 'bg-blue-50 text-blue-700' :
                                                                    'bg-amber-50 text-amber-700'
                                                            }`}>
                                                            {session.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-mono font-medium">৳{session.amount}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No sessions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Revenue", val: stats?.totalRevenue, color: "text-slate-900" },
                            { label: "Commission", val: stats?.totalCommission, color: "text-green-600" },
                            { label: "Mentor Payouts", val: stats?.totalMentorPayout, color: "text-slate-900" },
                            { label: "Wallet Balances", val: stats?.totalPendingBalance, color: "text-brand-600" }
                        ].map((item, i) => (
                            <Card key={i} className="border-slate-200">
                                <CardContent className="pt-6">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className={`text-2xl font-bold ${item.color}`}>৳{item.val || 0}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-slate-200">
                            <CardHeader><CardTitle className="text-lg">Recent Transactions</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {transactions.slice(0, 10).map(t => (
                                        <div key={t._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{t.user?.name || 'User'}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{t.transactionId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm text-slate-900">৳{t.amount}</p>
                                                <p className="text-[9px] uppercase font-black text-slate-400">{t.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {transactions.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No transactions found.</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader><CardTitle className="text-lg">Mentor Wallets</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {applications.filter(a => a.walletBalance > 0).map(app => (
                                        <div key={app._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{app.user?.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{app.user?.phone}</p>
                                            </div>
                                            <p className="font-bold text-slate-900">৳{app.walletBalance}</p>
                                        </div>
                                    ))}
                                    {applications.filter(a => a.walletBalance > 0).length === 0 && <p className="text-center text-sm text-slate-500 py-4">No pending balances.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <Card className="max-w-xl mx-auto border-slate-200">
                    <CardHeader>
                        <CardTitle>Platform Configuration</CardTitle>
                        <CardDescription>Adjust pricing and commission metrics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateSettings} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Admin Payment Number</label>
                                <input
                                    type="text"
                                    value={adminNumber}
                                    onChange={e => setAdminNumber(e.target.value)}
                                    className="w-full h-11 border border-slate-300 rounded-lg px-4 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Commission Rate (%)</label>
                                <input
                                    type="number"
                                    value={commRate}
                                    onChange={e => setCommRate(e.target.value)}
                                    className="w-full h-11 border border-slate-300 rounded-lg px-4 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Monthly Pro (৳)</label>
                                    <input type="number" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} className="w-full h-11 border border-slate-300 rounded-lg px-4 focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Yearly Pro (৳)</label>
                                    <input type="number" value={yearlyPrice} onChange={e => setYearlyPrice(e.target.value)} className="w-full h-11 border border-slate-300 rounded-lg px-4 focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-brand-600 hover:bg-brand-700 font-bold" disabled={savingSettings}>
                                {savingSettings ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Save Platform Settings"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Review Application</DialogTitle>
                        <DialogDescription>Validate documents and academic background.</DialogDescription>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-slate-100 my-4">
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Candidate Name</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedApp.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academy Info</p>
                                    <p className="font-semibold text-slate-700">{selectedApp.university}</p>
                                    <p className="text-sm text-brand-600 font-bold">{selectedApp.department}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Details</p>
                                    <p className="text-sm font-medium text-slate-600">{selectedApp.user?.email}</p>
                                    <p className="text-sm font-medium text-slate-600">{selectedApp.user?.phone}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID Card</p>
                                <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-2">
                                    {selectedApp.user?.studentIdUrl ? (
                                        <img src={selectedApp.user.studentIdUrl} alt="ID Document" className="w-full h-full object-contain" />
                                    ) : (
                                        <p className="text-slate-400 text-xs font-bold uppercase">No image</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex gap-2">
                        {selectedApp?.user && (
                            <>
                                {selectedApp.user.isMentorVerified ? (
                                    <Button variant="outline" onClick={() => handleVerify(selectedApp.user._id, false)} disabled={verifying} className="text-red-600 border-red-100 hover:bg-red-50 font-bold">Revoke Access</Button>
                                ) : (
                                    <Button onClick={() => handleVerify(selectedApp.user._id, true)} disabled={verifying} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">Approve & Verify</Button>
                                )}
                            </>
                        )}
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
