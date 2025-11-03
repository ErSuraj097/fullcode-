import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Download, Share2, User, Mail, Globe, Users, RefreshCw, Cookie } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgressBar from '../../components/common/ScrollProgressBar';

const PrivacyPolicyPage = () => {
  const handleDownload = () => {
    const policyContent = `
Sambhasini Privacy Policy
Last updated: January 7, 2025

1. Introduction
Welcome to Sambhasini (the "Service", "we", "us", or "our"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy tells you how we collect, use, disclose, and safeguard your information when you visit or use our website at sambhasini.jethat.in (the "Site").
By using our Site or Services, you agree to the collection and use of information in accordance with this policy.

2. Information We Collect
We may collect the following types of information:
• Personal Information you voluntarily provide, e.g. name, email address, phone number, billing details, etc.
• Usage Data / Log Data: IP address, browser type, pages you visited, time stamps, referring URLs, etc.
• Cookies and Tracking Technologies: we and third-party services use cookies, local storage, web beacons to collect data about your interactions and preferences.

3. How We Use Your Information
We use your information for purposes such as:
• To provide, operate, maintain, and improve our services
• To process your payments and manage subscriptions
• To communicate with you (e.g. send updates, technical notices, support)
• To personalise and improve your experience
• To detect, prevent, and address technical issues, fraud, abuse
• To comply with legal obligations

4. Disclosure of Information
We may share your data in the following cases:
• With service providers / contractors who assist us (payment processors, cloud hosting, analytics) under confidentiality requirements.
• If required by law (court orders, legal processes).
• To enforce our Terms & Conditions, or protect rights, safety, or property.
• In case of a merger, acquisition, or sale of assets (subject to confidentiality).

5. Cookies & Tracking
We use cookies and similar technologies to:
• Recognize your device and maintain your session
• Analyse site usage and performance
• Tailor content and ads
You can disable cookies in your browser settings, but some features of the Site may not work properly.

6. Data Retention
We will retain your personal data only so long as necessary to:
• Fulfill the purposes for which it was collected
• Comply with legal obligations
• Resolve disputes, enforce our agreements

7. Security
We adopt reasonable technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is entirely secure, so we cannot guarantee absolute security.

8. Your Rights
Depending on your jurisdiction, you may have the following rights:
• Access your data
• Rectify (correct) your data
• Erase your data (right to be forgotten)
• Restrict or object to processing
• Portability (receive data in structured format)
• Withdraw consent at any time
To exercise these rights, contact us at ai@jethat.in.

9. International Transfers
If your data is transferred outside your country, we will ensure it is protected by appropriate safeguards (e.g. standard contractual clauses).

10. Children
Our services are not directed to individuals under 13 years old. We do not knowingly collect personal data from them. If you learn we have done so, please contact us and we will delete that data.

11. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you via email or by posting a notice on the Site. The new policy becomes effective when posted (or as otherwise stated).

12. Contact Us
If you have questions about this Privacy Policy, contact us at:
Email: ai@jethat.in
Address: B-508, Bhutani Technopark, Sector-127, Noida, Uttar Pradesh - 201304 IN
    `;

    const blob = new Blob([policyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sambhasini-Privacy-Policy.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sambhasini Privacy Policy',
          text: 'Read the Sambhasini Privacy Policy',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-black">
        <ScrollProgressBar />
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center text-[#e1802be0] hover:text-[#d1722a] mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-[#e1802be0] mr-4" />
              <h1 className="text-2xl font-bold text-foreground">
                Privacy Policy
              </h1>
            </div>
            <p className="text-md text-muted-foreground mb-6">
              Last updated: October 4, 2025
            </p>

            {/* Action Buttons */}
            {/* <div className="flex justify-center gap-4">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-[#e1802be0] text-white rounded-lg hover:bg-[#d1722a] transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 border border-[#e1802be0] text-[#e1802be0] rounded-lg hover:bg-[#e1802be0] hover:text-white transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div> */}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-card border border-border rounded-lg p-8 space-y-12">
              
              {/* Introduction */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-[#e1802be0] mr-3" />
                  1. Introduction
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    Welcome to Sambhasini (the "Service", "we", "us", or "our"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy tells you how we collect, use, disclose, and safeguard your information when you visit or use our website at sambhasini.jethat.in (the "Site").
                  </p>
                  <p>
                    By using our Site or Services, you agree to the collection and use of information in accordance with this policy.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Database className="h-6 w-6 text-[#e1802be0] mr-3" />
                  2. Information We Collect
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>We may collect the following types of information:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li><strong>Personal Information</strong> you voluntarily provide, e.g. name, email address, phone number, billing details, etc.</li>
                    <li><strong>Usage Data / Log Data:</strong> IP address, browser type, pages you visited, time stamps, referring URLs, etc.</li>
                    <li><strong>Cookies and Tracking Technologies:</strong> we and third-party services use cookies, local storage, web beacons to collect data about your interactions and preferences.</li>
                  </ul>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Eye className="h-6 w-6 text-[#e1802be0] mr-3" />
                  3. How We Use Your Information
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>We use your information for purposes such as:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>To provide, operate, maintain, and improve our services</li>
                    <li>To process your payments and manage subscriptions</li>
                    <li>To communicate with you (e.g. send updates, technical notices, support)</li>
                    <li>To personalise and improve your experience</li>
                    <li>To detect, prevent, and address technical issues, fraud, abuse</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </div>
              </section>

              {/* Disclosure of Information */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Share2 className="h-6 w-6 text-[#e1802be0] mr-3" />
                  4. Disclosure of Information
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>We may share your data in the following cases:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>With service providers / contractors who assist us (payment processors, cloud hosting, analytics) under confidentiality requirements.</li>
                    <li>If required by law (court orders, legal processes).</li>
                    <li>To enforce our Terms & Conditions, or protect rights, safety, or property.</li>
                    <li>In case of a merger, acquisition, or sale of assets (subject to confidentiality).</li>
                  </ul>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Cookie className="h-6 w-6 text-[#e1802be0] mr-3" />
                  5. Cookies & Tracking
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>Recognize your device and maintain your session</li>
                    <li>Analyse site usage and performance</li>
                    <li>Tailor content and ads</li>
                  </ul>
                  <p>
                    You can disable cookies in your browser settings, but some features of the Site may not work properly.
                  </p>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Database className="h-6 w-6 text-[#e1802be0] mr-3" />
                  6. Data Retention
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    We will retain your personal data only so long as necessary to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>Fulfill the purposes for which it was collected</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes, enforce our agreements</li>
                  </ul>
                </div>
              </section>

              {/* Security */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-[#e1802be0] mr-3 " />
                  7. Security
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    We adopt reasonable technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is entirely secure, so we cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <User className="h-6 w-6 text-[#e1802be0] mr-3" />
                  8. Your Rights
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>Depending on your jurisdiction, you may have the following rights:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>Access your data</li>
                    <li>Rectify (correct) your data</li>
                    <li>Erase your data (right to be forgotten)</li>
                    <li>Restrict or object to processing</li>
                    <li>Portability (receive data in structured format)</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                  <p>To exercise these rights, contact us at ai@jethat.in.</p>
                </div>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Globe className="h-6 w-6 text-[#e1802be0] mr-3" />
                  9. International Transfers
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    If your data is transferred outside your country, we will ensure it is protected by appropriate safeguards (e.g. standard contractual clauses).
                  </p>
                </div>
              </section>

              {/* Children */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Users className="h-6 w-6 text-[#e1802be0] mr-3" />
                  10. Children
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    Our services are not directed to individuals under 13 years old. We do not knowingly collect personal data from them. If you learn we have done so, please contact us and we will delete that data.
                  </p>
                </div>
              </section>

              {/* Changes to This Policy */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <RefreshCw className="h-6 w-6 text-[#e1802be0] mr-3" />
                  11. Changes to This Policy
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you via email or by posting a notice on the Site. The new policy becomes effective when posted (or as otherwise stated).
                  </p>
                </div>
              </section>

              {/* Contact Us */}
              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="h-6 w-6 text-[#e1802be0] mr-3" />
                  12. Contact Us
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    If you have questions about this Privacy Policy, please contact us at:
                  </p>
                  <div className="bg-muted rounded-lg p-4 text-[14px]">
                    <p><strong>Email:</strong> ai@jethat.in</p>
                    <p><strong>Address:</strong> B-508, Bhutani Technopark, Sector-127, Noida, Uttar Pradesh - 201304 IN</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;