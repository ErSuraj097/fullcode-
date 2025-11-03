import { motion } from 'framer-motion';
import { Bot, ArrowRight, Check } from 'lucide-react';

const LanguageCard = ({ }) => {
  return (
    <motion.div
      className="bg-card/20 rounded-lg p-4 shadow-sm relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="text-sm text-foreground font-medium">{message}</div>
      <div className="text-xs text-muted-foreground mt-1">{language}</div>
      <motion.div
        className="absolute top-2 right-2 opacity-0"
        whileHover={{ opacity: 1, scale: 1.2 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Check className="h-5 w-5 text-primary" />
      </motion.div>
    </motion.div>
  );
};

const AIAssistantWindow = () => {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-card/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-border/20">
        {/* macOS Window Header */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer"></div>
        </div>

        {/* AI Assistant Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-lg">AI Assistant</div>
            <div className="text-sm text-muted-foreground">Online</div>
          </div>
        </div>

        {/* Language Cards with Animated Checkmark */}
        <div className="space-y-4">
          <LanguageCard message="नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?" language="Hindi" />
          <LanguageCard message="வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?" language="Tamil" />
          <LanguageCard message="Hello! How can I assist you today?" language="English" />
        </div>

        {/* Input and Send Button */}
        <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-border/30">
          <div className="flex-1 bg-card/20 rounded-lg px-4 py-2.5 text-sm text-foreground font-medium">
            Type your message...
          </div>
          <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantWindow;