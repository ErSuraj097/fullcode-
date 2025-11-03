import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Support Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help you get the most out of Sambhāṣinī (संभाषिणी). 
              Find answers, get support, and connect with our team.
            </p>
          </div>

          {/* Support Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-[#e1802be0] mr-3" />
                <h3 className="text-xl font-semibold">Email Support</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Get detailed help via email. We typically respond within 24 hours.
              </p>
              <a 
                href="mailto:support@jethatai.com" 
                className="text-[#e1802be0] hover:text-[#d1722a] font-medium"
              >
                support@jethatai.com
              </a>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-[#e1802be0] mr-3" />
                <h3 className="text-xl font-semibold">Live Chat</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Chat with our support team in real-time for immediate assistance.
              </p>
              <button className="bg-[#e1802be0] hover:bg-[#d1722a] text-white px-4 py-2 rounded-lg transition-colors">
                Start Chat
              </button>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-[#e1802be0] mr-3" />
              <h3 className="text-xl font-semibold">Support Hours</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-2">Monday - Friday</p>
                <p className="text-muted-foreground">9:00 AM - 6:00 PM IST</p>
              </div>
              <div>
                <p className="font-medium mb-2">Weekend</p>
                <p className="text-muted-foreground">10:00 AM - 4:00 PM IST</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link 
              to="/contact" 
              className="bg-card border border-border rounded-lg p-6 hover:border-[#e1802be0] transition-colors group"
            >
              <h4 className="font-semibold mb-2 group-hover:text-[#e1802be0]">Contact Us</h4>
              <p className="text-muted-foreground text-sm">Get in touch with our team</p>
            </Link>

            <Link 
              to="/privacy-policy" 
              className="bg-card border border-border rounded-lg p-6 hover:border-[#e1802be0] transition-colors group"
            >
              <h4 className="font-semibold mb-2 group-hover:text-[#e1802be0]">Privacy Policy</h4>
              <p className="text-muted-foreground text-sm">How we protect your data</p>
            </Link>

            <Link 
              to="/terms-conditions" 
              className="bg-card border border-border rounded-lg p-6 hover:border-[#e1802be0] transition-colors group"
            >
              <h4 className="font-semibold mb-2 group-hover:text-[#e1802be0]">Terms & Conditions</h4>
              <p className="text-muted-foreground text-sm">Our service terms</p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SupportPage;