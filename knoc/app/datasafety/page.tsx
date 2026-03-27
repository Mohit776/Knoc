"use client";
import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function DataSafetyPage() {
    const effectiveDate = "March 27, 2026";

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-purple-100 flex flex-col">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-[1000px] mx-auto px-6 py-12 md:py-20 grow">
                <h1 className="text-3xl font-bold text-center mb-16 tracking-tight text-black">Data Safety & Privacy Policy</h1>

                <div className="space-y-10 text-[14.5px] leading-relaxed text-[#2c2c2c]">
                    {/* Intro Section */}
                    <section>
                        <p className="mb-4">Effective Date: {effectiveDate}</p>
                        <p className="mb-6">
                            At <strong>Trueknoc</strong>, we value your privacy and are committed to protecting your personal information. This Data Safety Policy explains what data we collect, how we use it, and how we keep it secure.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-6 uppercase">1. Information We Collect</h2>
                        
                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.1 Location Data</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold mb-1">Approximate Location:</p>
                                    <p>We may collect general location data (city-level) to enhance service availability and user experience.</p>
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Precise Location:</p>
                                    <p>We may collect precise GPS location (with your permission) for features like real-time service matching and location-based services.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.2 Personal Information</h3>
                            <p className="mb-3">We may collect:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-4">
                                <li>Name (first name, last name, or nickname)</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Address (home or business)</li>
                                <li>User IDs (account ID, username)</li>
                            </ul>
                            <p className="mb-3">We do not collect sensitive personal data such as:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-4">
                                <li>Race or ethnicity</li>
                                <li>Political or religious beliefs</li>
                                <li>Sexual orientation</li>
                            </ul>
                            <p className="mb-1">Other optional details (if provided):</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Date of birth</li>
                                <li>Gender identity</li>
                            </ul>
                        </div>

                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.3 Financial Information</h3>
                            <p className="mb-3">We may collect:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-3">
                                <li>Payment details (processed securely via third-party gateways)</li>
                                <li>Transaction and purchase history</li>
                            </ul>
                            <p className="italic text-gray-600">We do not store sensitive financial data like full credit card details on our servers.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.4 Health & Fitness Data</h3>
                            <p>Trueknoc does not collect health or fitness-related information.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.5 Messages & Communication</h3>
                            <p className="mb-3">We may collect:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-3">
                                <li>In-app messages or chat content</li>
                                <li>Customer support communications</li>
                            </ul>
                            <p>We do not access personal emails or SMS without explicit permission.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.6 Media & Files</h3>
                            <p className="mb-3">With your permission, we may access:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-3">
                                <li>Photos and videos (for uploads or profile updates)</li>
                                <li>Files or documents (if required for verification)</li>
                            </ul>
                            <p>We do not access media without your consent.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.7 Contacts</h3>
                            <p>We do not access or store contact lists unless explicitly required and permitted.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.8 App Activity</h3>
                            <p className="mb-3">We may collect:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>App interactions (clicks, navigation, usage time)</li>
                                <li>In-app search history</li>
                                <li>User-generated content (profiles, feedback, reviews)</li>
                            </ul>
                            <p className="mt-3">This helps us improve user experience.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.9 Web Browsing</h3>
                            <p>Trueknoc does not track your external web browsing history.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.10 App Performance & Diagnostics</h3>
                            <p className="mb-3">We collect:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Crash logs</li>
                                <li>App performance data (loading time, errors)</li>
                                <li>Diagnostics for improving app stability</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-black mb-3 text-[15px]">1.11 Device & Identifiers</h3>
                            <p className="mb-3">We may collect:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Device ID</li>
                                <li>Advertising ID</li>
                                <li>Firebase Installation ID</li>
                            </ul>
                            <p className="mt-3">This helps with analytics, security, and personalized experience.</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">2. How We Use Your Data</h2>
                        <p className="mb-3">We use collected data to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Provide and improve our services</li>
                            <li>Verify users and prevent fraud</li>
                            <li>Enable location-based features</li>
                            <li>Process transactions</li>
                            <li>Provide customer support</li>
                            <li>Improve app performance and user experience</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">3. Data Sharing</h2>
                        <p className="mb-4 font-bold">We do not sell your personal data.</p>
                        <p className="mb-3">We may share data with:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Trusted third-party service providers (payment gateways, analytics tools)</li>
                            <li>Legal authorities if required by law</li>
                            <li>Security systems to prevent fraud or misuse</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">4. Data Security</h2>
                        <p className="mb-3">We implement industry-standard security measures:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Encryption of sensitive data</li>
                            <li>Secure servers and APIs</li>
                            <li>Restricted access to user information</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">5. User Control & Permissions</h2>
                        <p className="mb-3">You have full control over your data:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You can enable/disable location permissions</li>
                            <li>You can update or delete your profile</li>
                            <li>You can revoke permissions anytime via device settings</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">6. Data Retention</h2>
                        <p className="mb-3">We retain data only as long as necessary:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To provide services</li>
                            <li>To comply with legal obligations</li>
                            <li>To resolve disputes</li>
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">7. Children’s Privacy</h2>
                        <p>Trueknoc is not intended for children under 13. We do not knowingly collect data from minors.</p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">8. Changes to This Policy</h2>
                        <p>We may update this policy from time to time. Updates will be reflected with a revised effective date.</p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">9. Contact Us</h2>
                        <p className="mb-4">For any privacy-related concerns, contact us at:</p>
                        <p className="font-bold text-purple-600 underline">📧 info@trueknoc.com</p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">10. Google Play Data Safety Compliance</h2>
                        <p className="mb-3">Trueknoc ensures:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Data is collected only for legitimate purposes</li>
                            <li>Users are informed and give consent</li>
                            <li>Data is handled securely</li>
                            <li>No unauthorized sharing or selling of user data</li>
                        </ul>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
