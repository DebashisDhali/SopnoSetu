"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const socket = io('http://localhost:5000');

export default function ChatSection() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const withUserId = searchParams.get('with');

    const [partners, setPartners] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<any>(null);
    const [me, setMe] = useState<any>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }
        setMe(JSON.parse(user));
        fetchPartners();
    }, []);

    useEffect(() => {
        if (withUserId && me) {
            fetchMessages(withUserId as string);
            markRead(withUserId as string);
            const roomId = [me?._id, withUserId].sort().join('_');
            socket.emit('join_chat', roomId);
        }
    }, [withUserId, me]);

    const markRead = async (userId: string) => {
        try {
            await api.put(`/chat/read/${userId}`);
            fetchPartners();
            window.dispatchEvent(new Event('refresh-unread'));
        } catch (e) { }
    }

    useEffect(() => {
        socket.on('receive_message', (data) => {
            if (data.senderId === withUserId) {
                setMessages((prev) => [...prev, data]);
                if (withUserId) markRead(withUserId as string);
            }
            fetchPartners();
        });

        return () => {
            socket.off('receive_message');
        };
    }, [withUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchPartners = async () => {
        try {
            const { data } = await api.get('/chat/partners');
            setPartners(data);

            if (withUserId) {
                const active = data.find((p: any) => p._id === withUserId);
                if (active) setSelectedPartner(active);
                else {
                    try {
                        const { data: newUser } = await api.get(`/auth/users/${withUserId}`);
                        setSelectedPartner(newUser);
                    } catch (e) {
                        console.error("Partner not found", e);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const { data } = await api.get(`/chat/${userId}`);
            setMessages(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !withUserId) return;

        try {
            const { data } = await api.post('/chat', {
                receiverId: withUserId,
                content: newMessage
            });

            setMessages((prev) => [...prev, data]);

            const roomId = [me?._id, withUserId].sort().join('_');
            socket.emit('send_message', {
                ...data,
                roomId,
                senderId: me?._id
            });

            setNewMessage('');
            fetchPartners();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-brand-600" size={40} /></div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[75vh] min-h-0">
            {/* Partners List (The Inbox) */}
            <Card className="w-full md:w-80 flex-shrink-0 flex flex-col border-brand-100 shadow-sm overflow-hidden h-[30vh] md:h-full">
                <CardHeader className="bg-slate-50 border-b py-4 flex-shrink-0">
                    <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-800 uppercase tracking-tight">
                        <MessageCircle size={22} className="text-brand-600" />
                        <span>Inbox</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto grow">
                    {partners.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm">No messages yet</div>
                    ) : (
                        partners.map((partner) => (
                            <div
                                key={partner._id}
                                onClick={() => {
                                    setSelectedPartner(partner);
                                    router.push(`/dashboard?view=messages&with=${partner._id}`, { scroll: false });
                                }}
                                className={`p-4 border-b cursor-pointer transition-all hover:bg-slate-50 group flex items-start gap-3 ${withUserId === partner._id ? 'bg-brand-50 border-l-4 border-l-brand-600' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase shadow-sm border border-brand-100 flex-shrink-0 relative">
                                    {partner.name.charAt(0)}
                                    {partner.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce">
                                            {partner.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <div className="font-bold text-sm text-slate-900 truncate group-hover:text-brand-700">{partner.name}</div>
                                        {partner.lastTime && (
                                            <span className="text-[10px] text-slate-400 font-bold ml-2">{formatTime(partner.lastTime)}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate font-medium">
                                        {partner.lastMessage || `Start chatting...`}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Message Box */}
            <Card className="flex-1 flex flex-col shadow-xl border-brand-100/50 overflow-hidden h-[60vh] md:h-full bg-white relative">
                {selectedPartner ? (
                    <>
                        <CardHeader className="bg-white border-b py-4 px-6 z-10 shadow-sm flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold shadow-brand-500/20 shadow-lg font-bold">
                                        {selectedPartner.name.charAt(0)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-extrabold text-slate-900">{selectedPartner.name}</CardTitle>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium capitalize">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> {selectedPartner.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="grow overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30 flex flex-col">
                            <div className="mt-auto"></div>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col ${msg.sender._id === me?._id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    <div
                                        className={`max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm relative ${msg.sender._id === me?._id
                                            ? 'bg-brand-600 text-white rounded-br-none font-medium'
                                            : 'bg-white text-slate-800 border border-slate-200/60 rounded-bl-none font-medium'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    <span className="text-[10px] mt-1.5 text-slate-400 font-bold uppercase tracking-tighter mx-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} className="h-1 flex-shrink-0" />
                        </CardContent>

                        <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="grow bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 font-medium text-base h-12 px-4 focus-visible:ring-brand-500 rounded-xl shadow-sm dark:bg-white dark:text-slate-900"
                                />
                                <Button
                                    type="submit"
                                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 h-12 shadow-lg shadow-brand-500/10 active:scale-95 transition-transform flex-shrink-0"
                                    disabled={!newMessage.trim()}
                                >
                                    <Send size={18} />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center grow text-center p-12 bg-slate-50/20">
                        <MessageCircle size={56} className="text-brand-200 mb-6 animate-pulse" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Conversation</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed font-medium">
                            Choose one of your active chats from the left sidebar to start messaging.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
