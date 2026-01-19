"use client";
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Video, Award, Star, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#fafaf9]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[600px] h-[600px] bg-brand-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-12 w-[500px] h-[500px] bg-accent-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-brand-100 shadow-sm text-brand-700 text-sm font-medium mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-500 mr-2"></span>
              Trusted by 5,000+ Students across Bangladesh
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
            >
              Your Dream University <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">Is Just One Mentor Away</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Connect with verified seniors from <span className="font-semibold text-slate-900">Dhaka University, BUET, DMC</span>, and more. Get the roadmap, tips, and motivation you need to crack the admission test.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link href="/mentors" prefetch={true}>
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white text-lg px-8 py-6 h-auto w-full sm:w-auto rounded-full shadow-xl shadow-brand-500/20 transition-all hover:scale-[1.02]">
                  Find a Mentor <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?role=mentor" prefetch={true}>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto w-full sm:w-auto rounded-full border-2 bg-white hover:bg-slate-50 text-slate-700">
                  Become a Mentor
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-200 pt-8"
            >
              <StatItem number="50+" label="Top Universities" />
              <StatItem number="500+" label="Verified Mentors" />
              <StatItem number="10k+" label="Sessions Completed" />
              <StatItem number="4.9/5" label="Student Rating" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Universities Ticker or Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <p className="text-center text-slate-500 font-medium mb-8">Mentors from top institutions</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <UniversityLogo name="Dhaka University" />
            <UniversityLogo name="BUET" />
            <UniversityLogo name="Dhaka Medical" />
            <UniversityLogo name="Jahangirnagar" />
            <UniversityLogo name="Rajshahi Uni" />
            <UniversityLogo name="SUST" />
          </div>
        </div>
      </section>

      {/* App Features */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-brand-600 font-bold tracking-wide uppercase text-sm mb-2">Why SopnoSetu?</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Succeed</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">We don't just provide tutors; we provide role models who have walked the path you are on right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-blue-500"
              title="1-on-1 Mentorship"
              description="Book personal video sessions. No crowded classrooms, just focused guidance tailored to your weaknesses."
            />
            <FeatureCard
              icon={<Video className="h-6 w-6 text-white" />}
              color="bg-brand-500"
              title="Mock Vivas & Interviews"
              description="Prepare for the real deal with mock interviews conducted by seniors from your target department."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-white" />}
              color="bg-accent-500"
              title="Verified Authenticity"
              description="Every mentor's student ID is manually verified. You are safe and talking to real university students."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600 rounded-full blur-[100px] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Trusted by the future leaders of Bangladesh.</h2>
              <p className="text-slate-400 text-lg mb-8">Join a community where dreams are nurtured with right guidance and genuine care.</p>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8">Read Success Stories</Button>
            </div>
            <div className="space-y-6">
              <TestimonialCard
                quote="I was confused about my Medical preparation. One session with a senior from DMC cleared my doubts and gave me a routine that actually worked!"
                author="Sadia Afrin"
                tag="Now in DMC"
              />
              <TestimonialCard
                quote="The mock viva feature is a game changer. I felt so confident during my actual DU 'C' unit viva because I practiced exactly the same way here."
                author="Rahim Uddin"
                tag="Now in Dhaka University"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 opacity-10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">Stop Dreaming, Start Preparing.</h2>
            <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto">Access the collective wisdom of thousands of successful students. Your seat is waiting.</p>
            <Link href="/register" prefetch={true}>
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 text-lg px-10 py-6 rounded-full font-bold shadow-xl border-4 border-transparent hover:border-brand-200 transition-all">
                Join SopnoSetu for Free
              </Button>
            </Link>
            <p className="mt-6 text-sm text-brand-200 opacity-80">No credit card required for signup.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{number}</div>
      <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{label}</div>
    </div>
  )
}

const UniversityLogo = memo(({ name }: { name: string }) => {
  return (
    <span className="text-xl font-bold text-slate-400 font-serif">{name}</span>
  )
});

const FeatureCard = memo(({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center mb-6 shadow-lg shadow-${color.replace('bg-', '')}/30`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
});

function TestimonialCard({ quote, author, tag }: { quote: string, author: string, tag: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <div className="flex text-yellow-400 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
      </div>
      <p className="text-lg font-medium leading-relaxed mb-4 text-slate-100">"{quote}"</p>
      <div>
        <div className="font-bold text-white">{author}</div>
        <div className="text-sm text-brand-200">{tag}</div>
      </div>
    </div>
  )
}
