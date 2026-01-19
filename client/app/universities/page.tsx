"use client";
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, BookOpen, Search } from 'lucide-react';

const universities = [
    {
        name: "Dhaka University",
        location: "Dhaka",
        image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2070&auto=format&fit=crop",
        studentCount: "35,000+",
        description: "The Oxford of the East. Best for Arts, Science, and Social Sciences."
    },
    {
        name: "BUET",
        location: "Dhaka",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop",
        studentCount: "5,000+",
        description: "The premier engineering institution in Bangladesh."
    },
    {
        name: "Dhaka Medical College",
        location: "Dhaka",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop",
        studentCount: "2,000+",
        description: "Top choice for medical aspirants."
    },
    {
        name: "Jahangirnagar University",
        location: "Savar",
        image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=2069&auto=format&fit=crop",
        studentCount: "13,000+",
        description: "Famous for its beautiful campus and diverse units."
    },
    {
        name: "Rajshahi University",
        location: "Rajshahi",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop",
        studentCount: "25,000+",
        description: "Center of North Bengal's excellence."
    },
    {
        name: "KUET",
        location: "Khulna",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
        studentCount: "4,000+",
        description: "Leading engineering university in the south."
    }
];

export default function UniversitiesPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUniversities = universities.filter(uni =>
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Universities We Cover</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Find mentors from these top institutions to guide your path.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-16 relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search university by name or location..."
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredUniversities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredUniversities.map((uni, index) => (
                            <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 group">
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
                                    {/* Placeholder images used above, normally would use Next Image */}
                                    <img
                                        src={uni.image}
                                        alt={uni.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{uni.name}</h3>
                                    <div className="flex items-center text-slate-500 text-sm mb-4">
                                        <MapPin size={16} className="mr-1 text-green-600" /> {uni.location}
                                    </div>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                        {uni.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                                        <span className="flex items-center"><Users size={14} className="mr-1" /> {uni.studentCount} Students</span>
                                        <span className="flex items-center"><BookOpen size={14} className="mr-1" /> Mentors Available</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 mt-8">
                        No universities found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
