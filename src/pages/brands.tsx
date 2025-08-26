import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';

interface BrandAsset {
  id: string;
  type: 'logo' | 'font' | 'color' | 'template';
  name: string;
  url?: string;
  value?: string;
  metadata?: any;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
  description: string;
  primaryLogo?: string;
  secondaryLogo?: string;
  colors: { primary: string; secondary: string; accent: string; };
  fonts: { heading: string; body: string; };
  assets: BrandAsset[];
  guidelines: string;
  createdAt: string;
  updatedAt: string;
}

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: '1',
      name: 'TechStart Inc.',
      description: 'Innovative tech startup focused on AI solutions',
      primaryLogo: '/api/placeholder/150/60',
      colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
      fonts: { heading: 'Inter', body: 'Inter' },
      assets: [],
      guidelines: 'Modern, clean, tech-focused brand identity',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2', 
      name: 'EcoLife Products',
      description: 'Sustainable lifestyle and eco-friendly products',
      primaryLogo: '/api/placeholder/150/60',
      colors: { primary: '#10B981', secondary: '#059669', accent: '#F59E0B' },
      fonts: { heading: 'Poppins', body: 'Open Sans' },
      assets: [],
      guidelines: 'Natural, sustainable, earth-friendly messaging',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ]);
  
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: '',
    colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
    fonts: { heading: 'Inter', body: 'Inter' },
    guidelines: ''
  });

  const handleLogoUpload = useCallback(async (brandId: string, file: File, type: 'primary' | 'secondary') => {
    setUploadingLogo(true);
    
    // Simulate upload process
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('type', type);
    
    try {
      // In production, this would upload to your storage service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a temporary URL for demo
      const tempUrl = URL.createObjectURL(file);
      
      setBrands(prev => prev.map(brand => 
        brand.id === brandId 
          ? { 
              ...brand, 
              [type === 'primary' ? 'primaryLogo' : 'secondaryLogo']: tempUrl,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : brand
      ));
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  }, []);

  const createBrand = async () => {
    if (!newBrand.name.trim()) return;

    const brand: Brand = {
      id: Date.now().toString(),
      name: newBrand.name,
      description: newBrand.description,
      colors: newBrand.colors,
      fonts: newBrand.fonts,
      assets: [],
      guidelines: newBrand.guidelines,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setBrands(prev => [brand, ...prev]);
    setShowCreateModal(false);
    setNewBrand({
      name: '',
      description: '',
      colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
      fonts: { heading: 'Inter', body: 'Inter' },
      guidelines: ''
    });
  };

  const deleteBrand = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      setBrands(prev => prev.filter(b => b.id !== id));
    }
  };

  const FileUpload: React.FC<{ 
    brandId: string; 
    type: 'primary' | 'secondary';
    currentLogo?: string;
    label: string;
  }> = ({ brandId, type, currentLogo, label }) => (
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
              if (file) handleLogoUpload(brandId, file, type);
            }}
            disabled={uploadingLogo}
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Brand Management - CreativePilot Pro</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
              <p className="text-gray-600 mt-2">Manage logos, colors, fonts, and brand guidelines for consistent creatives</p>
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
                      <p className="text-sm text-gray-600">{brand.description}</p>
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
                      {brand.primaryLogo ? (
                        <img 
                          src={brand.primaryLogo} 
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
                    <div className="flex space-x-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: brand.colors.primary }}
                        title="Primary"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: brand.colors.secondary }}
                        title="Secondary"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: brand.colors.accent }}
                        title="Accent"
                      ></div>
                    </div>
                  </div>

                  {/* Fonts */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Typography</h4>
                    <div className="text-xs text-gray-600">
                      <div>Heading: {brand.fonts.heading}</div>
                      <div>Body: {brand.fonts.body}</div>
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
          {brands.length === 0 && (
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
                        Industry/Description
                      </label>
                      <input
                        type="text"
                        value={newBrand.description}
                        onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g. Tech startup"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Colors
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Primary</label>
                        <input
                          type="color"
                          value={newBrand.colors.primary}
                          onChange={(e) => setNewBrand(prev => ({
                            ...prev,
                            colors: { ...prev.colors, primary: e.target.value }
                          }))}
                          className="w-full h-12 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Secondary</label>
                        <input
                          type="color"
                          value={newBrand.colors.secondary}
                          onChange={(e) => setNewBrand(prev => ({
                            ...prev,
                            colors: { ...prev.colors, secondary: e.target.value }
                          }))}
                          className="w-full h-12 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Accent</label>
                        <input
                          type="color"
                          value={newBrand.colors.accent}
                          onChange={(e) => setNewBrand(prev => ({
                            ...prev,
                            colors: { ...prev.colors, accent: e.target.value }
                          }))}
                          className="w-full h-12 rounded-lg border border-gray-300"
                        />
                      </div>
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
                    onClick={() => setShowCreateModal(false)}
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
                        type="primary"
                        currentLogo={selectedBrand.primaryLogo}
                        label="Primary Logo"
                      />
                      <FileUpload
                        brandId={selectedBrand.id}
                        type="secondary"
                        currentLogo={selectedBrand.secondaryLogo}
                        label="Secondary Logo"
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
                          <div>
                            <div 
                              className="w-full h-12 rounded-lg border-2 border-white shadow-sm mb-1"
                              style={{ backgroundColor: selectedBrand.colors.primary }}
                            ></div>
                            <div className="text-xs text-gray-600 text-center">Primary</div>
                          </div>
                          <div>
                            <div 
                              className="w-full h-12 rounded-lg border-2 border-white shadow-sm mb-1"
                              style={{ backgroundColor: selectedBrand.colors.secondary }}
                            ></div>
                            <div className="text-xs text-gray-600 text-center">Secondary</div>
                          </div>
                          <div>
                            <div 
                              className="w-full h-12 rounded-lg border-2 border-white shadow-sm mb-1"
                              style={{ backgroundColor: selectedBrand.colors.accent }}
                            ></div>
                            <div className="text-xs text-gray-600 text-center">Accent</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Typography</label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm">
                            <div><strong>Heading:</strong> {selectedBrand.fonts.heading}</div>
                            <div><strong>Body:</strong> {selectedBrand.fonts.body}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guidelines</label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{selectedBrand.guidelines || 'No guidelines set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Created: {selectedBrand.createdAt} | Updated: {selectedBrand.updatedAt}
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
    </>
  );
};

export default BrandsPage;