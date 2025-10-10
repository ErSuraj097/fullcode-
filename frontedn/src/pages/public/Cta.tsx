import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const Cta = () => {
  return (
    <div>
      <section className="py-20 ">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
            Redefine Customer Engagement Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses transforming customer interactions with AI chatbots in their native languages.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-[#e1802be0] text-primary-foreground px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
            to={"/contact"}
             className="border-2 border-border px-8 py-4 rounded-full font-semibold hover:bg-muted hover:text-muted-foreground transition-all duration-300 transform hover:-translate-y-0.5">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Cta