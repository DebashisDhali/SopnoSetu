"use client";
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Eye, CheckCircle, XCircle, Settings, TrendingUp, History, Wallet } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'applications' | 'stats' | 'settings'>('applications');
    const [selectedApp, setSelectedApp] = useState<MentorApplication | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Settings states
    const [adminNumber, setAdminNumber] = useState('');
    const [commRate, setCommRate] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [yearlyPrice, setYearlyPrice] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [appsRes, statsRes, settingsRes, transRes] = await Promise.all([
                api.get('/admin/mentor-applications'),
                api.get('/admin/stats'),
                api.get('/admin/settings'),
                api.get('/admin/transactions')
            ]);
            setApplications(appsRes.data);
            setStats(statsRes.data);
            setTransactions(transRes.data);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <Button
                        variant={activeTab === 'applications' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('applications')}
                        size="sm"
                    >
                        Applications
                    </Button>
                    <Button
                        variant={activeTab === 'stats' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('stats')}
                        size="sm"
                    >
                        Finances
                    </Button>
                    <Button
                        variant={activeTab === 'settings' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('settings')}
                        size="sm"
                    >
                        Settings
                    </Button>
                </div>
            </div>

            {activeTab === 'applications' && (
                <Card>
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
                                    {applications.map((app) => (
                                        <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-slate-900">{app.user?.name}</td>
                                            <td className="px-4 py-4 text-slate-600">{app.university}</td>
                                            <td className="px-4 py-4 text-slate-600">{app.department}</td>
                                            <td className="px-4 py-4 text-center">
                                                {app.user?.isMentorVerified ? (
                                                    <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">Verified</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-semibold">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => { setSelectedApp(app); setIsDialogOpen(true); }}
                                                >
                                                    <Eye size={14} className="mr-2" /> Review
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'stats' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                                <p className="text-2xl font-bold">৳{stats?.totalRevenue || 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm font-medium text-slate-500">Commission Earned</p>
                                <p className="text-2xl font-bold text-green-600">৳{stats?.totalCommission || 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm font-medium text-slate-500">Mentor Payouts</p>
                                <p className="text-2xl font-bold">৳{stats?.totalMentorPayout || 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm font-medium text-slate-500">Pending Wallets</p>
                                <p className="text-2xl font-bold text-brand-600">৳{stats?.totalPendingBalance || 0}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Recent Transactions</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {transactions.map(t => (
                                        <div key={t._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-sm">{t.user?.name || 'User'}</p>
                                                <p className="text-xs text-slate-500">{t.transactionId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">৳{t.amount}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">{t.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Unpaid Balances</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {applications.filter(a => a.walletBalance > 0).map(app => (
                                        <div key={app._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-sm">{app.user?.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">{app.user?.phone}</p>
                                            </div>
                                            <p className="font-bold">৳{app.walletBalance}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Platform Settings</CardTitle>
                        <CardDescription>Configure pricing and commission rates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateSettings} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Admin Payment Number (bKash/Nagad)</label>
                                <input
                                    type="text"
                                    value={adminNumber}
                                    onChange={e => setAdminNumber(e.target.value)}
                                    className="w-full h-10 border rounded-md px-3"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Commission Rate (%)</label>
                                <input
                                    type="number"
                                    value={commRate}
                                    onChange={e => setCommRate(e.target.value)}
                                    className="w-full h-10 border rounded-md px-3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Monthly Pro Price (৳)</label>
                                    <input type="number" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} className="w-full h-10 border rounded-md px-3" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Yearly Pro Price (৳)</label>
                                    <input type="number" value={yearlyPrice} onChange={e => setYearlyPrice(e.target.value)} className="w-full h-10 border rounded-md px-3" />
                                </div>
                            </div>
                            <Button className="w-full" disabled={savingSettings}>
                                {savingSettings ? <Loader2 className="animate-spin mr-2" /> : "Save Settings"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Mentor Application</DialogTitle>
                        <DialogDescription>Verify the candidate's academic information and ID.</DialogDescription>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Name</p>
                                    <p className="text-lg font-bold">{selectedApp.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">University & Dept</p>
                                    <p className="font-semibold text-slate-700">{selectedApp.university} - {selectedApp.department}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</p>
                                    <p className="text-sm text-slate-600 line-clamp-3 italic">"{selectedApp.bio}"</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                                    <p className="text-sm font-medium">{selectedApp.user?.email}</p>
                                    <p className="text-sm font-medium">{selectedApp.user?.phone}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification ID Card</p>
                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border flex items-center justify-center">
                                    {selectedApp.user?.studentIdUrl ? (
                                        <img src={selectedApp.user.studentIdUrl} alt="ID Card" className="w-full h-full object-contain" />
                                    ) : (
                                        <p className="text-slate-400 text-sm">No ID uploaded</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex gap-2">
                        {selectedApp?.user && (
                            <>
                                {selectedApp.user.isMentorVerified ? (
                                    <Button variant="outline" onClick={() => handleVerify(selectedApp.user._id, false)} disabled={verifying} className="text-red-600 border-red-100 hover:bg-red-50">Revoke Verification</Button>
                                ) : (
                                    <Button onClick={() => handleVerify(selectedApp.user._id, true)} disabled={verifying} className="bg-green-600 hover:bg-green-700 text-white">Approve Application</Button>
                                )}
                            </>
                        )}
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
