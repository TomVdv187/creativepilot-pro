import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import { 
  GenerationRequest, 
  BatchGenerationResponse, 
  GeneratedCreative,
  CREATIVE_FORMATS,
  CREATIVE_ANGLES,
  CreativeFormat
} from '@/pages/api/generate/batch';

const GeneratePage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchResponse, setBatchResponse] = useState<BatchGenerationResponse | null>(null);
  const [selectedCreatives, setSelectedCreatives] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'setup' | 'results'>('setup');
  
  const [formData, setFormData] = useState<GenerationRequest>({
    projectId: '',
    brandId: '',
    productInfo: {
      name: '',
      description: '',
      keyBenefits: [''],
      price: undefined,
      category: 'general'
    },
    targetAudience: {
      demographics: '',
      interests: [''],
      painPoints: ['']
    },
    creative: {
      formats: ['static'],
      angles: ['benefit_focused'],
      quantity: 4,
      style: 'professional',
      tone: 'friendly'
    },
    brand: {
      colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
      fonts: { headline: 'Inter', body: 'Inter' }
    },
    compliance: {
      vertical: 'general',
      region: 'US',
      platforms: ['meta', 'google']
    },
    settings: {
      autoCompliance: true,
      requireApproval: false,
      generateCopy: true,
      generateImages: true,
      generateVideo: false
    }
  });

  const handleInputChange = (section: keyof GenerationRequest, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (section: keyof GenerationRequest, field: string, index: number, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[section] as any)[field] || [];
      const newArray = [...currentArray];
      newArray[index] = value;
      
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (section: keyof GenerationRequest, field: string) => {
    setFormData(prev => {
      const currentArray = (prev[section] as any)[field] || [];
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: [...currentArray, '']
        }
      };
    });
  };

  const removeArrayItem = (section: keyof GenerationRequest, field: string, index: number) => {
    setFormData(prev => {
      const currentArray = (prev[section] as any)[field] || [];
      const newArray = currentArray.filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: newArray
        }
      };
    });
  };

  const toggleFormat = (format: CreativeFormat['format']) => {
    setFormData(prev => ({
      ...prev,
      creative: {
        ...prev.creative,
        formats: prev.creative.formats.includes(format)
          ? prev.creative.formats.filter(f => f !== format)
          : [...prev.creative.formats, format]
      }
    }));
  };

  const toggleAngle = (angleId: string) => {
    setFormData(prev => ({
      ...prev,
      creative: {
        ...prev.creative,
        angles: prev.creative.angles.includes(angleId)
          ? prev.creative.angles.filter(a => a !== angleId)
          : [...prev.creative.angles, angleId]
      }
    }));
  };

  const generateBatch = async () => {
    if (!formData.productInfo.name || !formData.productInfo.keyBenefits[0]) {
      alert('Please fill in product name and at least one key benefit');
      return;
    }

    if (formData.creative.formats.length === 0) {
      alert('Please select at least one creative format');
      return;
    }

    if (formData.creative.angles.length === 0) {
      alert('Please select at least one creative angle');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBatchResponse(result.data);
        setActiveTab('results');
      } else {
        alert(`Generation failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate creatives. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCreativeSelection = (creativeId: string) => {
    setSelectedCreatives(prev => 
      prev.includes(creativeId)
        ? prev.filter(id => id !== creativeId)
        : [...prev, creativeId]
    );
  };

  const getFormatIcon = (format: string) => {
    const icons = {
      static: '🖼️',
      video_storyboard: '🎬',
      carousel: '📱',
      story: '📖',
      square: '⬜',
      portrait: '📄'
    };
    return icons[format as keyof typeof icons] || '🎨';
  };

  const getAngleIcon = (category: string) => {
    const icons = {
      hook: '🎣',
      benefit: '⭐',
      objection: '🛡️',
      social_proof: '👥',
      offer: '🏷️'
    };
    return icons[category as keyof typeof icons] || '💡';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <>
      <Head>
        <title>Generate Creatives - CreativePilot Pro</title>
      </Head>

      <Sidebar>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Creative Studio</h1>
                <p className="text-gray-600 mt-2">Generate high-performing ad creatives with AI</p>
              </div>
              
              {/* Tab Navigation */}
              <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-100">
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'setup' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⚙️ Setup
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'results' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={!batchResponse}
                >
                  📊 Results {batchResponse && `(${batchResponse.completedCreatives})`}
                </button>
              </div>
            </div>

            {activeTab === 'setup' ? (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Product & Audience */}
                <div className="space-y-6">
                  {/* Product Information */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Product Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input
                          type="text"
                          value={formData.productInfo.name}
                          onChange={(e) => handleInputChange('productInfo', 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., EcoClean Detergent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={formData.productInfo.description}
                          onChange={(e) => handleInputChange('productInfo', 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Brief product description..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Key Benefits *</label>
                        {formData.productInfo.keyBenefits.map((benefit, index) => (
                          <div key={index} className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              value={benefit}
                              onChange={(e) => handleArrayInputChange('productInfo', 'keyBenefits', index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g., Removes 99% of stains"
                            />
                            {formData.productInfo.keyBenefits.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('productInfo', 'keyBenefits', index)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addArrayItem('productInfo', 'keyBenefits')}
                          className="text-indigo-600 text-sm hover:text-indigo-700"
                        >
                          + Add Benefit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                          <input
                            type="number"
                            value={formData.productInfo.price || ''}
                            onChange={(e) => handleInputChange('productInfo', 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="29.99"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={formData.productInfo.category}
                            onChange={(e) => handleInputChange('productInfo', 'category', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="general">General</option>
                            <option value="health">Health & Wellness</option>
                            <option value="tech">Technology</option>
                            <option value="fashion">Fashion</option>
                            <option value="home">Home & Garden</option>
                            <option value="beauty">Beauty</option>
                            <option value="fitness">Fitness</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Target Audience</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Demographics</label>
                        <input
                          type="text"
                          value={formData.targetAudience.demographics}
                          onChange={(e) => handleInputChange('targetAudience', 'demographics', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., Busy parents aged 25-45"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pain Points</label>
                        {formData.targetAudience.painPoints.map((painPoint, index) => (
                          <div key={index} className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              value={painPoint}
                              onChange={(e) => handleArrayInputChange('targetAudience', 'painPoints', index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g., Struggling with tough stains"
                            />
                            {formData.targetAudience.painPoints.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('targetAudience', 'painPoints', index)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addArrayItem('targetAudience', 'painPoints')}
                          className="text-indigo-600 text-sm hover:text-indigo-700"
                        >
                          + Add Pain Point
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Creative Settings */}
                <div className="space-y-6">
                  {/* Creative Formats */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Creative Formats</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {CREATIVE_FORMATS.map((format) => (
                        <div
                          key={format.format}
                          onClick={() => toggleFormat(format.format)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.creative.formats.includes(format.format)
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{getFormatIcon(format.format)}</div>
                              <div>
                                <h4 className="font-medium text-gray-900 capitalize">{format.format.replace('_', ' ')}</h4>
                                <p className="text-xs text-gray-500">{format.aspectRatio}</p>
                              </div>
                            </div>
                            {formData.creative.formats.includes(format.format) && (
                              <div className="text-indigo-600">✓</div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{format.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creative Angles */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎣 Creative Angles</h3>
                    
                    <div className="space-y-3">
                      {CREATIVE_ANGLES.map((angle) => (
                        <div
                          key={angle.id}
                          onClick={() => toggleAngle(angle.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.creative.angles.includes(angle.id)
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">{getAngleIcon(angle.category)}</div>
                              <div>
                                <h4 className="font-medium text-gray-900">{angle.name}</h4>
                                <p className="text-xs text-gray-500 capitalize">{angle.category.replace('_', ' ')}</p>
                              </div>
                            </div>
                            {formData.creative.angles.includes(angle.id) && (
                              <div className="text-indigo-600">✓</div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{angle.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Settings & Generate */}
                <div className="space-y-6">
                  {/* Generation Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Generation Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variants per angle: {formData.creative.quantity}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="12"
                          value={formData.creative.quantity}
                          onChange={(e) => handleInputChange('creative', 'quantity', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1</span>
                          <span>12</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                          <select
                            value={formData.creative.style}
                            onChange={(e) => handleInputChange('creative', 'style', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="modern">Modern</option>
                            <option value="minimal">Minimal</option>
                            <option value="bold">Bold</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                          <select
                            value={formData.creative.tone}
                            onChange={(e) => handleInputChange('creative', 'tone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="friendly">Friendly</option>
                            <option value="authoritative">Authoritative</option>
                            <option value="playful">Playful</option>
                            <option value="urgent">Urgent</option>
                            <option value="trustworthy">Trustworthy</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="generateCopy"
                            checked={formData.settings.generateCopy}
                            onChange={(e) => handleInputChange('settings', 'generateCopy', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="generateCopy" className="text-sm text-gray-700">Generate copy</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="generateImages"
                            checked={formData.settings.generateImages}
                            onChange={(e) => handleInputChange('settings', 'generateImages', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="generateImages" className="text-sm text-gray-700">Generate images</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="autoCompliance"
                            checked={formData.settings.autoCompliance}
                            onChange={(e) => handleInputChange('settings', 'autoCompliance', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="autoCompliance" className="text-sm text-gray-700">Auto compliance check</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Estimate */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Cost Estimate</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total creatives:</span>
                        <span className="font-medium">
                          {formData.creative.formats.length * formData.creative.angles.length * formData.creative.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Copy generation:</span>
                        <span className="font-medium">
                          {formatNumber(formData.creative.formats.length * formData.creative.angles.length * formData.creative.quantity)} credits
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Image generation:</span>
                        <span className="font-medium">
                          {formatNumber(formData.creative.formats.length * formData.creative.angles.length * formData.creative.quantity * 3)} credits
                        </span>
                      </div>
                      <div className="border-t border-indigo-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="font-bold text-indigo-600">
                            {formatNumber(formData.creative.formats.length * formData.creative.angles.length * formData.creative.quantity * 4)} credits
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateBatch}
                    disabled={isGenerating || !formData.productInfo.name || formData.creative.formats.length === 0}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Generating Creatives...
                      </>
                    ) : (
                      '🚀 Generate Creatives'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Results Tab
              <div className="space-y-8">
                {batchResponse && (
                  <>
                    {/* Batch Summary */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Generation Results</h2>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{batchResponse.completedCreatives}</div>
                            <div className="text-sm text-gray-500">Creatives</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{batchResponse.cost.totalCredits}</div>
                            <div className="text-sm text-gray-500">Credits Used</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${
                              batchResponse.status === 'completed' ? 'text-green-600' :
                              batchResponse.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {batchResponse.status === 'completed' ? '✅' : 
                               batchResponse.status === 'error' ? '❌' : '⏳'}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">{batchResponse.status}</div>
                          </div>
                        </div>
                      </div>

                      {selectedCreatives.length > 0 && (
                        <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-4 mb-6">
                          <div className="text-sm text-indigo-800">
                            {selectedCreatives.length} creative(s) selected
                          </div>
                          <div className="flex space-x-3">
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                              💾 Save Selected
                            </button>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                              🚀 Publish Selected
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Creatives Grid */}
                    <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {batchResponse.creatives.map((creative) => (
                        <div key={creative.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                          {/* Creative Preview */}
                          <div className="relative">
                            {creative.visual.imageUrl && (
                              <img
                                src={creative.visual.imageUrl}
                                alt={creative.copy.headline}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            
                            {/* Overlays */}
                            {creative.visual.overlays && creative.visual.overlays.length > 0 && (
                              <div className="absolute inset-0">
                                {creative.visual.overlays.map((overlay, index) => (
                                  <div
                                    key={index}
                                    className={`absolute ${
                                      overlay.type === 'price' ? 'bg-red-500 text-white px-2 py-1 rounded text-sm font-bold' :
                                      overlay.type === 'rating' ? 'bg-yellow-400 text-black px-2 py-1 rounded text-xs' :
                                      ''
                                    }`}
                                    style={{
                                      left: `${overlay.position.x * 100}%`,
                                      top: `${overlay.position.y * 100}%`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                  >
                                    {overlay.content}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Selection Checkbox */}
                            <div className="absolute top-3 left-3">
                              <input
                                type="checkbox"
                                checked={selectedCreatives.includes(creative.id)}
                                onChange={() => toggleCreativeSelection(creative.id)}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"
                              />
                            </div>

                            {/* Format Badge */}
                            <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                              {getFormatIcon(creative.format)} {creative.format.replace('_', ' ')}
                            </div>
                          </div>

                          {/* Creative Content */}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">
                                {CREATIVE_ANGLES.find(a => a.id === creative.angle)?.name || creative.angle}
                              </div>
                              {creative.metadata.preflightScore && (
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  creative.metadata.preflightScore >= 80 ? 'bg-green-100 text-green-800' :
                                  creative.metadata.preflightScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  Score: {creative.metadata.preflightScore}
                                </div>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
                              {creative.copy.headline}
                            </h3>
                            
                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                              {creative.copy.body}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium">
                                {creative.copy.cta}
                              </div>
                              
                              {creative.metadata.estimatedPerformance && (
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">Est. CTR</div>
                                  <div className="text-sm font-semibold text-indigo-600">
                                    {creative.metadata.estimatedPerformance.ctrPrediction.toFixed(2)}%
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Variations */}
                            {creative.variations.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-xs text-gray-500 mb-2">Variations available:</div>
                                <div className="flex flex-wrap gap-1">
                                  {creative.variations.map((variation) => (
                                    <span
                                      key={variation.id}
                                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize"
                                    >
                                      {variation.type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </Sidebar>
    </>
  );
};

export default GeneratePage;