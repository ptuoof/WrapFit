---
name: insforge-backend-flow
description: >-
  Architects and implements the WrapFit backend infrastructure using PostgreSQL schemas, S3 asset storage, Auth, and MCP integration. Use when creating database models, API endpoints, or user project persistence.
---

# WrapFit Backend & Data Flow Skill (InsForge Architecture)

This skill instructs the agent on implementing an agent-ready backend architecture for WrapFit, leveraging patterns from `InsForge`.

## 1. Relational Database Schema (PostgreSQL)

```sql
-- 1. Users & Shop Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    shop_name VARCHAR(150),
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'shop_owner', 'admin'
    subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'business'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Box Template Formulas (Parametric Models)
CREATE TABLE box_templates (
    id VARCHAR(50) PRIMARY KEY, -- 'tuck-top', 'sleeve-drawer', 'lid-base', 'pillow'
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    formula_schema JSONB NOT NULL, -- Parametric math offsets for L, W, H, t
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. User Packaging Projects
CREATE TABLE packaging_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    template_id VARCHAR(50) REFERENCES box_templates(id),
    dimensions JSONB NOT NULL, -- { "length": 120, "width": 80, "height": 60, "unit": "mm" }
    material_spec JSONB NOT NULL, -- { "type": "kraft", "gsm": 300, "caliper": 0.42 }
    canvas_state JSONB NOT NULL, -- Vector nodes, text, logo placement
    fitcheck_status JSONB, -- { "passed": true, "warnings_count": 0 }
    preview_thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Export Artifacts
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES packaging_projects(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL, -- 'pdf', 'svg', 'dxf'
    storage_s3_key TEXT NOT NULL,
    download_url TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Asset Storage Strategy (S3 / Cloud Storage)

- **User Assets (`/assets/users/{userId}/...`)**: Logos, custom icons, photos. Enforce max upload limit of $10\text{MB}$ and convert raster images to WebP/PNG at source.
- **Export Outputs (`/exports/{projectId}/{jobId}.pdf`)**: Rendered vector CMYK PDFs and cut-line DXF files. Cache for 30 days.

## 3. Real-time Synchronization Protocol

For collaborative viewing or dual-screen workflow:
- Client transmits `PROJECT_PATCH` event over WebSocket containing delta coordinates.
- Server validates permissions and broadcasts updates to connected 3D rendering views with $< 50\text{ms}$ latency.
