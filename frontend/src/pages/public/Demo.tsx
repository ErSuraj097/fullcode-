import { ArrowRight, Bot, CheckCircle } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import AnimatedChatbot from './AnimatedChatbot'

const Demo = () => {
  return (
    <div>

              {/* Animated Demo Section */}
      <section id="demo" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              See JetHat AI in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how our intelligent chatbots deliver seamless, multilingual conversations that drive engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-card rounded-3xl p-8 shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-border">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <Bot className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Live Demo</h3>
                    <p className="text-muted-foreground">Real-time conversation simulation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Seamless conversation flow</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Multilingual responses</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Natural typing animations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Sleek Mac-style interface</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Experience smooth, realistic conversations with our AI-driven demo, showcasing multilingual capabilities.
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>Build Your Own</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <AnimatedChatbot />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Demo