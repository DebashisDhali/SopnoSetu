"use client";

import React from 'react';
import { Upload, X, FileText, Check, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    value: string;
    onChange: (url: string) => void;
    onUpload: (file: File) => Promise<string>;
    label?: string;
    accept?: string;
    uploading?: boolean;
    error?: string;
    className?: string;
}

export const FileUpload = ({
    value,
    onChange,
    onUpload,
    label,
    accept = "image/*,application/pdf",
    uploading = false,
    error,
    className
}: FileUploadProps) => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await onUpload(file);
            onChange(url);
        } catch (err) {
            console.error(err);
        }
    };

    const isPdf = value?.toLowerCase().endsWith('.pdf') || value?.includes('pdf');
    const isImage = value && !isPdf;

    return (
        <div className={cn("space-y-2", className)}>
            {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}

            <div className="flex flex-wrap items-center gap-4">
                {!value ? (
                    <div className="w-full">
                        <label className={cn(
                            "relative flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed rounded-2xl transition-all cursor-pointer group",
                            uploading
                                ? "bg-slate-50 border-slate-200 cursor-not-allowed"
                                : "bg-white border-slate-200 hover:bg-brand-50 hover:border-brand-300"
                        )}>
                            <div className="flex flex-col items-center justify-center py-4 px-6 text-center">
                                {uploading ? (
                                    <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
                                ) : (
                                    <div className="p-3 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors mb-2">
                                        <Upload className="w-5 h-5 text-brand-600" />
                                    </div>
                                )}
                                <p className="text-sm font-bold text-slate-700">
                                    {uploading ? 'Processing File...' : 'Click to Upload'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                                    {accept.includes('pdf') ? 'Images or PDF' : 'Images only'} (Max 5MB)
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept={accept}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 w-full">
                        <div className="relative group shrink-0">
                            <div className="w-24 h-24 rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                {isImage ? (
                                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-slate-500">
                                        <FileText size={32} className="text-brand-600" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Document PDF</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="absolute -top-2 -right-2 bg-white text-rose-500 rounded-full p-1.5 shadow-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 z-10"
                                title="Remove File"
                            >
                                <X size={14} />
                            </button>

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                                <label className="cursor-pointer text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <RefreshCw size={12} />
                                    Change
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept={accept}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Check size={12} className="text-emerald-600" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">Upload Successful</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                                {value.split('/').pop() || 'file_uploaded.ext'}
                            </p>
                            <label className="inline-flex items-center gap-1.5 text-brand-600 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-brand-700 transition-colors mt-2">
                                <Upload size={12} />
                                Re-upload
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={accept}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
};
