import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, Users } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgressBar from '../../components/common/ScrollProgressBar';

const TermsConditionsPage = () => {
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
              <Scale className="h-8 w-8  text-[#e1802be0] mr-4" />
              <h1 className="text-2xl font-bold text-foreground">
                Terms & Conditions (Terms of Use)

              </h1>
            </div>
            <p className="text-md text-muted-foreground">
              Last updated: October 4, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">

            <div className="bg-card border border-border rounded-lg p-8 space-y-8">

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <FileText className="h-6 w-6 text-[#e1802be0] mr-3" />
                  Acceptance of Terms
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    Please read these Terms & Conditions (“Terms”) carefully before using sambhasini.jethat.in (the “Site”) and our services (the “Service”).
                    By accessing or using the Service, you agree to be bound by these Terms.
                  </p>
                  <p>
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </section>


              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Users className="h-6 w-6 text-[#e1802be0] mr-3" />
                  Definitions
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    Permission is granted to temporarily use Sambhāṣinī for personal,
                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>"User”, “you”, “your” means the person accessing or using the Service</li>
                    <li>“We”, “us”, “our” means Sambhasini (the company/owner).</li>
                    <li>Content” refers to text, audio, video, images, data provided through the Service.</li>
                    {/* <li>Remove any copyright or other proprietary notations from the materials</li> */}
                  </ul>
                </div>
              </section>



              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <Users className="h-6 w-6 text-[#e1802be0] mr-3" />
                  Use License
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    Permission is granted to temporarily use Sambhāṣinī for personal,
                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 ">Service Availability</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    We strive to provide reliable service, but we cannot guarantee 100% uptime.
                    Our services may be temporarily unavailable due to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>Scheduled maintenance</li>
                    <li>Technical issues</li>
                    <li>Third-party service dependencies</li>
                    <li>Force majeure events</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">User Responsibilities</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>As a user of our service, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Use the service in compliance with applicable laws</li>
                    <li>Not engage in any harmful or malicious activities</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not attempt to gain unauthorized access to our systems</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Payment Terms</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    For paid services, the following terms apply:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>Payments are processed securely through our payment partners</li>
                    <li>Subscriptions are billed in advance on a recurring basis</li>
                    <li>All fees are non-refundable unless otherwise stated</li>
                    <li>We reserve the right to change pricing with 30 days notice</li>
                    <li>Failure to pay may result in service suspension</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 text-[#e1802be0] mr-3" />
                  Disclaimer
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    The materials on Sambhāṣinī's website are provided on an 'as is' basis.
                    JetHat AI makes no warranties, expressed or implied, and hereby disclaims
                    and negates all other warranties including without limitation, implied warranties
                    or conditions of merchantability, fitness for a particular purpose, or
                    non-infringement of intellectual property or other violation of rights.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Limitations</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    In no event shall JetHat AI or its suppliers be liable for any damages
                    (including, without limitation, damages for loss of data or profit, or due to
                    business interruption) arising out of the use or inability to use the materials
                    on Sambhāṣinī's website, even if JetHat AI or an authorized representative has
                    been notified orally or in writing of the possibility of such damage.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Governing Law & Dispute Resolution
</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    These terms and conditions are governed by and construed in accordance with
                    the laws of India and you irrevocably submit to the exclusive jurisdiction
                    of the courts in Uttar Pradesh, India.
                  </p>
                </div>
              </section>


              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Changes to Terms</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    We may modify these Terms at any time. We will notify you by email or via the Site.
                    Changes take effect after a notice period (e.g. 30 days).
                    Continued use constitutes acceptance.
                  </p>
                </div>
              </section>


              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Contact Information</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    If you have any questions about these Terms & Conditions, please contact us at:
                  </p>
                  <div className="bg-muted rounded-lg p-4">
                    <p><strong>Email:</strong> ai@jethat.in</p>
                    <p><strong>Address:</strong> B-508, Bhutani Technopark, Sector-127, Noida, Uttar Pradesh - 201304 IN
                    </p>
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

export default TermsConditionsPage;