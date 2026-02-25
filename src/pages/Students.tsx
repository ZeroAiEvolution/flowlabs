import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import AnimatedSection, { AnimatedText, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, FolderGit2, ExternalLink, Search, Plus, Clock, UserCheck, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectUploadForm } from '@/components/ProjectUploadForm';

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  project_url: string | null;
  is_featured: boolean | null;
  profiles: {
    full_name: string | null;
  } | null;
}

interface ConnectionStatus {
  [key: string]: 'none' | 'pending' | 'accepted' | 'rejected' | 'received';
}

const Students = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [currentUserProfession, setCurrentUserProfession] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [activeTab, setActiveTab] = useState('directory');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCurrentProfileAndConnections();
    }
  }, [user]);

  const fetchCurrentProfileAndConnections = async () => {
    if (!user) return;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, profession')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        setCurrentProfileId(profileData.id);
        setCurrentUserProfession(profileData.profession);
        fetchConnections(profileData.id);
      }
    } catch (error) {
      console.error('Error fetching current profile:', error);
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
    if (!currentProfileId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to connect with students.",
        variant: "destructive"
      });
      return;
    }
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

  const fetchData = async () => {
    setLoading(true);

    // Fetch students (profiles with profession = 'student')
    const { data: studentsData, count } = await supabase
      .from('profiles')
      .select('id, full_name, bio, avatar_url', { count: 'exact' })
      .eq('profession', 'student')
      .order('created_at', { ascending: false });

    if (studentsData) {
      setStudents(studentsData);
      setStudentCount(count || 0);
    }

    // Fetch projects with author info (filter by student profession)
    const { data: projectsData } = await supabase
      .from('student_projects')
      .select(`
        *,
        profiles!inner(full_name, profession)
      `)
      .eq('profiles.profession', 'student')
      .order('created_at', { ascending: false });

    if (projectsData) {
      setProjects(projectsData);
    }

    setLoading(false);
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingElements />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <AnimatedText>
            <motion.span
              className="inline-block px-6 py-2 bg-gradient-to-r from-secondary via-secondary to-muted text-foreground rounded-4xl text-sm font-medium mb-6 border border-border/50"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Student Community
            </motion.span>
          </AnimatedText>

          <AnimatedText delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
              Students Section
            </h1>
          </AnimatedText>

          <AnimatedText delay={0.2}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Meet our talented student community members and explore their projects
            </p>
          </AnimatedText>

          {/* Student Counter */}
          <AnimatedText delay={0.3}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-primary">{studentCount}</span>
              <span className="text-muted-foreground">Students Registered</span>
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="directory">
                <Users className="w-4 h-4 mr-2 hidden sm:inline" />
                Directory
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FolderGit2 className="w-4 h-4 mr-2 hidden sm:inline" />
                Projects
              </TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={activeTab === 'directory' ? "Search students..." : "Search projects..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-2xl"
                />
              </div>
            </div>

            {/* Student Directory */}
            <TabsContent value="directory">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students found. Be the first to join!</p>
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {filteredStudents.map((student) => {
                    const status = connectionStatus[student.id] || 'none';
                    return (
                      <StaggerItem key={student.id}>
                        <Card className="overflow-hidden hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-300 h-full relative group border-[3px] md:border-4 border-black rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] bg-white flex flex-col p-4 md:p-6">

                          {/* Top Row */}
                          <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 relative z-10 w-full gap-2 md:gap-0">
                            <Avatar className="w-14 h-14 md:w-20 md:h-20 border-[3px] md:border-4 border-black rounded-[1rem] bg-white group-hover:scale-105 transition-transform duration-300">
                              <AvatarImage src={student.avatar_url || undefined} className="object-cover" />
                              <AvatarFallback className="text-2xl font-black bg-white text-black">
                                {student.full_name?.substring(0, 2).toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <Badge className="text-[10px] md:text-xs font-black uppercase px-2 py-1 md:px-4 md:py-1.5 bg-black text-white rounded-full border-2 border-transparent w-fit">
                              <Users className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5 inline-block -mt-0.5" /> <span className="hidden sm:inline">STUDENT</span><span className="sm:hidden">STUDENT</span>
                            </Badge>
                          </div>

                          <div className="relative z-10 flex-1 flex flex-col items-start w-full">
                            <h3 className="text-xl md:text-2xl font-black text-black tracking-tight leading-tight mb-1 md:mb-2 text-left w-full line-clamp-2 md:line-clamp-1">
                              {student.full_name || 'Anonymous'}
                            </h3>
                            <p className="text-[13px] md:text-[15px] font-bold text-black/70 mb-4 md:mb-8 text-left w-full line-clamp-2 md:line-clamp-2 leading-snug">
                              {student.bio || 'No description available'}
                            </p>
                          </div>

                          <div className="relative z-10 mt-auto w-full">
                            {user && currentProfileId !== student.id ? (
                              status === 'accepted' ? (
                                <Button className="w-full h-10 md:h-12 text-sm md:text-base font-black uppercase rounded-[1rem] border-[3px] md:border-4 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 px-0" asChild>
                                  <Link to={`/network?tab=messages&user=${student.id}`}>
                                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> <span className="hidden sm:inline">Message</span><span className="sm:hidden">Chat</span>
                                  </Link>
                                </Button>
                              ) : status === 'pending' ? (
                                <Button disabled className="w-full h-10 md:h-12 text-sm md:text-base font-black uppercase rounded-[1rem] border-[3px] md:border-4 border-gray-400 bg-gray-100 text-gray-500 opacity-100 shadow-none px-0">
                                  <Clock className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> <span className="hidden sm:inline">Pending...</span><span className="sm:hidden">Pend...</span>
                                </Button>
                              ) : status === 'received' ? (
                                <Button className="w-full h-10 md:h-12 text-sm md:text-base font-black uppercase rounded-[1rem] border-[3px] md:border-4 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 px-0" asChild>
                                  <Link to="/network/requests">
                                    <UserCheck className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Respond
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  className="w-full h-10 md:h-12 text-sm md:text-base font-black uppercase rounded-[1rem] bg-black text-white border-[3px] md:border-4 border-black hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:shadow-none px-0"
                                  onClick={() => sendConnectionRequest(student.id)}
                                >
                                  <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Connect
                                </Button>
                              )
                            ) : (
                              <Button className="w-full h-10 md:h-12 text-xs sm:text-sm md:text-base font-black uppercase rounded-[1rem] bg-black text-white border-[3px] md:border-4 border-black hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:shadow-none px-0" asChild>
                                <Link to={`/directory/${student.id}`}>
                                  <span className="hidden sm:inline">View Profile</span><span className="sm:hidden">View</span>
                                </Link>
                              </Button>
                            )}
                          </div>
                        </Card>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              )}
            </TabsContent>

            {/* Projects Showcase */}
            <TabsContent value="projects">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Projects by Student</h2>
                {user && currentUserProfession === 'student' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="rounded-full shadow-lg hover:shadow-xl transition-all h-12 px-6">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Upload Your Project</DialogTitle>
                        <DialogDescription>
                          Share your latest work with the community. Stand out to professionals and recruiters.
                        </DialogDescription>
                      </DialogHeader>
                      <ProjectUploadForm onSuccess={fetchData} userId={user.id} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading projects...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderGit2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No projects found for your search.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Featured Projects */}
                  {filteredProjects.filter(p => p.is_featured).length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        Featured Projects
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProjects.filter(p => p.is_featured).map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                              <div className="relative aspect-video bg-muted">
                                <img
                                  src={project.thumbnail_url || '/placeholder.svg'}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                />
                                <Badge className="absolute top-3 left-3 bg-primary">
                                  Featured
                                </Badge>
                              </div>
                              <CardHeader>
                                <CardTitle>{project.title}</CardTitle>
                                <CardDescription>{project.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    By {project.profiles?.full_name || 'Unknown'}
                                  </span>
                                  {project.project_url && (
                                    <Button variant="ghost" size="sm" asChild>
                                      <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                        View Project <ExternalLink className="w-4 h-4 ml-2" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Projects */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6">All Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                            <div className="relative aspect-video bg-muted">
                              <img
                                src={project.thumbnail_url || '/placeholder.svg'}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardHeader>
                              <CardTitle className="text-lg">{project.title}</CardTitle>
                              <CardDescription className="text-sm">{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  By {project.profiles?.full_name || 'Unknown'}
                                </span>
                                {project.project_url && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Students;
