import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Asset } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Asset[]> | ApiResponse<Asset>>
) {
  const { method, query } = req;
  const { id } = query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid brand ID',
      data: []
    });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGetAssets(id, res);
      case 'POST':
        return handleUploadAsset(id, req, res);
      case 'DELETE':
        return handleDeleteAsset(id, req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
          data: []
        });
    }
  } catch (error) {
    console.error('Brand assets API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: []
    });
  }
}

async function handleGetAssets(
  brandId: string,
  res: NextApiResponse<ApiResponse<Asset[]>>
) {
  // In production, this would query assets for the brand
  const mockAssets: Asset[] = [
    {
      id: 'asset_1',
      url: '/api/placeholder/300/120',
      type: 'logo',
      metadata: {
        filename: 'logo-primary.svg',
        size: 15000,
        dimensions: { width: 300, height: 120 },
        mimeType: 'image/svg+xml'
      },
      rights: {
        owner: 'Brand Owner',
        license: 'Proprietary',
        usageRestrictions: []
      }
    },
    {
      id: 'asset_2',
      url: '/api/placeholder/300/300',
      type: 'image',
      metadata: {
        filename: 'brand-image.jpg',
        size: 85000,
        dimensions: { width: 300, height: 300 },
        mimeType: 'image/jpeg'
      },
      rights: {
        owner: 'Brand Owner',
        license: 'Proprietary',
        expiryDate: new Date('2025-12-31'),
        usageRestrictions: ['Social media only']
      }
    }
  ];

  return res.status(200).json({
    success: true,
    data: mockAssets,
    message: 'Assets retrieved successfully'
  });
}

async function handleUploadAsset(
  brandId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Asset>>
) {
  // In production, this would:
  // 1. Handle multipart file upload
  // 2. Validate file type and size
  // 3. Upload to storage service (S3, etc.)
  // 4. Extract metadata
  // 5. Save asset record to database
  // 6. Return asset info

  const { type, filename, rights } = req.body;

  if (!type || !filename) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: type and filename',
      data: {} as Asset
    });
  }

  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newAsset: Asset = {
    id: `asset_${Date.now()}`,
    url: `/uploads/${brandId}/${filename}`,
    type: type as Asset['type'],
    metadata: {
      filename,
      size: Math.floor(Math.random() * 100000) + 10000,
      dimensions: { width: 300, height: 200 },
      mimeType: getMimeType(filename)
    },
    rights: rights || {
      owner: 'Brand Owner',
      license: 'Proprietary',
      usageRestrictions: []
    }
  };

  return res.status(201).json({
    success: true,
    data: newAsset,
    message: 'Asset uploaded successfully'
  });
}

async function handleDeleteAsset(
  brandId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Asset>>
) {
  const { assetId } = req.body;

  if (!assetId) {
    return res.status(400).json({
      success: false,
      message: 'Asset ID is required',
      data: {} as Asset
    });
  }

  // In production, this would:
  // 1. Delete file from storage
  // 2. Remove asset record from database
  // 3. Update brand kit

  console.log(`Deleting asset ${assetId} from brand ${brandId}`);

  return res.status(200).json({
    success: true,
    data: {} as Asset,
    message: 'Asset deleted successfully'
  });
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'pdf': 'application/pdf',
    'ttf': 'font/ttf',
    'woff': 'font/woff',
    'woff2': 'font/woff2'
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}