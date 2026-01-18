"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { Calendar, Video, Clock, MessageCircle, Edit2, Check, X, Plus, Trash2, Upload, CheckCircle2, CircleDollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface MentorDashboardProps {
    user: any;
}

interface Session {
    _id: string;
    candidate: { _id: string; name: string; email: string };
    startTime: string;
    duration: number;
    status: string;
    paymentStatus: string;
    notes: string;
    amount?: number;
    meetingLink?: string;
}

interface AvailabilitySlot {
    day: string;
    startTime: string;
    endTime: string;
}

const MentorDashboard = ({ user }: MentorDashboardProps) => {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        university: '',
        universityEmail: '',
        department: '',
        bio: '',
        hourlyRate: '',
        expertise: '',
        studentIdUrl: '',
        meetingLink: '',
        profilePic: '',
        paymentMethods: [] as string[], // Changed to array
        paymentNumber: '',
        availability: [] as AvailabilitySlot[]
    });
    const [uploading, setUploading] = useState<string | null>(null);

    // Temp state for adding new slot
    const [newSlot, setNewSlot] = useState({ day: 'Saturday', startTime: '', endTime: '' });

    const [walletBalance, setWalletBalance] = useState(0);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/sessions');
            setSessions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/mentors/me');
            setWalletBalance(data.walletBalance || 0);
            setProfileData({
                name: data.user?.name || '',
                university: data.university || '',
                universityEmail: data.universityEmail || '',
                department: data.department || '',
                bio: data.bio || '',
                hourlyRate: data.hourlyRate?.toString() || '',
                expertise: data.expertise?.join(', ') || '',
                studentIdUrl: data.user?.studentIdUrl || '',
                meetingLink: data.meetingLink || '',
                profilePic: data.user?.profilePic || '',
                paymentMethods: data.paymentMethods || [],
                paymentNumber: data.paymentNumber || '',
                availability: data.availability || []
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    }

    useEffect(() => {
        fetchSessions();
        fetchProfile(); // Always fetch profile on mount
    }, []);

    useEffect(() => {
        if (isEditing) {
            fetchProfile(); // Refresh when entering edit mode
        }
    }, [isEditing]);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.put(`/sessions/${id}`, { status });
            toast.success(`Session ${status} successfully`);
            fetchSessions();
        } catch (error) {
            toast.error("Failed to update session");
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/mentors/me', {
                ...profileData,
                expertise: profileData.expertise.split(',').map(s => s.trim()),
                hourlyRate: Number(profileData.hourlyRate)
            });
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update profile");
        }
    }

    const addSlot = () => {
        if (!newSlot.startTime || !newSlot.endTime) {
            toast.error("Please fill in start and end times");
            return;
        }
        setProfileData({
            ...profileData,
            availability: [...profileData.availability, newSlot]
        });
        setNewSlot({ day: 'Saturday', startTime: '', endTime: '' });
    };

    const removeSlot = (index: number) => {
        const newSlots = [...profileData.availability];
        newSlots.splice(index, 1);
        setProfileData({ ...profileData, availability: newSlots });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(field);
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileData({ ...profileData, [field]: data.url });
            toast.success("File uploaded successfully");
        } catch (error) {
            toast.error("Upload failed");
            console.error(error);
        } finally {
            setUploading(null);
        }
    };

    const togglePaymentMethod = (method: string) => {
        const current = [...profileData.paymentMethods];
        const index = current.indexOf(method);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(method);
        }
        setProfileData({ ...profileData, paymentMethods: current });
    };

    const pendingSessions = sessions.filter(s => s.status === 'pending');
    const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'approved');
    const totalEarnings = sessions.filter(s => s.status === 'completed' || s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.amount || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-100 border-2 border-brand-200 shadow-inner">
                        {profileData.profilePic || user.profilePic ? (
                            <img src={profileData.profilePic || user.profilePic} alt={profileData.name || user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold text-xl uppercase">
                                {(profileData.name || user.name).charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{profileData.name || user.name}</h2>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="border-brand-200 hover:bg-brand-50 hover:text-brand-700">
                    <Edit2 size={16} className="mr-2" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
            </div>

            {isEditing && (
                <Card className="border-brand-100 shadow-xl mb-8 animate-in fade-in zoom-in duration-200 glass-card">
                    <CardHeader>
                        <CardTitle className="text-brand-700">Update Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        placeholder="Your Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">University <span className="text-red-500">*</span></label>
                                    <Input
                                        value={profileData.university}
                                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                                        placeholder="e.g. Dhaka University"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">University Email <span className="text-red-500">*</span></label>
                                    <Input
                                        type="email"
                                        value={profileData.universityEmail}
                                        onChange={(e) => setProfileData({ ...profileData, universityEmail: e.target.value })}
                                        placeholder="e.g. yourname@du.ac.bd"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Providing this increases student trust.</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Department <span className="text-red-500">*</span></label>
                                    <Input
                                        value={profileData.department}
                                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                        placeholder="e.g. CSE"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Hourly Rate (৳) <span className="text-red-500">*</span></label>
                                    <Input
                                        type="number"
                                        value={profileData.hourlyRate}
                                        onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                                        placeholder="e.g. 500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Expertise (Comma separated) <span className="text-red-500">*</span></label>
                                    <Input
                                        value={profileData.expertise}
                                        onChange={(e) => setProfileData({ ...profileData, expertise: e.target.value })}
                                        placeholder="e.g. Math, Physics, Career"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700 font-bold text-brand-700">Meeting Link (Google Meet/Zoom) <span className="text-red-500">*</span></label>
                                    <Input
                                        type="url"
                                        value={profileData.meetingLink}
                                        onChange={(e) => setProfileData({ ...profileData, meetingLink: e.target.value })}
                                        placeholder="e.g. https://meet.google.com/abc-defg-hij"
                                        className="border-brand-300 focus:ring-brand-500"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">This link will be shown to students for their sessions.</p>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-medium text-slate-700">Profile Picture</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-brand-300 rounded-lg bg-white text-brand-600 cursor-pointer hover:bg-brand-50 transition-colors h-10 overflow-hidden text-xs">
                                            <Upload size={14} />
                                            {uploading === 'profilePic' ? 'Uploading...' : 'Choose Photo'}
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profilePic')} accept="image/*" />
                                        </label>
                                        {profileData.profilePic && <Check size={16} className="text-green-500" />}
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-medium text-slate-700">Verification (Student ID) <span className="text-red-500">*</span></label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-brand-300 rounded-lg bg-white text-brand-600 cursor-pointer hover:bg-brand-50 transition-colors h-10 overflow-hidden text-xs">
                                            <Upload size={14} />
                                            {uploading === 'studentIdUrl' ? 'Uploading...' : 'Upload ID'}
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'studentIdUrl')} accept="image/*,application/pdf" />
                                        </label>
                                        {profileData.studentIdUrl && <Check size={16} className="text-green-500" />}
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-medium text-slate-700">Select Payment Methods</label>
                                    <div className="flex gap-2 mt-2">
                                        {['bKash', 'Nagad', 'Rocket'].map(method => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => togglePaymentMethod(method)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${profileData.paymentMethods.includes(method)
                                                    ? 'bg-brand-600 text-white shadow-md'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-medium text-slate-700">Payment Number (Same for all selected) <span className="text-red-500">*</span></label>
                                    <Input
                                        value={profileData.paymentNumber}
                                        onChange={(e) => setProfileData({ ...profileData, paymentNumber: e.target.value })}
                                        placeholder="e.g. 017XXXXXXXX"
                                    />
                                </div>
                            </div>

                            {/* Schedule Section - Restored since multi-replace might have nudged it */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800">My Availability</h3>
                                    <Button type="button" onClick={addSlot} size="sm" className="bg-brand-600 hover:bg-brand-700">
                                        <Plus size={16} className="mr-1" /> Add Slot
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Day</label>
                                        <select
                                            className="w-full mt-1 h-9 px-2 rounded-md border border-slate-200 bg-white text-sm"
                                            value={newSlot.day}
                                            onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                                        >
                                            {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full mt-1 h-9 px-2 rounded-md border border-slate-200 bg-white text-sm"
                                            value={newSlot.startTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full mt-1 h-9 px-2 rounded-md border border-slate-200 bg-white text-sm"
                                            value={newSlot.endTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {profileData.availability.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.availability.map((slot, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg border border-brand-100 text-sm font-medium">
                                                <span>{slot.day}, {slot.startTime} - {slot.endTime}</span>
                                                <button type="button" onClick={() => removeSlot(index)} className="text-brand-400 hover:text-red-500">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No slots added yet.</p>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="text-sm font-medium text-slate-700">Bio</label>
                                <textarea
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 min-h-[100px]"
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    placeholder="Tell students about yourself..."
                                />
                            </div>



                            <Button type="submit" className="w-full md:w-auto h-11 px-8">Save All Changes</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {!user.isMentorVerified && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-amber-800 font-medium">
                                Your profile is pending verification. You will be visible to student searches once an admin approves your profile.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-brand-100/50 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                            Pending Requests
                            <Clock size={12} className="text-slate-300" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900 leading-none">{pendingSessions.length}</div>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Waiting for action</p>
                    </CardContent>
                </Card>

                <Card className="border-brand-500/20 shadow-sm overflow-hidden bg-brand-50/10 group hover:shadow-md transition-shadow ring-1 ring-brand-100">
                    <CardHeader className="pb-2 bg-brand-50/30">
                        <CardTitle className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex justify-between items-center">
                            Available Balance
                            <CheckCircle2 size={12} className="text-brand-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-brand-700 leading-none">৳{walletBalance}</div>
                        <p className="text-[10px] text-brand-600/60 mt-2 font-bold uppercase tracking-tighter">Due for payout</p>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 bg-emerald-50/20">
                        <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex justify-between items-center">
                            Total Earnings
                            <CircleDollarSign size={12} className="text-emerald-300" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900 leading-none">৳{totalEarnings}</div>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Life-time gross</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                            Total Sessions
                            <Calendar size={12} className="text-slate-300" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900 leading-none">{sessions.length}</div>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Engagements</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Session Requests */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Session Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingSessions.length === 0 ? (
                            <p className="text-slate-500 text-sm">No pending requests.</p>
                        ) : (
                            <ul className="space-y-4">
                                {pendingSessions.map(session => (
                                    <li key={session._id} className="border p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{session.candidate.name}</h4>
                                                <p className="text-xs text-slate-500">{session.candidate.email}</p>
                                            </div>
                                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold">
                                                {session.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-600 mb-4 space-y-1">
                                            <div className="flex items-center"><Clock size={14} className="mr-2" /> {new Date(session.startTime).toLocaleString()}</div>
                                            <div className="italic text-slate-500">"{session.notes}"</div>
                                            <div className="font-bold text-brand-600">৳{session.amount}</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" onClick={() => handleStatusUpdate(session._id, 'accepted')} className="flex-1 bg-brand-600 hover:bg-brand-700">
                                                <Check size={16} className="mr-1" /> Accept
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard?view=messages&with=${session.candidate._id}`)} className="flex-1">
                                                <MessageCircle size={16} className="mr-1" /> Message
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(session._id, 'cancelled')} className="flex-1 hover:bg-red-600">
                                                <X size={16} className="mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Sessions */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Upcoming Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingSessions.length === 0 ? (
                            <p className="text-slate-500 text-sm">No upcoming scheduled sessions.</p>
                        ) : (
                            <ul className="space-y-4">
                                {upcomingSessions.map(session => (
                                    <li key={session._id} className="border p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-slate-900">{session.candidate.name}</h4>
                                            <span className="bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded font-bold">ACCEPTED</span>
                                        </div>
                                        <div className="text-sm text-slate-600 mb-3 flex items-center">
                                            <Clock size={14} className="mr-2" /> {new Date(session.startTime).toLocaleString()}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full bg-brand-600 text-white hover:bg-brand-700 border-none shadow-md"
                                            onClick={() => {
                                                const finalLink = profileData.meetingLink || session.meetingLink;
                                                if (finalLink && !finalLink.includes('/ss-')) {
                                                    const url = finalLink.startsWith('http') ? finalLink : `https://${finalLink}`;
                                                    window.open(url, '_blank');
                                                } else if (profileData.meetingLink) {
                                                    const url = profileData.meetingLink.startsWith('http') ? profileData.meetingLink : `https://${profileData.meetingLink}`;
                                                    window.open(url, '_blank');
                                                }
                                            }}
                                            disabled={!session.meetingLink && !profileData.meetingLink}
                                        >
                                            <Video size={14} className="mr-2" /> Join Call
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MentorDashboard;
