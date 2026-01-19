"use client";
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Video, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#fafaf9]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        {/* Decorative gradients - Softened */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-12 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-500 mr-2 animate-pulse"></span>
            Join Bangladesh's Premier Mentorship Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]"
          >
            Bridge the Gap to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-500 to-brand-700">Your Dream Campus</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Don't just study hard, study smart. Connect 1-on-1 with seniors from <span className="font-semibold text-slate-900">DU, BUET, and DMC</span> who have already cracked the code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <Link href="/mentors" prefetch={true}>
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white text-lg px-8 py-7 h-auto w-full sm:w-auto rounded-full shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] border border-transparent">
                Find a Mentor <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register?role=mentor" prefetch={true}>
              <Button size="lg" variant="secondary" className="bg-white hover:bg-slate-50 text-slate-700 text-lg px-8 py-7 h-auto w-full sm:w-auto rounded-full border border-slate-200 shadow-sm transition-all hover:border-brand-300">
                Become a Mentor
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-10"
          >
            <StatItem number="50+" label="Top Universities" />
            <StatItem number="500+" label="Verified Mentors" />
            <StatItem number="10k+" label="Sessions" />
            <StatItem number="4.9" label="Rating" />
          </motion.div>
        </div>
      </section>

      {/* Universities Marquee - already light, keeping as is but ensuring border visibility */}
      <section className="py-10 bg-slate-50 border-b border-slate-200 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
        {/* ... (marquee content handled in separate block if needed, but I'll assume only the wrapper changed) */}

        <div className="flex overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            className="flex gap-12 sm:gap-24 opacity-60 whitespace-nowrap pr-12 sm:pr-24"
          >
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <UniversityLogo name="Dhaka University" />
                <UniversityLogo name="BUET" />
                <UniversityLogo name="Dhaka Medical College" />
                <UniversityLogo name="Jahangirnagar University" />
                <UniversityLogo name="Rajshahi University" />
                <UniversityLogo name="SUST" />
                <UniversityLogo name="Chittagong University" />
                <UniversityLogo name="MIST" />
                <UniversityLogo name="IUT" />
                <UniversityLogo name="Khulna University" />
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* App Features - already light */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-600 font-bold tracking-widest uppercase text-xs mb-3"
            >
              Why Choose SopnoSetu?
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
            >
              Everything You Need to Succeed
            </motion.h3>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">We don't just provide tutors; we provide role models who have walked the path you are on right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-blue-500"
              title="1-on-1 Mentorship"
              description="Book personal video sessions. No crowded classrooms, just focused guidance tailored to your specific weaknesses and questions."
            />
            <FeatureCard
              icon={<Video className="h-6 w-6 text-white" />}
              color="bg-brand-500"
              title="Mock Vivas & Interviews"
              description="Prepare for the real deal with mock interviews conducted by seniors from your target department. Get feedback that matters."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-white" />}
              color="bg-teal-500"
              title="Verified Authenticity"
              description="Every mentor's student ID is manually verified. You are safe and talking to real university students who know their stuff."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-slate-900">
                Trusted by the <span className="text-brand-600">future leaders</span> of Bangladesh.
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Join a community where dreams are nurtured with correct guidance and genuine care. success stories are written here daily.
              </p>
              <div className="flex gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-200"></div>
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <span className="text-sm text-slate-500 font-medium">from 2000+ reviews</span>
                </div>
              </div>
            </div>
            <div className="space-y-6 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-50 to-teal-50 rounded-3xl blur-2xl opacity-50 -z-10"></div>
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

      {/* CTA Box - Light themed */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-brand-50 rounded-[2.5rem] p-12 md:p-24 text-center border border-brand-100 shadow-xl relative overflow-hidden">

            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 tracking-tight text-slate-900">Stop Dreaming,<br />Start Preparing.</h2>
            <p className="text-slate-600 text-xl mb-12 max-w-2xl mx-auto relative z-10">Access the collective wisdom of thousands of successful students. Your seat is waiting.</p>

            <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/register" prefetch={true}>
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white text-lg px-12 py-8 h-auto rounded-full font-bold shadow-lg shadow-brand-200 transition-all hover:scale-105">
                  Join SopnoSetu for Free
                </Button>
              </Link>
              <Link href="/mentors" prefetch={true}>
                <Button variant="ghost" className="text-brand-700 hover:bg-brand-100 px-8 py-4 h-auto rounded-full text-lg">
                  Explore Mentors
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-sm text-slate-400">No credit card required for signup.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">{number}</div>
      <div className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-widest opacity-80">{label}</div>
    </div>
  )
}

const UniversityLogo = memo(({ name }: { name: string }) => {
  return (
    <span className="text-2xl font-bold text-slate-300 hover:text-slate-500 transition-colors cursor-default font-serif mx-8">{name}</span>
  )
});

const FeatureCard = memo(({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative group"
    >
      <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-lg shadow-${color.replace('bg-', '')}/30 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
});

function TestimonialCard({ quote, author, tag }: { quote: string, author: string, tag: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
      <div className="flex text-yellow-400 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
      </div>
      <p className="text-lg font-medium leading-relaxed mb-6 text-slate-700">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
          {author[0]}
        </div>
        <div>
          <div className="font-bold text-slate-900">{author}</div>
          <div className="text-sm text-brand-600 font-medium">{tag}</div>
        </div>
      </div>
    </div>
  )
}
