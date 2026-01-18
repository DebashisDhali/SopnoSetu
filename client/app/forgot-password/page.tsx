"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/auth/forgotpassword', { email });
            setSuccess(true);
            toast.success("Reset link sent to your email");
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset email.');
            toast.error(err.response?.data?.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-slate-900">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                                Email sent! Please check your inbox and follow the instructions to reset your password.
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md text-center">{error}</div>}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    placeholder="m@example.com"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!success && (
                    <CardFooter className="flex justify-center">
                        <Link href="/login" className="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                            <ArrowLeft size={16} className="mr-2" /> Back to Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
