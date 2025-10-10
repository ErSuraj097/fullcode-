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
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authApi } from '../../api/services/api';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AccountSettings: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { logout } = useAuth();

    // State for forms
    const [showDeactivateForm, setShowDeactivateForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [deactivatePassword, setDeactivatePassword] = useState('');
    const [deactivateReason, setDeactivateReason] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [showPasswords, setShowPasswords] = useState({ deactivate: false, delete: false });

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

    // Delete account mutation
    const deleteMutation = useMutation({
        mutationFn: ({ password, confirmation }: { password: string; confirmation: string }) =>
            authApi.deleteAccount(password, confirmation),
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

    const handleDelete = () => {
        if (!deletePassword) {
            toast.error('Password is required');
            return;
        }
        if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
            toast.error('Please type "DELETE MY ACCOUNT" to confirm');
            return;
        }
        deleteMutation.mutate({ password: deletePassword, confirmation: deleteConfirmation });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                                onClick={handleDelete}
                                                disabled={deleteMutation.isPending}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {deleteMutation.isPending ? (
                                                    <LoadingSpinner size="xs" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Delete Account
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;