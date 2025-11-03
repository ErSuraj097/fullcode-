import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import BasicWidgetRenderer from './BasicWidgetRenderer';
import MediumWidgetRenderer from './MediumWidgetRenderer';
import AdvancedWidgetRenderer from './AdvancedWidgetRenderer';

const PureChatWidget: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const [modelType, setModelType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectModelType();
    }
  }, [projectId, location.pathname]);

  const loadProjectModelType = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, check if model type is specified in the URL path
      const pathSegments = location.pathname.split('/');
      const modelFromPath = pathSegments[pathSegments.length - 1];
      if (['basic', 'medium', 'advanced'].includes(modelFromPath)) {
        setModelType(modelFromPath);
        setIsLoading(false);
        return;
      }

      // Try to fetch project info to determine model type
      const response = await fetch(`/api/v1/widget/${projectId}/info`);
      
      if (response.ok) {
        const projectData = await response.json();
        setModelType(projectData.model_type || projectData.type || 'basic');
      } else {
        // Fallback: try to determine from URL parameters or default to basic
        const urlParams = new URLSearchParams(window.location.search);
        const modelFromUrl = urlParams.get('model_type') || urlParams.get('type');
        setModelType(modelFromUrl || 'basic');
      }
    } catch (error) {
      console.error('Failed to load project model type:', error);
      // Default to basic if we can't determine the model type
      setModelType('basic');
    } finally {
      setIsLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Widget Error</h2>
          <p className="text-gray-600 text-sm">No project ID provided for this chatbot widget.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading widget...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate widget based on model type
  switch (modelType) {
    case 'medium':
      return <MediumWidgetRenderer />;
    case 'advanced':
      return <AdvancedWidgetRenderer />;
    case 'basic':
    default:
      return <BasicWidgetRenderer />;
  }
};

export default PureChatWidget;