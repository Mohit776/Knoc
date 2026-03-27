
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
    const effectiveDate = "February 20, 2026";
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-purple-100 flex flex-col">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-[1000px] mx-auto px-6 py-12 md:py-20 flex-grow">
                <h1 className="text-3xl font-bold text-center mb-16 tracking-tight text-black">Privacy Policy</h1>

                <div className="space-y-10 text-[14.5px] leading-relaxed text-[#2c2c2c]">
                    {/* Welcome Section */}
                    <section>
                           <p className="mb-4">Effective Date: {effectiveDate}</p>
                        <h2 className="text-[17px] font-bold text-black mb-4">Welcome to Trueknoc</h2>
                        <p className="mb-4">
                            TrueKnoc is a smart doorbell solution that uses QR code technology to provide secure, electricity-free visitor
                            management for homes, apartments, offices, and gated communities across India.
                        </p>
                        <p className="mb-6">
                            We understand that when you use our services, you trust us with your information. This Privacy Policy
                            explains what data we collect, why we collect it, how we use it, and the choices you have to control your
                            information.
                        </p>

                        <div className="mb-8">
                            <p className="font-bold mb-3">Our Commitment:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>We protect your data with bank-level security</li>
                                <li>You control what information you share</li>
                                <li>We never sell your personal data</li>
                                <li>We comply with Indian data protection laws</li>
                            </ul>
                        </div>

                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="font-bold mb-3">Company Details:</p>
                            <div className="space-y-1">
                                <p><span className="font-semibold">Entity:</span> Rewato Marketplace Private Limited</p>
                                <p><span className="font-semibold">Address:</span> A1816, 18th Floor, Tower A, Spectrum Mall, Sector 75, Noida, Uttar Pradesh</p>
                                <p><span className="font-semibold">CIN:</span> U62099DL2025PTC459490</p>
                                <p><span className="font-semibold">Contact:</span> <a href="mailto:info@trueknoc.com" className="text-purple-600 hover:underline">info@trueknoc.com</a></p>
                            </div>
                        </div>

                        <p className="italic text-gray-600">
                            By using TrueKnoc's website (https://trueknoc.com) or mobile application (collectively, the "Platform"), you
                            agree to this Privacy Policy.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-6 uppercase">2. INFORMATION WE COLLECT</h2>
                        <p className="mb-6">
                            The information we collect depends on how you use TrueKnoc. We collect only what's necessary to provide
                            you with excellent service.
                        </p>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">2.1 Information You Provide Directly</h3>
                            
                            <div className="mb-6">
                                <p className="font-semibold mb-2">For Homeowners/Residents:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Full name</li>
                                    <li>Mobile number (for account identification, secure login, and visitor notifications)</li>
                                    <li>Property address/flat number</li>
                                    <li>App permissions (camera,notifications) when you opt for a product whose core functionality can be delivered only after accessing your app permissions, or where access is as per regulatory requirements, e.g., QR code onboarding</li>
                                  
                                </ul>
                            </div>

                            <div className="mb-6">
                                <p className="font-semibold mb-2">For Visitors (Scanned via QR Code):</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Name (optional, entered by visitor)</li>
                                    <li>Timestamp of scan</li>
                                    <li>Purpose of visit (optional)</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">For Society/Building Administrators:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Organization name</li>
                                    <li>Authorized administrator name</li>
                                    <li>Contact details</li>
                                    <li>Building/society address</li>
                                    <li>Number of units</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">2.2 Visitor Information</h3>
                            <p className="mb-3">When a visitor scans a TrueKnoc QR code outside a home, the system may collect:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Visitor name</li>
                                <li>Phone number (optional)</li>
                                <li>Entry request timestamp</li>
                                <li>Purpose of visit (delivery, guest, service)</li>
                            </ul>
                            <p className="mt-3">This allows homeowners to verify visitors before granting access.</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-black mb-3 text-[15px]">2.3 Device & Technical Data</h3>
                            <p className="mb-3">To improve app functionality we may collect:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Device type</li>
                                <li>Operating system version</li>
                                <li>App version</li>
                                <li>IP address</li>
                                <li>Log data</li>
                            </ul>
                            <p className="mt-3">Many visitor management apps collect similar data such as names, phone numbers, apartment details, and visit time records to operate securely.</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-black mb-3 text-[15px]">2.4 Notification Data</h3>
                            <p className="mb-3">TrueKnoc may collect interaction data related to push notifications such as:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Visitor request alerts</li>
                                <li>Delivery alerts</li>
                                <li>Security notifications</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">3. How We Use Your Information</h2>
                        <p className="mb-4">TrueKnoc uses your information to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Send visitor entry notifications</li>
                            <li>Allow homeowners to approve or reject visitors</li>
                            <li>Manage delivery requests</li>
                            <li>Maintain visitor logs</li>
                            <li>Improve app performance and security</li>
                            <li>Provide customer support</li>
                        </ul>
                        <p className="mt-4">Your data is used only to deliver the TrueKnoc service.</p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">4. Data Sharing</h2>
                        <p className="mb-4">TrueKnoc does not sell user data.</p>
                        <p className="mb-3">Data may be shared only in the following cases:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>With the homeowner when a visitor scans their QR code</li>
                            <li>With service providers that help operate our platform (cloud hosting, notifications)</li>
                            <li>When required by law or legal authorities</li>
                            <li>To protect the security and integrity of the platform</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">5. Data Security</h2>
                        <p className="mb-4">We implement strong security practices including:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Encrypted communication</li>
                            <li>Secure cloud storage</li>
                            <li>Access control for sensitive data</li>
                            <li>Periodic security reviews</li>
                        </ul>
                        <p className="mt-4">Many modern security apps also follow standards like encryption and ISO-based security frameworks to protect user data.</p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">6. Data Retention</h2>
                        <p className="mb-4">Visitor logs and user data are retained only for as long as necessary to provide the service.</p>
                        <p>Users may request deletion of their data or account.</p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">7. User Privacy Controls</h2>
                        <p className="mb-4">Users may:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Update profile information</li>
                            <li>Delete their account</li>
                            <li>Request data removal</li>
                            <li>Manage notification permissions</li>
                        </ul>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">8. Third-Party Services</h2>
                        <p className="mb-4">TrueKnoc may use trusted third-party services such as:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Cloud hosting providers</li>
                            <li>Push notification services</li>
                            <li>Analytics tools</li>
                        </ul>
                        <p className="mt-4">These providers process data only for operating the service.</p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">9. Children's Privacy</h2>
                        <p className="mb-4">TrueKnoc services are intended for users aged 18 and above.</p>
                        <p>We do not knowingly collect data from children.</p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">10. Changes to This Policy</h2>
                        <p className="mb-4">TrueKnoc may update this Privacy Policy periodically.</p>
                        <p>Users will be notified of significant changes through the app or website.</p>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4 uppercase">11. Contact Us</h2>
                        <p className="mb-4">If you have questions about this Privacy Policy, contact us at:</p>
                        <div className="space-y-1">
                            <p><span className="font-semibold">Email:</span> <a href="mailto:support@trueknoc.com" className="text-purple-600 hover:underline">support@trueknoc.com</a></p>
                            <p><span className="font-semibold">Company:</span> Rewato Marketplace Pvt. Ltd</p>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
