# CutisAI — Product Requirements Document
**Version:** 1.0 (Draft) | **Date:** March 2026 | **Status:** Draft | **Author:** Yash Raj Sharan <yashraj10messi@gmail.com>

> AI-Powered Skin Lesion Detection & Classification System — Research-Grade Deep Learning Framework for Dermoscopic Image Analysis

---

## 1. Executive Summary

CutisAI is a web-based clinical-support application that integrates deep learning to perform automated skin lesion segmentation and malignancy classification from dermoscopic images. The system targets clinicians, dermatologists, and researchers who require an efficient, computationally lightweight alternative to bulky diagnostic pipelines.

The core innovation is a two-stage AI pipeline: a U-Net / ResUNet backbone segments the lesion boundary, followed by a lightweight CNN (ResNet-18 / EfficientNet-B0) that classifies the region as benign or malignant. A hybrid Dice + Focal Loss function addresses the class-imbalance problem inherent in public dermoscopy datasets such as ISIC 2018/2019/2020.

The product is designed to be publishable as a research paper contribution, meeting the evidentiary requirements of IEEE / Springer venues in the domain of medical image analysis.

---

## 2. Problem Statement

### 2.1 Clinical Context

Melanoma accounts for the majority of skin-cancer deaths despite representing a small fraction of diagnoses. Early detection dramatically improves survival rates, yet access to specialist dermatologists is limited globally. Automated dermoscopic analysis can serve as a triage tool to flag high-risk lesions.

### 2.2 Technical Pain Points

| Pain Point | Description |
|---|---|
| High Computational Complexity | Existing SOTA models (SegFormer, DeepLabV3+) demand GPU resources unavailable in resource-constrained clinical settings. |
| Large Model Size | Encoder-heavy architectures exceed 200 MB, making browser or edge deployment impractical. |
| Limited Hardware Efficiency | Standard inference on CPU takes seconds per image, blocking real-time feedback loops. |
| No Integrated Pipeline | Segmentation and classification are typically separate workflows with inconsistent pre-processing, introducing errors. |
| Class Imbalance | ISIC datasets are heavily skewed toward benign lesions, leading to models that underperform on the clinically critical malignant class. |

---

## 3. Proposed Solution & Architecture

### 3.1 High-Level System Overview

The application exposes a single-page web UI through which a user uploads a dermoscopic JPEG/PNG image. The image is forwarded to a Python backend API that executes the two-stage AI pipeline and returns a structured JSON result containing the segmentation mask, classification label, confidence score, and clinical recommendation. Results are rendered in the browser in under three seconds on standard CPU hardware.

### 3.2 AI Pipeline Design

| Stage | Description |
|---|---|
| Stage 1 — Segmentation | U-Net with ResNet-18 encoder (ResUNet variant). Outputs a binary pixel-wise mask isolating the lesion from healthy skin. |
| Stage 2 — Classification | EfficientNet-B0 or ResNet-18 feature extractor. Receives the masked ROI and produces a softmax probability distribution over benign / malignant classes. |
| Loss Function | Hybrid Dice Loss + Focal Loss. Dice handles spatial overlap; Focal down-weights easy negatives to combat class imbalance. |
| Optimization | Model quantization (INT8) and ONNX export reduce inference latency and memory footprint by ~4x versus FP32 PyTorch baseline. |
| Dataset | ISIC 2018 Task 1 & 2 (segmentation + classification), ISIC 2019 / 2020 supplementary. All standard augmentations applied. |

### 3.3 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS. Drag-and-drop image upload, animated inference progress, result dashboard. |
| Backend API | FastAPI (Python). Async REST endpoints; model loaded once at startup. |
| ML Framework | PyTorch (training) + ONNX Runtime (inference). |
| Deployment | Docker container; Nginx reverse proxy. Runnable on a 4 GB RAM server. |
| Storage | Stateless by default; optional session-scoped image cache for demo mode. |

---

## 4. Goals & Non-Goals

### 4.1 Goals

- Deliver a working end-to-end web application where a user uploads a dermoscopic image and receives a segmentation mask, classification, confidence score, and recommended clinical action within 3 seconds.
- Achieve Dice Similarity Coefficient (DSC) >= 0.85 on ISIC 2018 Task 1 test set.
- Achieve AUC-ROC >= 0.88 for binary classification on ISIC 2019 test set.
- Reduce inference model size to < 30 MB (ONNX INT8) without sacrificing more than 2% AUC.
- Produce all artefacts required for a research paper: architecture diagrams, ablation results tables, comparison with baseline models (FCN, SegNet, vanilla U-Net).
- Full responsive UI runnable without a GPU.

### 4.2 Non-Goals

- Not a regulated medical device — outputs are advisory only and do not replace clinician judgment.
- Does not support video or real-time camera input in v1.
- Does not store patient data persistently or comply with HIPAA/DISHA in v1 (research prototype only).
- Does not perform multi-class classification beyond benign / malignant in the primary pipeline.

