# CutisAI — Tech Stack Document
**Version:** 1.0 (Draft) | **Date:** March 2026 | **Aligned With:** PRD v1.0 | **Author:** Yash Raj Sharan <yashraj10messi@gmail.com>

> Full-Stack Engineering Reference covering AI/ML Pipeline, Backend API, Frontend, Database, DevOps, Infrastructure & Security

---

## 1. Document Overview & Purpose

This Tech Stack Document is the single authoritative reference for all technology choices made in the CutisAI project. It covers every layer of the system — from the deep learning training pipeline down to deployment infrastructure — and explains the rationale behind each decision.

| Field | Value |
|---|---|
| Scope | AI/ML Pipeline, REST API Backend, Web Frontend, Database, File Storage, DevOps, CI/CD, Security, Monitoring |
| Audience | Engineers, Researchers, Paper Reviewers |
| Version | 1.0 — aligned with PRD v1.0 |
| Constraint | Must run on standard CPU hardware (no mandatory GPU in production); total inference < 3 s |

---

## 2. System Architecture Overview

CutisAI follows a three-tier architecture: a React SPA in the browser, a Python FastAPI backend that owns the AI inference pipeline, and persistent storage layers for metadata and model artefacts. All tiers are containerised with Docker and wired together by an Nginx reverse proxy.

### 2.1 Request Lifecycle

| Step | Description |
|---|---|
| Step 1 — Upload | Browser sends a multipart/form-data POST to /api/analyse via HTTPS. |
| Step 2 — Validation | FastAPI validates MIME type, dimensions, file size. Rejects invalid payloads with 422. |
| Step 3 — Pre-processing | Image decoded → resized to 256×256 → normalised with ImageNet mean/std → tensor. |
| Step 4 — Segmentation | U-Net ONNX model runs inference → binary mask (numpy array). |
| Step 5 — ROI Crop | Bounding box of mask applied to original tensor → ROI patch extracted. |
| Step 6 — Classification | EfficientNet-B0 ONNX model runs on ROI → softmax scores. |
| Step 7 — Post-processing | Mask encoded to Base64 PNG; scores rounded; recommendation looked up. |
| Step 8 — Response | JSON payload returned: mask_b64, label, confidence, recommendation, inference_ms. |
| Step 9 — Render | React renders overlay, confidence bar, recommendation card. |
| Step 10 — Logging | Request metadata (no image) written to PostgreSQL; Prometheus counter incremented. |

### 2.2 High-Level Component Map

| Layer | Component | Technology |
|---|---|---|
| Browser | React SPA | React 18, Tailwind CSS 3, Vite |
| Reverse Proxy | Nginx | Nginx 1.25 (Docker) |
| API Gateway | FastAPI Application | FastAPI 0.110, Python 3.11, Uvicorn |
| AI Inference | ONNX Runtime Session | onnxruntime-cpu 1.17 |
| AI Training | PyTorch Training Loop | PyTorch 2.2, torchvision, Albumentations |
| Async Tasks | Background Jobs | FastAPI BackgroundTasks |
| Primary DB | Relational Store | PostgreSQL 15 (Docker) |
| ORM | Database Abstraction | SQLAlchemy 2.0 + Alembic |
| File Storage | Model & Image Artefacts | Local Volume (dev) / AWS S3 (prod) |
| Caching | Response Cache | Redis 7 (optional, v1.1) |
| Monitoring | Metrics & Alerting | Prometheus + Grafana |
| Logging | Structured Logs | Loguru → stdout → Loki |
| Container Orchestration | Service Management | Docker Compose (dev) / Docker Swarm (prod) |
| CI/CD | Automated Pipeline | GitHub Actions |

---

## 3. AI / ML Stack

### 3.1 Core ML Framework

