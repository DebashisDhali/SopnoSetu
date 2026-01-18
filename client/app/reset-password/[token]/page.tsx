"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// @ts-ignore
export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const unwrappedParams = React.use(params);
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/auth/resetpassword/${unwrappedParams.token}`, { password });
            toast.success("Password reset successful! Logging you in...");
            // Optional: If the API returns a token, we could auto-login here.
            // For now, let's redirect to login.
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-slate-900">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md text-center">{error}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">New Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                placeholder="Min. 6 characters"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Confirm Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                placeholder="Re-enter password"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Set New Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
