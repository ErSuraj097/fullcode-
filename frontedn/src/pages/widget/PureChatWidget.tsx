import React from 'react';
import { useParams } from 'react-router-dom';
import WidgetRenderer from './WidgetRenderer';

const PureChatWidget: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
     
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Widget Error</h2>
          <p className="text-gray-600 text-sm">No project ID provided for this chatbot widget.</p>
        </div>
     
    );
  }

  return (

   <div className='bg-red-400'> <WidgetRenderer /></div>
   
    
   


  );
};

export default PureChatWidget;