// frontend/src/components/layout/UploadZone/UploadZone.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/UploadZone/UploadZone.tsx
// Used in: Doctor Dashboard ImageAnalysis card + User Home UploadCard
// Props:
//   variant: 'compact' (Doctor Panel) | 'large' (User Panel)
//   onFileSelect: callback with the selected File
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useRef, useState } from 'react';
import './UploadZone.css';

interface UploadZoneProps {
  variant?: 'compact' | 'large';
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMb?: number;
}

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const UploadZone: React.FC<UploadZoneProps> = ({
  variant = 'compact',
  onFileSelect,
  accept = 'image/jpeg,image/png,image/tiff',
  maxSizeMb = 20,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback((file: File) => {
    setError(null);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid format. Use JPEG, PNG, or TIFF.');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMb} MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }, [maxSizeMb, onFileSelect]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }, [validateAndSelect]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  }, [validateAndSelect]);

  return (
    <div
      className={[
        'upload-zone',
        `upload-zone--${variant}`,
        isDragging ? 'upload-zone--dragging' : '',
        preview ? 'upload-zone--has-preview' : '',
      ].filter(Boolean).join(' ')}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload dermoscopic image"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="upload-zone__input"
        onChange={onInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {preview ? (
        <div className="upload-zone__preview">
          <img src={preview} alt="Selected lesion" className="upload-zone__preview-img" />
          <button
            className="upload-zone__change-btn"
            onClick={(e) => { e.stopPropagation(); setPreview(null); }}
            aria-label="Remove image"
          >
            Change image
          </button>
        </div>
      ) : (
        <div className="upload-zone__content">
          <div className="upload-zone__icon-circle">
            <UploadIcon />
          </div>
          <p className="upload-zone__title serif">
            {isDragging ? 'Release to upload' : 'Drop your photo here'}
          </p>
          <p className="upload-zone__sub">
            {variant === 'large'
              ? 'or click to browse — JPEG, PNG, TIFF up to 20 MB'
              : 'or click to browse — JPEG / PNG / TIFF'}
          </p>
          {variant === 'large' && (
            <div className="upload-zone__tips">
              {['Good lighting', 'Lesion centered', 'No blur'].map((tip) => (
                <span key={tip} className="upload-zone__tip mono">{tip}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="upload-zone__error" role="alert">{error}</p>
      )}
    </div>
  );
};

export default UploadZone;
