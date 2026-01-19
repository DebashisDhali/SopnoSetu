"use client";
import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Wallet, X, Zap, Crown, Shield } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Memoized Pricing Card for performance
const PricingCard = memo(({ plan, onUpgrade }: any) => {
    const isFree = plan.id === 'free';
    const isYearly = plan.id === 'yearly';

    return (
        <Card
            className={`relative flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group ${plan.bestValue ? 'ring-2 ring-brand-500 scale-105 z-10' : 'bg-white/80 backdrop-blur-sm'
                }`}
        >
            {plan.bestValue && (
                <div className="absolute top-0 right-0 bg-brand-500 text-white px-8 py-1.5 translate-x-[30%] translate-y-[50%] rotate-45 text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Best Value
                </div>
            )}

            <CardHeader className="p-8 pb-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${isFree ? 'bg-slate-100 text-slate-500' : isYearly ? 'bg-brand-600 text-white' : 'bg-slate-900 text-white'
                    }`}>
                    {isFree ? <Zap size={24} /> : isYearly ? <Crown size={24} /> : <Shield size={24} />}
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight">{plan.name}</CardTitle>
                <CardDescription className="font-bold text-slate-400 text-xs uppercase tracking-widest">{plan.description}</CardDescription>

                <div className="pt-8 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">৳{plan.price}</span>
                    {!isFree && <span className="text-slate-400 font-black text-xs uppercase px-2 py-1 bg-slate-50 rounded-lg">{isYearly ? 'Yearly' : 'Monthly'}</span>}
                </div>
            </CardHeader>

            <CardContent className="grow px-8 space-y-5">
                <div className="h-px bg-slate-100 w-full mb-8" />
                <ul className="space-y-4">
                    {plan.features.map((feature: string, i: number) => (
                        <li key={i} className="flex font-bold text-slate-600 text-sm gap-3 group/item">
                            <div className="h-5 w-5 rounded-full bg-brand-50 flex items-center justify-center shrink-0 transition-colors group-hover/item:bg-brand-100">
                                <Check className="text-brand-600" size={12} strokeWidth={4} />
                            </div>
                            <span className="leading-tight">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="p-8 pt-10">
                <Button
                    className={`w-full h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${plan.premium
                            ? 'bg-slate-900 text-white hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/20'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    onClick={() => onUpgrade(plan)}
                    disabled={isFree}
                >
                    {isFree ? 'Your Current Tier' : 'Upgrade Account'}
                </Button>
            </CardFooter>
        </Card>
    );
});

export default function PricingPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [transactionId, setTransactionId] = useState('');
    const [processing, setProcessing] = useState(false);

    const [plans, setPlans] = useState<any[]>([
        {
            id: 'free',
            name: 'Lite',
            price: '0',
            description: 'Essential access for beginners',
            features: ['Browse 500+ Mentors', 'Basic Career Guidance', 'Public Community Chat', '1 Live Session / Mo'],
            premium: false
        },
        {
            id: 'monthly',
            name: 'Pro',
            price: '499', // Default
            description: 'Focused sprint for exams',
            features: ['Pro Access Dashboard', 'Unlimited Sessions', 'Direct Mentor Chat', 'Study Resources', 'Priority Support'],
            premium: true
        },
        {
            id: 'yearly',
            name: 'Elite',
            price: '4999', // Default
            description: 'Complete high-end preparation',
            features: ['Full Pro Features', 'Mock Interview Pass', 'Webinar Invitations', 'Certification', '30% Annual Savings'],
            premium: true,
            bestValue: true
        }
    ]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/admin/settings');
                setSettings(data);
                setPlans(p => p.map(plan => {
                    if (plan.id === 'monthly') return { ...plan, price: data.monthlyPrice };
                    if (plan.id === 'yearly') return { ...plan, price: data.yearlyPrice };
                    return plan;
                }));
            } catch (error) {
                console.error("Settings fetch failed");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleUpgradeClick = (plan: any) => {
        const user = localStorage.getItem('user');
        if (!user) {
            toast.error("Authentication Required");
            router.push('/login');
            return;
        }
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId.trim()) return toast.error("TX ID Required");

        setProcessing(true);
        try {
            await api.post('/subscriptions/purchase', {
                plan: selectedPlan.id,
                transactionId,
                paymentMethod
            });
            toast.success("Upgrade Successful!");
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Activation failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] py-32 px-4 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                        Invest in your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600 italic">Dream Career.</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-tight opacity-70">
                        Stop guessing. Start executing with verified mentorship plans.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {plans.map((plan) => (
                        <PricingCard key={plan.id} plan={plan} onUpgrade={handleUpgradeClick} />
                    ))}
                </div>

                <div className="mt-32 text-center max-w-4xl mx-auto p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute inset-0 bg-brand-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight relative">Enterprise Solutions</h3>
                    <p className="text-slate-500 font-bold mb-10 max-w-xl mx-auto relative uppercase tracking-tight text-xs">Bulk licensing for institutions and coaching centers with managed dashboard access.</p>
                    <Button variant="outline" className="h-14 px-12 rounded-3xl border-slate-200 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-900 hover:text-white transition-all relative">Contact Operations Team</Button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md shadow-2xl relative overflow-hidden border-0 rounded-[2.5rem] bg-white">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="px-4 py-1.5 bg-brand-50 rounded-full text-brand-600 text-[10px] font-black uppercase tracking-widest">Secure Checkout</div>
                                <button onClick={() => setShowPaymentModal(false)} className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Activate {selectedPlan.name}</CardTitle>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest">Complete the transfer to unlock Pro status.</CardDescription>
                        </CardHeader>

                        <CardContent className="p-8 pt-4 space-y-8">
                            <div className="p-6 bg-slate-50 rounded-[2rem] flex justify-between items-center border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Amount</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">৳{selectedPlan.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{selectedPlan.name} Tier</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedPlan.id === 'yearly' ? 'Annualized' : 'Rolling Monthly'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleConfirmPayment} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Transfer Via</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'bkash', label: 'bKash', color: '#E2136E', logoText: 'bK' },
                                            { id: 'nagad', label: 'Nagad', color: '#F7941D', logoText: 'Ng' }
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(m.id)}
                                                className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === m.id ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'}`}
                                            >
                                                <div style={{ backgroundColor: m.color }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg">{m.logoText}</div>
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{m.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl text-[11px] leading-relaxed text-blue-900 font-bold">
                                        <p className="flex items-center gap-2 mb-3 text-blue-600 font-black uppercase tracking-widest"><Shield size={14} /> Official Merchant Only</p>
                                        <ol className="list-decimal list-inside space-y-2 opacity-80">
                                            <li>Send Money to <strong className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs select-all text-blue-700">{settings?.adminPaymentNumber || "017XX-XXXXXX"}</strong></li>
                                            <li>Exact Amount: <strong className="text-slate-900">৳{selectedPlan.price}</strong></li>
                                            <li>Paste your <strong className="text-slate-900 uppercase">Transaction ID</strong> below</li>
                                        </ol>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Receipt / TX ID</label>
                                        <div className="relative group">
                                            <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-brand-500 transition-colors" size={18} />
                                            <input
                                                className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 font-black focus:outline-none focus:border-brand-500 focus:bg-white transition-all uppercase tracking-wider"
                                                placeholder="8N7X6W5V4U"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-20 bg-slate-900 hover:bg-brand-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                                    disabled={processing}
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : (
                                        <span className="flex items-center gap-2">Finalize Activation <Zap size={16} className="text-brand-400 group-hover:text-white" /></span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
