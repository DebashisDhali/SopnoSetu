"use client";
import React, { useEffect, useState, memo, useCallback } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, MapPin, BookOpen, Star, Filter, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Skeleton Loader for smooth perceived performance
const MentorSkeleton = () => (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 animate-pulse">
        <div className="h-28 bg-slate-100" />
        <div className="px-8 pb-8">
            <div className="w-24 h-24 rounded-3xl bg-slate-200 -mt-12 border-8 border-white mb-6" />
            <div className="h-6 bg-slate-100 rounded-lg w-3/4 mb-4" />
            <div className="h-4 bg-slate-50 rounded-lg w-1/2 mb-8" />
            <div className="flex gap-2">
                <div className="h-10 bg-slate-100 rounded-2xl grow" />
                <div className="h-10 w-24 bg-slate-900/5 rounded-2xl" />
            </div>
        </div>
    </div>
);

const MentorCard = memo(({ mentor }: { mentor: any }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
        >
            <Card className="rounded-[2.5rem] border-0 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                {/* Visual Accent */}
                <div className="h-28 bg-slate-900 group-hover:bg-brand-600 transition-colors duration-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </div>

                <div className="px-8 relative">
                    <div className="w-24 h-24 rounded-3xl bg-white border-[6px] border-white shadow-2xl -mt-12 overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                        {mentor.user?.profilePic ? (
                            <img src={mentor.user.profilePic} alt={mentor.user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-3xl font-black text-slate-300">
                                {mentor.user?.name?.[0]}
                            </div>
                        )}
                    </div>
                </div>

                <CardContent className="pt-6 px-8 space-y-4">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{mentor.user?.name}</h3>
                            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                <Star size={12} className="text-amber-500 fill-amber-500 mr-1" />
                                <span className="text-[10px] font-black text-amber-700">{mentor.rating || '5.0'}</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap size={14} /> {mentor.university}
                        </p>
                    </div>

                    <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-tight">
                        <BookOpen size={14} className="mr-2" />
                        {mentor.department}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {(mentor.expertise?.slice(0, 3) || ['Admission', 'Roadmap', 'Strategy']).map((exp: string, i: number) => (
                            <span key={i} className="text-[9px] font-black uppercase tracking-tighter bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full border border-slate-100">
                                {exp}
                            </span>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="p-8 pt-4 flex items-center justify-between border-t border-slate-50 mt-4 bg-slate-50/30">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Rate</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">৳{mentor.hourlyRate || 499}</p>
                    </div>
                    <Link href={`/mentors/${mentor._id}`}>
                        <Button className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-brand-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
                            View Roadmap <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
});

export default function MentorsPage() {
    const [mentors, setMentors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchMentors = useCallback(async () => {
        try {
            const { data } = await api.get('/mentors');
            setMentors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Mentor fetch failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMentors();
    }, [fetchMentors]);

    const filteredMentors = mentors.filter(mentor => {
        const matchesSearch =
            mentor.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeFilter === 'All') return matchesSearch;
        return matchesSearch && mentor.university?.includes(activeFilter);
    });

    const categories = ['All', 'Dhaka University', 'BUET', 'DMC', 'JU', 'RU'];

    return (
        <div className="min-h-screen bg-[#fafaf9] py-32 px-4 relative">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-50/50 to-transparent -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm text-brand-700 text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <Sparkles size={14} className="mr-2 text-brand-500 animate-pulse" />
                        Verified Senior Network
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Your Journey <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600 italic">Their Roadmap.</span></h1>
                    <p className="text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-tight opacity-70">
                        Direct access to high-performers from Bangladesh's top educational tiers.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 mb-20 flex flex-col md:flex-row gap-4 items-center max-w-5xl mx-auto">
                    <div className="relative flex-grow w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find by name, uni or department..."
                            className="w-full h-14 pl-14 pr-6 rounded-[1.8rem] bg-slate-50 border-0 text-slate-900 font-bold focus:ring-2 ring-brand-500 outline-none transition-all placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`h-14 px-6 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeFilter === cat ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => <MentorSkeleton key={i} />)}
                    </div>
                ) : (
                    <AnimatePresence mode='popLayout'>
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredMentors.map((mentor) => (
                                <MentorCard key={mentor._id} mentor={mentor} />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}

                {!loading && filteredMentors.length === 0 && (
                    <div className="text-center py-32 rounded-[3.5rem] bg-slate-50 border border-dashed border-slate-200">
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No Mentors Found</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Try adjusting your search filters.</p>
                        <Button variant="ghost" className="mt-8 font-black uppercase tracking-widest text-[10px] text-brand-600" onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}>Clear All Filters</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
