import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';
import { Linkedin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
}

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members' as any)
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTeamMembers((data as unknown as TeamMember[]) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching team members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <RevealOnScroll>
            <span className="inline-block px-6 py-2 bg-secondary text-foreground rounded-4xl text-sm font-medium mb-6">
              The Team
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6">
              Our Team
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Meet the passionate individuals building Flow Labs and empowering the next generation of tech professionals
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-black" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No team members found. Check back later!
            </div>
          ) : (
            <RevealOnScroll stagger delay={200}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id || member.name}
                    className="bg-white border-2 sm:border-4 border-black rounded-3xl sm:rounded-[2rem] p-3 sm:p-4 md:p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0_0_rgba(1,1,1,1)] sm:hover:shadow-[10px_10px_0_0_rgba(1,1,1,1)] transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 flex flex-col items-center"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-3 sm:mb-4 md:mb-6 bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-[1.25rem] flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300">
                      {member.image_url ? (
                        <img
                          src={member.image_url}
                          alt={member.name || 'Team member'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl sm:text-3xl md:text-5xl font-black text-black">
                          {member.name ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="text-sm sm:text-lg md:text-2xl font-black text-black mb-1 uppercase tracking-tight text-center leading-tight sm:leading-normal">{member.name}</h3>
                    <p className="text-black/60 font-bold text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4 uppercase tracking-widest">{member.role}</p>
                    <p className="text-black text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-6 md:mb-8 font-medium leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {member.bio}
                    </p>

                    {/* Social Icons */}
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-auto">
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-px hover:translate-x-px bg-white text-black"
                        >
                          <Linkedin className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;
