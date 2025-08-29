import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

export interface CreativeFormat {
  format: 'static' | 'video_storyboard' | 'carousel' | 'story' | 'square' | 'portrait';
  dimensions: { width: number; height: number };
  aspectRatio: string;
  platform: 'meta' | 'google' | 'linkedin' | 'tiktok' | 'all';
  description: string;
}

export interface CreativeAngle {
  id: string;
  name: string;
  category: 'hook' | 'benefit' | 'objection' | 'social_proof' | 'offer';
  description: string;
  variations: string[];
}

export interface GenerationRequest {
  projectId?: string;
  brandId?: string;
  productInfo: {
    name: string;
    description: string;
    keyBenefits: string[];
    price?: number;
    category: string;
  };
  targetAudience: {
    demographics: string;
    interests: string[];
    painPoints: string[];
  };
  creative: {
    formats: CreativeFormat['format'][];
    angles: string[];
    quantity: number; // 1-12 variants per angle
    style: 'professional' | 'casual' | 'modern' | 'vintage' | 'minimal' | 'bold';
    tone: 'friendly' | 'authoritative' | 'playful' | 'urgent' | 'trustworthy';
  };
  brand?: {
    colors: { primary: string; secondary: string; accent: string };
    fonts: { headline: string; body: string };
    logo?: string;
    guidelines?: string;
  };
  compliance: {
    vertical: string;
    region: string;
    platforms: string[];
  };
  settings: {
    autoCompliance: boolean;
    requireApproval: boolean;
    generateCopy: boolean;
    generateImages: boolean;
    generateVideo: boolean;
  };
}

export interface GeneratedCreative {
  id: string;
  format: CreativeFormat['format'];
  angle: string;
  copy: {
    headline: string;
    body: string;
    cta: string;
    hooks: string[];
  };
  visual: {
    imageUrl?: string;
    videoStoryboard?: {
      scenes: Array<{
        duration: number;
        description: string;
        imageUrl: string;
        text?: string;
        voiceover?: string;
      }>;
      totalDuration: number;
    };
    overlays?: Array<{
      type: 'price' | 'discount' | 'rating' | 'badge' | 'logo';
      position: { x: number; y: number };
      content: string;
    }>;
  };
  metadata: {
    dimensions: { width: number; height: number };
    platform: string;
    created: Date;
    preflightScore?: number;
    estimatedPerformance?: {
      ctrPrediction: number;
      engagementScore: number;
      complianceRisk: 'low' | 'medium' | 'high';
    };
  };
  variations: Array<{
    id: string;
    type: 'headline' | 'copy' | 'visual' | 'cta';
    original: string;
    variant: string;
    confidence: number;
  }>;
}

export interface BatchGenerationResponse {
  batchId: string;
  status: 'processing' | 'completed' | 'error';
  progress: number; // 0-100
  totalCreatives: number;
  completedCreatives: number;
  creatives: GeneratedCreative[];
  estimatedCompletionTime: number; // minutes
  cost: {
    totalCredits: number;
    breakdown: {
      copyGeneration: number;
      imageGeneration: number;
      videoGeneration: number;
      complianceCheck: number;
    };
  };
  errors: Array<{
    code: string;
    message: string;
    creative?: string;
  }>;
}

// Mock creative formats
const CREATIVE_FORMATS: CreativeFormat[] = [
  {
    format: 'static',
    dimensions: { width: 1200, height: 630 },
    aspectRatio: '1.91:1',
    platform: 'all',
    description: 'Standard social media post format'
  },
  {
    format: 'square',
    dimensions: { width: 1080, height: 1080 },
    aspectRatio: '1:1',
    platform: 'meta',
    description: 'Instagram square post format'
  },
  {
    format: 'story',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9:16',
    platform: 'all',
    description: 'Vertical story format for Instagram/Facebook Stories'
  },
  {
    format: 'portrait',
    dimensions: { width: 1080, height: 1350 },
    aspectRatio: '4:5',
    platform: 'meta',
    description: 'Instagram portrait post format'
  },
  {
    format: 'carousel',
    dimensions: { width: 1080, height: 1080 },
    aspectRatio: '1:1',
    platform: 'all',
    description: 'Carousel slide format (multiple images)'
  },
  {
    format: 'video_storyboard',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
    platform: 'all',
    description: 'Video storyboard for text-to-video generation'
  }
];

