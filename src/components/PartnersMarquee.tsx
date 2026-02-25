import { motion } from 'framer-motion';
import marwadiLogo from '@/assets/partners/marwadi-university.png';
import roboticsLogo from '@/assets/partners/robotics-club.png';
import mindLabLogo from '@/assets/partners/mind-lab.png';
import intellifyLogo from '@/assets/partners/intellify.png';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const initialPartners = [
  { name: 'Marwadi University', logo: marwadiLogo, url: 'https://www.marwadiuniversity.ac.in/' },
  { name: 'Robotics Club', logo: roboticsLogo, url: 'https://murobotics.marwadiuniversity.ac.in/' },
  { name: 'Mind Lab', logo: mindLabLogo, url: null },
  { name: 'Intellify', logo: intellifyLogo, url: 'https://www.intellify.marwadiuniversity.ac.in/' },
];

const PartnersMarquee = () => {
  const [partners, setPartners] = useState(initialPartners);

  useEffect(() => {
    const fetchPartners = async () => {
      const { data } = await supabase
        .from('community_partners' as any)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setPartners(data.map((p: any) => ({
          name: p.name,
          logo: p.logo_url,
          url: p.website_url
        })));
      }
    };

    fetchPartners();
  }, []);

  return (
    <section className="py-20 px-6 overflow-hidden relative">
      {/* Background decoration */}
      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, hsl(var(--foreground)) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-6xl mx-auto text-center mb-12 relative z-10">
        <motion.span
          className="inline-block px-6 py-2 bg-gradient-to-r from-secondary via-muted to-secondary text-foreground rounded-4xl text-sm font-medium mb-4 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          🤝 Trusted Partnerships
        </motion.span>
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Our Community Partners
        </motion.h2>
        <motion.p
          className="text-muted-foreground max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Collaborating with leading institutions and organizations to empower students
        </motion.p>
      </div>

      {/* Marquee Container */}
      <div className="relative max-w-6xl mx-auto overflow-hidden">
        {/* Gradient Overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track - Two identical sets side by side */}
        <div className="flex">
          <div className="flex animate-marquee">
            {partners.map((partner, index) => (
              <motion.div
                key={`set1-${partner.name}-${index}`}
                className="flex-shrink-0 mx-8"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {partner.url ? (
                  <motion.a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gradient-to-br from-card to-secondary/50 backdrop-blur-sm rounded-2xl p-8 w-96 h-44 flex items-center justify-center cursor-pointer border border-border/50 overflow-hidden group"
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      }}
                    />
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-32 max-w-full object-contain transition-transform duration-300 group-hover:scale-110 relative z-10"
                    />
                  </motion.a>
                ) : (
                  <div className="bg-gradient-to-br from-card to-secondary/50 backdrop-blur-sm rounded-2xl p-8 w-96 h-44 flex items-center justify-center border border-border/50">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-32 max-w-full object-contain transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="flex animate-marquee">
            {partners.map((partner, index) => (
              <motion.div
                key={`set2-${partner.name}-${index}`}
                className="flex-shrink-0 mx-8"
              >
                {partner.url ? (
                  <motion.a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gradient-to-br from-card to-secondary/50 backdrop-blur-sm rounded-2xl p-8 w-96 h-44 flex items-center justify-center cursor-pointer border border-border/50 overflow-hidden group"
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      }}
                    />
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-32 max-w-full object-contain transition-transform duration-300 group-hover:scale-110 relative z-10"
                    />
                  </motion.a>
                ) : (
                  <div className="bg-gradient-to-br from-card to-secondary/50 backdrop-blur-sm rounded-2xl p-8 w-96 h-44 flex items-center justify-center border border-border/50">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-32 max-w-full object-contain transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Names Floating */}
      <motion.div
        className="flex justify-center gap-4 mt-8 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {partners.map((partner, index) => (
          <motion.span
            key={partner.name}
            className="px-4 py-2 bg-gradient-to-r from-secondary/50 to-muted/50 backdrop-blur-sm rounded-4xl text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default border border-border/50"
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.2 }
            }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            {partner.name}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
};

export default PartnersMarquee;
