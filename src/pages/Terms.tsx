import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const Terms = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-24 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Terms of Service</h1>
                    <p className="text-muted-foreground mb-12 text-lg">Last Updated: February 25, 2026</p>

                    <div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms & Membership</h2>
                            <p>
                                By accessing, registering, or signing into Flow Labs (the "Platform"), you agree to be bound by these Terms of Service.
                                <strong className="text-foreground"> By signing in to Flow Labs, you officially become a member of the Flow Labs community.</strong>
                                If you do not agree to these terms, please do not use or access our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">2. User Conduct & Responsibilities</h2>
                            <p>
                                As a member, you agree to use the Platform only for lawful purposes. You are solely responsible for all content, messages, and materials ("User Content") you upload, post, or distribute on the Platform.
                                Flow Labs strictly prohibits the harassment of other members, the distribution of malicious software, and the posting of unlawful, defamatory, or obscene material.
                            </p>
                            <p className="mt-4">
                                Flow Labs reserves the right to suspend, terminate, or block any member account that violates these guidelines, without prior notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">3. Limitation of Liability and "As-Is" Provision</h2>
                            <p>
                                Flow Labs is provided on an <strong className="text-foreground">"AS IS" and "AS AVAILABLE"</strong> basis. To the maximum extent permitted by law, Flow Labs and its creators, administrators, and affiliates disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                            </p>
                            <p className="mt-4">
                                <strong className="text-foreground">Under no circumstances shall the Flow Labs community, its developers, or its administrators be held liable</strong> for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Platform, including any damages resulting from reliance on any information obtained from the Platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">4. Indemnification</h2>
                            <p>
                                By becoming a member, you agree to indemnify, defend, and hold harmless Flow Labs, its developers, administrators, and the community at large from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with your access to or use of the Platform, or your violation of these Terms of Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">5. Modifications to the Service and Terms</h2>
                            <p>
                                Flow Labs reserves the right to modify, suspend, or discontinue any part of the service at any time without notice. Furthermore, we may revise these Terms of Service at any time. By continuing to access or use the Platform after those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
                            <p>
                                If you have any questions, concerns, or disputes regarding these Terms of Service, please reach out to us via the Help section on the Platform.
                            </p>
                        </section>

                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Terms;
