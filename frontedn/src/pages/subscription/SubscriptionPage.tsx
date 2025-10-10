import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CreditCard, 
    Calendar, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle, 
    XCircle,
    Download,
    Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface Subscription {
    id: string;
    plan_id: string;
    status: string;
    amount: number;
    currency: string;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    next_billing_date: string;
}

interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    description: string;
    created_at: string;
    paid_at: string;
}

interface UsageInfo {
    plan: string;
    conversations: {
        limit: number;
        used: number;
        remaining: number;
        unlimited: boolean;
    };
    features: any;
    subscription_status: string;
    subscription_end_date: string;
}

const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Fetch current subscription
            const subResponse = await fetch('/api/v1/subscription/current', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (subResponse.ok) {
                const subData = await subResponse.json();
                setSubscription(subData.subscription);
                setUsage(subData.usage);
            }
            
            // Fetch payment history
            const paymentResponse = await fetch('/api/v1/subscription/payments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (paymentResponse.ok) {
                const paymentData = await paymentResponse.json();
                setPayments(paymentData.payments);
            }
            
        } catch (err) {
            setError('Failed to load subscription data');
            console.error('Error fetching subscription data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = () => {
        navigate('/app/plans');
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/subscription/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reason: 'User requested cancellation'
                })
            });
            
            if (response.ok) {
                alert('Subscription cancelled successfully');
                fetchSubscriptionData();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to cancel subscription');
            }
        } catch (err) {
            alert('Failed to cancel subscription');
            console.error('Error cancelling subscription:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'text-green-600 bg-green-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            case 'past_due':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPaymentStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e1802b]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Subscription & Billing
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your subscription, view usage, and billing history
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Current Plan */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Current Plan
                                </h2>
                                {subscription && (
                                    <span className={cn(
                                        'px-3 py-1 rounded-full text-sm font-medium',
                                        getStatusColor(subscription.status)
                                    )}>
                                        {subscription.status}
                                    </span>
                                )}
                            </div>

                            {subscription ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                                                {subscription.plan_id} Plan
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                ₹{subscription.amount}/{subscription.billing_cycle}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Next billing</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {new Date(subscription.next_billing_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={handleUpgrade}
                                            className="px-4 py-2 bg-[#e1802b] text-white rounded-lg hover:bg-[#d16f1a] transition-colors"
                                        >
                                            <TrendingUp className="h-4 w-4 inline mr-2" />
                                            Upgrade Plan
                                        </button>
                                        {subscription.status === 'active' && subscription.plan_id !== 'basic' && (
                                            <button
                                                onClick={handleCancelSubscription}
                                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Cancel Subscription
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Active Subscription
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        You're currently on the free basic plan
                                    </p>
                                    <button
                                        onClick={handleUpgrade}
                                        className="px-6 py-2 bg-[#e1802b] text-white rounded-lg hover:bg-[#d16f1a] transition-colors"
                                    >
                                        Choose a Plan
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Payment History
                                </h2>
                                <button className="text-[#e1802b] hover:text-[#d16f1a] text-sm font-medium">
                                    <Download className="h-4 w-4 inline mr-1" />
                                    Export
                                </button>
                            </div>

                            {payments.length > 0 ? (
                                <div className="space-y-4">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                {getPaymentStatusIcon(payment.status)}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {payment.description}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(payment.created_at).toLocaleDateString()} • {payment.payment_method}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    ₹{payment.amount}
                                                </p>
                                                <p className={cn(
                                                    'text-sm capitalize',
                                                    payment.status === 'completed' ? 'text-green-600' : 
                                                    payment.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                                )}>
                                                    {payment.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">No payment history</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-6">
                        {usage && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Usage This Month
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Conversations
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {usage.conversations.unlimited ? 'Unlimited' : 
                                                `${usage.conversations.used} / ${usage.conversations.limit}`}
                                            </span>
                                        </div>
                                        {!usage.conversations.unlimited && (
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className="bg-[#e1802b] h-2 rounded-full transition-all duration-300"
                                                    style={{ 
                                                        width: `${Math.min((usage.conversations.used / usage.conversations.limit) * 100, 100)}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Plan Features</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Domains</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {usage.features.domains === -1 ? 'Unlimited' : usage.features.domains}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Languages</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {usage.features.languages === -1 ? 'All' : usage.features.languages}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Model Type</span>
                                                <span className="text-gray-900 dark:text-white capitalize">
                                                    {usage.features.model_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Support</span>
                                                <span className="text-gray-900 dark:text-white capitalize">
                                                    {usage.features.support}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/app/analytics')}
                                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <TrendingUp className="h-5 w-5 text-[#e1802b] mr-3" />
                                        <span className="text-gray-900 dark:text-white">View Analytics</span>
                                    </div>
                                    <Eye className="h-4 w-4 text-gray-400" />
                                </button>
                                
                                <button
                                    onClick={() => navigate('/app/api-keys')}
                                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <CreditCard className="h-5 w-5 text-[#e1802b] mr-3" />
                                        <span className="text-gray-900 dark:text-white">API Keys</span>
                                    </div>
                                    <Eye className="h-4 w-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;