"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Menu, X, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = async () => {
        try {
            const { data } = await api.get('/chat/unread-count');
            setUnreadCount(data.count);
        } catch (e) { }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);

        // Check login status
        const checkLogin = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setIsLoggedIn(true);
                try {
                    const user = JSON.parse(userStr);
                    setUserRole(user.role);
                    fetchUnread();
                } catch (e) {
                    console.error("Failed to parse user from local storage");
                    setUserRole(null);
                }
            } else {
                setIsLoggedIn(true); // Assuming true if token exists, but let's be safe
                if (!userStr) setIsLoggedIn(false);
                setUserRole(null);
            }
        }

        checkLogin();

        const interval = setInterval(() => {
            if (localStorage.getItem('token')) fetchUnread();
        }, 10000); // Check every 10 seconds

        // Listen for storage events (cross-tab)
        window.addEventListener('storage', checkLogin);
        // Listen for custom auth events (same-tab)
        window.addEventListener('auth-change', checkLogin);
        window.addEventListener('refresh-unread', fetchUnread);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkLogin);
            window.removeEventListener('auth-change', checkLogin);
            window.removeEventListener('refresh-unread', fetchUnread);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Dispatch event so Navbar updates immediately
        window.dispatchEvent(new Event('auth-change'));
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

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? 'glass shadow-md py-3'
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
                        <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
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
                                {link.name === 'Messages' && unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-in zoom-in">
                                        {unreadCount}
                                    </span>
                                )}
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
