import { useState } from 'react';
import { ChevronDown, FileLineChart, Star, HelpCircle, MessageCircle, Zap } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  popular?: boolean;
}

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([1]); // Open popular item by default

  const faqData: FAQItem[] = [
    {
      question: "What is JetHat AI?",
      answer: "Advanced multilingual chatbot builder supporting 22+ Indian languages with AI-powered voice responses.",
      popular: false
    },
    {
      question: "Which languages are supported?",
      answer: "22+ Indian languages including Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, and more with beautiful typography.",
      popular: true
    },
    {
      question: "Can I customize the appearance?",
      answer: "Yes! Customize colors, themes, avatars, fonts, and animations to match your brand perfectly.",
      popular: false
    },
    {
      question: "How easy is integration?",
      answer: "Very easy! Just copy and paste our code snippet. Works with all major platforms and frameworks.",
      popular: false
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Start building immediately with our free tier. Upgrade anytime for advanced features.",
      popular: false
    },
    {
      question: "How reliable is the service?",
      answer: "99.9% uptime guarantee with enterprise-grade infrastructure handling millions of conversations daily.",
      popular: false
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-16 bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border">
            <FileLineChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-[#e1802be0]">FAQ</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Frequently Asked <br />
            <span className='text-[#e1802be0]'>Questions</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about JetHat AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className={`relative rounded-xl border transition-all duration-300 transform hover:-translate-y-1 shadow-elegant ${item.popular
                  ? 'border-[#e1802be0] shadow-elegant-lg bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-orange-950'
                  : 'border-border bg-card hover:border-[#e1802be0]/50 hover:shadow-elegant-lg'
                  }`}
              >
                {/* Popular Badge */}
                {item.popular && (
                  <div className="absolute -top-2 left-4">
                    <div className="bg-[#e1802be0] text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                      Popular
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="w-full p-4 text-left flex items-center justify-between focus:outline-none"
                  onClick={() => toggleItem(index)}
                >
                  <span className={`font-semibold text-sm pr-2 ${item.popular ? 'text-[#e1802be0]' : 'text-foreground'
                    }`}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${openItems.includes(index) ? 'rotate-180' : ''
                      } ${item.popular ? 'text-[#e1802be0]' : 'text-muted-foreground'}`}
                  />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${openItems.includes(index) ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  <div className="px-4 pb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Contact */}
          <div className="text-center mt-12">
            <div className="bg-gray-100 dark:bg-black rounded-xl p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-2">Need More Help?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Our support team is ready to assist you 24/7
              </p>
              <button className="bg-[#e1802be0] hover:bg-[#d1722a] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;