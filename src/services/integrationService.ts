import { ApiResponse } from '@/types';
import { PlatformIntegration } from '@/pages/api/integrations/index';

export interface ConnectResponse {
  authUrl: string;
  state: string;
  platform: string;
  expiresAt: Date;
}

export interface PlatformMetrics {
  platform: string;
  metrics: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgCPC: number;
    avgCPM: number;
  };
  campaigns: number;
  adSets: number;
  lastUpdated: Date;
}

export interface SyncStatus {
  platform: string;
  status: 'syncing' | 'completed' | 'error';
  progress: number;
  lastSync?: Date;
  nextSync?: Date;
  error?: string;
}

export class IntegrationService {
  private static instance: IntegrationService;
  private apiBase = '/api/integrations';

  static getInstance(): IntegrationService {
    if (!this.instance) {
      this.instance = new IntegrationService();
    }
    return this.instance;
  }

  async getIntegrations(filters?: {
    platform?: string;
    status?: string;
  }): Promise<PlatformIntegration[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.platform) params.append('platform', filters.platform);
      if (filters?.status) params.append('status', filters.status);

      const response = await fetch(`${this.apiBase}?${params}`);
      const result: ApiResponse<PlatformIntegration[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch integrations');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  }

  async connectPlatform(platform: string, options?: { 
    shopDomain?: string;
    settings?: any;
  }): Promise<ConnectResponse> {
    try {
      const response = await fetch(`${this.apiBase}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          platform, 
          shopDomain: options?.shopDomain 
        })
      });
      
      const result: ApiResponse<ConnectResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to initiate connection');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error connecting platform:', error);
      throw error;
    }
  }

  async updateIntegration(id: string, updates: {
    settings?: Partial<PlatformIntegration['settings']>;
    status?: PlatformIntegration['status'];
  }): Promise<PlatformIntegration> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates })
      });
      
      const result: ApiResponse<PlatformIntegration> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update integration');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  }

  async disconnectIntegration(id: string): Promise<PlatformIntegration> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      
      const result: ApiResponse<PlatformIntegration> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to disconnect integration');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      throw error;
    }
  }

  async syncIntegration(id: string): Promise<SyncStatus> {
    try {
      // Mock sync operation
      const response = await fetch(`${this.apiBase}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        throw new Error('Sync request failed');
      }
      
      // Return mock sync status
      return {
        platform: 'meta', // Would be dynamic based on integration
        status: 'syncing',
        progress: 0,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      };
    } catch (error) {
      console.error('Error syncing integration:', error);
      throw error;
    }
  }

  async getIntegrationMetrics(platform?: string): Promise<PlatformMetrics[]> {
    try {
      // Mock metrics - in production would fetch from actual APIs
      const integrations = await this.getIntegrations({ 
        platform, 
        status: 'connected' 
      });
      
      return integrations
        .filter(integration => integration.metrics)
        .map(integration => ({
          platform: integration.platform,
          metrics: integration.metrics!,
          campaigns: Math.floor(Math.random() * 50) + 5,
          adSets: Math.floor(Math.random() * 200) + 20,
          lastUpdated: integration.lastSync || new Date()
        }));
    } catch (error) {
      console.error('Error fetching integration metrics:', error);
      throw error;
    }
  }

  async getAccountHealth(): Promise<{
    connected: number;
    disconnected: number;
    errors: number;
    totalSpend: number;
    issues: Array<{
      platform: string;
      issue: string;
      severity: 'error' | 'warning' | 'info';
    }>;
  }> {
    try {
      const integrations = await this.getIntegrations();
      
      const health = {
        connected: integrations.filter(i => i.status === 'connected').length,
        disconnected: integrations.filter(i => i.status === 'disconnected').length,
        errors: integrations.filter(i => i.status === 'error').length,
        totalSpend: integrations
          .filter(i => i.metrics)
          .reduce((sum, i) => sum + i.metrics!.totalSpend, 0),
        issues: [] as Array<{
          platform: string;
          issue: string;
          severity: 'error' | 'warning' | 'info';
        }>
      };

      // Generate health issues
      integrations.forEach(integration => {
        if (integration.status === 'error') {
          health.issues.push({
            platform: integration.platform,
            issue: `Connection error - please reconnect`,
            severity: 'error'
          });
        }
        
        if (integration.lastSync) {
          const daysSinceSync = (Date.now() - new Date(integration.lastSync).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceSync > 2) {
            health.issues.push({
              platform: integration.platform,
              issue: `Data not synced for ${Math.floor(daysSinceSync)} days`,
              severity: 'warning'
            });
          }
        }

        if (integration.metrics) {
          if (integration.metrics.avgCTR < 0.5) {
            health.issues.push({
              platform: integration.platform,
              issue: `Low CTR (${integration.metrics.avgCTR.toFixed(2)}%) - consider optimizing creatives`,
              severity: 'info'
            });
          }
          
          if (integration.metrics.avgCPC > 1.0) {
            health.issues.push({
              platform: integration.platform,
              issue: `High CPC ($${integration.metrics.avgCPC.toFixed(2)}) - review targeting`,
              severity: 'warning'
            });
          }
        }
      });

      return health;
    } catch (error) {
      console.error('Error fetching account health:', error);
      throw error;
    }
  }

  async testConnection(platform: string): Promise<{
    status: 'success' | 'error';
    message: string;
    details?: any;
  }> {
    try {
      // Mock connection test
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const random = Math.random();
      if (random > 0.8) {
        return {
          status: 'error',
          message: 'Connection test failed - invalid credentials'
        };
      }
      
      return {
        status: 'success',
        message: 'Connection test successful',
        details: {
          apiVersion: '18.0',
          permissions: ['ads_read', 'ads_management'],
          accountId: 'act_123456789'
        }
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        status: 'error',
        message: 'Connection test failed'
      };
    }
  }

  getPlatformLimits(platform: string) {
    const limits = {
      meta: {
        dailyBudgetLimit: 1000,
        monthlyBudgetLimit: 25000,
        campaignLimit: 50,
        adSetLimit: 200,
        creativesPerAdSet: 6,
        audienceSize: { min: 1000, max: 200000000 }
      },
      google: {
        dailyBudgetLimit: 800,
        monthlyBudgetLimit: 20000,
        campaignLimit: 30,
        adSetLimit: 150,
        creativesPerAdSet: 3,
        keywordsPerAdGroup: 20
      },
      linkedin: {
        dailyBudgetLimit: 500,
        monthlyBudgetLimit: 15000,
        campaignLimit: 20,
        adSetLimit: 100,
        creativesPerCampaign: 15,
        targetingCriteria: 20
      },
      shopify: {
        dailyBudgetLimit: 0,
        monthlyBudgetLimit: 0,
        productLimit: 10000,
        orderSyncLimit: 1000,
        webhookLimit: 20
      },
      tiktok: {
        dailyBudgetLimit: 300,
        monthlyBudgetLimit: 8000,
        campaignLimit: 25,
        adSetLimit: 75,
        creativesPerAdGroup: 20,
        audienceSize: { min: 1000, max: 50000000 }
      }
    };
    
    return limits[platform as keyof typeof limits] || limits.meta;
  }

  getRequiredPermissions(platform: string): {
    required: string[];
    optional: string[];
    description: Record<string, string>;
  } {
    const permissions = {
      meta: {
        required: ['ads_read', 'ads_management'],
        optional: ['pages_read_engagement', 'instagram_basic'],
        description: {
          'ads_read': 'Read access to ad account data and metrics',
          'ads_management': 'Create, edit, and manage ad campaigns',
          'pages_read_engagement': 'Access Facebook page insights',
          'instagram_basic': 'Access Instagram account information'
        }
      },
      google: {
        required: ['https://www.googleapis.com/auth/adwords'],
        optional: ['https://www.googleapis.com/auth/analytics.readonly'],
        description: {
          'https://www.googleapis.com/auth/adwords': 'Full access to Google Ads account',
          'https://www.googleapis.com/auth/analytics.readonly': 'Read-only access to Google Analytics'
        }
      },
      linkedin: {
        required: ['rw_ads', 'r_ads_reporting'],
        optional: ['r_organization_social'],
        description: {
          'rw_ads': 'Create and manage LinkedIn ad campaigns',
          'r_ads_reporting': 'Access to advertising reporting data',
          'r_organization_social': 'Access organization social data'
        }
      },
      shopify: {
        required: ['read_products', 'read_orders'],
        optional: ['read_customers', 'read_inventory', 'read_analytics'],
        description: {
          'read_products': 'Access product catalog data',
          'read_orders': 'Read order and sales data',
          'read_customers': 'Access customer information',
          'read_inventory': 'Read inventory levels',
          'read_analytics': 'Access store analytics'
        }
      },
      tiktok: {
        required: ['campaign_management', 'reporting'],
        optional: ['audience_management'],
        description: {
          'campaign_management': 'Create and manage TikTok ad campaigns',
          'reporting': 'Access advertising performance reports',
          'audience_management': 'Manage custom audiences'
        }
      }
    };
    
    return permissions[platform as keyof typeof permissions] || permissions.meta;
  }
}