import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface DashboardStats {
  totalCreatives: number;
  activeTests: number;
  avgWinRate: number;
  totalImpressions: number;
  avgCTR: number;
  avgCPA: number;
  bestPerformer: {
    name: string;
    ctr: number;
    improvement: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'generated' | 'tested' | 'paused' | 'promoted';
    name: string;
    time: string;
    metric?: string;
  }>;
  topCreatives: Array<{
    id: string;
    name: string;
    format: string;
    score: number;
    ctr: number;
    impressions: number;
    status: 'active' | 'paused' | 'winner';
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Simulate API call
    const loadDashboard = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic mock data
      const mockStats: DashboardStats = {
        totalCreatives: 247,
        activeTests: 12,
        avgWinRate: 68,
        totalImpressions: 1247893,
        avgCTR: 2.34,
        avgCPA: 12.45,
        bestPerformer: {
          name: 'Summer Sale - Benefit Angle',
          ctr: 3.7,
          improvement: 22
        },
        recentActivity: [
          { id: '1', type: 'promoted', name: 'Black Friday Special', time: '2 hours ago', metric: '+28% CTR' },
          { id: '2', type: 'generated', name: 'New Product Launch', time: '4 hours ago' },
          { id: '3', type: 'tested', name: 'Holiday Campaign', time: '6 hours ago', metric: 'A/B Test Started' },
          { id: '4', type: 'paused', name: 'Outdated Promo', time: '1 day ago', metric: 'High CPA' },
          { id: '5', type: 'promoted', name: 'Customer Testimonial', time: '2 days ago', metric: '+15% CTR' }
        ],
        topCreatives: [
          { id: '1', name: 'Summer Sale - Social Proof', format: 'Static', score: 92, ctr: 3.7, impressions: 45672, status: 'winner' },
          { id: '2', name: 'Product Demo Video', format: 'Video', score: 89, ctr: 3.2, impressions: 62341, status: 'active' },
          { id: '3', name: 'Customer Review Carousel', format: 'Carousel', score: 85, ctr: 2.9, impressions: 38291, status: 'active' },
          { id: '4', name: 'Before/After Story', format: 'Story', score: 82, ctr: 2.8, impressions: 29847, status: 'active' },
          { id: '5', name: 'Urgency Limited Time', format: 'Static', score: 78, ctr: 2.4, impressions: 51203, status: 'paused' }
        ]
      };
      
      setStats(mockStats);
      setLoading(false);
    };

    loadDashboard();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'promoted': return '🚀';
      case 'generated': return '✨';
      case 'tested': return '🧪';
      case 'paused': return '⏸️';
      default: return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winner': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - CreativePilot Pro</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with time range selector */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Monitor your creative performance and campaigns</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">🎨</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Creatives</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCreatives}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">🧪</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeTests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Win Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.avgWinRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalImpressions.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average CTR</span>
                  <span className="text-lg font-semibold text-green-600">{stats?.avgCTR}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average CPA</span>
                  <span className="text-lg font-semibold text-blue-600">${stats?.avgCPA}</span>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Best Performer</div>
                  <div className="text-sm text-green-700">{stats?.bestPerformer.name}</div>
                  <div className="text-xs text-green-600">+{stats?.bestPerformer.improvement}% vs baseline</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {stats?.recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    {activity.metric && (
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {activity.metric}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Creatives */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Top Performing Creatives</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creative
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.topCreatives.map(creative => (
                    <tr key={creative.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{creative.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {creative.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">{creative.score}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{creative.ctr}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{creative.impressions.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(creative.status)}`}>
                          {creative.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Link href="/insights" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                View detailed insights →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Link href="/generate" className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors">
              <div className="text-lg font-semibold">Generate Creatives</div>
              <div className="text-sm opacity-90">Create new ad variants</div>
            </Link>
            <Link href="/projects" className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
              <div className="text-lg font-semibold">Manage Projects</div>
              <div className="text-sm opacity-90">Organize campaigns</div>
            </Link>
            <Link href="/insights" className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
              <div className="text-lg font-semibold">View Insights</div>
              <div className="text-sm opacity-90">Analyze performance</div>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;