import React, { useState } from 'react';
import { Smartphone, AlertCircle, CheckCircle, Loader2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { paymentApi } from '../../api/services/api';
import { useAuth } from '../../providers/AuthProvider';

interface PaytmPaymentFormProps {
  projectData: any;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PaytmParams {
  MID: string;
  WEBSITE: string;
  INDUSTRY_TYPE_ID: string;
  CHANNEL_ID: string;
  ORDER_ID: string;
  CUST_ID: string;
  TXN_AMOUNT: string;
  CALLBACK_URL: string;
  CHECKSUMHASH: string;
  [key: string]: string;
}

interface PaytmResponse {
  success: boolean;
  paytm_params: PaytmParams;
  paytm_url: string;
  payment_id: string;
  order_id: string;
  error?: string;
}

const PaytmPaymentForm: React.FC<PaytmPaymentFormProps> = ({
  projectData,
  onSuccess,
  onError
}) => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paytmData, setPaytmData] = useState<PaytmResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAmount = (modelType: string): number => {
    switch (modelType) {
      case 'basic': return 799; // ₹799 (approximately $9.99)
      case 'medium': return 1599; // ₹1599 (approximately $19.99)
      case 'advanced': return 3199; // ₹3199 (approximately $39.99)
      default: return 799;
    }
  };

  const initiatePaytmPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Initiating Paytm payment for project:', projectData);

      // Store project data for retrieval after payment
      localStorage.setItem('pending_payment_project', JSON.stringify(projectData));

      let response;
      
      // Call authenticated API
      response = await paymentApi.initiatePaytmPayment({
        project_id: projectData.id,
        amount: getAmount(projectData.model_type),
        currency: 'INR'
      });

      console.log('Paytm API response:', response);

      if (response.success && response.paytm_params && response.paytm_url) {
        setPaytmData(response);
        
        // Show success message
        toast.success('Payment parameters generated successfully!');
        
        // Auto-submit after a brief delay to show the success message
        setTimeout(() => {
          submitToPaytm(response);
        }, 1500);
        
      } else {
        throw new Error(response.error || 'Failed to initiate Paytm payment');
      }

    } catch (error: any) {
      console.error('Paytm payment initiation error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to initiate payment';
      setError(errorMessage);
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const submitToPaytm = (data: PaytmResponse) => {
    try {
      console.log('Submitting to Paytm with data:', data);

      // Create form element
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.paytm_url;
      form.target = 'paytm_payment_window'; // Open in new window
      form.style.display = 'none';

      // Add all Paytm parameters as hidden inputs
      Object.entries(data.paytm_params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
        console.log(`Added parameter: ${key} = ${value}`);
      });

      // Open payment window
      const paymentWindow = window.open('', 'paytm_payment_window', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!paymentWindow) {
        toast.error('Please allow popups for payment processing');
        setError('Popup blocked. Please allow popups and try again.');
        return;
      }

      // Add form to document and submit
      document.body.appendChild(form);
      
      // Show loading message
      toast.info('Opening Paytm payment gateway in new window...', {
        autoClose: 3000
      });

      console.log('Submitting form to:', form.action);
      form.submit();

      // Listen for payment result messages
      const handlePaymentMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PAYMENT_RESULT') {
          console.log('Received payment result:', event.data);
          
          if (event.data.success) {
            toast.success('Payment completed successfully!');
            // Call success callback if provided
            if (onSuccess) {
              onSuccess();
            } else {
              // Fallback navigation
              setTimeout(() => {
                if (projectData.model_type === 'advanced') {
                  window.location.href = `/app/projects/${projectData.id}/advanced-project`;
                } else if (projectData.model_type === 'medium') {
                  window.location.href = `/app/projects/${projectData.id}/medium-project`;
                } else {
                  window.location.href = `/app/projects/${projectData.id}/basic-project`;
                }
              }, 1500);
            }
          } else {
            toast.error('Payment failed. Please try again.');
            setError('Payment was not completed successfully');
            if (onError) {
              onError('Payment was not completed successfully');
            }
          }
          
          // Clean up event listener
          window.removeEventListener('message', handlePaymentMessage);
        }
      };

      window.addEventListener('message', handlePaymentMessage);

      // Monitor payment window
      let paymentCompleted = false;
      
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          console.log('Payment window closed');
          
          // Clean up event listener
          window.removeEventListener('message', handlePaymentMessage);
          
          // If payment wasn't completed via postMessage, handle as cancelled/failed
          if (!paymentCompleted) {
            console.log('Payment window closed without completion - handling as failed');
            handlePaymentCancellation(data.order_id);
          }
        }
      }, 1000);

      // Update the message handler to mark payment as completed
      const originalHandlePaymentMessage = handlePaymentMessage;
      const enhancedHandlePaymentMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PAYMENT_RESULT') {
          paymentCompleted = true;
          originalHandlePaymentMessage(event);
        }
      };

      // Replace the event listener with enhanced version
      window.removeEventListener('message', handlePaymentMessage);
      window.addEventListener('message', enhancedHandlePaymentMessage);

      // Set a timeout to handle cases where payment window doesn't respond
      const paymentTimeout = setTimeout(() => {
        if (!paymentCompleted && !paymentWindow.closed) {
          console.log('Payment timeout - window still open but no response');
          // Don't close the window automatically, but prepare for cancellation
          // The user might still be completing the payment
        }
      }, 300000); // 5 minutes timeout

      // Clean up timeout when payment completes or window closes
      const originalCheckClosed = checkClosed;
      const enhancedCheckClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(enhancedCheckClosed);
          clearTimeout(paymentTimeout);
          window.removeEventListener('message', enhancedHandlePaymentMessage);
          
          // If payment wasn't completed via postMessage, handle as cancelled/failed
          if (!paymentCompleted) {
            console.log('Payment window closed without completion - handling as failed');
            console.log('Order ID for cancellation:', data.order_id);
            console.log('Payment data:', data);
            handlePaymentCancellation(data.order_id);
          }
        }
      }, 1000);

      // Clean up form after submission
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);

      // Cleanup function for timeout and intervals
      return () => {
        clearTimeout(paymentTimeout);
        clearInterval(enhancedCheckClosed);
        window.removeEventListener('message', enhancedHandlePaymentMessage);
      };

    } catch (error: any) {
      console.error('Error submitting to Paytm:', error);
      toast.error('Failed to redirect to Paytm. Please try again.');
      setError('Failed to redirect to payment gateway');
    }
  };

  const handlePaymentCancellation = async (orderId: string) => {
    try {
      console.log('Handling payment cancellation for order:', orderId);
      
      // Call API to mark payment as cancelled and send failure email (using workaround)
      const response = await fetch(`/api/v1/payments/paytm_status/cancel_${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('Payment marked as cancelled successfully');
        toast.error('Payment was cancelled. A failure notification has been sent to your email.');
        
        // Navigate to failure page
        setTimeout(() => {
          window.location.href = `/app/payment/failure?order_id=${orderId}&status=cancelled&error=window_closed`;
        }, 2000);
      } else {
        console.error('Failed to cancel payment:', result.error);
        toast.error('Payment window was closed. Please check your payment status.');
      }
      
      // Call error callback
      if (onError) {
        onError('Payment window was closed');
      }
      
    } catch (error) {
      console.error('Error handling payment cancellation:', error);
      toast.error('Payment window was closed. Please check your payment status.');
      
      // Fallback - navigate to failure page anyway
      setTimeout(() => {
        window.location.href = `/app/payment/failure?order_id=${orderId}&status=cancelled&error=window_closed`;
      }, 2000);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/v1/payments/paytm_status/${orderId}`);
      const result = await response.json();
      
      if (result.success && result.payment) {
        if (result.payment.status === 'completed') {
          toast.success('Payment completed successfully!');
          if (onSuccess) {
            onSuccess();
          } else {
            // Fallback navigation
            setTimeout(() => {
              if (projectData.model_type === 'advanced') {
                window.location.href = `/app/projects/${projectData.id}/advanced-project`;
              } else if (projectData.model_type === 'medium') {
                window.location.href = `/app/projects/${projectData.id}/medium-project`;
              } else {
                window.location.href = `/app/projects/${projectData.id}/basic-project`;
              }
            }, 2000);
          }
        } else if (result.payment.status === 'failed') {
          toast.error('Payment failed. Please try again.');
          if (onError) {
            onError('Payment failed');
          }
        } else if (result.payment.status === 'pending') {
          // If still pending after window close, treat as cancelled
          console.log('Payment still pending after window close - treating as cancelled');
          handlePaymentCancellation(orderId);
        } else {
          toast.info('Payment is still being processed...');
        }
      } else {
        // Payment not found or error - treat as cancelled
        handlePaymentCancellation(orderId);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // On error, also treat as cancelled
      handlePaymentCancellation(orderId);
    }
  };

  const retryPayment = () => {
    setError(null);
    setPaytmData(null);
    initiatePaytmPayment();
  };

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      {!user || !token ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <User className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-400">Authentication Required</h3>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                Please log in to make payments.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-400">Ready to Pay</h3>
              <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                Logged in as: {user.email || 'User'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Paytm Payment Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Smartphone className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Paytm Payment
          </h2>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Smartphone className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-400">Secure Paytm Payment</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                You will be redirected to Paytm's secure payment gateway. Paytm supports:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 ml-4 list-disc">
                <li>UPI payments (Google Pay, PhonePe, etc.)</li>
                <li>Debit/Credit cards</li>
                <li>Net banking</li>
                <li>Paytm wallet</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-400">Payment Error</h3>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
                <button
                  onClick={retryPayment}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {paytmData && !error && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-400">Payment Ready</h3>
                <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                  Payment parameters generated successfully. Redirecting to Paytm...
                </p>
                <div className="text-xs text-green-700 dark:text-green-400 mt-2 font-mono">
                  Order ID: {paytmData.order_id}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="flex justify-center">
          <button
            onClick={initiatePaytmPayment}
            disabled={isLoading || !!paytmData || !user || !token}
            className={`
              px-8 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 
              flex items-center justify-center min-w-[200px]
              ${isLoading || paytmData || !user || !token
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Payment...
              </>
            ) : paytmData ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Redirecting to Paytm...
              </>
            ) : !user || !token ? (
              <>
                <User className="h-4 w-4 mr-2" />
                Login Required
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Pay with Paytm - ₹{getAmount(projectData.model_type)}
              </>
            )}
          </button>
        </div>


      </div>
    </div>
  );
};

export default PaytmPaymentForm;