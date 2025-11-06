import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Lock,
  Shield,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { paymentApi } from '../../api/services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { cn } from '../../utils/cn';
import { useAuth } from '../../providers/AuthProvider';
import PaytmPaymentForm from '../../components/payment/PaytmPaymentForm';
import PaymentPopup from '../../components/payment/PaymentPopup';

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

type PaymentMethod = 'card' | 'paytm';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { user, token } = useAuth();

  const projectData = location.state?.projectData;

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paytm');
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentUrl] = useState('');
  const [currentOrderId] = useState('');

  // Redirect if no project data
  React.useEffect(() => {
    if (!projectData) {
      navigate('/app/projects/new');
      return;
    }
  }, [projectData, navigate]);

  // Real payment processing via API
  const processPaymentMutation = useMutation({
    mutationFn: async (data: PaymentData) => {
      if (!token) {
        toast.error('Authentication required. Please login to process payment.');
        navigate('/login');
        throw new Error('Authentication required');
      }

      // Verify token is valid by checking user context
      if (!user || !user.id) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        throw new Error('Session expired');
      }

  const getAmount = (modelType: string) => {
        switch (modelType) {
          case 'basic': return 999;
          case 'medium': return 1999;
          case 'advanced': return 3999;
          default: return 999;
        }
      };

      // Paytm payment is handled by the PaytmPaymentForm component
      // This should not be reached as the form submission is handled separately
      throw new Error('Paytm payment should be handled by the PaytmPaymentForm component');
    },
    onSuccess: (result) => {
      // This should not be reached as Paytm payment is handled separately
      console.log('Payment success callback triggered:', result);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Payment failed. Please try again.');
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PaymentData] as any),
          [child]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for address
    if (!paymentData.address.street || !paymentData.address.city || !paymentData.address.zipCode) {
      toast.error('Please fill in all address details');
      return;
    }

    setIsProcessing(true);

    // Store project data for success/failure pages
    localStorage.setItem('pending_payment_project', JSON.stringify(projectData));

    processPaymentMutation.mutate(paymentData);
  };

  const getModelPrice = (modelType: string) => {
    switch (modelType) {
      case 'basic': return '₹999';
      case 'medium': return '₹1999';
      case 'advanced': return '₹3999';
      default: return '₹999';
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    toast.success('Payment completed successfully!');
    localStorage.removeItem('pending_payment_project');
    
    // Navigate to success page
    navigate(`/app/payment/success?order_id=${orderId}&status=success`, {
      replace: true
    });
  };

  const handlePaymentFailure = (orderId: string, error?: string) => {
    toast.error('Payment failed. Please try again.');
    
    // Navigate to failure page
    navigate(`/app/payment/failure?order_id=${orderId}&status=failed&error=${error || 'payment_failed'}`, {
      replace: true
    });
  };

  if (!projectData) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 py-10">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Complete Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Secure payment for your AI chatbot project
            </p>
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Project Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Project Name:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{projectData.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Model Type:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">{projectData.model_type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Project ID:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-mono text-sm">{projectData.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">User ID:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-mono text-sm">{user?.id || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Price:</span>
              <span className="ml-2 text-2xl font-bold text-green-600">{getModelPrice(projectData.model_type)}</span>
            </div>
          </div>
        </div>



        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Billing Address
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={paymentData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={paymentData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="New York"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={paymentData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="NY"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={paymentData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="10001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={paymentData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="United States"
                  required
                />
              </div>
            </div>
          </div>



          {/* Paytm Payment Component */}
          {paymentMethod === 'paytm' && (
            <PaytmPaymentForm
              projectData={projectData}
              onSuccess={() => {
                toast.success('Payment completed successfully!');
                // Navigate to appropriate project detail page
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
              }}
              onError={(error) => {
                toast.error(`Payment failed: ${error}`);
              }}
            />
          )}


        </form>
      </div>

      {/* Sidebar - Security & Summary */}
      <div className="lg:w-1/3 h-fit bg-gradient-to-br from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900 rounded-xl border border-green-200 dark:border-green-800 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-green-900 dark:text-white mb-2">
              Secure Payment
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              Your payment information is encrypted and secure.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">SSL Encrypted</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                256-bit SSL encryption protects your data.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <Lock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">PCI Compliant</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Meets all PCI DSS security standards.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Money Back Guarantee</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                30-day money back guarantee on all plans.
              </p>
            </div>
          </div>

          <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-400 mb-2">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-800 dark:text-green-300">{projectData.name}</span>
                <span className="text-green-800 dark:text-green-300">{getModelPrice(projectData.model_type)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-green-900 dark:text-white">Total</span>
                <span className="text-green-900 dark:text-white">{getModelPrice(projectData.model_type)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        paymentUrl={paymentUrl}
        paymentMethod={paymentMethod}
        orderId={currentOrderId}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
      />
    </div>
  );
};

export default PaymentPage;
