import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Send, MoreVertical, MessageSquare, Ban, UserMinus, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string | null;
    is_read: boolean | null;
    deleted_for: string[] | null;
    is_deleted_for_everyone: boolean | null;
}

interface ChatUser {
    id: string;
    full_name: string;
    avatar_url: string | null;
    last_message?: string;
    last_message_time?: string;
    type?: 'student' | 'professional';
}

const MessagesPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const initialUserId = searchParams.get('user');

    const [conversations, setConversations] = useState<ChatUser[]>([]);
    const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const activeChatRef = useRef<ChatUser | null>(null);
    const currentProfileIdRef = useRef<string | null>(null);
    const messageIdsSeenRef = useRef<Set<string>>(new Set());
    const noEntryAnimationIdsRef = useRef<Set<string>>(new Set());

    // Initial load: get profile ID then conversations
    useEffect(() => {
        const init = async () => {
            if (!user) return;
            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;
                if (profile) {
                    setCurrentProfileId(profile.id);
                    await fetchConversations(profile.id);
                }
            } catch (err) {
                console.error("Error loading profile:", err);
                setLoading(false);
            }
        };

        if (user) {
            init();
        }
    }, [user]);

    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    useEffect(() => {
        currentProfileIdRef.current = currentProfileId;
    }, [currentProfileId]);

    const upsertRealtimeMessage = useCallback((incoming: Message) => {
        const myProfileId = currentProfileIdRef.current;
        const currentChat = activeChatRef.current;

        if (!myProfileId || !currentChat) return;

        const belongsToActiveChat =
            (incoming.sender_id === myProfileId && incoming.receiver_id === currentChat.id) ||
            (incoming.sender_id === currentChat.id && incoming.receiver_id === myProfileId);

        if (!belongsToActiveChat) return;

        let shouldScroll = false;

        setMessages(prev => {
            // If this message was deleted for me, remove if present.
            if (incoming.deleted_for?.includes(myProfileId)) {
                return prev.filter(m => m.id !== incoming.id);
            }

            const idx = prev.findIndex(m => m.id === incoming.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...incoming };
                return next;
            }

            messageIdsSeenRef.current.add(incoming.id);
            noEntryAnimationIdsRef.current.add(incoming.id);

            const container = messagesContainerRef.current;
            const isNearBottom = !!container
                ? container.scrollHeight - container.scrollTop - container.clientHeight < 120
                : true;

            shouldScroll = isNearBottom || incoming.sender_id === myProfileId;

            return [...prev, incoming].sort((a, b) => {
                const at = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
                return at - bt;
            });
        });

        if (shouldScroll) {
            setTimeout(scrollToBottom, 40);
        }
    }, []);

    // Realtime: listen to message inserts/updates relevant to this user.
    useEffect(() => {
        if (!currentProfileId) return;

        const channel = supabase
            .channel(`messages-realtime-${currentProfileId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                async (payload) => {
                    const message = payload.new as Message;
                    const myProfileId = currentProfileIdRef.current;
                    if (!myProfileId) return;

                    // Only handle messages involving me.
                    if (message.sender_id !== myProfileId && message.receiver_id !== myProfileId) return;

                    upsertRealtimeMessage(message);

                    // Mark as read immediately if currently viewing this chat.
                    const currentChat = activeChatRef.current;
                    const viewingThisChat = !!currentChat && message.sender_id === currentChat.id && message.receiver_id === myProfileId;
                    if (viewingThisChat && !message.is_read) {
                        await supabase.from('messages').update({ is_read: true }).eq('id', message.id);
                        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_read: true } : m));
                        setTimeout(scrollToBottom, 50);
                    }

                    fetchConversations(myProfileId);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages' },
                (payload) => {
                    const message = payload.new as Message;
                    const myProfileId = currentProfileIdRef.current;
                    if (!myProfileId) return;

                    // Only handle messages involving me.
                    if (message.sender_id !== myProfileId && message.receiver_id !== myProfileId) return;

                    upsertRealtimeMessage(message);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentProfileId, upsertRealtimeMessage]);

    useEffect(() => {
        if (initialUserId && conversations.length > 0 && !activeChat) {
            const target = conversations.find(c => c.id === initialUserId);
            if (target) {
                setActiveChat(target);
            } else {
                fetchUserProfile(initialUserId);
            }
        } else if (initialUserId && conversations.length === 0 && !activeChat) {
            // Case where conversations haven't loaded yet or empty, but we have an initialUser
            fetchUserProfile(initialUserId);
        }
    }, [initialUserId, conversations, activeChat]);

    useEffect(() => {
        if (activeChat && currentProfileId) {
            fetchMessages(activeChat.id, currentProfileId, false);
        }
    }, [activeChat, currentProfileId]);

    // Fallback live sync: short polling while chat is open.
    // This keeps messages near-realtime even if realtime publication is not active.
    useEffect(() => {
        if (!activeChat || !currentProfileId) return;

        const poll = async () => {
            if (document.hidden) return;
            await fetchMessages(activeChat.id, currentProfileId, true);
            await fetchConversations(currentProfileId);
        };

        const intervalId = window.setInterval(poll, 2500);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [activeChat, currentProfileId]);

    // block statuses removed


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    const fetchUserProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, profession')
            .eq('id', userId)
            .single();

        if (data) {
            const newUser: ChatUser = {
                id: data.id,
                full_name: data.full_name,
                avatar_url: data.avatar_url,
                type: (data.profession as 'student' | 'professional') || 'student'
            };
            setConversations(prev => {
                // Avoid duplicates
                if (prev.find(p => p.id === newUser.id)) return prev;
                return [newUser, ...prev];
            });
            setActiveChat(newUser);
        }
    };

    const fetchConversations = async (myProfileId: string) => {
        try {
            // Get accepted connections
            const { data: connections, error } = await supabase
                .from('connections')
                .select(`
                    requester_id, receiver_id,
                    requester:profiles!requester_id(id, full_name, avatar_url, profession),
                    receiver:profiles!receiver_id(id, full_name, avatar_url, profession)
                `)
                .or(`requester_id.eq.${myProfileId},receiver_id.eq.${myProfileId}`)
                .eq('status', 'accepted');

            if (error) throw error;

            // Transform into unique chat users
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chats: ChatUser[] = (connections as any[]).map(conn => {
                const isRequester = conn.requester_id === myProfileId;
                const otherUser = isRequester ? conn.receiver : conn.requester;
                const profile = Array.isArray(otherUser) ? otherUser[0] : otherUser;

                return {
                    id: profile.id,
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url,
                    type: profile.profession || 'student'
                };
            });

            chats.sort((a, b) => a.full_name.localeCompare(b.full_name));
            setConversations(chats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const areMessagesEqual = (a: Message[], b: Message[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            const x = a[i];
            const y = b[i];
            if (
                x.id !== y.id ||
                x.content !== y.content ||
                x.is_read !== y.is_read ||
                x.is_deleted_for_everyone !== y.is_deleted_for_everyone ||
                (x.deleted_for?.join(',') || '') !== (y.deleted_for?.join(',') || '')
            ) {
                return false;
            }
        }
        return true;
    };

    const fetchMessages = async (otherUserId: string, myProfileId: string, preserveScroll = false) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${myProfileId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${myProfileId})`)
            .order('created_at', { ascending: true });

        if (!error && data) {
            // Filter out messages deleted for me locally to avoid flashes
            const visibleMessages = data.filter(m => !m.deleted_for?.includes(myProfileId));

            // Mark any newly discovered IDs (via polling/fetch) to skip entry animation.
            for (const msg of visibleMessages) {
                if (!messageIdsSeenRef.current.has(msg.id)) {
                    noEntryAnimationIdsRef.current.add(msg.id);
                    messageIdsSeenRef.current.add(msg.id);
                }
            }

            const container = messagesContainerRef.current;
            const isNearBottom = !!container
                ? container.scrollHeight - container.scrollTop - container.clientHeight < 120
                : true;

            setMessages(prev => {
                if (areMessagesEqual(prev, visibleMessages)) {
                    return prev;
                }

                const hasNewMessages = visibleMessages.length > prev.length;
                if (!preserveScroll || (hasNewMessages && isNearBottom)) {
                    setTimeout(scrollToBottom, 40);
                }

                return visibleMessages;
            });

            // Mark unread messages sent to me as read
            const unreadIds = visibleMessages
                .filter(m => m.receiver_id === myProfileId && !m.is_read)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .in('id', unreadIds);

                // Optimistically update local state for the UI
                setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));
            }
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProfileId || !activeChat || !newMessage.trim()) return;

        const msgContent = newMessage.trim();
        setNewMessage(''); // optimistic clear

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    sender_id: currentProfileId,
                    receiver_id: activeChat.id,
                    content: msgContent
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                messageIdsSeenRef.current.add(data.id);
                noEntryAnimationIdsRef.current.add(data.id);
                setMessages(prev => [...prev, data]);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to send', error);
            toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
        }
    };


    const handleRemoveConnection = async () => {
        if (!currentProfileId || !activeChat) return;
        try {
            // Fetch all connections involving either profile to delete manually
            const { data: connections, error: findError } = await supabase
                .from('connections')
                .select('id, requester_id, receiver_id')
                .or(`requester_id.eq.${currentProfileId},receiver_id.eq.${currentProfileId}`);

            if (findError) {
                console.error("Error finding connection to remove", findError);
                throw findError;
            }

            const connection = connections?.find(c =>
                (c.requester_id === currentProfileId && c.receiver_id === activeChat.id) ||
                (c.requester_id === activeChat.id && c.receiver_id === currentProfileId)
            );

            if (!connection) {
                toast({
                    title: "Error",
                    description: "Connection not found.",
                    variant: "destructive"
                });
                return;
            }

            // Then delete it
            const { error: deleteError } = await supabase
                .from('connections')
                .delete()
                .eq('id', connection.id);

            if (deleteError) throw deleteError;

            toast({
                title: "Connection removed",
                description: "User removed from your connections.",
            });
            setActiveChat(null);
            fetchConversations(currentProfileId);
        } catch (error) {
            console.error('Error removing connection:', error);
            toast({
                title: "Error",
                description: "Failed to remove connection.",
                variant: "destructive"
            });
        }
    };

    const handleClearChat = async () => {
        if (!currentProfileId || !activeChat) return;
        try {
            const messagesToClear = messages.filter(m => !m.deleted_for?.includes(currentProfileId));
            for (const msg of messagesToClear) {
                const currentDeletedFor = msg.deleted_for || [];
                await supabase
                    .from('messages')
                    .update({ deleted_for: [...currentDeletedFor, currentProfileId] })
                    .eq('id', msg.id);
            }
            setMessages([]);
            toast({ title: 'Chat Cleared', description: 'Chat history cleared locally.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to clear chat.', variant: 'destructive' });
        }
    };

    const handleDeleteForMe = async (msgId: string) => {
        if (!currentProfileId) return;
        try {
            const msg = messages.find(m => m.id === msgId);
            if (!msg) return;
            const currentDeletedFor = msg.deleted_for || [];
            await supabase
                .from('messages')
                .update({ deleted_for: [...currentDeletedFor, currentProfileId] })
                .eq('id', msgId);
            setMessages(prev => prev.filter(m => m.id !== msgId));
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete message.', variant: 'destructive' });
        }
    };

    const handleDeleteForEveryone = async (msgId: string) => {
        try {
            await supabase
                .from('messages')
                .update({ is_deleted_for_everyone: true })
                .eq('id', msgId);
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted_for_everyone: true } : m));
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete message.', variant: 'destructive' });
        }
    };

    return (
        <div className="h-full w-full flex bg-white font-sans text-black selection:bg-black selection:text-white relative">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-80 border-r-4 border-black bg-white flex flex-col z-10",
                activeChat ? "hidden md:flex" : "flex"
            )}>
                <div className="p-6 border-b-4 border-black bg-white sticky top-0 z-20 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                    <h2 className="font-black text-3xl uppercase tracking-tighter flex items-center gap-3 text-black">
                        <div className="p-2 border-2 border-black bg-black text-white rounded-xl">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        Messages
                    </h2>
                </div>

                <div className="flex-1 overflow-y-scroll custom-scrollbar">
                    {loading ? (
                        <div className="p-8 flex flex-col items-center justify-center text-black font-bold uppercase gap-3">
                            <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                            <span className="text-sm tracking-widest">Loading comms...</span>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-black/50 font-bold uppercase flex flex-col items-center gap-2">
                            <MessageSquare className="w-12 h-12 mb-2" />
                            <span className="text-xs tracking-widest">No conversations yet.</span>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {conversations.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => setActiveChat(chat)}
                                    className={cn(
                                        "w-full p-3 flex items-center gap-3 text-left rounded-xl border-2 transition-all duration-200 group relative",
                                        activeChat?.id === chat.id
                                            ? "bg-black text-white border-black shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] ml-2 -mt-1" // pop out effect
                                            : "bg-white text-black border-transparent hover:border-black hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:-translate-x-0.5"
                                    )}
                                >
                                    <Avatar className={cn(
                                        "rounded-xl border-2 h-10 w-10",
                                        activeChat?.id === chat.id ? "border-white bg-black" : "border-black bg-white group-hover:scale-105"
                                    )}>
                                        <AvatarImage src={chat.avatar_url || ''} className="object-cover" />
                                        <AvatarFallback className={cn("font-black text-sm", activeChat?.id === chat.id ? "text-white bg-black" : "text-black bg-white")}>{chat.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className={cn(
                                            "font-black uppercase truncate text-sm leading-tight",
                                        )}>{chat.full_name}</h3>
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                                            activeChat?.id === chat.id ? "text-white/70" : "text-black/50"
                                        )}>{chat.type}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-white h-full relative z-0",
                !activeChat ? "hidden md:flex" : "flex w-full"
            )}>
                {/* Background subtle grid for chat area */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                    style={{
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-5 border-b-4 border-black flex items-center justify-between bg-white z-20 sticky top-0 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden rounded-xl border-2 border-black hover:bg-black hover:text-white"
                                    onClick={() => setActiveChat(null)}
                                >
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </Button>
                                <Avatar className="h-12 w-12 border-4 border-black rounded-xl bg-white">
                                    <AvatarImage src={activeChat.avatar_url || ''} className="object-cover" />
                                    <AvatarFallback className="font-black bg-white text-black">{activeChat.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black text-xl text-black uppercase tracking-tight">{activeChat.full_name}</h3>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl border-4 border-transparent hover:border-black hover:bg-white text-black transition-all">
                                            <MoreVertical className="w-6 h-6" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white min-w-[200px] p-2">
                                        <DropdownMenuItem onClick={handleRemoveConnection} className="py-3 px-4 cursor-pointer font-bold uppercase text-red-600 focus:text-white focus:bg-red-600 hover:bg-red-600 hover:text-white rounded-md">
                                            <UserMinus className="w-5 h-5 mr-3" />
                                            Remove Conn.
                                        </DropdownMenuItem>
                                        <div className="h-1 bg-black w-full my-2"></div>
                                        <DropdownMenuItem onClick={handleClearChat} className="py-3 px-4 cursor-pointer font-bold uppercase text-red-600 focus:text-white focus:bg-red-600 hover:bg-red-600 hover:text-white rounded-md">
                                            <Trash2 className="w-5 h-5 mr-3" />
                                            Clear Chat
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-scroll p-4 md:p-8 space-y-6 custom-scrollbar relative z-10">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === currentProfileId;
                                const showAvatar = idx === messages.length - 1 || messages[idx + 1]?.sender_id !== msg.sender_id;
                                const disableEntryAnimation = noEntryAnimationIdsRef.current.has(msg.id);

                                return (
                                    <motion.div
                                        initial={disableEntryAnimation ? false : { opacity: 0, y: 20, scale: 0.95 }}
                                        animate={disableEntryAnimation ? undefined : { opacity: 1, y: 0, scale: 1 }}
                                        transition={disableEntryAnimation ? undefined : { type: "spring", stiffness: 300, damping: 20 }}
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full gap-4 group/msg relative",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {!isMe && showAvatar && (
                                            <Avatar className="h-10 w-10 shrink-0 self-end mb-1 border-2 border-black rounded-xl bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                                <AvatarImage src={activeChat.avatar_url || ''} className="object-cover" />
                                                <AvatarFallback className="font-black text-xs text-black">{activeChat.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        {!isMe && !showAvatar && <div className="w-10 shrink-0" />}

                                        <div className="flex items-center gap-2 max-w-[75%]">
                                            {isMe && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-5 w-5 text-black/50 hover:text-black" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white min-w-[150px] p-2 z-50">
                                                        <DropdownMenuItem onClick={() => handleDeleteForMe(msg.id)} className="cursor-pointer font-bold uppercase hover:bg-black hover:text-white rounded-md">
                                                            Delete for Me
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteForEveryone(msg.id)} className="cursor-pointer font-bold uppercase text-red-600 focus:text-white focus:bg-red-600 hover:bg-red-600 hover:text-white rounded-md">
                                                            Delete for Everyone
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}

                                            <div
                                                className={cn(
                                                    "rounded-2xl px-4 py-2.5 text-[15px] relative group-hover/msg:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.35)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] transition-transform group-hover/msg:-translate-y-1 group-hover/msg:-translate-x-1",
                                                    isMe
                                                        ? "bg-black text-white border-2 border-black"
                                                        : "bg-white text-black border-2 border-black",
                                                    msg.is_deleted_for_everyone ? "border-dashed bg-gray-100 text-black/50 shadow-none border-black/30" : ""
                                                )}
                                            >
                                                {msg.is_deleted_for_everyone ? (
                                                    <p className="italic font-bold text-xs flex items-center gap-2">
                                                        <Ban className="w-3 h-3" /> THIS TRANSMISSION WAS REDACTED
                                                    </p>
                                                ) : (
                                                    <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                                )}

                                                <span className={cn(
                                                    "flex items-center gap-1 text-[10px] mt-1.5 font-black tracking-widest uppercase",
                                                    isMe ? (msg.is_deleted_for_everyone ? "text-black/40" : "text-white/50") : "text-black/40"
                                                )}>
                                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    {isMe && !msg.is_deleted_for_everyone && (
                                                        msg.is_read ? <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> : <Check className="w-3 h-3 opacity-70" />
                                                    )}
                                                </span>

                                                {/* decorative notch */}
                                                {!msg.is_deleted_for_everyone && (
                                                    <>
                                                        {isMe ? (
                                                            <div className="absolute -bottom-[2px] -right-[16px] w-0 h-0 border-t-[14px] border-t-black border-r-[14px] border-r-transparent" />
                                                        ) : (
                                                            <div className="absolute -bottom-[2px] -left-[16px] w-0 h-0 border-t-[14px] border-t-white border-l-[14px] border-l-transparent" />
                                                        )}
                                                        {/* shadow for notch */}
                                                        {!isMe && (
                                                            <div className="absolute -bottom-[0px] -left-[20px] w-0 h-0 border-t-[18px] border-t-black border-l-[18px] border-l-transparent -z-10 opacity-25" />
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {!isMe && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-5 w-5 text-black/50 hover:text-black" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white min-w-[150px] p-2 z-50">
                                                        <DropdownMenuItem onClick={() => handleDeleteForMe(msg.id)} className="cursor-pointer font-bold uppercase hover:bg-black hover:text-white rounded-md">
                                                            Delete for Me
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t-4 border-black z-20 shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
                            <form onSubmit={sendMessage} className="relative flex gap-4 items-center max-w-5xl mx-auto">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="TYPE TRANSMISSION..."
                                    className="flex-1 rounded-2xl h-16 px-6 bg-white border-4 border-black focus-visible:ring-0 focus-visible:outline-none focus-visible:border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-lg font-bold placeholder:text-black/30 placeholder:uppercase tracking-widest transition-transform focus-visible:-translate-y-1 focus-visible:-translate-x-1 focus-visible:shadow-[10px_10px_0_0_rgba(0,0,0,1)]"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className={cn(
                                        "rounded-2xl w-16 h-16 shrink-0 transition-all duration-300 border-4",
                                        newMessage.trim()
                                            ? "bg-black text-white border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)]"
                                            : "bg-white text-black/30 border-black/30 cursor-not-allowed shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]"
                                    )}
                                    disabled={!newMessage.trim()}
                                >
                                    <Send className="w-6 h-6 ml-1" strokeWidth={3} />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-black p-8 relative z-10 w-full overflow-hidden">
                        {/* Background Decor */}

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-32 h-32 border-8 border-black bg-white flex items-center justify-center mb-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-3xl"
                        >
                            <MessageSquare className="w-16 h-16 text-black" strokeWidth={2.5} />
                        </motion.div>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase text-center bg-black text-white px-6 py-2 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] rounded-xl">INITIALIZE COMM-LINK</h3>
                        <p className="text-black/60 font-bold uppercase tracking-widest text-center max-w-sm">
                            Select a node from the sidebar to establish a secure connection.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
