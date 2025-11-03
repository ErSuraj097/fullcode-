import { FileLineChart, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function Integration() {
  const [selectedPlatform, setSelectedPlatform] = useState('Vercel')
  const [copied, setCopied] = useState(false)

  const platforms = [
    { id: 'vercel', name: 'Vercel', description: 'Web development platform', color: 'from-black to-gray-800', image: '⚡', logo: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png' },
    { id: 'shopify', name: 'Shopify', description: 'E-commerce platform', color: 'from-green-500 to-green-600', image: '🛒', logo: 'https://cdn.shopify.com/s/files/1/0070/7032/files/shopify_logo_darkbg.svg' },
    { id: 'webflow', name: 'Webflow', description: 'Web design platform', color: 'from-purple-500 to-purple-600', image: '🌐', logo: 'https://assets-global.website-files.com/5d3e265ac89f6a3e64292efc/5d3e265ac89f6a8ad4292f4f_webflow-logo-white.svg' },
    { id: 'wordpress', name: 'WordPress', description: 'CMS platform', color: 'from-blue-500 to-blue-600', image: '📝', logo: 'https://s.w.org/style/images/about/WordPress-logotype-wmark.png' },
    { id: 'wix', name: 'Wix', description: 'Website builder', color: 'from-orange-500 to-orange-600', image: '🔧', logo: 'https://static.wixstatic.com/media/9ab0d1_f2c2b2b4b8b44b4b8b4b4b4b4b4b4b4b~mv2.png' },
    { id: 'squarespace', name: 'Squarespace', description: 'Website builder', color: 'from-gray-800 to-black', image: '◼️', logo: 'https://logo.squarespace.com/api/v1/squarespace-logo.svg' }
  ]

  const technologies = [
    { name: 'React', icon: '⚛️', color: 'text-blue-400' },
    { name: 'Vue.js', icon: '🟢', color: 'text-green-400' },
    { name: 'Angular', icon: '🅰️', color: 'text-red-400' },
    { name: 'Next.js', icon: '▲', color: 'text-gray-400' },
    { name: 'Node.js', icon: '🟩', color: 'text-green-500' },
    { name: 'Python', icon: '🐍', color: 'text-yellow-400' },
    { name: 'PHP', icon: '🐘', color: 'text-purple-400' },
    { name: 'Java', icon: '☕', color: 'text-orange-400' },
    { name: 'Django', icon: '🎸', color: 'text-green-600' },
    { name: 'Laravel', icon: '🔺', color: 'text-red-500' },
    { name: 'Spring Boot', icon: '🌱', color: 'text-green-400' },
    { name: 'Express.js', icon: '🚂', color: 'text-gray-400' },
    { name: 'Flutter', icon: '🦋', color: 'text-blue-300' },
    { name: 'React Native', icon: '📱', color: 'text-blue-400' },
    { name: 'TypeScript', icon: '🔷', color: 'text-blue-500' },
    { name: 'JavaScript', icon: '🟨', color: 'text-yellow-300' }
  ]

  const steps = [
    {
      number: 1,
      title: 'Build & Configure',
      description: 'Our AI analyzes your website content and structure automatically',
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: 2,
      title: 'Copy Code',
      description: 'Get a single line of code that works on any platform',
      color: 'from-green-500 to-green-600'
    },
    {
      number: 3,
      title: 'Go Live',
      description: 'Paste and watch your chatbot start helping customers instantly',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const currentPlatform = platforms.find(p => p.id === selectedPlatform.toLowerCase()) || platforms[0]

  const handleCopyCode = () => {
    const code = `<script>
  window.jetChatConfig = {
    apiKey: 'your-api-key-here',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="https://cdn.jetchat.com/widget.js" async></script>`

    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen  py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border">
            <FileLineChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-[#e1802be0]">Integration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
            Integrates with All <br />
            <span className='text-[#e1802be0]'>Platforms & Technologies</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            No matter what technology powers your website, JetHat AI integrates seamlessly in just 30 seconds.
          </p>
        </div>

        {/* Technology Marquee */}
        <div className="mb-20 overflow-hidden">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Supported Technologies
          </h2>
          <div className="relative">
            <div className="flex animate-marquee space-x-8">
              {[...technologies, ...technologies].map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className="flex-shrink-0 flex items-center space-x-3 bg-card/50 backdrop-blur-sm rounded-xl px-6 py-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <span className="text-2xl">{tech.icon}</span>
                  <span className={`font-semibold ${tech.color} whitespace-nowrap`}>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="mb-16">
          {/* <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Popular Platforms
          </h2> */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((platform, index) => (
              <div
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.name)}
                className={`relative cursor-pointer group transition-all duration-300 transform hover:-translate-y-1 ${selectedPlatform === platform.name ? 'scale-105' : 'hover:scale-105'
                  }`}
              >
                <div className={`rounded-xl p-4 shadow-elegant border-2 transition-all duration-300 h-24 bg-card ${selectedPlatform === platform.name
                  ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950'
                  : 'border-border hover:border-[#e1802be0]/50 hover:shadow-elegant-lg'
                  }`}>
                  {/* Popular Badge for Shopify */}
                  {index === 1 && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#e1802be0] text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                        Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center h-full flex flex-col justify-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 mx-auto ${selectedPlatform === platform.name
                      ? 'bg-[#e1802be0] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                      <span className="text-lg">{platform.image}</span>
                    </div>
                    <span className={`font-medium text-xs ${selectedPlatform === platform.name
                      ? 'text-[#e1802be0]'
                      : 'text-foreground'
                      }`}>{platform.name}</span>
                  </div>

                  {selectedPlatform === platform.name && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#e1802be0] rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Steps - Compact Cards */}
        <div className="mb-16">
          {/* <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            3 Simple Steps
          </h2> */}
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`rounded-xl p-6 shadow-elegant border transition-all duration-300 transform hover:-translate-y-1 bg-card ${index === 1
                  ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950'
                  : 'border-border hover:border-[#e1802be0]/50 hover:shadow-elegant-lg'
                  }`}
              >
                {/* Popular Badge for middle step */}
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#e1802be0] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Important
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${index === 1
                    ? 'bg-[#e1802be0] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}>
                    <span className="text-lg font-bold">{step.number}</span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold mb-2 ${index === 1 ? 'text-[#e1802be0]' : 'text-foreground'
                      }`}>{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Snippet - Compact */}
        <div className="bg-card rounded-xl p-6 shadow-elegant border border-[#e1802be0] bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#e1802be0]">Ready to Integrate?</h3>
              <p className="text-sm text-muted-foreground">Copy this code snippet to get started</p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center space-x-2 bg-[#e1802be0] hover:bg-[#d1722a] text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-green-400 font-mono text-xs overflow-x-auto">
              {`<script>
  window.jetChatConfig = {
    apiKey: 'your-api-key-here',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="https://cdn.jetchat.com/widget.js" async></script>`}
            </pre>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="mt-12 bg-gray-100 dark:bg-black rounded-2xl p-8 border border-border">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Integration Benefits
            </h3>
            <p className="text-muted-foreground">
              Why developers choose JetHat AI for integration
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">30s</span>
              </div>
              <div className="font-semibold text-foreground">Lightning Fast</div>
              <div className="text-sm text-muted-foreground">Setup Time</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">50+</span>
              </div>
              <div className="font-semibold text-foreground">Universal</div>
              <div className="text-sm text-muted-foreground">Platforms Supported</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xs">99.9%</span>
              </div>
              <div className="font-semibold text-foreground">Reliable</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#e1802be0] rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">24/7</span>
              </div>
              <div className="font-semibold text-foreground">Always Here</div>
              <div className="text-sm text-muted-foreground">Developer Support</div>
            </div>
          </div>
        </div> */}
      </div>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}