import type { NextApiRequest, NextApiResponse } from 'next';

interface GenerationRequest {
  productName: string;
  keyBenefit: string;
  targetAudience: string;
  angle: string;
  format: string;
  brandColors?: { primary: string; secondary: string; accent: string; };
  style?: 'professional' | 'casual' | 'modern' | 'vintage';
  industry?: string;
}

interface GeneratedImageResponse {
  url: string;
  prompt: string;
  style: string;
  dimensions: { width: number; height: number; };
  success: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeneratedImageResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      url: '',
      prompt: '',
      style: '',
      dimensions: { width: 0, height: 0 },
      success: false
    });
  }

  try {
    const params: GenerationRequest = req.body;
    
    if (!params.productName || !params.keyBenefit) {
      return res.status(400).json({
        url: '',
        prompt: 'Missing required fields',
        style: '',
        dimensions: { width: 0, height: 0 },
        success: false
      });
    }

    const prompt = buildPrompt(params);
    const dimensions = getDimensions(params.format);

    // Try multiple AI image generation services in priority order
    const imageServices = [
      {
        name: 'Pollinations',
        generate: async () => {
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${dimensions.width}&height=${dimensions.height}&seed=${Math.floor(Math.random() * 1000000)}&enhance=true&model=flux`;
          
          // Test if the URL is accessible with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const testResponse = await fetch(pollinationsUrl, { 
            method: 'HEAD',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (testResponse.ok) {
            return {
              url: pollinationsUrl,
              style: 'flux-generated'
            };
          }
          throw new Error('Pollinations service unavailable');
        }
      },
      {
        name: 'Replicate',
        generate: async () => {
          // In production, you'd use Replicate API here
          // For now, return a placeholder that indicates this would be AI-generated
          const replicateUrl = `https://replicate.delivery/pbxt/placeholder-${Math.random().toString(36).substr(2, 9)}.png`;
          console.log('Would use Replicate API with key');
          throw new Error('Replicate API key required');
        }
      },
      {
        name: 'Stability AI',
        generate: async () => {
          if (!process.env.STABILITY_API_KEY) {
            throw new Error('Stability API key not configured');
          }
          
          const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text_prompts: [{ text: prompt, weight: 1 }],
              cfg_scale: 7,
              height: dimensions.height,
              width: dimensions.width,
              samples: 1,
              steps: 30,
            })
          });

          if (response.ok) {
            const data = await response.json();
            const imageBase64 = data.artifacts[0].base64;
            return {
              url: `data:image/png;base64,${imageBase64}`,
              style: 'stable-diffusion-xl'
            };
          }
          throw new Error('Stability AI request failed');
        }
      }
    ];

    // Try each service in order
    for (const service of imageServices) {
      try {
        console.log(`Attempting ${service.name}...`);
        const result = await service.generate();
        return res.status(200).json({
          url: result.url,
          prompt,
          style: result.style,
          dimensions,
          success: true
        });
      } catch (error) {
        console.log(`${service.name} failed:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    // Fallback to high-quality contextual Unsplash images
    const keywords = extractKeywords(params);
    const unsplashUrl = `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${keywords.join(',')}&q=80`;
    
    return res.status(200).json({
      url: unsplashUrl,
      prompt,
      style: 'stock-photo',
      dimensions,
      success: true
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Ultimate fallback - professional placeholder
    const fallbackDimensions = { width: 1200, height: 630 };
    const placeholderUrl = `https://via.placeholder.com/${fallbackDimensions.width}x${fallbackDimensions.height}/6366F1/FFFFFF?text=${encodeURIComponent('🎨 Creative Generated')}`;
    
    return res.status(200).json({
      url: placeholderUrl,
      prompt: 'Fallback placeholder',
      style: 'placeholder',
      dimensions: fallbackDimensions,
      success: false
    });
  }
}

function buildPrompt(params: GenerationRequest): string {
  const { productName, keyBenefit, targetAudience, angle, format, brandColors, style = 'professional', industry } = params;
  
  let prompt = '';

  // Base style and quality
  prompt += `Professional ${style} advertising creative, `;
  
  // Product focus
  prompt += `${productName} product showcase, `;
  
  // Key benefit
  prompt += `highlighting "${keyBenefit}", `;

  // Target audience context
  if (targetAudience) {
    prompt += `designed for ${targetAudience}, `;
  }

  // Angle-specific styling
  switch (angle) {
    case 'social-proof':
      prompt += 'customer testimonials, happy users, 5-star reviews, social validation, ';
      break;
    case 'urgency':
      prompt += 'limited time offer, countdown timer, urgent call-to-action, scarcity, ';
      break;
    case 'benefit':
      prompt += 'clear product benefits, before and after, results demonstration, ';
      break;
    case 'comparison':
      prompt += 'side-by-side comparison, versus competition, superiority, ';
      break;
    case 'lifestyle':
      prompt += 'lifestyle photography, people using product, everyday scenarios, ';
      break;
    case 'problem-solution':
      prompt += 'problem solving, pain point relief, solution demonstration, ';
      break;
  }

  // Industry context
  if (industry) {
    prompt += `${industry} industry aesthetic, `;
  }

  // Format optimization
  switch (format) {
    case 'story':
      prompt += 'vertical mobile format, story optimized, ';
      break;
    case 'video':
      prompt += 'video thumbnail ready, dynamic composition, ';
      break;
    case 'carousel':
      prompt += 'carousel slide format, clean layout, ';
      break;
    default:
      prompt += 'social media post format, ';
  }

  // Quality specifications
  prompt += 'high quality, commercial photography, professional lighting, clean background, marketing ready, no text overlay, modern design';

  return prompt;
}

function getDimensions(format: string): { width: number; height: number; } {
  switch (format) {
    case 'story':
      return { width: 1080, height: 1920 }; // 9:16 vertical
    case 'video':
      return { width: 1920, height: 1080 }; // 16:9 horizontal
    case 'carousel':
      return { width: 1080, height: 1080 }; // 1:1 square
    default: // static
      return { width: 1200, height: 630 }; // Social media optimal
  }
}

function extractKeywords(params: GenerationRequest): string[] {
  const keywords = [];
  
  // Product name keywords
  if (params.productName) {
    keywords.push(...params.productName.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  }
  
  // Benefit keywords
  if (params.keyBenefit) {
    keywords.push(...params.keyBenefit.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 2));
  }

  // Industry
  if (params.industry) {
    keywords.push(params.industry.toLowerCase());
  }

  // Style and angle
  keywords.push(params.style || 'professional');
  keywords.push('advertising', 'marketing');

  // Angle-specific keywords
  switch (params.angle) {
    case 'social-proof':
      keywords.push('testimonial', 'reviews');
      break;
    case 'lifestyle':
      keywords.push('lifestyle', 'people');
      break;
    case 'benefit':
      keywords.push('results', 'benefits');
      break;
  }

  return keywords.slice(0, 5); // Limit for URL length
}