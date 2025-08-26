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

    // Try OpenAI DALL-E first
    if (process.env.OPENAI_API_KEY) {
      try {
        const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt.substring(0, 4000), // DALL-E prompt limit
            n: 1,
            size: getSizeString(dimensions),
            quality: 'standard',
            style: 'natural'
          })
        });

        if (dalleResponse.ok) {
          const data = await dalleResponse.json();
          return res.status(200).json({
            url: data.data[0].url,
            prompt,
            style: 'ai-generated',
            dimensions,
            success: true
          });
        } else {
          console.error('DALL-E API error:', await dalleResponse.text());
        }
      } catch (error) {
        console.error('DALL-E request failed:', error);
      }
    }

    // Fallback to contextual Unsplash images
    const keywords = extractKeywords(params);
    const unsplashUrl = `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${keywords.join(',')}`;
    
    return res.status(200).json({
      url: unsplashUrl,
      prompt,
      style: 'stock-photo',
      dimensions,
      success: true
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Ultimate fallback
    const fallbackDimensions = { width: 800, height: 600 };
    return res.status(200).json({
      url: `https://via.placeholder.com/${fallbackDimensions.width}x${fallbackDimensions.height}/3B82F6/FFFFFF?text=${encodeURIComponent('Creative Generated')}`,
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
  prompt += `High-quality ${style} advertising creative for ${productName}, `;

  // Product and benefit focus
  prompt += `showcasing ${keyBenefit}, `;

  // Audience targeting
  if (targetAudience) {
    prompt += `designed for ${targetAudience}, `;
  }

  // Angle-specific elements
  switch (angle) {
    case 'social-proof':
      prompt += 'featuring happy customers, testimonials, social validation, customer reviews, ';
      break;
    case 'urgency':
      prompt += 'with urgent messaging, limited time elements, countdown timers, scarcity indicators, ';
      break;
    case 'benefit':
      prompt += 'clearly highlighting product benefits, results, improvements, value proposition, ';
      break;
    case 'comparison':
      prompt += 'showing before and after comparison, transformation results, side-by-side benefits, ';
      break;
    case 'lifestyle':
      prompt += 'in lifestyle setting, everyday use scenario, relatable environment, ';
      break;
    case 'problem-solution':
      prompt += 'addressing problems, showing solutions, pain point resolution, ';
      break;
  }

  // Industry context
  if (industry) {
    prompt += `${industry} industry aesthetic, sector-appropriate styling, `;
  }

  // Format considerations
  switch (format) {
    case 'video':
      prompt += 'thumbnail-worthy composition, dynamic elements, video-ready layout, ';
      break;
    case 'carousel':
      prompt += 'clean layout suitable for social carousel, multiple focus points, ';
      break;
    case 'story':
      prompt += 'vertical mobile-first composition, story format optimized, ';
      break;
    default:
      prompt += 'balanced horizontal composition, social media ready, ';
  }

  // Brand colors (if provided)
  if (brandColors) {
    const colorDesc = hexToColorDescription(brandColors);
    prompt += `incorporating ${colorDesc.join(' and ')} brand colors, `;
  }

  // Technical quality
  prompt += 'professional photography style, clean background, high contrast, sharp focus, commercial quality, marketing ready, no text overlay, no watermarks';

  return prompt;
}

function getDimensions(format: string): { width: number; height: number; } {
  switch (format) {
    case 'story':
      return { width: 1024, height: 1792 }; // Close to 9:16 within DALL-E limits
    case 'video':
      return { width: 1792, height: 1024 }; // Close to 16:9 within DALL-E limits  
    case 'carousel':
      return { width: 1024, height: 1024 }; // 1:1 square
    default: // static
      return { width: 1792, height: 1024 }; // Wide format for social
  }
}

function getSizeString(dimensions: { width: number; height: number; }): string {
  // DALL-E 3 only supports specific sizes
  if (dimensions.width === dimensions.height) return '1024x1024';
  if (dimensions.width > dimensions.height) return '1792x1024';
  return '1024x1792';
}

function extractKeywords(params: GenerationRequest): string[] {
  const keywords = [];
  
  // Product-related
  if (params.productName) {
    keywords.push(...params.productName.toLowerCase().split(/\s+/).slice(0, 2));
  }
  
  // Benefit-related
  if (params.keyBenefit) {
    keywords.push(...params.keyBenefit.toLowerCase().split(/\s+/).slice(0, 2));
  }

  // Industry
  if (params.industry) {
    keywords.push(params.industry.toLowerCase());
  }

  // Style
  keywords.push(params.style || 'professional');

  // Angle-specific
  switch (params.angle) {
    case 'social-proof':
      keywords.push('happy', 'people');
      break;
    case 'lifestyle':
      keywords.push('lifestyle', 'modern');
      break;
    case 'professional':
      keywords.push('business', 'office');
      break;
  }

  return keywords.filter(k => k.length > 2).slice(0, 4);
}

function hexToColorDescription(colors: { primary: string; secondary: string; accent: string; }): string[] {
  const getColorName = (hex: string): string => {
    const colorMap: Record<string, string> = {
      '#FF0000': 'red', '#00FF00': 'green', '#0000FF': 'blue',
      '#FFFF00': 'yellow', '#FF00FF': 'magenta', '#00FFFF': 'cyan',
      '#FFA500': 'orange', '#800080': 'purple', '#FFC0CB': 'pink',
      '#3B82F6': 'blue', '#10B981': 'green', '#F59E0B': 'amber',
      '#EF4444': 'red', '#8B5CF6': 'purple'
    };
    
    // Simple hex matching or fallback to brightness
    const upper = hex.toUpperCase();
    if (colorMap[upper]) return colorMap[upper];
    
    // Extract RGB values for basic color detection
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    if (r > g && r > b) return 'red';
    if (g > r && g > b) return 'green';
    if (b > r && b > g) return 'blue';
    if (r + g + b < 150) return 'dark';
    if (r + g + b > 600) return 'bright';
    return 'vibrant';
  };

  const descriptions = [];
  descriptions.push(getColorName(colors.primary));
  if (colors.secondary !== colors.primary) {
    descriptions.push(getColorName(colors.secondary));
  }
  
  return descriptions.slice(0, 2);
}