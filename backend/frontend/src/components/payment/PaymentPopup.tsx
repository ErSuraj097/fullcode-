import React, { useEffect, useState } from 'react';
import { X, CreditCard, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string;
  paymentMethod: 'card' | 'paytm';
  orderId: string;
  onSuccess: (orderId: string) => void;
  onFailure: (orderId: string, error?: string) => void;
}

const PaymentPopup: React.FC<PaymentPopupProps> = ({
  isOpen,
  onClose,
  paymentUrl,
  paymentMethod,
  orderId,
  onSuccess,
  onFailure
}) => {
  const [status, setStatus] = useState<'loading' | 'processing' | 'success' | 'failed'>('loading');
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);

  useEffect(() => {
    if (isOpen && paymentUrl) {
      // Open payment window
      const newWindow = window.open(
        paymentUrl,
        'payment_window',
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!newWindow) {
        toast.error('Please allow popups for payment processing');
        onFailure(orderId, 'popup_blocked');
        return;
      }

      setPaymentWindow(newWindow);
      setStatus('processing');

      // Listen for payment result messages
      const handlePaymentMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PAYMENT_RESULT') {
          console.log('Received payment result:', event.data);
          
          if (event.data.success) {
            setStatus('success');
            setTimeout(() => {
              onSuccess(event.data.orderId);
              onClose();
            }, 2000);
          } else {
            setStatus('failed');
            setTimeout(() => {
              onFailure(event.data.orderId, 'payment_failed');
            }, 2000);
          }
          
          // Clean up
          window.removeEventListener('message', handlePaymentMessage);
          if (newWindow && !newWindow.closed) {
            newWindow.close();
          }
        }
      };

      window.addEventListener('message', handlePaymentMessage);

      // Monitor payment window
      let paymentCompleted = false;
      
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

      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', enhancedHandlePaymentMessage);
          
          if (status === 'processing' && !paymentCompleted) {
            setStatus('failed');
            setTimeout(() => {
              onFailure(orderId, 'window_closed');
            }, 1000);
          }
        }
      }, 1000);

      // Cleanup function
      return () => {
        clearInterval(checkClosed);
        window.removeEventListener('message', handlePaymentMessage);
        if (newWindow && !newWindow.closed) {
          newWindow.close();
        }
      };
    }
  }, [isOpen, paymentUrl, orderId, onSuccess, onFailure, status]);

  const handleClose = () => {
    if (paymentWindow && !paymentWindow.closed) {
      paymentWindow.close();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Payment Processing
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">
                Opening payment gateway...
              </p>
            </div>
          )}

          {status === 'processing' && (
            <div className="space-y-4">
              {paymentMethod === 'paytm' ? (
                <Smartphone className="h-12 w-12 text-blue-600 mx-auto" />
              ) : (
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto" />
              )}
              <div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  Complete your payment
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  A new window has opened for payment processing. Please complete your payment there.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Order ID: <span className="font-mono font-bold">{orderId}</span>
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <p className="text-green-900 dark:text-green-400 font-medium mb-2">
                  Payment Successful!
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Redirecting to your project...
                </p>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <div>
                <p className="text-red-900 dark:text-red-400 font-medium mb-2">
                  Payment Failed
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;