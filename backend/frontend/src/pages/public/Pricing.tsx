import { CheckCircle, Crown, CreditCard, Sparkles, Star, ArrowRight, Zap, Shield, Users, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useAuth } from '../../providers/AuthProvider'

const Pricing = () => {
  const { user } = useAuth()

  const pricingPlans = [
    {
      name: "Basic",
      price: "₹999",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "1 Domain",
        "1,000 conversations/month",
        "2 Indian languages",
        "Basic AI model",
        "Email support"
      ],
      popular: false,
      planType: "basic",
      icon: <Sparkles className="h-5 w-5" />,
      buttonText: "Get Started Free",
      highlight: false
    },
    {
      name: "Professional",
      price: "₹1999",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "1 Domain",
        "Unlimited conversations",
        "5 Indian languages",
        "Advanced AI model",
        "Priority support"
      ],
      popular: true,
      planType: "professional",
      icon: <Crown className="h-5 w-5" />,
      buttonText: "Start Professional",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "₹3999",
      period: "/month",
      description: "For large organizations",
      features: [
        "Multiple Domains",
        "Unlimited conversations",
        "22+ Indian languages",
        "Premium AI model",
        "Dedicated support"
      ],
      popular: false,
      planType: "enterprise",
      icon: <Shield className="h-5 w-5" />,
      buttonText: "Go Enterprise",
      highlight: false
    },
    {
      name: "Custom",
      price: "Contact Us",
      period: "",
      description: "Tailored solutions",
      features: [
        "Unlimited everything",
        "Enterprise security",
        "Custom AI training",
        "All languages",
        "24/7 account manager"
      ],
      popular: false,
      planType: "custom",
      icon: <Users className="h-5 w-5" />,
      buttonText: "Contact Sales",
      highlight: false
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-[#e1802be0]">Flexible Plans</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          Pricing That <br />  <span className="text-[#e1802be0]">Scales with You</span>
        </h2>

        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Choose a plan designed to unlock the full potential of AI-driven customer engagement across India's diverse linguistic landscape.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className={cn(
              'relative rounded-xl p-5 transition-all duration-300 bg-card border shadow-elegant hover:shadow-elegant-lg transform hover:-translate-y-1 h-[420px] flex flex-col',
              plan.highlight
                ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950'
                : 'border-border hover:border-[#e1802be0]/50'
            )}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#e1802be0] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Popular</span>
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-4 flex-shrink-0">
              <div className={cn(
                'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-md',
                plan.highlight
                  ? 'bg-[#e1802be0] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              )}>
                {plan.icon}
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">
                {plan.name}
              </h3>

              <div className="flex items-baseline justify-center space-x-1 mb-2">
                <span className={cn(
                  'text-2xl font-extrabold',
                  plan.highlight ? 'text-[#e1802be0]' : 'text-foreground'
                )}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-xs text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {plan.description}
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-2 mb-4 flex-grow">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start space-x-2">
                  <CheckCircle className={cn(
                    'h-4 w-4 mt-0.5 flex-shrink-0',
                    plan.highlight ? 'text-[#e1802be0]' : 'text-green-500'
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="mt-auto">
              {plan.planType === 'custom' ? (
                <Link
                  to="/contact"
                  className={cn(
                    'flex w-full py-2.5 px-4 rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg items-center justify-center space-x-2 text-sm',
                    'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                  )}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <Link
                  to={user ? "/app/dashboard" : "/register"}
                  className={cn(
                    'flex w-full py-2.5 px-4 rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg items-center justify-center space-x-2 text-sm',
                    plan.highlight
                      ? 'bg-[#e1802be0] text-white hover:bg-[#d1722a]'
                      : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                  )}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Features Section */}
      <div className="bg-gray-100  dark:bg-black rounded-2xl p-8 mb-16 border border-border">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            All Plans Include
          </h3>
          <p className="text-muted-foreground">
            Essential features to power your AI chatbot experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Lightning Fast</h4>
              <p className="text-sm text-muted-foreground">Sub-second response times</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Secure & Private</h4>
              <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">24/7 Support</h4>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      {/* <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-4">
          Questions? We're here to help
        </h3>
        <p className="text-muted-foreground mb-6">
          Can't find the right plan? Contact our sales team for a custom solution.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center space-x-2 bg-[#e1802be0] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#d1722a] transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Phone className="h-5 w-5" />
          <span>Contact Sales</span>
        </Link>
      </div> */}
    </div>
  )
}

export default Pricing