---

## 5. User Personas & Use Cases

### 5.1 Personas

| Persona | Description |
|---|---|
| Researcher / Author | Primary user. Trains and evaluates models, runs ablation studies, generates tables and charts for paper submission. |
| Clinician / Dermatologist | Secondary user. Uploads patient dermoscopic images for second-opinion triage. Needs result + recommendation in plain language. |
| Student / Demo User | Uploads publicly available test images to explore the tool. Does not have clinical background. |

### 5.2 Core Use Cases

1. User navigates to the web app and sees a landing page explaining the tool.
2. User drags and drops (or clicks to browse) a JPEG/PNG dermoscopic image.
3. System validates image format and dimensions; shows error if invalid.
4. User clicks 'Analyse'. A progress indicator is shown.
5. Backend runs segmentation → mask overlay generated.
6. Backend runs classification on masked ROI → label + confidence score.
7. Frontend displays: original image | segmented mask overlay | classification result | confidence bar | recommended clinical procedure.
8. User can download a PDF report of the result.
9. User can upload another image without page reload.

---

## 6. Functional Requirements

### 6.1 Frontend

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-01 | Accept image uploads via drag-and-drop and file-picker. Supported formats: JPEG, PNG, TIFF. | Must Have | Max file size 20 MB |
| FR-02 | Validate image dimensions (min 128x128 px) and show descriptive error messages. | Must Have | |
| FR-03 | Display upload preview before submission. | Must Have | |
| FR-04 | Show animated progress indicator during inference. | Must Have | |
| FR-05 | Render segmentation mask overlaid on original image with opacity slider. | Must Have | |
| FR-06 | Display classification label (Benign / Malignant) with probability bar. | Must Have | |
| FR-07 | Show recommended clinical action based on classification. | Must Have | Rule-based lookup table |
| FR-08 | Allow downloadable PDF report of full results. | Should Have | |
| FR-09 | Support multiple sequential uploads in a single session. | Should Have | |
| FR-10 | Responsive layout for desktop and tablet. | Should Have | |
| FR-11 | Dark mode toggle. | Could Have | |

### 6.2 Backend API

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-12 | POST /analyse endpoint accepts multipart image and returns JSON result. | Must Have | |
| FR-13 | JSON response includes: mask_base64, label, confidence, recommendation, inference_time_ms. | Must Have | |
| FR-14 | Load ONNX model once at server startup; reuse across requests. | Must Have | |
| FR-15 | Pre-processing pipeline: resize to 256x256, normalize with ImageNet stats, convert to tensor. | Must Have | |
| FR-16 | POST /health endpoint returns model status. | Must Have | |
| FR-17 | Async request handling; support at least 10 concurrent requests. | Should Have | |
| FR-18 | Input sanitisation and file-type verification server-side. | Must Have | |

### 6.3 AI Model

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-19 | Segmentation model: U-Net with ResNet-18 encoder, pretrained on ImageNet. | Must Have | ResUNet variant |
| FR-20 | Classification model: EfficientNet-B0 pretrained, fine-tuned on ISIC. | Must Have | Fallback: ResNet-18 |
| FR-21 | Hybrid loss: weighted sum of Dice Loss and Focal Loss. | Must Have | alpha=0.5 |
| FR-22 | ONNX export of both models post-training. | Must Have | |
| FR-23 | INT8 quantization of exported ONNX models. | Should Have | |
| FR-24 | Ablation study comparing: plain U-Net, ResUNet, loss variants. | Must Have | For paper |
| FR-25 | Evaluation metrics: DSC, IoU, Sensitivity, Specificity, AUC-ROC, F1. | Must Have | |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Inference Latency | < 3 seconds end-to-end on 4-core CPU server (no GPU required). |
| Model Size | Combined ONNX INT8 models < 40 MB total on disk. |
| Uptime | 99% for demo/research server. |
| Security | No raw images persisted beyond request lifecycle in default mode. HTTPS enforced. |
| Browser Support | Chrome 110+, Firefox 110+, Safari 16+, Edge 110+. |
| Accessibility | WCAG 2.1 AA for all interactive elements. |
| Scalability | Stateless API; horizontally scalable via container orchestration. |
| Reproducibility | All training scripts, seeds, and dataset splits versioned in Git. |

---

## 8. Clinical Recommendation Logic

> **Advisory only — not a substitute for clinical diagnosis.**

| Condition | Recommendation |
|---|---|
| Malignant, confidence > 85% | High suspicion of malignancy. Urgent referral to dermatologist recommended. Dermoscopic biopsy advised. |
| Malignant, confidence 60–85% | Moderate suspicion. Schedule dermatologist review within 2 weeks. Monitor for changes. |
| Malignant, confidence < 60% | Low-confidence malignant prediction. Repeat imaging recommended. Clinical review advised. |
| Benign, confidence > 80% | Low-risk lesion. Routine annual skin check recommended. |
| Benign, confidence ≤ 80% | Uncertain benign prediction. Follow up in 3 months with clinical examination. |

