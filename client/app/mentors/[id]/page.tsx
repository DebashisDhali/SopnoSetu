"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Clock, Video, CheckCircle, Wallet, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Mentor {
    _id: string;
    university: string;
    department: string;
    hourlyRate: number;
    rating: number;
    bio: string;
    expertise: string[];
    reviewsCount: number;
    availability: { _id: string; day: string; startTime: string; endTime: string }[];
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
        profilePic?: string;
    };
    reviews?: {
        _id: string;
        candidate: { name: string; profilePic?: string };
        rating: number;
        comment: string;
        createdAt: string;

    }[];
    upcomingSessions?: { startTime: string; slotId: string }[];
}

export default function MentorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [mentor, setMentor] = useState<Mentor | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [transactionId, setTransactionId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const isSubscribedMentor = currentUser?.subscribedMentors?.some((m: any) => (typeof m === 'string' ? m : m._id) === mentor?.user._id);
    const hasActiveSub = currentUser?.subscriptionPlan !== 'free' && new Date(currentUser?.subscriptionExpires) > new Date();

    useEffect(() => {
        const fetchMentor = async () => {
            try {
                const { data } = await api.get(`/mentors/${params.id}`);
                setMentor(data);
            } catch (error) {
                toast.error("Mentor not found");
                router.push('/mentors');
            } finally {
                setLoading(false);
            }
        };

        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/admin/settings');
                setSettings(data);
            } catch (e) { }
        }

        const fetchCurrentUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                const detailRes = await api.get(`/auth/users/${data.id}`);
                setCurrentUser(detailRes.data);
            } catch (e) { }
        }

        if (params.id) fetchMentor();
        fetchSettings();
        fetchCurrentUser();
    }, [params.id, router]);

    const handleBookClick = () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            toast.error("Please login to book a session");
            router.push('/login');
            return;
        }

        const user = JSON.parse(userData);
        if (user.role === 'mentor') {
            toast.error("Only students can book mentoring sessions. As a mentor, you can still chat with other mentors.");
            return;
        }

        if (mentor?.availability && mentor.availability.length > 0 && selectedSlot === null) {
            toast.error("Please select an available time slot first");
            return;
        }

        console.log("Booking check:", { isSubscribedMentor, hasActiveSub, plan: currentUser?.subscriptionPlan });

        if (isSubscribedMentor && hasActiveSub) {
            toast.info("Processing subscription booking...");
            handleConfirmBooking(null as any);
        } else {
            setShowPaymentModal(true);
        }
    };

    const handleSelectMentor = async () => {
        console.log("Select mentor attempt:", { hasActiveSub, user: currentUser });

        if (!hasActiveSub) {
            toast.error("You need an active monthly or yearly subscription to select a primary mentor");
            return;
        }

        const limit = currentUser?.subscriptionPlan === 'monthly' ? settings?.monthlyMentorLimit : settings?.yearlyMentorLimit;

        // Ensure subscribedMentors is treated as an array of strings
        const currentSelectedIds = currentUser?.subscribedMentors?.map((m: any) => typeof m === 'string' ? m : m._id) || [];

        if (currentSelectedIds.length >= limit) {
            toast.error(`Your ${currentUser?.subscriptionPlan} plan only allows selecting up to ${limit} mentors.`);
            return;
        }

        try {
            if (currentSelectedIds.includes(mentor?.user._id)) {
                toast.info("This mentor is already in your primary list.");
                return;
            }

            setProcessing(true);
            const newList = [...currentSelectedIds, mentor?.user._id];
            const { data } = await api.post('/subscriptions/select-mentors', { mentorIds: newList });
            toast.success(`${mentor?.user.name} is now your Primary Mentor!`);

            // Update local state to reflect change immediately without reload
            setCurrentUser((prev: any) => ({
                ...prev,
                subscribedMentors: [...(prev?.subscribedMentors || []), mentor?.user._id]
            }));
        } catch (error: any) {
            console.error("Selection Error:", error);
            toast.error(error.response?.data?.message || "Failed to select mentor. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const getNextDate = (dayName: string, timeString: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const targetDayIndex = days.indexOf(dayName);

        if (targetDayIndex === -1) return null;

        let dayDiff = targetDayIndex - now.getDay();

        // Parse time
        const [time, modifier] = timeString.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const potentialDate = new Date(now);
        potentialDate.setHours(hours, minutes, 0, 0);

        if (dayDiff < 0) {
            dayDiff += 7; // Past day in week -> Next week
        } else if (dayDiff === 0) {
            // Same day. Check if time has passed.
            if (potentialDate <= now) {
                dayDiff += 7; // Time passed -> Next week
            }
        }

        const finalDate = new Date(now);
        finalDate.setDate(now.getDate() + dayDiff);
        finalDate.setHours(hours, minutes, 0, 0);
        return finalDate;
    };

    const isSlotBooked = (slotDate: Date) => {
        if (!mentor?.upcomingSessions) return false;
        return mentor.upcomingSessions.some(session => {
            const sessionTime = new Date(session.startTime).getTime();
            return sessionTime === slotDate.getTime();
        });
    };

    const handleConfirmBooking = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (mentor?.availability && mentor.availability.length > 0 && selectedSlot === null) {
            toast.error("Please select an available time slot");
            return;
        }

        setProcessing(true);

        // Calculate precise session start time based on selected slot
        let sessionStartTime;
        if (selectedSlot !== null && mentor?.availability[selectedSlot]) {
            const slot = mentor.availability[selectedSlot];
            const nextDate = getNextDate(slot.day, slot.startTime);
            if (nextDate) {
                sessionStartTime = nextDate.toISOString();
            } else {
                // Fallback (should not happen)
                const today = new Date();
                sessionStartTime = new Date(today.setDate(today.getDate() + 1)).toISOString();
            }
        } else {
            // Fallback for "Request Time" if no slot selected
            const today = new Date();
            sessionStartTime = new Date(today.setDate(today.getDate() + 1)).toISOString();
        }

        try {
            await api.post('/sessions', {
                mentorId: mentor?.user._id,
                startTime: sessionStartTime,
                duration: 60,
                notes: selectedSlot !== null && mentor?.availability[selectedSlot]
                    ? `Booked for ${mentor.availability[selectedSlot].day} at ${mentor.availability[selectedSlot].startTime}`
                    : "Looking forward to this session!",
                paymentMethod,
                transactionId,
                amount: mentor?.hourlyRate,
                slotId: mentor?.availability[selectedSlot]?._id
            });

            toast.success("Session booked successfully!");
            setShowPaymentModal(false);
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Booking failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-brand-600" /></div>;
    if (!mentor) return null;

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Profile Section */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-0 shadow-sm border-white/60">
                            <div className="bg-gradient-to-r from-brand-600 to-brand-700 h-32"></div>
                            <div className="px-8 pb-8 relative">
                                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg -mt-16 flex items-center justify-center overflow-hidden">
                                    {mentor.user.profilePic ? (
                                        <img src={mentor.user.profilePic} alt={mentor.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-brand-600 uppercase">{mentor.user.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                                        {mentor.user.name}
                                        {mentor.user.role === 'mentor' && <CheckCircle size={24} className="ml-2 text-blue-500 fill-blue-50" />}
                                    </h1>
                                    <p className="text-brand-600 font-semibold text-lg mt-1">{mentor.university}</p>
                                    <p className="text-slate-500">{mentor.department}</p>

                                    <div className="flex items-center space-x-4 mt-4 text-sm text-slate-600">
                                        <span className="flex items-center"><Star className="text-accent-500 fill-current mr-1" size={16} /> {mentor.rating} ({mentor.reviewsCount} reviews)</span>
                                        <span className="flex items-center"><MapPin size={16} className="mr-1" /> Dhaka, Bangladesh</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 border-0 shadow-sm border-white/60">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">About Me</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {mentor.bio || "This mentor hasn't written a bio yet, but they are verified and ready to help!"}
                            </p>

                            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {mentor.expertise && mentor.expertise.length > 0 ? (
                                    mentor.expertise.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <>
                                        <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">Admission Test</span>
                                        <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">Career Guidance</span>
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Reviews Section */}
                        <Card className="p-8 border-0 shadow-sm border-white/60">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Student Reviews</h3>
                                <div className="flex items-center text-brand-600">
                                    <Star className="fill-current text-accent-500 mr-1" size={20} />
                                    <span className="font-bold text-lg">{mentor.rating || "0.0"}</span>
                                    <span className="text-slate-400 text-sm ml-1">({mentor.reviewsCount || 0} reviews)</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {mentor.reviews && mentor.reviews.length > 0 ? (
                                    mentor.reviews.map((review) => (
                                        <div key={review._id} className="border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-50">
                                                        {review.candidate.profilePic ? (
                                                            <img src={review.candidate.profilePic} alt={review.candidate.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-slate-400 capitalize">{review.candidate.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{review.candidate.name}</p>
                                                        <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={i < review.rating ? "fill-accent-500 text-accent-500" : "text-slate-200"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <Star className="text-slate-200" size={32} />
                                        </div>
                                        <p className="text-slate-400 font-medium">No reviews yet. Be the first to book!</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Booking Section */}
                    <div className="md:col-span-1">
                        <Card className="p-6 border-0 shadow-lg sticky top-24 border-white/60">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="text-3xl font-bold text-slate-900">৳{mentor.hourlyRate}</span>
                                    <span className="text-slate-500">/hr</span>
                                </div>
                                <div className="bg-brand-100 text-brand-800 px-2 py-1 rounded-md text-xs font-bold">VERIFIED</div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center text-slate-600">
                                    <Video size={18} className="mr-3 text-slate-400" />
                                    <span>1:1 Video Consultation</span>
                                </div>
                                <div className="flex items-center text-slate-600">
                                    <Clock size={18} className="mr-3 text-slate-400" />
                                    <span>60 Minute Duration</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold text-slate-900 mb-3">Available Slots</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {mentor.availability && mentor.availability.length > 0 ? (
                                        mentor.availability.map((slot, i) => {
                                            const nextDate = getNextDate(slot.day, slot.startTime);
                                            const booked = nextDate ? isSlotBooked(nextDate) : false;

                                            return (
                                                <div
                                                    key={i}
                                                    className={`text-xs border rounded-lg p-2 text-center transition-all 
                                                        ${booked
                                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                            : selectedSlot === i
                                                                ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm cursor-pointer'
                                                                : 'border-slate-200 cursor-pointer hover:border-brand-500'
                                                        }`}
                                                    onClick={() => !booked && setSelectedSlot(i)}
                                                >
                                                    {slot.day}, {slot.startTime}
                                                    {booked && <span className="block text-[8px] uppercase font-bold text-red-400">Booked</span>}
                                                    {!booked && nextDate && <span className="block text-[8px] text-slate-400">{nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="col-span-2 text-xs text-slate-400 italic">No specific slots listed. Book to request time.</p>
                                    )}
                                </div>
                            </div>

                            {hasActiveSub && !isSubscribedMentor && (
                                <div className="space-y-4 mb-4">
                                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Subscription Benefit</p>
                                        <p className="text-xs text-emerald-600 leading-tight">Add this mentor to your primary list to book sessions instantly without extra cost.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleSelectMentor}
                                        className="w-full h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-black uppercase text-xs tracking-widest shadow-sm"
                                        disabled={processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin" /> : 'Select as Primary Mentor'}
                                    </Button>
                                </div>
                            )}

                            {hasActiveSub && isSubscribedMentor && (
                                <div className="mb-4">
                                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600"><CheckCircle size={16} /></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Primary Mentor</p>
                                            <p className="text-xs text-blue-600">You've selected this mentor.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleBookClick}
                                className={`w-full h-12 text-lg mb-3 ${isSubscribedMentor && hasActiveSub ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                disabled={!mentor.availability || mentor.availability.length === 0 || processing}
                            >
                                {processing ? <Loader2 className="animate-spin" /> :
                                    (isSubscribedMentor && hasActiveSub ? 'Instant Book (Sub)' :
                                        (mentor.availability && mentor.availability.length > 0 ? 'Book Session' : 'No Slots Available'))}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-12 text-lg border-brand-200 text-brand-700 hover:bg-brand-50"
                                onClick={() => router.push(`/dashboard?view=messages&with=${mentor.user._id}`)}
                            >
                                Chat with Mentor
                            </Button>
                            <p className="text-xs text-center text-slate-400 mt-4">100% Satisfaction Guarantee</p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-white shadow-2xl animate-in fade-in zoom-in duration-200 glass-card">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center text-slate-900"><Wallet className="mr-2 text-brand-600" /> Secure Payment</h2>
                                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                            </div>

                            <form onSubmit={handleConfirmBooking} className="space-y-4">
                                <div className="bg-brand-50 p-4 rounded-xl mb-4 border border-brand-100">
                                    <div className="flex justify-between mb-2 text-sm text-slate-600">
                                        <span>Session Fee</span>
                                        <span className="font-semibold">৳{mentor.hourlyRate}</span>
                                    </div>
                                    <div className="flex justify-between text-brand-700 font-bold text-lg">
                                        <span>Total Payable</span>
                                        <span>৳{mentor.hourlyRate}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            className={`border-2 rounded-xl p-3 cursor-pointer flex items-center justify-center transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold shadow-sm' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                            onClick={() => setPaymentMethod('bkash')}
                                        >
                                            bKash
                                        </div>
                                        <div
                                            className={`border-2 rounded-xl p-3 cursor-pointer flex items-center justify-center transition-all ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold shadow-sm' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                            onClick={() => setPaymentMethod('nagad')}
                                        >
                                            Nagad
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Transaction ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 8JKS992LKS"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Send money to <span className="font-mono bg-slate-100 px-1 rounded">{settings?.adminPaymentNumber || "017XX-XXXXXX"}</span> (Personal)</p>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full h-11">
                                    {processing ? <Loader2 className="animate-spin" /> : 'Confirm Payment & Book'}
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
