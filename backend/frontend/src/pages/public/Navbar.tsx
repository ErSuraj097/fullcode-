import { useState, useEffect } from 'react'
import Logo from '../../../public/SANBHASINI.png'
import { useTheme } from '../../providers/ThemeProvider';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { Menu, X, ChevronDown, Sparkles, Zap } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

const Navbar = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#', icon: null },
    { name: 'Features', href: '#features', icon: <Sparkles className="h-4 w-4" /> },
     { name: 'Pricing', href: '#pricing', icon: null },
    { name: 'Use Cases', href: '#use-cases', icon: null },
    { name: 'Reviews', href: '#testimonials', icon: null },
   
    { name: 'FAQ', href: '#faq', icon: null },
    
    { name: 'Contact', href: '#contact', icon: null },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-lg border-b border-border/50'
      : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex items-center">
            <div
              className="flex items-center cursor-pointer group "
              onClick={() => navigate('/')}
            >
              <div className="w-56 h-12 relative overflow-hidden rounded-lg">
                <img
                  src={Logo}
                  alt="JetHat AI Logo"
                  className="w-full h-full  "
                />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="relative px-4 py-2 rounded-lg text-foreground hover:text-[#e1802be0] font-medium transition-all duration-300 group"
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                <div className="absolute inset-0 bg-[#e1802be0]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#e1802be0] group-hover:w-full group-hover:left-0 transition-all duration-300"></div>
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4   ">
            {/* Theme Toggle */}
            {/* <div className="hidden md:block">
              <ThemeToggle />
            </div> */}

            {/* CTA Button */}
            {user ? (
              <button
                onClick={() => navigate('/app/dashboard')}
                className="hidden md:flex items-center space-x-2 relative group bg-orange-600/5text-[#e1802be0] px-6 py-2.5  font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <Zap className="h-4 w-4" />
                <span>Dashboard</span>

                {/* Bottom arrow + shadow accent */}
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500 rounded-b-xl shadow-[0_4px_10px_rgba(225,128,43,0.5)] group-hover:shadow-[0_6px_15px_rgba(225,128,43,0.7)] transition-all duration-300"></span>
              </button>
            ) : (
              <Link
                to="/register"
                className="hidden md:flex items-center space-x-2 relative group bg-orange-600/5 text-[#e1802be0] px-6 py-2.5  font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                <span>Get Started</span>

                {/* Bottom arrow + shadow accent */}
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500 rounded-b-xl shadow-[0_4px_10px_rgba(225,128,43,0.5)] group-hover:shadow-[0_6px_15px_rgba(225,128,43,0.7)] transition-all duration-300"></span>
              </Link>
            )}


            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden  p-2 rounded-lg hover:bg-muted/50 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ${mobileMenuOpen
        ? 'max-h-screen opacity-100'
        : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
        <div className="'bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-lg border-b border-border/50">
          <div className="px-4 py-6 space-y-2">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:text-[#e1802be0] hover:bg-[#e1802be0]/10 font-medium transition-all duration-300"
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}

            {/* Mobile Theme Toggle */}
            {/* <div className="px-4 py-3">
              <ThemeToggle />
            </div> */}

            {/* Mobile CTA */}
            <div className="px-4 pt-4 ">
              {user ? (
                <button
                  onClick={() => {
                    navigate('/app/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center bg-orange-600/5 justify-center space-x-2 relative group text-orange-600  px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <Zap className="h-4 w-4" />
                  <span>Dashboard</span>

                  {/* Bottom gradient underline with glow */}
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-600 rounded-b-xl shadow-[0_4px_10px_rgba(225,128,43,0.5)] group-hover:shadow-[0_6px_15px_rgba(225,128,43,0.7)] transition-all duration-300"></span>
                </button>
              ) : (
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center bg-orange-600/5 justify-center space-x-2 relative group text-orange-600  px-6 py-3  font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className=''>Get Started</span>

                  {/* Bottom gradient underline with glow */}
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-600 rounded-b-xl shadow-[0_4px_10px_rgba(225,128,43,0.5)] group-hover:shadow-[0_6px_15px_rgba(225,128,43,0.7)] transition-all duration-300"></span>
                </Link>
              )}

            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar