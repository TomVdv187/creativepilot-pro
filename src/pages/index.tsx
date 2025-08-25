import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>CreativePilot Pro - Performance-First AI Studio</title>
        <meta name="description" content="Predict, generate, and ship creatives that win, with proof." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">CreativePilot Pro</h1>
              </div>
              <nav className="flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/projects" className="text-gray-600 hover:text-gray-900">
                  Projects
                </Link>
                <Link href="/experiments" className="text-gray-600 hover:text-gray-900">
                  Experiments
                </Link>
                <Link href="/insights" className="text-gray-600 hover:text-gray-900">
                  Insights
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Performance-First AI Studio
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Predict, generate, and ship creatives that win, with proof. 
              Outperform AdCreative.ai on quality, prediction accuracy, and enterprise controls.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/demo" 
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {/* Performance Brain */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Performance Brain</h3>
              <p className="text-gray-600 text-sm">
                Model-based preflight scoring with continuous back-testing and win-probability predictions.
              </p>
            </div>

            {/* Experiment Automation */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧪</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Experiment Automation</h3>
              <p className="text-gray-600 text-sm">
                Auto-design A/B tests, enforce guardrails, and promote winners with intelligent automation.
              </p>
            </div>

            {/* Creative OS */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Creative OS</h3>
              <p className="text-gray-600 text-sm">
                Multi-format generation with brand kit enforcement and catalog overlays across all outputs.
              </p>
            </div>

            {/* Compliance Cop */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Compliance Cop</h3>
              <p className="text-gray-600 text-sm">
                Platform policy linting and one-click safe rewrites for regulated verticals.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Built for Performance
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">+20%</div>
                <div className="text-gray-600">Average CTR Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">-15%</div>
                <div className="text-gray-600">CPA Reduction</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">70%</div>
                <div className="text-gray-600">Win Rate vs. Control</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">CreativePilot Pro</h3>
                <p className="text-gray-400 text-sm">
                  Performance-first AI studio for ads and social media.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/features">Features</Link></li>
                  <li><Link href="/pricing">Pricing</Link></li>
                  <li><Link href="/integrations">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/docs">Documentation</Link></li>
                  <li><Link href="/guides">Guides</Link></li>
                  <li><Link href="/api">API Reference</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/about">About</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/privacy">Privacy</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              © 2025 CreativePilot Pro. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;