import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

interface ConnectRequest {
  platform: 'meta' | 'google' | 'linkedin';
  workspaceId: string;
  scopes: string[];
}

interface ConnectResponse {
  authUrl: string;
  state: string;
  expiresIn: number;
}

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
    const { platform, workspaceId, scopes }: ConnectRequest = req.body;

    if (!platform || !workspaceId || !scopes) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        data: {} as ConnectResponse
      });
    }

    // Generate OAuth URL based on platform
    const state = generateState(workspaceId, platform);
    const authUrl = generateAuthUrl(platform, scopes, state);

    const response: ConnectResponse = {
      authUrl,
      state,
      expiresIn: 3600 // 1 hour
    };

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Auth connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {} as ConnectResponse
    });
  }
}

function generateState(workspaceId: string, platform: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return Buffer.from(`${workspaceId}:${platform}:${timestamp}:${randomString}`).toString('base64');
}

function generateAuthUrl(platform: string, scopes: string[], state: string): string {
  const scopeString = scopes.join(',');
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;

  switch (platform) {
    case 'meta':
      return `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${process.env.META_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopeString)}&` +
        `response_type=code&` +
        `state=${encodeURIComponent(state)}`;

    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopeString)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=${encodeURIComponent(state)}`;

    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?` +
        `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopeString)}&` +
        `response_type=code&` +
        `state=${encodeURIComponent(state)}`;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}