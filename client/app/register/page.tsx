"use client";
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role') || 'candidate';

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: initialRole,
        title: initialRole === 'mentor' ? 'Mentor' : 'Admission Candidate',
        university: '',
        department: '',
        studentIdUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUploadWrapper = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            setUploading(true);
            const { data } = await api.post('/upload/public', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.url;
        } catch (error: any) {
            const message = error.response?.data?.message || "Upload failed. Please try again.";
            setError(message);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/register', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            // Dispatch event to notify Navbar
            window.dispatchEvent(new Event('auth-change'));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-md relative overflow-hidden flex flex-col max-h-[95vh] md:max-h-none">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

            <CardHeader className="space-y-2 pb-4 md:pb-8 shrink-0">
                <CardTitle className="text-2xl md:text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                    Create an Account
                </CardTitle>
                <CardDescription className="text-center text-slate-500 font-medium text-xs md:text-sm">
                    Join SopnoSetu as a <span className="text-emerald-600 font-bold">{formData.role === 'mentor' ? 'Mentor' : formData.title}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="overflow-y-auto pb-4 px-4 md:px-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* User Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            I am a <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="userTypeSelector"
                            value={formData.role === 'mentor' ? 'mentor' : formData.title || 'Admission Candidate'}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'mentor') {
                                    setFormData({ ...formData, role: 'mentor', title: 'Mentor' });
                                } else {
                                    setFormData({ ...formData, role: 'candidate', title: val });
                                }
                            }}
                            className="flex h-11 md:h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        >
                            <optgroup label="Student/Guardian">
                                <option value="Admission Candidate">Admission Candidate</option>
                                <option value="HSC Student">HSC Student</option>
                                <option value="Parent">Parent/Guardian</option>
                            </optgroup>
                            <optgroup label="Mentor">
                                <option value="mentor">University Senior (Mentor)</option>
                            </optgroup>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                {formData.role === 'mentor' ? 'University Email' : 'Email'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                        </div>

                        {formData.role === 'mentor' && (
                            <>
                                {/* University */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">University <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="university"
                                        required={formData.role === 'mentor'}
                                        value={formData.university}
                                        onChange={handleChange}
                                        placeholder="e.g. Dhaka University"
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                                    />
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Department <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="department"
                                        required={formData.role === 'mentor'}
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="e.g. CSE"
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                                    />
                                </div>

                                {/* ID Card Upload - Full width in grid */}
                                <div className="space-y-2 md:col-span-2">
                                    <FileUpload
                                        label="Student ID Card (Upload for Verification)"
                                        value={formData.studentIdUrl}
                                        onChange={(url) => setFormData({ ...formData, studentIdUrl: url })}
                                        onUpload={handleFileUploadWrapper}
                                        uploading={uploading}
                                        accept="image/*,application/pdf"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm md:static md:bg-transparent md:pt-0">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            disabled={loading || (formData.role === 'mentor' && !formData.studentIdUrl)}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-4 animate-spin" /> : 'Create My Account'}
                        </Button>
                    </div>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-6 pt-2 shrink-0 border-t border-slate-100/50">
                <div className="w-full h-px bg-slate-100 relative">
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        OR
                    </span>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Already have an account? <Link href="/login" className="text-emerald-600 font-bold hover:underline underline-offset-4 decoration-2">Log In Here</Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
            <Suspense fallback={<div>Loading...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
