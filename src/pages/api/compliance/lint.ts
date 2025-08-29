import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

export interface ComplianceViolation {
  id: string;
  severity: 'error' | 'warning' | 'info';
  platform: 'meta' | 'google' | 'linkedin' | 'all';
  rule: string;
  category: 'prohibited_claims' | 'required_disclosures' | 'content_policy' | 'trademark' | 'adult_content' | 'misleading';
  description: string;
  suggestion: string;
  location?: {
    element: 'headline' | 'body' | 'cta' | 'image' | 'video';
    position?: { start: number; end: number };
  };
  regulation?: {
    type: 'FDA' | 'FTC' | 'GDPR' | 'CCPA' | 'Platform Policy';
    reference: string;
  };
}

export interface ComplianceResult {
  overall: 'pass' | 'warning' | 'fail';
  score: number; // 0-100
  violations: ComplianceViolation[];
  safeRewrites?: {
    original: string;
    rewritten: string;
    explanation: string;
  }[];
  approvalRequired: boolean;
  recommendations: string[];
}

const PROHIBITED_CLAIMS_PATTERNS = {
  meta: [
    /guarantee[d]?\s+(results?|success|profit|income)/gi,
    /100%\s+(effective|safe|natural|organic)/gi,
    /(instant|immediate|overnight)\s+(results?|success|weight\s*loss)/gi,
    /(miracle|magic|secret)\s+(cure|formula|pill|solution)/gi,
    /lose\s+\d+\s*lbs?\s+in\s+\d+\s+days?/gi,
    /(fda|doctor|clinically)\s+(approved|endorsed|recommended)/gi,
    /before\s+(and|&)\s+after/gi,
    /(earn|make)\s+\$?\d+[\d,]*\s*(per|\/)\s*(day|week|month)/gi,
  ],
  google: [
    /click\s+here\s+(now|today|immediately)/gi,
    /limited\s+time\s+offer/gi,
    /(urgent|act\s+now|hurry)/gi,
    /free\s+(trial|sample|gift)/gi,
    /(risk|worry)\s*-?\s*free/gi,
    /no\s+(side\s+effects?|risk)/gi,
  ],
  linkedin: [
    /get\s+rich\s+quick/gi,
    /make\s+money\s+(fast|quickly|easy)/gi,
    /work\s+from\s+home/gi,
    /(pyramid|ponzi)\s+scheme/gi,
  ]
};

const REQUIRED_DISCLOSURES = {
  health: [
    "Individual results may vary",
    "This statement has not been evaluated by the FDA",
    "Consult your doctor before use",
  ],
  financial: [
    "Past performance does not guarantee future results", 
    "Investment involves risk",
    "Results not typical",
  ],
  weight_loss: [
    "Results not typical",
    "Diet and exercise required",
    "Consult healthcare provider",
  ],
  employment: [
    "Equal opportunity employer",
    "Background check required",
  ]
};

const SAFE_REWRITES = {
  "guaranteed results": "potential results",
  "100% effective": "highly effective",
  "miracle cure": "innovative solution",
  "instant results": "fast-acting results",
  "lose 20 lbs in 7 days": "support healthy weight management",
  "FDA approved": "manufactured in FDA-registered facility",
  "doctor recommended": "developed with medical expertise",
  "click here now": "learn more",
  "limited time offer": "special promotion",
  "risk-free": "satisfaction guarantee",
  "work from home": "remote work opportunity",
  "get rich quick": "financial opportunity"
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ComplianceResult>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      data: {} as ComplianceResult
    });
  }

  try {
    const { content, platform, vertical, region } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
        data: {} as ComplianceResult
      });
    }

    const result = await lintContent({
      content,
      platform: platform || 'all',
      vertical: vertical || 'general',
      region: region || 'US'
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: `Compliance check completed with ${result.violations.length} violations found`
    });

  } catch (error) {
    console.error('Compliance linting error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {} as ComplianceResult
    });
  }
}

async function lintContent(params: {
  content: any;
  platform: string;
  vertical: string;
  region: string;
}): Promise<ComplianceResult> {
  const { content, platform, vertical, region } = params;
  const violations: ComplianceViolation[] = [];

  // Check headline
  if (content.headline) {
    violations.push(...checkText(content.headline, 'headline', platform, vertical));
  }

  // Check body text
  if (content.body) {
    violations.push(...checkText(content.body, 'body', platform, vertical));
  }

  // Check CTA
  if (content.cta) {
    violations.push(...checkText(content.cta, 'cta', platform, vertical));
  }

  // Check for required disclosures
  violations.push(...checkDisclosures(content, vertical));

  // Check image/video content
  if (content.media) {
    violations.push(...checkMediaContent(content.media, platform));
  }

  // Calculate overall compliance score
  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;
  
  const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));
  
  let overall: 'pass' | 'warning' | 'fail' = 'pass';
  if (errorCount > 0) overall = 'fail';
  else if (warningCount > 0) overall = 'warning';

  // Generate safe rewrites for violations
  const safeRewrites = generateSafeRewrites(violations, content);

  // Determine if approval is required
  const approvalRequired = errorCount > 0 || (vertical === 'health' && warningCount > 0);

  // Generate recommendations
  const recommendations = generateRecommendations(violations, vertical, platform);

  return {
    overall,
    score,
    violations,
    safeRewrites,
    approvalRequired,
    recommendations
  };
}