// Mock creative angles
const CREATIVE_ANGLES: CreativeAngle[] = [
  {
    id: 'pain_point_hook',
    name: 'Pain Point Hook',
    category: 'hook',
    description: 'Opens with a relatable problem or frustration',
    variations: [
      'Tired of [problem]?',
      'Struggling with [challenge]?',
      'Fed up with [frustration]?',
      'Why is [problem] so hard?'
    ]
  },
  {
    id: 'benefit_focused',
    name: 'Benefit-Focused',
    category: 'benefit',
    description: 'Highlights key product benefits and outcomes',
    variations: [
      'Get [benefit] in [timeframe]',
      'Finally, [desired_outcome]',
      'Achieve [result] without [pain_point]',
      'The [superlative] way to [outcome]'
    ]
  },
  {
    id: 'social_proof',
    name: 'Social Proof',
    category: 'social_proof',
    description: 'Leverages testimonials and user success stories',
    variations: [
      '[Number] people already [achieved_result]',
      'Join [number]+ satisfied customers',
      'See why [authority] recommends us',
      'Trusted by [social_group]'
    ]
  },
  {
    id: 'objection_handle',
    name: 'Objection Handler',
    category: 'objection',
    description: 'Addresses common concerns and hesitations',
    variations: [
      'No [common_objection] required',
      'Works even if you [concern]',
      'Unlike [competitor], we [difference]',
      'You don\'t need [barrier] to [benefit]'
    ]
  },
  {
    id: 'limited_offer',
    name: 'Limited Offer',
    category: 'offer',
    description: 'Creates urgency with time-sensitive promotions',
    variations: [
      '[Discount]% off - [timeframe] only',
      'Limited time: [offer]',
      'Last chance for [deal]',
      'Only [number] left at this price'
    ]
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BatchGenerationResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: {} as BatchGenerationResponse
    });
  }

  try {
    const request: GenerationRequest = req.body;

    // Validate required fields
    if (!request.productInfo?.name || !request.creative?.formats?.length) {
      return res.status(400).json({
        success: false,
        message: 'Product name and at least one creative format are required',
        data: {} as BatchGenerationResponse
      });
    }

    // Generate batch ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate total creatives to generate
    const totalCreatives = request.creative.formats.length * 
                          request.creative.angles.length * 
                          Math.min(request.creative.quantity, 12);

    // Calculate cost
    const cost = calculateGenerationCost(request, totalCreatives);

    // Start generation process (mock)
    const response = await generateBatchCreatives(request, batchId, totalCreatives, cost);

    return res.status(200).json({
      success: true,
      data: response,
      message: `Batch generation started with ${totalCreatives} creatives`
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start batch generation',
      data: {} as BatchGenerationResponse
    });
  }
}

