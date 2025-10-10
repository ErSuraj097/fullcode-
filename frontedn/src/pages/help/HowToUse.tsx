import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Book, Settings, Code, Zap, HelpCircle, ArrowRight } from 'lucide-react';

const HowToUse: React.FC = () => {
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      href: '/register',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Getting Started with JetChat AI</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to JetChat AI! Follow these steps to create your first chatbot.
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Sign Up</h4>
                <p className="text-gray-600 dark:text-gray-400">Create your account to access the dashboard.</p>
                <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center mt-1">
                  Sign up now <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Create a Project</h4>
                <p className="text-gray-600 dark:text-gray-400">Set up your first chatbot project.</p>
                <Link to="/app/projects/new" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center mt-1">
                  Create project <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Train Your Bot</h4>
                <p className="text-gray-600 dark:text-gray-400">Upload data and train your AI model.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Configure Widget</h4>
                <p className="text-gray-600 dark:text-gray-400">Customize the chat widget appearance.</p>
                <Link to="/app/dashboard" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center mt-1">
                  Go to dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: Settings,
      href: '/app/dashboard',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Widget Configuration</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your chatbot widget to match your brand and user experience.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Basic Settings</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Set bot name and greeting message</li>
                <li>Choose position on your website</li>
                <li>Configure theme colors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Appearance</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Adjust widget size and border radius</li>
                <li>Customize colors and fonts</li>
                <li>Upload agent avatar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Behavior</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Enable auto-open and sound</li>
                <li>Configure typing indicators</li>
                <li>Set session timeouts</li>
              </ul>
            </div>
          </div>
          <Link to="/app/dashboard" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Configure Widget <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )
    },
    {
      id: 'integration',
      title: 'Integration',
      icon: Code,
      href: '/integration',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Website Integration</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Integrate your chatbot into any website with a simple code snippet.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Supported Platforms</h4>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['WordPress', 'Shopify', 'Webflow', 'Wix', 'Squarespace', 'Custom HTML'].map(platform => (
                  <div key={platform} className="text-sm text-gray-600 dark:text-gray-400">• {platform}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Integration Steps</h4>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Build and configure your chatbot</li>
                <li>Copy the embed code</li>
                <li>Paste into your website</li>
              </ol>
            </div>
          </div>
          <Link to="/integration" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Integration Guide <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: Zap,
      href: '/app/dashboard',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Features</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unlock powerful features to enhance your chatbot experience.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">AI Training</h4>
              <p className="text-gray-600 dark:text-gray-400">Upload custom data to train your AI model for better responses.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Analytics</h4>
              <p className="text-gray-600 dark:text-gray-400">Track user interactions and chatbot performance.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Custom CSS</h4>
              <p className="text-gray-600 dark:text-gray-400">Add custom styling to match your brand perfectly.</p>
            </div>
          </div>
          <Link to="/app/dashboard" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Explore Advanced Features <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      href: '/#faq',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">How do I reset my chatbot?</h4>
              <p className="text-gray-600 dark:text-gray-400">Go to your project settings and click "Reset Training Data".</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Can I use multiple chatbots?</h4>
              <p className="text-gray-600 dark:text-gray-400">Yes, create multiple projects for different chatbots.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Is my data secure?</h4>
              <p className="text-gray-600 dark:text-gray-400">All data is encrypted and stored securely in compliance with privacy standards.</p>
            </div>
          </div>
          <Link to="/#faq" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Full FAQ <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How to Use JetChat AI</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Complete guide to setting up and using your AI chatbot</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Link
                      key={section.id}
                      to={section.href}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.title}</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="space-y-8">
                {sections.map((section) => (
                  <div key={section.id} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0 last:pb-0">
                    {section.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;
