
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Opportunity {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    image_url: string;
    link_url: string;
}

const CategoryPage = () => {
    const { category } = useParams();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    // Capitalize category for display (e.g., "hackathons" -> "Hackathons")
    const displayCategory = category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : 'Opportunities';

    useEffect(() => {
        fetchOpportunities();
    }, [category]);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('opportunities' as any)
                .select('*')
                .eq('is_active', true)
                // Match category case-insensitive if needed, but best to match exact Enum from DB
                // Our DB enum is 'Hackathons', 'Events', 'Competitions', 'Networking'
                // The URL param might be lower case 'hackathons'
                .ilike('category', category || '')
                .order('date', { ascending: true });

            if (error) throw error;
            setOpportunities((data as unknown as Opportunity[]) || []);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <FloatingElements />
            <Navbar />

            <main className="pt-32 pb-20 px-6 relative z-10 max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {displayCategory}
                    </motion.h1>
                    <motion.p
                        className="text-xl text-muted-foreground max-w-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Explore upcoming {displayCategory.toLowerCase()} and seize the opportunity to grow, connect, and innovate.
                    </motion.p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 rounded-3xl bg-secondary/30 animate-pulse" />
                        ))}
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl bg-secondary/10 border border-border/50">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-2xl font-bold mb-2">No Upcoming {displayCategory}</h3>
                        <p className="text-muted-foreground">Check back later for new updates!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {opportunities.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 flex flex-col h-full hover:shadow-2xl transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                {/* Image */}
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <img
                                        src={item.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full backdrop-blur-sm">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center text-sm text-muted-foreground gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(item.date), 'MMM d, yyyy')}
                                                </span>
                                                {item.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {item.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground mb-6 line-clamp-3 flex-1">
                                        {item.description}
                                    </p>

                                    {/* Actions */}
                                    <a
                                        href={item.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors w-full"
                                    >
                                        {['Events', 'Competitions'].includes(item.category) ? 'View more' : 'Register Now'}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CategoryPage;
