import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import { IntegrationService } from '@/services/integrationService';
import { PlatformIntegration } from '@/pages/api/integrations/index';

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState('');
  const [accountHealth, setAccountHealth] = useState<any>(null);
  
  const integrationService = IntegrationService.getInstance();

  useEffect(() => {
    loadIntegrations();
    loadAccountHealth();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await integrationService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountHealth = async () => {
    try {
      const health = await integrationService.getAccountHealth();
      setAccountHealth(health);
    } catch (error) {
      console.error('Failed to load account health:', error);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      const connectResponse = await integrationService.connectPlatform(platform, {
        shopDomain: platform === 'shopify' ? shopDomain : undefined
      });
      
      // Open OAuth popup
      const popup = window.open(
        connectResponse.authUrl,
        'oauth_popup',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Poll for popup closure
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          loadIntegrations(); // Refresh integrations
          setConnecting(null);
          setShowConnectModal(false);
          setSelectedPlatform(null);
          setShopDomain('');
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to connect platform:', error);
      alert('Failed to connect platform. Please try again.');
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id: string, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}?`)) {
      return;
    }

    try {
      await integrationService.disconnectIntegration(id);
      loadIntegrations();
      loadAccountHealth();
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
      alert('Failed to disconnect integration. Please try again.');
    }
  };

  const handleTestConnection = async (platform: string) => {
    try {
      const result = await integrationService.testConnection(platform);
      alert(`${result.status === 'success' ? '✅' : '❌'} ${result.message}`);
    } catch (error) {
      alert('❌ Connection test failed');
    }
  };

  const getStatusColor = (status: PlatformIntegration['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 border-green-300';
      case 'error': return 'text-red-600 bg-red-100 border-red-300';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'disconnected': return 'text-gray-600 bg-gray-100 border-gray-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getStatusIcon = (status: PlatformIntegration['status']) => {
    switch (status) {
      case 'connected': return '✅';
      case 'error': return '❌';
      case 'pending': return '🔄';
      case 'disconnected': return '⚪';
      default: return '⚪';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      meta: '📘',
      google: '🔍',
      linkedin: '💼',
      shopify: '🛒',
      tiktok: '🎵'
    };
    return icons[platform as keyof typeof icons] || '🔗';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </Sidebar>
    );
  }

  return (
    <>
      <Head>
        <title>Platform Integrations - CreativePilot Pro</title>
      </Head>

      <Sidebar>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Integrations</h1>
                <p className="text-gray-600 mt-2">Connect your advertising accounts to manage campaigns from one place</p>
              </div>
              <button
                onClick={() => setShowConnectModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                ➕ Add Integration
              </button>
            </div>

            {/* Account Health Overview */}
            {accountHealth && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Connected</p>
                      <p className="text-2xl font-bold text-green-600">{accountHealth.connected}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Errors</p>
                      <p className="text-2xl font-bold text-red-600">{accountHealth.errors}</p>
                    </div>
                    <div className="text-3xl">❌</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Spend</p>
                      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(accountHealth.totalSpend)}</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Issues</p>
                      <p className="text-2xl font-bold text-yellow-600">{accountHealth.issues.length}</p>
                    </div>
                    <div className="text-3xl">⚠️</div>
                  </div>
                </div>
              </div>
            )}

            {/* Issues Alert */}
            {accountHealth && accountHealth.issues.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">⚠️</div>
                  <h3 className="text-lg font-semibold text-yellow-800">Account Issues Detected</h3>
                </div>
                <div className="space-y-2">
                  {accountHealth.issues.slice(0, 3).map((issue: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-sm px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 capitalize">
                        {issue.platform}
                      </span>
                      <span className="text-sm text-gray-700">{issue.issue}</span>
                    </div>
                  ))}
                  {accountHealth.issues.length > 3 && (
                    <p className="text-sm text-gray-600 italic">
                      +{accountHealth.issues.length - 3} more issues...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Integrations Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{getPlatformIcon(integration.platform)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{integration.platform}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)} {integration.status}
                      </div>
                    </div>

                    {integration.accountName && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Account: {integration.accountName}</p>
                        {integration.accountId && (
                          <p className="text-xs text-gray-500">ID: {integration.accountId}</p>
                        )}
                      </div>
                    )}

                    {/* Metrics */}
                    {integration.metrics && integration.status === 'connected' && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Overview</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Total Spend</p>
                            <p className="font-semibold">{formatCurrency(integration.metrics.totalSpend)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Clicks</p>
                            <p className="font-semibold">{formatNumber(integration.metrics.totalClicks)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">CTR</p>
                            <p className="font-semibold">{integration.metrics.avgCTR.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">CPC</p>
                            <p className="font-semibold">${integration.metrics.avgCPC.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Settings */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Auto-publish:</span>
                        <span className={integration.settings.autoPublish ? 'text-green-600' : 'text-gray-600'}>
                          {integration.settings.autoPublish ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      {integration.settings.defaultBudget && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Default Budget:</span>
                          <span>${integration.settings.defaultBudget}/day</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sync:</span>
                        <span className="capitalize">{integration.settings.syncFrequency}</span>
                      </div>
                      {integration.lastSync && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Sync:</span>
                          <span>{new Date(integration.lastSync).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 mt-6">
                      {integration.status === 'connected' ? (
                        <>
                          <button
                            onClick={() => handleTestConnection(integration.platform)}
                            className="flex-1 bg-indigo-50 text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                          >
                            Test Connection
                          </button>
                          <button
                            onClick={() => handleDisconnect(integration.id, integration.name)}
                            className="bg-red-50 text-red-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPlatform(integration.platform);
                            if (integration.platform === 'shopify') {
                              setShowConnectModal(true);
                            } else {
                              handleConnect(integration.platform);
                            }
                          }}
                          disabled={connecting === integration.platform}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {connecting === integration.platform ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Connecting...
                            </>
                          ) : (
                            'Connect Account'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Connect Modal */}
            {showConnectModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-md w-full p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">
                      {selectedPlatform === 'shopify' ? 'Connect Shopify Store' : 'Add Integration'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowConnectModal(false);
                        setSelectedPlatform(null);
                        setShopDomain('');
                      }}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {selectedPlatform === 'shopify' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shop Domain
                        </label>
                        <input
                          type="text"
                          value={shopDomain}
                          onChange={(e) => setShopDomain(e.target.value)}
                          placeholder="your-store"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Enter your shop name (from your-store.myshopify.com)
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setShowConnectModal(false);
                            setSelectedPlatform(null);
                            setShopDomain('');
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConnect('shopify')}
                          disabled={!shopDomain || connecting === 'shopify'}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {connecting === 'shopify' ? 'Connecting...' : 'Connect Store'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </Sidebar>
    </>
  );
};

export default IntegrationsPage;