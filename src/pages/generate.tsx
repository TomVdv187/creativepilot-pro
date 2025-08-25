import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface GeneratedCreative {
  id: string;
  format: string;
  angle: string;
  score: number;
  winProbability: number;
  imageUrl: string;
  headline: string;
  description: string;
  cta: string;
}

const GeneratePage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCreatives, setGeneratedCreatives] = useState<GeneratedCreative[]>([]);
  const [formData, setFormData] = useState({
    format: 'static',
    angles: ['benefit', 'social-proof'],
    count: 4,
    productName: '',
    targetAudience: '',
    keyBenefit: '',
    callToAction: 'Shop Now'
  });

  const angles = [
    { id: 'benefit', label: 'Key Benefit', description: 'Highlight main product benefit' },
    { id: 'social-proof', label: 'Social Proof', description: 'Customer reviews/testimonials' },
    { id: 'urgency', label: 'Urgency', description: 'Limited time offers' },
    { id: 'problem-solution', label: 'Problem/Solution', description: 'Address customer pain points' },
    { id: 'lifestyle', label: 'Lifestyle', description: 'Show product in use' },
    { id: 'comparison', label: 'Comparison', description: 'Before vs after' }
  ];

  const handleAngleToggle = (angleId: string) => {
    setFormData(prev => ({
      ...prev,
      angles: prev.angles.includes(angleId)
        ? prev.angles.filter(a => a !== angleId)
        : [...prev.angles, angleId]
    }));
  };

  const generateCreatives = async () => {
    if (!formData.productName || !formData.keyBenefit) {
      alert('Please fill in product name and key benefit');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockCreatives: GeneratedCreative[] = Array.from({ length: formData.count }, (_, i) => ({
        id: `creative-${Date.now()}-${i}`,
        format: formData.format,
        angle: formData.angles[i % formData.angles.length],
        score: Math.floor(65 + Math.random() * 30),
        winProbability: 0.6 + Math.random() * 0.35,
        imageUrl: `https://picsum.photos/400/300?random=${i}`,
        headline: generateHeadline(formData.productName, formData.keyBenefit, formData.angles[i % formData.angles.length]),
        description: generateDescription(formData.productName, formData.keyBenefit, formData.targetAudience),
        cta: formData.callToAction
      }));

      setGeneratedCreatives(mockCreatives);
    } catch (error) {
      alert('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHeadline = (product: string, benefit: string, angle: string) => {
    const headlines = {
      'benefit': `${product}: ${benefit} in Just Minutes!`,
      'social-proof': `"${benefit}" - 10,000+ Happy Customers`,
      'urgency': `Limited Time: ${benefit} with ${product}`,
      'problem-solution': `Tired of Problems? ${product} Delivers ${benefit}`,
      'lifestyle': `Transform Your Life with ${product}`,
      'comparison': `Before vs After: Amazing ${benefit} Results`
    };
    return headlines[angle as keyof typeof headlines] || `Amazing ${product} - ${benefit}`;
  };

  const generateDescription = (product: string, benefit: string, audience: string) => {
    return `Perfect for ${audience || 'everyone'} who wants ${benefit.toLowerCase()}. Our ${product} delivers proven results that you can see and feel immediately.`;
  };

  return (
    <>
      <Head>
        <title>Generate Creatives - CreativePilot Pro</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                CreativePilot Pro
              </Link>
              <nav className="flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/generate" className="text-indigo-600 font-medium">Generate</Link>
                <Link href="/projects" className="text-gray-600 hover:text-gray-900">Projects</Link>
                <Link href="/insights" className="text-gray-600 hover:text-gray-900">Insights</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Generation Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Generate Creatives</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. SuperSkin Cream"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Benefit *
                    </label>
                    <input
                      type="text"
                      value={formData.keyBenefit}
                      onChange={(e) => setFormData(prev => ({ ...prev, keyBenefit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Reduces wrinkles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Women 35-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="static">Static Image</option>
                      <option value="video">Video</option>
                      <option value="carousel">Carousel</option>
                      <option value="story">Story</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creative Angles
                    </label>
                    <div className="space-y-2">
                      {angles.map(angle => (
                        <label key={angle.id} className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.angles.includes(angle.id)}
                            onChange={() => handleAngleToggle(angle.id)}
                            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-700">{angle.label}</div>
                            <div className="text-xs text-gray-500">{angle.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Variants
                    </label>
                    <select
                      value={formData.count}
                      onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={2}>2 variants</option>
                      <option value={4}>4 variants</option>
                      <option value={6}>6 variants</option>
                      <option value={8}>8 variants</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Call to Action
                    </label>
                    <input
                      type="text"
                      value={formData.callToAction}
                      onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Shop Now, Learn More"
                    />
                  </div>

                  <button
                    onClick={generateCreatives}
                    disabled={isGenerating || !formData.productName || !formData.keyBenefit}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    {isGenerating ? 'Generating...' : `Generate ${formData.count} Creatives`}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Creatives */}
            <div className="lg:col-span-2">
              {isGenerating && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-4 text-gray-600">Generating your creatives...</p>
                  <p className="text-sm text-gray-500">This usually takes 30-60 seconds</p>
                </div>
              )}

              {generatedCreatives.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Generated Creatives</h3>
                    <span className="text-sm text-gray-500">{generatedCreatives.length} variants</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {generatedCreatives.map(creative => (
                      <div key={creative.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="aspect-w-4 aspect-h-3">
                          <img 
                            src={creative.imageUrl} 
                            alt={creative.headline}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {creative.angle}
                            </span>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">{creative.score}</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-2">{creative.headline}</h4>
                          <p className="text-sm text-gray-600 mb-3">{creative.description}</p>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Win Rate: {Math.round(creative.winProbability * 100)}%
                            </span>
                            <button className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-sm font-medium hover:bg-indigo-200">
                              {creative.cta}
                            </button>
                          </div>

                          <div className="mt-3 flex space-x-2">
                            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200">
                              Edit
                            </button>
                            <button className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded text-sm hover:bg-indigo-700">
                              Launch Test
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isGenerating && generatedCreatives.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🎨</div>
                  <p>Fill out the form to generate your first creatives</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default GeneratePage;