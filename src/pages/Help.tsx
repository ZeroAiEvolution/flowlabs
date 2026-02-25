import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { HeartHandshake, Loader2, Send } from 'lucide-react';

const Help = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.type) {
            toast.error('Please select a request type');
            return;
        }
        if (!formData.message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await (supabase as any)
                .from('help_requests')
                .insert({
                    user_id: user.id,
                    type: formData.type,
                    message: formData.message.trim()
                });

            if (error) throw error;

            toast.success('Your request has been sent! Our team will reach out soon.');
            setFormData({ type: '', message: '' });
        } catch (error: any) {
            console.error('Error submitting help request:', error);
            toast.error(error.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />

            {/* Decorative Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl mix-blend-multiply" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl mix-blend-multiply" />
            </div>

            <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <HeartHandshake className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">How Can We Help You?</h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Whether you need career guidance, stress relief, motivation, or technical support, we're here for you. Drop us a message below.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-card border border-border shadow-xl rounded-3xl p-6 md:p-10"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">What do you need help with?</label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger className="h-14 bg-background rounded-xl border-border px-4 text-base">
                                    <SelectValue placeholder="Select a topic..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border">
                                    <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                                    <SelectItem value="Stress Relief">Stress Relief</SelectItem>
                                    <SelectItem value="Motivation">Motivation</SelectItem>
                                    <SelectItem value="Technical Help">Technical Help</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Your Message</label>
                            <Textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Tell us what's on your mind... (We read these carefully)"
                                className="min-h-[160px] resize-none bg-background rounded-xl border-border p-4 text-base"
                                maxLength={2000}
                            />
                            <div className="text-xs text-muted-foreground text-right">
                                {formData.message.length} / 2000
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !formData.type || !formData.message.trim()}
                            className="w-full h-14 rounded-xl text-lg font-medium shadow-md transition-all hover:scale-[1.02]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send Request
                                    <Send className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Help;
