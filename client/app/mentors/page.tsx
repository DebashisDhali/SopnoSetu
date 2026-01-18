"use client";
import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, MapPin, BookOpen, Star } from 'lucide-react';

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
                // In a real app, pass search term to API
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
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Find Your Perfect Mentor</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Browse through our verified seniors from top universities. Filter by university, department, or name.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-16 relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, university, or department..."
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center">Loading mentors...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMentors.map((mentor) => (
                            <Card key={mentor._id} className="hover:shadow-lg transition-shadow duration-300 border-white/60 overflow-hidden group">
                                <div className="h-24 bg-gradient-to-r from-brand-600 to-brand-800 transition-colors"></div>
                                <div className="px-6 relative">
                                    <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md -mt-10 flex items-center justify-center overflow-hidden">
                                        {mentor.user.profilePic ? (
                                            <img src={mentor.user.profilePic} alt={mentor.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-brand-600 uppercase">{mentor.user.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                                <CardContent className="pt-4 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{mentor.user.name}</h3>
                                        <p className="text-sm text-brand-600 font-medium flex items-center">
                                            <MapPin size={14} className="mr-1" /> {mentor.university}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-slate-600 text-sm">
                                        <BookOpen size={14} className="mr-2" />
                                        {mentor.department}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < Math.floor(mentor.rating || 4) ? "text-accent-500 fill-current" : "text-slate-300"} />
                                        ))}
                                        <span className="text-xs text-slate-500 ml-1">({mentor.rating || 'New'})</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center border-t border-slate-50 p-6 bg-slate-50/50">
                                    <div>
                                        <span className="text-2xl font-bold text-slate-900">৳{mentor.hourlyRate || 399}</span>
                                        <span className="text-xs text-slate-500">/session</span>
                                    </div>
                                    <Link href={`/mentors/${mentor._id}`}>
                                        <Button className="rounded-full px-6">
                                            View Profile
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && filteredMentors.length === 0 && (
                    <div className="text-center text-slate-500 mt-8">
                        No mentors found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
