import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, PaginatedResponse, Brand } from '@/types';

const mockBrands: Brand[] = [
  {
    id: '1',
    workspaceId: 'ws_1',
    name: 'TechStart Inc.',
    kit: {
      logos: [
        {
          id: 'logo_1',
          url: '/api/placeholder/300/120',
          type: 'logo',
          metadata: {
            filename: 'techstart-primary.svg',
            size: 15000,
            dimensions: { width: 300, height: 120 },
            mimeType: 'image/svg+xml'
          },
          rights: {
            owner: 'TechStart Inc.',
            license: 'Proprietary',
            usageRestrictions: []
          }
        }
      ],
      fonts: [
        {
          family: 'Inter',
          weights: [400, 500, 600, 700],
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        },
        {
          family: 'JetBrains Mono',
          weights: [400, 500, 600],
          url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'
        }
      ],
      colors: [
        { name: 'Primary Blue', hex: '#3B82F6', rgb: { r: 59, g: 130, b: 246 } },
        { name: 'Dark Blue', hex: '#1E40AF', rgb: { r: 30, g: 64, b: 175 } },
        { name: 'Accent Orange', hex: '#F59E0B', rgb: { r: 245, g: 158, b: 11 } },
        { name: 'Success Green', hex: '#10B981', rgb: { r: 16, g: 185, b: 129 } },
        { name: 'Error Red', hex: '#EF4444', rgb: { r: 239, g: 68, b: 68 } }
      ],
      guidelines: 'Modern, clean, tech-focused brand identity. Use primary blue for main actions, dark blue for headers, and orange sparingly for highlights. Maintain plenty of whitespace and use Inter for all text.'
    },
    tone: 'Professional yet approachable. Emphasize innovation, reliability, and cutting-edge technology. Use active voice and avoid jargon.',
    compliancePack: {
      vertical: 'Technology',
      region: 'US',
      prohibitedClaims: [
        'guaranteed results',
        'best in the world',
        'revolutionary breakthrough'
      ],
      requiredDisclosures: [
        'Results may vary',
        'Professional services disclaimer'
      ],
      policyRules: [
        {
          platform: 'meta',
          rule: 'no_exaggerated_claims',
          severity: 'error'
        },
        {
          platform: 'google',
          rule: 'substantiation_required',
          severity: 'warning'
        }
      ]
    },
    rights: {
      defaultLicense: 'Proprietary',
      autoExpiry: false,
      alertDaysBefore: 30
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    workspaceId: 'ws_1',
    name: 'EcoLife Products',
    kit: {
      logos: [
        {
          id: 'logo_2',
          url: '/api/placeholder/280/100',
          type: 'logo',
          metadata: {
            filename: 'ecolife-logo.png',
            size: 25000,
            dimensions: { width: 280, height: 100 },
            mimeType: 'image/png'
          },
          rights: {
            owner: 'EcoLife Products LLC',
            license: 'Proprietary',
            usageRestrictions: []
          }
        }
      ],
      fonts: [
        {
          family: 'Poppins',
          weights: [400, 500, 600, 700],
          url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
        },
        {
          family: 'Open Sans',
          weights: [400, 500, 600],
          url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap'
        }
      ],
      colors: [
        { name: 'Forest Green', hex: '#10B981', rgb: { r: 16, g: 185, b: 129 } },
        { name: 'Deep Green', hex: '#059669', rgb: { r: 5, g: 150, b: 105 } },
        { name: 'Earth Brown', hex: '#92400E', rgb: { r: 146, g: 64, b: 14 } },
        { name: 'Sky Blue', hex: '#0EA5E9', rgb: { r: 14, g: 165, b: 233 } },
        { name: 'Warm Orange', hex: '#F59E0B', rgb: { r: 245, g: 158, b: 11 } }
      ],
      guidelines: 'Natural, sustainable, earth-friendly messaging. Use organic shapes and nature-inspired imagery. Emphasize sustainability, environmental responsibility, and natural ingredients.'
    },
    tone: 'Warm, authentic, and environmentally conscious. Focus on sustainability benefits, natural ingredients, and positive environmental impact. Use inclusive language.',
    compliancePack: {
      vertical: 'Consumer Goods',
      region: 'US',
      prohibitedClaims: [
        '100% natural',
        'completely organic',
        'miracle cure'
      ],
      requiredDisclosures: [
        'Individual results may vary',
        'FDA disclaimer for supplements'
      ],
      policyRules: [
        {
          platform: 'meta',
          rule: 'health_claims_restricted',
          severity: 'error'
        },
        {
          platform: 'google',
          rule: 'environmental_claims_substantiation',
          severity: 'warning'
        }
      ]
    },
    rights: {
      defaultLicense: 'Proprietary',
      autoExpiry: true,
      alertDaysBefore: 14
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Brand[]> | ApiResponse<Brand> | PaginatedResponse<Brand>>
) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
          data: []
        });
    }
  } catch (error) {
    console.error('Brands API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: []
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Brand[]> | PaginatedResponse<Brand>>
) {
  const { page = '1', pageSize = '10', workspaceId } = req.query;

  let filteredBrands = mockBrands;
  
  if (workspaceId) {
    filteredBrands = mockBrands.filter(brand => brand.workspaceId === workspaceId);
  }

  const pageNum = parseInt(page as string);
  const size = parseInt(pageSize as string);
  const startIndex = (pageNum - 1) * size;
  const endIndex = startIndex + size;

  const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

  const response: PaginatedResponse<Brand> = {
    data: paginatedBrands,
    pagination: {
      page: pageNum,
      pageSize: size,
      total: filteredBrands.length,
      totalPages: Math.ceil(filteredBrands.length / size)
    }
  };

  return res.status(200).json(response);
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Brand>>
) {
  const brandData = req.body;

  if (!brandData.name || !brandData.workspaceId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name and workspaceId',
      data: {} as Brand
    });
  }

  const newBrand: Brand = {
    id: `brand_${Date.now()}`,
    workspaceId: brandData.workspaceId,
    name: brandData.name,
    kit: {
      logos: [],
      fonts: brandData.kit?.fonts || [
        {
          family: 'Inter',
          weights: [400, 500, 600, 700],
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        }
      ],
      colors: brandData.kit?.colors || [
        { name: 'Primary', hex: '#3B82F6', rgb: { r: 59, g: 130, b: 246 } },
        { name: 'Secondary', hex: '#1E40AF', rgb: { r: 30, g: 64, b: 175 } },
        { name: 'Accent', hex: '#F59E0B', rgb: { r: 245, g: 158, b: 11 } }
      ],
      guidelines: brandData.kit?.guidelines || ''
    },
    tone: brandData.tone || 'Professional and approachable',
    compliancePack: brandData.compliancePack || {
      vertical: 'General',
      region: 'US',
      prohibitedClaims: [],
      requiredDisclosures: [],
      policyRules: []
    },
    rights: brandData.rights || {
      defaultLicense: 'Proprietary',
      autoExpiry: false,
      alertDaysBefore: 30
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  mockBrands.push(newBrand);

  return res.status(201).json({
    success: true,
    message: 'Brand created successfully',
    data: newBrand
  });
}