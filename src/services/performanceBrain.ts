import { PerformanceScore, Creative, Experiment } from '@/types';

export class PerformanceBrainService {
  private static instance: PerformanceBrainService;
  private modelVersion = '1.0.0';
  private lastBacktestRun: Date | null = null;

  static getInstance(): PerformanceBrainService {
    if (!this.instance) {
      this.instance = new PerformanceBrainService();
    }
    return this.instance;
  }

  async scoreCreatives(creatives: Creative[], context: {
    projectId: string;
    audience: string;
    placement: string;
    objective: string;
  }): Promise<PerformanceScore[]> {
    const scores = await Promise.all(
      creatives.map(creative => this.scoreCreative(creative, context))
    );

    // Log scoring event for model improvement
    await this.logScoringEvent(creatives, scores, context);

    return scores;
  }

  async scoreCreative(creative: Creative, context: any): Promise<PerformanceScore> {
    try {
      // Extract features from creative
      const features = await this.extractCreativeFeatures(creative);
      
      // Get historical performance data for similar creatives
      const historicalData = await this.getHistoricalData(context);
      
      // Run through ML model
      const modelOutput = await this.runModel(features, historicalData, context);
      
      // Calculate uncertainty based on feature similarity to training data
      const uncertainty = this.calculateUncertainty(features, historicalData);
      
      // Generate explanations
      const reasons = this.generateReasons(modelOutput, features, context);
      const tips = this.generateImprovementTips(modelOutput, features, context);

      return {
        score: Math.round(modelOutput.score),
        uncertainty: Math.round(uncertainty),
        winProbability: modelOutput.winProbability,
        reasons,
        improvementTips: tips,
        confidence: uncertainty < 10 ? 'high' : uncertainty < 20 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Error scoring creative:', error);
      return this.getFallbackScore();
    }
  }

  async runBacktest(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    driftDetected: boolean;
  }> {
    console.log('Running nightly backtest...');
    
    // Get recent experiments with results
    const experiments = await this.getRecentExperiments();
    
    // Compare predictions vs actual results
    const results = experiments.map(exp => {
      const predicted = exp.variants.map(v => v.score?.score || 0);
      const actual = exp.outcomes.map(o => o.metrics.ctr || 0);
      
      return this.calculatePredictionAccuracy(predicted, actual);
    });

    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    const precision = results.reduce((sum, r) => sum + r.precision, 0) / results.length;
    const recall = results.reduce((sum, r) => sum + r.recall, 0) / results.length;

    // Detect model drift
    const driftDetected = avgAccuracy < 0.65 || this.detectFeatureDrift();

    this.lastBacktestRun = new Date();

    return {
      accuracy: Math.round(avgAccuracy * 100) / 100,
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
      driftDetected
    };
  }

  async retrainModel(): Promise<void> {
    console.log('Retraining performance model...');
    
    // In production, this would:
    // 1. Collect recent training data
    // 2. Retrain the ML model
    // 3. Validate on holdout set
    // 4. Deploy new model version
    // 5. Update model metadata
    
    this.modelVersion = `1.0.${Date.now()}`;
    console.log(`Model retrained. New version: ${this.modelVersion}`);
  }

  private async extractCreativeFeatures(creative: Creative): Promise<any> {
    // In production, this would extract:
    // - Visual features: colors, composition, faces, text areas
    // - Text features: sentiment, readability, length, keywords
    // - Brand features: logo presence, brand color usage
    // - Format features: aspect ratio, file size, duration
    
    return {
      hasHumanFaces: Math.random() > 0.5,
      dominantColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      textDensity: Math.random() * 0.3,
      brandColorUsage: Math.random(),
      aspectRatio: creative.format === 'story' ? 9/16 : 16/9,
      textSentiment: Math.random() * 2 - 1, // -1 to 1
      hasCallToAction: Math.random() > 0.3,
      visualComplexity: Math.random(),
      format: creative.format
    };
  }

  private async getHistoricalData(context: any): Promise<any> {
    // In production, this would query database for:
    // - Similar audience performance
    // - Placement-specific metrics
    // - Seasonal/temporal patterns
    // - Industry benchmarks
    
    return {
      avgCTR: 0.02 + Math.random() * 0.03,
      avgCPM: 10 + Math.random() * 20,
      topPerformingFeatures: ['hasHumanFaces', 'hasCallToAction'],
      seasonalMultiplier: 1.0 + (Math.random() - 0.5) * 0.2
    };
  }

  private async runModel(features: any, historical: any, context: any): Promise<any> {
    // Simplified model simulation
    let score = 50; // Base score
    
    // Feature-based adjustments
    if (features.hasHumanFaces) score += 10;
    if (features.hasCallToAction) score += 8;
    if (features.textDensity < 0.2) score += 5; // Not too text-heavy
    if (features.visualComplexity > 0.7) score -= 5; // Too complex
    
    // Context adjustments
    if (context.placement === 'facebook_feed') score += 3;
    if (context.objective === 'conversions') score += 2;
    
    // Historical performance adjustment
    score *= historical.seasonalMultiplier;
    
    // Add some noise
    score += (Math.random() - 0.5) * 10;
    
    // Constrain to 0-100
    score = Math.max(0, Math.min(100, score));
    
    const winProbability = Math.min(0.95, Math.max(0.05, score / 100 + (Math.random() - 0.5) * 0.2));
    
    return { score, winProbability };
  }

  private calculateUncertainty(features: any, historical: any): number {
    // Higher uncertainty for:
    // - Novel feature combinations
    // - Limited historical data
    // - High variance in similar creatives
    
    let uncertainty = 15; // Base uncertainty
    
    if (historical.sampleSize < 100) uncertainty += 10;
    if (features.visualComplexity > 0.8) uncertainty += 5;
    if (!features.hasHumanFaces && historical.topPerformingFeatures.includes('hasHumanFaces')) {
      uncertainty += 8;
    }
    
    return Math.min(30, uncertainty);
  }

  private generateReasons(modelOutput: any, features: any, context: any): string[] {
    const reasons = [];
    
    if (features.hasHumanFaces) {
      reasons.push("Human faces detected, which typically increase engagement");
    }
    
    if (features.hasCallToAction) {
      reasons.push("Clear call-to-action present, driving user action");
    }
    
    if (features.textDensity < 0.15) {
      reasons.push("Optimal text density for visual impact");
    }
    
    if (modelOutput.score > 70) {
      reasons.push("Strong alignment with historical top performers");
    }
    
    return reasons.slice(0, 3);
  }

  private generateImprovementTips(modelOutput: any, features: any, context: any): string[] {
    const tips = [];
    
    if (!features.hasCallToAction) {
      tips.push("Add a clear call-to-action button to drive conversions");
    }
    
    if (features.textDensity > 0.25) {
      tips.push("Reduce text density for better visual impact");
    }
    
    if (!features.hasHumanFaces && context.audience === 'broad') {
      tips.push("Consider adding human elements for broader audience appeal");
    }
    
    if (features.visualComplexity > 0.8) {
      tips.push("Simplify visual elements to reduce cognitive load");
    }
    
    if (modelOutput.score < 60) {
      tips.push("Test with different color schemes aligned with your brand");
    }
    
    return tips.slice(0, 3);
  }

  private getFallbackScore(): PerformanceScore {
    return {
      score: 50,
      uncertainty: 25,
      winProbability: 0.5,
      reasons: ["Unable to analyze creative - using baseline score"],
      improvementTips: ["Please try again or contact support"],
      confidence: 'low'
    };
  }

  private async getRecentExperiments(): Promise<Experiment[]> {
    // In production, query database for experiments with results
    return [];
  }

  private calculatePredictionAccuracy(predicted: number[], actual: number[]): any {
    // Simplified accuracy calculation
    // In production, this would be more sophisticated
    return {
      accuracy: 0.7 + Math.random() * 0.2,
      precision: 0.65 + Math.random() * 0.25,
      recall: 0.6 + Math.random() * 0.3
    };
  }

  private detectFeatureDrift(): boolean {
    // In production, this would detect if feature distributions
    // have changed significantly from training data
    return Math.random() < 0.1; // 10% chance of drift detected
  }

  private async logScoringEvent(creatives: Creative[], scores: PerformanceScore[], context: any): Promise<void> {
    // Log for model improvement and monitoring
    console.log('Scored creatives:', {
      count: creatives.length,
      avgScore: scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
      context: context.placement
    });
  }
}