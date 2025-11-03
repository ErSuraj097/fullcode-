import React, { useState, useEffect } from 'react';
import { 
    Key, 
    Plus, 
    Copy, 
    Eye, 
    EyeOff, 
    Trash2, 
    RefreshCw,
    Calendar,
    Activity,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    permissions: string[];
    last_used_at: string | null;
    usage_count: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

interface CreateApiKeyData {
    name: string;
    permissions: string[];
    expires_in_days: number;
}

const ApiKeysPage: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newApiKey, setNewApiKey] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    const [createData, setCreateData] = useState<CreateApiKeyData>({
        name: '',
        permissions: ['read'],
        expires_in_days: 365
    });

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/api/keys', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApiKeys(data.api_keys);
            } else {
                setError('Failed to load API keys');
            }
        } catch (err) {
            setError('Failed to load API keys');
            console.error('Error fetching API keys:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApiKey = async () => {
        try {
            if (!createData.name.trim()) {
                alert('Please enter a name for the API key');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/api/keys', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createData)
            });

            if (response.ok) {
                const data = await response.json();
                setNewApiKey(data.api_key.key);
                setShowCreateModal(false);
                setCreateData({
                    name: '',
                    permissions: ['read'],
                    expires_in_days: 365
                });
                fetchApiKeys();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to create API key');
            }
        } catch (err) {
            alert('Failed to create API key');
            console.error('Error creating API key:', err);
        }
    };

    const handleDeleteApiKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/api/keys/${keyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchApiKeys();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete API key');
            }
        } catch (err) {
            alert('Failed to delete API key');
            console.error('Error deleting API key:', err);
        }
    };

    const handleRegenerateApiKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/api/keys/${keyId}/regenerate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNewApiKey(data.api_key.key);
                fetchApiKeys();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to regenerate API key');
            }
        } catch (err) {
            alert('Failed to regenerate API key');
            console.error('Error regenerating API key:', err);
        }
    };

    const handleToggleKeyVisibility = (keyId: string) => {
        const newVisibleKeys = new Set(visibleKeys);
        if (newVisibleKeys.has(keyId)) {
            newVisibleKeys.delete(keyId);
        } else {
            newVisibleKeys.add(keyId);
        }
        setVisibleKeys(newVisibleKeys);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const getPermissionColor = (permission: string) => {
        switch (permission) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'write':
                return 'bg-yellow-100 text-yellow-800';
            case 'read':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e1802b]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            API Keys
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage your API keys for programmatic access to your chatbots
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-[#e1802b] text-white rounded-lg hover:bg-[#d16f1a] transition-colors flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create API Key
                    </button>
                </div>

                {/* New API Key Display */}
                {newApiKey && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <h3 className="font-medium text-green-800 dark:text-green-200">
                                API Key Created Successfully
                            </h3>
                        </div>
                        <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                            Make sure to copy your API key now. You won't be able to see it again!
                        </p>
                        <div className="flex items-center space-x-2">
                            <code className="flex-1 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded px-3 py-2 text-sm font-mono">
                                {newApiKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(newApiKey)}
                                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => setNewApiKey(null)}
                            className="mt-3 text-green-600 hover:text-green-700 text-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* API Keys List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    {apiKeys.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {apiKeys.map((apiKey) => (
                                <div key={apiKey.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <Key className="h-5 w-5 text-[#e1802b]" />
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {apiKey.name}
                                                </h3>
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-xs font-medium',
                                                    apiKey.is_active 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                )}>
                                                    {apiKey.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Created {new Date(apiKey.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Activity className="h-4 w-4 mr-1" />
                                                    {apiKey.usage_count} uses
                                                </div>
                                                {apiKey.last_used_at && (
                                                    <div>
                                                        Last used {new Date(apiKey.last_used_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {apiKey.expires_at && (
                                                    <div className="flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        Expires {new Date(apiKey.expires_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2 mb-3">
                                                {apiKey.permissions.map((permission) => (
                                                    <span
                                                        key={permission}
                                                        className={cn(
                                                            'px-2 py-1 rounded-full text-xs font-medium',
                                                            getPermissionColor(permission)
                                                        )}
                                                    >
                                                        {permission}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm font-mono">
                                                    {visibleKeys.has(apiKey.id) 
                                                        ? `${apiKey.key_prefix}_${'*'.repeat(32)}`
                                                        : `${apiKey.key_prefix}_${'*'.repeat(32)}`
                                                    }
                                                </code>
                                                <button
                                                    onClick={() => handleToggleKeyVisibility(apiKey.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {visibleKeys.has(apiKey.id) ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleRegenerateApiKey(apiKey.id)}
                                                className="p-2 text-gray-400 hover:text-[#e1802b] transition-colors"
                                                title="Regenerate API Key"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteApiKey(apiKey.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete API Key"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Key className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No API Keys
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Create your first API key to start using the API
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-[#e1802b] text-white rounded-lg hover:bg-[#d16f1a] transition-colors"
                            >
                                Create API Key
                            </button>
                        </div>
                    )}
                </div>

                {/* Create API Key Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Create API Key
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.name}
                                        onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e1802b] focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="My API Key"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Permissions
                                    </label>
                                    <div className="space-y-2">
                                        {['read', 'write', 'admin'].map((permission) => (
                                            <label key={permission} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={createData.permissions.includes(permission)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setCreateData({
                                                                ...createData,
                                                                permissions: [...createData.permissions, permission]
                                                            });
                                                        } else {
                                                            setCreateData({
                                                                ...createData,
                                                                permissions: createData.permissions.filter(p => p !== permission)
                                                            });
                                                        }
                                                    }}
                                                    className="mr-2 rounded border-gray-300 text-[#e1802b] focus:ring-[#e1802b]"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                    {permission}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Expires in (days)
                                    </label>
                                    <select
                                        value={createData.expires_in_days}
                                        onChange={(e) => setCreateData({ ...createData, expires_in_days: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e1802b] focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value={30}>30 days</option>
                                        <option value={90}>90 days</option>
                                        <option value={365}>1 year</option>
                                        <option value={0}>Never expires</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={handleCreateApiKey}
                                    className="flex-1 px-4 py-2 bg-[#e1802b] text-white rounded-lg hover:bg-[#d16f1a] transition-colors"
                                >
                                    Create API Key
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiKeysPage;