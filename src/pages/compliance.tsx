import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import { ComplianceService, ComplianceCheckParams } from '@/services/complianceService';
import { ComplianceResult, ComplianceViolation } from '@/pages/api/compliance/lint';
import { PolicyPack } from '@/pages/api/compliance/policies';

const CompliancePage: React.FC = () => {
  const [content, setContent] = useState({
    headline: '',
    body: '',
    cta: ''
  });
  const [platform, setPlatform] = useState<'meta' | 'google' | 'linkedin' | 'all'>('all');
  const [vertical, setVertical] = useState('general');
  const [region, setRegion] = useState('US');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [policyPacks, setPolicyPacks] = useState<PolicyPack[]>([]);
  const [selectedPolicyPack, setSelectedPolicyPack] = useState<PolicyPack | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  
  const complianceService = ComplianceService.getInstance();

  useEffect(() => {
    loadPolicyPacks();
  }, []);

  const loadPolicyPacks = async () => {
    try {
      const packs = await complianceService.getPolicyPacks();
      setPolicyPacks(packs);
    } catch (error) {
      console.error('Failed to load policy packs:', error);
    }
  };

  const handleComplianceCheck = async () => {
    if (!content.headline && !content.body && !content.cta) {
      alert('Please enter some content to check');
      return;
    }

    setLoading(true);
    try {
      const params: ComplianceCheckParams = {
        content,
        platform,
        vertical,
        region
      };

      const complianceResult = await complianceService.lintContent(params);
      setResult(complianceResult);
    } catch (error) {
      console.error('Compliance check failed:', error);
      alert('Failed to check compliance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySafeRewrite = (rewrite: { original: string; rewritten: string }) => {
    if (content.headline === rewrite.original) {
      setContent(prev => ({ ...prev, headline: rewrite.rewritten }));
    } else if (content.body === rewrite.original) {
      setContent(prev => ({ ...prev, body: rewrite.rewritten }));
    } else if (content.cta === rewrite.original) {
      setContent(prev => ({ ...prev, cta: rewrite.rewritten }));
    }
    
    // Re-run compliance check after applying rewrite
    setTimeout(() => handleComplianceCheck(), 500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-300 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-300 bg-blue-50 text-blue-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '🚫';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getOverallStatusColor = (overall: string) => {
    switch (overall) {
      case 'pass': return 'text-green-600 bg-green-100 border-green-300';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'fail': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <>
      <Head>
        <title>Compliance Cop - CreativePilot Pro</title>
      </Head>

      <Sidebar>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Compliance Cop</h1>
                <p className="text-gray-600 mt-2">Check your creative content for policy compliance across all major platforms</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold border-2 border-indigo-200 hover:bg-indigo-50 transition-all"
                >
                  📋 Policy Packs
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Content Input</h2>
                
                <div className="space-y-6">
                  {/* Platform & Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">All Platforms</option>
                        <option value="meta">Meta (Facebook/Instagram)</option>
                        <option value="google">Google Ads</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vertical</label>
                      <select
                        value={vertical}
                        onChange={(e) => setVertical(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="general">General</option>
                        <option value="health">Health & Wellness</option>
                        <option value="finance">Financial Services</option>
                        <option value="beauty">Beauty & Cosmetics</option>
                        <option value="employment">Employment</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="technology">Technology</option>
                      </select>
                    </div>
                  </div>

                  {/* Content Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                    <input
                      type="text"
                      value={content.headline}
                      onChange={(e) => setContent(prev => ({ ...prev, headline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your headline..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Text</label>
                    <textarea
                      value={content.body}
                      onChange={(e) => setContent(prev => ({ ...prev, body: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your body text..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
                    <input
                      type="text"
                      value={content.cta}
                      onChange={(e) => setContent(prev => ({ ...prev, cta: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your CTA..."
                    />
                  </div>

                  <button
                    onClick={handleComplianceCheck}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Checking Compliance...
                      </>
                    ) : (
                      '🔍 Check Compliance'
                    )}
                  </button>
                </div>
              </div>

              {/* Results Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance Results</h2>

                {!result ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Check</h3>
                    <p className="text-gray-600">Enter your content and click "Check Compliance" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Status */}
                    <div className={`p-4 rounded-xl border-2 ${getOverallStatusColor(result.overall)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg capitalize">{result.overall}</h3>
                          <p className="text-sm">Compliance Score: {result.score}/100</p>
                        </div>
                        <div className="text-3xl">
                          {result.overall === 'pass' ? '✅' : result.overall === 'warning' ? '⚠️' : '❌'}
                        </div>
                      </div>
                      {result.approvalRequired && (
                        <div className="mt-3 text-sm font-medium">
                          ⚠️ Manual approval required before publishing
                        </div>
                      )}
                    </div>

                    {/* Violations */}
                    {result.violations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Violations ({result.violations.length})
                        </h4>
                        <div className="space-y-3">
                          {result.violations.map((violation, index) => (
                            <div
                              key={violation.id}
                              className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="text-lg">{getSeverityIcon(violation.severity)}</div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold">{violation.rule.replace('_', ' ').toUpperCase()}</h5>
                                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                      {violation.platform}
                                    </span>
                                  </div>
                                  <p className="text-sm mb-2">{violation.description}</p>
                                  {violation.suggestion && (
                                    <p className="text-xs italic">💡 {violation.suggestion}</p>
                                  )}
                                  {violation.regulation && (
                                    <p className="text-xs mt-2 text-gray-600">
                                      📖 {violation.regulation.type}: {violation.regulation.reference}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safe Rewrites */}
                    {result.safeRewrites && result.safeRewrites.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Suggested Safe Rewrites ({result.safeRewrites.length})
                        </h4>
                        <div className="space-y-3">
                          {result.safeRewrites.map((rewrite, index) => (
                            <div key={index} className="p-4 rounded-lg border border-green-200 bg-green-50">
                              <div className="mb-3">
                                <div className="text-sm text-gray-600 mb-1">Original:</div>
                                <div className="text-sm bg-white p-2 rounded border border-red-200">
                                  {rewrite.original}
                                </div>
                              </div>
                              <div className="mb-3">
                                <div className="text-sm text-gray-600 mb-1">Suggested:</div>
                                <div className="text-sm bg-white p-2 rounded border border-green-200">
                                  {rewrite.rewritten}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-600">{rewrite.explanation}</p>
                                <button
                                  onClick={() => handleApplySafeRewrite(rewrite)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                >
                                  Apply Fix
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-indigo-600">•</span>
                              <span className="text-sm text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Policy Packs Modal */}
          {showPolicyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Compliance Policy Packs</h3>
                    <button
                      onClick={() => setShowPolicyModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policyPacks.map((pack) => (
                      <div
                        key={pack.id}
                        className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedPolicyPack(pack)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{pack.name}</h4>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {pack.region}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{pack.description}</p>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Rules:</span>
                            <span className="font-medium">{pack.rules.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Prohibited Claims:</span>
                            <span className="font-medium">{pack.prohibitedClaims.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Required Disclosures:</span>
                            <span className="font-medium">{pack.requiredDisclosures.length}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                            {pack.vertical}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policy Pack Detail Modal */}
          {selectedPolicyPack && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{selectedPolicyPack.name}</h3>
                    <button
                      onClick={() => setSelectedPolicyPack(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">{selectedPolicyPack.description}</p>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-semibold mb-3">Prohibited Claims</h4>
                      <div className="space-y-2">
                        {selectedPolicyPack.prohibitedClaims.slice(0, 10).map((claim, index) => (
                          <div key={index} className="text-sm bg-red-50 p-2 rounded border border-red-200">
                            "{claim}"
                          </div>
                        ))}
                        {selectedPolicyPack.prohibitedClaims.length > 10 && (
                          <div className="text-sm text-gray-500">
                            +{selectedPolicyPack.prohibitedClaims.length - 10} more...
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Required Disclosures</h4>
                      <div className="space-y-2">
                        {selectedPolicyPack.requiredDisclosures.map((disclosure, index) => (
                          <div key={index} className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                            "{disclosure}"
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold mb-3">Examples</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-green-600 mb-2">✅ Compliant Examples</h5>
                        <div className="space-y-2">
                          {selectedPolicyPack.examples.compliant.map((example, index) => (
                            <div key={index} className="text-sm bg-green-50 p-3 rounded border border-green-200">
                              "{example}"
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-600 mb-2">❌ Violation Examples</h5>
                        <div className="space-y-2">
                          {selectedPolicyPack.examples.violations.map((example, index) => (
                            <div key={index} className="text-sm bg-red-50 p-3 rounded border border-red-200">
                              "{example}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(selectedPolicyPack.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setSelectedPolicyPack(null)}
                        className="bg-gray-100 text-gray-700 py-2 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setVertical(selectedPolicyPack.vertical);
                          setRegion(selectedPolicyPack.region);
                          setSelectedPolicyPack(null);
                          setShowPolicyModal(false);
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                      >
                        Use This Pack
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

export default CompliancePage;