import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import { Target, Lightbulb, Heart, Rocket, Award, ArrowUpRight, Code, Network, UsersRound } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useRef, MouseEvent, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Subcomponent for 3D Tilt Effect
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      <div
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
        className="w-full h-full relative z-10"
      >
        {children}
      </div>
    </motion.div>
  );
};

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const [memberCount, setMemberCount] = useState<number | string>("10K+");
  const [projectCount, setProjectCount] = useState<number | string>("50+");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch community members count (professionals + students)
        const { count: membersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('profession', ['student', 'professional', 'Student', 'Professional']);

        if (membersCount !== null) {
          setMemberCount(membersCount);
        }

        // Fetch live projects count
        const { count: projCount } = await supabase
          .from('student_projects')
          .select('*', { count: 'exact', head: true });

        if (projCount !== null) {
          setProjectCount(projCount);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const heroY = useTransform(heroProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const textScale = useTransform(heroProgress, [0, 1], [1, 0.9]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 1 } }
  };

  // Hero Spotlight Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleHeroMouseMove = ({ clientX, clientY, currentTarget }: MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-foreground selection:text-background" ref={containerRef}>
      <FloatingElements />
      <Navbar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-[90vh] group overflow-hidden"
      >
        {/* Dynamic Spotlight */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                800px circle at ${mouseX}px ${mouseY}px,
                rgba(0, 0, 0, 0.04),
                transparent 80%
              )
            `,
          }}
        />

        {/* Spotlight for dark mode */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-0 dark:block hidden"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                800px circle at ${mouseX}px ${mouseY}px,
                rgba(255, 255, 255, 0.05),
                transparent 80%
              )
            `,
          }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity, scale: textScale }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.span
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-2 border border-foreground/20 bg-background/50 backdrop-blur-md text-foreground rounded-full text-sm font-semibold tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors duration-500 cursor-none"
            >
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Inside Flow Labs
            </motion.span>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-foreground relative"
            >
              WE BUILD  <br />
              <span className="relative inline-block glitch" data-text="THE FUTURE">
                THE FUTURE
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-3xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
            >
              A nexus where raw talent meets real-world execution. We exist to accelerate ambitious builders.
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground rotate-90 mb-4 block">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-foreground/50 to-transparent overflow-hidden relative">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-1/2 bg-foreground"
            />
          </div>
        </motion.div>
      </section>

      {/* Grid Layout Section - Mission & Vision */}
      <section className="py-32 px-6 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]"
          >
            {/* Main Mission Block */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-8 bg-card border border-foreground/10 p-10 md:p-14 rounded-3xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-foreground/[0.05] group-hover:scale-150 transition-all duration-1000" />

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex justify-between items-start mb-10 relative z-10"
              >
                <Target className="w-12 h-12 text-foreground" strokeWidth={1.5} />
                <span className="text-5xl font-black text-foreground/5 transition-colors duration-500 group-hover:text-foreground/10">01</span>
              </motion.div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight group-hover:tracking-tighter transition-all duration-500">The Mission</h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl font-light">
                  To relentlessly eliminate the gap between academia and industry. We architect an environment where sheer potential is transformed into undeniable expertise through intense collaboration and real stakes.
                </p>
              </div>
            </motion.div>

            {/* Vision Block */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-4 bg-foreground text-background p-10 rounded-3xl group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-start mb-8 relative z-10"
              >
                <Lightbulb className="w-10 h-10 text-background" strokeWidth={1.5} />
                <span className="text-4xl font-black text-background/20 group-hover:text-background/40 transition-colors duration-500">02</span>
              </motion.div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">The Vision</h2>
                <p className="text-background/80 leading-relaxed font-light">
                  A self-sustaining ecosystem of top-tier talent, dictating the pace of innovation rather than following it.
                </p>
              </div>
            </motion.div>

            {/* Metrics/Stats style blocks */}
            <TiltCard className="md:col-span-4 group cursor-crosshair">
              <div className="h-full border border-foreground/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center bg-card hover:bg-foreground hover:text-background transition-colors duration-500 overflow-hidden relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay transition-opacity duration-500" />
                <h3 className="text-6xl font-black mb-2 tracking-tighter" style={{ transform: "translateZ(30px)" }}>{memberCount}</h3>
                <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground group-hover:text-background/70 transition-colors duration-500" style={{ transform: "translateZ(20px)" }}>Community Members</p>
              </div>
            </TiltCard>

            <TiltCard className="md:col-span-4 group cursor-crosshair">
              <div className="h-full border border-foreground/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center bg-card hover:bg-foreground hover:text-background transition-colors duration-500 overflow-hidden relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay transition-opacity duration-500" />
                <h3 className="text-6xl font-black mb-2 tracking-tighter" style={{ transform: "translateZ(30px)" }}>{projectCount}</h3>
                <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground group-hover:text-background/70 transition-colors duration-500" style={{ transform: "translateZ(20px)" }}>Live Projects</p>
              </div>
            </TiltCard>

            <motion.div variants={itemVariants} className="md:col-span-4 border border-foreground/10 flex items-center justify-center rounded-3xl p-8 group overflow-hidden relative cursor-none hover:bg-foreground transition-colors duration-500">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-4xl font-black group-hover:text-background transition-colors z-10 mr-4"
              >
                Join Us
              </motion.span>
              <ArrowUpRight className="w-10 h-10 group-hover:text-background transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500 z-10" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay transition-opacity duration-500" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values / Marquee */}
      <section className="py-32 overflow-hidden border-y border-foreground/10 bg-foreground/5 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="flex whitespace-nowrap overflow-hidden py-4 relative z-10">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            className="flex items-center gap-16 text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text"
            style={{ WebkitTextStroke: '2px hsl(var(--foreground) / 0.8)' }}
          >
            <span className="hover:text-foreground transition-colors duration-300">Relentless</span> •
            <span className="hover:text-foreground transition-colors duration-300">Innovative</span> •
            <span className="hover:text-foreground transition-colors duration-300">Community-Driven</span> •
            <span className="hover:text-foreground transition-colors duration-300">Audacious</span> •
            <span className="hover:text-foreground transition-colors duration-300">Relentless</span> •
            <span className="hover:text-foreground transition-colors duration-300">Innovative</span> •
            <span className="hover:text-foreground transition-colors duration-300">Community-Driven</span> •
            <span className="hover:text-foreground transition-colors duration-300">Audacious</span> •
          </motion.div>
        </div>
        {/* Inverse direction marquee */}
        <div className="flex whitespace-nowrap overflow-hidden py-4 relative z-10 mt-4">
          <motion.div
            animate={{ x: [-1000, 0] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex items-center gap-16 text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text"
            style={{ WebkitTextStroke: '1px hsl(var(--foreground) / 0.3)' }}
          >
            <span className="hover:text-foreground transition-colors duration-300">Build Fast</span> •
            <span className="hover:text-foreground transition-colors duration-300">Break Things</span> •
            <span className="hover:text-foreground transition-colors duration-300">Ship Daily</span> •
            <span className="hover:text-foreground transition-colors duration-300">Scale Up</span> •
            <span className="hover:text-foreground transition-colors duration-300">Build Fast</span> •
            <span className="hover:text-foreground transition-colors duration-300">Break Things</span> •
            <span className="hover:text-foreground transition-colors duration-300">Ship Daily</span> •
            <span className="hover:text-foreground transition-colors duration-300">Scale Up</span> •
          </motion.div>
        </div>
      </section>

      {/* What We Offer - Interactive 3D Grid */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 relative inline-block">
                The Arsenal
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-foreground transform origin-left scale-x-0 transition-transform duration-500 hover:scale-x-100" />
              </h2>
              <p className="text-xl text-muted-foreground w-full md:w-2/3">Equipping you with the tools needed to dominate the tech landscape.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-[1000px]">
            {[
              { icon: Code, title: 'Real Projects', desc: 'No toy apps. Build scalable systems that solve actual problems.' },
              { icon: UsersRound, title: 'Elite Mentorship', desc: 'Direct access to senior engineers who have shipped at scale.' },
              { icon: Network, title: 'Global Network', desc: 'Connect with a curated group of high-agency builders.' },
              { icon: Heart, title: 'Community Support', desc: 'A culture that celebrates wins and dissects failures together.' },
              { icon: Rocket, title: 'Career Acceleration', desc: 'Skip the line with direct pipeline opportunities.' },
              { icon: Award, title: 'Recognized Excellence', desc: 'Certificates and proof-of-work that actually matter.' },
            ].map((item, index) => (
              <TiltCard key={item.title} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group h-full p-8 border border-foreground/10 rounded-[2rem] bg-card hover:bg-foreground hover:text-background transition-all duration-500 ease-out cursor-none relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay transition-opacity duration-500" />

                  <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
                    <item.icon className="w-12 h-12 mb-8 text-foreground group-hover:text-background transition-colors duration-500 transform group-hover:scale-110 group-hover:rotate-12" strokeWidth={1.5} />
                    <h3 className="text-3xl font-bold mb-4 tracking-tight">{item.title}</h3>
                  </div>

                  <p style={{ transform: "translateZ(20px)" }} className="text-muted-foreground group-hover:text-background/80 transition-colors duration-500 font-light leading-relaxed relative z-10 text-lg">
                    {item.desc}
                  </p>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500 z-10">
                    <ArrowUpRight className="w-8 h-8 text-background/50" />
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