| Package | Role |
|---|---|
| PyTorch 2.2 | Primary deep learning framework. Dynamic computation graph, native custom loss functions, dominant in medical imaging literature. |
| torchvision 0.17 | Pretrained ResNet-18 and EfficientNet-B0 weights (ImageNet-1k). Used for backbone initialisation. |
| ONNX 1.16 + onnxruntime-cpu 1.17 | Post-training export format. Cross-platform inference without PyTorch at runtime. INT8 quantization via `onnxruntime.quantize_dynamic`. |
| numpy 1.26 | Core numerical operations: mask post-processing, bounding-box extraction, array serialization. |
| Pillow 10 | Image loading, resizing, and Base64 PNG encoding for API response payload. |
| OpenCV 4.9 (cv2) | Morphological operations on predicted masks (erosion, dilation); contour extraction for overlay. |

### 3.2 Model Architecture Details

| Model | Architecture | Parameters | Role |
|---|---|---|---|
| Segmentation | ResUNet (U-Net + ResNet-18 encoder) | ~14.3 M (FP32) → ~3.6 MB INT8 | Pixel-wise binary mask of lesion |
| Classification | EfficientNet-B0 (fine-tuned) | ~5.3 M (FP32) → ~1.4 MB INT8 | Benign / Malignant probability |

### 3.3 Loss Functions

| Loss | Formula / Library | Purpose |
|---|---|---|
| Dice Loss | `1 − (2 × |P ∩ G|) / (|P| + |G|)` — custom PyTorch module | Optimises spatial overlap for segmentation; robust to class imbalance |
| Focal Loss | `−αₜ(1−pₜ)^γ log(pₜ)` — custom PyTorch module (α=0.25, γ=2) | Down-weights easy background pixels; forces focus on hard lesion boundaries |
| Hybrid Loss | `L = 0.5 × Dice + 0.5 × Focal` — applied to segmentation head | Combines geometric and probabilistic objectives for best boundary precision |
| BCE + class weights | `torch.nn.BCEWithLogitsLoss(pos_weight=tensor)` | Classification head; pos_weight compensates for benign-heavy ISIC distribution |

### 3.4 Training Infrastructure

| Setting | Value |
|---|---|
| Training Hardware | NVIDIA GPU (T4 / V100) via Google Colab Pro or local CUDA machine. CPU fallback supported (slow). |
| Optimizer | AdamW (lr=1e-4, weight_decay=1e-4). Cosine annealing LR schedule with warm restarts. |
| Batch Size | 16 (segmentation), 32 (classification). Gradient accumulation if VRAM < 8 GB. |
| Epochs | 100 max with EarlyStopping (patience=15, monitor=val_dice). |
| Mixed Precision | `torch.cuda.amp.autocast()` + GradScaler for FP16 training on GPU. |
| Checkpointing | Best model saved by val_dice / val_AUC. Stored in `/artefacts/checkpoints/`. |

### 3.5 Data Augmentation (Albumentations 1.4)

| Type | Transforms |
|---|---|
| Geometric | `HorizontalFlip(p=0.5)`, `VerticalFlip(p=0.5)`, `Rotate(limit=30, p=0.5)`, `RandomCrop(224,224)` |
| Colour / Intensity | `ColorJitter`, `RandomBrightnessContrast(p=0.3)`, `HueSaturationValue(p=0.2)` |
| Noise | `GaussNoise(var_limit=(10,50), p=0.2)` |
| Normalisation | `Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])` — ImageNet stats |
| Mask Sync | Albumentations applies all spatial transforms identically to image and segmentation mask |

### 3.6 Experiment Tracking

| Tool | Usage |
|---|---|
| Weights & Biases (wandb) | Training curves, sample predictions, confusion matrices, hyperparameter sweeps. Free tier sufficient. |
| MLflow (optional) | Local experiment tracking alternative. Model registry for versioned ONNX artefacts. |
| Pandas + Matplotlib / Seaborn | Offline metric analysis and figure generation for paper (ROC curves, DSC box plots). |
| scikit-learn 1.4 | Evaluation utilities: `roc_auc_score`, `confusion_matrix`, `classification_report`. |

### 3.7 Dataset Management

| Tool | Usage |
|---|---|
| ISIC Archive API | Programmatic download of ISIC 2018 / 2019 / 2020 datasets. Script: `scripts/download_isic.py`. |
| Dataset splits | Stratified train/val/test 70/15/15 split. Split indices persisted as CSV for reproducibility. |
| DVC (Data Version Control) | Large file versioning for datasets and model checkpoints. Backed by Google Drive or S3. |
| `torchvision.datasets` custom | `ISICDataset` class inherits `torch.utils.data.Dataset`; supports lazy loading and caching. |

---

## 4. Backend API Stack

### 4.1 Language & Runtime

| Package | Role |
|---|---|
| Python 3.11 | Latest stable CPython with significant performance improvements. Required for match-case syntax used in recommendation engine. |
| Uvicorn 0.27 (ASGI server) | Lightning-fast ASGI server. Runs under Gunicorn with uvicorn workers in production. |
| Gunicorn 21 | Process manager. Spawns `(2 × CPU_CORES + 1)` Uvicorn workers. Handles graceful reload on model update. |

### 4.2 Web Framework

| Package | Role |
|---|---|
| FastAPI 0.110 | Automatic OpenAPI docs (`/docs`), native async support, Pydantic validation, Python type hint integration. |
| Pydantic v2 | Request/response schema validation and serialization. Strict typing enforces API contract at runtime. |
| python-multipart | Required by FastAPI for `UploadFile` / multipart form parsing. |
| Starlette 0.36 | Underlying ASGI toolkit. Provides middleware, static files, background tasks. |

### 4.3 API Endpoints

| Method + Path | Description | Auth | Response |
|---|---|---|---|
| `POST /api/analyse` | Upload dermoscopic image; returns inference result | No (v1) | 200 AnalyseResponse JSON |
| `GET /api/health` | Liveness check; returns model load status | No | 200 `{status, model_loaded}` |
| `GET /api/metrics` | Prometheus-format metrics scrape endpoint | Internal only | 200 text/plain |
| `GET /docs` | Auto-generated Swagger UI (dev only) | No | HTML |

### 4.4 AI Inference Service

| Component | Description |
|---|---|
| `InferenceService` (Singleton) | Loaded once at FastAPI startup via `@app.on_event('startup')`. Holds ONNX Runtime `InferenceSession` objects for both models. Thread-safe. |
| `onnxruntime.InferenceSession` | Runs INT8 quantized ONNX models. `SessionOptions`: `inter_op_num_threads=4`, `intra_op_num_threads=4`. |
| Pre-processing module | `src/inference/preprocess.py`: resize → normalize → to_numpy. Pure numpy/Pillow, no PyTorch dependency in production. |
| Post-processing module | `src/inference/postprocess.py`: threshold mask at 0.5 → morphological clean-up → bounding box → Base64 encode. |
| Recommendation engine | `src/inference/recommend.py`: rule-based lookup (`match-case`) on `(label, confidence_bucket)`. |

### 4.5 Input Validation & Security Middleware

| Tool | Role |
|---|---|
| python-magic | Validates file MIME type against actual bytes (not extension). Rejects non-image uploads. |
| File size guard | FastAPI middleware limits request body to 20 MB. |
| Dimension check | Pillow reads image dimensions before tensor creation. Min 128×128 enforced. |
| CORS Middleware | `CORSMiddleware` allows only the frontend origin. Configured via `CORS_ORIGINS` env var. |
| Rate Limiting | slowapi (Starlette rate limiter): 30 requests/minute per IP for `/api/analyse`. |
| Trusted Host Middleware | Starlette `TrustedHostMiddleware` rejects requests with unexpected Host headers. |

---

## 5. Frontend Stack

### 5.1 Core Framework

