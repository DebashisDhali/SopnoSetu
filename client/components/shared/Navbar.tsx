"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = useCallback(async () => {
        if (typeof window === 'undefined' || !localStorage.getItem('token')) return;
        try {
            const { data } = await api.get('/chat/unread-count');
            setUnreadCount(data?.count || 0);
        } catch (e) {
            // Ignore fetch errors for count
        }
    }, []);

    const checkLogin = useCallback(() => {
        if (typeof window === 'undefined') return;
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setIsLoggedIn(true);
            try {
                const user = JSON.parse(userStr);
                setUserRole(user.role);
                fetchUnread();
            } catch (e) {
                setUserRole(null);
            }
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
        }
    }, [fetchUnread]);

    useEffect(() => {
        setIsMounted(true);
        checkLogin();

        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        const interval = setInterval(() => {
            if (typeof window !== 'undefined' && localStorage.getItem('token')) {
                fetchUnread();
            }
        }, 30000); // Check every 30 seconds to save network

        window.addEventListener('storage', checkLogin);
        window.addEventListener('auth-change', checkLogin);
        window.addEventListener('refresh-unread', fetchUnread);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkLogin);
            window.removeEventListener('auth-change', checkLogin);
            window.removeEventListener('refresh-unread', fetchUnread);
            clearInterval(interval);
        };
    }, [checkLogin, fetchUnread]);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth-change'));
        }
        setIsLoggedIn(false);
        setUserRole(null);
        router.push('/login');
    };

    const getDashboardLabel = () => {
        if (!userRole) return 'Dashboard';
        if (userRole === 'mentor') return 'Mentor Dashboard';
        if (userRole === 'admin') return 'Admin Dashboard';
        return 'Student Dashboard';
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Find Mentors', href: '/mentors' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'About', href: '/about' },
    ];

    // Prevent hydration mismatch
    if (!isMounted) {
        return (
            <nav className="fixed w-full z-50 py-5 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-slate-950 font-bold text-2xl">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl mr-2"></div>
                        SopnoSetu
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-md shadow-md py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-2 shadow-lg group-hover:shadow-brand-500/30 transition-shadow">
                            S
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            Sopno<span className="text-brand-600">Setu</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative flex items-center gap-1 ${pathname === link.href
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'text-slate-600 hover:text-brand-600 hover:bg-white/50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                        {isLoggedIn ? (
                            <>
                                <NotificationBell />
                                <Link href="/dashboard">
                                    <Button variant="ghost" className="text-slate-700 hover:text-brand-700 hover:bg-brand-50/50 rounded-full flex items-center">
                                        <User size={18} className="mr-2" /> {getDashboardLabel()}
                                    </Button>
                                </Link>
                                <Button onClick={handleLogout} variant="outline" className="border-brand-200 text-brand-700 hover:bg-brand-50 rounded-full">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-slate-700 hover:text-brand-700 hover:bg-brand-50/50 rounded-full">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg shadow-brand-500/20 rounded-full px-6 transition-all hover:scale-105">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-700 hover:text-brand-600 p-2 rounded-lg bg-white/50 backdrop-blur-sm"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 grid grid-cols-2 gap-3">
                                {isLoggedIn ? (
                                    <>
                                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-700">
                                                {getDashboardLabel()}
                                            </Button>
                                        </Link>
                                        <Button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full bg-red-50 text-red-600 hover:bg-red-100 rounded-xl">
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-700">
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/register" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full bg-brand-600 text-white rounded-xl">
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
