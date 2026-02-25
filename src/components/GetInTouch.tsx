import { motion } from 'framer-motion';
import { Mail, Linkedin, Instagram, Youtube, ArrowUpRight } from 'lucide-react';

// Custom WhatsApp icon since lucide doesn't have it
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-8 h-8"}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-8 h-8"}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const contactCards = [
  {
    name: 'Email',
    icon: Mail,
    description: 'Reach out for collaborations, support, or just to say hello.',
    cta: 'Contact Us',
    url: 'mailto:contact@example.com',
    color: '#EA4335',
    gradient: 'from-red-500/10 to-orange-500/10',
  },
  {
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    description: 'Join our active community chat for instant updates.',
    cta: 'Join Community',
    url: 'https://chat.whatsapp.com/FS4EEpTWbUE3W9xJz0f1Dx',
    color: '#25D366',
    gradient: 'from-green-500/10 to-emerald-500/10',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    description: 'Expand your professional network and connect.',
    cta: 'Connect Now',
    url: 'https://linkedin.com/',
    color: '#0A66C2',
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    description: 'See behind-the-scenes content and stories.',
    cta: 'Follow Us',
    url: 'https://instagram.com/',
    color: '#E4405F',
    gradient: 'from-pink-500/10 to-purple-500/10',
  },
  {
    name: 'X (Twitter)',
    icon: XIcon,
    description: 'Follow us for quick updates and community news.',
    cta: 'Follow Us',
    url: 'https://x.com/',
    color: '#000000',
    gradient: 'from-gray-500/10 to-gray-800/10',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    description: 'Dive into workshops, tutorials, and recaps.',
    cta: 'Subscribe',
    url: 'https://youtube.com/',
    color: '#FF0000',
    gradient: 'from-red-500/10 to-rose-500/10',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const GetInTouch = () => {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, hsl(var(--foreground)) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block px-6 py-2 bg-gradient-to-r from-secondary via-muted to-secondary text-foreground rounded-4xl text-sm font-medium mb-4 border border-border/50"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            💬 Connect With Us
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We'd love to hear from you. Reach out through any of these channels.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {contactCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <motion.a
                key={card.name}
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-gradient-to-br ${card.gradient} backdrop-blur-sm rounded-2xl p-3 md:p-6 border-2 flex flex-col items-center text-center overflow-hidden`}
                style={{ borderColor: `${card.color}20` }}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated glow on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at center, ${card.color}15 0%, transparent 70%)`,
                  }}
                />

                {/* Border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    border: `2px solid ${card.color}`,
                    boxShadow: `0 0 25px ${card.color}30`,
                  }}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: `linear-gradient(105deg, transparent 40%, ${card.color}08 50%, transparent 60%)`,
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

                {/* Icon */}
                <motion.div
                  className="mb-2 md:mb-4 relative z-10"
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.4 }
                  }}
                >
                  {typeof IconComponent === 'function' && (IconComponent.name === 'WhatsAppIcon' || IconComponent.name === 'XIcon') ? (
                    <IconComponent className="w-5 h-5 md:w-8 md:h-8" style={{ color: card.color }} />
                  ) : (
                    <IconComponent className="w-5 h-5 md:w-8 md:h-8" style={{ color: card.color }} />
                  )}
                </motion.div>

                <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-3 relative z-10 line-clamp-1">{card.name}</h3>

                <p className="text-muted-foreground text-[10px] md:text-sm mb-3 md:mb-6 flex-grow relative z-10 line-clamp-2 md:line-clamp-none leading-tight md:leading-normal">
                  {card.description}
                </p>

                <motion.div
                  className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm font-medium text-foreground relative z-10 uppercase tracking-widest break-words"
                  whileHover={{ gap: '0.5rem' }}
                >
                  <span className="line-clamp-2 text-center">{card.cta}</span>
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </motion.div>

                {/* Corner accents */}
                <div
                  className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ borderColor: card.color }}
                />
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ borderColor: card.color }}
                />
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default GetInTouch;
