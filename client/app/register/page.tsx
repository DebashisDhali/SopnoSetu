"use client";
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Check, GraduationCap, ArrowRight, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import { motion } from 'framer-motion';

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
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Branding & Testimonial (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                        alt="University Campus"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 to-slate-900/90" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold font-serif mb-8">
                        <GraduationCap className="h-8 w-8 text-brand-400" />
                        <span>SopnoSetu</span>
                    </Link>
                    <h2 className="text-4xl font-extrabold leading-tight mb-4">
                        Begin Your Journey to <br />
                        <span className="text-brand-400">Academic Excellence.</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md">
                        Join thousands of students and mentors connecting daily to shape the future of Bangladesh.
                    </p>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <Quote className="h-8 w-8 text-brand-400 mb-4 opacity-50" />
                    <p className="text-lg font-medium italic mb-4 leading-relaxed">
                        "Finding a mentor from BUET through SopnoSetu was the turning point in my preparation. Their guidance was invaluable."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white">S</div>
                        <div>
                            <div className="font-bold text-white">Sakib Ahmed</div>
                            <div className="text-xs text-brand-200">CSE, BUET (Batch '23)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12 bg-slate-50 lg:bg-white overflow-y-auto">
                <div className="w-full max-w-md mx-auto space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500 hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Role Selector */}
                        <div className="p-1 bg-slate-100 rounded-xl flex gap-1">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'candidate', title: 'Admission Candidate' })}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${formData.role !== 'mentor'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'mentor', title: 'Mentor' })}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${formData.role === 'mentor'
                                    ? 'bg-white text-brand-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Mentor
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Common Fields */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-shadow"
                                    placeholder="e.g. Adnan Sami"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-shadow"
                                    placeholder="e.g. name@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-shadow"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Mentor Specific Fields */}
                            {formData.role === 'mentor' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-5 pt-2 border-t border-slate-100"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">University</label>
                                            <input
                                                type="text"
                                                name="university"
                                                required
                                                value={formData.university}
                                                onChange={handleChange}
                                                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-shadow"
                                                placeholder="e.g. DU"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                required
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-shadow"
                                                placeholder="e.g. EEE"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <FileUpload
                                            label="Student ID (Verification)"
                                            value={formData.studentIdUrl}
                                            onChange={(url) => setFormData({ ...formData, studentIdUrl: url })}
                                            onUpload={handleFileUploadWrapper}
                                            uploading={uploading}
                                            accept="image/*,application/pdf"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || (formData.role === 'mentor' && !formData.studentIdUrl)}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all hover:scale-[1.01]"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <span className="flex items-center">
                                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