---

## 9. Dataset & Training Plan

### 9.1 Datasets

- **ISIC 2018 — Task 1** (Lesion Segmentation): 2,594 training images with ground-truth binary masks.
- **ISIC 2018 — Task 3** (Classification): 10,015 images across 7 diagnostic categories; binary collapse to benign/malignant.
- **ISIC 2019 / 2020** (optional augmentation): 25,331 / 33,126 images for improved class balance.

### 9.2 Data Splits

| Split | Percentage |
|---|---|
| Training | 70% |
| Validation | 15% |
| Test (held-out) | 15% — never seen during training or tuning |

### 9.3 Augmentation Strategy

- Random horizontal and vertical flips
- Random rotation ±30 degrees
- Colour jitter (brightness, contrast, saturation)
- Random crop and resize
- Gaussian noise injection

---

## 10. Project Milestones & Timeline

| Phase | Timeline | Deliverable |
|---|---|---|
| Dataset prep | Week 1–2 | Download, preprocessing scripts, train/val/test split finalized. |
| Segmentation | Week 3–4 | U-Net / ResUNet trained and evaluated (DSC baseline). |
| Classification | Week 5–6 | EfficientNet-B0 trained; hybrid loss ablation complete. |
| Optimization | Week 7 | ONNX export and INT8 quantization; latency benchmarking. |
| Backend | Week 8 | FastAPI backend with /analyse and /health endpoints. |
| Frontend | Week 9 | React frontend: upload, progress, result dashboard. |
| Integration | Week 10 | Integration testing, PDF report feature, Docker packaging. |
| QA | Week 11 | User testing, UI polish, performance profiling. |
| Paper draft | Week 12 | Research paper draft: methodology, experiments, results tables. |
| Submission | Week 13–14 | Paper revision, proofreading, submission. |

---

## 11. Success Metrics

### 11.1 Model Performance Targets

| Metric | Target |
|---|---|
| Dice Similarity Coefficient (Segmentation) | >= 0.85 on ISIC 2018 Task 1 test set |
| IoU / Jaccard (Segmentation) | >= 0.78 |
| AUC-ROC (Classification) | >= 0.88 on ISIC 2019 test set |
| Sensitivity (Recall for Malignant) | >= 0.85 — clinically critical metric |
| Specificity | >= 0.80 |
| F1-Score (Macro) | >= 0.82 |

### 11.2 System Performance Targets

- End-to-end inference latency < 3 s on 4-core CPU.
- Frontend first meaningful paint < 2 s on 4G connection.
- API error rate < 0.5% under normal load.

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Model underfits due to class imbalance | Use Focal Loss + oversampling. Monitor per-class F1 during training. |
| Inference too slow on CPU | ONNX INT8 quantization. Profile and prune heavy layers. |
| Dataset license restrictions | ISIC datasets are freely available for research. Cite correctly in paper. |
| Frontend-backend CORS issues | Configure CORS headers in FastAPI. Use nginx proxy in production. |
| Scope creep into multi-class classification | Pin v1 scope to binary. Note multi-class as future work in paper. |

---

## 13. Future Work (Out of v1 Scope)

- Multi-class classification (melanoma, basal cell carcinoma, squamous cell carcinoma, etc.)
- Transformer-based segmentation backbone (SegFormer, Swin-UNet) for further accuracy gains
- Mobile-optimised model (MobileNetV3) for on-device inference
- DICOM input support for hospital PACS integration
- Federated learning pipeline for privacy-preserving multi-site training
- Full HIPAA / DISHA compliance for clinical deployment

---

## 14. Glossary

| Term | Definition |
|---|---|
| DSC | Dice Similarity Coefficient — overlap measure between predicted and ground-truth masks. |
| IoU | Intersection over Union — alternative spatial overlap metric. |
| AUC-ROC | Area Under the Receiver Operating Characteristic Curve — classification performance metric. |
| ONNX | Open Neural Network Exchange — cross-platform model serialization format. |
| INT8 | 8-bit integer quantization — reduces model size and speeds up inference. |
| ISIC | International Skin Imaging Collaboration — provider of benchmark dermoscopy datasets. |
| Focal Loss | Loss function that down-weights well-classified examples to focus learning on hard cases. |
| Dice Loss | Differentiable approximation of DSC used as a segmentation training objective. |
| ResUNet | U-Net variant using ResNet residual blocks in encoder and decoder. |
| EfficientNet-B0 | Lightweight CNN from Google Brain with compound scaling; 5.3M parameters. |

---

## Document Control

| Field | Value |
|---|---|
| Document Title | CutisAI — Product Requirements Document |
| Version | 1.0 (Draft) |
| Date | March 2026 |
| Next Review | After model training baseline complete (Week 4) |

> *This document is a living specification. Changes must be versioned with changelog entries and reviewed by the project lead before implementation.*
