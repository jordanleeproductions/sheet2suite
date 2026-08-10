'use client';

import React, { useState, useEffect } from 'react';
import { HardDrive, Folder, FolderPlus, Check, X, Search, ChevronRight, ArrowLeft } from 'lucide-react';

export interface SelectedFolder {
  id?: string;
  name: string;
  path: string;
}

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folder: SelectedFolder) => void;
  accessToken?: string;
  initialPath?: string;
}

const DEFAULT_FOLDERS: SelectedFolder[] = [
  { id: 'root_s2v', name: 'Sheet2Vow', path: 'My Drive / Sheet2Suite / Sheet2Vow' },
  { id: 'wedding_plan', name: 'Wedding Planning', path: 'My Drive / Wedding Planning' },
  { id: 'my_drive_root', name: 'My Drive (Root)', path: 'My Drive' },
];

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFolder,
  accessToken,
  initialPath = 'My Drive / Sheet2Suite / Sheet2Vow',
}) => {
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>(initialPath);
  const [customPathInput, setCustomPathInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [isPickerLoaded, setIsPickerLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Load Google API Client Script for Native Google Picker API
    if (typeof window !== 'undefined' && !(window as any).gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).gapi) {
          (window as any).gapi.load('picker', () => {
            setIsPickerLoaded(true);
          });
        }
      };
      document.body.appendChild(script);
    } else if (typeof window !== 'undefined' && (window as any).gapi) {
      (window as any).gapi.load('picker', () => {
        setIsPickerLoaded(true);
      });
    }
  }, []);

  if (!isOpen) return null;

  // Trigger Native Google Picker API Modal if available
  const handleLaunchNativeGooglePicker = () => {
    if (typeof window === 'undefined' || !(window as any).google?.picker || !accessToken) {
      setShowCustomInput(true);
      return;
    }

    try {
      const google = (window as any).google;
      const docsView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setSelectFolderEnabled(true)
        .setIncludeFolders(true);

      const picker = new google.picker.PickerBuilder()
        .addView(docsView)
        .setOAuthToken(accessToken)
        .setTitle('Select Google Drive Destination Folder')
        .setCallback((data: any) => {
          if (data.action === google.picker.Action.PICKED) {
            const doc = data.docs[0];
            const folderName = doc.name || 'Sheet2Vow';
            const folderPath = `My Drive / ${folderName}`;
            onSelectFolder({
              id: doc.id,
              name: folderName,
              path: folderPath,
            });
            onClose();
          }
        })
        .build();

      picker.setVisible(true);
    } catch (err) {
      console.warn('Native Google Picker failed, falling back to interactive dialog:', err);
      setShowCustomInput(true);
    }
  };

  const filteredFolders = DEFAULT_FOLDERS.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        backdropFilter: 'blur(4px)',
        fontFamily: 'sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          color: '#111827',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <HardDrive size={22} style={{ color: '#4285F4' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Select Google Drive Target Folder</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                Choose where Sheet2Vow creates your wedding database spreadsheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Native Picker Banner Action */}
          {accessToken && isPickerLoaded && (
            <button
              type="button"
              onClick={handleLaunchNativeGooglePicker}
              style={{
                width: '100%',
                backgroundColor: '#eff6ff',
                border: '1.5px solid #3b82f6',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#1d4ed8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <HardDrive size={16} />
              <span>OPEN NATIVE GOOGLE DRIVE FOLDER PICKER DIALOG</span>
            </button>
          )}

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search Drive Folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.825rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Preset Folders List */}
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.625rem', letterSpacing: '0.05em' }}>
              RECOMMENDED GOOGLE DRIVE FOLDERS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredFolders.map((folder) => {
                const isSelected = selectedFolderPath === folder.path;
                return (
                  <div
                    key={folder.path}
                    onClick={() => setSelectedFolderPath(folder.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: `2px solid ${isSelected ? '#111827' : '#e5e7eb'}`,
                      backgroundColor: isSelected ? '#f9fafb' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Folder size={20} style={{ color: isSelected ? '#111827' : '#4285F4' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{folder.name}</div>
                        <div style={{ fontSize: '0.725rem', color: '#6b7280', fontFamily: 'monospace' }}>📁 {folder.path}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ backgroundColor: '#111827', color: '#ffffff', borderRadius: '50%', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Folder Path Input Toggle */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: 0,
              }}
            >
              <FolderPlus size={16} />
              <span>+ Specify custom Google Drive folder path...</span>
            </button>
          ) : (
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                CUSTOM GOOGLE DRIVE FOLDER PATH
              </label>
              <input
                type="text"
                placeholder="e.g. My Drive / Wedding Planning / 2026"
                value={customPathInput}
                onChange={(e) => {
                  setCustomPathInput(e.target.value);
                  setSelectedFolderPath(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.825rem',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
            Selected: <strong>{selectedFolderPath}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectFolder({
                  name: selectedFolderPath.split('/').pop()?.trim() || 'Sheet2Vow',
                  path: selectedFolderPath,
                });
                onClose();
              }}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: '#111827',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Check size={14} />
              <span>SELECT FOLDER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDrivePickerModal;
