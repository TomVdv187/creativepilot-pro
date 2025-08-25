// Domain Models based on CLAUDE.md blueprint

export interface Workspace {
  id: string;
  name: string;
  organizationId: string;
  roles: UserRole[];
  dataResidency: 'EU' | 'US';
  auditLog: AuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  workspaceId: string;
  name: string;
  kit: BrandKit;
  tone: string;
  compliancePack: CompliancePack;
  rights: RightsManagement;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandKit {
  logos: Asset[];
  fonts: Font[];
  colors: Color[];
  guidelines: string;
}

export interface Project {
  id: string;
  brandId: string;
  name: string;
  offer: string;
  audience: string;
  placements: string[];
  kpis: KPI[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Creative {
  id: string;
  projectId: string;
  format: CreativeFormat;
  angleTags: string[];
  assets: Asset[];
  score: PerformanceScore;
  status: 'draft' | 'scored' | 'approved' | 'published' | 'rejected';
  provenance: C2PAData;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experiment {
  id: string;
  projectId: string;
  design: ExperimentDesign;
  variants: Creative[];
  budgets: Budget[];
  guardrails: Guardrail[];
  outcomes: ExperimentOutcome[];
  status: 'draft' | 'running' | 'completed' | 'stopped';
  createdAt: Date;
  updatedAt: Date;
}

export interface Integration {
  id: string;
  workspaceId: string;
  type: 'meta' | 'google' | 'linkedin' | 'shopify' | 'gdrive' | 's3';
  config: IntegrationConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
}

export interface Insight {
  id: string;
  projectId: string;
  type: 'leaderboard' | 'fatigue' | 'contribution' | 'anomaly';
  data: any;
  createdAt: Date;
}

// Supporting types
export type CreativeFormat = 'static' | 'video' | 'carousel' | 'story' | 'catalog';
export type UserRole = 'creator' | 'reviewer' | 'approver' | 'publisher' | 'admin';

export interface PerformanceScore {
  score: number; // 0-100
  uncertainty: number;
  winProbability: number;
  reasons: string[];
  improvementTips: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface Asset {
  id: string;
  url: string;
  type: 'image' | 'video' | 'font' | 'logo';
  metadata: AssetMetadata;
  rights: RightsInfo;
}

export interface AssetMetadata {
  filename: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  mimeType: string;
}

export interface RightsInfo {
  owner: string;
  license: string;
  expiryDate?: Date;
  usageRestrictions: string[];
}

export interface Font {
  family: string;
  weights: number[];
  url: string;
}

export interface Color {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
}

export interface KPI {
  name: string;
  target: number;
  current?: number;
  unit: string;
}

export interface CompliancePack {
  vertical: string;
  region: string;
  prohibitedClaims: string[];
  requiredDisclosures: string[];
  policyRules: PolicyRule[];
}

export interface PolicyRule {
  platform: 'meta' | 'google' | 'linkedin';
  rule: string;
  severity: 'error' | 'warning';
}

export interface RightsManagement {
  defaultLicense: string;
  autoExpiry: boolean;
  alertDaysBefore: number;
}

export interface ExperimentDesign {
  type: 'creative_ab' | 'geo_holdout' | 'angle_test';
  minSampleSize: number;
  power: number;
  significanceLevel: number;
  duration: number;
}

export interface Budget {
  platform: string;
  amount: number;
  currency: string;
  dailyCap: number;
}

export interface Guardrail {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'between';
  value: number | [number, number];
  action: 'pause' | 'alert' | 'promote';
}

export interface ExperimentOutcome {
  variant: string;
  metrics: Record<string, number>;
  significance: number;
  lift: number;
  decision: 'winner' | 'loser' | 'continue';
}

export interface IntegrationConfig {
  accessToken: string;
  refreshToken?: string;
  accountIds: string[];
  permissions: string[];
  expiresAt?: Date;
}

export interface C2PAData {
  contentCredentials: string;
  provenance: ProvenanceInfo[];
  tamperEvidence: boolean;
}

export interface ProvenanceInfo {
  actor: string;
  action: string;
  timestamp: Date;
  signature: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Generation request/response types
export interface GenerationRequest {
  projectId: string;
  format: CreativeFormat;
  angles: string[];
  locales: string[];
  count: number;
}

export interface GenerationResponse {
  jobId: string;
  creativeIds: string[];
  eta: number; // seconds
  cost: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}