import React, { useState } from 'react';
import { 
  Copy, 
  Code, 
  LinkIcon, 
  RefreshCw, 
  ExternalLink,
  Monitor,
  Smartphone,
  Globe,
  Zap,
  Eye,
  Download,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';

interface WidgetConfig {
  bot_name: string;
  greeting_message: string;
  theme_color: string;
  header_color: string;
  text_color: string;
  user_bubble_color: string;
  bot_bubble_color: string;
  agent_name: string;
  agent_title: string;
  agent_avatar: string;
  agent_description: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  width: number;
  height: number;
  border_radius: number;
  font_family: string;
  font_size: number;
  auto_open: boolean;
  auto_open_delay: number;
  enable_sound: boolean;
  enable_typing_indicator: boolean;
  show_timestamps: boolean;
  show_branding: boolean;
  typing_delay: number;
  language: string;
  background_type: 'solid' | 'gradient' | 'image';
  background_value: string;

  // Advanced options
  bubble_style?: string;
  animation_style?: string;
  max_messages?: number;
  session_timeout?: number;
  welcome_delay?: number;
  minimize_enabled?: boolean;
  custom_css?: string;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  agent?: string;
  feedback?: 'positive' | 'negative' | null;
  showFeedback?: boolean;
}
interface EmbedCodeGeneratorProps {
  config: WidgetConfig;
  projectId: string;
  onSaveConfig: () => Promise<void>;
}

const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ config, projectId, onSaveConfig }) => {
  const [selectedType, setSelectedType] = useState<'direct' | 'iframe' >('direct');
  const [embedCodes, setEmbedCodes] = useState<{[key: string]: string}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const generateAllEmbedCodes = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    setIsGenerating(true);
    
    try {
      // First save the current configuration
      try {
        await onSaveConfig();
      } catch (error) {
        console.warn('Could not save config, proceeding with current config:', error);
      }
      
      // const baseUrl = window.location.origin || 'http://13.204.80.131:8000';

      // const baseUrl = 'https://chat.jethat.in/' ;
      // const baseUrl = 'http://0.0.0.0:8000/'.   "https://sambhasini.jethat.in/" ;
      const url = window.location.href
      console.log(url)
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const widgetUrl = `${baseUrl}widget/${projectId}?disable-hmr=true`;

      // 1. Direct Link - Simple URL for opening in new tab
      const directLink = widgetUrl;
      
      // 2. Iframe Embed - For embedding directly in websites
   
      const iframeCode = `

<!-- Bot: AI Assistant | Agent: Mira -->
  <div id="chat-icon">
    <span id="chat-symbol">💬</span>
    <span id="chat-notification"></span>
  </div>

  <iframe
    id="chat-frame"
    src=http://192.168.1.2:5173/widget/ce82290b-367e-4396-aa61-6ee5f4dd4004?disable-hmr=truehttp://localhost:5173/app/projects/ce82290b-367e-4396-aa61-6ee5f4dd4004/widget/advanced
    title="Mira - Client Feedback Specialist"
    loading="lazy"
  ></iframe>

  <h1>Welcome to the AI Chatbot Demo Page!</h1>

  <script>
    const chatIcon  = document.getElementById('chat-icon');
    const chatFrame = document.getElementById('chat-frame');
    const symbol    = document.getElementById('chat-symbol');

    function openChat() {
      chatFrame.style.display = 'block';
      symbol.textContent = 'X'; // replace icon with X
    }

    function closeChat() {
      chatFrame.style.display = 'none';
      symbol.textContent = '💬'; // revert back to chat icon
    }

    chatIcon.addEventListener('click', (e) => {
      const isHidden = chatFrame.style.display === 'none' || chatFrame.style.display === '';
      isHidden ? openChat() : closeChat();
      e.stopPropagation(); // prevent outside-click handler from firing
    });

    // show badge after 5s for demo
    setTimeout(() => { badge.style.display = 'flex'; }, 5000);

    // Close if user clicks outside iframe and icon
    document.addEventListener('click', (e) => {
      if (chatFrame.style.display === 'block') {
        const clickedInsideIcon  = chatIcon.contains(e.target);
        const clickedInsideFrame = chatFrame.contains(e.target);
        if (!clickedInsideIcon && !clickedInsideFrame) {
          closeChat();
        }
      }
    });
  </script>
<!-- Iframe styles -->
<style>
  
    /* Floating chat icon */
    #chat-icon {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      cursor: pointer;
      z-index: 11112;
      color: #fff;
      transition: background 0.3s;
    }

    #chat-frame {
      position: fixed;
      bottom: 5px;
      right: 20px;
      border: none;
      display: none;
      z-index: 11111;
      width: 450px;
      height: 680px;
      max-width: 100%;
      max-height: 90vh;
    }

    @media (max-width: 768px) {
      #chat-frame {
        width: 320px !important;
        height: 500px !important;
      }
    }

  </style>`
;



 // width="${config.width}"
  // height="${config.height}"
      // 3. HTML Button + Modal - Click to open in popup
//       const htmlCode = `<!-- AI Chatbot Widget - HTML Button + Modal -->
// <button id="chatbot-btn-${projectId}" onclick="openChatModal_${projectId}()" style="
//   background: ${config.theme_color}; 
//   color: white; 
//   border: none; 
//   padding: 12px 24px; 
//   border-radius: ${config.border_radius}px; 
//   cursor: pointer;
//   font-family: ${config.font_family};
//   font-size: 14px;
//   box-shadow: 0 2px 8px rgba(0,0,0,0.15);
//   transition: all 0.3s ease;
// ">
//   💬 Chat with ${config.agent_name}
// </button>

// <script>
// function openChatModal_${projectId}() {
//   // Create modal overlay
//   var overlay = document.createElement('div');
//   overlay.id = 'chatbot-modal-${projectId}';
//   overlay.style.cssText = 
//     'position: fixed; top: 0; left: 0; width: 100%; height: 100%; ' +
//     'background: rgba(0,0,0,0.5); z-index: 10000; display: flex; ' +
//     'align-items: center; justify-content: center;';
  
//   // Create iframe container
//   var container = document.createElement('div');
//   container.style.cssText = 
//     'position: relative; width: ${config.width}px; height: ${config.height}px; ' +
//     'max-width: 90vw; max-height: 90vh; border-radius: ${config.border_radius}px; ' +
//     'box-shadow: 0 8px 32px rgba(0,0,0,0.3); overflow: hidden;';
  
//   // Create iframe
//   var iframe = document.createElement('iframe');
//   iframe.src = '${widgetUrl}';
//   iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
//   iframe.allow = 'microphone; camera';
//   iframe.title = '${config.agent_name} - ${config.agent_title}';
  
//   // Create close button
//   var closeBtn = document.createElement('button');
//   closeBtn.innerHTML = '✕';
//   closeBtn.style.cssText = 
//     'position: absolute; top: -10px; right: -10px; background: white; ' +
//     'border: none; width: 30px; height: 30px; border-radius: 50%; ' +
//     'cursor: pointer; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); ' +
//     'z-index: 10001;';
  
//   closeBtn.onclick = function() {
//     document.body.removeChild(overlay);
//   };
  
//   overlay.onclick = function(e) {
//     if (e.target === overlay) {
//       document.body.removeChild(overlay);
//     }
//   };
  
//   container.appendChild(iframe);
//   container.appendChild(closeBtn);
//   overlay.appendChild(container);
//   document.body.appendChild(overlay);
// }

// // Style the button on hover
// document.addEventListener('DOMContentLoaded', function() {
//   var btn = document.getElementById('chatbot-btn-${projectId}');
//   if (btn) {
//     btn.addEventListener('mouseenter', function() {
//       this.style.transform = 'translateY(-2px)';
//       this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
//     });
//     btn.addEventListener('mouseleave', function() {
//       this.style.transform = 'translateY(0)';
//       this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
//     });
//   }
// });
// </script>`;

//       // 4. JavaScript Embed - Advanced floating widget with full configuration
//       const jsCode = `<!-- Advanced AI Chatbot Widget - Full Configuration -->
// <script>
// (function() {
//   // Advanced Widget Configuration
//   window.MULTILINGUAL_WIDGET_CONFIG = {
//     projectId: '${projectId}',
//     apiUrl: '${baseUrl}',
//     widgetUrl: '${widgetUrl}',
    
//     // Bot Configuration
//     bot_name: '${config.bot_name}',
//     greeting_message: '${config.greeting_message}',
//     agent_name: '${config.agent_name}',
//     agent_title: '${config.agent_title}',
//     agent_avatar: '${config.agent_avatar}',
//     agent_description: '${config.agent_description}',
    
//     // Appearance
//     theme_color: '${config.theme_color}',
//     header_color: '${config.header_color}',
//     text_color: '${config.text_color}',
//     user_bubble_color: '${config.user_bubble_color}',
//     bot_bubble_color: '${config.bot_bubble_color}',
//     position: '${config.position}',
//     width: ${config.width},
//     height: ${config.height},
//     border_radius: ${config.border_radius},
//     font_family: '${config.font_family}',
//     font_size: ${config.font_size},
//     background_type: '${config.background_type}',
//     background_value: '${config.background_value}',
    
//     // Behavior
//     auto_open: ${config.auto_open},
//     auto_open_delay: ${config.auto_open_delay},
//     enable_sound: ${config.enable_sound},
//     enable_typing_indicator: ${config.enable_typing_indicator},
//     show_timestamps: ${config.show_timestamps},
//     show_branding: ${config.show_branding},
//     typing_delay: ${config.typing_delay},
//     language: '${config.language}',
    
//     // Advanced Features
//     bubble_style: '${config.bubble_style || 'rounded'}',
//     animation_style: '${config.animation_style || 'slide'}',
//     max_messages: ${config.max_messages || 100},
//     session_timeout: ${config.session_timeout || 1800},
//     welcome_delay: ${config.welcome_delay || 2000},
//     minimize_enabled: ${config.minimize_enabled !== false},
//     custom_css: \`${config.custom_css || ''}\`
//   };
  
//   var config = window.MULTILINGUAL_WIDGET_CONFIG;
  
//   // Create floating widget button
//   var button = document.createElement('div');
//   button.id = 'chatbot-float-btn-' + config.projectId;
//   button.innerHTML = '💬';
//   button.style.cssText = 
//     'position: fixed; ' +
//     (config.position.includes('right') ? 'right: 20px;' : 'left: 20px;') +
//     (config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;') +
//     'width: 60px; height: 60px; background: ' + config.theme_color + '; ' +
//     'border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); ' +
//     'cursor: pointer; display: flex; align-items: center; justify-content: center; ' +
//     'font-size: 24px; z-index: 9999; transition: all 0.3s ease; ' +
//     'user-select: none;';
  
//   // Create widget iframe (hidden initially)
//   var widget = document.createElement('div');
//   widget.id = 'chatbot-widget-' + config.projectId;
//   widget.style.cssText = 
//     'position: fixed; ' +
//     (config.position.includes('right') ? 'right: 20px;' : 'left: 20px;') +
//     (config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;') +
//     'width: ' + config.width + 'px; height: ' + config.height + 'px; ' +
//     'border-radius: ' + config.border_radius + 'px; ' +
//     'box-shadow: 0 8px 32px rgba(0,0,0,0.2); overflow: hidden; ' +
//     'z-index: 9998; display: none; transition: all 0.3s ease;';
  
//   var iframe = document.createElement('iframe');
//   iframe.src = config.widgetUrl;
//   iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
//   iframe.allow = 'microphone; camera';
//   iframe.title = config.agent_name + ' - ' + config.agent_title;
  
//   widget.appendChild(iframe);
  
//   // Toggle widget visibility
//   var isOpen = false;
//   button.onclick = function() {
//     isOpen = !isOpen;
//     widget.style.display = isOpen ? 'block' : 'none';
//     button.innerHTML = isOpen ? '✕' : '💬';
//     button.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
//   };
  
//   // Hover effects
//   button.addEventListener('mouseenter', function() {
//     this.style.transform = 'scale(1.1) ' + (isOpen ? 'rotate(90deg)' : 'rotate(0deg)');
//     this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
//   });
  
//   button.addEventListener('mouseleave', function() {
//     this.style.transform = 'scale(1) ' + (isOpen ? 'rotate(90deg)' : 'rotate(0deg)');
//     this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
//   });
  
//   // Auto-open if configured
//   if (config.auto_open) {
//     setTimeout(function() {
//       button.click();
//     }, config.auto_open_delay);
//   }
  
//   // Add to page
//   document.body.appendChild(button);
//   document.body.appendChild(widget);
  
//   // Mobile responsive
//   function updateMobileView() {
//     if (window.innerWidth <= 768) {
//       widget.style.width = '320px';
//       widget.style.height = '500px';
//       if (config.position.includes('right')) {
//         widget.style.right = '10px';
//         widget.style.left = 'auto';
//       } else {
//         widget.style.left = '10px';
//         widget.style.right = 'auto';
//       }
//       widget.style.bottom = '80px';
//     } else {
//       widget.style.width = config.width + 'px';
//       widget.style.height = config.height + 'px';
//     }
//   }
  
//   window.addEventListener('resize', updateMobileView);
//   updateMobileView();
  
//   console.log('Advanced AI Chatbot Widget loaded successfully for project: ' + config.projectId);
// })();
// </script>`;

      setEmbedCodes({
        direct: directLink,
        iframe: iframeCode,
        // html: htmlCode,
        // js: jsCode
      });
      
      toast.success('All embed codes generated successfully!');
      
    } catch (error) {
      console.error('Error generating embed codes:', error);
      toast.error('Failed to generate embed codes');
    } finally {
      setIsGenerating(false);
    }
  };

  // const copyToClipboard = (text: string, type: string) => {
  //   navigator.clipboard.writeText(text).then(
  //     () => toast.success(`${type} copied to clipboard!`),
  //     () => toast.error(`Failed to copy ${type}`)
  //   );
  // };
  const copyToClipboard = (text: string, type: string) => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    toast.error('Clipboard API not available in this browser/context');
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => toast.success(`${type} copied to clipboard!`))
    .catch(() => toast.error(`Failed to copy ${type}`));
};

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded successfully!');
  };

  const testWidget = () => {
    if (embedCodes.direct) {
      window.open(embedCodes.direct, '_blank');
      toast.success('Widget opened in new tab!');
    } else {
      toast.error('Please generate embed codes first');
    }
  };

  const embedTypes = [
    {
      id: 'direct' as const,
      name: 'Direct Link',
      description: 'Simple URL to open widget in new tab',
      icon: LinkIcon,
      filename: 'chatbot-direct-link.txt'
    },
    {
      id: 'iframe' as const,
      name: 'Iframe Embed Code with Icon',
      description: 'Embed directly in your webpage',
      icon: Monitor,
      filename: 'chatbot-iframe-embed.html'
    },
    // {
    //   id: 'html' as const,
    //   name: 'HTML Button',
    //   description: 'Button that opens chat in modal',
    //   icon: Globe,
    //   filename: 'chatbot-html-button.html'
    // },
    // {
    //   id: 'js' as const,
    //   name: 'JavaScript Widget',
    //   description: 'Floating widget with advanced features',
    //   icon: Zap,
    //   filename: 'chatbot-js-widget.html'
    // }
  ];

  const currentType = embedTypes.find(type => type.id === selectedType);
  const currentCode = embedCodes[selectedType];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Code className="h-5 w-5 mr-2 text-orange-600" />
            Generate Embed Codes
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={testWidget}
              disabled={!embedCodes.direct}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Widget
            </button>
            <button
              onClick={generateAllEmbedCodes}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[#e1802b] hover:bg-[#e1802b] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate All Codes
                </>
              )}
            </button>
          </div>
        </div>

        {Object.keys(embedCodes).length > 0 && (
          <>
            {/* Embed Type Selector */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Embed Type:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {embedTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedType === type.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <type.icon className={`h-5 w-5 ${
                        selectedType === type.id ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Code Display */}
            {currentType && currentCode && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <currentType.icon className="h-5 w-5 text-orange-600" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {currentType.name}
                    </h4>
                  </div>



                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
  console.log('currentCode:', currentCode);
  console.log('currentType.name:', currentType?.name);
  copyToClipboard(currentCode, currentType.name);
}}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadCode(currentCode, currentType.filename)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {selectedType === 'direct' ? (
                    <div className="p-4">
                      <code className="text-sm text-gray-800 dark:text-gray-200 break-all">
                        {currentCode}
                      </code>
                    </div>
                  ) : (
                    <pre className="p-4 text-sm overflow-x-auto max-h-96">
                      <code className="text-gray-800 dark:text-gray-200">
                        {currentCode}
                      </code>
                    </pre>
                  )}
                </div>

                {/* Usage Instructions */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2 flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    How to use {currentType.name}:
                  </h5>
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    {selectedType === 'direct' && (
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Copy the URL above</li>
                        <li>Use it as a link destination in buttons or menus</li>
                        <li>Opens widget in new tab/window when clicked</li>
                        <li>Perfect for "Chat with us" or "Get Support" buttons</li>
                      </ul>
                    )}
                    {selectedType === 'iframe' && (
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Copy the iframe code above</li>
                        <li>Paste it into your website's HTML where you want the widget</li>
                        <li>Widget will be embedded directly in your page</li>
                        <li>Includes responsive CSS for mobile devices</li>
                      </ul>
                    )}
                    {/* {selectedType === 'html' && (
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Copy the HTML + JavaScript code above</li>
                        <li>Paste it into your website where you want the button</li>
                        <li>Creates a styled button that opens chat in a modal</li>
                        <li>Great for call-to-action sections</li>
                      </ul>
                    )}
                    {selectedType === 'js' && (
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Copy the JavaScript code above</li>
                        <li>Paste it before the closing &lt;/body&gt; tag</li>
                        <li>Creates a floating widget that stays in the corner</li>
                        <li>Includes auto-open and mobile responsive features</li>
                      </ul>
                    )} */}
                  </div>
                </div>

                {/* Widget Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Project: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{projectId}</code>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Bot: <span className="font-medium">{config.bot_name}</span> | Agent: <span className="font-medium">{config.agent_name}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {Object.keys(embedCodes).length === 0 && (
          <div className="text-center py-8">
            <Code className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Generate Embed Codes
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Generate All Codes" to create embed options for your configured chatbot widget.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;