async function generateBatchCreatives(
  request: GenerationRequest,
  batchId: string,
  totalCreatives: number,
  cost: BatchGenerationResponse['cost']
): Promise<BatchGenerationResponse> {
  const creatives: GeneratedCreative[] = [];
  const errors: BatchGenerationResponse['errors'] = [];

  try {
    // Generate creatives for each format and angle combination
    for (const format of request.creative.formats) {
      for (const angleId of request.creative.angles) {
        const angle = CREATIVE_ANGLES.find(a => a.id === angleId);
        if (!angle) continue;

        for (let i = 0; i < Math.min(request.creative.quantity, 12); i++) {
          const creative = await generateSingleCreative(request, format, angle, i);
          creatives.push(creative);
        }
      }
    }

    return {
      batchId,
      status: 'completed',
      progress: 100,
      totalCreatives,
      completedCreatives: creatives.length,
      creatives,
      estimatedCompletionTime: 0,
      cost,
      errors
    };

  } catch (error) {
    errors.push({
      code: 'GENERATION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      batchId,
      status: 'error',
      progress: Math.floor((creatives.length / totalCreatives) * 100),
      totalCreatives,
      completedCreatives: creatives.length,
      creatives,
      estimatedCompletionTime: 0,
      cost,
      errors
    };
  }
}

async function generateSingleCreative(
  request: GenerationRequest,
  format: CreativeFormat['format'],
  angle: CreativeAngle,
  variantIndex: number
): Promise<GeneratedCreative> {
  const creativeId = `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const formatInfo = CREATIVE_FORMATS.find(f => f.format === format) || CREATIVE_FORMATS[0];

  // Generate copy based on angle and product info
  const copy = generateCopy(request, angle, variantIndex);
  
  // Generate visual content
  const visual = await generateVisual(request, format, formatInfo, copy);

  // Calculate preflight score (mock)
  const preflightScore = Math.floor(Math.random() * 30) + 70; // 70-100

  // Estimated performance (mock AI prediction)
  const estimatedPerformance = {
    ctrPrediction: Math.random() * 3 + 0.5, // 0.5-3.5%
    engagementScore: Math.floor(Math.random() * 40) + 60, // 60-100
    complianceRisk: (Math.random() > 0.8 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
  };

  return {
    id: creativeId,
    format,
    angle: angle.id,
    copy,
    visual,
    metadata: {
      dimensions: formatInfo.dimensions,
      platform: formatInfo.platform,
      created: new Date(),
      preflightScore,
      estimatedPerformance
    },
    variations: generateVariations(copy, 3)
  };
}

function generateCopy(request: GenerationRequest, angle: CreativeAngle, variantIndex: number) {
  const product = request.productInfo;
  const audience = request.targetAudience;
  
  // Select variation based on index
  const baseVariation = angle.variations[variantIndex % angle.variations.length];
  
  // Generate headline based on angle
  let headline = baseVariation;
  headline = headline.replace('[problem]', audience.painPoints[0] || 'inefficiency');
  headline = headline.replace('[benefit]', product.keyBenefits[0] || 'better results');
  headline = headline.replace('[product]', product.name);
  headline = headline.replace('[timeframe]', '24 hours');
  headline = headline.replace('[number]', '10,000');

  // Generate body text
  const bodyTemplates = [
    `Discover how ${product.name} helps ${audience.demographics} ${product.keyBenefits[0] || 'achieve their goals'}.`,
    `${product.description} Perfect for ${audience.demographics} who want ${product.keyBenefits[0] || 'better results'}.`,
    `Join thousands who've already experienced ${product.keyBenefits[0] || 'amazing results'} with ${product.name}.`
  ];
  const body = bodyTemplates[variantIndex % bodyTemplates.length];

  // Generate CTA based on angle and tone
  const ctaTemplates = {
    'friendly': ['Get Started Today', 'Try It Now', 'Learn More', 'Join Us'],
    'urgent': ['Act Now', 'Limited Time', 'Don\'t Miss Out', 'Claim Yours'],
    'authoritative': ['Get Access', 'Start Now', 'View Details', 'Order Today'],
    'playful': ['Let\'s Go!', 'I\'m In', 'Show Me How', 'Yes Please!'],
    'trustworthy': ['Learn More', 'Get Info', 'See How', 'Find Out']
  };
  
  const tone = request.creative.tone || 'friendly';
  const ctas = ctaTemplates[tone] || ctaTemplates.friendly;
  const cta = ctas[variantIndex % ctas.length];

  // Generate hook variations
  const hooks = angle.variations.slice(0, 3).map(variation => {
    return variation
      .replace('[problem]', audience.painPoints[0] || 'challenges')
      .replace('[benefit]', product.keyBenefits[0] || 'success');
  });

  return { headline, body, cta, hooks };
}

async function generateVisual(
  request: GenerationRequest,
  format: CreativeFormat['format'],
  formatInfo: CreativeFormat,
  copy: GeneratedCreative['copy']
): Promise<GeneratedCreative['visual']> {
  const visual: GeneratedCreative['visual'] = {};

  if (request.settings.generateImages && format !== 'video_storyboard') {
    // Generate static image
    const imagePrompt = buildVisualPrompt(request, copy, format);
    visual.imageUrl = `https://source.unsplash.com/${formatInfo.dimensions.width}x${formatInfo.dimensions.height}/?${encodeURIComponent(imagePrompt)}&q=80`;
  }

  if (request.settings.generateVideo && format === 'video_storyboard') {
    // Generate video storyboard
    visual.videoStoryboard = {
      scenes: [
        {
          duration: 3,
          description: `Product showcase of ${request.productInfo.name}`,
          imageUrl: `https://source.unsplash.com/1920x1080/?product,${request.productInfo.category}&q=80`,
          text: copy.headline,
          voiceover: `Introducing ${request.productInfo.name}`
        },
        {
          duration: 4,
          description: `Demonstrate key benefit: ${request.productInfo.keyBenefits[0]}`,
          imageUrl: `https://source.unsplash.com/1920x1080/?benefits,results&q=80`,
          text: copy.body,
          voiceover: copy.body
        },
        {
          duration: 2,
          description: 'Call to action scene',
          imageUrl: `https://source.unsplash.com/1920x1080/?call-to-action,button&q=80`,
          text: copy.cta,
          voiceover: copy.cta
        }
      ],
      totalDuration: 9
    };
  }

  // Add overlays for product info
  if (request.productInfo.price || request.brand?.logo) {
    visual.overlays = [];
    
    if (request.productInfo.price) {
      visual.overlays.push({
        type: 'price',
        position: { x: 0.8, y: 0.1 }, // Top right
        content: `$${request.productInfo.price}`
      });
    }

    if (request.brand?.logo) {
      visual.overlays.push({
        type: 'logo',
        position: { x: 0.05, y: 0.05 }, // Top left
        content: request.brand.logo
      });
    }

    // Add rating overlay for social proof
    if (['social_proof', 'benefit_focused'].includes(copy.hooks[0])) {
      visual.overlays.push({
        type: 'rating',
        position: { x: 0.05, y: 0.9 }, // Bottom left
        content: '★★★★★ 4.8/5'
      });
    }
  }

  return visual;
}

