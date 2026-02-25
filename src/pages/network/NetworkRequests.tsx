import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { Check, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Request {
    id: string; // connection id
    requester: {
        id: string;
        full_name: string;
        avatar_url: string | null;
        headline: string | null;
        profession: string;
    }
}

const NetworkRequests = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        if (!user) return;
        try {
            // Get current user's profile ID first
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (profileError || !profile) throw profileError;

            // Fetch interactions where user is receiver and status is pending
            const { data, error } = await supabase
                .from('connections')
                .select(`
                    id,
                    requester:profiles!requester_id (
                        id,
                        full_name,
                        avatar_url,
                        headline,
                        profession
                    )
                `)
                .eq('receiver_id', profile.id)
                .eq('status', 'pending');

            if (error) throw error;

            // Map the data - dealing with the nested structure from Supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedRequests = (data as any[]).map(item => ({
                id: item.id,
                requester: Array.isArray(item.requester) ? item.requester[0] : item.requester
            }));

            setRequests(formattedRequests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (connectionId: string, action: 'accepted' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('connections')
                .update({ status: action })
                .eq('id', connectionId);

            if (error) throw error;

            toast({
                title: action === 'accepted' ? "Connection Accepted" : "Request Ignored",
                description: action === 'accepted' ? "You can now message this user." : "",
            });

            // Remove from list
            setRequests(prev => prev.filter(req => req.id !== connectionId));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update request. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="w-full relative bg-white text-black font-sans min-h-[50vh]">
            <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black flex items-center gap-4">
                        Pending Requests
                        {requests.length > 0 && (
                            <Badge className="rounded-xl bg-black text-white px-3 py-1 text-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {requests.length}
                            </Badge>
                        )}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-black">
                        <div className="w-16 h-16 border-8 border-black/20 border-t-black rounded-full animate-spin mb-6" />
                        <p className="text-2xl font-black uppercase tracking-widest animate-pulse">Loading Comm Links...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-24 bg-white border-4 border-black border-dashed shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                        <User className="w-20 h-20 mx-auto mb-6 opacity-20" />
                        <h3 className="text-4xl font-black uppercase mb-2">NO PENDING REQUESTS</h3>
                        <p className="text-xl font-bold text-black/60 tracking-widest uppercase">Your queue is empty.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {requests.map((req, index) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, x: -40, skewX: 5 }}
                                animate={{ opacity: 1, x: 0, skewX: 0 }}
                                exit={{ opacity: 0, x: 40, skewX: -5 }}
                                transition={{ duration: 0.4, delay: index * 0.1, type: "spring" }}
                                className="group block"
                            >
                                <Card className="overflow-visible bg-white border-4 border-black rounded-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 relative z-10">
                                    {/* Hover Reveal Block */}
                                    <div className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0 rounded-[12px]" />

                                    <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 relative z-10">
                                        <div className="relative">
                                            <Avatar className="w-24 h-24 border-4 border-black rounded-xl bg-white">
                                                <AvatarImage src={req.requester.avatar_url || ''} className="object-cover" />
                                                <AvatarFallback className="bg-white text-black text-3xl font-black">{req.requester.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-4 border-black bg-white" />
                                        </div>

                                        <div className="flex-1 text-center sm:text-left min-w-0">
                                            <h3 className="font-black text-3xl truncate text-black group-hover:text-white transition-colors duration-300 tracking-tight uppercase">
                                                {req.requester.full_name}
                                            </h3>
                                            <p className="text-lg font-bold text-black/70 group-hover:text-white/80 mb-3 truncate transition-colors duration-300">
                                                {req.requester.headline || 'NO DATA EXPORTED'}
                                            </p>
                                            <Badge className="text-sm font-black uppercase px-3 py-1 bg-black text-white group-hover:bg-white group-hover:text-black rounded-lg border-2 border-transparent group-hover:border-black transition-colors">
                                                {req.requester.profession || 'STUDENT'}
                                            </Badge>
                                        </div>

                                        <div className="flex gap-4 w-full sm:w-auto mt-6 sm:mt-0">
                                            <Button
                                                className="flex-1 sm:flex-none h-14 px-6 text-lg font-black uppercase rounded-xl border-4 border-black bg-white text-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all group-hover:border-white group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                                                onClick={() => handleAction(req.id, 'rejected')}
                                            >
                                                <X className="w-6 h-6 sm:mr-2" strokeWidth={3} />
                                                <span className="hidden sm:inline">Ignore</span>
                                            </Button>
                                            <Button
                                                className="flex-1 sm:flex-none h-14 px-6 text-lg font-black uppercase rounded-xl border-4 border-black bg-black text-white hover:bg-white hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                                                onClick={() => handleAction(req.id, 'accepted')}
                                            >
                                                <Check className="w-6 h-6 sm:mr-2" strokeWidth={3} />
                                                <span className="hidden sm:inline">Accept</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                    {/* Decorative tape on cards */}
                                    <div className="absolute -bottom-4 right-10 w-20 h-8 bg-black opacity-20 -rotate-6 z-0" />
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkRequests;
