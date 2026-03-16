import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Content Section */}
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Terms & Conditions
          </h1>
          
          <div className="space-y-8 text-sm leading-relaxed text-gray-700">
            <section className="space-y-4">
              <p>
                You understand that your use of our website,{" "}
                <a href="https://trueknoc.com/" className="text-purple-600 hover:underline">
                  https://trueknoc.com/
                </a>{" "}
                (“Website”) and our mobile application, Trueknoc (“App”) (collectively the “Platform”), 
                is subject to certain terms and conditions (“Terms of Use” or “Terms”).
              </p>
              <p>
                Please read these Terms carefully before signing up on the App or using the Platforms.
              </p>
            </section>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                1. Acceptance of terms and registration of account
              </h2>
              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                <p>a. These Terms set forth a legally binding contract between You and Us. By using the Platforms, You agree to be bound by these Terms together with the Privacy Policy.</p>
                <p>b. To accept these Terms, You must be at least 18 (eighteen) years of age. In the event that You are below 18 (eighteen) years of age or such other older legal age, Your guardian must read and understand and accept the provisions on Your behalf.</p>
                <p>c. If You are executing/accepting these terms on behalf of any registered association / society or builder (“Direct Customer”), You confirm that You are a major and are competent to accept/execute the Terms of Use.</p>
                <p>d. You also agree to provide true, accurate and complete information about Yourself and update them upon any change.</p>
                <p>e. To avail any services offered by the Company, You will have to register on the Platforms to create Your account. To register, You will be required to open an account by completing the registration process, by providing Us with current, complete and accurate information as prompted by the registration form. You may then update the identifiable information relating to You.</p>
                <p>f. To access Your account on the Platforms, You will be asked to log in with Your user ID and password, to establish a unique identity for You. You are responsible for maintaining the confidentiality of Your password, verification code, and account information. If there is any compromise on Your password You can change Your password using the ‘Forgot Password?’ functionality.</p>
                <p>g. At the time of registration, if You provide any information that is untrue, inaccurate, not current or incomplete, or We have reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, We reserve the right to suspend or terminate Your account and refuse any and all current or future use of the Platforms (or any portion thereof) at any time.</p>
                <p>h. You may access the Platforms as available for Your personal use only.</p>
                <p>i. You will be required to enter a valid phone number while registering on the Platforms. By registering Your phone number with us, You consent to be contacted by Us via phone calls, SMS notifications, and/or e-mails, in case of any subscription/service updates.</p>
                <p>j. You agree that it shall not be the responsibility of the Company to perform background checks or provide any advice relating to the hiring/firing of the security personnel of the apartment complex /gated complex and/or any third-party service providers providing services to the residents of such apartment complex /gated complex. The hiring/firing of such security personnel and/or any third-party service providers shall be at the sole risk of the association of the apartment complex /gated complex or the residents of such apartment complex /gated complex, as the case may be. We are merely a technology platform.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                2. Registration of the Direct Customer account
              </h2>
              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                <p>a. If you are registering the administrative account for the Direct Customer online on the Platforms, You may be required to complete a verification process as part of setting up the account (“Account”).</p>
                <p>b. To access the Direct Customers administration account, the authorised personnel of the association shall also be provided with a unique ID and password. We categorically state the Company has no liability for usage or sharing of information / data by such Direct Customer. They are fully responsible for all activities that occur on the administration account.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                3. User Responsibilities
              </h2>
              <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                <p className="font-medium">Users agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>provide accurate information</li>
                  <li>use the platform responsibly</li>
                  <li>not misuse QR codes or visitor data</li>
                  <li>respect privacy and security guidelines</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                4. Visitor Interaction
              </h2>
              <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                <p>Visitors who scan a TrueKnoc QR code must provide truthful information when requesting entry.</p>
                <p>Homeowners retain full control over allowing or rejecting visitors.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                5. Account Security
              </h2>
              <div className="pl-4 border-l-2 border-gray-100">
                <p>Users are responsible for maintaining the confidentiality of their login credentials and mobile devices.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                6. Limitation of Liability
              </h2>
              <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                <p>TrueKnoc provides a notification and visitor management system and does not guarantee the identity or behavior of visitors.</p>
                <p className="font-semibold text-gray-900">Users remain responsible for their personal security decisions.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                7. Service Availability
              </h2>
              <div className="pl-4 border-l-2 border-gray-100">
                <p>While we aim for uninterrupted service, availability may be affected by technical or network issues.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                8. Prohibited Use
              </h2>
              <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                <p className="font-medium">Users must not:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>attempt to hack or disrupt the platform</li>
                  <li>use the service for illegal activities</li>
                  <li>impersonate other individuals</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                9. Termination
              </h2>
              <div className="pl-4 border-l-2 border-gray-100">
                <p>TrueKnoc may suspend or terminate accounts that violate these terms.</p>
              </div>
            </section>

            {/* Additional Terms */}
            <section className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Additional terms</h2>
              <div className="space-y-3">
                <p>We reserve the right at any time to modify, edit, delete, suspend or discontinue, temporarily or permanently the service or any of the Platform (or any portion thereof) with or without notice. You agree that we will not be liable to You or to any third party for any such modification, editing, deletion, suspension or discontinuance of the Platform.</p>
                <p>This Agreement and any rights and licenses granted hereunder, may not be transferred or assigned by You, but may be assigned by the Company without restriction.</p>
                <p>This Agreement together with the Privacy Policy and any other policies/legal notices published by the Company on the Platform or elsewhere in or around Your apartment complex, shall constitute the entire agreement between You and the Company concerning the Platform, the Company’s services, and governs Your use of the Platform, superseding any prior agreements between You and the Company with respect to the Platform.</p>
                <p>The failure of the Company to exercise or enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. If any provision of these Terms is found by a court of competent jurisdiction to be invalid, the Parties nevertheless agree that the court should endeavour to give effect to the Parties’ intentions as reflected in the provision, and the other provisions of this Agreement remain in full force and effect.</p>
                <p>These Terms are governed by the laws of India. Any matters arising under these terms shall be subject to the exclusive jurisdiction of courts located in Noida.</p>
              </div>
            </section>

            {/* Grievance Officer */}
            <section className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Grievance Officer</h2>
              <p>In case of any grievance arising from the use of the Platforms, please contact the Grievance Officer, the details of which are set forth below-</p>
              <div className="bg-gray-50 p-4 rounded-md space-y-1">
                <p><span className="font-bold">Grievance Officer:</span> Umesh Ahirwar</p>
                <p><span className="font-bold">Contact:</span> grievance@trueknoc.in</p>
              </div>
            </section>

            {/* Definitions */}
            <section className="text-xs text-gray-500 pt-6">
              <p>
                For the purpose of these Terms of Use, wherever the context so requires “You” or “User” shall mean any natural or legal person or any entity who has agreed to become a registered User on the Platform by providing registration data while registering on the Platform. 
                The term “We”, “Us”, “Our” shall mean Rewato Marketplace Private Limited (“Trueknoc” or the “Company”, which expression shall, wherever the context permits, admits or requires, be deemed to mean and include its successors in interest and permitted assigns). 
                The Platforms are owned and operated by the Company.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}