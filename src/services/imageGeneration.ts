interface GenerationParams {
  productName: string;
  keyBenefit: string;
  targetAudience: string;
  angle: string;
  format: string;
  brandColors?: { primary: string; secondary: string; accent: string; };
  style?: 'professional' | 'casual' | 'modern' | 'vintage';
  industry?: string;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  dimensions: { width: number; height: number; };
}

export class ImageGenerationService {
  private static instance: ImageGenerationService;

  static getInstance(): ImageGenerationService {
    if (!this.instance) {
      this.instance = new ImageGenerationService();
    }
    return this.instance;
  }

  async generateImage(params: GenerationParams): Promise<GeneratedImage> {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          prompt: data.prompt,
          style: data.style,
          dimensions: data.dimensions
        };
      } else {
        throw new Error('Image generation API failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      // Fallback to Unsplash with context
      return this.generateFallbackImage(params);
    }
  }

  private async generateWithStabilityAI(
    params: GenerationParams, 
    prompt: string, 
    dimensions: { width: number; height: number; }
  ): Promise<GeneratedImage> {
    try {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
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
        const imageUrl = `data:image/png;base64,${imageBase64}`;
        
        return {
          url: imageUrl,
          prompt: prompt,
          style: 'ai-generated',
          dimensions
        };
      } else {
        throw new Error('Stability AI failed');
      }
    } catch (error) {
      console.warn('Stability AI failed, using fallback...', error);
      return this.generateFallbackImage(params, prompt, dimensions);
    }
  }

  private generateFallbackImage(
    params: GenerationParams,
    prompt: string,
    dimensions: { width: number; height: number; }
  ): GeneratedImage {
    // Use a service like Unsplash or generate a placeholder
    const keywords = this.extractKeywords(params);
    const unsplashUrl = `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${keywords.join(',')}`;
    
    return {
      url: unsplashUrl,
      prompt: prompt,
      style: 'stock-photo',
      dimensions
    };
  }

  private buildPrompt(params: GenerationParams): string {
    const { productName, keyBenefit, targetAudience, angle, format, brandColors, style = 'professional', industry } = params;
    
    let prompt = '';

    // Base style
    prompt += `${style} advertising creative, high quality, commercial photography style, `;

    // Product and benefit focus
    prompt += `featuring ${productName}, highlighting ${keyBenefit}, `;

    // Audience targeting
    if (targetAudience) {
      prompt += `appealing to ${targetAudience}, `;
    }

    // Angle-specific elements
    switch (angle) {
      case 'social-proof':
        prompt += 'showing happy customers, testimonials, reviews, social validation, ';
        break;
      case 'urgency':
        prompt += 'with urgent messaging, limited time offers, countdown elements, ';
        break;
      case 'benefit':
        prompt += 'clearly showcasing product benefits, results, improvements, ';
        break;
      case 'comparison':
        prompt += 'before and after comparison, side-by-side results, transformation, ';
        break;
      case 'lifestyle':
        prompt += 'lifestyle setting, product in use, everyday scenarios, ';
        break;
      case 'problem-solution':
        prompt += 'problem-solving scenario, pain points addressed, solutions highlighted, ';
        break;
    }

    // Format-specific adjustments
    switch (format) {
      case 'video':
        prompt += 'dynamic scene suitable for video thumbnail, action-oriented, ';
        break;
      case 'carousel':
        prompt += 'clean layout suitable for carousel format, multiple elements, ';
        break;
      case 'story':
        prompt += 'vertical composition, mobile-optimized, story format, ';
        break;
      default:
        prompt += 'static image composition, well-balanced layout, ';
    }

    // Industry context
    if (industry) {
      prompt += `${industry} industry aesthetic, `;
    }

    // Brand colors (convert hex to descriptive colors)
    if (brandColors) {
      const colorDescriptions = this.hexToColorDescription(brandColors);
      prompt += `incorporating ${colorDescriptions.join(' and ')} color scheme, `;
    }

    // Technical specifications
    prompt += 'clean background, professional lighting, high contrast, marketing ready, ';
    prompt += 'sharp focus, detailed, 4K quality, commercial use';

    // Remove extra spaces and commas
    return prompt.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
  }

  private getDimensions(format: string): { width: number; height: number; } {
    switch (format) {
      case 'story':
        return { width: 1080, height: 1920 }; // 9:16 vertical
      case 'video':
        return { width: 1920, height: 1080 }; // 16:9 horizontal
      case 'carousel':
        return { width: 1080, height: 1080 }; // 1:1 square
      default: // static
        return { width: 1200, height: 630 }; // Facebook/LinkedIn optimal
    }
  }

  private extractKeywords(params: GenerationParams): string[] {
    const keywords = [];
    
    // Product-related
    if (params.productName) {
      keywords.push(params.productName.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // Benefit-related
    if (params.keyBenefit) {
      keywords.push(params.keyBenefit.toLowerCase().replace(/\s+/g, '-'));
    }

    // Industry-related
    if (params.industry) {
      keywords.push(params.industry.toLowerCase());
    }

    // Angle-related
    switch (params.angle) {
      case 'social-proof':
        keywords.push('happy', 'people', 'testimonial');
        break;
      case 'lifestyle':
        keywords.push('lifestyle', 'modern', 'people');
        break;
      case 'professional':
        keywords.push('business', 'professional', 'office');
        break;
    }

    return keywords.slice(0, 3); // Limit for URL length
  }

  private hexToColorDescription(colors: { primary: string; secondary: string; accent: string; }): string[] {
    const descriptions = [];
    
    // Simple hex to color name mapping (you'd want a more comprehensive one in production)
    const colorMap: Record<string, string> = {
      '#FF0000': 'red', '#00FF00': 'green', '#0000FF': 'blue',
      '#FFFF00': 'yellow', '#FF00FF': 'magenta', '#00FFFF': 'cyan',
      '#FFA500': 'orange', '#800080': 'purple', '#FFC0CB': 'pink',
      '#A52A2A': 'brown', '#808080': 'gray', '#000000': 'black',
      '#FFFFFF': 'white', '#3B82F6': 'blue', '#10B981': 'green',
      '#F59E0B': 'amber', '#EF4444': 'red', '#8B5CF6': 'purple'
    };
    
    const getClosestColor = (hex: string): string => {
      // Simple approach - in production you'd use color distance calculations
      return colorMap[hex.toUpperCase()] || 
             (hex.includes('FF') ? 'bright' : 
              hex.includes('00') ? 'dark' : 'vibrant');
    };

    descriptions.push(getClosestColor(colors.primary));
    if (colors.secondary !== colors.primary) {
      descriptions.push(getClosestColor(colors.secondary));
    }
    
    return descriptions;
  }

  // Template-based generation for specific use cases
  async generateBrandedBanner(params: GenerationParams & {
    logoUrl?: string;
    template: 'hero' | 'social' | 'email' | 'article';
  }): Promise<GeneratedImage> {
    const enhancedParams = {
      ...params,
      style: 'professional' as const,
    };

    // Add template-specific prompt modifications
    switch (params.template) {
      case 'hero':
        enhancedParams.format = 'static';
        break;
      case 'social':
        enhancedParams.format = 'carousel';
        break;
      case 'email':
        enhancedParams.format = 'static';
        break;
      case 'article':
        enhancedParams.format = 'static';
        break;
    }

    const image = await this.generateImage(enhancedParams);

    // In production, you'd overlay the logo here using canvas or image processing
    if (params.logoUrl) {
      // This would be handled by your image composition service
      console.log(`Would overlay logo ${params.logoUrl} on generated image`);
    }

    return image;
  }
}

// Export singleton instance
export const imageGenService = ImageGenerationService.getInstance();