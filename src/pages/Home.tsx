import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedTechCard from '@/components/AnimatedTechCard';
import PartnersMarquee from '@/components/PartnersMarquee';
import GetInTouch from '@/components/GetInTouch';
import FloatingElements from '@/components/FloatingElements';
import WhatsAppButton from '@/components/WhatsAppButton';
import BannerCarousel from '@/components/BannerCarousel';
import AnimatedSection, { AnimatedText, AnimatedCard, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Code, Calendar, Trophy, Users, ArrowRight } from 'lucide-react';
import communityGroup from '@/assets/community-group.png';
import impactPuzzle from '@/assets/impact-puzzle.png';

// Tech stack icons as SVG components
const HTMLIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <path fill="#E34F26" d="M5.9 27.5L4 6h24l-1.9 21.5L16 30l-10.1-2.5z" />
    <path fill="#EF652A" d="M16 27.8V8H24l-1.6 18.2L16 27.8z" />
    <path fill="#fff" d="M8 11.4h8v2.5H10.6l.3 2.5H16v2.5H8.5l-0.5-5-.2-2.5zm0.8 7.5h2.5l.2 2.5 4.5 1.2v2.6l-6.5-1.8-.7-4.5z" />
    <path fill="#fff" d="M24 11.4h-8v2.5h7.7l-.7 7.3-5 1.4v2.6l7.3-2-.3-2.5-.7-6.8-.3-2.5z" />
  </svg>
);

const CSSIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <path fill="#1572B6" d="M5.9 27.5L4 6h24l-1.9 21.5L16 30l-10.1-2.5z" />
    <path fill="#33A9DC" d="M16 27.8V8H24l-1.6 18.2L16 27.8z" />
    <path fill="#fff" d="M8 11.4h16v2.5H10.6l.3 2.5h12.8l-.5 5-.2 2.5-7 1.9-7-1.9-.5-4.5h2.6l.2 2.5 4.7 1.2 4.7-1.2.5-5H8l-.2-2.5z" />
  </svg>
);

const JSIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect fill="#F7DF1E" width="32" height="32" rx="2" />
    <path d="M8.4 26.6l2.4-1.4c.5.8 1 1.5 2 1.5 1 0 1.7-.4 1.7-2v-10.4h2.9v10.5c0 3.3-2 4.8-4.8 4.8-2.6 0-4-1.3-4.8-2.9zm10.7-.4l2.4-1.4c.6 1 1.4 1.7 2.8 1.7 1.2 0 2-.6 2-1.4 0-1-.8-1.4-2.2-2l-.8-.3c-2.2-.9-3.6-2.1-3.6-4.6 0-2.3 1.8-4 4.5-4 2 0 3.4.7 4.4 2.4l-2.4 1.5c-.5-.9-1.1-1.3-2-1.3-.9 0-1.5.6-1.5 1.3 0 .9.6 1.3 1.9 1.9l.8.3c2.6 1.1 4 2.2 4 4.7 0 2.7-2.1 4.2-5 4.2-2.8 0-4.6-1.3-5.5-3.1z" />
  </svg>
);

const CppIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <path fill="#00599C" d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2z" />
    <path fill="#fff" d="M18.5 16h2v2h-2v2h-2v-2h-2v-2h2v-2h2v2zm6 0h2v2h-2v2h-2v-2h-2v-2h2v-2h2v2z" />
    <path fill="#fff" d="M11 10.3c-3.5 1.5-5.5 5-4.5 8.8.8 3 3.3 5.2 6.3 5.8 1.5.3 3 .1 4.4-.4l-2.8-4.9c-1.8.4-3.5-.6-4.1-2.3-.6-1.8.3-3.7 2-4.5 1.7-.8 3.8-.1 4.7 1.5l2.8-4.9c-2.6-1.4-5.8-1.2-8.8.9z" />
  </svg>
);

const ReactIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <circle cx="16" cy="16" r="2.5" fill="#61DAFB" />
    <g stroke="#61DAFB" fill="none" strokeWidth="1.5">
      <ellipse cx="16" cy="16" rx="10" ry="4" />
      <ellipse cx="16" cy="16" rx="10" ry="4" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="10" ry="4" transform="rotate(120 16 16)" />
    </g>
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <circle cx="16" cy="16" r="14" fill="#000" />
    <path fill="#fff" d="M22.5 8.5L13 22h-2l4.5-7.5L12 8.5h2l2.5 4.5L19 8.5h3.5zm-10 14l-4-7V8.5h2v7l2 3.5v3.5z" />
  </svg>
);

const FlutterIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <path fill="#02569B" d="M18.5 4L6 16.5l3.9 3.9L26 4H18.5zM18.5 17.5l-6.6 6.6L16 28l10-10L18.5 17.5z" />
    <path fill="#02569B" d="M11.9 24.1l3.9 3.9h8L16 20.2l-4.1 3.9z" opacity="0.7" />
  </svg>
);

const PythonIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <path fill="#3776AB" d="M15.9 2c-3 0-5.6.7-7.4 1.9-2.2 1.5-3.2 3.7-3.2 6.4v2.7h7.4v1H5.3C2.9 14 1 16.5 1 20.1c0 3.6 1.6 6.1 4.1 6.9 1 .3 2 .5 3.3.5h2.5v-3.4c0-2.4 2.1-4.5 4.6-4.5h7.4c2.3 0 4.1-1.9 4.1-4.2V8.3c0-2.2-1.9-4.1-4.3-4.8C21 2.6 18.5 2 15.9 2zm-4 3.2c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z" />
    <path fill="#FFD43B" d="M24 14v3.2c0 2.6-2.1 4.7-4.6 4.7h-7.4c-2.2 0-4.1 1.8-4.1 4.1v5.2c0 2.2 1.9 3.5 4.1 4.1 2.6.7 5.1.8 8.2 0 2.1-.6 4.1-1.7 4.1-4.1v-3.1h-8.2v-1h12.3c2.4 0 3.3-1.7 4.1-4.1.9-2.5.8-4.9 0-8.1-.6-2.3-1.7-4.1-4.1-4.1H24zm-4.6 14.2c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z" />
  </svg>
);

const techStack = [
  { name: 'HTML5', icon: <HTMLIcon />, color: '#E34F26', glow: 'rgba(227, 79, 38, 0.4)' },
  { name: 'CSS3', icon: <CSSIcon />, color: '#1572B6', glow: 'rgba(21, 114, 182, 0.4)' },
  { name: 'JavaScript', icon: <JSIcon />, color: '#F7DF1E', glow: 'rgba(247, 223, 30, 0.4)' },
  { name: 'C++', icon: <CppIcon />, color: '#00599C', glow: 'rgba(0, 89, 156, 0.4)' },
  { name: 'React', icon: <ReactIcon />, color: '#61DAFB', glow: 'rgba(97, 218, 251, 0.4)' },
  { name: 'Next.js', icon: <NextIcon />, color: '#808080', glow: 'rgba(128, 128, 128, 0.3)' },
  { name: 'Flutter', icon: <FlutterIcon />, color: '#02569B', glow: 'rgba(2, 86, 155, 0.4)' },
  { name: 'Python', icon: <PythonIcon />, color: '#3776AB', glow: 'rgba(55, 118, 171, 0.4)' },
];