| Package | Role |
|---|---|
| React 18 | Component-based SPA framework. Concurrent rendering features (`useTransition`, `Suspense`) for non-blocking upload progress. |
| Vite 5 | Dev server and build tool. HMR in < 50 ms. Production bundle under 300 KB gzipped. |
| TypeScript 5.4 | Type safety across all components and API client. Maintains API response contract. |
| React Router v6 | Client-side routing. Routes: `/` (upload), `/result/:id`, `/about`. |

### 5.2 Styling & UI

| Package | Role |
|---|---|
| Tailwind CSS 3.4 | Utility-first CSS. JIT compiler included in Vite build. |
| shadcn/ui | Accessible component primitives (Dialog, Progress, Tooltip, Switch). |
| Framer Motion 11 | Animations: upload-to-result transition, confidence bar fill, mask overlay fade-in. |
| Lucide React | Consistent SVG icon set. |
| react-dropzone | Drag-and-drop file input with file-type and size validation hooks. |

### 5.3 State Management & Data Fetching

| Package | Role |
|---|---|
| React Query (TanStack Query v5) | Manages async API state: loading, error, success. Auto-retry on network failure. Caches last result per session. |
| Zustand 4 | Lightweight global state for: current image, current result, UI mode. |
| Axios 1.6 | HTTP client. Interceptors add request timing and standardised error handling. |

### 5.4 Result Visualisation

| Package | Role |
|---|---|
| HTML5 Canvas API | Renders original image with segmentation mask overlay. Opacity slider updates canvas composite operation in real time. |
| Chart.js 4 + react-chartjs-2 | Confidence probability bar chart. Doughnut chart for benign vs malignant breakdown. |
| jsPDF 2.5 | Client-side PDF report generation with image, mask, result, recommendation, and timestamp. |

### 5.5 Testing (Frontend)

| Tool | Role |
|---|---|
| Vitest | Fast unit test runner integrated with Vite. |
| React Testing Library | Component tests for upload flow, error state, result card display. |
| Playwright | End-to-end tests: full upload → analyse → result flow on Chrome and Firefox. |
| MSW (Mock Service Worker) | Intercepts API calls during tests with realistic fixtures. |

---

## 6. Database Stack

### 6.1 Primary Database

| Component | Description |
|---|---|
| PostgreSQL 15 | ACID compliance, JSONB support, robust full-text search, excellent Docker support. |
| Docker image | `postgres:15-alpine` (smallest footprint). Persistent volume at `/var/lib/postgresql/data`. |
| Connection pooling | PgBouncer 1.22 in transaction mode. Pool size 20. |
| Backups | `pg_dump` cron job every 6 hours. Stored in `/backups/` volume (dev) or S3 (prod). |

### 6.2 ORM & Migrations

| Package | Role |
|---|---|
| SQLAlchemy 2.0 (async) | Async ORM with asyncpg driver. All DB operations non-blocking. Declarative models with type annotations. |
| asyncpg 0.29 | High-performance async PostgreSQL driver. Used by SQLAlchemy for all queries. |
| Alembic 1.13 | Database migration tool. Every schema change is a versioned migration script committed to Git. |

### 6.3 Database Schema

| Table | Key Columns | Type | Purpose |
|---|---|---|---|
| `inference_logs` | id, created_at, label, confidence, inference_ms, image_hash_sha256, recommendation_key | Append-only log | Audit trail of all inference requests |
| `model_versions` | id, model_name, version, onnx_path, dice_score, auc_roc, deployed_at, is_active | Config table | Track which model version is serving |
| `feedback` | id, inference_log_id, clinician_label, notes, created_at | User input | Clinician ground-truth feedback for retraining (v1.1) |
| `sessions` | id, created_at, ip_hash, request_count | Analytics | Anonymous session analytics (no PII) |

---

## 7. File & Model Storage

