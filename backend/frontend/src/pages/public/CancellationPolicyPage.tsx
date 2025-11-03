import { Link } from 'react-router-dom';
import { ArrowLeft, XCircle, RefreshCw, Calendar, CreditCard } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgressBar from '../../components/common/ScrollProgressBar';

const CancellationPolicyPage = () => {
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
              <XCircle className="h-8 w-8 text-[#e1802be0] mr-4" />
              <h1 className="text-2xl font-bold text-foreground">
                Cancellation Policy
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
                  <Calendar className="h-6 w-6 text-[#e1802be0] mr-3" />
                  Subscription Cancellation
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    You can cancel your Sambhāṣinī (संभाषिणी) subscription at any time through your account dashboard 
                    or by contacting our support team. Here's what you need to know:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>Cancellations can be made at any time during your subscription period</li>
                    <li>Your service will continue until the end of your current billing cycle</li>
                    <li>No partial refunds are provided for unused portions of the billing period</li>
                    <li>You will retain access to all features until your subscription expires</li>
                    <li>All your data will be preserved for 30 days after cancellation</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <RefreshCw className="h-6 w-6 text-[#e1802be0] mr-3" />
                  How to Cancel
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>You can cancel your subscription using any of these methods:</p>
                  
                  <div className="bg-muted rounded-lg p-6 space-y-4 text-[14px]">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-[14px]">Method 1: Account Dashboard</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-4 text-[14px]">
                        <li>Log in to your Sambhāṣinī account</li>
                        <li>Go to Settings → Subscription</li>
                        <li>Click "Cancel Subscription"</li>
                        <li>Confirm your cancellation</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-[14px]">Method 2: Email Support</h4>
                      <p>Send an email to <strong>support@jethatai.com</strong> with your account details and cancellation request.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-[14px]">Method 3: Live Chat</h4>
                      <p>Use our live chat feature on the website to request cancellation assistance.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4 flex items-center">
                  <CreditCard className="h-6 w-6 text-[#e1802be0] mr-3" />
                  Refund Policy
                </h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>Our refund policy is designed to be fair and transparent:</p>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 text-[14px]">7-Day Money-Back Guarantee</h4>
                      <p className="text-green-700 dark:text-green-300 text-[14px]">
                        New subscribers can request a full refund within 7 days of their first payment, 
                        no questions asked.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Service Issues</h4>
                      <p className="text-yellow-700 dark:text-yellow-300 text-[14px]">
                        If you experience significant service disruptions or technical issues that prevent 
                        you from using our service, we may provide prorated refunds on a case-by-case basis.
                      </p>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">No Refund Situations</h4>
                      <ul className="text-red-700 dark:text-red-300 list-disc list-inside space-y-1 text-[14px]">
                        <li>Cancellations after the 7-day guarantee period</li>
                        <li>Unused portions of subscription periods</li>
                        <li>Account violations or terms of service breaches</li>
                        <li>Change of mind after the guarantee period</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Data Retention</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>After cancellation:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li><strong>30 days:</strong> Your data is preserved and you can reactivate your account</li>
                    <li><strong>After 30 days:</strong> Your data may be permanently deleted</li>
                    <li><strong>Export option:</strong> You can export your data before cancellation</li>
                    <li><strong>Legal compliance:</strong> Some data may be retained for legal or regulatory requirements</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Reactivation</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    You can reactivate your cancelled subscription at any time within 30 days of cancellation. 
                    After reactivation:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li>All your previous data and settings will be restored</li>
                    <li>Billing will resume according to your selected plan</li>
                    <li>You'll have immediate access to all features</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Processing Time</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>Cancellation and refund processing times:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-[14px]">
                    <li><strong>Cancellation:</strong> Immediate (service continues until end of billing cycle)</li>
                    <li><strong>Refund processing:</strong> 5-10 business days</li>
                    <li><strong>Bank/card refund:</strong> Additional 3-5 business days depending on your bank</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-md font-semibold text-foreground mb-4">Contact Us</h2>
                <div className="text-muted-foreground space-y-4 text-[14px]">
                  <p>
                    If you have questions about our cancellation policy or need assistance with cancellation:
                  </p>
                  <div className="bg-muted rounded-lg p-4 text-[14px]">
                    <p><strong>Email:</strong> ai@jethat.in</p>
                    <p><strong>Subject:</strong> Cancellation Request - [Your Account Email]</p>
                    <p><strong>Response time:</strong> Within 24 hours</p>
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

export default CancellationPolicyPage;