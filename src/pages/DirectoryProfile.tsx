import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Briefcase, GraduationCap, MessageSquare, Plus, Clock, UserCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
    id: string;
    user_id: string;
    full_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    profession: string | null;
    headline: string | null;
}

const DirectoryProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected' | 'received'>('none');
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchProfileData(id);
        }
    }, [id]);

    useEffect(() => {
        if (user && profile) {
            fetchCurrentProfileAndConnection(profile.id);
        }
    }, [user, profile]);

    const fetchProfileData = async (profileId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast({
                title: "Profile not found",
                description: "The profile you are looking for does not exist.",
                variant: "destructive"
            });
            navigate(-1); // Go back
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentProfileAndConnection = async (targetProfileId: string) => {
        if (!user) return;
        try {
            // Get current user's profile ID
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (profileError) throw profileError;

            if (profileData) {
                setCurrentProfileId(profileData.id);

                // Check connection status
                const { data: connData, error: connError } = await supabase
                    .from('connections')
                    .select('requester_id, receiver_id, status')
                    .or(`and(requester_id.eq.${profileData.id},receiver_id.eq.${targetProfileId}),and(requester_id.eq.${targetProfileId},receiver_id.eq.${profileData.id})`)
                    .maybeSingle();

                if (connError && connError.code !== 'PGRST116') throw connError;

                if (connData) {
                    if (connData.status === 'accepted' || connData.status === 'rejected') {
                        setConnectionStatus(connData.status);
                    } else if (connData.status === 'pending') {
                        setConnectionStatus(connData.requester_id === profileData.id ? 'pending' : 'received');
                    }
                }
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    };

    const sendConnectionRequest = async () => {
        if (!currentProfileId || !profile) {
            toast({
                title: "Sign in required",
                description: "Please sign in to connect with users.",
                variant: "destructive"
            });
            return;
        }

        try {
            const { error } = await supabase
                .from('connections')
                .insert({
                    requester_id: currentProfileId,
                    receiver_id: profile.id,
                    status: 'pending'
                });

            if (error) throw error;

            setConnectionStatus('pending');
            toast({
                title: "Request Sent",
                description: `Connection request sent to ${profile.full_name}.`,
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

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Navbar />
                <div className="text-center py-12">
                    <p className="text-muted-foreground animate-pulse">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const isOwnProfile = currentProfileId === profile.id;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <FloatingElements />
            <Navbar />

            <main className="pt-32 pb-20 px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        className="mb-6 -ml-4 space-x-2 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to directory</span>
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <Card className="overflow-hidden border-[3px] md:border-4 border-black rounded-[1.5rem] shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] bg-white">
                            <CardHeader className="text-center bg-gradient-to-b from-primary/10 to-transparent pb-8 pt-12 relative">
                                <div className="relative inline-block mx-auto mb-6">
                                    <Avatar className="w-32 h-32 border-4 border-black rounded-[1.5rem] bg-white shadow-lg">
                                        <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                                        <AvatarFallback className="text-4xl font-black bg-white text-black">
                                            {profile.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {profile.profession && (
                                        <div className="absolute -bottom-3 -right-3 p-3 bg-black rounded-full border-[3px] border-white shadow-md">
                                            {profile.profession === 'student' ? (
                                                <GraduationCap className="w-6 h-6 text-white" />
                                            ) : (
                                                <Briefcase className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <CardTitle className="text-3xl md:text-4xl font-black text-black mb-2">
                                    {profile.full_name || 'Anonymous User'}
                                </CardTitle>

                                {profile.headline && (
                                    <p className="text-lg font-bold text-muted-foreground mb-4">
                                        {profile.headline}
                                    </p>
                                )}

                                <Badge className="text-sm font-black uppercase px-4 py-1.5 bg-black text-white rounded-full border-2 border-transparent mx-auto mt-2">
                                    {profile.profession === 'student' ? (
                                        <><GraduationCap className="w-4 h-4 mr-2 inline-block" /> Student</>
                                    ) : profile.profession === 'professional' ? (
                                        <><Briefcase className="w-4 h-4 mr-2 inline-block" /> Professional</>
                                    ) : (
                                        <><User className="w-4 h-4 mr-2 inline-block" /> User</>
                                    )}
                                </Badge>
                            </CardHeader>

                            <CardContent className="px-6 md:px-12 py-8 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-black border-b-2 border-dashed border-gray-200 pb-2">About</h3>
                                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {profile.bio || 'This user has not provided a bio yet.'}
                                    </p>
                                </div>

                                {/* Connection Action Buttons - Only show if not viewing own profile */}
                                {!isOwnProfile && user && (
                                    <div className="pt-6 flex justify-center border-t-2 border-dashed border-gray-200">
                                        {connectionStatus === 'accepted' ? (
                                            <Button className="h-12 w-full max-w-sm text-base font-black uppercase rounded-[1rem] border-[3px] border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1" asChild>
                                                <Link to={`/network?tab=messages&user=${profile.id}`}>
                                                    <MessageSquare className="w-5 h-5 mr-2" /> Message
                                                </Link>
                                            </Button>
                                        ) : connectionStatus === 'pending' ? (
                                            <Button disabled className="h-12 w-full max-w-sm text-base font-black uppercase rounded-[1rem] border-[3px] border-gray-400 bg-gray-100 text-gray-500 shadow-none">
                                                <Clock className="w-5 h-5 mr-2" /> Request Pending
                                            </Button>
                                        ) : connectionStatus === 'received' ? (
                                            <Button className="h-12 w-full max-w-sm text-base font-black uppercase rounded-[1rem] border-[3px] border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1" asChild>
                                                <Link to="/network/requests">
                                                    <UserCheck className="w-5 h-5 mr-2" /> Respond to Request
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                className="h-12 w-full max-w-sm text-base font-black uppercase rounded-[1rem] bg-black text-white border-[3px] border-black hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:shadow-none"
                                                onClick={sendConnectionRequest}
                                            >
                                                <Plus className="w-5 h-5 mr-2" /> Connect
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Sign up prompt for non-authenticated users */}
                                {!user && (
                                    <div className="pt-6 flex flex-col items-center border-t-2 border-dashed border-gray-200 text-center">
                                        <p className="text-muted-foreground mb-4">Sign in to connect with {profile.full_name}</p>
                                        <Button className="font-black uppercase rounded-[1rem] w-full max-w-sm" asChild>
                                            <Link to="/">Sign In / Register</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DirectoryProfile;
