import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Upload, 
  Image as ImageIcon, 
  Clock, 
  TrendingUp, 
  Activity, 
  Server,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface PredictionResponse {
  predicted_text: string;
  confidence: number;
  processing_time: number;
  timestamp: string;
}

interface PredictionHistory {
  id: string;
  predicted_text: string;
  confidence: number;
  processing_time: number;
  timestamp: string;
}

interface SystemStatus {
  status: string;
  models_loaded: number;
  active_sessions: number;
  uptime: number;
}

const PredictionPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
      // Mock data for now
      setHistory([
        {
          id: '1',
          predicted_text: 'Sample extracted text from image',
          confidence: 0.95,
          processing_time: 1200,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch history');
    }
  };

  const fetchStatus = async () => {
    try {
      // Mock status data
      setStatus({
        status: 'healthy',
        models_loaded: 3,
        active_sessions: 1,
        uptime: 86400
      });
    } catch (error) {
      console.error('Failed to fetch status');
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      // Mock prediction for now
      setTimeout(() => {
        setPrediction({
          predicted_text: 'This is a sample text extracted from the uploaded image using AI.',
          confidence: 0.92,
          processing_time: 1500,
          timestamp: new Date().toISOString()
        });
        toast.success('Prediction completed successfully');
        fetchHistory();
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      toast.error('Prediction failed');
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPrediction(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const downloadResult = () => {
    if (!prediction) return;
    
    const data = {
      predicted_text: prediction.predicted_text,
      confidence: prediction.confidence,
      processing_time: prediction.processing_time,
      timestamp: prediction.timestamp
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Image Prediction</h1>
        <p className="text-gray-600 mt-1">Upload an image to extract text using AI</p>
      </div>

      {/* System Status */}
      {status && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Server className="h-5 w-5 mr-2" />
              System Status
            </h2>
            <button
              onClick={fetchStatus}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status.status}
              </div>
              <p className="text-sm text-gray-500 mt-1">Status</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{status.models_loaded}</p>
              <p className="text-sm text-gray-500">Models Loaded</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{status.active_sessions}</p>
              <p className="text-sm text-gray-500">Active Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{Math.round(status.uptime / 3600)}h</p>
              <p className="text-sm text-gray-500">Uptime</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h2>
            
            {/* File Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-[#e1802be0]/40 bg-[#e1802be0]/50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                  />
                  <div className="text-sm text-gray-600">
                    {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  <button
                    onClick={clearSelection}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop your image here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[#e1802be0] hover:bg-[#e1802be0] cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Image
                  </label>
                </div>
              )}
            </div>

            {/* Predict Button */}
            <div className="mt-6">
              <button
                onClick={handlePredict}
                disabled={!selectedFile || loading}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-[#e1802be0] hover:bg-[#e1802be0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Predict Text
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prediction Result */}
          {prediction && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Prediction Result</h2>
                <button
                  onClick={downloadResult}
                  className="text-[#e1802be0]/80 hover:text-[#e1802be0]/80 text-sm flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracted Text
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{prediction.predicted_text}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confidence
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#e1802be0]/60 h-2 rounded-full"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processing Time
                    </label>
                    <p className="text-sm text-gray-900">{prediction.processing_time}ms</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <p className="text-sm text-gray-500">
                    {new Date(prediction.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Prediction History
            </h2>
            <button
              onClick={fetchHistory}
              className="text-[#e1802be0]/60 hover:text-[#e1802be0]/80 text-sm"
            >
              Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No predictions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload an image to see your prediction history.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.predicted_text}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {Math.round(item.confidence * 100)}%
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.processing_time}ms
                        </span>
                        <span>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 ml-2">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;