import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { UserPlus, Check, MessageSquare, Briefcase, GraduationCap, Plus, Clock, UserCheck, Search } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { Link, useSearchParams } from 'react-router-dom';
import NetworkRequests from './NetworkRequests';
import MessagesPage from './MessagesPage';

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    profession: string | null;
}

interface ConnectionStatus {
    [key: string]: 'none' | 'pending' | 'accepted' | 'rejected' | 'received';
}

const NetworkPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'student' | 'professional'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'discover';

    const handleTabChange = (value: string) => {
        setSearchParams(prev => {
            prev.set('tab', value);
            return prev;
        });
    };

    useEffect(() => {
        if (user) {
            fetchCurrentProfileAndData();
        }
    }, [user]);

    // Refetch connections when switching tabs so the UI stays synced with deletions/approvals
    useEffect(() => {
        if (currentProfileId) {
            fetchConnections(currentProfileId);
        }
    }, [activeTab, currentProfileId]);

    const fetchCurrentProfileAndData = async () => {
        if (!user) return;
        try {
            // Get current user's profile ID first
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (profileError) throw profileError;
            if (profileData) {
                setCurrentProfileId(profileData.id);
                // Now fetch other data using the correct profile ID
                await Promise.all([
                    fetchProfiles(profileData.id),
                    fetchConnections(profileData.id)
                ]);
            }
        } catch (error) {
            console.error('Error fetching current profile:', error);
            setLoading(false);
        }
    };

    const fetchProfiles = async (myProfileId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, bio, profession')
                .neq('id', myProfileId) // Don't show self
                .limit(50);

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConnections = async (myProfileId: string) => {
        try {
            const { data, error } = await supabase
                .from('connections')
                .select('requester_id, receiver_id, status')
                .or(`requester_id.eq.${myProfileId},receiver_id.eq.${myProfileId}`);

            if (error) throw error;

            const statusMap: ConnectionStatus = {};
            data?.forEach(conn => {
                const otherId = conn.requester_id === myProfileId ? conn.receiver_id : conn.requester_id;
                if (conn.status === 'accepted') {
                    statusMap[otherId] = 'accepted';
                } else if (conn.status === 'pending') {
                    statusMap[otherId] = conn.requester_id === myProfileId ? 'pending' : 'received';
                } else if (conn.status === 'rejected') {
                    statusMap[otherId] = 'rejected';
                }
            });
            setConnectionStatus(statusMap);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    const sendConnectionRequest = async (receiverId: string) => {
        if (!currentProfileId) return;
        try {
            const { error } = await supabase
                .from('connections')
                .insert({
                    requester_id: currentProfileId,
                    receiver_id: receiverId,
                    status: 'pending'
                });

            if (error) throw error;

            setConnectionStatus(prev => ({ ...prev, [receiverId]: 'pending' }));
            toast({
                title: "Request Sent",
                description: "Connection request sent successfully.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to send request. Please try again.",
                variant: "destructive"
            });
        }
    };

    const filteredProfiles = profiles.filter(p =>
        (filter === 'all' || p.profession === filter) &&
        (p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.bio?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen pt-24 px-6 relative overflow-hidden bg-white text-black font-sans selection:bg-black selection:text-white">
            {/* Dynamic Brutalist Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Floating solid shapes instead of blurry orbs */}
                <motion.div
                    className="absolute top-[10%] left-[5%] w-32 h-32 border-[8px] border-black bg-white"
                    animate={{ rotate: 360, x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="absolute bottom-[-5%] right-[10%] w-48 h-48 border-[8px] border-black rounded-full"
                    animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Crosshairs */}
                <div className="absolute top-[20%] right-[30%] w-10 h-10 border-t-4 border-l-4 border-black" />
                <div className="absolute bottom-[30%] left-[20%] w-10 h-10 border-b-4 border-r-4 border-black" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                        className="relative"
                    >
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-black uppercase leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                            NETWORK
                        </h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-2 bg-black mt-2"
                        />
                        <p className="text-black/70 mt-4 text-xl font-bold uppercase tracking-widest">
                            Connect. Collaborate. Chat.
                        </p>
                    </motion.div>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="flex flex-col md:flex-row w-full p-0 bg-transparent border-none gap-4 mb-16 h-auto">
                        <TabsTrigger value="discover" className="flex-1 text-2xl font-black uppercase rounded-xl border-4 border-black bg-white text-black py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:translate-y-[4px] data-[state=active]:translate-x-[4px] data-[state=active]:shadow-none hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                            Discover
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="flex-1 text-2xl font-black uppercase rounded-xl border-4 border-black bg-white text-black py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:translate-y-[4px] data-[state=active]:translate-x-[4px] data-[state=active]:shadow-none hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                            Requests
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="flex-1 text-2xl font-black uppercase rounded-xl border-4 border-black bg-white text-black py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:translate-y-[4px] data-[state=active]:translate-x-[4px] data-[state=active]:shadow-none hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                            Messages
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="discover" className="mt-0 outline-none animate-in slide-in-from-bottom-8 duration-500">
                        {/* Search and Filter */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                            <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full max-w-xl">
                                <TabsList className="bg-transparent p-0 gap-1 sm:gap-2 border-b-4 border-black w-full flex justify-start rounded-none h-auto">
                                    <TabsTrigger value="all" className="text-base sm:text-lg uppercase font-bold text-black bg-white rounded-t-xl border-x-4 border-t-4 border-transparent data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white px-3 sm:px-6 py-2 transition-colors">All</TabsTrigger>
                                    <TabsTrigger value="student" className="text-base sm:text-lg uppercase font-bold text-black bg-white rounded-t-xl border-x-4 border-t-4 border-transparent data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white px-3 sm:px-6 py-2 transition-colors">Students</TabsTrigger>
                                    <TabsTrigger value="professional" className="text-base sm:text-lg uppercase font-bold text-black bg-white rounded-t-xl border-x-4 border-t-4 border-transparent data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white px-3 sm:px-6 py-2 transition-colors">Pros</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/50" />
                                <Input
                                    type="text"
                                    placeholder="Search network..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-12 rounded-xl border-4 border-black focus-visible:ring-0 focus-visible:outline-none focus-visible:border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-widest placeholder:text-black/30 w-full"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-black">
                                <div className="w-16 h-16 border-8 border-black/20 border-t-black rounded-full animate-spin mb-6" />
                                <p className="text-2xl font-black uppercase tracking-widest animate-pulse">Scanning Network...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredProfiles.map((profile, index) => (
                                    <motion.div
                                        key={profile.id}
                                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                                        whileHover={{ y: -10, x: -5, rotate: -1 }}
                                        className="h-full relative group"
                                    >
                                        <Card className="h-full flex flex-col relative overflow-visible bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] group-hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-300 z-10">

                                            {/* Harsh Invert Hover Effect */}
                                            <div className="absolute inset-0 bg-black scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 ease-in-out z-0 rounded-[12px]" />

                                            <CardHeader className="flex flex-col pb-4 z-10 relative">
                                                <div className="flex justify-between items-start w-full">
                                                    <Avatar className="w-20 h-20 border-4 border-black rounded-xl bg-white">
                                                        <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
                                                        <AvatarFallback className="bg-white text-black text-2xl font-black">{profile.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>

                                                    {/* Badge */}
                                                    <Badge className="text-sm font-black uppercase px-3 py-1 bg-black text-white group-hover:bg-white group-hover:text-black rounded-lg border-2 border-transparent group-hover:border-black transition-colors">
                                                        {profile.profession === 'professional' ? (
                                                            <Briefcase className="w-4 h-4 mr-2" />
                                                        ) : (
                                                            <GraduationCap className="w-4 h-4 mr-2" />
                                                        )}
                                                        {profile.profession || 'student'}
                                                    </Badge>
                                                </div>

                                                <div className="mt-6">
                                                    <CardTitle className="text-2xl font-black leading-none truncate text-black group-hover:text-white transition-colors duration-300">
                                                        {profile.full_name}
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0 flex-1 flex flex-col justify-between z-10 relative gap-6">
                                                <p className="text-base font-bold text-black/70 group-hover:text-white/80 line-clamp-3 leading-snug transition-colors duration-300">
                                                    {profile.bio || 'No bio available'}
                                                </p>

                                                {/* Action Button */}
                                                <div className="w-full">
                                                    {connectionStatus[profile.id] === 'accepted' ? (
                                                        <Button className="w-full h-12 text-lg font-black uppercase rounded-xl bg-black text-white border-4 border-black group-hover:bg-white group-hover:text-black transition-all hover:scale-105 active:scale-95" asChild>
                                                            <Link to={`/network?tab=messages&user=${profile.id}`}>
                                                                <MessageSquare className="w-5 h-5 mr-2" />
                                                                Message
                                                            </Link>
                                                        </Button>
                                                    ) : connectionStatus[profile.id] === 'pending' ? (
                                                        <Button disabled className="w-full h-12 text-lg font-black uppercase rounded-xl border-4 border-black bg-gray-200 text-black group-hover:bg-black group-hover:text-white opacity-80">
                                                            <Clock className="w-5 h-5 mr-2" />
                                                            Pending...
                                                        </Button>
                                                    ) : connectionStatus[profile.id] === 'received' ? (
                                                        <Button className="w-full h-12 text-lg font-black uppercase rounded-xl bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all" asChild>
                                                            <Link to="/network/requests">
                                                                <UserCheck className="w-5 h-5 mr-2" />
                                                                Respond
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            className="w-full h-12 text-lg font-black uppercase rounded-xl bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-none hover:translate-y-1 hover:translate-x-1 group-hover:bg-white group-hover:text-black group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
                                                            onClick={() => sendConnectionRequest(profile.id)}
                                                        >
                                                            <Plus className="w-6 h-6 mr-2 font-black" />
                                                            Connect
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Decorative tape on cards */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-black opacity-20 rotate-3 z-0" />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {!loading && filteredProfiles.length === 0 && (
                            <div className="text-center py-32 bg-white border-4 border-black border-dashed rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                                <UserPlus className="w-20 h-20 mx-auto mb-6 opacity-20" />
                                <h2 className="text-4xl font-black uppercase mb-2">NO PROFILES FOUND</h2>
                                <p className="text-xl font-bold text-black/60 tracking-widest uppercase">System empty for {filter !== 'all' ? filter : 'this query'}.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="requests" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                        <NetworkRequests />
                    </TabsContent>

                    <TabsContent value="messages" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                        <div className="h-[calc(100vh-14rem)] min-h-[600px] border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden relative mb-20 rounded-3xl">
                            <MessagesPage />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div >
    );
};

export default NetworkPage;
