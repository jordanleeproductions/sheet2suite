'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Folder,
  FolderPlus,
  Users,
  Star,
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  Check,
  RefreshCw,
  MoreVertical,
  Grid,
  List as ListIcon,
  FolderOpen
} from 'lucide-react';

export interface DriveFolderItem {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  itemCount?: number;
  updatedAt?: string;
  isShared?: boolean;
  isStarred?: boolean;
  folderColorRgb?: string;
}

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

type DriveScope = 'my-drive' | 'shared-with-me' | 'shared-drives' | 'starred';

// Mock preset drive hierarchy for instant offline / dev mode
const MOCK_DRIVE_HIERARCHY: Record<string, DriveFolderItem[]> = {
  'root': [
    { id: 'f_sheet2suite', name: 'Sheet2Suite', parentId: 'root', path: 'My Drive / Sheet2Suite', itemCount: 3, updatedAt: 'Today' },
    { id: 'f_wedding', name: 'Wedding Planning 2026', parentId: 'root', path: 'My Drive / Wedding Planning 2026', itemCount: 8, updatedAt: 'Yesterday' },
    { id: 'f_personal', name: 'Personal & Household', parentId: 'root', path: 'My Drive / Personal & Household', itemCount: 12, updatedAt: 'Aug 5, 2026' },
  ],
  'f_sheet2suite': [
    { id: 'f_sheet2vow', name: 'Sheet2Vow', parentId: 'f_sheet2suite', path: 'My Drive / Sheet2Suite / Sheet2Vow', itemCount: 5, updatedAt: 'Today' },
    { id: 'f_sheet2finance', name: 'Sheet2Finance', parentId: 'f_sheet2suite', path: 'My Drive / Sheet2Suite / Sheet2Finance', itemCount: 2, updatedAt: 'Aug 1, 2026' },
  ],
  'f_wedding': [
    { id: 'f_vendors', name: 'Vendor Contracts & Invoices', parentId: 'f_wedding', path: 'My Drive / Wedding Planning 2026 / Vendor Contracts & Invoices', itemCount: 14, updatedAt: 'Jul 28, 2026' },
    { id: 'f_photos', name: 'Photo Inspiration & Shots', parentId: 'f_wedding', path: 'My Drive / Wedding Planning 2026 / Photo Inspiration & Shots', itemCount: 42, updatedAt: 'Jul 15, 2026' },
  ],
};

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFolder,
  accessToken,
  initialPath = 'My Drive / Sheet2Suite / Sheet2Vow',
}) => {
  const [driveScope, setDriveScope] = useState<DriveScope>('my-drive');
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [pathHistory, setPathHistory] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' }
  ]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolderItem | null>(null);

  const [folders, setFolders] = useState<DriveFolderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // New inline folder creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const getCurrentBreadcrumbPath = useCallback(() => {
    return pathHistory.map(p => p.name).join(' / ');
  }, [pathHistory]);

  const getEffectiveSelection = useCallback((): { id: string; name: string; path: string } => {
    const currentPath = pathHistory.map(p => p.name).join(' / ');
    if (selectedFolder && selectedFolder.id !== currentFolderId) {
      return {
        id: selectedFolder.id,
        name: selectedFolder.name,
        path: `${currentPath} / ${selectedFolder.name}`,
      };
    }
    return {
      id: currentFolderId,
      name: pathHistory[pathHistory.length - 1]?.name || 'My Drive',
      path: currentPath,
    };
  }, [pathHistory, selectedFolder, currentFolderId]);

  // Fetch folders from Google Drive API v3 or fallback mock database
  const fetchDriveFolders = useCallback(async (folderId: string) => {
    setIsLoading(true);
    try {
      if (accessToken) {
        // Fetch real Google Drive folders via Drive API v3
        const q = `'${folderId === 'root' ? 'root' : folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents,modifiedTime,folderColorRgb,shared)&pageSize=100`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (res.ok) {
          const data = await res.json();
          const currentPathStr = pathHistory.map(p => p.name).join(' / ');
          const apiFolders: DriveFolderItem[] = (data.files || []).map((f: any) => ({
            id: f.id,
            name: f.name,
            parentId: folderId,
            path: `${currentPathStr} / ${f.name}`,
            updatedAt: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'Recently',
            isShared: f.shared,
            folderColorRgb: f.folderColorRgb
          }));
          setFolders(apiFolders);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to interactive mock directory hierarchy
      const mockItems = MOCK_DRIVE_HIERARCHY[folderId] || [];
      setFolders(mockItems);
    } catch (err) {
      console.warn('Google Drive API fetch error, using local fallback:', err);
      setFolders(MOCK_DRIVE_HIERARCHY[folderId] || []);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, pathHistory]);

  useEffect(() => {
    if (isOpen) {
      fetchDriveFolders(currentFolderId);
    }
  }, [isOpen, currentFolderId, fetchDriveFolders]);

  if (!isOpen) return null;

  // Handle navigate down into subfolder
  const handleOpenFolder = (folder: DriveFolderItem) => {
    setCurrentFolderId(folder.id);
    setPathHistory(prev => [...prev, { id: folder.id, name: folder.name }]);
    setSelectedFolder(null);
  };

  // Handle click breadcrumb level
  const handleJumpToBreadcrumb = (index: number) => {
    const newHistory = pathHistory.slice(0, index + 1);
    const target = newHistory[newHistory.length - 1];
    setPathHistory(newHistory);
    setCurrentFolderId(target.id);
    setSelectedFolder(null);
  };

  // Handle Back (←) button
  const handleNavigateUp = () => {
    if (pathHistory.length > 1) {
      handleJumpToBreadcrumb(pathHistory.length - 2);
    }
  };

  // Create New Subfolder
  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const currentPathStr = pathHistory.map(p => p.name).join(' / ');
    const newFolder: DriveFolderItem = {
      id: `custom_${Date.now()}`,
      name: newFolderName.trim(),
      parentId: currentFolderId,
      path: `${currentPathStr} / ${newFolderName.trim()}`,
      itemCount: 0,
      updatedAt: 'Just now'
    };

    setFolders(prev => [newFolder, ...prev]);
    setSelectedFolder(newFolder);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="picker-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        fontFamily: "'Google Sans', Roboto, -apple-system, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        className="picker-modal-card"
        style={{
          width: '100%',
          maxWidth: '840px',
          height: '620px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 24px 48px -12px rgba(11, 87, 208, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          color: '#1F1F1F',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* M3 Header Bar */}
        <div
          style={{
            backgroundColor: '#F8FAFD',
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#D3E3FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B57D0',
                flexShrink: 0,
              }}
            >
              <HardDrive size={20} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1F1F1F', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Select Google Drive Target Folder
              </h2>
              <p style={{ margin: 0, fontSize: '0.725rem', color: '#444746', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Pick folder to save your Sheet2Vow database
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#0B57D0',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '20px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(11, 87, 208, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <FolderPlus size={15} />
              <span>+ New folder</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#444746',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Loading Progress Bar */}
        {isLoading && (
          <div style={{ height: '3px', width: '100%', backgroundColor: '#E8F0FE', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#0B57D0',
                width: '40%',
                animation: 'm3-progress 1.2s infinite ease-in-out',
              }}
            />
          </div>
        )}

        {/* Main Body Layout (Sidebar + Content View) */}
        <div className="picker-layout-container" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Navigation Sidebar / Horizontal Pill Bar on mobile */}
          <div
            className="picker-sidebar"
            style={{
              width: '180px',
              backgroundColor: '#F8FAFD',
              borderRight: '1px solid #E2E8F0',
              padding: '0.85rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              flexShrink: 0,
            }}
          >
            {[
              { id: 'my-drive', label: 'My Drive', icon: HardDrive },
              { id: 'shared-with-me', label: 'Shared with me', icon: Users },
              { id: 'starred', label: 'Starred', icon: Star },
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = driveScope === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setDriveScope(tab.id as DriveScope);
                    if (tab.id === 'my-drive') {
                      setCurrentFolderId('root');
                      setPathHistory([{ id: 'root', name: 'My Drive' }]);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: isActive ? '#D3E3FD' : 'transparent',
                    color: isActive ? '#041E49' : '#444746',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconComp size={16} style={{ color: isActive ? '#0B57D0' : '#444746' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
            {/* Top Toolbar (Breadcrumbs + Search + View Controls) */}
            <div
              style={{
                padding: '0.6rem 1rem',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                backgroundColor: '#FFFFFF',
                flexWrap: 'wrap',
              }}
            >
              {/* Breadcrumb Trail */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', flex: 1, minWidth: '160px' }}>
                <button
                  type="button"
                  disabled={pathHistory.length <= 1}
                  onClick={handleNavigateUp}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: pathHistory.length > 1 ? '#EDF2FA' : 'transparent',
                    cursor: pathHistory.length > 1 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: pathHistory.length > 1 ? '#0B57D0' : '#C4C7C5',
                    flexShrink: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  {pathHistory.map((item, idx) => {
                    const isLast = idx === pathHistory.length - 1;
                    return (
                      <React.Fragment key={item.id}>
                        {idx > 0 && <ChevronRight size={12} style={{ color: '#8E918F' }} />}
                        <button
                          type="button"
                          onClick={() => handleJumpToBreadcrumb(idx)}
                          style={{
                            border: 'none',
                            backgroundColor: isLast ? '#EDF2FA' : 'transparent',
                            color: isLast ? '#0B57D0' : '#444746',
                            fontWeight: isLast ? 700 : 500,
                            fontSize: '0.775rem',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          {item.name}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar & View Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ position: 'relative', width: '150px' }}>
                  <Search size={13} style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: '#747775' }} />
                  <input
                    type="text"
                    placeholder="Search folder..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem 0.35rem 1.75rem',
                      borderRadius: '20px',
                      border: '1px solid #C4C7C5',
                      fontSize: '0.75rem',
                      backgroundColor: '#F8FAFD',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#444746',
                  }}
                >
                  {viewMode === 'list' ? <Grid size={16} /> : <ListIcon size={16} />}
                </button>
              </div>
            </div>

            {/* Folder Items Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
              {/* Create New Folder Inline Input Overlay */}
              {isCreatingFolder && (
                <form
                  onSubmit={handleCreateNewFolder}
                  style={{
                    backgroundColor: '#EDF2FA',
                    border: '2px solid #0B57D0',
                    borderRadius: '12px',
                    padding: '0.75rem 0.85rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FolderPlus size={18} style={{ color: '#0B57D0', flexShrink: 0 }} />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Untitled folder"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #0B57D0',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0B57D0',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#444746',
                      border: 'none',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={15} />
                  </button>
                </form>
              )}

              {filteredFolders.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#747775' }}>
                  <FolderOpen size={44} style={{ color: '#C4C7C5', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1F1F1F' }}>No sub-folders inside this directory</div>
                  <p style={{ fontSize: '0.725rem', marginTop: '0.2rem', color: '#444746' }}>
                    Click <strong>"+ New folder"</strong> above to create a dedicated wedding destination folder
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                /* List View Layout */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {filteredFolders.map((folder) => {
                    const isSelected = selectedFolder?.id === folder.id;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder)}
                        onDoubleClick={() => handleOpenFolder(folder)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#E8F0FE' : '#FFFFFF',
                          border: isSelected ? '1.5px solid #0B57D0' : '1px solid #F1F5F9',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                          minHeight: '48px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                          <div
                            style={{
                              color: isSelected ? '#0B57D0' : (folder.folderColorRgb || '#4285F4'),
                              display: 'flex',
                              alignItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Folder size={20} fill={isSelected ? '#0B57D0' : '#4285F4'} fillOpacity={0.2} />
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.825rem', color: '#1F1F1F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {folder.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#747775' }}>
                              Modified: {folder.updatedAt || 'Recently'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFolder(folder);
                            }}
                            style={{
                              backgroundColor: '#EDF2FA',
                              color: '#0B57D0',
                              border: 'none',
                              borderRadius: '14px',
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <span>Open</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Grid View Layout */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.65rem' }}>
                  {filteredFolders.map((folder) => {
                    const isSelected = selectedFolder?.id === folder.id;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder)}
                        onDoubleClick={() => handleOpenFolder(folder)}
                        style={{
                          backgroundColor: isSelected ? '#E8F0FE' : '#F8FAFD',
                          border: isSelected ? '2px solid #0B57D0' : '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Folder size={24} style={{ color: '#0B57D0' }} />
                          {isSelected && (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#0B57D0', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={11} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1F1F1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {folder.name}
                          </div>
                          <div style={{ fontSize: '0.675rem', color: '#747775', marginTop: '0.1rem' }}>
                            {folder.updatedAt || 'Recently'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* M3 Action Footer */}
            <div
              className="picker-footer"
              style={{
                backgroundColor: '#F8FAFD',
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#444746', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '360px' }}>
                Target: <strong style={{ color: '#0B57D0' }}>{getEffectiveSelection().path}</strong>
              </div>

              <div className="picker-footer-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#444746',
                    border: '1px solid #C4C7C5',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: '40px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const chosen = getEffectiveSelection();
                    onSelectFolder(chosen);
                    onClose();
                  }}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#0B57D0',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 1px 3px rgba(11, 87, 208, 0.3)',
                    minHeight: '40px',
                  }}
                >
                  <Check size={15} />
                  <span>Select Folder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDrivePickerModal;
