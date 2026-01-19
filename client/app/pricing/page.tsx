"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Wallet, X } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [transactionId, setTransactionId] = useState('');
    const [processing, setProcessing] = useState(false);

    // State for settings and plans
    const [settings, setSettings] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([
        {
            id: 'free',
            name: 'Free',
            price: '0',
            description: 'Get started with limited features',
            features: [
                'Browse all mentors',
                'View mentor profiles',
                'Public chat in community',
                '1 session booking per month'
            ],
            buttonText: 'Current Plan',
            premium: false
        },
        {
            id: 'monthly',
            name: 'Pro Monthly',
            price: '499', // tailored below
            description: 'Best for short-term preparation',
            features: [
                'All Free features',
                'Unlimited session bookings',
                'Direct messaging with mentors',
                'Priority support',
                'Access to study materials'
            ],
            buttonText: 'Upgrade to Pro',
            premium: true
        },
        {
            id: 'yearly',
            name: 'Pro Yearly',
            price: '4999', // tailored below
            description: 'Best value for full preparation',
            features: [
                'All Pro Monthly features',
                '30% savings compared to monthly',
                'Exclusive webinars access',
                'Mock interview sessions',
                'Certificate of completion'
            ],
            buttonText: 'Go Annual & Save',
            premium: true,
            bestValue: true
        }
    ]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/admin/settings');
                setSettings(data);

                setPlans(prevPlans => prevPlans.map(plan => {
                    if (plan.id === 'free') {
                        return {
                            ...plan,
                            features: [
                                'Browse all mentors',
                                'View mentor profiles',
                                'Public chat in community',
                                '1 session booking per month'
                            ]
                        };
                    }
                    if (plan.id === 'monthly') {
                        return {
                            ...plan,
                            price: data.monthlyPrice,
                            features: [
                                'All Free features',
                                `Book up to ${data.monthlySessionLimit} sessions/mo`,
                                'Direct messaging with mentors',
                                `Select up to ${data.monthlyMentorLimit} Primary Mentors`,
                                'Priority support',
                                'Access to study materials'
                            ]
                        };
                    }
                    if (plan.id === 'yearly') {
                        return {
                            ...plan,
                            price: data.yearlyPrice,
                            features: [
                                'All Pro Monthly features',
                                `Book up to ${data.yearlySessionLimit} sessions/yr`,
                                '30% savings compared to monthly',
                                `Select up to ${data.yearlyMentorLimit} Primary Mentors`,
                                'Exclusive webinars access',
                                'Mock interview sessions',
                                'Certificate of completion'
                            ]
                        };
                    }
                    return plan;
                }));
            } catch (error) {
                console.error("Failed to fetch settings", error);
                // Keeps default values
            }
        };

        fetchSettings();
    }, []);

    const handleUpgradeClick = (plan: any) => {
        const user = localStorage.getItem('user');
        if (!user) {
            toast.error("Please login to upgrade");
            router.push('/login');
            return;
        }

        if (plan.id === 'free') return;

        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId.trim()) {
            toast.error("Please enter transaction ID");
            return;
        }

        setProcessing(true);
        try {
            await api.post('/subscriptions/purchase', {
                plan: selectedPlan.id,
                transactionId,
                paymentMethod
            });
            toast.success(`Succesfully upgraded to ${selectedPlan.name}!`);
            setShowPaymentModal(false);
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Simple, Transparent <span className="text-emerald-600">Pricing</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                        Choose the plan that fits your preparation needs. Upgrade or cancel anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${plan.bestValue ? 'ring-2 ring-emerald-500 scale-105 md:scale-110 z-10' : ''}`}
                        >
                            {plan.bestValue && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                                    Best Value
                                </div>
                            )}

                            <CardHeader className="space-y-1 pb-8">
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="font-medium">{plan.description}</CardDescription>
                                <div className="pt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">৳{plan.price}</span>
                                    {plan.price !== '0' && <span className="text-slate-500 font-medium">/{plan.id === 'yearly' ? 'year' : 'month'}</span>}
                                </div>
                            </CardHeader>

                            <CardContent className="grow space-y-4">
                                <ul className="space-y-3">
                                    {plan.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex font-medium text-slate-600 text-sm gap-3">
                                            <Check className="text-emerald-500 shrink-0" size={18} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-8">
                                <Button
                                    className={`w-full h-12 rounded-xl font-bold text-base transition-all ${plan.premium ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                    onClick={() => handleUpgradeClick(plan)}
                                    disabled={plan.id === 'free'}
                                >
                                    {plan.buttonText}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-20 text-center max-w-2xl mx-auto p-8 rounded-3xl bg-emerald-50 border border-emerald-100">
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Need a Custom Plan for your Institution?</h3>
                    <p className="text-emerald-700 font-medium mb-6">We offer special discounts for schools, colleges and coaching centers.</p>
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">Contact Sales Team</Button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl relative overflow-hidden border-0">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />

                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl text-slate-900">Upgrade to {selectedPlan.name}</CardTitle>
                                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <CardDescription className="text-slate-500 font-medium">Complete your payment to activate pro features.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                                    <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">৳{selectedPlan.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">{selectedPlan.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{selectedPlan.id === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleConfirmPayment} className="space-y-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">Select Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('bkash')}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'bkash' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#E2136E] flex items-center justify-center text-white font-black text-xs">bKash</div>
                                            <span className="text-xs font-bold text-slate-700 uppercase">bKash</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('nagad')}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'nagad' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#F7941D] flex items-center justify-center text-white font-black text-xs italic">Nagad</div>
                                            <span className="text-xs font-bold text-slate-700 uppercase">Nagad</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[13px] leading-relaxed text-amber-800 font-medium">
                                        <p className="mb-2"><strong>Instructions:</strong></p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Dial <strong>*247#</strong> or open <strong>{paymentMethod} app</strong></li>
                                            <li>Choose <strong>Send Money</strong> to <strong className="font-mono bg-amber-100 px-1 rounded">{settings?.adminPaymentNumber || "017XX-XXXXXX"}</strong></li>
                                            <li>Enter amount: <strong>৳{selectedPlan.price}</strong></li>
                                            <li>Enter your PIN to confirm</li>
                                            <li>Copy the <strong>Transaction ID</strong> and paste below</li>
                                        </ol>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Transaction ID <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                placeholder="e.g. 8N7X6W5V4U"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
                                    disabled={processing}
                                >
                                    {processing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Confirm Activation'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
