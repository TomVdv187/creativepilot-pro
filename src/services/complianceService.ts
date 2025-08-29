import { ApiResponse } from '@/types';
import { ComplianceResult, ComplianceViolation } from '@/pages/api/compliance/lint';
import { PolicyPack } from '@/pages/api/compliance/policies';

export interface ComplianceCheckParams {
  content: {
    headline?: string;
    body?: string;
    cta?: string;
    media?: {
      type: 'image' | 'video';
      url: string;
      tags?: string[];
      duration?: number;
    };
  };
  platform: 'meta' | 'google' | 'linkedin' | 'all';
  vertical: string;
  region: string;
}

export interface ComplianceReport {
  summary: {
    overall: 'pass' | 'warning' | 'fail';
    score: number;
    totalViolations: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  violations: ComplianceViolation[];
  recommendations: string[];
  safeRewrites: {
    original: string;
    rewritten: string;
    explanation: string;
  }[];
  policyPacks: string[];
  approvalRequired: boolean;
  estimatedReviewTime: number; // minutes
}

export class ComplianceService {
  private static instance: ComplianceService;
  private apiBase = '/api/compliance';
  private cache = new Map<string, { result: ComplianceResult; timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ComplianceService {
    if (!this.instance) {
      this.instance = new ComplianceService();
    }
    return this.instance;
  }

  async lintContent(params: ComplianceCheckParams): Promise<ComplianceResult> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(params);
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.result;
      }

