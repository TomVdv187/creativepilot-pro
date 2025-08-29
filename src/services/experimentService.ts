import { Experiment, ApiResponse, Guardrail, ExperimentOutcome } from '@/types';
import { ExperimentTemplate } from '@/pages/api/experiments/templates';

export interface ExperimentAnalysis {
  hasWinner: boolean;
  winnerVariant?: string;
  confidence: number;
  significance: number;
  recommendation: 'continue' | 'stop_winner' | 'stop_loser' | 'extend_duration';
  reasoning: string[];
  nextActions: string[];
}

export class ExperimentService {
  private static instance: ExperimentService;
  private apiBase = '/api/experiments';

  static getInstance(): ExperimentService {
    if (!this.instance) {
      this.instance = new ExperimentService();
    }
    return this.instance;
  }

  async getAllExperiments(projectId?: string): Promise<Experiment[]> {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      
      const response = await fetch(`${this.apiBase}?${params}`);
      const result: ApiResponse<Experiment[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch experiments');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching experiments:', error);
      throw error;
    }
  }

  async getExperiment(id: string): Promise<Experiment> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`);
      const result: ApiResponse<Experiment> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch experiment');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching experiment:', error);
      throw error;
    }
  }

  async createExperiment(experimentData: Partial<Experiment>): Promise<Experiment> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experimentData)
      });
      
      const result: ApiResponse<Experiment> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create experiment');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error creating experiment:', error);
      throw error;
    }
  }

  async updateExperiment(id: string, updates: Partial<Experiment>): Promise<Experiment> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      const result: ApiResponse<Experiment> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update experiment');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error updating experiment:', error);
      throw error;
    }
  }

  async deleteExperiment(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'DELETE'
      });
      
      const result: ApiResponse<Experiment> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete experiment');
      }
    } catch (error) {
      console.error('Error deleting experiment:', error);
      throw error;
    }
  }

  async getExperimentTemplates(filters?: {
    category?: string;
    type?: string;
    tags?: string[];
  }): Promise<ExperimentTemplate[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
      
      const response = await fetch(`${this.apiBase}/templates?${params}`);
      const result: ApiResponse<ExperimentTemplate[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch templates');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  analyzeExperiment(experiment: Experiment): ExperimentAnalysis {
    const { outcomes, design, status } = experiment;
    
    if (outcomes.length === 0) {
      return {
        hasWinner: false,
        confidence: 0,
        significance: 1,
        recommendation: 'continue',
        reasoning: ['Insufficient data to analyze'],
        nextActions: ['Wait for more data to collect']
      };
    }

    // Find the best performing variant
    const sortedOutcomes = outcomes.sort((a, b) => {
      // Sort by primary metric (assuming conversion rate or similar)
      const aMetric = a.metrics.conversions / Math.max(a.metrics.clicks, 1);
      const bMetric = b.metrics.conversions / Math.max(b.metrics.clicks, 1);
      return bMetric - aMetric;
    });

    const winner = sortedOutcomes[0];
    const hasSignificantWinner = winner.significance <= design.significanceLevel;
    const confidence = (1 - winner.significance) * 100;

    let recommendation: ExperimentAnalysis['recommendation'] = 'continue';
    const reasoning: string[] = [];
    const nextActions: string[] = [];

    if (hasSignificantWinner && confidence >= 95) {
      recommendation = 'stop_winner';
      reasoning.push(`Winner found with ${confidence.toFixed(1)}% confidence`);
      reasoning.push(`${winner.lift > 0 ? '+' : ''}${winner.lift.toFixed(1)}% lift vs control`);
      nextActions.push('Scale the winning variant');
      nextActions.push('Archive losing variants');
    } else if (confidence >= 90 && confidence < 95) {
      recommendation = 'extend_duration';
      reasoning.push(`Trending winner but needs more data (${confidence.toFixed(1)}% confidence)`);
      nextActions.push('Extend experiment duration by 3-7 days');
      nextActions.push('Monitor for significance threshold');
    } else {
      reasoning.push(`Insufficient confidence (${confidence.toFixed(1)}%)`);
      nextActions.push('Continue collecting data');
      nextActions.push('Check sample size requirements');
    }

    // Check guardrails
    const guardrailViolations = this.checkGuardrails(experiment);
    if (guardrailViolations.length > 0) {
      recommendation = 'stop_loser';
      reasoning.push('Guardrail violations detected');
      nextActions.push('Review and adjust targeting or creative');
    }

    return {
      hasWinner: hasSignificantWinner,
      winnerVariant: hasSignificantWinner ? winner.variant : undefined,
      confidence,
      significance: winner.significance,
      recommendation,
      reasoning,
      nextActions
    };
  }

  checkGuardrails(experiment: Experiment): Array<{ guardrail: Guardrail; violation: string }> {
    const violations: Array<{ guardrail: Guardrail; violation: string }> = [];

    experiment.guardrails.forEach(guardrail => {
      experiment.outcomes.forEach(outcome => {
        const metricValue = outcome.metrics[guardrail.metric];
        if (metricValue === undefined) return;

        let violated = false;
        let violationMessage = '';

        switch (guardrail.operator) {
          case 'greater_than':
            if (typeof guardrail.value === 'number' && metricValue <= guardrail.value) {
              violated = true;
              violationMessage = `${guardrail.metric} (${metricValue}) is not greater than ${guardrail.value}`;
            }
            break;
          case 'less_than':
            if (typeof guardrail.value === 'number' && metricValue >= guardrail.value) {
              violated = true;
              violationMessage = `${guardrail.metric} (${metricValue}) is not less than ${guardrail.value}`;
            }
            break;
          case 'between':
            if (Array.isArray(guardrail.value)) {
              const [min, max] = guardrail.value;
              if (metricValue < min || metricValue > max) {
                violated = true;
                violationMessage = `${guardrail.metric} (${metricValue}) is not between ${min} and ${max}`;
              }
            }
            break;
        }

        if (violated) {
          violations.push({
            guardrail,
            violation: violationMessage
          });
        }
      });
    });

    return violations;
  }

  calculateSampleSize(
    baselineRate: number, 
    minimumDetectableEffect: number, 
    power: number = 0.8, 
    significanceLevel: number = 0.05
  ): number {
    // Simplified sample size calculation
    // In production, use proper statistical libraries
    
    const alpha = significanceLevel;
    const beta = 1 - power;
    
    // Z-scores for alpha/2 and beta
    const zAlpha = 1.96; // for alpha = 0.05
    const zBeta = 0.84;  // for beta = 0.2 (power = 0.8)
    
    const p1 = baselineRate;
    const p2 = baselineRate * (1 + minimumDetectableEffect);
    const pooledP = (p1 + p2) / 2;
    
    const numerator = Math.pow(zAlpha * Math.sqrt(2 * pooledP * (1 - pooledP)) + 
                              zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  }

  async startExperiment(id: string): Promise<Experiment> {
    return this.updateExperiment(id, { 
      status: 'running',
      updatedAt: new Date()
    });
  }

  async pauseExperiment(id: string): Promise<Experiment> {
    return this.updateExperiment(id, { 
      status: 'paused',
      updatedAt: new Date()
    });
  }

  async stopExperiment(id: string): Promise<Experiment> {
    return this.updateExperiment(id, { 
      status: 'completed',
      updatedAt: new Date()
    });
  }

  generateExperimentReport(experiment: Experiment): {
    summary: string;
    keyMetrics: Record<string, any>;
    recommendations: string[];
    charts: Array<{ type: string; data: any; title: string }>;
  } {
    const analysis = this.analyzeExperiment(experiment);
    
    return {
      summary: `Experiment "${experiment.id}" ran for ${experiment.design.duration} days with ${experiment.variants.length} variants. ${analysis.hasWinner ? `Winner identified: ${analysis.winnerVariant}` : 'No clear winner yet'}.`,
      keyMetrics: {
        totalImpressions: experiment.outcomes.reduce((sum, o) => sum + (o.metrics.impressions || 0), 0),
        totalClicks: experiment.outcomes.reduce((sum, o) => sum + (o.metrics.clicks || 0), 0),
        totalConversions: experiment.outcomes.reduce((sum, o) => sum + (o.metrics.conversions || 0), 0),
        totalSpend: experiment.outcomes.reduce((sum, o) => sum + (o.metrics.spend || 0), 0),
        confidence: analysis.confidence,
        significance: analysis.significance
      },
      recommendations: analysis.nextActions,
      charts: [
        {
          type: 'bar',
          title: 'Conversion Rate by Variant',
          data: experiment.outcomes.map(o => ({
            variant: o.variant,
            conversionRate: (o.metrics.conversions / Math.max(o.metrics.clicks, 1)) * 100
          }))
        },
        {
          type: 'line',
          title: 'CPA Trend',
          data: experiment.outcomes.map(o => ({
            variant: o.variant,
            cpa: o.metrics.cpa
          }))
        }
      ]
    };
  }
}