import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'creative_ab' | 'geo_holdout' | 'angle_test';
  category: 'creative' | 'audience' | 'placement' | 'budget';
  config: {
    minSampleSize: number;
    power: number;
    significanceLevel: number;
    duration: number;
    recommendedVariants: number;
    trafficSplit?: number[];
  };
  guardrails: Array<{
    metric: string;
    operator: 'greater_than' | 'less_than' | 'between';
    value: number | [number, number];
    action: 'pause' | 'alert' | 'promote';
  }>;
  useCases: string[];
  tags: string[];
}

const experimentTemplates: ExperimentTemplate[] = [
  {
    id: 'headline_ab',
    name: 'Headline A/B Test',
    description: 'Test different headlines to optimize click-through rates',
    type: 'creative_ab',
    category: 'creative',
    config: {
      minSampleSize: 1000,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 7,
      recommendedVariants: 2,
      trafficSplit: [50, 50]
    },
    guardrails: [
      {
        metric: 'ctr',
        operator: 'greater_than',
        value: 2.0,
        action: 'promote'
      },
      {
        metric: 'cpa',
        operator: 'less_than',
        value: 25,
        action: 'pause'
      }
    ],
    useCases: [
      'Testing different value propositions',
      'Comparing emotional vs rational appeals',
      'A/B testing headline length'
    ],
    tags: ['headline', 'copy', 'ctr_optimization']
  },
  {
    id: 'creative_format',
    name: 'Creative Format Test',
    description: 'Compare performance between different creative formats (image vs video)',
    type: 'creative_ab',
    category: 'creative',
    config: {
      minSampleSize: 1500,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 10,
      recommendedVariants: 2,
      trafficSplit: [50, 50]
    },
    guardrails: [
      {
        metric: 'engagement_rate',
        operator: 'greater_than',
        value: 5.0,
        action: 'promote'
      },
      {
        metric: 'cpm',
        operator: 'less_than',
        value: 15,
        action: 'alert'
      }
    ],
    useCases: [
      'Static image vs video performance',
      'Carousel vs single image',
      'Short-form vs long-form video'
    ],
    tags: ['format', 'video', 'image', 'engagement']
  },
  {
    id: 'angle_multivariate',
    name: 'Angle Testing (3-way)',
    description: 'Test multiple creative angles to find the winning message',
    type: 'angle_test',
    category: 'creative',
    config: {
      minSampleSize: 2400,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 14,
      recommendedVariants: 3,
      trafficSplit: [33.3, 33.3, 33.4]
    },
    guardrails: [
      {
        metric: 'conversion_rate',
        operator: 'greater_than',
        value: 2.5,
        action: 'promote'
      },
      {
        metric: 'spend',
        operator: 'less_than',
        value: 1000,
        action: 'pause'
      }
    ],
    useCases: [
      'Social proof vs benefit vs urgency angles',
      'Problem-focused vs solution-focused messaging',
      'Testimonial vs feature vs outcome angles'
    ],
    tags: ['angles', 'messaging', 'multivariate', 'psychology']
  },
  {
    id: 'audience_lookalike',
    name: 'Lookalike Audience Test',
    description: 'Compare broad audience vs lookalike audience performance',
    type: 'creative_ab',
    category: 'audience',
    config: {
      minSampleSize: 2000,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 12,
      recommendedVariants: 2,
      trafficSplit: [50, 50]
    },
    guardrails: [
      {
        metric: 'cpa',
        operator: 'between',
        value: [10, 30],
        action: 'alert'
      },
      {
        metric: 'frequency',
        operator: 'less_than',
        value: 3.0,
        action: 'pause'
      }
    ],
    useCases: [
      'Broad vs 1% lookalike targeting',
      'Cold vs warm audience testing',
      'Interest-based vs lookalike comparison'
    ],
    tags: ['audience', 'targeting', 'lookalike', 'scaling']
  },
  {
    id: 'geo_holdout',
    name: 'Geographic Holdout Test',
    description: 'Use geographic holdouts to measure incrementality',
    type: 'geo_holdout',
    category: 'audience',
    config: {
      minSampleSize: 5000,
      power: 0.9,
      significanceLevel: 0.05,
      duration: 21,
      recommendedVariants: 2,
      trafficSplit: [80, 20] // 80% test, 20% holdout
    },
    guardrails: [
      {
        metric: 'incremental_lift',
        operator: 'greater_than',
        value: 5.0,
        action: 'promote'
      },
      {
        metric: 'total_spend',
        operator: 'less_than',
        value: 5000,
        action: 'pause'
      }
    ],
    useCases: [
      'Measuring true incrementality',
      'Brand awareness impact testing',
      'Cross-platform attribution'
    ],
    tags: ['incrementality', 'geographic', 'brand_lift', 'attribution']
  },
  {
    id: 'budget_bid_strategy',
    name: 'Bid Strategy Optimization',
    description: 'Test different bidding strategies for optimal performance',
    type: 'creative_ab',
    category: 'budget',
    config: {
      minSampleSize: 3000,
      power: 0.85,
      significanceLevel: 0.05,
      duration: 14,
      recommendedVariants: 2,
      trafficSplit: [50, 50]
    },
    guardrails: [
      {
        metric: 'roas',
        operator: 'greater_than',
        value: 4.0,
        action: 'promote'
      },
      {
        metric: 'daily_spend',
        operator: 'less_than',
        value: 200,
        action: 'alert'
      }
    ],
    useCases: [
      'CPA vs ROAS bidding comparison',
      'Manual vs automated bid testing',
      'Different bid cap strategies'
    ],
    tags: ['bidding', 'budget', 'automation', 'roas']
  },
  {
    id: 'placement_test',
    name: 'Placement Performance Test',
    description: 'Compare performance across different ad placements',
    type: 'creative_ab',
    category: 'placement',
    config: {
      minSampleSize: 1800,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 10,
      recommendedVariants: 3,
      trafficSplit: [40, 30, 30]
    },
    guardrails: [
      {
        metric: 'ctr',
        operator: 'greater_than',
        value: 1.5,
        action: 'promote'
      },
      {
        metric: 'cpm',
        operator: 'less_than',
        value: 20,
        action: 'alert'
      }
    ],
    useCases: [
      'Feed vs Stories placement',
      'In-stream vs discovery ads',
      'Mobile vs desktop performance'
    ],
    tags: ['placement', 'feed', 'stories', 'mobile']
  },
  {
    id: 'seasonal_messaging',
    name: 'Seasonal Message Testing',
    description: 'Test seasonal vs evergreen messaging approaches',
    type: 'creative_ab',
    category: 'creative',
    config: {
      minSampleSize: 1200,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 7,
      recommendedVariants: 2,
      trafficSplit: [50, 50]
    },
    guardrails: [
      {
        metric: 'engagement_rate',
        operator: 'greater_than',
        value: 3.5,
        action: 'promote'
      },
      {
        metric: 'relevance_score',
        operator: 'greater_than',
        value: 8.0,
        action: 'alert'
      }
    ],
    useCases: [
      'Holiday vs regular messaging',
      'Seasonal offers vs standard promotions',
      'Time-sensitive vs evergreen content'
    ],
    tags: ['seasonal', 'timing', 'relevance', 'offers']
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ExperimentTemplate[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: []
    });
  }

  const { category, type, tags } = req.query;

  try {
    let filteredTemplates = experimentTemplates;

    // Filter by category
    if (category && typeof category === 'string') {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    // Filter by type
    if (type && typeof type === 'string') {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }

    // Filter by tags
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',');
      filteredTemplates = filteredTemplates.filter(t => 
        tagList.some(tag => t.tags.includes(tag.trim()))
      );
    }

    return res.status(200).json({
      success: true,
      data: filteredTemplates,
      message: `Retrieved ${filteredTemplates.length} experiment templates`
    });
  } catch (error) {
    console.error('Templates API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: []
    });
  }
}