      const response = await fetch(`${this.apiBase}/lint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
      
      const result: ApiResponse<ComplianceResult> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to lint content');
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        result: result.data,
        timestamp: Date.now()
      });

      return result.data;
    } catch (error) {
      console.error('Error linting content:', error);
      throw error;
    }
  }

  async getPolicyPacks(filters?: {
    vertical?: string;
    region?: string;
  }): Promise<PolicyPack[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.vertical) params.append('vertical', filters.vertical);
      if (filters?.region) params.append('region', filters.region);
      
      const response = await fetch(`${this.apiBase}/policies?${params}`);
      const result: ApiResponse<PolicyPack[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch policy packs');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching policy packs:', error);
      throw error;
    }
  }

  async getPolicyPack(id: string): Promise<PolicyPack> {
    try {
      const response = await fetch(`${this.apiBase}/policies?id=${id}`);
      const result: ApiResponse<PolicyPack> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch policy pack');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching policy pack:', error);
      throw error;
    }
  }

  generateComplianceReport(complianceResult: ComplianceResult, policyPacks: string[] = []): ComplianceReport {
    const errorCount = complianceResult.violations.filter(v => v.severity === 'error').length;
    const warningCount = complianceResult.violations.filter(v => v.severity === 'warning').length;
    const infoCount = complianceResult.violations.filter(v => v.severity === 'info').length;

    // Estimate review time based on violations
    const estimatedReviewTime = this.calculateReviewTime(complianceResult.violations);

    return {
      summary: {
        overall: complianceResult.overall,
        score: complianceResult.score,
        totalViolations: complianceResult.violations.length,
        errorCount,
        warningCount,
        infoCount
      },
      violations: complianceResult.violations,
      recommendations: complianceResult.recommendations,
      safeRewrites: complianceResult.safeRewrites || [],
      policyPacks,
      approvalRequired: complianceResult.approvalRequired,
      estimatedReviewTime
    };
  }

  async batchLintContent(contents: ComplianceCheckParams[]): Promise<ComplianceResult[]> {
    try {
      const results = await Promise.all(
        contents.map(content => this.lintContent(content))
      );
      return results;
    } catch (error) {
      console.error('Error in batch linting:', error);
      throw error;
    }
  }

  validateBeforePublish(complianceResult: ComplianceResult): {
    canPublish: boolean;
    blockers: string[];
    warnings: string[];
  } {
    const blockers: string[] = [];
    const warnings: string[] = [];

    complianceResult.violations.forEach(violation => {
      if (violation.severity === 'error') {
        blockers.push(`${violation.category}: ${violation.description}`);
      } else if (violation.severity === 'warning') {
        warnings.push(`${violation.category}: ${violation.description}`);
      }
    });

    return {
      canPublish: blockers.length === 0,
      blockers,
      warnings
    };
  }

  generatePreflightChecklist(vertical: string, platform: string): {
    category: string;
    items: Array<{
      check: string;
      required: boolean;
      description: string;
    }>;
  }[] {
    const checklists = {
      health: [
        {
          category: 'Claims & Substantiation',
          items: [
            {
              check: 'No guarantee language',
              required: true,
              description: 'Avoid "guaranteed results", "100% effective", etc.'
            },
            {
              check: 'FDA disclaimers present',
              required: true,
              description: 'Include required FDA disclaimers for health products'
            },
            {
              check: 'Substantiation available',
              required: true,
              description: 'Have evidence for all health claims made'
            }
          ]
        },
        {
          category: 'Visual Content',
          items: [
            {
              check: 'No before/after images',
              required: platform === 'meta',
              description: 'Meta prohibits before/after transformations'
            },
            {
              check: 'No misleading imagery',
              required: true,
              description: 'Images must accurately represent the product'
            }
          ]
        }
      ],
      finance: [
        {
          category: 'Investment Claims',
          items: [
            {
              check: 'No guaranteed returns',
              required: true,
              description: 'Cannot promise specific investment returns'
            },
            {
              check: 'Risk disclosures present',
              required: true,
              description: 'Must disclose investment risks clearly'
            },
            {
              check: 'Past performance disclaimer',
              required: true,
              description: 'Include standard past performance disclaimer'
            }
          ]
        }
      ],
      general: [
        {
          category: 'General Compliance',
          items: [
            {
              check: 'Truthful and accurate',
              required: true,
              description: 'All claims must be truthful and substantiated'
            },
            {
              check: 'Clear and prominent disclosures',
              required: true,
              description: 'Important terms clearly disclosed'
            },
            {
              check: 'No discriminatory language',
              required: true,
              description: 'Language complies with anti-discrimination laws'
            }
          ]
        }
      ]
    };

    return checklists[vertical as keyof typeof checklists] || checklists.general;
  }

  private generateCacheKey(params: ComplianceCheckParams): string {
    return btoa(JSON.stringify({
      content: params.content,
      platform: params.platform,
      vertical: params.vertical,
      region: params.region
    })).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
  }

  private calculateReviewTime(violations: ComplianceViolation[]): number {
    let baseTime = 2; // 2 minutes base time
    
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    
    // Add time based on violations
    baseTime += errorCount * 3; // 3 minutes per error
    baseTime += warningCount * 1; // 1 minute per warning
    
    // Add time for complex categories
    const complexCategories = ['required_disclosures', 'trademark'];
    const complexViolations = violations.filter(v => 
      complexCategories.includes(v.category)
    ).length;
    
    baseTime += complexViolations * 2;
    
    return Math.min(baseTime, 30); // Cap at 30 minutes
  }

  clearCache(): void {
    this.cache.clear();
  }

  getComplianceMetrics(): {
    cacheSize: number;
    cacheHitRate?: number;
  } {
    return {
      cacheSize: this.cache.size,
      // In production, track cache hit rate
    };
  }

  // Helper method to extract text content for compliance checking
  extractTextContent(creative: any): ComplianceCheckParams['content'] {
    return {
      headline: creative.headline || creative.title,
      body: creative.body || creative.description || creative.content,
      cta: creative.cta || creative.callToAction,
      media: creative.media || creative.image || creative.video
    };
  }

  // Method to suggest policy packs based on content
  async suggestPolicyPacks(content: string, context?: {
    industry?: string;
    region?: string;
  }): Promise<PolicyPack[]> {
    const allPacks = await this.getPolicyPacks();
    const suggestions: PolicyPack[] = [];

    // Simple keyword-based suggestions
    const contentLower = content.toLowerCase();

    // Health keywords
    if (/health|medicine|supplement|weight|diet|fitness|beauty|skin/.test(contentLower)) {
      const healthPack = allPacks.find(p => p.vertical === 'health');
      if (healthPack) suggestions.push(healthPack);
    }

    // Finance keywords
    if (/invest|money|profit|return|trading|financial|loan|credit/.test(contentLower)) {
      const financePack = allPacks.find(p => p.vertical === 'finance');
      if (financePack) suggestions.push(financePack);
    }

    // Employment keywords
    if (/job|career|hiring|employment|work|salary|benefits/.test(contentLower)) {
      const employmentPack = allPacks.find(p => p.vertical === 'employment');
      if (employmentPack) suggestions.push(employmentPack);
    }

    // Real estate keywords
    if (/home|house|property|real estate|apartment|rent|mortgage/.test(contentLower)) {
      const realEstatePack = allPacks.find(p => p.vertical === 'real_estate');
      if (realEstatePack) suggestions.push(realEstatePack);
    }

    // Filter by region if provided
    if (context?.region) {
      return suggestions.filter(pack => pack.region === context.region);
    }

    return suggestions;
  }
}