import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusAlertProps {
    type?: 'info' | 'success' | 'warning' | 'error' | 'help';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const StatusAlert = ({
    type = 'info',
    title,
    message,
    actionLabel,
    onAction,
    className
}: StatusAlertProps) => {
    const variants = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-900',
            msgColor: 'text-blue-700',
            icon: Info
        },
        success: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconColor: 'text-emerald-600',
            titleColor: 'text-emerald-900',
            msgColor: 'text-emerald-700',
            icon: CheckCircle2
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            iconColor: 'text-amber-600',
            titleColor: 'text-amber-900',
            msgColor: 'text-amber-700',
            icon: AlertCircle
        },
        error: {
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            iconColor: 'text-rose-600',
            titleColor: 'text-rose-900',
            msgColor: 'text-rose-700',
            icon: XCircle
        },
        help: {
            bg: 'bg-slate-50',
            border: 'border-slate-100',
            iconColor: 'text-brand-600',
            titleColor: 'text-slate-900',
            msgColor: 'text-slate-600',
            icon: Info
        }
    };

    const variant = variants[type];
    const Icon = variant.icon;

    return (
        <div className={cn(
            "rounded-2xl border p-4 shadow-sm animate-in fade-in slide-in-from-top-2",
            variant.bg,
            variant.border,
            className
        )}>
            <div className="flex gap-4">
                <div className={cn("shrink-0 p-2 rounded-xl bg-white/50 backdrop-blur-sm", variant.iconColor)}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 space-y-1">
                    <h4 className={cn("text-sm font-black uppercase tracking-widest", variant.titleColor)}>
                        {title}
                    </h4>
                    <p className={cn("text-xs font-medium leading-relaxed", variant.msgColor)}>
                        {message}
                    </p>

                    {actionLabel && (
                        <button
                            onClick={onAction}
                            className={cn(
                                "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mt-2 hover:translate-x-1 transition-transform",
                                variant.iconColor
                            )}
                        >
                            {actionLabel}
                            <ArrowRight size={10} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