| Component | Description |
|---|---|
| Local Docker Volume (dev) | `/artefacts/` volume. Holds: ONNX models, training checkpoints, sample images. |
| AWS S3 (prod) | Object storage for ONNX model files and optional inference image cache. Versioned bucket. Access via boto3. |
| boto3 1.34 | AWS SDK. Provides S3 upload/download helpers used by model loader on startup. |
| Model path resolution | `InferenceService` reads `MODEL_DIR` env var. Dev: `/artefacts/models/`. Prod: pre-downloaded from S3 to `/tmp/models/` at container startup. |
| DVC (training artefacts) | Datasets and raw checkpoints tracked with DVC. Remote: Google Drive (free) or S3. Not required for inference container. |

---

## 8. DevOps & Infrastructure

### 8.1 Containerisation

| Component | Description |
|---|---|
| Docker Engine 25 | All services containerised. Each service has its own Dockerfile. |
| Docker Compose v2 | Local development orchestration. Defines: frontend, backend, postgres, nginx, prometheus, grafana. |
| Multi-stage Dockerfile (backend) | Stage 1 (builder): pip install. Stage 2 (runtime): copy minimal artefacts. Final image ~420 MB. |
| Multi-stage Dockerfile (frontend) | Stage 1 (builder): npm ci + vite build. Stage 2 (nginx): serve dist/ from nginx:alpine. Final image ~25 MB. |

### 8.2 Reverse Proxy (Nginx 1.25)