const categories = [
  { name: 'Hackathons', icon: Code, description: 'Compete and collaborate' },
  { name: 'Events', icon: Calendar, description: 'Workshops & meetups' },
  { name: 'Competitions', icon: Trophy, description: 'Participate & win' }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingElements />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <AnimatedText>
            <motion.span
              className="inline-block px-6 py-2 bg-gradient-to-r from-secondary via-secondary to-muted text-foreground rounded-4xl text-sm font-medium mb-6 border border-border/50"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              ✨ Student Driven Community
            </motion.span>
          </AnimatedText>

          <AnimatedText delay={0.1}>
            <motion.h1
              className="text-5xl sm:text-6xl md:text-8xl font-extrabold mb-6 relative"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Flow Labs
              </span>
              <motion.span
                className="absolute -right-4 -top-4 text-2xl"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🚀
              </motion.span>
            </motion.h1>
          </AnimatedText>

          <AnimatedText delay={0.2}>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light">
              Search through thousands of jobs, connect with professionals, and build your future
            </p>
          </AnimatedText>

        </div>
      </section>

      {/* WhatsApp Community Button */}
      <WhatsAppButton inviteLink="https://chat.whatsapp.com/FS4EEpTWbUE3W9xJz0f1Dx" />

      {/* Tech Stack Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedText>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Popular Technologies
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.1}>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              Explore opportunities in the most in-demand technologies
            </p>
          </AnimatedText>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
            {techStack.map((tech, index) => (
              <AnimatedTechCard
                key={tech.name}
                name={tech.name}
                icon={tech.icon}
                color={tech.color}
                glowColor={tech.glow}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Banner Carousel Section */}
      <section className="hidden md:block py-12 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedText>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What's New
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.1}>
            <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
              Latest announcements and updates from Flow Labs
            </p>
          </AnimatedText>
          <BannerCarousel />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedText>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Explore Categories
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.1}>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              Find your next opportunity in various domains
            </p>
          </AnimatedText>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <StaggerItem key={category.name} className="h-full">
                <Link to={`/explore/${category.name.toLowerCase()}`} className="block h-full group focus:outline-none">
                  <motion.div
                    className="relative bg-white border-4 border-black rounded-3xl p-8 text-center h-full transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 overflow-hidden flex flex-col items-center justify-center"
                    whileTap={{
                      y: 8,
                      x: 8,
                      boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)',
                      transition: { duration: 0.1 }
                    }}
                  >
                    {/* Dynamic grid background */}
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-300"
                      style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
                        backgroundSize: '16px 16px',
                      }}
                    />

                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                      <motion.div
                        className="w-20 h-20 mb-6 bg-black text-white rounded-2xl flex items-center justify-center border-4 border-transparent group-hover:border-black group-hover:bg-white group-hover:text-black transition-colors duration-300 shadow-sm"
                        whileHover={{
                          rotate: [0, -10, 10, -10, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        <category.icon className="w-10 h-10" strokeWidth={2.5} />
                      </motion.div>

                      <h3 className="text-2xl font-black uppercase tracking-widest text-black mb-3">{category.name}</h3>
                      <div className="w-12 h-1 bg-black mb-4 mx-auto group-hover:w-full transition-all duration-500 ease-out" />
                      <p className="text-black/80 font-bold uppercase text-sm tracking-wider">{category.description}</p>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Community Showcase */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          {/* Card 1 */}
          <AnimatedSection>
            <motion.div
              className="flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden border border-border/50"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="md:w-1/2 h-64 md:h-80 bg-background flex items-center justify-center relative overflow-hidden p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={communityGroup}
                  alt="Community collaboration"
                  className="relative z-10 max-h-full max-w-full object-contain"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
              <div className="md:w-1/2 p-8 md:p-12 bg-pink-50/50 dark:bg-pink-950/20">
                <motion.h3
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Collaborative Environment
                </motion.h3>
                <motion.p
                  className="text-muted-foreground text-lg leading-relaxed"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Work alongside talented individuals from around the world. Share ideas, get feedback, and grow together in a supportive community that values innovation and creativity.
                </motion.p>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Card 2 - Reversed */}
          <AnimatedSection delay={0.2}>
            <motion.div
              className="flex flex-col md:flex-row-reverse items-stretch rounded-3xl overflow-hidden border border-border/50"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="md:w-1/2 h-64 md:h-80 bg-background flex items-center justify-center relative overflow-hidden p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={impactPuzzle}
                  alt="Impact and collaboration"
                  className="relative z-10 max-h-full max-w-full object-contain"
                  animate={{
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
              <div className="md:w-1/2 p-8 md:p-12 bg-orange-50/50 dark:bg-orange-950/20">
                <motion.h3
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Real-World Impact
                </motion.h3>
                <motion.p
                  className="text-muted-foreground text-lg leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Build projects that matter. Our community has shipped products used by thousands, contributed to open source, and launched successful startups together.
                </motion.p>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Community Partners Section */}
      <PartnersMarquee />

      {/* Get in Touch Section */}
      <GetInTouch />

      <Footer />
    </div>
  );
};

export default Home;
