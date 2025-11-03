import { CheckCircle, UserSquare2, ShoppingCart, Home, Calendar, MessageCircle, Bot, TrendingUp } from 'lucide-react'

const Usecase = () => {
  const useCases = [
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "E-commerce Support",
      shortDesc: "24/7 order tracking & returns",
      description: "Provide instant answers about orders, returns, and shipping. Boost customer satisfaction with automated support.",
      benefits: ["Instant order tracking", "Automated returns", "24/7 availability"],
      stats: "95% faster response",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Home className="h-8 w-8" />,
      title: "Real Estate Leads",
      shortDesc: "Smart lead qualification",
      description: "Qualify leads with intelligent questions about preferences, budget, and location. Capture high-quality prospects.",
      benefits: ["Lead qualification", "Property matching", "Instant scheduling"],
      stats: "3x more qualified leads",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Event Registration",
      shortDesc: "Seamless event signup",
      description: "Guide attendees through registration and answer event questions. Reduce form abandonment significantly.",
      benefits: ["Streamlined registration", "Event information", "Auto confirmations"],
      stats: "60% less abandonment",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Customer Support",
      shortDesc: "Instant help & guidance",
      description: "Handle common queries, troubleshoot issues, and escalate complex cases to human agents seamlessly.",
      benefits: ["Instant responses", "Issue resolution", "Smart escalation"],
      stats: "80% query resolution",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: "Lead Generation",
      shortDesc: "Convert visitors to leads",
      description: "Engage website visitors, collect contact information, and nurture prospects through intelligent conversations.",
      benefits: ["Visitor engagement", "Contact collection", "Lead nurturing"],
      stats: "4x conversion rate",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Sales Assistant",
      shortDesc: "Boost sales conversions",
      description: "Guide customers through product selection, answer questions, and help complete purchases seamlessly.",
      benefits: ["Product recommendations", "Price comparisons", "Purchase assistance"],
      stats: "35% sales increase",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border">
            <UserSquare2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-[#e1802be0]">Use Cases</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Transform Your Business with <br />
            <span className='text-[#e1802be0]'>AI-Powered Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how JetHat AI revolutionizes customer engagement across industries
          </p>
        </div>

        {/* Flipable Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="group perspective-1000 h-64">
              <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                
                {/* Front of Card */}
                <div className={`absolute inset-0 backface-hidden rounded-2xl shadow-elegant border overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${
                  index === 1 
                    ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950' 
                    : 'border-border hover:border-[#e1802be0]/50 hover:shadow-elegant-lg bg-card'
                }`}>
                  {/* Popular Badge for E-commerce (index 1) */}
                    {/* {index === 1 && (
                      <div className="absolute -top-3  left-1/2 transform -translate-x-1/2 z-60">
                        <div className="bg-[#e1802be0] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <span>Popular</span>
                        </div>
                      </div>
                    )} */}
                  
                  <div className="h-full p-6 flex flex-col justify-between">
                    <div>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md ${
                        index === 1 
                          ? 'bg-[#e1802be0] text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                        {useCase.icon}
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${
                        index === 1 ? 'text-[#e1802be0]' : 'text-foreground'
                      }`}>{useCase.title}</h3>
                      <p className="text-muted-foreground text-sm">{useCase.shortDesc}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-muted/50 rounded-full px-3 py-1">
                        Hover to flip
                      </span>
                      <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-elegant border p-6 ${
                  index === 1 
                    ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950' 
                    : 'border-border bg-card'
                }`}>
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                          index === 1 
                            ? 'bg-[#e1802be0] text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}>
                          {useCase.icon}
                        </div>
                        <h4 className={`font-bold ${
                          index === 1 ? 'text-[#e1802be0]' : 'text-foreground'
                        }`}>{useCase.title}</h4>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        {useCase.description}
                      </p>

                      <div className="space-y-2">
                        {useCase.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className={`h-3 w-3 flex-shrink-0 ${
                              index === 1 ? 'text-[#e1802be0]' : 'text-green-500'
                            }`} />
                            <span className="text-xs text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Performance</span>
                        <span className={`text-sm font-bold ${
                          index === 1 ? 'text-[#e1802be0]' : 'text-green-500'
                        }`}>{useCase.stats}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gray-100 dark:bg-black rounded-2xl p-8 border border-border">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Ready to Transform Your Business?
              </h3>
              <p className="text-muted-foreground">
                Start building your AI-powered chatbot today and see immediate results
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="font-semibold text-foreground text-sm">Quick Setup</div>
                <div className="text-xs text-muted-foreground">5 minutes</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="font-semibold text-foreground text-sm">AI Powered</div>
                <div className="text-xs text-muted-foreground">Smart responses</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="font-semibold text-foreground text-sm">Proven Results</div>
                <div className="text-xs text-muted-foreground">Higher conversions</div>
              </div>
            </div>
            
            <button className="bg-[#e1802be0] hover:bg-[#d1722a] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl">
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* CSS for 3D flip effect */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .group:hover .group-hover\\:rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}

export default Usecase