import { useEffect, useState } from 'react'
import { cn } from '../../utils/cn'
import { ArrowRight, Bot, Globe, MessageCircle, Play, Shield, Sparkles, X, Star, Zap, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AnimatedChatbot from './AnimatedChatbot'
import { useAuth } from '../../providers/AuthProvider'
import { motion, AnimatePresence } from "framer-motion";

const Hero = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // const stats = [
  //   { number: "22+", label: "Indian Languages", icon: <Globe className="h-5 w-5" /> },
  //   { number: "99.9%", label: "Uptime", icon: <Shield className="h-5 w-5" /> },
  //   { number: "10K+", label: "Active Bots", icon: <Bot className="h-5 w-5" /> },
  //   { number: "1M+", label: "Conversations", icon: <MessageCircle className="h-5 w-5" /> }
  // ];

  const features = [
    "30-second setup",
    "Voice responses",
    "Custom branding",
    "24/7 support"
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20  ">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#e1802be0]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6   lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left space-y-8 "
          >
            {/* Badge */}
            <div className='hidden md:block '>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border  "
            > 
              <Sparkles className="h-4 w-4 text-muted-foreground  " />
              <span className="text-sm font-semibold text-[#e1802be0] ">Next-Gen AI Technology</span>
            </motion.div>
</div>
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className=''    
            >
              <h1 className="text-4xl  md:text-6xl font-extrabold leading-tight   ">
                <span className="text-foreground  ">AI That Speaks</span>
                <br />
                <span className="bg-gradient-to-r from-[#e1802be0] to-orange-600 bg-clip-text text-transparent"
                style={{
  background: 'linear-gradient(to right, #e1802be0, #f97316)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  color: 'transparent'
}}>
                  Every Indian Language
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-lg leading-relaxed"
            >
              India's Premier AI Chatbots - Powering Process Automation in Every Indian Language.
            </motion.p>
            <p className='text-sm italic'>
              Revolutionize engagement with AI chatbots that chat 17+ Indian languages global languages, and align with your brand’s vision.
            </p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-[#e1802be0] fill-current" />
                  <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link
                to="/register"
                className="bg-[#e1802be0] hover:bg-[#d1722a] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl flex items-center space-x-2"
              >
                <span>Create Your Chatbot</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group flex items-center space-x-3 text-foreground hover:text-[#e1802be0] transition-all duration-300"
                aria-label="Watch demo video"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md flex items-center justify-center group-hover:bg-[#e1802be0] group-hover:text-white transition-all duration-300">
                  <Play className="h-5 w-5 ml-0.5 text-gray-600 dark:text-gray-300 group-hover:text-white" />
                </div>
                <span className="font-semibold">Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-100 dark:bg-black rounded-2xl p-6 border border-border"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-2">
                      {stat.icon}
                      <span className="sr-only">{stat.label}</span>
                    </div>
                    <div className="font-semibold text-foreground text-lg">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div> */}
          </motion.div>

          {/* Right Content - Chatbot Animation */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Chatbot Container */}
              <div className="relative bg-card rounded-2xl p-8 border border-border shadow-elegant">
                <AnimatedChatbot />
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-[#e1802be0] rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Bot className="h-8 w-8 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl mx-4 bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all duration-300"
                aria-label="Close video"
              >
                <X className="h-6 w-6" />
              </button>

              <video
                src="/video.mp4"
                controls
                autoPlay
                className="w-full aspect-video object-cover"
                poster="/video-thumbnail.jpg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Hero