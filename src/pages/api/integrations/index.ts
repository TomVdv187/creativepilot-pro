import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

export interface PlatformIntegration {
  id: string;
  platform: 'meta' | 'google' | 'linkedin' | 'shopify' | 'tiktok';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  accountId?: string;
  accountName?: string;
  permissions: string[];
  connectedAt?: Date;
  lastSync?: Date;
  settings: {
    autoPublish: boolean;
    defaultBudget?: number;
    defaultAudience?: string;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
  };
  metrics?: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgCPC: number;
    avgCPM: number;
  };
  limits: {
    dailyBudgetLimit: number;
    monthlyBudgetLimit: number;
    campaignLimit: number;
    adSetLimit: number;
  };
}

// Mock integrations data
const INTEGRATIONS: PlatformIntegration[] = [
  {
    id: 'meta_1',
    platform: 'meta',
    name: 'Meta Business',
    status: 'connected',
    accountId: 'act_123456789',
    accountName: 'CreativePilot Pro Demo',
    permissions: ['ads_read', 'ads_management', 'pages_read_engagement'],
    connectedAt: new Date('2024-01-15T10:30:00Z'),
    lastSync: new Date('2024-01-25T14:22:00Z'),
    settings: {
      autoPublish: true,
      defaultBudget: 100,
      defaultAudience: 'lookalike_1',
      syncFrequency: 'hourly'
    },
    metrics: {
      totalSpend: 12450.30,
      totalImpressions: 2890450,
      totalClicks: 34520,
      totalConversions: 890,
      avgCTR: 1.19,
      avgCPC: 0.36,
      avgCPM: 4.31
    },
    limits: {
      dailyBudgetLimit: 1000,
      monthlyBudgetLimit: 25000,
      campaignLimit: 50,
      adSetLimit: 200
    }
  },
  {
    id: 'google_1',
    platform: 'google',
    name: 'Google Ads',
    status: 'connected',
    accountId: '123-456-7890',
    accountName: 'CreativePilot Pro',
    permissions: ['https://www.googleapis.com/auth/adwords'],
    connectedAt: new Date('2024-01-12T08:15:00Z'),
    lastSync: new Date('2024-01-25T13:45:00Z'),
    settings: {
      autoPublish: false,
      defaultBudget: 150,
      syncFrequency: 'daily'
    },
    metrics: {
      totalSpend: 8920.75,
      totalImpressions: 1450320,
      totalClicks: 28940,
      totalConversions: 650,
      avgCTR: 2.00,
      avgCPC: 0.31,
      avgCPM: 6.15
    },
    limits: {
      dailyBudgetLimit: 800,
      monthlyBudgetLimit: 20000,
      campaignLimit: 30,
      adSetLimit: 150
    }
  },
  {
    id: 'linkedin_1',
    platform: 'linkedin',
    name: 'LinkedIn Campaign Manager',
    status: 'disconnected',
    permissions: ['rw_ads', 'r_ads_reporting'],
    settings: {
      autoPublish: false,
      defaultBudget: 200,
      syncFrequency: 'daily'
    },
    limits: {
      dailyBudgetLimit: 500,
      monthlyBudgetLimit: 15000,
      campaignLimit: 20,
      adSetLimit: 100
    }
  },
  {
    id: 'shopify_1',
    platform: 'shopify',
    name: 'Shopify Store',
    status: 'connected',
    accountId: 'shop_demo_123',
    accountName: 'CreativePilot Demo Store',
    permissions: ['read_products', 'read_orders', 'read_customers'],
    connectedAt: new Date('2024-01-10T16:20:00Z'),
    lastSync: new Date('2024-01-25T09:30:00Z'),
    settings: {
      autoPublish: false,
      syncFrequency: 'hourly'
    },
    metrics: {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 145,
      avgCTR: 0,
      avgCPC: 0,
      avgCPM: 0
    },
    limits: {
      dailyBudgetLimit: 0,
      monthlyBudgetLimit: 0,
      campaignLimit: 0,
      adSetLimit: 0
    }
  },
  {
    id: 'tiktok_1',
    platform: 'tiktok',
    name: 'TikTok Ads Manager',
    status: 'error',
    permissions: ['campaign_management', 'reporting'],
    settings: {
      autoPublish: false,
      defaultBudget: 75,
      syncFrequency: 'daily'
    },
    limits: {
      dailyBudgetLimit: 300,
      monthlyBudgetLimit: 8000,
      campaignLimit: 25,
      adSetLimit: 75
    }
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PlatformIntegration[]> | ApiResponse<PlatformIntegration>>
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
          data: []
        });
    }
  } catch (error) {
    console.error('Integrations API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: []
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PlatformIntegration[]>>
) {
  const { platform, status } = req.query;

  let filteredIntegrations = [...INTEGRATIONS];

  if (platform && typeof platform === 'string') {
    filteredIntegrations = filteredIntegrations.filter(
      integration => integration.platform === platform
    );
  }

  if (status && typeof status === 'string') {
    filteredIntegrations = filteredIntegrations.filter(
      integration => integration.status === status
    );
  }

  // Sort by connection status and name
  filteredIntegrations.sort((a, b) => {
    const statusOrder = { connected: 0, pending: 1, error: 2, disconnected: 3 };
    const statusCompare = statusOrder[a.status] - statusOrder[b.status];
    if (statusCompare !== 0) return statusCompare;
    return a.name.localeCompare(b.name);
  });

  return res.status(200).json({
    success: true,
    data: filteredIntegrations,
    message: `Retrieved ${filteredIntegrations.length} integrations`
  });
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PlatformIntegration>>
) {
  const { platform, accountId, permissions, settings } = req.body;

  if (!platform || !permissions) {
    return res.status(400).json({
      success: false,
      message: 'Platform and permissions are required',
      data: {} as PlatformIntegration
    });
  }

  // Mock connecting to platform
  const newIntegration: PlatformIntegration = {
    id: `${platform}_${Date.now()}`,
    platform,
    name: getPlatformName(platform),
    status: 'pending',
    accountId,
    permissions,
    connectedAt: new Date(),
    settings: {
      autoPublish: false,
      syncFrequency: 'daily',
      ...settings
    },
    limits: getDefaultLimits(platform)
  };

  // Simulate OAuth flow delay
  setTimeout(() => {
    const integration = INTEGRATIONS.find(i => i.id === newIntegration.id);
    if (integration) {
      integration.status = 'connected';
      integration.accountName = `Demo ${platform} Account`;
    }
  }, 2000);

  INTEGRATIONS.push(newIntegration);

  return res.status(201).json({
    success: true,
    data: newIntegration,
    message: `${getPlatformName(platform)} integration initiated`
  });
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PlatformIntegration>>
) {
  const { id, settings, status } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Integration ID is required',
      data: {} as PlatformIntegration
    });
  }

  const integrationIndex = INTEGRATIONS.findIndex(i => i.id === id);
  if (integrationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Integration not found',
      data: {} as PlatformIntegration
    });
  }

  const integration = INTEGRATIONS[integrationIndex];
  
  if (settings) {
    integration.settings = { ...integration.settings, ...settings };
  }
  
  if (status) {
    integration.status = status;
  }

  integration.lastSync = new Date();

  return res.status(200).json({
    success: true,
    data: integration,
    message: `Integration updated successfully`
  });
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PlatformIntegration>>
) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Integration ID is required',
      data: {} as PlatformIntegration
    });
  }

  const integrationIndex = INTEGRATIONS.findIndex(i => i.id === id);
  if (integrationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Integration not found',
      data: {} as PlatformIntegration
    });
  }

  const integration = INTEGRATIONS[integrationIndex];
  integration.status = 'disconnected';
  integration.accountId = undefined;
  integration.accountName = undefined;
  integration.connectedAt = undefined;
  integration.lastSync = undefined;

  return res.status(200).json({
    success: true,
    data: integration,
    message: `Integration disconnected successfully`
  });
}

function getPlatformName(platform: string): string {
  const names = {
    meta: 'Meta Business',
    google: 'Google Ads',
    linkedin: 'LinkedIn Campaign Manager',
    shopify: 'Shopify Store',
    tiktok: 'TikTok Ads Manager'
  };
  return names[platform as keyof typeof names] || platform;
}

function getDefaultLimits(platform: string) {
  const limits = {
    meta: { dailyBudgetLimit: 1000, monthlyBudgetLimit: 25000, campaignLimit: 50, adSetLimit: 200 },
    google: { dailyBudgetLimit: 800, monthlyBudgetLimit: 20000, campaignLimit: 30, adSetLimit: 150 },
    linkedin: { dailyBudgetLimit: 500, monthlyBudgetLimit: 15000, campaignLimit: 20, adSetLimit: 100 },
    shopify: { dailyBudgetLimit: 0, monthlyBudgetLimit: 0, campaignLimit: 0, adSetLimit: 0 },
    tiktok: { dailyBudgetLimit: 300, monthlyBudgetLimit: 8000, campaignLimit: 25, adSetLimit: 75 }
  };
  return limits[platform as keyof typeof limits] || limits.meta;
}