- TLS termination and HTTP → HTTPS redirect
- Static file serving for React build
- Upstream proxy to FastAPI (`http://backend:8000`)
- Gzip compression
- Security headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`
- Rate limiting: `limit_req_zone` as defence-in-depth

### 8.3 CI/CD Pipeline (GitHub Actions)

| Stage | Trigger | Steps |
|---|---|---|
| Lint & Type-check | Every push / PR | ruff (Python), mypy, eslint, tsc --noEmit |
| Unit Tests | Every push / PR | pytest (backend), vitest (frontend) |
| Integration Tests | PR to main | docker-compose up → Playwright E2E tests |
| Build Images | Merge to main | docker build, push to GitHub Container Registry |
| Deploy (staging) | Merge to main | SSH to staging server, docker-compose pull && up -d |
| Deploy (prod) | Manual trigger or tag push | Same as staging with prod env vars |

### 8.4 Hosting Options

| Environment | Platform | Notes |
|---|---|---|
| Development | Local Docker Compose | All services on localhost. No cloud costs. |
| Research Demo | Single VPS (4 vCPU, 8 GB RAM) | DigitalOcean Droplet or AWS EC2 t3.large (~$40/mo). |
| Production (scale) | AWS EC2 + RDS + S3 | EC2 for API, RDS PostgreSQL, S3 for models. ALB for load balancing. |
| Serverless (future) | AWS Lambda + API Gateway | ONNX inference cold start ~800 ms. Not suitable for v1 latency target. |

---

## 9. Monitoring & Observability

| Tool | Description |
|---|---|
| Prometheus 2.50 | Scrapes `/api/metrics` every 15 s. Custom metrics: `cutisai_inference_duration_seconds`, `cutisai_requests_total`, `cutisai_errors_total`. |
| Grafana 10 | Dashboards for request rate, p50/p95/p99 latency, error rate, malignant prediction rate. Alerting on error rate > 1%. |
| Loguru (Python) | Structured JSON logging to stdout. INFO for requests, WARNING for validation errors, ERROR for inference failures. |
| Loki + Promtail (optional) | Log aggregation for multi-instance deployments. |
| Sentry (frontend) | Captures uncaught JS exceptions and API call failures. Source maps uploaded in CI. |
| UptimeRobot (free tier) | External uptime monitoring. Alerts via email if `/api/health` returns non-200. |

---

## 10. Security Architecture

| Control | Implementation |
|---|---|
| HTTPS Only | All traffic encrypted via TLS 1.2+. HTTP permanently redirected via nginx. |
| Input Validation | File type (python-magic byte check), size (20 MB limit), dimensions (min 128×128). |
| No Image Persistence | Default mode: uploaded images processed in-memory only. SHA-256 hash stored for cache keying. |
| SQL Injection Prevention | All DB queries via SQLAlchemy ORM with parameterised statements. No raw SQL strings. |
| CORS | Strict origin allowlist. Credentials not allowed. Only GET/POST methods permitted. |
| Rate Limiting | slowapi: 30 req/min/IP on `/api/analyse`. nginx: 10 req/s burst. |
| Dependency Scanning | GitHub Dependabot + pip-audit in CI pipeline. |
| Content Security Policy | CSP header blocks inline scripts; restricts resource origins. |
| Non-root containers | All containers run as non-root users (`USER appuser` in Dockerfiles). |
| Secret rotation | DB passwords and API keys rotated every 90 days. Procedure in `RUNBOOK.md`. |

---

## 11. Testing Strategy

| Test Type | Tool | Coverage Target | What Is Tested |
|---|---|---|---|
| Unit (backend) | pytest 8 + pytest-asyncio | 90% line coverage | Preprocessing, postprocessing, recommendation logic, DB models |
| Unit (frontend) | Vitest + RTL | 80% line coverage | API client, component rendering, state transitions |
| Integration (API) | pytest + httpx (AsyncClient) | All endpoints | Full request/response cycle with test DB |
| E2E | Playwright | Core user flows | Upload → analyse → result on Chrome, Firefox, Safari |
| Model regression | Custom pytest fixture | Run on every model update | DSC and AUC-ROC on held-out 50-image test subset |
| Performance | Locust 2.24 | Baseline per release | 50 concurrent users; assert p95 latency < 3 s |
| Security | OWASP ZAP (baseline scan) | Pre-release | Automated vulnerability scan of API endpoints |

---

## 12. Repository Structure

```
/ (root)
├── docker-compose.yml
├── .env.example
├── README.md
├── RUNBOOK.md
├── .github/workflows/
│
├── /backend                  # FastAPI application
│   ├── src/
│   │   ├── api/
│   │   ├── inference/
│   │   ├── db/
│   │   └── core/
│   ├── tests/
│   └── requirements-api.txt
│
├── /frontend                 # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── store/
│   ├── tests/
│   └── package.json
│
├── /training                 # PyTorch training scripts
│   ├── src/
│   │   ├── models/
│   │   ├── datasets/
│   │   ├── losses/
│   │   ├── train.py
│   │   └── eval.py
│   └── requirements-train.txt
│
├── /artefacts                # ONNX models (DVC-tracked)
├── /nginx                    # nginx.conf, ssl/
├── /infra                    # Prometheus config, Grafana dashboards
├── /docs                     # Architecture diagrams, paper figures
└── /scripts                  # download_isic.py, export_onnx.py, quantize.py
```

---

## 13. Full Dependency Version Reference

### 13.1 Python — `requirements-api.txt`

```
fastapi==0.110.0
uvicorn[standard]==0.27.1
gunicorn==21.2.0
pydantic==2.6.4
pydantic-settings==2.2.1
python-multipart==0.0.9
onnxruntime==1.17.1
numpy==1.26.4
Pillow==10.2.0
opencv-python-headless==4.9.0.80
sqlalchemy[asyncio]==2.0.28
asyncpg==0.29.0
alembic==1.13.1
python-magic==0.4.27
slowapi==0.1.9
loguru==0.7.2
prometheus-fastapi-instrumentator==6.1.0
boto3==1.34.51
python-dotenv==1.0.1
httpx==0.27.0
```

### 13.2 Python — `requirements-train.txt` (GPU environment)

```
torch==2.2.1+cu121
torchvision==0.17.1+cu121
onnx==1.16.0
albumentations==1.4.1
scikit-learn==1.4.1
pandas==2.2.1
matplotlib==3.8.3
seaborn==0.13.2
wandb==0.16.4
tqdm==4.66.2
dvc[s3]==3.41.0
```

### 13.3 Node.js — `package.json`

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "6.22.3",
    "@tanstack/react-query": "5.24.1",
    "zustand": "4.5.2",
    "axios": "1.6.7",
    "react-dropzone": "14.2.3",
    "framer-motion": "11.0.8",
    "chart.js": "4.4.2",
    "react-chartjs-2": "5.2.0",
    "jspdf": "2.5.1",
    "lucide-react": "0.356.0"
  },
  "devDependencies": {
    "typescript": "5.4.2",
    "vite": "5.1.6",
    "tailwindcss": "3.4.1",
    "vitest": "1.3.1",
    "@testing-library/react": "14.2.2",
    "playwright": "1.42.1",
    "msw": "2.2.7"
  }
}
```

---

## 14. Technology Decision Log

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| ML Framework | PyTorch 2.2 | TensorFlow 2.x, JAX | Dominates medical imaging literature; dynamic graph essential for custom loss functions; better ONNX export support |
| Segmentation Backbone | ResUNet (ResNet-18) | SegFormer, DeepLabV3+, Swin-UNet | ResNet-18 encoder keeps parameter count low; residual connections improve gradient flow; < 14 M params vs 85 M+ for transformer models |
| Classification Model | EfficientNet-B0 | ResNet-50, DenseNet-121, VGG-16 | Best accuracy/compute ratio on ImageNet; 5.3 M params; proven on skin lesion benchmarks in literature |
| Inference Runtime | ONNX Runtime INT8 | TorchScript, TensorRT, OpenVINO | ONNX is framework-agnostic; INT8 gives ~4x speedup on CPU; TensorRT requires NVIDIA GPU |
| API Framework | FastAPI | Flask, Django REST, Express.js | Native async, automatic OpenAPI docs, Pydantic integration, fastest Python framework in benchmarks |
| Database | PostgreSQL | MySQL, SQLite, MongoDB | JSONB for flexible metadata, proven reliability, best SQLAlchemy async support; SQLite insufficient for multi-process |
| Frontend Framework | React 18 | Vue 3, Svelte, Angular | Largest ecosystem, best Canvas API integration libraries, team familiarity, React Query maturity |
| CSS Framework | Tailwind CSS | Bootstrap, Material UI, Chakra UI | Utility-first approach faster for custom medical UI; no CSS specificity battles; smaller bundle than component libraries |

---

## 15. Performance Targets & Hardware Requirements

### 15.1 Production Inference (CPU)

| Operation | Target |
|---|---|
| Segmentation inference (ONNX INT8) | < 800 ms on 4-core CPU @ 2.4 GHz |
| Classification inference (ONNX INT8) | < 400 ms on same hardware |
| Pre/post-processing overhead | < 300 ms total |
| API serialization & network | < 200 ms (LAN) / < 1 s (WAN) |
| End-to-end P95 latency (goal) | **< 3 s** |

### 15.2 Minimum Server Requirements

| Component | Requirement |
|---|---|
| CPU | 4 vCPUs (x86-64) |
| RAM | 4 GB (8 GB recommended) |
| Disk | 10 GB (OS + Docker images + models + DB) |
| Network | 100 Mbps. No GPU required. |
| OS | Ubuntu 22.04 LTS or any Linux with Docker 25+ |

---

## Document Control

| Field | Value |
|---|---|
| Document Title | CutisAI — Tech Stack Document |
| Version | 1.0 (Draft) |
| Date | March 2026 |
| Aligned With | PRD v1.0 |
| Next Review | After infrastructure setup complete |

> *This is a living document. All technology version bumps must be recorded here before merging to main. Rationale for changes must be documented in the Decision Log (Section 14).*
