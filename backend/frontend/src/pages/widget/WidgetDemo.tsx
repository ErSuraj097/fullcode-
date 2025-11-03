import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Code, Eye } from 'lucide-react';

const WidgetDemo: React.FC = () => {
    const [selectedModel, setSelectedModel] = useState<'basic' | 'medium' | 'advanced'>('basic');
    const [showCode, setShowCode] = useState(false);

    const demoProjectId = 'demo-project-123';

    const modelFeatures = {
        basic: {
            name: 'Basic Widget',
            color: 'blue',
            features: [
                'Simple chat interface',
                'Basic language support',
                'Standard messaging',
                'Minimal design',
                'Fast loading'
            ],
            description: 'Perfect for simple customer support and basic interactions.'
        },
        medium: {
            name: 'Medium Widget',
            color: 'green',
            features: [
                'Enhanced chat interface',
                'Multiple language support',
                'Feedback system',
                'Typing indicators',
                'Sound notifications',
                'Timestamps',
                'User avatars'
            ],
            description: 'Ideal for businesses needing more interactive features and better user engagement.'
        },
        advanced: {
            name: 'Advanced Widget',
            color: 'purple',
            features: [
                'Premium chat interface',
                'Full language support',
                'Advanced feedback & ratings',
                'File upload support',
                'Voice input capability',
                'Analytics integration',
                'Confidence scores',
                'Chat history download',
                'Maximizable interface',
                'Quick actions',
                'Advanced animations'
            ],
            description: 'Enterprise-grade solution with premium features for sophisticated AI interactions.'
        }
    };

    const getEmbedCode = (modelType: string) => {
        return `<!-- ${modelFeatures[modelType as keyof typeof modelFeatures].name} Embed Code -->
<iframe 
  src="${window.location.origin}/widget/${demoProjectId}/${modelType}"
  width="100%" 
  height="600px" 
  frameborder="0"
  style="border: none; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>

<!-- Or use as a floating widget -->
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${window.location.origin}/widget/${demoProjectId}/${modelType}';
    iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.1);z-index:9999;';
    document.body.appendChild(iframe);
  })();
</script>`;
    };

    const currentModel = modelFeatures[selectedModel];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/"
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Widget Renderer Demo</h1>
                                <p className="text-gray-600">Experience different AI widget models</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowCode(!showCode)}
                                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showCode
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Code className="h-4 w-4 mr-2" />
                                {showCode ? 'Hide Code' : 'Show Code'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Model Selection */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Widget Model</h2>

                            <div className="space-y-3">
                                {Object.entries(modelFeatures).map(([key, model]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedModel(key as any)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedModel === key
                                            ? `border-${model.color}-500 bg-${model.color}-50`
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-medium ${selectedModel === key ? `text-${model.color}-900` : 'text-gray-900'
                                                }`}>
                                                {model.name}
                                            </h3>
                                            {selectedModel === key && (
                                                <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Features List */}
                            <div className="mt-6">
                                <h3 className="font-medium text-gray-900 mb-3">Features</h3>
                                <ul className="space-y-2">
                                    {currentModel.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-600">
                                            <div className={`w-2 h-2 rounded-full bg-${currentModel.color}-500 mr-3`}></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Demo Links */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="font-medium text-gray-900 mb-3">Try It Out</h3>
                                <div className="space-y-2">
                                    <a
                                        href={`/widget/${demoProjectId}/${selectedModel}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center px-4 py-2 bg-${currentModel.color}-600 text-white rounded-lg hover:bg-${currentModel.color}-700 text-sm font-medium transition-colors`}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open in New Tab
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="lg:col-span-2">
                        {showCode ? (
                            /* Code Display */
                            <div className="bg-white rounded-xl shadow-sm border">
                                <div className="p-6 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">Embed Code</h2>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Copy and paste this code into your website
                                    </p>
                                </div>
                                <div className="p-6">
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                        <code>{getEmbedCode(selectedModel)}</code>
                                    </pre>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(getEmbedCode(selectedModel))}
                                        className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
                                    >
                                        Copy to Clipboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Widget Preview */
                            <div className="bg-white rounded-xl shadow-sm border">
                                <div className="p-6 border-b">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {currentModel.name} Preview
                                            </h2>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Interactive preview of the {selectedModel} widget model
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 bg-${currentModel.color}-100 text-${currentModel.color}-800 rounded-full text-sm font-medium`}>
                                            {selectedModel.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                                        {/* Sample website background */}
                                        <div className="absolute inset-0 p-8">
                                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Website</h3>
                                                <p className="text-gray-600 mb-4">
                                                    This is how the {currentModel.name.toLowerCase()} will appear on your website.
                                                </p>
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Widget iframe */}
                                        <iframe
                                            src={`/widget/${demoProjectId}/${selectedModel}?demo=true`}
                                            className="absolute inset-0 w-full h-full border-none"
                                            title={`${currentModel.name} Demo`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WidgetDemo;