import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');

  const [projectData, setProjectData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (status === 'success' && orderId) {
        try {
          // Get project data from localStorage or API
          const storedProjectData = localStorage.getItem('pending_payment_project');
          if (storedProjectData) {
            const parsedProjectData = JSON.parse(storedProjectData);

            // Clear the stored data
            localStorage.removeItem('pending_payment_project');

            setProjectData(parsedProjectData);

            toast.success('Payment completed successfully!');

            // Navigate to project detail page after a delay
            setTimeout(() => {
              if (parsedProjectData.model_type === 'advanced') {
                navigate(`/app/projects/${parsedProjectData.id}/advanced-project`, {
                  state: { projectData: { ...parsedProjectData, paymentCompleted: true } }
                });
              } else if (parsedProjectData.model_type === 'medium') {
                navigate(`/app/projects/${parsedProjectData.id}/medium-project`, {
                  state: { projectData: { ...parsedProjectData, paymentCompleted: true } }
                });
              } else {
                navigate(`/app/projects/${parsedProjectData.id}/basic-project`, {
                  state: { projectData: { ...parsedProjectData, paymentCompleted: true } }
                });
              }
            }, 3000);
          } else {
            // If no stored data, redirect to projects page
            navigate('/app/projects');
          }
        } catch (error) {
          console.error('Error handling payment success:', error);
          toast.error('Error processing payment completion');
          navigate('/app/projects');
        }
      } else {
        // Invalid status, redirect to projects
        navigate('/app/projects');
      }

      setIsLoading(false);
    };

    handlePaymentSuccess();
  }, [status, orderId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your payment has been processed successfully. You will be redirected to your project shortly.
          </p>
        </div>

        {/* Order ID Display - Prominent */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-3">
            Payment Confirmation
          </h2>
          <div className="text-center">
            <div className="text-sm text-green-800 dark:text-green-300 mb-2">Order ID</div>
            <div className="text-xl font-mono font-bold text-green-900 dark:text-green-200 bg-white dark:bg-gray-800 px-4 py-2 rounded border">
              {orderId || 'N/A'}
            </div>
          </div>
        </div>

        {projectData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Project Name:</span>
                <span className="text-gray-900 dark:text-white font-medium">{projectData.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Model Type:</span>
                <span className="text-gray-900 dark:text-white font-medium capitalize">{projectData.model_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-green-600 font-medium">Payment Completed</span>
              </div>
            </div>
          </div>
        )}

        {/* Manual Navigation Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              if (projectData) {
                if (projectData.model_type === 'advanced') {
                  navigate(`/app/projects/${projectData.id}/advanced-project`, {
                    state: { projectData: { ...projectData, paymentCompleted: true } }
                  });
                } else if (projectData.model_type === 'medium') {
                  navigate(`/app/projects/${projectData.id}/medium-project`, {
                    state: { projectData: { ...projectData, paymentCompleted: true } }
                  });
                } else {
                  navigate(`/app/projects/${projectData.id}/basic-project`, {
                    state: { projectData: { ...projectData, paymentCompleted: true } }
                  });
                }
              } else {
                navigate('/app/projects');
              }
            }}
            className="bg-[#e1802b] hover:bg-[#d16f1a] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
          >
            Go to Project
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting in a few seconds...
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