function checkText(text: string, element: string, platform: string, vertical: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  // Check prohibited claims patterns
  const platformPatterns = PROHIBITED_CLAIMS_PATTERNS[platform as keyof typeof PROHIBITED_CLAIMS_PATTERNS] || [];
  const allPatterns = [...platformPatterns, ...PROHIBITED_CLAIMS_PATTERNS.meta];

  allPatterns.forEach((pattern, index) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const startPos = text.indexOf(match);
        violations.push({
          id: `prohibited_${element}_${index}_${startPos}`,
          severity: getSeverityForPattern(match, vertical),
          platform: platform as any,
          rule: 'prohibited_claims',
          category: 'prohibited_claims',
          description: `Prohibited claim detected: "${match}"`,
          suggestion: getSuggestionForMatch(match),
          location: {
            element: element as any,
            position: { start: startPos, end: startPos + match.length }
          },
          regulation: getRegulationForClaim(match, vertical)
        });
      });
    }
  });

  // Check for misleading language
  violations.push(...checkMisleadingLanguage(text, element, platform));

  // Check for trademark violations
  violations.push(...checkTrademarks(text, element));

  return violations;
}

function checkDisclosures(content: any, vertical: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const fullText = [content.headline, content.body, content.cta].filter(Boolean).join(' ');

  const requiredDisclosures = REQUIRED_DISCLOSURES[vertical as keyof typeof REQUIRED_DISCLOSURES] || [];
  
  requiredDisclosures.forEach((disclosure, index) => {
    const hasDisclosure = fullText.toLowerCase().includes(disclosure.toLowerCase());
    if (!hasDisclosure) {
      violations.push({
        id: `missing_disclosure_${vertical}_${index}`,
        severity: vertical === 'health' ? 'error' : 'warning',
        platform: 'all',
        rule: 'required_disclosures',
        category: 'required_disclosures',
        description: `Missing required disclosure: "${disclosure}"`,
        suggestion: `Add this disclosure: "${disclosure}"`,
        regulation: {
          type: vertical === 'health' ? 'FDA' : 'FTC',
          reference: `${vertical.toUpperCase()} compliance requirements`
        }
      });
    }
  });

  return violations;
}

function checkMisleadingLanguage(text: string, element: string, platform: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  const misleadingPatterns = [
    { pattern: /as\s+seen\s+on\s+tv/gi, description: 'Generic "As Seen on TV" claim without specific reference' },
    { pattern: /#1\s+(best|top|leading)/gi, description: 'Unsubstantiated ranking claim' },
    { pattern: /scientifically\s+proven/gi, description: 'Unsubstantiated scientific claim' },
    { pattern: /all\s+natural/gi, description: 'Vague "all natural" claim' },
    { pattern: /chemical\s*-?\s*free/gi, description: 'Misleading "chemical-free" claim' }
  ];

  misleadingPatterns.forEach((item, index) => {
    const matches = text.match(item.pattern);
    if (matches) {
      matches.forEach(match => {
        const startPos = text.indexOf(match);
        violations.push({
          id: `misleading_${element}_${index}_${startPos}`,
          severity: 'warning',
          platform: platform as any,
          rule: 'misleading_content',
          category: 'misleading',
          description: item.description,
          suggestion: 'Provide specific evidence or remove the claim',
          location: {
            element: element as any,
            position: { start: startPos, end: startPos + match.length }
          }
        });
      });
    }
  });

  return violations;
}

function checkTrademarks(text: string, element: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  const commonTrademarks = [
    'iPhone', 'iPad', 'Android', 'Windows', 'MacBook', 'Tesla', 'Netflix', 'Amazon', 'Google', 'Facebook', 'Instagram', 'TikTok', 'Zoom', 'Uber', 'Nike', 'Adidas', 'Coca-Cola', 'Pepsi'
  ];

  commonTrademarks.forEach(trademark => {
    const pattern = new RegExp(`\\b${trademark}\\b`, 'gi');
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const startPos = text.indexOf(match);
        violations.push({
          id: `trademark_${element}_${trademark}_${startPos}`,
          severity: 'info',
          platform: 'all',
          rule: 'trademark_usage',
          category: 'trademark',
          description: `Potential trademark usage: "${match}"`,
          suggestion: 'Verify trademark usage rights or use generic terms',
          location: {
            element: element as any,
            position: { start: startPos, end: startPos + match.length }
          }
        });
      });
    }
  });

  return violations;
}

