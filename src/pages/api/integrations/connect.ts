import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
}

interface ConnectResponse {
  authUrl: string;
  state: string;
  platform: string;
  expiresAt: Date;
}

const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  meta: {
    clientId: process.env.META_APP_ID || 'demo_meta_app_id',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/callback/meta`,
    scopes: ['ads_read', 'ads_management', 'pages_read_engagement'],
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
  },
  google: {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || 'demo_google_client_id',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/callback/google`,
    scopes: ['https://www.googleapis.com/auth/adwords'],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'demo_linkedin_client_id',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/callback/linkedin`,
    scopes: ['rw_ads', 'r_ads_reporting'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
  },
  shopify: {
    clientId: process.env.SHOPIFY_API_KEY || 'demo_shopify_api_key',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/callback/shopify`,
    scopes: ['read_products', 'read_orders', 'read_customers', 'read_inventory'],
    authUrl: 'https://[SHOP_DOMAIN].myshopify.com/admin/oauth/authorize'
  },
  tiktok: {
    clientId: process.env.TIKTOK_APP_ID || 'demo_tiktok_app_id',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/callback/tiktok`,
    scopes: ['campaign_management', 'reporting'],
    authUrl: 'https://ads.tiktok.com/marketing_api/auth'
  }
};

// In-memory store for OAuth states (use Redis/DB in production)
const oauthStates = new Map<string, { platform: string; createdAt: Date; userId?: string }>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ConnectResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: {} as ConnectResponse
    });
  }

  try {
    const { platform, shopDomain } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required',
        data: {} as ConnectResponse
      });
    }

    const config = OAUTH_CONFIGS[platform];
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform',
        data: {} as ConnectResponse
      });
    }

    // Generate secure state parameter
    const state = generateSecureState();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OAuth state
    oauthStates.set(state, {
      platform,
      createdAt: new Date(),
      userId: req.headers['user-id'] as string // In production, get from session/JWT
    });

    // Build authorization URL
    let authUrl = config.authUrl;
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
      response_type: 'code'
    });

    // Platform-specific parameters
    if (platform === 'meta') {
      params.append('config_id', '1'); // Meta specific
    } else if (platform === 'google') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    } else if (platform === 'shopify') {
      if (!shopDomain) {
        return res.status(400).json({
          success: false,
          message: 'Shop domain is required for Shopify integration',
          data: {} as ConnectResponse
        });
      }
      authUrl = authUrl.replace('[SHOP_DOMAIN]', shopDomain);
    }

    authUrl += `?${params.toString()}`;

    // Clean up expired states (basic cleanup)
    cleanupExpiredStates();

    const response: ConnectResponse = {
      authUrl,
      state,
      platform,
      expiresAt
    };

    return res.status(200).json({
      success: true,
      data: response,
      message: `OAuth URL generated for ${platform}`
    });

  } catch (error) {
    console.error('OAuth connect error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate OAuth URL',
      data: {} as ConnectResponse
    });
  }
}

function generateSecureState(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  return `${timestamp}_${randomBytes}`;
}

function cleanupExpiredStates(): void {
  const now = new Date();
  const expiredStates: string[] = [];

  oauthStates.forEach((value, key) => {
    if (now.getTime() - value.createdAt.getTime() > 10 * 60 * 1000) { // 10 minutes
      expiredStates.push(key);
    }
  });

  expiredStates.forEach(state => oauthStates.delete(state));
}

// Export for use in callback handlers
export { oauthStates, OAUTH_CONFIGS };