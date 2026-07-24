// frontend/src/utils/generatePdf.ts
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/utils/generatePdf.ts
// Generates a professional PDF report from analysis result
// Uses only browser APIs — no external library needed
// ─────────────────────────────────────────────────────────────────────────────

interface PdfResult {
  label: 'malignant' | 'benign';
  confidence: number;          // 0–1
  mask_base64: string | null;
  originalImageUrl: string | null;
  inference_time_ms: number;
  recommendation: string;
}

export const generatePdf = (result: PdfResult): void => {
  const isMal    = result.label === 'malignant';
  const confPct  = (result.confidence * 100).toFixed(1);
  const inferSec = (result.inference_time_ms / 1000).toFixed(2);
  const now      = new Date().toLocaleString('en-GB', {
    day:'numeric', month:'long', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  // Build HTML for the PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>CutisAI Report — ${now}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

  * { box-sizing:border-box; margin:0; padding:0; }
  body {
    font-family: 'Geist', Arial, sans-serif;
    background: #090D16;
    color: #F8FAFC;
    padding: 48px;
    font-size: 13px;
    line-height: 1.6;
    max-width: 720px;
    margin: 0 auto;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 2px solid #0EA5E9;
    margin-bottom: 32px;
  }
  .logo-name {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 26px;
    color: #0EA5E9;
    letter-spacing: -0.3px;
  }
  .logo-sub {
    font-size: 11px;
    color: #A89D94;
    margin-top: 2px;
    font-family: monospace;
    letter-spacing: 0.5px;
  }
  .header-right {
    text-align: right;
    font-size: 11px;
    color: #8A7E75;
    font-family: monospace;
  }
  .report-id {
    font-size: 13px;
    font-weight: 600;
    color: #4A1228;
    margin-bottom: 4px;
  }

  /* Disclaimer */
  .disclaimer {
    background: #FFF8F4;
    border: 1px solid rgba(201,99,122,0.2);
    border-left: 3px solid #C9637A;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 11px;
    color: #8A7E75;
    font-style: italic;
    margin-bottom: 28px;
    line-height: 1.55;
  }

  /* Section titles */
  .section-title {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #A89D94;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(107,30,58,0.08);
  }

  /* Primary result */
  .result-block {
    background: #FFFFFF;
    border: 1px solid rgba(107,30,58,0.10);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }
  .result-label-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  .tag-mal { background: rgba(201,99,122,0.1); color: #993556; border: 1px solid rgba(201,99,122,0.2); }
  .tag-ben { background: rgba(74,103,65,0.1);  color: #3B6D11; border: 1px solid rgba(74,103,65,0.2); }

  .diagnosis-value {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 32px;
    color: ${isMal ? '#C9637A' : '#4A6741'};
    margin-bottom: 16px;
    line-height: 1;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 16px;
  }
  .metric-box {
    background: #FAF7F2;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }
  .metric-box-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #A89D94;
    margin-bottom: 4px;
  }
  .metric-box-value {
    font-family: monospace;
    font-size: 18px;
    font-weight: 500;
    color: #4A1228;
  }

  /* Confidence bars */
  .conf-section { margin-bottom: 24px; }
  .conf-row { margin-bottom: 10px; }
  .conf-label-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 5px;
  }
  .conf-track {
    height: 6px;
    background: #EDE4D6;
    border-radius: 3px;
    overflow: hidden;
  }
  .conf-fill {
    height: 100%;
    border-radius: 3px;
  }

  /* Recommendation */
  .rec-block {
    background: ${isMal ? 'rgba(201,99,122,0.06)' : 'rgba(74,103,65,0.06)'};
    border: 1px solid ${isMal ? 'rgba(201,99,122,0.2)' : 'rgba(74,103,65,0.2)'};
    border-radius: 10px;
    padding: 16px 18px;
    margin-bottom: 24px;
  }
  .rec-title {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${isMal ? '#C9637A' : '#4A6741'};
    margin-bottom: 8px;
  }
  .rec-body {
    font-size: 13px;
    color: #5A6E7A;
    line-height: 1.7;
  }

  /* Image */
  .img-block {
    background: #FFFFFF;
    border: 1px solid rgba(107,30,58,0.10);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    text-align: center;
  }
  .lesion-img {
    max-width: 240px;
    border-radius: 8px;
    margin: 0 auto;
  }

  /* Technical info */
  .tech-table { width: 100%; border-collapse: collapse; }
  .tech-table td {
    padding: 8px 12px;
    font-size: 12px;
    border-bottom: 1px solid rgba(107,30,58,0.06);
  }
  .tech-table td:first-child {
    font-weight: 600;
    color: #8A7E75;
    width: 180px;
    font-size: 11px;
    letter-spacing: 0.3px;
  }
  .tech-table td:last-child { font-family: monospace; color: #3D4F5C; }

  /* Footer */
  .pdf-footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid rgba(107,30,58,0.08);
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #C4BAB0;
    font-family: monospace;
  }

  @media print {
    body { padding: 32px; background: white; }
  }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div>
    <div class="logo-name">◈ CutisAI</div>
    <div class="logo-sub">AI-POWERED SKIN LESION ANALYSIS · v2.1</div>
  </div>
  <div class="header-right">
    <div class="report-id">Analysis Report</div>
    <div>${now}</div>
    <div style="margin-top:4px;color:#C4BAB0">ResUNet + EfficientNet-B0</div>
  </div>
</div>

<!-- Disclaimer -->
<div class="disclaimer">
  ⚠ This report is generated by an AI model for informational and research purposes only.
  It is not a medical diagnosis and should not replace the assessment of a qualified dermatologist or healthcare professional.
  Always seek professional medical advice for any skin concerns.
</div>

<!-- Primary Result -->
<div class="result-block">
  <div class="section-title">Primary Diagnosis</div>
  <div class="result-label-tag ${isMal ? 'tag-mal' : 'tag-ben'}">${isMal ? 'High Risk' : 'Low Risk'}</div>
  <div class="diagnosis-value">${isMal ? 'Malignant Lesion' : 'Benign Lesion'}</div>

  <div class="metrics-grid">
    <div class="metric-box">
      <div class="metric-box-label">Confidence</div>
      <div class="metric-box-value" style="color:${isMal?'#C9637A':'#4A6741'}">${confPct}%</div>
    </div>
    <div class="metric-box">
      <div class="metric-box-label">Infer. time</div>
      <div class="metric-box-value">${inferSec}s</div>
    </div>
    <div class="metric-box">
      <div class="metric-box-label">Model</div>
      <div class="metric-box-value" style="font-size:13px">EffNet-B0</div>
    </div>
  </div>
</div>

<!-- Confidence bars -->
<div class="conf-section">
  <div class="section-title">Confidence Breakdown</div>
  <div class="conf-row">
    <div class="conf-label-row">
      <span>Malignant</span>
      <span style="font-family:monospace;color:${isMal?'#C9637A':'#C4BAB0'}">${isMal ? confPct : (100-parseFloat(confPct)).toFixed(1)}%</span>
    </div>
    <div class="conf-track">
      <div class="conf-fill" style="width:${isMal ? confPct : (100-parseFloat(confPct)).toFixed(1)}%;background:#C9637A;"></div>
    </div>
  </div>
  <div class="conf-row">
    <div class="conf-label-row">
      <span>Benign</span>
      <span style="font-family:monospace;color:${!isMal?'#4A6741':'#C4BAB0'}">${!isMal ? confPct : (100-parseFloat(confPct)).toFixed(1)}%</span>
    </div>
    <div class="conf-track">
      <div class="conf-fill" style="width:${!isMal ? confPct : (100-parseFloat(confPct)).toFixed(1)}%;background:#4A6741;"></div>
    </div>
  </div>
</div>

<!-- Recommendation -->
<div class="rec-block">
  <div class="rec-title">Clinical Recommendation</div>
  <div class="rec-body">${result.recommendation}</div>
</div>

${result.originalImageUrl ? `
<!-- Image -->
<div class="img-block">
  <div class="section-title">Analysed Image</div>
  <img src="${result.originalImageUrl}" alt="Lesion image" class="lesion-img"/>
  ${result.mask_base64 ? `<img src="data:image/png;base64,${result.mask_base64}" alt="Segmentation mask" class="lesion-img" style="margin-top:8px;opacity:0.7"/>` : ''}
</div>
` : ''}

<!-- Technical info -->
<div class="section-title" style="margin-top:8px">Technical Details</div>
<table class="tech-table">
  <tr><td>Segmentation model</td><td>ResUNet (ResNet18 encoder) · INT8</td></tr>
  <tr><td>Classification model</td><td>EfficientNet-B0 · INT8</td></tr>
  <tr><td>Inference device</td><td>CPU · ONNX Runtime</td></tr>
  <tr><td>Inference time</td><td>${inferSec}s (${result.inference_time_ms}ms)</td></tr>
  <tr><td>Training dataset</td><td>ISIC 2018 · 33,126 images</td></tr>
  <tr><td>Segmentation DSC</td><td>0.9007 (target ≥ 0.85)</td></tr>
  <tr><td>Classification AUC-ROC</td><td>0.9564 (target ≥ 0.88)</td></tr>
  <tr><td>Report generated</td><td>${now}</td></tr>
</table>

<!-- Footer -->
<div class="pdf-footer">
  <span>CutisAI v2.1 · Research Prototype · Not for clinical deployment</span>
  <span>Generated ${now}</span>
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`;

  // Open in new window and trigger print dialog
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) {
    alert('Please allow popups for this site to download the PDF report.');
    return;
  }
  win.document.write(html);
  win.document.close();
};
