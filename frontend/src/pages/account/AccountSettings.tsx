import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User,
    Shield,
    AlertTriangle,
    Trash2,
    UserX,
    RefreshCw,
    Calendar,
    BarChart3,
    ArrowLeft,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Mail,
    Settings,
    Key,
    Bell,
    Globe,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authApi } from '../../api/services/api';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AccountSettings: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { logout } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'api-keys'>('profile');

    // State for forms
    const [showDeactivateForm, setShowDeactivateForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [deactivatePassword, setDeactivatePassword] = useState('');
    const [deactivateReason, setDeactivateReason] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteOtp, setDeleteOtp] = useState('');
    const [showPasswords, setShowPasswords] = useState({ deactivate: false, delete: false });

    // Preferences state
    const [preferences, setPreferences] = useState({
        theme: 'light',
        notifications: {
            email: true,
            push: true,
            marketing: false,
        },
        language: 'en',
        timezone: 'UTC',
    });

    // Security state
    const [securitySettings, setSecuritySettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false,
    });

    // API Keys state
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [newApiKeyName, setNewApiKeyName] = useState('');

    // Fetch account info
    const { data: accountInfo, isLoading } = useQuery({
        queryKey: ['account-info'],
        queryFn: authApi.getAccountInfo,
    });

    // Deactivate account mutation
    const deactivateMutation = useMutation({
        mutationFn: ({ password, reason }: { password: string; reason?: string }) =>
            authApi.deactivateAccount(password, reason),
        onSuccess: () => {
            toast.success('Account deactivated successfully');
            logout();
            navigate('/login');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to deactivate account');
        },
    });

    // Initiate account deletion mutation
    const initiateDeletionMutation = useMutation({
        mutationFn: ({ password, confirmation }: { password: string; confirmation: string }) =>
            authApi.initiateAccountDeletion(password, confirmation),
        onSuccess: () => {
            toast.success('Verification code sent to your email. Please check your inbox.');
            setShowDeleteForm(false);
            setShowOtpForm(true);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to initiate account deletion');
        },
    });

    // Delete account mutation (OTP verification)
    const deleteMutation = useMutation({
        mutationFn: (otp: string) => authApi.deleteAccount(otp),
        onSuccess: (data) => {
            toast.success(`Account deleted successfully. ${data.projects_deleted} projects were removed.`);
            logout();
            navigate('/');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to delete account');
        },
    });

    const handleDeactivate = () => {
        if (!deactivatePassword) {
            toast.error('Password is required');
            return;
        }
        deactivateMutation.mutate({ password: deactivatePassword, reason: deactivateReason });
    };

    const handleInitiateDeletion = () => {
        if (!deletePassword) {
            toast.error('Password is required');
            return;
        }
        if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
            toast.error('Please type "DELETE MY ACCOUNT" to confirm');
            return;
        }
        initiateDeletionMutation.mutate({ password: deletePassword, confirmation: deleteConfirmation });
    };

    const handleDelete = () => {
        if (!deleteOtp) {
            toast.error('OTP is required');
            return;
        }
        if (deleteOtp.length !== 4 || !/^\d+$/.test(deleteOtp)) {
            toast.error('OTP must be a 4-digit number');
            return;
        }
        deleteMutation.mutate(deleteOtp);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Tab navigation component
    const TabNavigation = () => (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
                {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'preferences', label: 'Preferences', icon: Settings },
                    { id: 'security', label: 'Security', icon: Shield },
                    { id: 'api-keys', label: 'API Keys', icon: Key },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your account preferences and data
                    </p>
                </div>

                {/* Tab Navigation */}
                <TabNavigation />

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Account Overview */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center mb-4">
                                <User className="h-5 w-5 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{accountInfo?.user?.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{accountInfo?.user?.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {accountInfo?.user?.created_at ? new Date(accountInfo.user.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</label>
                                    <div className="mt-1 flex items-center">
                                        {accountInfo?.user?.is_active ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                                <span className="text-sm text-green-600">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4 text-red-600 mr-2" />
                                                <span className="text-sm text-red-600">Inactive</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Statistics */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center mb-4">
                                <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Statistics</h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {accountInfo?.statistics?.total_projects || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Projects</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {accountInfo?.statistics?.trained_models || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Trained Models</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {accountInfo?.statistics?.account_age_days || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                                <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                            </div>

                            {/* Deactivate Account */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Deactivate Account</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Temporarily disable your account. You can reactivate it anytime by logging in.
                                    </p>
                                    <button
                                        onClick={() => setShowDeactivateForm(!showDeactivateForm)}
                                        className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                    >
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate Account
                                    </button>
                                </div>

                                {/* Deactivate Form */}
                                {showDeactivateForm && (
                                    <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.deactivate ? 'text' : 'password'}
                                                    value={deactivatePassword}
                                                    onChange={(e) => setDeactivatePassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, deactivate: !prev.deactivate }))}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.deactivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Reason (Optional)
                                            </label>
                                            <textarea
                                                value={deactivateReason}
                                                onChange={(e) => setDeactivateReason(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="Why are you deactivating your account?"
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleDeactivate}
                                                disabled={deactivateMutation.isPending}
                                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                                            >
                                                {deactivateMutation.isPending ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <UserX className="h-4 w-4 mr-2" />
                                                )}
                                                Deactivate
                                            </button>
                                            <button
                                                onClick={() => setShowDeactivateForm(false)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Delete Account */}
                                <div className="pt-4">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Delete Account</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Permanently delete your account and all data. This action cannot be undone.
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                                        {accountInfo?.account_status?.deletion_warning}
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteForm(!showDeleteForm)}
                                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Account
                                    </button>
                                </div>

                                {/* Delete Form */}
                                {showDeleteForm && (
                                    <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.delete ? 'text' : 'password'}
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, delete: !prev.delete }))}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.delete ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Type "DELETE MY ACCOUNT" to confirm
                                            </label>
                                            <input
                                                type="text"
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="DELETE MY ACCOUNT"
                                            />
                                        </div>
                                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3">
                                            <div className="flex">
                                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-700 dark:text-red-400">
                                                    <strong>Warning:</strong> This action is irreversible. All your projects, trained models, and data will be permanently deleted.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleInitiateDeletion}
                                                disabled={initiateDeletionMutation.isPending}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {initiateDeletionMutation.isPending ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Send Verification Code
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteForm(false)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* OTP Verification Form */}
                                {showOtpForm && (
                                    <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="text-center mb-4">
                                            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                A verification code has been sent to your email. Please enter it below to complete account deletion.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Verification Code (4 digits)
                                            </label>
                                            <input
                                                type="text"
                                                value={deleteOtp}
                                                onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono"
                                                placeholder="0000"
                                                maxLength={4}
                                            />
                                        </div>
                                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3">
                                            <div className="flex">
                                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-700 dark:text-red-400">
                                                    <strong>Final Warning:</strong> Entering the correct code will permanently delete your account and all associated data.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleDelete}
                                                disabled={deleteMutation.isPending}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {deleteMutation.isPending ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Delete Account Permanently
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowOtpForm(false);
                                                    setDeleteOtp('');
                                                }}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center mb-6">
                                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Theme Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Theme
                                    </label>
                                    <div className="flex space-x-4">
                                        {[
                                            { value: 'light', label: 'Light' },
                                            { value: 'dark', label: 'Dark' },
                                            { value: 'auto', label: 'Auto' },
                                        ].map((theme) => (
                                            <label key={theme.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    value={theme.value}
                                                    checked={preferences.theme === theme.value}
                                                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{theme.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Notifications
                                    </label>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'email', label: 'Email notifications' },
                                            { key: 'push', label: 'Push notifications' },
                                            { key: 'marketing', label: 'Marketing communications' },
                                        ].map((notif) => (
                                            <label key={notif.key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.notifications[notif.key as keyof typeof preferences.notifications]}
                                                    onChange={(e) => setPreferences(prev => ({
                                                        ...prev,
                                                        notifications: {
                                                            ...prev.notifications,
                                                            [notif.key]: !prev.notifications[notif.key as keyof typeof prev.notifications]
                                                        }
                                                    }))}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{notif.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Language
                                    </label>
                                    <select
                                        value={preferences.language}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>

                                {/* Timezone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Timezone
                                    </label>
                                    <select
                                        value={preferences.timezone}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time</option>
                                        <option value="America/Chicago">Central Time</option>
                                        <option value="America/Denver">Mountain Time</option>
                                        <option value="America/Los_Angeles">Pacific Time</option>
                                    </select>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4">
                                    <button
                                        onClick={() => toast.success('Preferences saved successfully')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Password Change */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center mb-6">
                                <Shield className="h-5 w-5 text-green-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={securitySettings.currentPassword}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={securitySettings.newPassword}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={securitySettings.confirmPassword}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <button
                                    onClick={() => toast.success('Password changed successfully')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-purple-600 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                                </div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={securitySettings.twoFactorEnabled}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </label>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Add an extra layer of security to your account by requiring a second form of authentication.
                            </p>

                            {securitySettings.twoFactorEnabled && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md p-4">
                                    <p className="text-sm text-purple-700 dark:text-purple-400">
                                        Two-factor authentication is enabled. You'll need to enter a code from your authenticator app when signing in.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                                <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                            </div>

                            {/* Deactivate Account */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Deactivate Account</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Temporarily disable your account. You can reactivate it anytime by logging in.
                                    </p>
                                    <button
                                        onClick={() => setShowDeactivateForm(!showDeactivateForm)}
                                        className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                    >
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate Account
                                    </button>
                                </div>

                                {/* Deactivate Form */}
                                {showDeactivateForm && (
                                    <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.deactivate ? 'text' : 'password'}
                                                    value={deactivatePassword}
                                                    onChange={(e) => setDeactivatePassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, deactivate: !prev.deactivate }))}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.deactivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Reason (Optional)
                                            </label>
                                            <textarea
                                                value={deactivateReason}
                                                onChange={(e) => setDeactivateReason(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="Why are you deactivating your account?"
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleDeactivate}
                                                disabled={deactivateMutation.isPending}
                                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                                            >
                                                {deactivateMutation.isPending ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <UserX className="h-4 w-4 mr-2" />
                                                )}
                                                Deactivate
                                            </button>
                                            <button
                                                onClick={() => setShowDeactivateForm(false)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Delete Account */}
                                <div className="pt-4">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Delete Account</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Permanently delete your account and all data. This action cannot be undone.
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                                        {accountInfo?.account_status?.deletion_warning}
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteForm(!showDeleteForm)}
                                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Account
                                    </button>
                                </div>

                                {/* Delete Form */}
                                {showDeleteForm && (
                                    <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.delete ? 'text' : 'password'}
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, delete: !prev.delete }))}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.delete ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Type "DELETE MY ACCOUNT" to confirm
                                            </label>
                                            <input
                                                type="text"
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="DELETE MY ACCOUNT"
                                            />
                                        </div>
                                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3">
                                            <div className="flex">
                                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-700 dark:text-red-400">
                                                    <strong>Warning:</strong> This action is irreversible. All your projects, trained models, and data will be permanently deleted.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleInitiateDeletion}
                                                disabled={initiateDeletionMutation.isPending}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {initiateDeletionMutation.isPending ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Send Verification Code
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteForm(false)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* OTP Verification Form */}
                                {showOtpForm && (
                                    <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="text-center mb-4">
                                            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                A verification code has been sent to your email. Please enter it below to complete account deletion.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Verification Code (4 digits)
                                            </label>
                                            <input
                                                type="text"
                                                value={deleteOtp}
                                                onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono"
                                                placeholder="0000"
                                                maxLength={4}
                                            />
                                        </div>
                                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3">
                                            <div className="flex">
                                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-700 dark:text-red-400">
                                                    <strong>Final Warning:</strong> Entering the correct code will permanently delete your account and all associated data.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleDelete}
                                                disabled={deleteMutation.isPending}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {deleteMutation.isPending ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Delete Account Permanently
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowOtpForm(false);
                                                    setDeleteOtp('');
                                                }}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* API Keys Tab */}
                {activeTab === 'api-keys' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Key className="h-5 w-5 text-indigo-600 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h2>
                                </div>
                                <button
                                    onClick={() => toast.success('API key generation not implemented yet')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    Generate New Key
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="text-center py-8">
                                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No API Keys</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        You haven't created any API keys yet. Generate your first key to get started.
                                    </p>
                                    <button
                                        onClick={() => toast.info('API key management will be implemented soon')}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        <Key className="h-4 w-4 mr-2" />
                                        Create Your First API Key
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountSettings;
