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
    Eye,
    FileText,
    ShoppingCart,
    Receipt,
    Clock,
    Package
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { paymentApi } from '../../api/services/api';

interface Subscription {
    id: string;
    user_id: string;
    project_id: string;
    plan_type: string;
    model_type: string;
    status: string;
    amount: number;
    currency: string;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    next_billing_date: string;
    project_name?: string;
    project_type?: string;
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

interface Invoice {
    id: string;
    subscription_id: string;
    amount: number;
    currency: string;
    status: string;
    due_date: string;
    paid_at: string;
    created_at: string;
}

interface Order {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
}

interface PaidProject {
    id: string;
    name: string;
    type: string;
    description: string;
    order_id: string | null;
    duration: string | null;
    subscription: Subscription | null;
    invoice: Invoice | null;
    payment: Payment | null;
    order: Order | null;
    created_at: string;
    payment_status: string;
    model_type: string;
    accuracy: number;
    training_status: string;
    status: string;
}

const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [paidProjects, setPaidProjects] = useState<PaidProject[]>([]);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'paid_projects' | 'subscription' | 'invoices' | 'orders'>('paid_projects');
    const [subscriptions, setSubscriptions] = useState<PaidProject[]>([]);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            setLoading(true);

            // Fetch paid projects
            const paidProjectsData = await paymentApi.getPaidProjects();
            if (paidProjectsData && (paidProjectsData as any).success && (paidProjectsData as any).paid_projects) {
                setPaidProjects((paidProjectsData as any).paid_projects);
            }

            // Fetch current subscription data (comprehensive project data)
            const subResponse = await paymentApi.getUserSubscriptions();
            if (subResponse && (subResponse as any).success && (subResponse as any).subscriptions) {
                setSubscriptions((subResponse as any).subscriptions);
                // Set first subscription for backward compatibility
                if ((subResponse as any).subscriptions.length > 0) {
                    setSubscription((subResponse as any).subscriptions[0]);
                }
            }

            // Fetch payment history
            const paymentData = await paymentApi.getUserPayments();
            if (paymentData && (paymentData as any).success && (paymentData as any).payments) {
                setPayments((paymentData as any).payments);
            }

            // Fetch invoices
            const invoiceData = await paymentApi.getUserInvoices();
            if (invoiceData && (invoiceData as any).success && (invoiceData as any).invoices) {
                setInvoices((invoiceData as any).invoices);
            }

            // Fetch orders
            const orderData = await paymentApi.getUserOrders();
            if (orderData && (orderData as any).success && (orderData as any).orders) {
                setOrders((orderData as any).orders);
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

    const handleDownloadInvoice = async (invoiceId: string) => {
        try {
            const invoiceData = await paymentApi.downloadInvoice(invoiceId);
            if (invoiceData && invoiceData.success) {
                // For now, show invoice data in alert (in production, trigger PDF download)
                alert(`Invoice downloaded successfully!\nInvoice: ${invoiceData.invoice.invoice_number}\nAmount: ${invoiceData.invoice.amount} ${invoiceData.invoice.currency}`);
                // TODO: Implement actual PDF download
                // window.open(invoiceData.download_url, '_blank');
            } else {
                alert('Failed to download invoice');
            }
        } catch (err) {
            alert('Failed to download invoice');
            console.error('Error downloading invoice:', err);
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

                {/* Tab Navigation */}
                <div className="mb-6">
                    <nav className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('paid_projects')}
                            className={cn(
                                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                                activeTab === 'paid_projects'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <Package className="h-4 w-4 inline mr-2" />
                            Paid Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('subscription')}
                            className={cn(
                                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                                activeTab === 'subscription'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <CreditCard className="h-4 w-4 inline mr-2" />
                            Subscription
                        </button>
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={cn(
                                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                                activeTab === 'invoices'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <FileText className="h-4 w-4 inline mr-2" />
                            Invoices
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={cn(
                                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                                activeTab === 'orders'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <ShoppingCart className="h-4 w-4 inline mr-2" />
                            Orders
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'subscription' && (
                    <div className="space-y-6">
                        {/* All Projects/Subscriptions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    All Projects & Subscriptions
                                </h3>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Download className="h-4 w-4 inline mr-2" />
                                        Export All
                                    </button>
                                    <button
                                        onClick={handleUpgrade}
                                        className="px-4 py-2 bg-[#e1802b] text-white rounded-lg hover:bg-[#d16f1a] transition-colors"
                                    >
                                        <TrendingUp className="h-4 w-4 inline mr-2" />
                                        Upgrade Plan
                                    </button>
                                </div>
                            </div>

                            {subscriptions.length > 0 ? (
                                <div className="space-y-4">
                                    {subscriptions.map((project) => (
                                        <div key={project.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {project.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {project.type} • Created {new Date(project.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={cn(
                                                        "px-2 py-1 text-xs font-medium rounded-full",
                                                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        project.status === 'training' ? 'bg-blue-100 text-blue-800' :
                                                        project.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    )}>
                                                        {project.status}
                                                    </span>
                                                    {project.subscription && (
                                                        <span className={cn(
                                                            "px-2 py-1 text-xs font-medium rounded-full",
                                                            project.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            project.subscription.status === 'pending' ? 'text-yellow-800 bg-yellow-100' :
                                                            project.subscription.status === 'cancelled' ? 'text-red-800 bg-red-100' :
                                                            'text-gray-800 bg-gray-100'
                                                        )}>
                                                            {project.subscription.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Project Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Model Type:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white ml-1 capitalize">
                                                        {project.model_type}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Training Status:</span>
                                                    <span className={cn(
                                                        "font-medium ml-1 capitalize",
                                                        project.training_status === 'trained' ? 'text-green-600' :
                                                        project.training_status === 'training' ? 'text-blue-600' :
                                                        project.training_status === 'failed' ? 'text-red-600' :
                                                        'text-gray-600'
                                                    )}>
                                                        {project.training_status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                        {project.accuracy > 0 ? `${project.accuracy.toFixed(2)}%` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                                                    <span className={cn(
                                                        "font-medium ml-1 capitalize",
                                                        project.payment_status === 'paid' ? 'text-green-600' :
                                                        project.payment_status === 'pending' ? 'text-yellow-600' :
                                                        project.payment_status === 'failed' ? 'text-red-600' :
                                                        'text-gray-600'
                                                    )}>
                                                        {project.payment_status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Subscription Details */}
                                            {project.subscription && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <CreditCard className="h-4 w-4 text-green-600 mr-2" />
                                                        <span className="font-medium text-green-900 dark:text-green-100">Subscription Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Plan:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1 capitalize">
                                                                {project.subscription.plan_type} - {project.subscription.model_type}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Amount:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                ₹{project.subscription.amount}/{project.subscription.billing_cycle}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.subscription.status === 'active' ? 'text-green-600' :
                                                                project.subscription.status === 'pending' ? 'text-yellow-600' :
                                                                project.subscription.status === 'cancelled' ? 'text-red-600' :
                                                                'text-gray-600'
                                                            )}>
                                                                {project.subscription.status}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Start Date:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                {new Date(project.subscription.start_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">End Date:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                {new Date(project.subscription.end_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Next Billing:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                {project.subscription.next_billing_date ? new Date(project.subscription.next_billing_date).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Order Details */}
                                            {project.order && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <ShoppingCart className="h-4 w-4 text-blue-600 mr-2" />
                                                        <span className="font-medium text-blue-900 dark:text-blue-100">Order Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-blue-700 dark:text-blue-300">Order ID:</span>
                                                            <span className="font-medium text-blue-900 dark:text-blue-100 ml-1">
                                                                #{project.order.id.slice(-8)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                                                            <span className="font-medium text-blue-900 dark:text-blue-100 ml-1">
                                                                ₹{project.order.amount} {project.order.currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-blue-700 dark:text-blue-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.order.status === 'completed' ? 'text-green-600' :
                                                                project.order.status === 'processing' ? 'text-blue-600' :
                                                                project.order.status === 'pending' ? 'text-yellow-600' :
                                                                'text-red-600'
                                                            )}>
                                                                {project.order.status}
                                                            </span>
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <span className="text-blue-700 dark:text-blue-300">Created:</span>
                                                            <span className="font-medium text-blue-900 dark:text-blue-100 ml-1">
                                                                {new Date(project.order.created_at).toLocaleDateString()} at {new Date(project.order.created_at).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Invoice Details */}
                                            {project.invoice && (
                                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <Receipt className="h-4 w-4 text-purple-600 mr-2" />
                                                        <span className="font-medium text-purple-900 dark:text-purple-100">Invoice Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Invoice ID:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                #{project.invoice.id.slice(-8)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Amount:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                ₹{project.invoice.amount} {project.invoice.currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.invoice.status === 'paid' ? 'text-green-600' :
                                                                project.invoice.status === 'unpaid' ? 'text-yellow-600' :
                                                                project.invoice.status === 'overdue' ? 'text-red-600' :
                                                                'text-gray-600'
                                                            )}>
                                                                {project.invoice.status}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Due Date:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                {new Date(project.invoice.due_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {project.invoice.paid_at && (
                                                            <div>
                                                                <span className="text-purple-700 dark:text-purple-300">Paid At:</span>
                                                                <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                    {new Date(project.invoice.paid_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Created:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                {new Date(project.invoice.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Payment Details */}
                                            {project.payment && (
                                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <CreditCard className="h-4 w-4 text-orange-600 mr-2" />
                                                        <span className="font-medium text-orange-900 dark:text-orange-100">Payment Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Payment ID:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                #{project.payment.id.slice(-8)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Amount:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                ₹{project.payment.amount} {project.payment.currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Method:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1 capitalize">
                                                                {project.payment.payment_method}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.payment.status === 'completed' ? 'text-green-600' :
                                                                project.payment.status === 'failed' ? 'text-red-600' :
                                                                project.payment.status === 'pending' ? 'text-yellow-600' :
                                                                'text-gray-600'
                                                            )}>
                                                                {project.payment.status}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Created:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                {new Date(project.payment.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {project.payment.paid_at && (
                                                            <div>
                                                                <span className="text-orange-700 dark:text-orange-300">Paid At:</span>
                                                                <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                    {new Date(project.payment.paid_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {project.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Projects Found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        You haven't created any projects yet. Start by creating and training a project.
                                    </p>
                                    <button
                                        onClick={() => navigate('/projects')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Invoices Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Invoices
                                </h3>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Download className="h-4 w-4 inline mr-2" />
                                    Export All
                                </button>
                            </div>

                            {invoices.length === 0 ? (
                                <div className="text-center py-8">
                                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Invoices Found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        You don't have any invoices yet. Invoices will appear here once you make payments.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {invoices.map((invoice) => (
                                        <div key={invoice.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={cn(
                                                        'p-2 rounded-full',
                                                        invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/20' :
                                                        invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                        'bg-red-100 dark:bg-red-900/20'
                                                    )}>
                                                        {invoice.status === 'paid' ? (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        ) : invoice.status === 'pending' ? (
                                                            <Calendar className="h-5 w-5 text-yellow-600" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Invoice #{invoice.id.slice(-8)}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Created: {new Date(invoice.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            ₹{invoice.amount} {invoice.currency.toUpperCase()}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                            {invoice.status}
                                                        </p>
                                                        {invoice.due_date && (
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                Due: {new Date(invoice.due_date).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDownloadInvoice(invoice.id)}
                                                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                            title="Download Invoice"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Orders Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Orders
                                </h3>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Download className="h-4 w-4 inline mr-2" />
                                    Export All
                                </button>
                            </div>

                            {orders.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Orders Found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        You haven't placed any orders yet. Orders will appear here once you make purchases.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={cn(
                                                        'p-2 rounded-full',
                                                        order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                                                        order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                                        order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                        'bg-red-100 dark:bg-red-900/20'
                                                    )}>
                                                        {order.status === 'completed' ? (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        ) : order.status === 'processing' ? (
                                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                                        ) : order.status === 'pending' ? (
                                                            <Calendar className="h-5 w-5 text-yellow-600" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Order #{order.id.slice(-8)}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Created: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                                        </p>
                                                        {order.updated_at && order.updated_at !== order.created_at && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Updated: {new Date(order.updated_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            ₹{order.amount} {order.currency.toUpperCase()}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                            {order.status}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                                                            {order.payment_method}
                                                        </p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'paid_projects' && (
                    <div className="space-y-6">
                        {/* Paid Projects */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Paid Projects
                                </h3>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {paidProjects.length} project{paidProjects.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {paidProjects.length > 0 ? (
                                <div className="space-y-4">
                                    {paidProjects.map((project) => (
                                        <div key={project.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {project.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {project.type} • Created {new Date(project.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    Paid
                                                </span>
                                            </div>

                                            {/* Order Details */}
                                            {project.order && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <ShoppingCart className="h-4 w-4 text-blue-600 mr-2" />
                                                        <span className="font-medium text-blue-900 dark:text-blue-100">Order Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-blue-700 dark:text-blue-300">Order ID:</span>
                                                            <span className="font-medium text-blue-900 dark:text-blue-100 ml-1">
                                                                #{project.order.id.slice(-8)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                                                            <span className="font-medium text-blue-900 dark:text-blue-100 ml-1">
                                                                ₹{project.order.amount} {project.order.currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-blue-700 dark:text-blue-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.order.status === 'completed' ? 'text-green-600' :
                                                                project.order.status === 'processing' ? 'text-blue-600' :
                                                                project.order.status === 'pending' ? 'text-yellow-600' :
                                                                'text-red-600'
                                                            )}>
                                                                {project.order.status}
                                                            </span>
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <span className="text-blue-700 dark:text-blue-300">Created:</span>
                                                            <span className="font-medium text-blue-900 dark:text-blue-100 ml-1">
                                                                {new Date(project.order.created_at).toLocaleDateString()} at {new Date(project.order.created_at).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Subscription Details */}
                                            {project.subscription && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <CreditCard className="h-4 w-4 text-green-600 mr-2" />
                                                        <span className="font-medium text-green-900 dark:text-green-100">Subscription Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Plan:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1 capitalize">
                                                                {project.subscription.plan_type} - {project.subscription.model_type}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Amount:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                ₹{project.subscription.amount}/{project.subscription.billing_cycle}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.subscription.status === 'active' ? 'text-green-600' :
                                                                project.subscription.status === 'pending' ? 'text-yellow-600' :
                                                                project.subscription.status === 'cancelled' ? 'text-red-600' :
                                                                'text-gray-600'
                                                            )}>
                                                                {project.subscription.status}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Start Date:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                {new Date(project.subscription.start_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">End Date:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                {new Date(project.subscription.end_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Next Billing:</span>
                                                            <span className="font-medium text-green-900 dark:text-green-100 ml-1">
                                                                {project.subscription.next_billing_date ? new Date(project.subscription.next_billing_date).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Invoice Details */}
                                            {project.invoice && (
                                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <Receipt className="h-4 w-4 text-purple-600 mr-2" />
                                                        <span className="font-medium text-purple-900 dark:text-purple-100">Invoice Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Invoice ID:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                #{project.invoice.id.slice(-8)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Amount:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                ₹{project.invoice.amount} {project.invoice.currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.invoice.status === 'paid' ? 'text-green-600' :
                                                                project.invoice.status === 'unpaid' ? 'text-yellow-600' :
                                                                project.invoice.status === 'overdue' ? 'text-red-600' :
                                                                'text-gray-600'
                                                            )}>
                                                                {project.invoice.status}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Due Date:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                {new Date(project.invoice.due_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {project.invoice.paid_at && (
                                                            <div>
                                                                <span className="text-purple-700 dark:text-purple-300">Paid At:</span>
                                                                <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                    {new Date(project.invoice.paid_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-purple-700 dark:text-purple-300">Created:</span>
                                                            <span className="font-medium text-purple-900 dark:text-purple-100 ml-1">
                                                                {new Date(project.invoice.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Payment Details */}
                                            {project.payment && (
                                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center mb-2">
                                                        <CreditCard className="h-4 w-4 text-orange-600 mr-2" />
                                                        <span className="font-medium text-orange-900 dark:text-orange-100">Payment Details</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Payment ID:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                #{project.payment.id.slice(-8)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Amount:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                ₹{project.payment.amount} {project.payment.currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Method:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1 capitalize">
                                                                {project.payment.payment_method}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Status:</span>
                                                            <span className={cn(
                                                                "font-medium ml-1 capitalize",
                                                                project.payment.status === 'completed' ? 'text-green-600' :
                                                                project.payment.status === 'failed' ? 'text-red-600' :
                                                                project.payment.status === 'pending' ? 'text-yellow-600' :
                                                                'text-gray-600'
                                                            )}>
                                                                {project.payment.status}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700 dark:text-orange-300">Created:</span>
                                                            <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                {new Date(project.payment.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {project.payment.paid_at && (
                                                            <div>
                                                                <span className="text-orange-700 dark:text-orange-300">Paid At:</span>
                                                                <span className="font-medium text-orange-900 dark:text-orange-100 ml-1">
                                                                    {new Date(project.payment.paid_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional project details */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Model Type:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white ml-1 capitalize">
                                                        {project.model_type}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Training Status:</span>
                                                    <span className={cn(
                                                        "font-medium ml-1 capitalize",
                                                        project.training_status === 'trained' ? 'text-green-600' :
                                                        project.training_status === 'training' ? 'text-blue-600' :
                                                        project.training_status === 'failed' ? 'text-red-600' :
                                                        'text-gray-600'
                                                    )}>
                                                        {project.training_status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                        {project.accuracy > 0 ? `${project.accuracy.toFixed(2)}%` : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            {project.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Paid Projects
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        You haven't purchased any projects yet. Start by creating and training a project.
                                    </p>
                                    <button
                                        onClick={() => navigate('/projects')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        View Projects
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Subscription Tab */}
                    {activeTab === 'subscription' && (
                        <>
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
                                                {subscription.plan_type} Plan - {subscription.project_name}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                ₹{subscription.amount}/{subscription.billing_cycle} - {subscription.model_type} Model
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Next billing</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'N/A'}
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
                                        {subscription.status === 'active' && subscription.plan_type !== 'basic' && (
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

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Invoices
                                    </h2>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Download className="h-4 w-4 inline mr-2" />
                                        Export All
                                    </button>
                                </div>

                                {invoices.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Invoices Found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            You don't have any invoices yet. Invoices will appear here once you make payments.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {invoices.map((invoice) => (
                                            <div key={invoice.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={cn(
                                                            'p-2 rounded-full',
                                                            invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/20' :
                                                            invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                            'bg-red-100 dark:bg-red-900/20'
                                                        )}>
                                                            {invoice.status === 'paid' ? (
                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                            ) : invoice.status === 'pending' ? (
                                                                <Calendar className="h-5 w-5 text-yellow-600" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                Invoice #{invoice.id.slice(-8)}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Created: {new Date(invoice.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                ₹{invoice.amount} {invoice.currency.toUpperCase()}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                                {invoice.status}
                                                            </p>
                                                            {invoice.due_date && (
                                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleDownloadInvoice(invoice.id)}
                                                                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                                title="Download Invoice"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </button>
                                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Orders
                                    </h2>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Download className="h-4 w-4 inline mr-2" />
                                        Export All
                                    </button>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Orders Found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            You haven't placed any orders yet. Orders will appear here once you make purchases.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={cn(
                                                            'p-2 rounded-full',
                                                            order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                                                            order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                                            order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                            'bg-red-100 dark:bg-red-900/20'
                                                        )}>
                                                            {order.status === 'completed' ? (
                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                            ) : order.status === 'processing' ? (
                                                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                                            ) : order.status === 'pending' ? (
                                                                <Calendar className="h-5 w-5 text-yellow-600" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                Order #{order.id.slice(-8)}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Created: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                                            </p>
                                                            {order.updated_at && order.updated_at !== order.created_at && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Updated: {new Date(order.updated_at).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                ₹{order.amount} {order.currency.toUpperCase()}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                                {order.status}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                                                                {order.payment_method}
                                                            </p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                                <Download className="h-4 w-4" />
                                                            </button>
                                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


export default SubscriptionPage;
