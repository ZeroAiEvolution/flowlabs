import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'About', path: '/about' },
    { name: 'Content', path: '/content' },
    { name: 'Students', path: '/students' },
    { name: 'Professionals', path: '/professionals' },
    { name: 'Team', path: '/team' },
    { name: 'Help', path: '/help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] md:w-auto">
        <div className="bg-background/80 backdrop-blur-md border border-border rounded-4xl px-4 md:px-2 py-2 flex items-center justify-between md:justify-center gap-4 md:gap-1 shadow-lg w-full">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2.5 rounded-4xl text-sm font-medium transition-all duration-300 ${isActive(link.path)
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <>
                <div className="w-px h-6 bg-border mx-2" />
                <Link
                  to="/"
                  className="px-4 py-2.5 rounded-4xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
                >
                  Log in
                </Link>
                <Button
                  asChild
                  className="rounded-4xl px-5 font-medium"
                >
                  <Link to="/">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Brand */}
          <div className="md:hidden flex items-center justify-between w-full">
            <Link to="/home" className="text-foreground font-black text-xl tracking-tight" onClick={() => setIsMenuOpen(false)}>
              Flow Labs
            </Link>
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-background border border-border rounded-3xl p-4 w-full shadow-lg flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(link.path)
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            {/* Network and Messages links removed from mobile menu per user request */}
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Log in
                </Link>
                <Button asChild className="w-full mt-2 rounded-4xl">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Dynamic Floating Action Button (Network) */}
      {user && (
        <div className="hidden md:block fixed bottom-6 xl:bottom-10 right-6 xl:right-10 z-[100]">
          <div className="relative group flex items-center justify-center">

            {/* Popout Speech Bubble (Hover) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out pointer-events-none drop-shadow-lg hidden sm:block">
              <div className="bg-foreground text-background font-black uppercase tracking-widest text-xs px-5 py-3 rounded-2xl whitespace-nowrap border-2 border-foreground relative shadow-[6px_6px_0_0_rgba(0,0,0,0.15)] animate-bounce shadow-foreground/20">
                Connect Now!
                {/* Speech Bubble Triangle Pointer */}
                <div className="absolute top-1/2 -right-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[10px] border-l-foreground" />
              </div>
            </div>

            {/* Brutalist 3D Shadow Stack */}
            <div className="absolute inset-0 bg-black rounded-[1.5rem] sm:rounded-[2rem] translate-y-2 translate-x-2 group-hover:translate-y-3 group-hover:translate-x-3 transition-transform duration-300 ease-out pointer-events-none" />

            {/* Main Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative rounded-[1.5rem] sm:rounded-[2rem] w-14 h-14 sm:w-20 sm:h-20 bg-background border-4 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 overflow-visible p-0 group-hover:-translate-y-1 group-hover:-translate-x-1"
              title="Network"
            >
              <Link to="/network" className="w-full h-full flex flex-col items-center justify-center relative z-10 gap-1">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-300 ease-out" />

                {/* Multi-layered Notification Ping */}
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 flex h-4 w-4 sm:h-6 sm:w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                  <span className="relative flex items-center justify-center rounded-full h-full w-full bg-red-500 border-2 sm:border-[3px] border-background group-hover:border-foreground transition-colors duration-300 shadow-sm">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse" />
                  </span>
                </span>
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Profile Avatar - Top Right (Desktop Only) */}
      {user && (
        <div className="hidden md:flex fixed top-6 right-6 z-50 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="rounded-full w-10 h-10 bg-background/80 backdrop-blur-md border border-border hover:bg-secondary"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
          <Link to="/profile">
            <Avatar className="w-12 h-12 border-2 border-border shadow-lg cursor-pointer hover:border-primary transition-all duration-300 bg-background">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
