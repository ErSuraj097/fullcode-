import { Coffee, Heart, Twitter, Linkedin, Facebook } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../../../public/SANBHASINI.png'

const Footer = () => {
  const productLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Use Cases', href: '#use-cases' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Demo', href: '/contact' },
  ];

  const supportLinks = [
    // { name: 'Support', href: '/support' },
    { name: 'Contact Us', href: '#contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms-conditions' },
    { name: 'Cancellation Policy', href: '/cancellation-policy' },
  ];

  // const companyLinks = [
  //   { name: 'About Us', href: '#about' },
  //   { name: 'Blog', href: '#blog' },
  //   { name: 'Careers', href: '#careers' },
  //   { name: 'Press Kit', href: '#press' },
  // ];

  const socialLinks = [

    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/sambh%C4%81%E1%B9%A3in%C4%AB-%E0%A4%B8%E0%A4%82%E0%A4%AD%E0%A4%BE%E0%A4%B7%E0%A4%BF%E0%A4%A3%E0%A5%80-506141389/', icon: <Linkedin className="h-5 w-5" /> },

    { name: 'Twitter', href: '#', icon: <Twitter className="h-5 w-5" /> },
    { name: 'GitHub', href: '#', icon: <Facebook className="h-5 w-5" /> },
  ];

  // const stats = [
  //   { number: "22+", label: "Languages", icon: <Globe className="h-4 w-4" /> },
  //   { number: "10K+", label: "Active Bots", icon: <Zap className="h-4 w-4" /> },
  //   { number: "1M+", label: "Users", icon: <Users className="h-4 w-4" /> },
  // ];

  return (
    <footer className="bg-gray-100 dark:bg-black border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 justify-items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">

          {/* Company Info */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-40 sm:w-56 h-10 sm:h-12 flex items-center">
                <img src={Logo} alt="JetHat AI Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed text-sm sm:text-base">
              Sambhāṣinī (संभाषिणी) brings the power of intelligent, multilingual AI chatbots to Indian businesses—helping you engage customers in their own language, build trust, and drive growth.
            </p>

            {/* Stats */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-card rounded-lg p-3 border border-border shadow-sm">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-8 h-8 bg-[#e1802be0] rounded-lg flex items-center justify-center text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="font-bold text-foreground text-sm">{stat.number}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div> */}
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-4 text-foreground">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-[#e1802be0] transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* <div>
              <h3 className="font-semibold text-base sm:text-lg mb-4 text-foreground">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-[#e1802be0] transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}

          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-4 text-foreground">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    
                    className="text-muted-foreground hover:text-[#e1802be0] transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            {/* Newsletter Signup */}
            <div>
              <h4 className="font-semibold text-base sm:text-lg mb-3 text-foreground">Stay Updated</h4>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1802be0] focus:border-transparent"
                />
                <button type="button" className="bg-[#e1802be0] hover:bg-[#d1722a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="font-semibold text-base sm:text-lg mb-3 text-foreground">Follow Us</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target='_blank'
                    className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#e1802be0] hover:border-[#e1802be0] transition-all duration-300"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {/* Bottom Bar */}
      <div className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Flex container with justify-between */}
          <div className="flex flex-col md:flex-row items-center justify-between">

            {/* Left section */}
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © 2025 Sambhāṣinī (संभाषिणी) — JetHat AI. All rights reserved.
            </p>

            {/* Right section */}
            <div className="flex items-center space-x-2 text-muted-foreground mt-4 md:mt-0">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Crafted with passion in JetHat AI</span>
              <Coffee className="h-4 w-4 text-yellow-600" />  
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer