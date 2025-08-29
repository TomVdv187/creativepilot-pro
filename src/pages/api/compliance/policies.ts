import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, PolicyRule } from '@/types';

export interface PolicyPack {
  id: string;
  name: string;
  vertical: string;
  region: string;
  description: string;
  lastUpdated: Date;
  rules: PolicyRule[];
  prohibitedClaims: string[];
  requiredDisclosures: string[];
  examples: {
    compliant: string[];
    violations: string[];
  };
}

const POLICY_PACKS: PolicyPack[] = [
  {
    id: 'health_us',
    name: 'Health & Wellness (US)',
    vertical: 'health',
    region: 'US',
    description: 'FDA and FTC compliance for health, wellness, and supplement advertising',
    lastUpdated: new Date('2024-01-15'),
    rules: [
      {
        platform: 'meta',
        rule: 'no_before_after_images',
        severity: 'error'
      },
      {
        platform: 'google',
        rule: 'health_claims_substantiation',
        severity: 'error'
      },
      {
        platform: 'meta',
        rule: 'no_miracle_claims',
        severity: 'error'
      }
    ],
    prohibitedClaims: [
      'guaranteed results',
      'miracle cure',
      '100% effective',
      'FDA approved',
      'doctor recommended',
      'clinically proven',
      'instant results',
      'no side effects',
      'cure cancer',
      'lose 20 pounds in 7 days'
    ],
    requiredDisclosures: [
      'Individual results may vary',
      'This statement has not been evaluated by the FDA',
      'This product is not intended to diagnose, treat, cure, or prevent any disease',
      'Consult your healthcare provider before use'
    ],
    examples: {
      compliant: [
        'May support healthy weight management when combined with diet and exercise',
        'Manufactured in an FDA-registered facility',
        'Developed with input from healthcare professionals'
      ],
      violations: [
        'Guaranteed to cure diabetes',
        'FDA approved weight loss pill',
        'Lose 30 pounds in 10 days - guaranteed!'
      ]
    }
  },
  {
    id: 'finance_us',
    name: 'Financial Services (US)',
    vertical: 'finance',
    region: 'US',
    description: 'SEC and FINRA compliance for financial services and investment advertising',
    lastUpdated: new Date('2024-01-10'),
    rules: [
      {
        platform: 'meta',
        rule: 'no_guaranteed_returns',
        severity: 'error'
      },
      {
        platform: 'google',
        rule: 'investment_risk_disclosure',
        severity: 'error'
      },
      {
        platform: 'linkedin',
        rule: 'no_get_rich_quick',
        severity: 'error'
      }
    ],
    prohibitedClaims: [
      'guaranteed returns',
      'risk-free investment',
      'get rich quick',
      'make money fast',
      'no risk involved',
      'guaranteed profit',
      'beat the market',
      '1000% returns'
    ],
    requiredDisclosures: [
      'Past performance does not guarantee future results',
      'Investment involves risk of loss',
      'Results not typical',
      'Please consider the investment objectives, risks, charges and expenses'
    ],
    examples: {
      compliant: [
        'Potential for competitive returns with managed risk',
        'Historical performance suggests positive trends',
        'Diversified portfolio approach to risk management'
      ],
      violations: [
        'Guaranteed 50% returns in 30 days',
        'Risk-free investment opportunity',
        'Get rich quick with our system'
      ]
    }
  },
  {
    id: 'beauty_us',
    name: 'Beauty & Cosmetics (US)',
    vertical: 'beauty',
    region: 'US',
    description: 'FDA cosmetic regulations and FTC truth-in-advertising compliance',
    lastUpdated: new Date('2024-01-12'),
    rules: [
      {
        platform: 'meta',
        rule: 'no_age_reversal_claims',
        severity: 'error'
      },
      {
        platform: 'google',
        rule: 'substantiated_beauty_claims',
        severity: 'warning'
      },
      {
        platform: 'meta',
        rule: 'no_before_after_transformations',
        severity: 'error'
      }
    ],
    prohibitedClaims: [
      'reverse aging',
      'fountain of youth',
      'look 10 years younger',
      'permanent results',
      'miracle transformation',
      'dermatologist approved',
      'anti-aging miracle'
    ],
    requiredDisclosures: [
      'Results may vary',
      'Individual results not typical',
      'For external use only'
    ],
    examples: {
      compliant: [
        'May help improve skin appearance',
        'Supports healthy-looking skin',
        'Developed with dermatological research'
      ],
      violations: [
        'Turns back the clock 20 years',
        'Miracle anti-aging formula',
        'Permanent wrinkle removal'
      ]
    }
  },
  {
    id: 'employment_us',
    name: 'Employment & Recruiting (US)',
    vertical: 'employment',
    region: 'US',
    description: 'EEOC compliance and fair employment advertising practices',
    lastUpdated: new Date('2024-01-08'),
    rules: [
      {
        platform: 'meta',
        rule: 'no_discriminatory_language',
        severity: 'error'
      },
      {
        platform: 'linkedin',
        rule: 'equal_opportunity_statement',
        severity: 'warning'
      },
      {
        platform: 'google',
        rule: 'accurate_job_descriptions',
        severity: 'error'
      }
    ],
    prohibitedClaims: [
      'young dynamic team',
      'native English speakers only',
      'recent college graduates',
      'energetic individuals',
      'must be under 40',
      'family-oriented workplace'
    ],
    requiredDisclosures: [
      'Equal opportunity employer',
      'We welcome applications from all qualified candidates',
      'Background check may be required'
    ],
    examples: {
      compliant: [
        'Seeking experienced professionals',
        'Diverse and inclusive workplace',
        'Qualifications include relevant experience'
      ],
      violations: [
        'Looking for young, energetic candidates',
        'Must be recent college graduate',
        'Native speakers preferred'
      ]
    }
  },
  {
    id: 'tech_gdpr',
    name: 'Technology (GDPR)',
    vertical: 'technology',
    region: 'EU',
    description: 'GDPR compliance for technology and software advertising in Europe',
    lastUpdated: new Date('2024-01-20'),
    rules: [
      {
        platform: 'meta',
        rule: 'data_processing_disclosure',
        severity: 'error'
      },
      {
        platform: 'google',
        rule: 'consent_mechanism_required',
        severity: 'error'
      },
      {
        platform: 'linkedin',
        rule: 'privacy_rights_information',
        severity: 'warning'
      }
    ],
    prohibitedClaims: [
      'we never share your data',
      'completely anonymous',
      'no tracking whatsoever',
      'your data is 100% safe'
    ],
    requiredDisclosures: [
      'Data processing in accordance with GDPR',
      'Your privacy rights under GDPR',
      'Cookie usage disclosure',
      'Right to data portability and deletion'
    ],
    examples: {
      compliant: [
        'GDPR-compliant data processing',
        'Transparent privacy practices',
        'User control over personal data'
      ],
      violations: [
        'We never track or store your data',
        'Completely anonymous usage',
        'Zero data collection'
      ]
    }
  },
  {
    id: 'real_estate_us',
    name: 'Real Estate (US)',
    vertical: 'real_estate',
    region: 'US',
    description: 'Fair Housing Act compliance and real estate advertising regulations',
    lastUpdated: new Date('2024-01-05'),
    rules: [
      {
        platform: 'meta',
        rule: 'no_discriminatory_housing',
        severity: 'error'
      },
      {
        platform: 'google',
        rule: 'accurate_property_info',
        severity: 'error'
      },
      {
        platform: 'meta',
        rule: 'fair_housing_compliance',
        severity: 'error'
      }
    ],
    prohibitedClaims: [
      'perfect for families',
      'ideal for young professionals',
      'great for seniors',
      'adults only',
      'no children',
      'Christian community'
    ],
    requiredDisclosures: [
      'Equal Housing Opportunity',
      'Fair Housing Act compliance',
      'All qualified applicants welcome'
    ],
    examples: {
      compliant: [
        'Spacious 3-bedroom property',
        'Modern amenities available',
        'Convenient location near transit'
      ],
      violations: [
        'Perfect for young families with children',
        'Ideal for adult professionals',
        'Great retirement community'
      ]
    }
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PolicyPack[]> | ApiResponse<PolicyPack>>
) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
          data: []
        });
    }
  } catch (error) {
    console.error('Policy packs API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: []
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PolicyPack[]> | ApiResponse<PolicyPack>>
) {
  const { vertical, region, id } = req.query;

  // Get specific policy pack by ID
  if (id && typeof id === 'string') {
    const pack = POLICY_PACKS.find(p => p.id === id);
    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'Policy pack not found',
        data: {} as PolicyPack
      });
    }

    return res.status(200).json({
      success: true,
      data: pack,
      message: 'Policy pack retrieved successfully'
    });
  }

  // Filter policy packs
  let filteredPacks = POLICY_PACKS;

  if (vertical && typeof vertical === 'string') {
    filteredPacks = filteredPacks.filter(pack => pack.vertical === vertical);
  }

  if (region && typeof region === 'string') {
    filteredPacks = filteredPacks.filter(pack => pack.region === region);
  }

  return res.status(200).json({
    success: true,
    data: filteredPacks,
    message: `Retrieved ${filteredPacks.length} policy packs`
  });
}