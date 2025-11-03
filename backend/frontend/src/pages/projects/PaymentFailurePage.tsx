import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const error = searchParams.get('error');

  // Debug logging
  React.useEffect(() => {
    console.log('PaymentFailurePage - URL params:', {
      orderId,
      status,
      error,
      fullURL: window.location.href,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    // If no order ID is provided, check if there's a stored payment project
    if (!orderId) {
      const storedProjectData = localStorage.getItem('pending_payment_project');
      if (storedProjectData) {
        console.log('No order ID in URL, but found stored project data');
        // Could potentially get the last order ID from the stored project data
      } else {
        console.log('No order ID and no stored project data - user navigated directly');
      }
    }
  }, [orderId, status, error, searchParams]);

  const getErrorMessage = () => {
    switch (error) {
      case 'missing_params':
        return 'Payment failed due to missing parameters. This usually indicates a configuration issue.';
      case 'no_data':
        return 'No payment data received from the payment gateway.';
      case 'invalid_checksum':
        return 'Payment verification failed. This may indicate a security issue.';
      case 'payment_not_found':
        return 'Payment record not found in our system.';
      case 'server_error':
        return 'A server error occurred while processing your payment.';
      case 'direct_access':
        return 'This page was accessed directly. If you were trying to make a payment, please start the payment process again.';
      case 'window_closed':
        return 'Payment window was closed before completion. A failure notification has been sent to your email.';
      case 'payment_failed':
        return 'Payment was declined or failed at the payment gateway.';
      default:
        return 'Your payment could not be processed. Please try again or contact support if the issue persists.';
    }
  };

  React.useEffect(() => {
    if (status === 'failed') {
      toast.error('Payment failed. Please try again.');
    } else if (status === 'cancelled') {
      toast.error('Payment was cancelled. A failure notification has been sent to your email.');
    } else if (error) {
      toast.error(getErrorMessage());
    }
  }, [status, error]);

  const handleRetryPayment = () => {
    // Get stored project data and navigate back to payment page
    const storedProjectData = localStorage.getItem('pending_payment_project');
    if (storedProjectData) {
      const projectData = JSON.parse(storedProjectData);
      navigate(`/app/projects/${projectData.id}/payment`, {
        state: { projectData }
      });
    } else {
      navigate('/app/projects');
    }
  };

  const handleGoBack = () => {
    navigate('/app/projects');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {getErrorMessage()}
          </p>
        </div>

        {/* Order ID Display - Prominent */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-3">
            Payment Failed
          </h2>
          <div className="text-center">
            <div className="text-sm text-red-800 dark:text-red-300 mb-2">Order ID</div>
            <div className="text-xl font-mono font-bold text-red-900 dark:text-red-200 bg-white dark:bg-gray-800 px-4 py-2 rounded border">
              {orderId || 'No Order ID Available'}
            </div>
            {!orderId && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                This page was accessed directly. If you experienced a payment failure, please check your email for details.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-red-600 font-medium">Payment Failed</span>
            </div>
            {error && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Error Code:</span>
                <span className="text-red-600 font-mono text-xs uppercase">{error}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                If you were charged, the amount will be refunded within 5-7 business days.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full bg-[#e1802b] hover:bg-[#d16f1a] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Payment Again
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Need help? Contact our support team.
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            <div><strong>Debug Info:</strong></div>
            <div>Order ID: {orderId || 'null'}</div>
            <div>Status: {status || 'null'}</div>
            <div>Error: {error || 'null'}</div>
            <div>Full URL: {window.location.href}</div>
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <strong>Test Instructions:</strong>
              <ol className="text-xs mt-1 ml-4 list-decimal">
                <li>Click "🧪 Test Real Gateway Close" button</li>
                <li>A payment will be created and gateway window will open</li>
                <li>Close the payment gateway window (don't complete payment)</li>
                <li>System should detect closure and redirect to failure page</li>
                <li>Check email for failure notification</li>
              </ol>
            </div>
            <button
              onClick={async () => {
                try {
                  // Use the modified paytm_status route to test email
                  const response = await fetch('/api/v1/payments/paytm_status/test_email_functionality');
                  const result = await response.json();
                  console.log('Test email result:', result);
                  
                  if (result.email_test_result !== undefined) {
                    toast.info(`Test email ${result.email_test_result ? 'sent' : 'failed'}: ${result.message}`);
                  } else {
                    toast.error('Email test route not available - server needs restart');
                  }
                } catch (error) {
                  console.error('Test email error:', error);
                  toast.error('Failed to test email');
                }
              }}
              className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded mr-2"
            >
              Test Email
            </button>
            <button
              onClick={async () => {
                try {
                  // Test SMTP connectivity
                  const response = await fetch('/api/v1/payments/paytm_status/test_smtp_connection');
                  const result = await response.json();
                  console.log('SMTP test result:', result);
                  
                  if (result.success) {
                    toast.success('SMTP connection successful!');
                  } else {
                    toast.error(`SMTP connection failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('SMTP test error:', error);
                  toast.error('Failed to test SMTP connection');
                }
              }}
              className="mt-2 text-xs bg-cyan-500 text-white px-3 py-1 rounded mr-2"
            >
              Test SMTP
            </button>
            <button
              onClick={() => {
                const testOrderId = 'ORDER_TEST123456789';
                window.location.href = `/app/payment/failure?order_id=${testOrderId}&status=cancelled&error=window_closed`;
              }}
              className="mt-2 text-xs bg-green-500 text-white px-3 py-1 rounded mr-2"
            >
              Test URL Params
            </button>
            <button
              onClick={async () => {
                try {
                  // Simulate payment cancellation
                  const testOrderId = 'ORDER_TEST123456789';
                  console.log('Testing payment cancellation for order:', testOrderId);
                  
                  const response = await fetch(`/api/v1/payments/paytm_status/cancel_${testOrderId}`);
                  
                  const result = await response.json();
                  console.log('Cancel payment result:', result);
                  
                  if (result.success) {
                    toast.success('Test cancellation successful - email should be sent');
                    setTimeout(() => {
                      window.location.href = `/app/payment/failure?order_id=${testOrderId}&status=cancelled&error=window_closed`;
                    }, 1000);
                  } else {
                    toast.error(`Test cancellation failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Test cancellation error:', error);
                  toast.error('Test cancellation failed');
                }
              }}
              className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded mr-2"
            >
              Test Cancel Payment
            </button>
            <button
              onClick={async () => {
                try {
                  // First create a test payment
                  console.log('Creating test payment...');
                  const createResponse = await fetch('/api/v1/payments/initiate_paytm_payment', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      project_id: 'test-project-123',
                      amount: 100,
                      currency: 'INR'
                    })
                  });
                  
                  const createResult = await createResponse.json();
                  console.log('Create payment result:', createResult);
                  
                  if (createResult.success && createResult.order_id) {
                    toast.success(`Test payment created: ${createResult.order_id}`);
                    
                    // Now cancel it
                    setTimeout(async () => {
                      const cancelResponse = await fetch(`/api/v1/payments/paytm_status/cancel_${createResult.order_id}`);
                      
                      const cancelResult = await cancelResponse.json();
                      console.log('Cancel result:', cancelResult);
                      
                      if (cancelResult.success) {
                        toast.success('Payment cancelled and email sent!');
                        setTimeout(() => {
                          window.location.href = `/app/payment/failure?order_id=${createResult.order_id}&status=cancelled&error=window_closed`;
                        }, 1000);
                      } else {
                        toast.error(`Cancel failed: ${cancelResult.error}`);
                      }
                    }, 1000);
                  } else {
                    toast.error(`Create payment failed: ${createResult.error}`);
                  }
                } catch (error) {
                  console.error('Full test error:', error);
                  toast.error('Full test failed');
                }
              }}
              className="mt-2 text-xs bg-purple-500 text-white px-3 py-1 rounded mr-2"
            >
              Full Test (Create + Cancel)
            </button>
            <button
              onClick={() => {
                // Simulate the actual payment flow
                console.log('Simulating payment window close scenario...');
                
                // Create a mock payment response
                const mockPaytmResponse = {
                  success: true,
                  order_id: 'ORDER_MOCK_TEST_' + Date.now(),
                  paytm_url: 'https://securegw-stage.paytm.in/order/process',
                  paytm_params: {}
                };
                
                console.log('Mock payment data:', mockPaytmResponse);
                
                // Simulate the handlePaymentCancellation function
                const handleMockCancellation = async (orderId: string) => {
                  console.log('Mock: Handling payment cancellation for order:', orderId);
                  
                  // Simulate the API call (this will fail with 405, but we can see the flow)
                  try {
                    const response = await fetch(`/api/v1/payments/paytm_status/cancel_${orderId}`);
                    
                    console.log('Mock cancel response status:', response.status);
                    
                    // Even if it fails, simulate the navigation
                    setTimeout(() => {
                      console.log('Mock: Navigating to failure page with order ID:', orderId);
                      window.location.href = `/app/payment/failure?order_id=${orderId}&status=cancelled&error=window_closed`;
                    }, 1000);
                    
                  } catch (error) {
                    console.error('Mock cancel error:', error);
                    // Still navigate to show the flow
                    setTimeout(() => {
                      window.location.href = `/app/payment/failure?order_id=${orderId}&status=cancelled&error=window_closed`;
                    }, 1000);
                  }
                };
                
                // Simulate window closing after 2 seconds
                setTimeout(() => {
                  console.log('Mock: Payment window "closed" - triggering cancellation');
                  handleMockCancellation(mockPaytmResponse.order_id);
                }, 2000);
                
                toast.info('Mock payment window will "close" in 2 seconds...');
              }}
              className="mt-2 text-xs bg-orange-500 text-white px-3 py-1 rounded mr-2"
            >
              Mock Window Close
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing Real Payment Gateway Close Scenario');
                  
                  // Step 1: Create a real payment
                  console.log('Step 1: Creating payment...');
                  const createResponse = await fetch('/api/v1/payments/initiate_paytm_payment', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      project_id: 'test-project-gateway-close',
                      amount: 10, // Small amount for testing
                      currency: 'INR'
                    })
                  });
                  
                  const createResult = await createResponse.json();
                  console.log('Payment created:', createResult);
                  
                  if (createResult.success && createResult.order_id) {
                    toast.success(`Payment created: ${createResult.order_id}`);
                    
                    // Step 2: Open payment gateway in new window
                    console.log('Step 2: Opening payment gateway...');
                    const paymentWindow = window.open(
                      createResult.paytm_url, 
                      'test_payment_window',
                      'width=800,height=600,scrollbars=yes,resizable=yes'
                    );
                    
                    if (!paymentWindow) {
                      toast.error('Please allow popups to test payment gateway');
                      return;
                    }
                    
                    toast.info('Payment gateway opened. Close it to test the failure flow.');
                    
                    // Step 3: Monitor window closure
                    let windowClosed = false;
                    const checkClosed = setInterval(() => {
                      if (paymentWindow.closed && !windowClosed) {
                        windowClosed = true;
                        clearInterval(checkClosed);
                        
                        console.log('Step 3: Payment window closed - triggering cancellation');
                        toast.warning('Payment window closed - processing cancellation...');
                        
                        // Step 4: Cancel the payment
                        setTimeout(async () => {
                          try {
                            console.log('Step 4: Cancelling payment...');
                            const cancelResponse = await fetch(`/api/v1/payments/paytm_status/cancel_${createResult.order_id}`);
                            const cancelResult = await cancelResponse.json();
                            
                            console.log('Cancel result:', cancelResult);
                            
                            if (cancelResult.success) {
                              toast.success('Payment cancelled and email sent!');
                              
                              // Step 5: Redirect to failure page
                              setTimeout(() => {
                                console.log('Step 5: Redirecting to failure page...');
                                window.location.href = `/app/payment/failure?order_id=${createResult.order_id}&status=cancelled&error=window_closed`;
                              }, 2000);
                            } else {
                              toast.error(`Cancellation failed: ${cancelResult.error}`);
                            }
                          } catch (error) {
                            console.error('Cancellation error:', error);
                            toast.error('Cancellation failed');
                          }
                        }, 1000);
                      }
                    }, 500);
                    
                    // Cleanup after 5 minutes
                    setTimeout(() => {
                      clearInterval(checkClosed);
                      if (!paymentWindow.closed) {
                        paymentWindow.close();
                      }
                    }, 300000);
                    
                  } else {
                    toast.error(`Failed to create payment: ${createResult.error}`);
                  }
                } catch (error) {
                  console.error('Real test error:', error);
                  toast.error('Real test failed');
                }
              }}
              className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded"
            >
              🧪 Test Real Gateway Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFailurePage;
