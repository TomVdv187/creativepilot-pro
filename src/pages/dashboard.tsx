import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';

interface DashboardMetrics {
  totalCreatives: number;
  activeTests: number;
  avgPerformance: number;
  totalSpend: number;
  impressions: number;
  ctr: number;
  cpa: number;
  roas: number;
}

interface QuickStats {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
  time: string;
  avatar: string;
}

const ProfessionalDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetrics({
        totalCreatives: 1247,
        activeTests: 23,
        avgPerformance: 89.2,
        totalSpend: 45670,
        impressions: 2847291,
        ctr: 3.87,
        cpa: 12.45,
        roas: 4.2
      });
      setLoading(false);
    };
    loadDashboard();
  }, []);

  const quickStats: QuickStats[] = [
    {
      label: 'Total Revenue',
      value: '$189,432',
      change: '+23.5%',
      changeType: 'positive',
      color: 'from-green-400 to-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      label: 'Active Campaigns',
      value: '23',
      change: '+12%',
      changeType: 'positive',
      color: 'from-blue-400 to-indigo-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      label: 'Avg CTR',
      value: '3.87%',
      change: '+5.2%',
      changeType: 'positive',
      color: 'from-purple-400 to-pink-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      label: 'Cost per Action',
      value: '$12.45',
      change: '-8.1%',
      changeType: 'positive',
      color: 'from-orange-400 to-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'success',
      title: 'Campaign "Summer Sale" promoted',
      description: 'Achieved 28% higher CTR than control group',
      time: '2 hours ago',
      avatar: '🚀'
    },
    {
      id: '2',
      type: 'info',
      title: 'New creatives generated',
      description: '12 new variants for skincare campaign',
      time: '4 hours ago',
      avatar: '✨'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Budget alert: Fashion campaign',
      description: '85% of budget spent, performance still strong',
      time: '6 hours ago',
      avatar: '⚠️'
    },
    {
      id: '4',
      type: 'success',
      title: 'A/B test completed',
      description: 'Video variant won with 95% confidence',
      time: '1 day ago',
      avatar: '🏆'
    }
  ];

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - CreativePilot Pro</title>
      </Head>

      <Sidebar>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-sm border-b border-white/20 sticky top-0 z-30">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Welcome back, Tom
                  </h1>
                  <p className="text-gray-600 mt-1">Here's what's happening with your campaigns today.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-white/90 transition-all">
                    Export Data
                  </button>
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                    Generate Creatives
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600 bg-green-100' 
                        : stat.changeType === 'negative'
                        ? 'text-red-600 bg-red-100'
                        : 'text-gray-600 bg-gray-100'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Chart */}
              <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Performance Overview</h3>
                  <div className="flex items-center space-x-2">
                    <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100">7D</button>
                    <button className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg">30D</button>
                    <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100">90D</button>
                  </div>
                </div>

                {/* Simplified Chart Visualization */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Impressions</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">2.84M</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Clicks</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">110.2K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Conversions</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">8.9K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">3.87%</p>
                    <p className="text-sm text-gray-600">CTR</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">$12.45</p>
                    <p className="text-sm text-gray-600">CPA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">4.2x</p>
                    <p className="text-sm text-gray-600">ROAS</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all">
                      <div className="text-2xl">{activity.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{activity.title}</p>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-all">
                  View all activity
                </button>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Performing Creatives */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Creatives</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Summer Sale - Social Proof', ctr: '4.7%', conversions: 847, status: 'active' },
                    { name: 'Product Demo Video', ctr: '4.1%', conversions: 623, status: 'testing' },
                    { name: 'Customer Testimonial', ctr: '3.9%', conversions: 592, status: 'active' },
                    { name: 'Before/After Comparison', ctr: '3.6%', conversions: 478, status: 'paused' }
                  ].map((creative, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600">🎨</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{creative.name}</p>
                          <p className="text-xs text-gray-600">{creative.conversions} conversions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{creative.ctr}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          creative.status === 'active' ? 'bg-green-100 text-green-800' :
                          creative.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {creative.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105">
                    <div className="text-2xl mb-2">✨</div>
                    <div className="text-sm font-semibold">Generate</div>
                    <div className="text-xs opacity-90">New creatives</div>
                  </button>
                  <button className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105">
                    <div className="text-2xl mb-2">🧪</div>
                    <div className="text-sm font-semibold">A/B Test</div>
                    <div className="text-xs opacity-90">Start experiment</div>
                  </button>
                  <button className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105">
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="text-sm font-semibold">Brands</div>
                    <div className="text-xs opacity-90">Manage assets</div>
                  </button>
                  <button className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-semibold">Analytics</div>
                    <div className="text-xs opacity-90">Deep insights</div>
                  </button>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 border border-indigo-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">🚀</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Need help getting started?</p>
                      <p className="text-sm text-gray-600">Check out our guide to maximize performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </>
  );
};

export default ProfessionalDashboard;