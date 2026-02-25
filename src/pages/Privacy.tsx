import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-24 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-12 text-lg">Last Updated: February 25, 2026</p>

                    <div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
                            <p>
                                When you sign in and become a member of the Flow Labs community, we collect necessary information to provide and improve our services. This includes:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li><strong className="text-foreground">Account Data:</strong> Your email address, full name, and authentication details (stored securely via our authentication provider).</li>
                                <li><strong className="text-foreground">Profile Information:</strong> Any details you choose to add to your user profile, such as your bio, profession, avatar, and social links.</li>
                                <li><strong className="text-foreground">Application Data:</strong> Information you submit to the platform, such as network connection requests, messages to other users, or help desk inquiries.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Data</h2>
                            <p>
                                Flow Labs uses your data strictly to facilitate the community platform. We use your information to:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Create and secure your member account.</li>
                                <li>Display your public profile to other verified members of the Flow Labs network.</li>
                                <li>Process your connection requests and deliver user-to-user messages.</li>
                                <li>Provide administrative and customer support when requested.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Security and Third Parties</h2>
                            <p>
                                Flow Labs takes data security seriously. We utilize secure, industry-standard infrastructure (such as Supabase) to encrypt and store your data.
                            </p>
                            <p className="mt-4">
                                <strong className="text-foreground">We do not sell your personal data to advertisers or third parties.</strong> Your public profile information is only visible to other members of the community, and your private messages are securely handled between you and the recipient.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">4. Community Liability Disclaimer</h2>
                            <p>
                                While we strive to protect your data, no method of electronic storage or transmission is 100% secure. By signing in, you acknowledge that Flow Labs cannot guarantee absolute data security. Furthermore, Flow Labs is not liable or responsible for the data or information you voluntarily choose to share publicly on your profile or directly with other users in the community.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Control Over Data</h2>
                            <p>
                                You have the right to access, edit, or delete the personal information on your profile at any time. Administrative functionality ensures that users can be removed from the system permanently if requested. To request full account deletion, please use the Help section to contact an administrator.
                            </p>
                        </section>

                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Privacy;
