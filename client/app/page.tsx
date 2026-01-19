"use client";
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Video, Star, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Memoized helper components to prevent expensive re-renders
const StatItem = memo(({ number, label }: { number: string, label: string }) => (
  <div className="text-center group">
    <div className="text-3xl md:text-5xl font-black text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">{number}</div>
    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{label}</div>
  </div>
));

const UniversityLogo = memo(({ name }: { name: string }) => (
  <span className="text-xl md:text-2xl font-black text-slate-300 hover:text-slate-900 transition-all duration-300 cursor-default select-none uppercase tracking-tighter">
    {name}
  </span>
));

const FeatureCard = memo(({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) => (
  <motion.div
    whileHover={{ y: -8 }}
    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500"
  >
    <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-xl shadow-slate-200`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">
      {description}
    </p>
  </motion.div>
));

const TestimonialCard = memo(({ quote, author, tag }: { quote: string, author: string, tag: string }) => (
  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all duration-500 group">
    <div className="flex text-brand-400 mb-6 gap-1">
      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
    </div>
    <p className="text-xl font-bold leading-relaxed mb-6 text-slate-100 italic">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-black text-xl">
        {author[0]}
      </div>
      <div>
        <div className="font-black text-white uppercase tracking-wider text-sm">{author}</div>
        <div className="text-xs text-brand-400 font-bold uppercase tracking-widest">{tag}</div>
      </div>
    </div>
  </div>
));

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#fafaf9]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* High-Performance Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[800px] h-[800px] bg-brand-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-12 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-brand-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-500 mr-2 animate-ping"></span>
              Verified by 5,000+ Success Stories
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.95]"
            >
              Gateway to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">Excellence.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Learn directly from seniors at <span className="text-slate-900 font-black">DU, BUET, and DMC</span>. Get the precise roadmap needed to secure your future.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-6"
            >
              <Link href="/mentors" prefetch={true}>
                <Button size="lg" className="bg-slate-900 hover:bg-brand-600 text-white text-sm font-black uppercase tracking-widest px-10 py-8 h-auto w-full sm:w-auto rounded-3xl shadow-2xl transition-all hover:scale-105 active:scale-95">
                  Browse Mentors <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?role=mentor" prefetch={true}>
                <Button size="lg" variant="outline" className="text-sm font-black uppercase tracking-widest px-10 py-8 h-auto w-full sm:w-auto rounded-3xl border-2 bg-white hover:bg-slate-50 text-slate-900 transition-all">
                  Join as Mentor
                </Button>
              </Link>
            </motion.div>

            {/* Fast Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-slate-100 pt-12"
            >
              <StatItem number="50+" label="Institutions" />
              <StatItem number="500+" label="Mentors" />
              <StatItem number="10k+" label="Successes" />
              <StatItem number="4.9/5" label="Rating" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* University Scroll */}
      <section className="py-20 bg-white border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 grayscale hover:grayscale-0 transition-all duration-700">
            <UniversityLogo name="Dhaka University" />
            <UniversityLogo name="BUET" />
            <UniversityLogo name="DMC" />
            <UniversityLogo name="JU" />
            <UniversityLogo name="RU" />
            <UniversityLogo name="SUST" />
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-32 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-brand-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">The Bridge</h2>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Engineered for Success</h3>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">No generic advice. Only specific, battle-tested strategies from people who actually made it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Users className="h-7 w-7 text-white" />}
              color="bg-slate-900"
              title="Direct Mentorship"
              description="Private focus. One-on-one sessions calculated to maximize your potential and clear every bottleneck."
            />
            <FeatureCard
              icon={<Video className="h-7 w-7 text-white" />}
              color="bg-brand-600"
              title="Live Deep-Dives"
              description="Live interaction and mock evaluations designed to push you beyond your limits before the exam day."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-7 w-7 text-white" />}
              color="bg-emerald-600"
              title="Verified Experts"
              description="100% manual verification of every mentor. You are learning from the top 1% of the country."
            />
          </div>
        </div>
      </section>

      {/* Premium Testimonials */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-7xl font-black mb-10 leading-[0.9] tracking-tighter">Real students. <br /><span className="text-brand-500">Real Results.</span></h2>
              <p className="text-slate-400 text-xl font-medium mb-12 leading-relaxed">Join the network of achievers who didn't just dream, but executed with precision.</p>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-brand-500 hover:text-white text-xs font-black uppercase tracking-widest px-10 py-7 h-auto rounded-3xl transition-all">
                All Success Stories
              </Button>
            </div>
            <div className="space-y-8">
              <TestimonialCard
                quote="I went from scoring 40% in mocks to getting into Dhaka University. The roadmap I got here was exactly what I was missing."
                author="Sadia Afrin"
                tag="DU Student"
              />
              <TestimonialCard
                quote="The mock viva prep was intense and actually harder than the real thing. It made the actual interview feel like a breeze."
                author="Rahim Uddin"
                tag="BUET Achiever"
              />
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-brand-600 rounded-[3rem] p-16 md:p-24 text-center text-white shadow-3xl shadow-brand-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>

            <h2 className="text-4xl md:text-7xl font-black mb-8 leading-none tracking-tighter italic">Victory is a choice. <br />Make it now.</h2>
            <p className="text-brand-100 text-xl mb-12 max-w-2xl mx-auto font-medium">Access the collective wisdom of thousands of successes. Your seat in the next intake starts here.</p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-900 hover:text-white text-sm font-black uppercase tracking-widest px-12 py-8 h-auto rounded-3xl shadow-2xl transition-all hover:scale-105 active:scale-95 border-b-4 border-slate-100 hover:border-transparent">
                Start Free Trial
              </Button>
            </Link>
            <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-brand-200">No commitment required for initial setup.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
