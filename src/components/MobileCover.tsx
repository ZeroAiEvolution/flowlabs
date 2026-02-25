import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Smartphone, Apple, Play, ArrowRight, Laptop2 } from 'lucide-react';

const MobileCover = () => {
    const [showCover, setShowCover] = useState(false);
    const [hasDismissed, setHasDismissed] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Show only on mobile screens (less than 768px wide)
            if (window.innerWidth < 768 && !hasDismissed) {
                setShowCover(true);
            } else {
                setShowCover(false);
            }
        };

        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [hasDismissed]);

    const handleContinue = () => {
        setHasDismissed(true);
        setShowCover(false);
    };

    return (
        <AnimatePresence>
            {showCover && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl overflow-hidden px-6"
                >
                    {/* Animated Background Elements */}
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            rotate: [360, 0],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px]"
                    />

                    <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
                        {/* App Icon / Logo Animation */}
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                            className="w-24 h-24 bg-gradient-to-tr from-primary to-foreground rounded-3xl flex items-center justify-center shadow-2xl mb-8"
                        >
                            <Smartphone className="w-12 h-12 text-background" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-4xl font-extrabold tracking-tight mb-4"
                        >
                            Coming to Mobile
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-lg text-muted-foreground mb-8 leading-relaxed"
                        >
                            The official Flow Labs application will soon be available on the{' '}
                            <span className="font-semibold text-foreground">App Store</span> and{' '}
                            <span className="font-semibold text-foreground">Google Play</span>.
                        </motion.p>

                        {/* Store Badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="flex gap-4 mb-12"
                        >
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/80 rounded-xl text-sm font-medium border border-border/50 shadow-sm opacity-80 backdrop-blur-md">
                                <Apple className="w-5 h-5 fill-current" /> App Store
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/80 rounded-xl text-sm font-medium border border-border/50 shadow-sm opacity-80 backdrop-blur-md">
                                <Play className="w-5 h-5 fill-current" /> Google Play
                            </div>
                        </motion.div>

                        {/* Recommendations */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="w-full bg-secondary/50 border border-border/50 rounded-2xl p-5 mb-8 backdrop-blur-sm"
                        >
                            <Laptop2 className="w-8 h-8 mx-auto text-primary mb-3" />
                            <h3 className="font-semibold mb-1">Desktop Recommended</h3>
                            <p className="text-sm text-muted-foreground">
                                For the best experience right now, we highly recommend switching to a PC or laptop display.
                            </p>
                        </motion.div>

                        {/* Continue Action */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="w-full"
                        >
                            <Button
                                onClick={handleContinue}
                                variant="outline"
                                size="lg"
                                className="w-full h-14 rounded-2xl text-base font-medium group transition-all hover:bg-foreground hover:text-background border-border/60 bg-background/50 backdrop-blur-sm"
                            >
                                Continue on Web
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileCover;