function buildVisualPrompt(request: GenerationRequest, copy: GeneratedCreative['copy'], format: string): string {
  const product = request.productInfo;
  const style = request.creative.style || 'professional';
  
  let prompt = `${style} ${product.category} advertisement, ${product.name}, `;
  prompt += `${product.keyBenefits[0]}, commercial photography, `;
  prompt += `${request.targetAudience.demographics} lifestyle, `;
  
  if (format === 'story') {
    prompt += 'vertical mobile format, story optimized, ';
  } else if (format === 'carousel') {
    prompt += 'carousel slide, clean layout, ';
  }
  
  prompt += 'high quality, marketing ready, modern design';
  
  return prompt;
}

function generateVariations(copy: GeneratedCreative['copy'], count: number): GeneratedCreative['variations'] {
  const variations: GeneratedCreative['variations'] = [];
  
  // Generate headline variations
  const headlineVariations = [
    copy.headline.replace(/\b\w+/g, (word) => Math.random() > 0.7 ? word.toUpperCase() : word),
    `🔥 ${copy.headline}`,
    copy.headline.replace('.', '!').replace('?', '!')
  ];
  
  headlineVariations.slice(0, count).forEach((variant, index) => {
    if (variant !== copy.headline) {
      variations.push({
        id: `var_headline_${index}`,
        type: 'headline',
        original: copy.headline,
        variant,
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      });
    }
  });

  // Generate CTA variations
  const ctaVariations = ['Shop Now', 'Learn More', 'Get Started', 'Try Free', 'Order Today'];
  ctaVariations.slice(0, Math.min(count, 2)).forEach((variant, index) => {
    if (variant !== copy.cta) {
      variations.push({
        id: `var_cta_${index}`,
        type: 'cta',
        original: copy.cta,
        variant,
        confidence: Math.random() * 0.2 + 0.8 // 80-100% confidence
      });
    }
  });

  return variations;
}

function calculateGenerationCost(request: GenerationRequest, totalCreatives: number): BatchGenerationResponse['cost'] {
  const baseCredits = {
    copyGeneration: 1,
    imageGeneration: 3,
    videoGeneration: 10,
    complianceCheck: 1
  };

  let cost = {
    copyGeneration: 0,
    imageGeneration: 0,
    videoGeneration: 0,
    complianceCheck: 0,
    totalCredits: 0
  };

  if (request.settings.generateCopy) {
    cost.copyGeneration = totalCreatives * baseCredits.copyGeneration;
  }

  if (request.settings.generateImages) {
    const imageCreatives = totalCreatives - request.creative.formats.filter(f => f === 'video_storyboard').length;
    cost.imageGeneration = imageCreatives * baseCredits.imageGeneration;
  }

  if (request.settings.generateVideo) {
    const videoCreatives = request.creative.formats.filter(f => f === 'video_storyboard').length * request.creative.angles.length * request.creative.quantity;
    cost.videoGeneration = videoCreatives * baseCredits.videoGeneration;
  }

  if (request.settings.autoCompliance) {
    cost.complianceCheck = totalCreatives * baseCredits.complianceCheck;
  }

  cost.totalCredits = cost.copyGeneration + cost.imageGeneration + cost.videoGeneration + cost.complianceCheck;

  return {
    totalCredits: cost.totalCredits,
    breakdown: {
      copyGeneration: cost.copyGeneration,
      imageGeneration: cost.imageGeneration,
      videoGeneration: cost.videoGeneration,
      complianceCheck: cost.complianceCheck
    }
  };
}

// Export formats and angles for use in frontend
export { CREATIVE_FORMATS, CREATIVE_ANGLES };