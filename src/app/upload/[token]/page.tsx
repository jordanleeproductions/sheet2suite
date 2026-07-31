'use client';

import React, { useState, useEffect } from 'react';
import { Camera, UploadCloud, Heart, CheckCircle2, AlertCircle, Image as ImageIcon, Video as VideoIcon, X, Sparkles, RefreshCw, User, MessageSquare } from 'lucide-react';

interface UploadPageProps {
  params: {
    token: string;
  };
}

interface FilePreviewItem {
  id: string;
  file: File;
  previewUrl: string;
  isCustomVideo: boolean;
}

export default function GuestUploadPage({ params }: UploadPageProps) {
  const { token } = params;

  // Metadata State
  const [weddingName, setWeddingName] = useState<string>('Our Wedding');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(true);

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState<FilePreviewItem[]>([]);
  const [uploaderName, setUploaderName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch Metadata & Verify Token
  useEffect(() => {
    async function fetchMeta() {
      try {
        setIsLoadingMeta(true);
        const res = await fetch(`/api/upload/${token}`);
        if (!res.ok) {
          setIsValidToken(false);
          setIsLoadingMeta(false);
          return;
        }
        const data = await res.json();
        setWeddingName(data.weddingName || 'Our Wedding');
        setIsValidToken(true);
      } catch (err) {
        console.error('Failed to verify token:', err);
        setIsValidToken(false);
      } finally {
        setIsLoadingMeta(false);
      }
    }
    fetchMeta();
  }, [token]);

  // Clean up ObjectURLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    const newItems: FilePreviewItem[] = newFiles.map((file, idx) => {
      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);
      return {
        id: `${file.name}-${file.lastModified}-${idx}-${Math.random()}`,
        file,
        previewUrl,
        isCustomVideo: isVideo,
      };
    });

    setSelectedFiles(prev => [...prev, ...newItems]);
    setErrorMessage('');
    e.target.value = ''; // Reset input
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || isUploading) return;

    try {
      setIsUploading(true);
      setUploadProgress(15);
      setErrorMessage('');

      const formData = new FormData();
      selectedFiles.forEach(item => {
        formData.append('files', item.file);
      });
      formData.append('uploaderName', uploaderName);
      formData.append('caption', caption);

      setUploadProgress(55);

      const res = await fetch(`/api/upload/${token}`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload photos');
      }

      setUploadProgress(100);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'An error occurred while uploading. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    selectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setSelectedFiles([]);
    setUploaderName('');
    setCaption('');
    setIsSuccess(false);
    setUploadProgress(0);
    setErrorMessage('');
  };

  if (isLoadingMeta) {
    return (
      <div style={styles.fullscreenCenter}>
        <RefreshCw size={36} className="spin" style={{ color: '#cda250', marginBottom: '1rem' }} />
        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', color: '#9ca3af' }}>
          VERIFYING GUEST UPLOAD PORTAL...
        </p>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div style={styles.fullscreenCenter}>
        <div style={styles.errorCard}>
          <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#111827' }}>
            Invalid or Expired Link
          </h2>
          <p style={{ fontFamily: 'sans-serif', fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            This guest upload link is invalid or has expired. Please request a new photo upload link from the couple or event host.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Top Banner Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Heart size={20} style={{ color: '#cda250', fill: '#cda250' }} />
          <span style={styles.weddingTag}>{weddingName.toUpperCase()}</span>
        </div>
        <h1 style={styles.mainHeading}>Share Your Wedding Photos & Videos</h1>
        <p style={styles.subHeading}>
          Upload photos directly from your phone into the couple’s personal Google Drive folder!
        </p>
      </header>

      {/* Main Upload Form Card */}
      <div style={styles.card}>
        {isSuccess ? (
          <div style={styles.successState}>
            <div style={styles.successIconWrapper}>
              <CheckCircle2 size={48} style={{ color: '#10b981' }} />
            </div>
            <h2 style={styles.successTitle}>Thank You for Sharing!</h2>
            <p style={styles.successMessage}>
              Your photos & videos have been safely saved to <strong>{weddingName}’s</strong> Google Drive folder.
            </p>

            <button type="button" onClick={resetUploadForm} style={styles.uploadMoreBtn}>
              <Camera size={18} style={{ marginRight: '0.4rem' }} /> UPLOAD MORE PHOTOS
            </button>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} style={styles.form}>
            {/* File Dropzone & Camera Buttons */}
            <div style={styles.dropZone}>
              <div style={styles.dropZoneIconCircle}>
                <UploadCloud size={32} style={{ color: '#cda250' }} />
              </div>
              <h3 style={styles.dropZoneTitle}>Select Photos & Videos</h3>
              <p style={styles.dropZoneSub}>Choose from gallery or take a photo with your camera</p>

              <div style={styles.buttonRow}>
                <label style={styles.pickFileLabel}>
                  <ImageIcon size={16} style={{ marginRight: '0.4rem' }} /> CHOOSE FROM GALLERY
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>

                <label style={styles.cameraLabel}>
                  <Camera size={16} style={{ marginRight: '0.4rem' }} /> TAKE PHOTO
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Selected File Previews Grid */}
            {selectedFiles.length > 0 && (
              <div style={styles.previewsSection}>
                <div style={styles.previewSectionHeader}>
                  <span style={styles.previewCountTitle}>
                    SELECTED FILES ({selectedFiles.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    style={styles.clearAllBtn}
                  >
                    CLEAR ALL
                  </button>
                </div>

                <div style={styles.previewGrid}>
                  {selectedFiles.map(item => (
                    <div key={item.id} style={styles.previewCard}>
                      {item.isCustomVideo ? (
                        <div style={styles.videoBadgeOverlay}>
                          <VideoIcon size={24} style={{ color: '#ffffff' }} />
                          <span style={styles.videoFileName}>{item.file.name}</span>
                        </div>
                      ) : (
                        <img src={item.previewUrl} alt={item.file.name} style={styles.previewImage} />
                      )}

                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        style={styles.removeFileBtn}
                        title="Remove File"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader Name & Message Inputs */}
            <div style={styles.inputsSection}>
              <div style={styles.fieldGroup}>
                <label style={styles.inputLabel}>
                  <User size={13} style={{ marginRight: '0.35rem' }} /> YOUR NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aunt Sarah & Uncle John"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  style={styles.textInput}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.inputLabel}>
                  <MessageSquare size={13} style={{ marginRight: '0.35rem' }} /> CONGRATULATORY NOTE / CAPTION (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  placeholder="Wishing you a lifetime of love and happiness!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={styles.textareaInput}
                />
              </div>
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div style={styles.errorNotice}>
                <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Upload Progress Bar */}
            {isUploading && (
              <div style={styles.progressContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'monospace', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  <span>UPLOADING TO GOOGLE DRIVE...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{ ...styles.progressBarFill, width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Submit Upload Trigger */}
            <button
              type="submit"
              disabled={selectedFiles.length === 0 || isUploading}
              style={{
                ...styles.submitBtn,
                opacity: selectedFiles.length === 0 || isUploading ? 0.6 : 1,
                cursor: selectedFiles.length === 0 || isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              {isUploading ? (
                <>
                  <RefreshCw size={18} className="spin" style={{ marginRight: '0.5rem' }} />
                  UPLOADING {selectedFiles.length} FILES...
                </>
              ) : (
                <>
                  <UploadCloud size={18} style={{ marginRight: '0.5rem' }} />
                  SEND TO GOOGLE DRIVE ({selectedFiles.length})
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Branding */}
      <footer style={styles.footer}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b7280' }}>
          POWERED BY SHEET2VOW • GOOGLE DRIVE INTEGRATION
        </span>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fullscreenCenter: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: '1.5rem',
  },
  errorCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
  },
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    maxWidth: '600px',
    marginBottom: '1.5rem',
  },
  weddingTag: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#cda250',
    letterSpacing: '0.1em',
  },
  mainHeading: {
    fontFamily: 'serif',
    fontSize: '2rem',
    margin: '0.25rem 0 0.5rem 0',
    color: '#ffffff',
  },
  subHeading: {
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.4,
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '560px',
    padding: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  dropZone: {
    border: '2px dashed #475569',
    borderRadius: '12px',
    padding: '1.5rem 1rem',
    textAlign: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dropZoneIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(205, 162, 80, 0.15)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  dropZoneTitle: {
    fontFamily: 'sans-serif',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 0.25rem 0',
    color: '#f8fafc',
  },
  dropZoneSub: {
    fontFamily: 'sans-serif',
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: '0 0 1.25rem 0',
  },
  buttonRow: {
    display: 'flex',
    gap: '0.65rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  pickFileLabel: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: '#cda250',
    color: '#0f172a',
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  cameraLabel: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: '#334155',
    color: '#f8fafc',
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid #475569',
  },
  previewsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  previewSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCountTitle: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#94a3b8',
  },
  clearAllBtn: {
    fontFamily: 'monospace',
    fontSize: '0.65rem',
    color: '#ef4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '0.5rem',
  },
  previewCard: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  videoBadgeOverlay: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: '0.25rem',
    textAlign: 'center',
  },
  videoFileName: {
    fontSize: '0.55rem',
    fontFamily: 'monospace',
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
    marginTop: '0.2rem',
  },
  removeFileBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#ffffff',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  inputsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
  },
  textInput: {
    padding: '0.65rem 0.85rem',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontFamily: 'sans-serif',
  },
  textareaInput: {
    padding: '0.65rem 0.85rem',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontFamily: 'sans-serif',
    resize: 'none',
  },
  errorNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    fontSize: '0.75rem',
    color: '#fca5a5',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  progressBarTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: '#0f172a',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#cda250',
    transition: 'width 0.2s ease',
  },
  submitBtn: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    fontWeight: 700,
    backgroundColor: '#cda250',
    color: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    padding: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  successState: {
    textAlign: 'center',
    padding: '1rem 0',
  },
  successIconWrapper: {
    display: 'inline-flex',
    padding: '1rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    marginBottom: '1rem',
  },
  successTitle: {
    fontFamily: 'serif',
    fontSize: '1.75rem',
    margin: '0 0 0.5rem 0',
    color: '#ffffff',
  },
  successMessage: {
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  uploadMoreBtn: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '0.75rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
  },
};
