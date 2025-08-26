import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';

interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  type: 'ab_test' | 'multivariate' | 'holdout';
  variants: Array<{
    id: string;
    name: string;
    traffic: number;
    performance: {
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      cpa: number;
    };
    isWinner?: boolean;
  }>;
  results?: {
    winner: string;
    confidence: number;
    lift: number;
    significance: number;
  };
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
}

const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockExperiments: Experiment[] = [
      {
        id: '1',
        name: 'Summer Campaign - Headline Test',
        status: 'running',
        type: 'ab_test',
        startDate: '2024-01-20',
        budget: 2000,
        spent: 847,
        variants: [
          {
            id: 'a',
            name: 'Control - "Save 20% Today"',
            traffic: 50,
            performance: {
              impressions: 15420,
              clicks: 617,
              conversions: 31,
              ctr: 4.0,
              cpa: 13.60
            }
          },
          {
            id: 'b', 
            name: 'Variant - "Limited Time: 20% Off"',
            traffic: 50,
            performance: {
              impressions: 15280,
              clicks: 734,
              conversions: 42,
              ctr: 4.8,
              cpa: 10.20
            },
            isWinner: true
          }
        ]
      },
      {
        id: '2',
        name: 'Product Demo Video vs Static',
        status: 'completed',
        type: 'ab_test',
        startDate: '2024-01-10',
        endDate: '2024-01-18',
        budget: 1500,
        spent: 1500,
        results: {
          winner: 'Video Version',
          confidence: 95,
          lift: 28,
          significance: 0.02
        },
        variants: [
          {
            id: 'a',
            name: 'Static Image',
            traffic: 50,
            performance: {
              impressions: 12500,
              clicks: 350,
              conversions: 18,
              ctr: 2.8,
              cpa: 41.70
            }
          },
          {
            id: 'b',
            name: 'Video Version', 
            traffic: 50,
            performance: {
              impressions: 12800,
              clicks: 512,
              conversions: 26,
              ctr: 4.0,
              cpa: 28.80
            },
            isWinner: true
          }
        ]
      },
      {
        id: '3',
        name: 'Audience Targeting Test',
        status: 'draft',
        type: 'multivariate',
        startDate: '2024-01-25',
        budget: 3000,
        spent: 0,
        variants: [
          {
            id: 'a',
            name: 'Broad Audience',
            traffic: 33.3,
            performance: {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              ctr: 0,
              cpa: 0
            }
          },
          {
            id: 'b',
            name: 'Lookalike 1%',
            traffic: 33.3,
            performance: {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              ctr: 0,
              cpa: 0
            }
          },
          {
            id: 'c',
            name: 'Interest-Based',
            traffic: 33.4,
            performance: {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              ctr: 0,
              cpa: 0
            }
          }
        ]
      }
    ];
    
    setExperiments(mockExperiments);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ab_test': return '🅰️🅱️';
      case 'multivariate': return '📊';
      case 'holdout': return '🎯';
      default: return '🧪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading experiments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>A/B Tests - CreativePilot Pro</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">A/B Tests & Experiments</h1>
              <p className="text-gray-600 mt-2">Test, optimize, and scale your best-performing creatives</p>
            </div>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
              + Create Experiment
            </button>
          </div>

          {/* Experiments List */}
          <div className="space-y-6">
            {experiments.map((experiment) => (
              <div key={experiment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Experiment Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getTypeIcon(experiment.type)}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{experiment.name}</h3>
                        <p className="text-sm text-gray-600">
                          Started: {experiment.startDate}
                          {experiment.endDate && ` • Ended: ${experiment.endDate}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(experiment.status)}`}>
                        {experiment.status}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Budget</div>
                        <div className="font-semibold">${experiment.spent.toLocaleString()} / ${experiment.budget.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Summary (if completed) */}
                {experiment.results && (
                  <div className="px-6 py-4 bg-green-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div>
                          <div className="text-sm text-green-600 font-medium">Winner</div>
                          <div className="font-bold text-green-800">{experiment.results.winner}</div>
                        </div>
                        <div>
                          <div className="text-sm text-green-600">Confidence</div>
                          <div className="font-bold text-green-800">{experiment.results.confidence}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-green-600">Lift</div>
                          <div className="font-bold text-green-800">+{experiment.results.lift}%</div>
                        </div>
                      </div>
                      <div className="text-2xl">🏆</div>
                    </div>
                  </div>
                )}

                {/* Variants Performance */}
                <div className="p-6">
                  <div className="grid gap-4">
                    {experiment.variants.map((variant) => (
                      <div 
                        key={variant.id} 
                        className={`p-4 rounded-xl border-2 transition-all ${
                          variant.isWinner 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              variant.id === 'a' ? 'bg-blue-500' : 
                              variant.id === 'b' ? 'bg-purple-500' : 'bg-orange-500'
                            }`}></div>
                            <h4 className="font-semibold text-gray-900">{variant.name}</h4>
                            <span className="text-sm text-gray-500">{variant.traffic}% traffic</span>
                            {variant.isWinner && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Winner 🏆
                              </span>
                            )}
                          </div>
                        </div>

                        {experiment.status !== 'draft' && (
                          <div className="grid grid-cols-5 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {variant.performance.impressions.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Impressions</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {variant.performance.clicks.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Clicks</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {variant.performance.conversions}
                              </div>
                              <div className="text-xs text-gray-500">Conversions</div>
                            </div>
                            <div>
                              <div className={`text-lg font-bold ${
                                variant.isWinner ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {variant.performance.ctr}%
                              </div>
                              <div className="text-xs text-gray-500">CTR</div>
                            </div>
                            <div>
                              <div className={`text-lg font-bold ${
                                variant.isWinner ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                ${variant.performance.cpa}
                              </div>
                              <div className="text-xs text-gray-500">CPA</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      {experiment.status === 'running' && (
                        <>
                          <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors">
                            Pause Test
                          </button>
                          <button className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                            Stop Test
                          </button>
                        </>
                      )}
                      {experiment.status === 'draft' && (
                        <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                          Start Test
                        </button>
                      )}
                      {experiment.status === 'completed' && experiment.results && (
                        <button className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors">
                          Scale Winner
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-gray-600 p-2">
                        📊 View Details
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-2">
                        ⚙️ Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {experiments.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No experiments yet</h3>
              <p className="text-gray-600 mb-6">Create your first A/B test to optimize creative performance</p>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold">
                Create Your First Experiment
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ExperimentsPage;