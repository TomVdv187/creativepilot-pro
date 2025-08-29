import { Brand, Asset, BrandKit, ApiResponse } from '@/types';

export class BrandKitService {
  private static instance: BrandKitService;
  private apiBase = '/api/brands';

  static getInstance(): BrandKitService {
    if (!this.instance) {
      this.instance = new BrandKitService();
    }
    return this.instance;
  }

  async getAllBrands(workspaceId?: string): Promise<Brand[]> {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      
      const response = await fetch(`${this.apiBase}?${params}`);
      const result: ApiResponse<Brand[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch brands');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  async getBrand(id: string): Promise<Brand> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`);
      const result: ApiResponse<Brand> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch brand');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching brand:', error);
      throw error;
    }
  }

  async createBrand(brandData: Partial<Brand>): Promise<Brand> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData)
      });
      
      const result: ApiResponse<Brand> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create brand');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      const result: ApiResponse<Brand> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update brand');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  }

  async deleteBrand(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'DELETE'
      });
      
      const result: ApiResponse<Brand> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }

  async uploadAsset(
    brandId: string, 
    file: File, 
    type: Asset['type'],
    rights?: Asset['rights']
  ): Promise<Asset> {
    try {
      // In a real implementation, this would handle file upload
      // For now, simulate the upload process
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (rights) {
        formData.append('rights', JSON.stringify(rights));
      }

      const response = await fetch(`${this.apiBase}/${brandId}/assets`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          filename: file.name,
          rights
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result: ApiResponse<Asset> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload asset');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error uploading asset:', error);
      throw error;
    }
  }

  async getAssets(brandId: string): Promise<Asset[]> {
    try {
      const response = await fetch(`${this.apiBase}/${brandId}/assets`);
      const result: ApiResponse<Asset[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch assets');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  async deleteAsset(brandId: string, assetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${brandId}/assets`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetId })
      });
      
      const result: ApiResponse<Asset> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }

  validateBrandKit(kit: BrandKit): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate colors
    if (!kit.colors || kit.colors.length === 0) {
      errors.push('At least one brand color is required');
    }

    // Validate color hex format
    kit.colors?.forEach((color, index) => {
      if (!/^#[0-9A-F]{6}$/i.test(color.hex)) {
        errors.push(`Invalid hex color format for color ${index + 1}: ${color.hex}`);
      }
    });

    // Validate fonts
    if (!kit.fonts || kit.fonts.length === 0) {
      errors.push('At least one font is required');
    }

    // Validate font URLs
    kit.fonts?.forEach((font, index) => {
      if (!font.url || !this.isValidUrl(font.url)) {
        errors.push(`Invalid font URL for font ${index + 1}: ${font.family}`);
      }
    });

    // Validate logos
    kit.logos?.forEach((logo, index) => {
      if (!logo.url) {
        errors.push(`Logo ${index + 1} is missing URL`);
      }
      if (!logo.metadata?.dimensions?.width || !logo.metadata?.dimensions?.height) {
        errors.push(`Logo ${index + 1} is missing dimensions`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  generateBrandKitCSS(brand: Brand): string {
    const css: string[] = [];
    
    css.push('/* Brand Kit CSS Variables */');
    css.push(':root {');
    
    // Add color variables
    brand.kit.colors.forEach((color, index) => {
      const varName = color.name.toLowerCase().replace(/\s+/g, '-');
      css.push(`  --brand-${varName}: ${color.hex};`);
      css.push(`  --brand-${varName}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};`);
    });
    
    // Add font variables
    brand.kit.fonts.forEach((font, index) => {
      const varName = font.family.toLowerCase().replace(/\s+/g, '-');
      css.push(`  --brand-font-${varName}: '${font.family}', sans-serif;`);
    });
    
    css.push('}');
    css.push('');
    
    // Add font imports
    css.push('/* Font Imports */');
    brand.kit.fonts.forEach(font => {
      css.push(`@import url('${font.url}');`);
    });
    
    return css.join('\n');
  }

  async checkAssetExpiry(brandId: string): Promise<Asset[]> {
    try {
      const assets = await this.getAssets(brandId);
      const now = new Date();
      const alertThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      
      return assets.filter(asset => {
        if (!asset.rights.expiryDate) return false;
        
        const expiryDate = new Date(asset.rights.expiryDate);
        const timeDiff = expiryDate.getTime() - now.getTime();
        
        return timeDiff <= alertThreshold && timeDiff > 0;
      });
    } catch (error) {
      console.error('Error checking asset expiry:', error);
      return [];
    }
  }

  async generateBrandUsageReport(brandId: string): Promise<{
    totalAssets: number;
    assetsByType: Record<string, number>;
    expiringAssets: number;
    lastUpdated: string;
    storageUsed: number; // in bytes
  }> {
    try {
      const assets = await this.getAssets(brandId);
      const expiringAssets = await this.checkAssetExpiry(brandId);
      
      const assetsByType = assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const storageUsed = assets.reduce((total, asset) => {
        return total + (asset.metadata.size || 0);
      }, 0);
      
      return {
        totalAssets: assets.length,
        assetsByType,
        expiringAssets: expiringAssets.length,
        lastUpdated: new Date().toISOString(),
        storageUsed
      };
    } catch (error) {
      console.error('Error generating brand usage report:', error);
      throw error;
    }
  }
}