import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, PaginatedResponse, Experiment } from '@/types';

const mockExperiments: Experiment[] = [
  {
    id: 'exp_1',
    projectId: 'proj_1',
    design: {
      type: 'creative_ab',
      minSampleSize: 1000,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 7 // days
    },
    variants: [
      {
        id: 'creative_1',
        projectId: 'proj_1',
        format: 'static',
        angleTags: ['social_proof', 'urgency'],
        assets: [],
        score: {
          score: 75,
          uncertainty: 10,
          winProbability: 0.65,
          reasons: ['Strong social proof elements', 'Clear value proposition'],
          improvementTips: ['Test different color schemes'],
          confidence: 'high'
        },
        status: 'approved',
        provenance: {
          contentCredentials: 'c2pa_cert_123',
          provenance: [],
          tamperEvidence: false
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ],
    budgets: [
      {
        platform: 'meta',
        amount: 1000,
        currency: 'USD',
        dailyCap: 100
      }
    ],
    guardrails: [
      {
        metric: 'cpa',
        operator: 'less_than',
        value: 20,
        action: 'pause'
      },
      {
        metric: 'ctr',
        operator: 'greater_than',
        value: 2.5,
        action: 'promote'
      }
    ],
    outcomes: [
      {
        variant: 'creative_1',
        metrics: {
          impressions: 15420,
          clicks: 617,
          conversions: 31,
          ctr: 4.0,
          cpa: 13.60,
          spend: 421.60
        },
        significance: 0.03,
        lift: 15,
        decision: 'winner'
      }
    ],
    status: 'running',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'exp_2',
    projectId: 'proj_2',
    design: {
      type: 'angle_test',
      minSampleSize: 800,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 5
    },
    variants: [
      {
        id: 'creative_2a',
        projectId: 'proj_2',
        format: 'video',
        angleTags: ['benefit_focused'],
        assets: [],
        score: {
          score: 68,
          uncertainty: 15,
          winProbability: 0.58,
          reasons: ['Clear benefit messaging'],
          improvementTips: ['Add social proof elements'],
          confidence: 'medium'
        },
        status: 'approved',
        provenance: {
          contentCredentials: 'c2pa_cert_124',
          provenance: [],
          tamperEvidence: false
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'creative_2b',
        projectId: 'proj_2',
        format: 'video',
        angleTags: ['social_proof'],
        assets: [],
        score: {
          score: 82,
          uncertainty: 8,
          winProbability: 0.72,
          reasons: ['Strong social proof', 'Compelling testimonial'],
          improvementTips: ['Optimize video length'],
          confidence: 'high'
        },
        status: 'approved',
        provenance: {
          contentCredentials: 'c2pa_cert_125',
          provenance: [],
          tamperEvidence: false
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ],
    budgets: [
      {
        platform: 'google',
        amount: 1500,
        currency: 'USD',
        dailyCap: 150
      }
    ],
    guardrails: [
      {
        metric: 'roas',
        operator: 'greater_than',
        value: 3.0,
        action: 'promote'
      }
    ],
    outcomes: [
      {
        variant: 'creative_2a',
        metrics: {
          impressions: 12500,
          clicks: 350,
          conversions: 18,
          ctr: 2.8,
          cpa: 41.70,
          spend: 750.60,
          roas: 2.1
        },
        significance: 0.12,
        lift: -18,
        decision: 'loser'
      },
      {
        variant: 'creative_2b',
        metrics: {
          impressions: 12800,
          clicks: 512,
          conversions: 26,
          ctr: 4.0,
          cpa: 28.80,
          spend: 748.80,
          roas: 3.4
        },
        significance: 0.02,
        lift: 28,
        decision: 'winner'
      }
    ],
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-22')
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Experiment[]> | ApiResponse<Experiment> | PaginatedResponse<Experiment>>
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
    console.error('Experiments API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: []
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Experiment[]> | PaginatedResponse<Experiment>>
) {
  const { page = '1', pageSize = '10', projectId, status } = req.query;

  let filteredExperiments = mockExperiments;
  
  if (projectId) {
    filteredExperiments = mockExperiments.filter(exp => exp.projectId === projectId);
  }
  
  if (status) {
    filteredExperiments = filteredExperiments.filter(exp => exp.status === status);
  }

  const pageNum = parseInt(page as string);
  const size = parseInt(pageSize as string);
  const startIndex = (pageNum - 1) * size;
  const endIndex = startIndex + size;

  const paginatedExperiments = filteredExperiments.slice(startIndex, endIndex);

  const response: PaginatedResponse<Experiment> = {
    data: paginatedExperiments,
    pagination: {
      page: pageNum,
      pageSize: size,
      total: filteredExperiments.length,
      totalPages: Math.ceil(filteredExperiments.length / size)
    }
  };

  return res.status(200).json(response);
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Experiment>>
) {
  const experimentData = req.body;

  if (!experimentData.projectId || !experimentData.design || !experimentData.variants) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: projectId, design, and variants',
      data: {} as Experiment
    });
  }

  // Validate experiment design
  const validationErrors = validateExperimentDesign(experimentData.design);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Validation errors: ${validationErrors.join(', ')}`,
      data: {} as Experiment
    });
  }

  const newExperiment: Experiment = {
    id: `exp_${Date.now()}`,
    projectId: experimentData.projectId,
    design: experimentData.design,
    variants: experimentData.variants,
    budgets: experimentData.budgets || [],
    guardrails: experimentData.guardrails || [],
    outcomes: [],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Simulate saving to database
  mockExperiments.push(newExperiment);

  return res.status(201).json({
    success: true,
    data: newExperiment,
    message: 'Experiment created successfully'
  });
}

function validateExperimentDesign(design: any): string[] {
  const errors: string[] = [];

  if (!design.type || !['creative_ab', 'geo_holdout', 'angle_test'].includes(design.type)) {
    errors.push('Invalid experiment type');
  }

  if (!design.minSampleSize || design.minSampleSize < 100) {
    errors.push('Minimum sample size must be at least 100');
  }

  if (!design.power || design.power < 0.7 || design.power > 0.95) {
    errors.push('Statistical power must be between 0.7 and 0.95');
  }

  if (!design.significanceLevel || design.significanceLevel < 0.01 || design.significanceLevel > 0.1) {
    errors.push('Significance level must be between 0.01 and 0.1');
  }

  if (!design.duration || design.duration < 1 || design.duration > 30) {
    errors.push('Duration must be between 1 and 30 days');
  }

  return errors;
}