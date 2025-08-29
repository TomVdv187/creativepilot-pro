import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BrandKitService } from '@/services/brandKitService';
import { Brand, Asset } from '@/types';

interface BrandFormData {
  name: string;
  tone: string;
  guidelines: string;
  colors: { name: string; hex: string; }[];
  fonts: { family: string; weights: number[]; }[];
}

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const brandService = BrandKitService.getInstance();
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [newBrand, setNewBrand] = useState<BrandFormData>({
    name: '',
    tone: '',
    guidelines: '',
    colors: [
      { name: 'Primary', hex: '#3B82F6' },
      { name: 'Secondary', hex: '#1E40AF' },
      { name: 'Accent', hex: '#F59E0B' }
    ],
    fonts: [
      { family: 'Inter', weights: [400, 500, 600, 700] }
    ]
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const brandsData = await brandService.getAllBrands('ws_1');
      setBrands(brandsData);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = useCallback(async (brandId: string, file: File) => {
    setUploadingLogo(true);
    
    try {
      const asset = await brandService.uploadAsset(brandId, file, 'logo');
      
      setBrands(prev => prev.map(brand => 
        brand.id === brandId 
          ? { 
              ...brand, 
              kit: {
                ...brand.kit,
                logos: [...brand.kit.logos, asset]
              },
              updatedAt: new Date()
            }
          : brand
      ));
    } catch (error) {
      alert('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploadingLogo(false);
    }
  }, [brandService]);

  const createBrand = async () => {
    if (!newBrand.name.trim()) return;

    try {
      const brandData = {
        workspaceId: 'ws_1',
        name: newBrand.name,
        tone: newBrand.tone,
        kit: {
          logos: [],
          colors: newBrand.colors.map(c => ({
            ...c,
            rgb: hexToRgb(c.hex)
          })),
          fonts: newBrand.fonts.map(f => ({
            ...f,
            url: getFontUrl(f.family)
          })),
          guidelines: newBrand.guidelines
        },
        compliancePack: {
          vertical: 'General',
          region: 'US',
          prohibitedClaims: [],
          requiredDisclosures: [],
          policyRules: []
        },
        rights: {
          defaultLicense: 'Proprietary',
          autoExpiry: false,
          alertDaysBefore: 30
        }
      };

      const createdBrand = await brandService.createBrand(brandData);
      setBrands(prev => [createdBrand, ...prev]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      alert('Failed to create brand. Please try again.');
      console.error('Create brand error:', error);
    }
  };

  const resetForm = () => {
    setNewBrand({
      name: '',
      tone: '',
      guidelines: '',
      colors: [
        { name: 'Primary', hex: '#3B82F6' },
        { name: 'Secondary', hex: '#1E40AF' },
        { name: 'Accent', hex: '#F59E0B' }
      ],
      fonts: [
        { family: 'Inter', weights: [400, 500, 600, 700] }
      ]
    });
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const getFontUrl = (family: string) => {
    const fontUrls: Record<string, string> = {
      'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap'
    };
    return fontUrls[family] || fontUrls['Inter'];
  };

  const deleteBrand = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await brandService.deleteBrand(id);
        setBrands(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        alert('Failed to delete brand. Please try again.');
        console.error('Delete brand error:', error);
      }
    }
  };

  const FileUpload: React.FC<{ 
    brandId: string; 
    currentAssets?: Asset[];
    label: string;
  }> = ({ brandId, currentAssets, label }) => {
    const currentLogo = currentAssets?.[0]?.url;
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors">
        <div className="text-center">
          {currentLogo ? (
            <div className="mb-4">
              <img 
                src={currentLogo} 
                alt={`${label} logo`}
                className="mx-auto max-h-16 object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
          )}
          
          <h4 className="text-sm font-medium text-gray-900 mb-2">{label}</h4>
          <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 2MB</p>
          
          <label className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 cursor-pointer text-sm font-medium">
            {uploadingLogo ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                📤 {currentLogo ? 'Replace' : 'Upload'}
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(brandId, file);
              }}
              disabled={uploadingLogo}
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Brand Management - CreativePilot Pro</title>
      </Head>

      <Sidebar>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          {loading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Loading brands...</p>
              </div>
            </div>
          ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
              <p className="text-gray-600 mt-2">Manage brand kits with logos, colors, fonts, tone, and compliance settings for consistent creatives</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              + Add Brand
            </button>
          </div>

          {/* Brands Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div key={brand.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="p-6">
                  {/* Brand Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{brand.name}</h3>
                      <p className="text-sm text-gray-600">{brand.tone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedBrand(brand)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => deleteBrand(brand.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Logo Preview */}
                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      {brand.kit.logos.length > 0 ? (
                        <img 
                          src={brand.kit.logos[0].url} 
                          alt={`${brand.name} logo`}
                          className="mx-auto max-h-12 object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">No logo uploaded</div>
                      )}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
                    <div className="flex flex-wrap gap-2">
                      {brand.kit.colors.slice(0, 4).map((color, index) => (
                        <div 
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        ></div>
                      ))}
                      {brand.kit.colors.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          +{brand.kit.colors.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fonts */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Typography</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {brand.kit.fonts.slice(0, 2).map((font, index) => (
                        <div key={index}>{font.family}</div>
                      ))}
                      {brand.kit.fonts.length > 2 && (
                        <div className="text-gray-500">+{brand.kit.fonts.length - 2} more</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedBrand(brand)}
                      className="flex-1 bg-indigo-50 text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                    >
                      Edit Brand
                    </button>
                    <Link 
                      href={`/generate?brand=${brand.id}`}
                      className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 py-2 px-4 rounded-lg text-sm font-medium hover:from-green-100 hover:to-emerald-100 transition-colors text-center"
                    >
                      Use Brand
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {brands.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No brands yet</h3>
              <p className="text-gray-600 mb-6">Create your first brand to start generating on-brand creatives</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                Add Your First Brand
              </button>
            </div>
          )}
          </main>
          )}

          {/* Create Brand Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6">Create New Brand</h3>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        value={newBrand.name}
                        onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Tone
                      </label>
                      <input
                        type="text"
                        value={newBrand.tone}
                        onChange={(e) => setNewBrand(prev => ({ ...prev, tone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g. Professional and approachable"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Colors
                    </label>
                    <div className="space-y-3">
                      {newBrand.colors.map((color, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => {
                              const updatedColors = [...newBrand.colors];
                              updatedColors[index].hex = e.target.value;
                              setNewBrand(prev => ({ ...prev, colors: updatedColors }));
                            }}
                            className="w-12 h-12 rounded-lg border border-gray-300"
                          />
                          <input
                            type="text"
                            value={color.name}
                            onChange={(e) => {
                              const updatedColors = [...newBrand.colors];
                              updatedColors[index].name = e.target.value;
                              setNewBrand(prev => ({ ...prev, colors: updatedColors }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Color name"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Guidelines
                    </label>
                    <textarea
                      value={newBrand.guidelines}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, guidelines: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe your brand voice, style, and key messaging..."
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createBrand}
                    disabled={!newBrand.name.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Create Brand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Brand Modal */}
        {selectedBrand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Edit {selectedBrand.name}</h3>
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Logo Upload Section */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Brand Assets</h4>
                    <div className="space-y-6">
                      <FileUpload
                        brandId={selectedBrand.id}
                        currentAssets={selectedBrand.kit.logos}
                        label="Brand Logo"
                      />
                    </div>
                  </div>

                  {/* Brand Details */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Brand Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedBrand.kit.colors.slice(0, 6).map((color, index) => (
                            <div key={index}>
                              <div 
                                className="w-full h-12 rounded-lg border-2 border-white shadow-sm mb-1"
                                style={{ backgroundColor: color.hex }}
                              ></div>
                              <div className="text-xs text-gray-600 text-center">{color.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Typography</label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm space-y-1">
                            {selectedBrand.kit.fonts.map((font, index) => (
                              <div key={index}><strong>{font.family}:</strong> {font.weights.join(', ')}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guidelines</label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{selectedBrand.kit.guidelines || 'No guidelines set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(selectedBrand.createdAt).toLocaleDateString()} | Updated: {new Date(selectedBrand.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className="bg-gray-100 text-gray-700 py-2 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <Link
                      href={`/generate?brand=${selectedBrand.id}`}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                      Create with Brand
                    </Link>
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

export default BrandsPage;