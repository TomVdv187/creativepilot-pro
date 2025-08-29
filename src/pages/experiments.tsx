import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import { ExperimentService, ExperimentAnalysis } from '@/services/experimentService';
import { ExperimentTemplate } from '@/pages/api/experiments/templates';
import { Experiment } from '@/types';

const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [templates, setTemplates] = useState<ExperimentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExperimentTemplate | null>(null);
  const [analysisData, setAnalysisData] = useState<Record<string, ExperimentAnalysis>>({});
  
  const experimentService = ExperimentService.getInstance();

  useEffect(() => {
    loadExperiments();
    loadTemplates();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      const experimentsData = await experimentService.getAllExperiments();
      setExperiments(experimentsData);

      // Analyze each experiment
      const analyses: Record<string, ExperimentAnalysis> = {};
      experimentsData.forEach(exp => {
        analyses[exp.id] = experimentService.analyzeExperiment(exp);
      });
      setAnalysisData(analyses);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = await experimentService.getExperimentTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const createExperimentFromTemplate = async (template: ExperimentTemplate) => {
    try {
      const experimentData = {
        projectId: 'proj_1', // In production, get from context
        design: {
          type: template.type,
          minSampleSize: template.config.minSampleSize,
          power: template.config.power,
          significanceLevel: template.config.significanceLevel,
          duration: template.config.duration
        },
        variants: [], // Would be populated based on template
        budgets: [
          {
            platform: 'meta',
            amount: 1000,
            currency: 'USD',
            dailyCap: 100
          }
        ],
        guardrails: template.guardrails
      };

      const newExperiment = await experimentService.createExperiment(experimentData);
      setExperiments(prev => [newExperiment, ...prev]);
      setShowTemplatesModal(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to create experiment:', error);
      alert('Failed to create experiment. Please try again.');
    }
  };

  const updateExperimentStatus = async (id: string, action: 'start' | 'pause' | 'stop') => {
    try {
      let updatedExperiment: Experiment;
      
      switch (action) {
        case 'start':
          updatedExperiment = await experimentService.startExperiment(id);
          break;
        case 'pause':
          updatedExperiment = await experimentService.pauseExperiment(id);
          break;
        case 'stop':
          updatedExperiment = await experimentService.stopExperiment(id);
          break;
      }

      setExperiments(prev => prev.map(exp => 
        exp.id === id ? updatedExperiment : exp
      ));
    } catch (error) {
      console.error(`Failed to ${action} experiment:`, error);
      alert(`Failed to ${action} experiment. Please try again.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'creative_ab': return '🅰️🅱️';
      case 'angle_test': return '📊';
      case 'geo_holdout': return '🌍';
      default: return '🧪';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'stop_winner': return 'text-green-600 bg-green-50 border-green-200';
      case 'stop_loser': return 'text-red-600 bg-red-50 border-red-200';
      case 'extend_duration': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading experiments...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <>
      <Head>
        <title>Experiment Designer - CreativePilot Pro</title>
      </Head>

      <Sidebar>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Experiment Designer</h1>
                <p className="text-gray-600 mt-2">Design, run, and analyze A/B tests with automated guardrails and statistical significance</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTemplatesModal(true)}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold border-2 border-indigo-200 hover:bg-indigo-50 transition-all"
                >
                  📋 Use Template
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  + Custom Experiment
                </button>
              </div>
            </div>

            {/* Experiments List */}
            <div className="space-y-6">
              {experiments.map((experiment) => {
                const analysis = analysisData[experiment.id];
                return (
                  <div key={experiment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Experiment Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getTypeIcon(experiment.design.type)}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{experiment.id}</h3>
                            <p className="text-sm text-gray-600">
                              {experiment.design.type.replace('_', ' ').toUpperCase()} • {experiment.design.duration} days • {experiment.variants.length} variants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(experiment.status)}`}>
                            {experiment.status}
                          </span>
                          {experiment.budgets.length > 0 && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Budget</div>
                              <div className="font-semibold">${experiment.budgets[0].amount.toLocaleString()}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {analysis && (
                      <div className={`px-6 py-4 border-b border-gray-100 ${getRecommendationColor(analysis.recommendation)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div>
                              <div className="text-sm font-medium">AI Recommendation</div>
                              <div className="font-bold capitalize">{analysis.recommendation.replace('_', ' ')}</div>
                            </div>
                            <div>
                              <div className="text-sm">Confidence</div>
                              <div className="font-bold">{analysis.confidence.toFixed(1)}%</div>
                            </div>
                            {analysis.hasWinner && (
                              <div>
                                <div className="text-sm">Winner</div>
                                <div className="font-bold">{analysis.winnerVariant}</div>
                              </div>
                            )}
                          </div>
                          <div className="text-2xl">
                            {analysis.recommendation === 'stop_winner' ? '🏆' : 
                             analysis.recommendation === 'stop_loser' ? '⚠️' : 
                             analysis.recommendation === 'extend_duration' ? '⏱️' : '📊'}
                          </div>
                        </div>
                        {analysis.reasoning.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm">
                              <strong>Reasoning:</strong> {analysis.reasoning.join('. ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Experiment Config */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm text-gray-600">Min Sample Size</div>
                          <div className="font-semibold">{experiment.design.minSampleSize.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Statistical Power</div>
                          <div className="font-semibold">{(experiment.design.power * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Significance Level</div>
                          <div className="font-semibold">{(experiment.design.significanceLevel * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Guardrails</div>
                          <div className="font-semibold">{experiment.guardrails.length} active</div>
                        </div>
                      </div>
                    </div>

                    {/* Variants Performance */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Variant Performance</h4>
                      <div className="grid gap-4">
                        {experiment.outcomes.map((outcome) => (
                          <div 
                            key={outcome.variant} 
                            className={`p-4 rounded-xl border-2 transition-all ${
                              outcome.decision === 'winner' 
                                ? 'border-green-300 bg-green-50' 
                                : outcome.decision === 'loser'
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  outcome.decision === 'winner' ? 'bg-green-500' : 
                                  outcome.decision === 'loser' ? 'bg-red-500' : 'bg-gray-400'
                                }`}></div>
                                <h5 className="font-semibold text-gray-900">{outcome.variant}</h5>
                                {outcome.decision === 'winner' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Winner 🏆
                                  </span>
                                )}
                                {outcome.lift !== 0 && (
                                  <span className={`text-sm font-medium ${outcome.lift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {outcome.lift > 0 ? '+' : ''}{outcome.lift.toFixed(1)}% lift
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  {outcome.metrics.impressions?.toLocaleString() || '0'}
                                </div>
                                <div className="text-xs text-gray-500">Impressions</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  {outcome.metrics.clicks?.toLocaleString() || '0'}
                                </div>
                                <div className="text-xs text-gray-500">Clicks</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  {outcome.metrics.conversions || 0}
                                </div>
                                <div className="text-xs text-gray-500">Conversions</div>
                              </div>
                              <div>
                                <div className={`text-lg font-bold ${
                                  outcome.decision === 'winner' ? 'text-green-600' : 'text-gray-900'
                                }`}>
                                  {outcome.metrics.ctr?.toFixed(1) || '0.0'}%
                                </div>
                                <div className="text-xs text-gray-500">CTR</div>
                              </div>
                              <div>
                                <div className={`text-lg font-bold ${
                                  outcome.decision === 'winner' ? 'text-green-600' : 'text-gray-900'
                                }`}>
                                  ${outcome.metrics.cpa?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-xs text-gray-500">CPA</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  ${outcome.metrics.spend?.toFixed(0) || '0'}
                                </div>
                                <div className="text-xs text-gray-500">Spend</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          {experiment.status === 'running' && (
                            <>
                              <button
                                onClick={() => updateExperimentStatus(experiment.id, 'pause')}
                                className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                              >
                                ⏸️ Pause
                              </button>
                              <button
                                onClick={() => updateExperimentStatus(experiment.id, 'stop')}
                                className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                              >
                                ⏹️ Stop
                              </button>
                            </>
                          )}
                          {experiment.status === 'draft' && (
                            <button
                              onClick={() => updateExperimentStatus(experiment.id, 'start')}
                              className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              ▶️ Start
                            </button>
                          )}
                          {experiment.status === 'paused' && (
                            <button
                              onClick={() => updateExperimentStatus(experiment.id, 'start')}
                              className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              ▶️ Resume
                            </button>
                          )}
                          {experiment.status === 'completed' && analysis?.hasWinner && (
                            <button className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors">
                              🚀 Scale Winner
                            </button>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-gray-600 p-2">
                            📊 Full Report
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-2">
                            ⚙️ Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {experiments.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🧪</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No experiments yet</h3>
                <p className="text-gray-600 mb-6">Create your first experiment to start optimizing creative performance with statistical rigor</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowTemplatesModal(true)}
                    className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold border-2 border-indigo-200 hover:bg-indigo-50"
                  >
                    📋 Browse Templates
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold"
                  >
                    Create Custom Experiment
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Templates Modal */}
          {showTemplatesModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Experiment Templates</h3>
                    <button
                      onClick={() => setShowTemplatesModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-medium">{template.config.duration} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Min Sample:</span>
                            <span className="font-medium">{template.config.minSampleSize.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Guardrails:</span>
                            <span className="font-medium">{template.guardrails.length}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Detail Modal */}
          {selectedTemplate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{selectedTemplate.name}</h3>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-semibold mb-3">Configuration</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{selectedTemplate.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{selectedTemplate.config.duration} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min Sample Size:</span>
                          <span className="font-medium">{selectedTemplate.config.minSampleSize.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Statistical Power:</span>
                          <span className="font-medium">{(selectedTemplate.config.power * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Significance Level:</span>
                          <span className="font-medium">{(selectedTemplate.config.significanceLevel * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Guardrails</h4>
                      <div className="space-y-2">
                        {selectedTemplate.guardrails.map((guardrail, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                            <div className="font-medium">{guardrail.metric} {guardrail.operator} {typeof guardrail.value === 'number' ? guardrail.value : guardrail.value.join('-')}</div>
                            <div className="text-gray-600">Action: {guardrail.action}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold mb-3">Use Cases</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedTemplate.useCases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map(tag => (
                        <span key={tag} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="bg-gray-100 text-gray-700 py-2 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => createExperimentFromTemplate(selectedTemplate)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                      >
                        Create Experiment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Sidebar>
    </>
  );
};

export default ExperimentsPage;