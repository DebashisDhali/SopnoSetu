import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#1c1917] text-slate-400 pt-20 pb-10 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                            <span className="text-2xl font-bold text-white tracking-tight">SopnoSetu</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500">
                            We are building the bridge between aspiration and achievement for students across Bangladesh.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialIcon icon={<Facebook size={18} />} />
                            <SocialIcon icon={<Twitter size={18} />} />
                            <SocialIcon icon={<Instagram size={18} />} />
                            <SocialIcon icon={<Linkedin size={18} />} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Platform</h3>
                        <ul className="space-y-3 text-sm">
                            <li><FooterLink href="/mentors">Find Mentors</FooterLink></li>
                            <li><FooterLink href="/universities">Browse Universities</FooterLink></li>
                            <li><FooterLink href="/pricing">Pricing & Plans</FooterLink></li>
                            <li><FooterLink href="/login">Login</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li><FooterLink href="/about">About Us</FooterLink></li>
                            <li><FooterLink href="/careers">Careers</FooterLink></li>
                            <li><FooterLink href="/blog">Success Blog</FooterLink></li>
                            <li><FooterLink href="/contact">Contact</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                            <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                            <li><FooterLink href="/refund">Refund Policy</FooterLink></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
                    <p>&copy; {new Date().getFullYear()} SopnoSetu. All rights reserved.</p>
                    <p className="mt-2 md:mt-0 flex items-center">
                        Made with <Heart size={12} className="text-red-500 mx-1 fill-current" /> in Bangladesh
                    </p>
                </div>
            </div>
        </footer>
    );
};

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="hover:text-brand-500 transition-colors">
            {children}
        </Link>
    )
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <a href="#" className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all">
            {icon}
        </a>
    )
}

export default Footer;
