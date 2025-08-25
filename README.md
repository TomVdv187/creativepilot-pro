# CreativePilot Pro

Performance-first AI studio for ads and social—predict, generate, and ship creatives that win, with proof.

## Overview

CreativePilot Pro is designed to outperform AdCreative.ai on:
- Creative quality and performance prediction
- Policy safety and compliance
- Workflow speed and automation
- Enterprise controls and security

## Key Features

### 🧠 Performance Brain
- Model-based preflight scoring tied to your account data
- Continuous back-testing and performance optimization
- Win-probability predictions vs. control groups

### 🧪 Experiment Automation
- Auto-design A/B tests with guardrails
- Promote winners and pause fatigued variants
- Budget pacing and performance monitoring

### 🎨 Creative OS
- Multi-format generation (static, video, carousel, story)
- Brand kit enforcement across all outputs
- Catalog overlays with pricing and ratings

### ⚖️ Compliance Cop
- Platform policy linting pre-publish
- Regulated vertical packs for compliance
- One-click safe rewrites for policy violations

### 🏢 Enterprise Grade
- Role-based access controls and approvals
- Content credentials (C2PA) for authenticity
- Audit trails and data residency controls

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Architecture

- **Frontend**: Next.js with React
- **Backend**: Node.js API with workers
- **AI**: LLM for copy, diffusion for visuals
- **Data**: PostgreSQL + Object storage
- **Integrations**: Meta Ads, Google Ads, LinkedIn Ads

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Lint code
npm run lint
```

## Documentation

See the `/docs` folder for detailed documentation:
- API Reference
- Integration Guides
- Deployment Instructions
- Security Guidelines

## License

MIT License - see LICENSE file for details.