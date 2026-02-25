import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { MessageCircle, Users, ArrowRight, Copy } from 'lucide-react';

interface WhatsAppButtonProps {
  inviteLink?: string;
}

const WhatsAppButton = ({ inviteLink = 'https://chat.whatsapp.com/FS4EEpTWbUE3W9xJz0f1Dx' }: WhatsAppButtonProps) => {
  const safeInviteLink = inviteLink?.startsWith('https://') ? inviteLink : '';

  const handleCopy = async () => {
    if (!safeInviteLink) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeInviteLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = safeInviteLink;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      toast('Invite link copied');
    } catch {
      toast('Copy failed. Please copy the link from the button and paste it into WhatsApp.');
    }
  };

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-green-600 p-8 md:p-12"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0"
              >
                <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 md:mb-1">
                  Join Our WhatsApp Community
                </h3>
                <p className="text-white/80 flex flex-col sm:flex-row items-center gap-2 text-sm sm:text-base">
                  <Users className="w-4 h-4 hidden sm:block" />
                  Connect with 5000+ students and professionals
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0"
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-green-600 hover:bg-white/90 rounded-4xl px-8 py-6 text-base md:text-lg font-semibold shadow-lg group w-full sm:w-auto"
              >
                <a
                  href={safeInviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our WhatsApp community"
                >
                  Join Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleCopy}
                disabled={!safeInviteLink}
                className="rounded-4xl px-8 py-6 text-base md:text-lg font-semibold w-full sm:w-auto"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy Link
              </Button>
            </motion.div>
          </div>

          {/* Floating WhatsApp icons */}
          <motion.div
            className="absolute top-4 right-20 opacity-20"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-20 opacity-20"
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatsAppButton;
