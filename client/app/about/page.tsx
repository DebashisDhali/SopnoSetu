"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
                    <h1 className="text-4xl font-bold text-slate-900 mb-6 text-center">About SopnoSetu</h1>

                    <div className="prose prose-lg text-slate-600 mx-auto">
                        <p className="lead text-xl text-center mb-10">
                            SopnoSetu (Dream Bridge) is more than just a platform; it's a movement to democratize admission guidance in Bangladesh.
                        </p>

                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                        <p className="mb-8">
                            Every year, thousands of brilliant students in Bangladesh miss out on their dream universities simply because they lack proper guidance.
                            Coaching centers are great, but nothing beats the personal advice of a senior who has just cracked the same exam.
                            Our mission is to connect these aspirants with verified seniors for authentic, personalized, and affordable mentorship.
                        </p>

                        <h3 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h3>
                        <ul className="space-y-4 mb-8 list-none pl-0">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold mr-4">1</span>
                                <span><strong>Browse Mentors:</strong> Search for mentors from your dream university (DU, BUET, Medical, etc.).</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold mr-4">2</span>
                                <span><strong>Book a Session:</strong> Choose a time slot that works for you. Sessions are affordable and focused.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold mr-4">3</span>
                                <span><strong>Get Guided:</strong> Connect via video/audio call. Ask questions, show your routine, or take a mock viva.</span>
                            </li>
                        </ul>

                        <div className="text-center mt-12 bg-green-50 p-8 rounded-xl">
                            <h3 className="text-xl font-bold text-green-800 mb-4">Ready to find your guide?</h3>
                            <Link href="/mentors">
                                <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full">Explore Mentors</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
