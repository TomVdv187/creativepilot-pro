import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, PerformanceScore } from '@/types';

interface PreflightRequest {
  creativeIds?: string[];
  files?: {
    url: string;
    format: string;
    metadata: any;
  }[];
  context: {
    projectId: string;
    audience: string;
    placement: string;
    objective: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PerformanceScore[]>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: []
    });
  }

  try {
    const request: PreflightRequest = req.body;

    // Validate request
    if ((!request.creativeIds && !request.files) || !request.context) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        data: []
      });
    }

    // Process creatives for scoring
    const scores: PerformanceScore[] = [];
    
    if (request.creativeIds) {
      for (const creativeId of request.creativeIds) {
        const score = await scoreCreative(creativeId, request.context);
        scores.push(score);
      }
    }

    if (request.files) {
      for (const file of request.files) {
        const score = await scoreFile(file, request.context);
        scores.push(score);
      }
    }

    res.status(200).json({
      success: true,
      data: scores,
      message: `Successfully scored ${scores.length} creatives`
    });

  } catch (error) {
    console.error('Preflight scoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: []
    });
  }
}

async function scoreCreative(creativeId: string, context: any): Promise<PerformanceScore> {
  // In production, this would:
  // 1. Load creative data from database
  // 2. Extract visual and text features
  // 3. Run through ML model with context
  // 4. Return structured score with explanations

  // Simulate ML scoring with realistic variance
  const baseScore = 45 + Math.random() * 50; // 45-95 range
  const uncertainty = Math.max(5, Math.random() * 25);
  
  return {
    score: Math.round(baseScore),
    uncertainty: Math.round(uncertainty),
    winProbability: Math.min(0.95, Math.max(0.05, baseScore / 100 + (Math.random() - 0.5) * 0.3)),
    reasons: generateScoreReasons(baseScore, context),
    improvementTips: generateImprovementTips(baseScore, context),
    confidence: uncertainty < 10 ? 'high' : uncertainty < 20 ? 'medium' : 'low'
  };
}

async function scoreFile(file: any, context: any): Promise<PerformanceScore> {
  // In production, this would analyze the uploaded file
  // For now, simulate scoring based on file metadata
  
  const formatBonus = {
    'image/jpeg': 5,
    'image/png': 3,
    'video/mp4': 10,
    'image/gif': -2
  }[file.metadata?.mimeType] || 0;

  const baseScore = 50 + formatBonus + Math.random() * 40;
  const uncertainty = Math.random() * 20 + 5;

  return {
    score: Math.round(baseScore),
    uncertainty: Math.round(uncertainty),
    winProbability: Math.min(0.95, Math.max(0.05, baseScore / 100)),
    reasons: generateScoreReasons(baseScore, context),
    improvementTips: generateImprovementTips(baseScore, context),
    confidence: uncertainty < 10 ? 'high' : uncertainty < 20 ? 'medium' : 'low'
  };
}

function generateScoreReasons(score: number, context: any): string[] {
  const reasons = [];
  
  if (score > 75) {
    reasons.push("Strong visual hierarchy and clear value proposition");
    reasons.push("Colors align well with target audience preferences");
    reasons.push("Text-to-image ratio optimized for this placement");
  } else if (score > 50) {
    reasons.push("Decent visual appeal but could be more engaging");
    reasons.push("Messaging is clear but not highly compelling");
    reasons.push("Some brand consistency issues detected");
  } else {
    reasons.push("Visual elements may not capture attention effectively");
    reasons.push("Message clarity could be improved");
    reasons.push("Low alignment with historical high-performers");
  }

  // Add context-specific reasons
  if (context.placement === 'facebook_feed') {
    reasons.push("Optimized for Facebook feed viewing experience");
  }

  if (context.audience === 'lookalike') {
    reasons.push("Creative style matches successful campaigns for similar audiences");
  }

  return reasons.slice(0, 3); // Return top 3 reasons
}

function generateImprovementTips(score: number, context: any): string[] {
  const tips = [];

  if (score < 60) {
    tips.push("Consider stronger headline with clear benefit statement");
    tips.push("Add more visual contrast to improve attention-grabbing");
    tips.push("Test different color schemes aligned with your brand");
  } else if (score < 80) {
    tips.push("Try A/B testing different call-to-action buttons");
    tips.push("Experiment with social proof elements");
    tips.push("Consider adding urgency or scarcity indicators");
  } else {
    tips.push("Minor optimizations in text placement could boost performance");
    tips.push("Test with different background variations");
  }

  // Context-specific tips
  if (context.objective === 'conversions') {
    tips.push("Focus on outcome-driven messaging");
  }

  if (context.placement === 'instagram_stories') {
    tips.push("Optimize for vertical viewing and quick consumption");
  }

  return tips.slice(0, 3); // Return top 3 tips
}