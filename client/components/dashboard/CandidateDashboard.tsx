"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/services/api';
import { Calendar, Video, Clock, MessageCircle, Edit2, User as UserIcon, Save, Upload, Check, X, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Session {
    _id: string;
    mentor: { _id: string; name: string; email: string };
    startTime: string;
    duration: number;
    status: string;
    meetingLink?: string;
}

const CandidateDashboard = () => {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        profilePic: '',
        phone: '',
        university: '',
        department: ''
    });
    const [uploading, setUploading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/sessions');
            setSessions(data);
        } catch (error) {
            console.error("Failed to fetch sessions");
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            const detailRes = await api.get(`/auth/users/${data.id}`);
            const userData = detailRes.data;
            setUser(userData);
            setProfileData({
                name: userData.name || '',
                bio: userData.bio || '',
                profilePic: userData.profilePic || '',
                phone: userData.phone || '',
                university: userData.university || '',
                department: userData.department || ''
            });
        } catch (error) {
            console.error("Failed to fetch user info");
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchUser();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileData({ ...profileData, profilePic: data.url });
            toast.success("Photo uploaded successfully");
        } catch (error: any) {
            const message = error.response?.data?.message || "Upload failed";
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/auth/profile', profileData);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            fetchUser();
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;

        try {
            setSubmittingReview(true);
            await api.post('/reviews', {
                mentorId: (selectedSession.mentor as any)._id || selectedSession.mentor,
                sessionId: selectedSession._id,
                rating: reviewData.rating,
                comment: reviewData.comment
            });
            toast.success("Thank you for your feedback!");
            setShowReviewModal(false);
            setReviewData({ rating: 5, comment: '' });
            fetchSessions(); // Refresh sessions to update UI
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header with Profile Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-green-100 border-2 border-green-200 shadow-inner">
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-green-600 font-bold text-xl uppercase">
                                {user?.name?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h2>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/mentors">
                        <Button className="bg-green-600 hover:bg-green-700 shadow-md">Find a Mentor</Button>
                    </Link>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="border-slate-200">
                        <Edit2 size={16} className="mr-2" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </Button>
                </div>
            </div>

            {isEditing && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg">Edit Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Display Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">University / Institution <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        value={profileData.university}
                                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                                        placeholder="e.g. Dhaka University"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Department / Class <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        value={profileData.department}
                                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                        placeholder="e.g. CSE"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Profile Picture</label>
                                    <div className="mt-1 flex items-center gap-2 h-10">
                                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-green-300 rounded-lg bg-white text-green-600 cursor-pointer hover:bg-green-50 transition-colors h-full text-xs overflow-hidden">
                                            <Upload size={14} />
                                            {uploading ? 'Uploading...' : profileData.profilePic ? 'Change Photo' : 'Upload Photo'}
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        </label>
                                        {profileData.profilePic && <Check size={16} className="text-green-500" />}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Bio</label>
                                    <textarea
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] text-sm"
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        placeholder="Tell mentors about yourself and your goals..."
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                <Save size={16} className="mr-2" /> Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center"><Calendar className="mr-2 h-5 w-5 text-green-600" /> Upcoming Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-sm text-slate-400">Loading...</p>
                            ) : sessions.length > 0 ? (
                                <ul className="space-y-4">
                                    {sessions.map((session) => (
                                        <li key={session._id} className="border border-slate-100 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{session.mentor.name}</h4>
                                                <div className="text-sm text-slate-500 flex items-center mt-1">
                                                    <Clock size={14} className="mr-1" />
                                                    {new Date(session.startTime).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    session.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                        session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {session.status.toUpperCase()}
                                                </span>
                                                <div className="flex gap-2 justify-end">
                                                    {session.status === 'accepted' && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="flex items-center text-xs h-8" onClick={() => router.push(`/dashboard?view=messages&with=${session.mentor._id}`)}>
                                                                <MessageCircle size={12} className="mr-1" /> Chat
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex items-center text-xs h-8 bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100"
                                                                onClick={() => {
                                                                    const finalLink = (session as any).mentorProfileLink || session.meetingLink;
                                                                    if (finalLink && !finalLink.includes('/ss-')) {
                                                                        const url = finalLink.startsWith('http') ? finalLink : `https://${finalLink}`;
                                                                        window.open(url, '_blank');
                                                                    } else {
                                                                        toast.error("Mentor hasn't set a valid meeting link yet.");
                                                                    }
                                                                }}
                                                                disabled={!session.meetingLink && !(session as any).mentorProfileLink}
                                                            >
                                                                <Video size={12} className="mr-1" /> Join Call
                                                            </Button>
                                                        </>
                                                    )}
                                                    {session.status === 'completed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex items-center text-xs h-8 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                                            onClick={() => {
                                                                setSelectedSession(session);
                                                                setShowReviewModal(true);
                                                            }}
                                                        >
                                                            <Star size={12} className="mr-1" /> Rate Experience
                                                        </Button>
                                                    )}
                                                    {session.status === 'pending' && (
                                                        <Button size="sm" variant="ghost" className="text-xs h-8 text-brand-600" onClick={() => router.push(`/dashboard?view=messages&with=${session.mentor._id}`)}>
                                                            <MessageCircle size={12} className="mr-1" /> Message
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 text-sm mb-4">No upcoming sessions.</p>
                                    <Link href="/mentors">
                                        <Button variant="outline" size="sm">Book Now</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">My Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <span className="block text-3xl font-bold text-green-600">{sessions.length}</span>
                                <span className="text-xs text-green-800 uppercase font-semibold">Total Sessions</span>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <span className="block text-3xl font-bold text-blue-600">0</span>
                                <span className="text-xs text-blue-800 uppercase font-semibold">Hours Mentored</span>
                            </div>

                            {/* Subscription Status */}
                            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Star size={40} className="text-brand-600" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase text-brand-600 tracking-widest mb-2">Account Tier</h4>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xl font-black text-slate-900 uppercase">{user?.subscriptionPlan || 'Free'}</span>
                                    {user?.subscriptionPlan !== 'free' && (
                                        <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase">Active</div>
                                    )}
                                </div>
                                {user?.subscriptionExpires && (
                                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase">
                                        <Clock size={10} /> Valid Until: {new Date(user.subscriptionExpires).toLocaleDateString()}
                                    </div>
                                )}
                                {user?.subscriptionPlan === 'free' && (
                                    <Button
                                        onClick={() => router.push('/pricing')}
                                        className="w-full mt-3 h-8 text-[10px] font-black uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-200"
                                    >
                                        Go Pro
                                    </Button>
                                )}
                            </div>

                            {/* Primary Mentors Section */}
                            {user?.subscriptionPlan !== 'free' && (
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">My Primary Mentors</h4>
                                    {user?.subscribedMentors?.length > 0 ? (
                                        <div className="space-y-2">
                                            {/* Dedup mentors to prevent key errors if backend has duplicates */}
                                            {Array.from(new Map(user.subscribedMentors.map((m: any) => [m._id, m])).values()).map((mentor: any) => (
                                                <div key={mentor._id} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-50">
                                                            {mentor.profilePic ? (
                                                                <img src={mentor.profilePic} alt={mentor.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                                                                    {mentor.name?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700 group-hover:text-brand-600 transition-colors">{mentor.name}</p>
                                                    </div>
                                                    <Link href={`/mentors/${mentor._id}`}>
                                                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-tighter text-brand-600 hover:text-brand-700 hover:bg-brand-50">
                                                            Book
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 italic">No mentors selected yet.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Rate Your Experience</span>
                                <Button variant="ghost" size="sm" onClick={() => setShowReviewModal(false)}><X size={20} /></Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                className={`p-2 rounded-lg transition-all ${reviewData.rating >= star ? 'text-yellow-500 bg-yellow-50' : 'text-slate-300 bg-slate-50'}`}
                                            >
                                                <Star size={24} fill={reviewData.rating >= star ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
                                    <textarea
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 min-h-[100px] text-sm"
                                        placeholder="How was the session? What did you learn?"
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" disabled={submittingReview} className="w-full bg-green-600">
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CandidateDashboard;
