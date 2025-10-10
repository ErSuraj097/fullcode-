import { ArrowRight, Bot, FileLineChart, Languages, MessageCircle, Palette, Volume2, Zap, Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/cn'
import { CodeBracketIcon } from '@heroicons/react/24/outline';


import Integrate from '../../../public/Integration2.png'
import Color from '../../../public/Color.png'
import Advanced from '../../../public/Advanced.png'
import Language from '../../../public/Language.png'
import Voice from '../../../public/Voice.png'


const Feature = () => {

  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Languages className="h-8 w-8" />,
      title: "22+ Indian Languages",
      description: "Engage customers effortlessly across India by supporting Hindi, Tamil, Bengali, Telugu, Marathi, and 17+ other regional languages. Sambhāṣinī delivers natural, human-like conversations with beautifully rendered typography that highlights every script and accent.",
      image: Language // Placeholder image name
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Advanced AI Engine",
      description:
        "Quick-start Basics – Begin with core NLP and simple APIs for fast setup \n Intermediate Growth – Expand to multilingual contextual chat and custom training. \n Advanced Scaling – Scale to generative, multimodal AI with self-learning agents and live translation. \n From quick-start basics to enterprise-grade intelligence: begin with core NLP and simple APIs, grow with multilingual contextual chat and custom training, and scale to generative, multimodal AI with self-learning agents and live translation.",
      image: Advanced,
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Customizable Design",
      description: "Absolutely! With full customization options, you can modify colors, fonts, chat bubble styles, avatars, animations, and backgrounds to perfectly align with your brand identity. Add your logo, choose unique themes, and design engaging conversation flows that make your chatbot feel like a natural extension of your website or app. Whether it’s playful, professional, or minimalistic, every visual element can be tailored to create a seamless and immersive user experience.",
      image: Color// Placeholder image name
    },
    {
      icon: <CodeBracketIcon className="h-8 w-8" />,
      title: "Seamless Integration",
      description: "The chatbot can be embedded on your website, landing pages, or web apps with a simple copy-paste script or plugin. It supports all major frameworks like React, Angular, and WordPress. No complex configurations required—get your AI assistant live in minutes and start engaging visitors immediately.",
      image: Integrate // Placeholder image name
    },
    {
      icon: <Volume2 className="h-8 w-8" />,
      title: "Lifelike Voice Interaction",
      description: "Deliver natural voice responses in multiple Indian languages for an immersive experience.",
      image: Voice // Placeholder image name
    },


  ];
  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  ">
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border">
          <FileLineChart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-[#e1802be0] text-foreground">Smart Features</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">


          Transform Your Business <br /><span className='text-[#e1802be0]'>Smart Features</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Build multilingual chatbots that captivate and convert customers across India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:h-[680px]">
        <div className="space-y-8 overflow-y-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                'relative p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-elegant border',
                activeFeature === index
                  ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950'
                  : 'bg-card border-border hover:border-[#e1802be0]/50 hover:shadow-elegant-lg'
              )}
              onClick={() => setActiveFeature(index)}
            >
              {/* Popular Badge for Advanced AI Engine (index 1) */}
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#e1802be0] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-current" />
                    <span>Popular</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className={cn(
                  'w-16 h-16 rounded-xl flex items-center justify-center shadow-md',
                  activeFeature === index
                    ? 'bg-[#e1802be0] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                )}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className={cn(
                    'text-lg font-semibold mb-1',
                    activeFeature === index ? 'text-[#e1802be0]' : 'text-foreground'
                  )}>{feature.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {activeFeature === index ? 'Active Feature' : 'Click to explore'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden">
          <style>{`
                @keyframes slideInRight {
                  from {
                    transform: translateX(100%);
                    opacity: 0;
                  }
                  to {
                    transform: translateX(0);
                    opacity: 1;
                  }
                }
                .slide-in-right {
                  animation: slideInRight 0.5s ease-out forwards;
                }
              `}</style>
          <div className={cn(
            'backdrop-blur-2xl p-8 shadow-elegant border h-[100%] overflow-y-auto rounded-2xl',
            activeFeature === 1
              ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950'
              : 'bg-card/10 border-border'
          )}>
            <div key={activeFeature} className="slide-in-right">
              <div className="flex items-center space-x-3 mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shadow-md',
                  activeFeature === 1
                    ? 'bg-[#e1802be0] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                )}>
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className={cn(
                    'font-semibold text-lg',
                    activeFeature === 1 ? 'text-[#e1802be0]' : 'text-foreground'
                  )}>{features[activeFeature].title}</div>
                  <div className="text-sm text-muted-foreground">Feature Details</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className={cn(
                  'rounded-lg p-4 shadow-sm',
                  activeFeature === 1
                    ? 'bg-white/50 dark:bg-black/50 border border-[#e1802be0]/20'
                    : 'bg-card/20'
                )}>
                  <div className="text-sm text-foreground font-medium leading-relaxed">
                    {features[activeFeature].description}
                  </div>
                </div>
              </div>
              <img
                src={features[activeFeature].image}
                alt={features[activeFeature].title}
                className="mt-6 w-full h-auto rounded-lg shadow-md border border-border/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>


    // <div className="bg-gray-100 dark:bg-black rounded-2xl p-8 mt-16 border border-border">
    //   <div className="text-center mb-8">
    //     <h3 className="text-2xl font-bold text-foreground mb-2">
    //       Why Choose Our Features
    //     </h3>
    //     <p className="text-muted-foreground">
    //       Built for performance, designed for scale
    //     </p>
    //   </div>

    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //     <div className="flex items-center space-x-3">
    //       <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
    //         <Zap className="h-5 w-5 text-white" />
    //       </div>
    //       <div>
    //         <h4 className="font-semibold text-foreground">Lightning Fast</h4>
    //         <p className="text-sm text-muted-foreground">Sub-second response times</p>
    //       </div>
    //     </div>

    //     <div className="flex items-center space-x-3">
    //       <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
    //         <Languages className="h-5 w-5 text-white" />
    //       </div>
    //       <div>
    //         <h4 className="font-semibold text-foreground">Multilingual</h4>
    //         <p className="text-sm text-muted-foreground">22+ Indian languages</p>
    //       </div>
    //     </div>

    //     <div className="flex items-center space-x-3">
    //       <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
    //         <Palette className="h-5 w-5 text-white" />
    //       </div>
    //       <div>
    //         <h4 className="font-semibold text-foreground">Customizable</h4>
    //         <p className="text-sm text-muted-foreground">Match your brand perfectly</p>
    //       </div>
    //     </div>
    //   </div>
    // </div>

  )
}

export default Feature