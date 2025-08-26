import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface InsightData {
  performanceOverview: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgCPM: number;
    avgCPA: number;
    avgROAS: number;
  };
  topPerformers: Array<{
    id: string;
    name: string;
    format: string;
    angle: string;
    score: number;
    ctr: number;
    conversions: number;
    spend: number;
    roas: number;
  }>;
  anglePerformance: Array<{
    angle: string;
    creatives: number;
    avgCTR: number;
    avgCPA: number;
    totalSpend: number;
    winRate: number;
  }>;
  formatPerformance: Array<{
    format: string;
    creatives: number;
    avgCTR: number;
    avgCPA: number;
    avgScore: number;
  }>;
  fatigueAlerts: Array<{
    id: string;
    name: string;
    currentCTR: number;
    peakCTR: number;
    decline: number;
    daysActive: number;
    recommendation: string;
  }>;
  trendsData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>;
}

const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInsights();
  }, [timeRange]);

  const loadInsights = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockData: InsightData = {
      performanceOverview: {
        totalSpend: 24750,
        totalImpressions: 1847293,
        totalClicks: 52847,
        totalConversions: 2847,
        avgCTR: 2.86,
        avgCPM: 13.40,
        avgCPA: 8.70,
        avgROAS: 4.2
      },
      topPerformers: [
        { id: '1', name: 'Summer Sale - Social Proof', format: 'Static', angle: 'social-proof', score: 92, ctr: 4.7, conversions: 847, spend: 2840, roas: 6.2 },
        { id: '2', name: 'Customer Reviews Video', format: 'Video', angle: 'social-proof', score: 89, ctr: 4.1, conversions: 623, spend: 3200, roas: 5.8 },
        { id: '3', name: 'Limited Time Offer', format: 'Static', angle: 'urgency', score: 87, ctr: 3.9, conversions: 592, spend: 2100, roas: 5.4 },
        { id: '4', name: 'Before/After Results', format: 'Carousel', angle: 'comparison', score: 85, ctr: 3.6, conversions: 478, spend: 1890, roas: 4.9 },
        { id: '5', name: 'Product Demo Story', format: 'Story', angle: 'benefit', score: 82, ctr: 3.2, conversions: 392, spend: 1670, roas: 4.3 }
      ],
      anglePerformance: [
        { angle: 'Social Proof', creatives: 18, avgCTR: 3.8, avgCPA: 7.20, totalSpend: 8900, winRate: 72 },
        { angle: 'Urgency', creatives: 15, avgCTR: 3.4, avgCPA: 8.50, totalSpend: 6700, winRate: 68 },
        { angle: 'Benefit', creatives: 22, avgCTR: 2.9, avgCPA: 9.80, totalSpend: 7200, winRate: 61 },
        { angle: 'Comparison', creatives: 12, avgCTR: 3.1, avgCPA: 9.20, totalSpend: 4800, winRate: 64 },
        { angle: 'Lifestyle', creatives: 14, avgCTR: 2.7, avgCPA: 11.30, totalSpend: 3900, winRate: 57 },
        { angle: 'Problem/Solution', creatives: 11, avgCTR: 2.4, avgCPA: 12.70, totalSpend: 2850, winRate: 52 }
      ],
      formatPerformance: [
        { format: 'Video', creatives: 23, avgCTR: 3.7, avgCPA: 8.20, avgScore: 84 },
        { format: 'Static', creatives: 42, avgCTR: 2.8, avgCPA: 9.40, avgScore: 79 },
        { format: 'Carousel', creatives: 18, avgCTR: 3.1, avgCPA: 8.90, avgScore: 81 },
        { format: 'Story', creatives: 9, avgCTR: 2.9, avgCPA: 10.10, avgScore: 77 }
      ],
      fatigueAlerts: [
        { id: '1', name: 'Holiday Special - Urgency', currentCTR: 1.8, peakCTR: 4.2, decline: 57, daysActive: 14, recommendation: 'Refresh creative with new visuals' },
        { id: '2', name: 'Product Launch Video', currentCTR: 2.1, peakCTR: 3.9, decline: 46, daysActive: 21, recommendation: 'Test new hook or angle' },
        { id: '3', name: 'Customer Testimonial', currentCTR: 1.4, peakCTR: 2.8, decline: 50, daysActive: 18, recommendation: 'Pause and create variant' }
      ],
      trendsData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        impressions: Math.floor(45000 + Math.random() * 20000),
        clicks: Math.floor(1200 + Math.random() * 800),
        conversions: Math.floor(80 + Math.random() * 60),
        spend: Math.floor(600 + Math.random() * 400)
      }))
    };
    
    setInsights(mockData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (num: number) => `${num}%`;

  return (
    <>
      <Head>
        <title>Insights - CreativePilot Pro</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Insights</h1>
              <p className="text-gray-600">Deep dive into your creative performance and optimization opportunities</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(insights?.performanceOverview.totalSpend || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Spend</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatNumber(insights?.performanceOverview.totalImpressions || 0)}
              </div>
              <div className="text-sm text-gray-600">Impressions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {insights?.performanceOverview.avgCTR}%
              </div>
              <div className="text-sm text-gray-600">Avg CTR</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {insights?.performanceOverview.avgROAS}x
              </div>
              <div className="text-sm text-gray-600">Avg ROAS</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'angles', label: 'Angle Analysis' },
                { id: 'formats', label: 'Format Performance' },
                { id: 'fatigue', label: 'Fatigue Alerts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Top Performing Creatives</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creative</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Angle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {insights?.topPerformers.map(creative => (
                        <tr key={creative.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{creative.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {creative.format}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{creative.angle}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">{creative.score}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{creative.ctr}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(creative.conversions)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-indigo-600">{creative.roas}x</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'angles' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Creative Angle Performance</h3>
                <p className="text-sm text-gray-600">Compare how different messaging angles perform</p>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {insights?.anglePerformance.map(angle => (
                    <div key={angle.angle} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{angle.angle}</h4>
                          <p className="text-sm text-gray-600">{angle.creatives} creatives</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{angle.winRate}%</div>
                          <div className="text-xs text-gray-500">Win Rate</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-gray-900">{angle.avgCTR}%</div>
                          <div className="text-gray-500">Avg CTR</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">${angle.avgCPA}</div>
                          <div className="text-gray-500">Avg CPA</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{formatCurrency(angle.totalSpend)}</div>
                          <div className="text-gray-500">Total Spend</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'formats' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Format Performance Comparison</h3>
                <p className="text-sm text-gray-600">See which creative formats work best for your campaigns</p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {insights?.formatPerformance.map(format => (
                    <div key={format.format} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{format.format}</h4>
                          <p className="text-sm text-gray-600">{format.creatives} creatives tested</p>
                        </div>
                        <div className="text-2xl">
                          {format.format === 'Video' && '🎥'}
                          {format.format === 'Static' && '🖼️'}
                          {format.format === 'Carousel' && '📱'}
                          {format.format === 'Story' && '📚'}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg CTR</span>
                          <span className="font-semibold text-indigo-600">{format.avgCTR}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg CPA</span>
                          <span className="font-semibold">${format.avgCPA}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Score</span>
                          <span className="font-semibold text-green-600">{format.avgScore}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fatigue' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Creative Fatigue Alerts</h3>
                <p className="text-sm text-gray-600">Creatives showing signs of performance decline</p>
              </div>
              <div className="p-6">
                {insights?.fatigueAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-gray-600">No fatigue alerts - your creatives are performing well!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights?.fatigueAlerts.map(alert => (
                      <div key={alert.id} className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{alert.name}</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">Current CTR: </span>
                                <span className="font-semibold text-red-600">{alert.currentCTR}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Peak CTR: </span>
                                <span className="font-semibold text-green-600">{alert.peakCTR}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Decline: </span>
                                <span className="font-semibold text-red-600">{alert.decline}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Days Active: </span>
                                <span className="font-semibold">{alert.daysActive}</span>
                              </div>
                            </div>
                            <div className="bg-blue-100 text-blue-800 p-2 rounded text-sm">
                              <strong>Recommendation:</strong> {alert.recommendation}
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                              Refresh
                            </button>
                            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
                              Pause
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default InsightsPage;