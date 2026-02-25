import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTechCardProps {
  name: string;
  icon: ReactNode;
  color: string;
  glowColor: string;
  index: number;
}

const AnimatedTechCard = ({ name, icon, color, glowColor, index }: AnimatedTechCardProps) => {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {/* Floating animation wrapper */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3 + index * 0.3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.2,
        }}
      >
        <motion.div
          className="relative bg-gradient-to-br from-card via-card to-secondary/50 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center gap-3 md:gap-2 overflow-hidden"
          style={{
            border: `2px solid ${color}20`,
            boxShadow: `0 4px 20px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
          whileHover={{
            scale: 1.1,
            y: -12,
            transition: { duration: 0.2, ease: 'easeOut' }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Background gradient glow */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`,
            }}
          />

          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              border: `2px solid ${color}`,
              boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`,
            }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${color}10 50%, transparent 60%)`,
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Icon with glow */}
          <motion.div
            className="relative w-16 h-16 md:w-14 md:h-14 lg:w-10 lg:h-10 flex items-center justify-center z-10"
            whileHover={{
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.4 }
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"
              style={{ backgroundColor: color }}
            />
            {icon}
          </motion.div>

          {/* Name with gradient on hover */}
          <motion.span
            className="relative font-semibold text-sm lg:text-xs z-10 transition-colors duration-300"
            style={{
              textShadow: 'none',
            }}
          >
            {name}
          </motion.span>

          {/* Corner accents */}
          <div
            className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ borderColor: color }}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ borderColor: color }}
          />
        </motion.div>
      </motion.div>

      {/* Reflection effect */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

export default AnimatedTechCard;
