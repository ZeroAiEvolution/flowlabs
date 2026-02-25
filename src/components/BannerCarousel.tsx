import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
}

const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners' as any)
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setBanners((data as unknown as Banner[]) || []);
    }
    setLoading(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (linkUrl: string | null) => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 md:h-64 lg:h-80 bg-muted animate-pulse rounded-3xl" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl md:rounded-3xl">
      <div className="relative h-56 md:h-80 lg:h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => handleBannerClick(banners[currentIndex]?.link_url)}
          >
            <img
              src={banners[currentIndex]?.image_url}
              alt={banners[currentIndex]?.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for better text readability if needed, though most banners are images */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden" />
          </motion.div>
        </AnimatePresence>
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </Button>

          <div className="absolute bottom-4 right-6 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;