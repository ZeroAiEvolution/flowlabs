import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const Content = () => {

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col font-sans selection:bg-black selection:text-white">
      <Navbar />

      {/* Infinite scrolling grid background */}
      <motion.div
        className="absolute inset-x-0 inset-y-[-100%] z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(90deg, black 1px, transparent 0), linear-gradient(180deg, black 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
        animate={{ y: ["0%", "40px"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Top Marquee */}
      <div className="absolute top-24 md:top-32 left-0 w-full overflow-hidden bg-black text-white py-2 z-10 border-y-4 border-black transform -rotate-2">
        <motion.div
          className="flex whitespace-nowrap text-xl font-black uppercase tracking-widest gap-8"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {Array(20).fill("STAY TUNED • WORK IN PROGRESS • ").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-40 min-h-[80vh]">
        <div className="max-w-5xl mx-auto text-center relative mt-24 md:mt-32">

          <div className="relative z-20 mb-12">
            {/* Glitch layered text effect */}
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter text-black leading-[0.85] select-none"
            >
              Coming <br />
              <div className="relative inline-block mt-4">
                Soon
                {/* Decorative underline */}
                <motion.div
                  className="absolute -bottom-4 md:-bottom-8 left-0 w-full h-4 md:h-8 bg-black origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "circOut" }}
                />
              </div>
            </motion.h1>

            {/* Outline ghost text behind */}
            <motion.h1
              initial={{ x: -20, y: 70, opacity: 0 }}
              animate={{ x: -20, y: 20, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-0 left-0 w-full text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] text-transparent [-webkit-text-stroke:2px_rgba(0,0,0,0.2)] select-none pointer-events-none -z-10"
              style={{ paddingLeft: '20px' }}
            >
              Coming <br /><span className="mt-4 block">Soon</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-xl md:text-2xl lg:text-3xl text-black font-bold max-w-2xl mx-auto mb-16 uppercase tracking-wider relative z-20 bg-white/80 backdrop-blur-sm inline-block p-4 border-2 border-black border-dashed"
          >
            We are building something massive.
          </motion.p>
          <br />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="relative z-20 inline-block"
          >
            <Button
              size="lg"
              className="h-20 px-12 rounded-2xl border-4 border-black bg-black text-white hover:bg-white hover:text-black hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-2 transition-all duration-300 text-xl font-black uppercase tracking-[0.2em] group"
              onClick={() => window.history.back()}
            >
              Return to Base
              <motion.span
                className="ml-4 inline-block"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </Button>
          </motion.div>

        </div>
      </main>

      {/* Floating brutalist wireframes */}
      <motion.div
        className="absolute top-1/3 left-[5%] md:left-[10%] w-32 h-32 md:w-48 md:h-48 border-8 border-black opacity-20 pointer-events-none z-10"
        style={{ perspective: 1000 }}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
          y: [-20, 20, -20]
        }}
        transition={{
          rotateX: { duration: 20, repeat: Infinity, ease: "linear" },
          rotateY: { duration: 25, repeat: Infinity, ease: "linear" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-[5%] md:right-[15%] w-24 h-24 md:w-32 md:h-32 border-[6px] border-black rounded-full border-dashed opacity-30 pointer-events-none z-10"
        animate={{
          rotate: [0, -360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      <Footer />
    </div>
  );
};

export default Content;
