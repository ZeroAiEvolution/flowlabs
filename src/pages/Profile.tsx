import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import ProfileManager from '@/components/ProfileManager';
import { AnimatedText } from '@/components/AnimatedSection';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
              <User className="w-4 h-4 inline mr-2" />
              My Account
            </motion.span>
          </AnimatedText>
          
          <AnimatedText delay={0.1}>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              Profile Manager
            </h1>
          </AnimatedText>
          
          <AnimatedText delay={0.2}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Manage your profile, track your progress, and showcase your achievements
            </p>
          </AnimatedText>
        </div>
      </section>

      {/* Profile Manager */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <ProfileManager />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;
