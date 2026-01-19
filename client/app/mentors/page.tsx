"use client";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, MapPin, BookOpen, Star, Filter, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Mentor {
    _id: string;
    university: string;
    department: string;
    hourlyRate: number;
    rating: number;
    user: {
        _id: string;
        name: string;
        email: string;
        profilePic?: string;
    };
}

export default function MentorsPage() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const { data } = await api.get('/mentors');
                setMentors(data);
            } catch (error) {
                console.error("Failed to fetch mentors", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const filteredMentors = mentors.filter(mentor =>
        mentor.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header Banner */}
            <div className="bg-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-brand-100">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100 rounded-full blur-[100px] opacity-60 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-50 rounded-full blur-[100px] opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                            Find Your Perfect <span className="text-brand-600">Mentor</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                            Connect with verified seniors from Dhaka University, BUET, DMC, and more.
                            Get guided, get inspired.
                        </p>
                    </motion.div>

                    {/* Floating Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="max-w-2xl mx-auto relative"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-200 to-teal-200 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
                            <div className="relative flex items-center bg-white rounded-full shadow-xl p-2 border border-slate-100">
                                <Search className="ml-4 text-slate-400 h-6 w-6" />
                                <input
                                    type="text"
                                    placeholder="Search by name, university, or department..."
                                    className="w-full px-4 py-3 text-slate-700 bg-transparent focus:outline-none text-base placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button className="rounded-full px-6 bg-brand-600 text-white hover:bg-brand-700 font-medium transition-all shadow-md">
                                    Search
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Filters Row (Simplified for now) */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <p className="text-slate-500 font-medium">
                        Showing <span className="text-slate-900 font-bold">{filteredMentors.length}</span> mentors available
                    </p>
                    <Button variant="outline" size="sm" className="hidden border-slate-200 text-slate-600 hover:bg-white">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 bg-slate-200 rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMentors.map((mentor, index) => (
                            <motion.div
                                key={mentor._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden group h-full flex flex-col">
                                    <div className="h-28 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/10 transition-colors"></div>
                                        <div className="absolute right-4 top-4 opacity-10">
                                            <GraduationCap className="w-24 h-24 text-brand-900 rotate-12" />
                                        </div>
                                    </div>

                                    <div className="px-6 relative flex-grow cursor-default">
                                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg -mt-12 mb-4 relative z-10">
                                            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                                                {mentor.user.profilePic ? (
                                                    <img src={mentor.user.profilePic} alt={mentor.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-600 font-bold text-3xl">
                                                        {mentor.user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">{mentor.user.name}</h3>
                                                <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded text-amber-700 text-xs font-bold">
                                                    <Star size={12} className="mr-1 fill-amber-500 text-amber-500" />
                                                    {mentor.rating || 'New'}
                                                </div>
                                            </div>
                                            <p className="text-brand-600 font-bold text-sm mb-1">{mentor.university}</p>
                                            <div className="flex items-center text-slate-500 text-sm">
                                                <BookOpen size={14} className="mr-1.5" />
                                                {mentor.department}
                                            </div>
                                        </div>


                                    </div>

                                    <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
                                        <div className="text-slate-900 font-bold">
                                            ৳{mentor.hourlyRate} <span className="text-slate-500 font-normal text-xs">/session</span>
                                        </div>
                                        <Link href={`/mentors/${mentor._id}`} className="w-full max-w-[140px]">
                                            <Button className="w-full bg-white hover:bg-brand-50 text-brand-700 border border-brand-200 hover:border-brand-300 shadow-sm font-semibold rounded-lg transition-all h-9">
                                                View Profile
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredMentors.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No mentors found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            We couldn't find any mentors matching your search. Try adjusting your filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
