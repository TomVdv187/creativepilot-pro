import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, GenerationRequest, GenerationResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<GenerationResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: {} as GenerationResponse
    });
  }

  try {
    const request: GenerationRequest = req.body;

    // Validate request
    if (!request.projectId || !request.format || !request.angles || !request.count) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        data: {} as GenerationResponse
      });
    }

    // Validate count limits
    if (request.count < 1 || request.count > 16) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 16',
        data: {} as GenerationResponse
      });
    }

    // Generate job ID and creative IDs
    const jobId = generateJobId();
    const creativeIds = Array.from({ length: request.count }, () => generateCreativeId());

    // Calculate ETA based on format and count
    const eta = calculateETA(request.format, request.count);

    // Calculate cost based on format and count
    const cost = calculateCost(request.format, request.count, request.locales?.length || 1);

    // Queue generation job (in production, this would queue to a background worker)
    await queueGenerationJob({
      jobId,
      creativeIds,
      request
    });

    const response: GenerationResponse = {
      jobId,
      creativeIds,
      eta,
      cost,
      status: 'queued'
    };

    res.status(202).json({
      success: true,
      data: response,
      message: 'Generation job queued successfully'
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {} as GenerationResponse
    });
  }
}

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateCreativeId(): string {
  return `creative_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function calculateETA(format: string, count: number): number {
  const baseTime = {
    static: 5,    // 5 seconds per static creative
    video: 30,    // 30 seconds per video creative
    carousel: 10, // 10 seconds per carousel
    story: 8,     // 8 seconds per story
    catalog: 6    // 6 seconds per catalog overlay
  };

  const timePerCreative = baseTime[format as keyof typeof baseTime] || 10;
  return Math.ceil(timePerCreative * count * 1.2); // Add 20% buffer
}

function calculateCost(format: string, count: number, locales: number): number {
  const baseCost = {
    static: 0.10,   // $0.10 per static creative
    video: 0.50,    // $0.50 per video creative
    carousel: 0.20, // $0.20 per carousel
    story: 0.15,    // $0.15 per story
    catalog: 0.12   // $0.12 per catalog overlay
  };

  const costPerCreative = baseCost[format as keyof typeof baseCost] || 0.15;
  return Math.round(costPerCreative * count * locales * 100) / 100;
}

async function queueGenerationJob(job: {
  jobId: string;
  creativeIds: string[];
  request: GenerationRequest;
}): Promise<void> {
  // In production, this would:
  // 1. Store job in database with status 'queued'
  // 2. Send to background queue (Redis/Bull, AWS SQS, etc.)
  // 3. Background worker would process the generation
  
  console.log('Queuing generation job:', {
    jobId: job.jobId,
    creativeCount: job.creativeIds.length,
    format: job.request.format,
    angles: job.request.angles
  });

  // For demo purposes, we'll simulate async processing
  setTimeout(async () => {
    console.log(`Simulating completion of job ${job.jobId}`);
    // In production: update job status to 'completed' in database
    // Send webhook notification to client
  }, calculateETA(job.request.format, job.request.count) * 1000);
}