function checkMediaContent(media: any, platform: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  // Check for before/after images (common violation)
  if (media.type === 'image' && media.tags) {
    const hasBeforeAfter = media.tags.some((tag: string) => 
      /before.*after|comparison|transformation/i.test(tag)
    );
    
    if (hasBeforeAfter) {
      violations.push({
        id: 'before_after_image',
        severity: 'error',
        platform: platform as any,
        rule: 'before_after_prohibited',
        category: 'content_policy',
        description: 'Before/after images are prohibited for health and beauty claims',
        suggestion: 'Use lifestyle imagery or product shots instead',
        location: { element: 'image' }
      });
    }
  }

  // Check video content
  if (media.type === 'video') {
    if (media.duration && media.duration > 15 && platform === 'meta') {
      violations.push({
        id: 'video_length_warning',
        severity: 'warning',
        platform: 'meta',
        rule: 'video_length_optimization',
        category: 'content_policy',
        description: 'Videos longer than 15 seconds may have reduced reach on Facebook',
        suggestion: 'Consider creating a shorter version for better performance',
        location: { element: 'video' }
      });
    }
  }

  return violations;
}

function getSeverityForPattern(match: string, vertical: string): 'error' | 'warning' | 'info' {
  if (vertical === 'health' && /guarantee|miracle|instant|100%/.test(match)) {
    return 'error';
  }
  if (/fda|doctor|clinical/.test(match.toLowerCase())) {
    return 'error';
  }
  return 'warning';
}

function getSuggestionForMatch(match: string): string {
  const lowerMatch = match.toLowerCase();
  
  for (const [original, replacement] of Object.entries(SAFE_REWRITES)) {
    if (lowerMatch.includes(original.toLowerCase())) {
      return `Consider using: "${replacement}"`;
    }
  }
  
  return 'Remove or rephrase this claim with substantiated language';
}

function getRegulationForClaim(match: string, vertical: string): ComplianceViolation['regulation'] {
  const lowerMatch = match.toLowerCase();
  
  if (lowerMatch.includes('fda') || vertical === 'health') {
    return { type: 'FDA', reference: '21 CFR 101.93 - Health Claims' };
  }
  
  if (lowerMatch.includes('earn') || lowerMatch.includes('make money')) {
    return { type: 'FTC', reference: 'FTC Act Section 5 - Deceptive Practices' };
  }
  
  return { type: 'FTC', reference: 'FTC Truth in Advertising Guidelines' };
}

function generateSafeRewrites(violations: ComplianceViolation[], content: any): ComplianceResult['safeRewrites'] {
  const rewrites: ComplianceResult['safeRewrites'] = [];

  violations.forEach(violation => {
    if (violation.severity === 'error' && violation.location?.position) {
      const element = violation.location.element;
      const originalText = content[element];
      
      if (originalText && violation.location.position) {
        const { start, end } = violation.location.position;
        const problematicText = originalText.substring(start, end);
        
        for (const [original, replacement] of Object.entries(SAFE_REWRITES)) {
          if (problematicText.toLowerCase().includes(original.toLowerCase())) {
            const rewrittenText = originalText.replace(new RegExp(original, 'gi'), replacement);
            rewrites.push({
              original: originalText,
              rewritten: rewrittenText,
              explanation: `Replaced "${original}" with "${replacement}" to comply with platform policies`
            });
            break;
          }
        }
      }
    }
  });

  return rewrites;
}

function generateRecommendations(violations: ComplianceViolation[], vertical: string, platform: string): string[] {
  const recommendations: string[] = [];

  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;

  if (errorCount > 0) {
    recommendations.push('Address all error-level violations before publishing');
    recommendations.push('Consider using the suggested safe rewrites');
  }

  if (warningCount > 0) {
    recommendations.push('Review warning-level issues for potential improvements');
  }

  if (vertical === 'health') {
    recommendations.push('Ensure all health claims are substantiated with scientific evidence');
    recommendations.push('Include appropriate FDA disclaimers');
  }

  if (platform === 'meta' || platform === 'all') {
    recommendations.push('Review Facebook Advertising Policies for latest updates');
  }

  if (violations.some(v => v.category === 'trademark')) {
    recommendations.push('Verify trademark usage rights before publishing');
  }

  if (recommendations.length === 0) {
    recommendations.push('Content appears compliant with current policies');
    recommendations.push('Continue monitoring for policy updates');
  }

  return recommendations;
}