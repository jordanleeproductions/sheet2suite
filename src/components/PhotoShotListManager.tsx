'use client';

import React, { useState, useMemo } from 'react';
import { PhotoShot, Vendor, GuestbookEntry } from '@/lib/sheets/types';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  AlertCircle,
  Tag,
  Mail,
  UploadCloud,
  HardDrive,
  FolderOpen,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Heart,
  MessageSquare,
  Image as ImageIcon,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import PageSearchInput from '@/components/PageSearchInput';
import GoogleDrivePickerModal, { SelectedFolder } from '@/components/GoogleDrivePickerModal';
import { generateShareToken, ShareLinkRecord } from '@/lib/share/token';
import type { GuestUploadRecord } from '@/lib/db/firestoreDb';
import PageHeaderCard from '@/components/vow/PageHeaderCard';
import PageMetricStrip from '@/components/vow/PageMetricStrip';
import { triggerConfetti } from '@/lib/confetti';
import SlideOverDrawer from '@/components/vow/SlideOverDrawer';
import { DrawerSection, DrawerField, DrawerRow, PriorityPills } from '@/components/vow/MonarchForm';

const PHOTO_PRIORITY_OPTIONS = [
  { label: 'Must Have', value: 'Must Have', color: '#c53030' },
  { label: 'Nice To Have', value: 'Nice To Have', color: '#dd6b20' },
  { label: 'Optional', value: 'Optional', color: '#718096' },
];

interface PhotoShotListManagerProps {
  photos: PhotoShot[];
  vendors?: Vendor[];
  guestbook?: GuestbookEntry[];
  onUpdatePhotos: (updatedPhotos: PhotoShot[]) => Promise<void>;
  onUpdateGuestbook?: (updatedGuestbook: GuestbookEntry[]) => Promise<void>;
  isSyncing?: boolean;
  spreadsheetId?: string;
  weddingName?: string;
  googleToken?: string;
  googleUserEmail?: string;
  driveFolder?: string;
  onOpenGoogleAuth?: () => void;
}

export default function PhotoShotListManager({ 
  photos, 
  vendors = [], 
  guestbook = [],
  onUpdatePhotos, 
  onUpdateGuestbook,
  isSyncing,
  spreadsheetId,
  weddingName,
  googleToken,
  googleUserEmail,
  driveFolder,
  onOpenGoogleAuth,
}: PhotoShotListManagerProps) {
  // View Switcher State: 'shotlist' | 'guestbook'
  const [activeView, setActiveView] = useState<'shotlist' | 'guestbook'>('shotlist');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Helper to map a Google Sheet GuestbookEntry to GuestUploadRecord format
  const mapGuestbookToUploadRecord = (entry: GuestbookEntry): GuestUploadRecord => {
    const rawLinks = (entry.photoLinks || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    return {
      id: entry.entryId,
      spreadsheetId: spreadsheetId || '',
      uploaderName: entry.guestName || 'Anonymous Guest',
      caption: entry.message || '',
      fileCount: entry.photoCount || rawLinks.length || 0,
      files: rawLinks.map((link, idx) => ({
        id: `${entry.entryId}_${idx}`,
        name: `Photo ${idx + 1}`,
        webViewLink: link,
      })),
      folderName: entry.driveFolder || 'Guest Uploads',
      uploadedAt: entry.submittedAt,
    };
  };

  // Guest Uploads State (Single Source of Truth: Google Sheet 'GUESTBOOK' tab via props)
  const [guestUploads, setGuestUploads] = useState<GuestUploadRecord[]>(() => {
    return (guestbook || []).map(mapGuestbookToUploadRecord);
  });
  const [isLoadingGuestUploads, setIsLoadingGuestUploads] = useState<boolean>(false);
  const [guestSearchTerm, setGuestSearchTerm] = useState<string>('');
  const [onlyWithNotes, setOnlyWithNotes] = useState<boolean>(false);
  const [guestViewMode, setGuestViewMode] = useState<'card' | 'table'>('card');
  const [uploadToDelete, setUploadToDelete] = useState<GuestUploadRecord | null>(null);
  const [isDeletingUpload, setIsDeletingUpload] = useState<boolean>(false);

  // Modals State
  const [isAddingShot, setIsAddingShot] = useState(false);
  const [editingShot, setEditingShot] = useState<PhotoShot | null>(null);
  const [shotToDelete, setShotToDelete] = useState<PhotoShot | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<PhotoShot>>({
    description: '',
    location: 'Main Chapel',
    shotTime: '03:30 PM (Post-Ceremony)',
    people: '',
    status: 'Pending',
    priority: 'Must Have',
    notes: '',
  });

  // Calculate KPIs
  const totalShots = photos.length;
  const capturedShots = photos.filter(p => p.status === 'Captured').length;
  const pendingShots = photos.filter(p => p.status === 'Pending').length;
  const mustHaveShots = photos.filter(p => p.priority === 'Must Have' || (p.priority as any) === 'High').length;

  // Filtered Shots
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = 
      (photo.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.people || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || photo.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || 
      photo.priority === priorityFilter ||
      (priorityFilter === 'Must Have' && (photo.priority as any) === 'High') ||
      (priorityFilter === 'Nice To Have' && (photo.priority as any) === 'Medium') ||
      (priorityFilter === 'Optional' && (photo.priority as any) === 'Low');

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Toggle Shot Status (Captured <-> Pending)
  const toggleShotStatus = async (shotId: string) => {
    const targetShot = photos.find(p => p.shotId === shotId);
    const willBeCaptured = targetShot && (targetShot.status || '').toLowerCase() !== 'captured' && (targetShot.status || '').toLowerCase() !== 'completed';

    const updated = photos.map(p => {
      if (p.shotId === shotId) {
        const isCurrentCaptured = 
          (p.status || '').toLowerCase() === 'captured' || 
          (p.status || '').toLowerCase() === 'completed';

        return {
          ...p,
          status: isCurrentCaptured ? ('Pending' as const) : ('Captured' as const)
        };
      }
      return p;
    });

    if (willBeCaptured) {
      const remainingPending = updated.filter(p => (p.status || '').toLowerCase() !== 'captured' && (p.status || '').toLowerCase() !== 'completed');
      if (remainingPending.length === 0 && updated.length > 0) {
        triggerConfetti({ particleCount: 90 });
      }
    }

    await onUpdatePhotos(updated);
  };

  // Open Add Shot Modal
  const startAddShot = () => {
    setFormData({
      description: '',
      location: 'Main Chapel',
      shotTime: '03:30 PM (Post-Ceremony)',
      people: '',
      status: 'Pending',
      priority: 'Must Have',
      notes: '',
    });
    setIsAddingShot(true);
    setEditingShot(null);
  };

  // Open Edit Shot Modal
  const startEditShot = (shot: PhotoShot) => {
    setFormData(shot);
    setEditingShot(shot);
    setIsAddingShot(false);
  };

  const currentEditingShotIndex = useMemo(() => {
    if (!editingShot) return -1;
    return filteredPhotos.findIndex(p => p.shotId === editingShot.shotId);
  }, [editingShot, filteredPhotos]);

  const handleNavigateAdjacentShot = (direction: 'prev' | 'next') => {
    if (currentEditingShotIndex === -1) return;
    const targetIndex = direction === 'prev' ? currentEditingShotIndex - 1 : currentEditingShotIndex + 1;
    if (targetIndex >= 0 && targetIndex < filteredPhotos.length) {
      const nextShot = filteredPhotos[targetIndex];
      startEditShot(nextShot);
    }
  };

  // Save Shot Handler
  const handleSaveShot = async (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (!formData.description) {
      alert('Please enter a Shot Description.');
      return;
    }

    let updated: PhotoShot[];
    if (isAddingShot) {
      const newShot: PhotoShot = {
        shotId: `P${Date.now().toString().slice(-4)}`,
        description: formData.description || 'New Photo Shot',
        location: formData.location || 'Main Venue',
        shotTime: formData.shotTime || 'TBD',
        people: formData.people || '',
        status: (formData.status as any) || 'Pending',
        priority: (formData.priority as any) || 'Must Have',
        notes: formData.notes || '',
      };
      updated = [...photos, newShot];
    } else if (editingShot) {
      updated = photos.map(p => 
        p.shotId === editingShot.shotId ? { ...p, ...formData } as PhotoShot : p
      );
    } else {
      return;
    }

    await onUpdatePhotos(updated);

    if (continueAdding) {
      setFormData({
        description: '',
        location: formData.location || 'Main Venue',
        shotTime: formData.shotTime || 'TBD',
        people: '',
        status: 'Pending',
        priority: formData.priority || 'Must Have',
        notes: '',
      });
      setIsAddingShot(true);
      setEditingShot(null);
    } else {
      setIsAddingShot(false);
      setEditingShot(null);
    }
  };

  // Confirm Delete Handler
  const confirmDeleteShot = async () => {
    if (!shotToDelete) return;
    const updated = photos.filter(p => p.shotId !== shotToDelete.shotId);
    await onUpdatePhotos(updated);
    setShotToDelete(null);
  };

  // Share / Email Shot List to Photographer
  const handleSharePhotos = () => {
    const subject = encodeURIComponent('Wedding Photography Shot List & VIP Moments');
    
    let bodyText = `Hi!\n\nHere is our official Wedding Photography Shot List:\n\n`;

    const mustHave = photos.filter(p => p.priority === 'Must Have' || (p.priority as any) === 'High');
    const niceToHave = photos.filter(p => p.priority === 'Nice To Have' || (p.priority as any) === 'Medium');
    const optional = photos.filter(p => p.priority === 'Optional' || (p.priority as any) === 'Low');

    if (mustHave.length > 0) {
      bodyText += `--- MUST HAVE SHOTS (${mustHave.length}) ---\n`;
      mustHave.forEach((p, idx) => {
        bodyText += `${idx + 1}. [${p.shotId}] ${p.description}\n`;
        if (p.location) bodyText += `   Location: ${p.location}\n`;
        if (p.shotTime) bodyText += `   Est. Time: ${p.shotTime}\n`;
        if (p.people) bodyText += `   People Included: ${p.people}\n`;
        if (p.notes) bodyText += `   Notes: ${p.notes}\n`;
        bodyText += `\n`;
      });
    }

    if (niceToHave.length > 0) {
      bodyText += `--- NICE TO HAVE SHOTS (${niceToHave.length}) ---\n`;
      niceToHave.forEach((p, idx) => {
        bodyText += `${idx + 1}. [${p.shotId}] ${p.description}\n`;
        if (p.location) bodyText += `   Location: ${p.location}\n`;
        if (p.shotTime) bodyText += `   Est. Time: ${p.shotTime}\n`;
        if (p.people) bodyText += `   People Included: ${p.people}\n`;
        if (p.notes) bodyText += `   Notes: ${p.notes}\n`;
        bodyText += `\n`;
      });
    }

    if (optional.length > 0) {
      bodyText += `--- OPTIONAL SHOTS (${optional.length}) ---\n`;
      optional.forEach((p, idx) => {
        bodyText += `${idx + 1}. [${p.shotId}] ${p.description}\n`;
        if (p.location) bodyText += `   Location: ${p.location}\n`;
        if (p.shotTime) bodyText += `   Est. Time: ${p.shotTime}\n`;
        if (p.people) bodyText += `   People Included: ${p.people}\n`;
        if (p.notes) bodyText += `   Notes: ${p.notes}\n`;
        bodyText += `\n`;
      });
    }

    bodyText += `Thank you so much!`;

    // Lookup Photographer vendor email [PHOTO-2]
    const photoVendor = vendors.find(v => {
      const cat = (v.category || '').toLowerCase();
      const name = (v.vendorName || '').toLowerCase();
      return cat.includes('photo') || cat.includes('camera') || cat.includes('video') || name.includes('photo') || name.includes('camera');
    });
    const recipientEmail = photoVendor?.emailAddress || '';

    window.location.href = `mailto:${encodeURIComponent(recipientEmail)}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  // Guest Upload Setup State
  const [isUploadSetupOpen, setIsUploadSetupOpen] = useState<boolean>(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [expirationDays, setExpirationDays] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedExp = localStorage.getItem('s2v_guest_upload_expiration');
      if (savedExp !== null && !isNaN(Number(savedExp))) return Number(savedExp);
    }
    return 90;
  });

  const [selectedFolder, setSelectedFolder] = useState<SelectedFolder>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('s2v_guest_upload_folder');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    const defaultPath = driveFolder
      ? `${driveFolder} / Guest Uploads`
      : 'My Drive / Wedding Planning / Guest Uploads';
    return {
      name: 'Guest Uploads',
      path: defaultPath,
    };
  });

  const effectiveSpreadsheetId = spreadsheetId || (typeof window !== 'undefined' ? localStorage.getItem('s2v_spreadsheet_id') || 'sheet2vow-master-wedding' : 'sheet2vow-master-wedding');
  const effectiveWeddingName = weddingName || (typeof window !== 'undefined' ? localStorage.getItem('s2v_wedding_name') || 'Our Wedding' : 'Our Wedding');
  const effectiveUserEmail = googleUserEmail || (typeof window !== 'undefined' ? localStorage.getItem('s2v_google_email') || '' : '');

  // Automatically register active tokens in Cloud Firestore whenever upload setup is open
  React.useEffect(() => {
    if (isUploadSetupOpen && (effectiveSpreadsheetId || googleToken)) {
      fetch('/api/auth/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: effectiveSpreadsheetId,
          userEmail: effectiveUserEmail,
          accessToken: googleToken,
        }),
      }).catch(err => console.warn('[PhotoShotListManager] Could not register token:', err));
    }
  }, [isUploadSetupOpen, effectiveSpreadsheetId, googleToken, effectiveUserEmail]);

  const guestUploadToken = useMemo(() => {
    return generateShareToken({
      spreadsheetId: effectiveSpreadsheetId,
      scope: 'guest_upload',
      weddingName: effectiveWeddingName,
      userEmail: effectiveUserEmail,
      expiresInDays: expirationDays,
      folderId: selectedFolder.id,
      folderName: selectedFolder.name,
      folderPath: selectedFolder.path,
    });
  }, [effectiveSpreadsheetId, effectiveWeddingName, effectiveUserEmail, expirationDays, selectedFolder]);

  const guestUploadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/upload/${guestUploadToken}`
    : `/upload/${guestUploadToken}`;

  const handleCopyGuestUploadUrl = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(guestUploadUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = guestUploadUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);

      // Register link in localStorage registry
      const newRecord: ShareLinkRecord = {
        id: `SL_GU_${Date.now().toString().slice(-4)}`,
        scope: 'guest_upload',
        label: `Guest Upload Portal (${selectedFolder.name || 'Guest Uploads'})`,
        token: guestUploadToken,
        shareUrl: guestUploadUrl,
        createdAt: new Date().toISOString(),
        exp: expirationDays > 0 ? Date.now() + expirationDays * 24 * 60 * 60 * 1000 : 0,
        shareVersion: 1,
        folderId: selectedFolder.id,
        folderName: selectedFolder.name,
        folderPath: selectedFolder.path,
      };
      const existing = localStorage.getItem('s2v_generated_share_links');
      let list: ShareLinkRecord[] = existing ? JSON.parse(existing) : [];
      list = [newRecord, ...list.filter(l => l.token !== guestUploadToken)];
      localStorage.setItem('s2v_generated_share_links', JSON.stringify(list));
    } catch (err) {
      console.error('Failed to copy guest upload link:', err);
    }
  };

  const handleExpirationChange = (days: number) => {
    setExpirationDays(days);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_guest_upload_expiration', String(days));
    }
  };

  const handleFolderSelect = (folder: SelectedFolder) => {
    const updated: SelectedFolder = {
      id: folder.id,
      name: folder.name,
      path: folder.path,
    };
    setSelectedFolder(updated);
    setIsDrivePickerOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_guest_upload_folder', JSON.stringify(updated));
    }
  };

  const getFormattedExpirationText = (days: number): string => {
    if (days <= 0) return 'Never expires (Permanent access)';
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return `Valid for ${days} days (Expires ${expiryDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })})`;
  };

  // Sync guestUploads whenever the authoritative guestbook prop from Google Sheet updates
  React.useEffect(() => {
    if (guestbook && Array.isArray(guestbook) && guestbook.length > 0) {
      setGuestUploads(guestbook.map(mapGuestbookToUploadRecord));
    }
  }, [guestbook]);

  // Fetch Guest Upload Records from /api/drive/guest-uploads (secondary / fallback)
  const fetchGuestUploads = React.useCallback(async () => {
    setIsLoadingGuestUploads(true);
    try {
      const params = new URLSearchParams();
      if (effectiveSpreadsheetId) params.set('spreadsheetId', effectiveSpreadsheetId);
      if (effectiveUserEmail) params.set('userEmail', effectiveUserEmail);
      const res = await fetch(`/api/drive/guest-uploads?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.uploads)) {
        setGuestUploads(prev => {
          if (prev.length === 0) return data.uploads;
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = data.uploads.filter((u: GuestUploadRecord) => !existingIds.has(u.id));
          return [...prev, ...newItems];
        });
      }
    } catch (err) {
      console.warn('[PhotoShotListManager] Could not fetch guest uploads:', err);
    } finally {
      setIsLoadingGuestUploads(false);
    }
  }, [effectiveSpreadsheetId, effectiveUserEmail]);

  React.useEffect(() => {
    fetchGuestUploads();
  }, [fetchGuestUploads]);

  // Delete Guest Upload Handler
  const confirmDeleteUpload = async () => {
    if (!uploadToDelete) return;
    setIsDeletingUpload(true);
    try {
      // 1. Delete from Google Sheet GUESTBOOK tab (Single Source of Truth)
      if (onUpdateGuestbook && guestbook) {
        const updated = guestbook.filter(g => g.entryId !== uploadToDelete.id);
        await onUpdateGuestbook(updated);
      }

      // 2. Also delete from Firestore if present
      try {
        await fetch(`/api/drive/guest-uploads?id=${encodeURIComponent(uploadToDelete.id)}`, {
          method: 'DELETE',
        });
      } catch (_) {}

      setGuestUploads(prev => prev.filter(u => u.id !== uploadToDelete.id));
      setUploadToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete guest entry');
    } finally {
      setIsDeletingUpload(false);
    }
  };

  // Format timestamp helper (handles ISO strings, unix/ms timestamps, and Excel/Google Sheets serial dates)
  const formatUploadTime = (input?: string | number | null): string => {
    if (input === undefined || input === null || input === '') return '';
    try {
      if (typeof input === 'number') {
        if (input >= 1000 && input <= 100000) {
          // Google Sheets / Excel serial date (days since Dec 30, 1899)
          const d = new Date(Math.round((input - 25569) * 86400 * 1000));
          if (!isNaN(d.getTime())) return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        }
        const d = new Date(input > 1e11 ? input : input * 1000);
        if (!isNaN(d.getTime())) return d.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }

      const str = String(input).trim();
      if (!str) return '';

      const num = Number(str);
      if (!isNaN(num)) {
        if (num >= 1000 && num <= 100000) {
          const d = new Date(Math.round((num - 25569) * 86400 * 1000));
          if (!isNaN(d.getTime())) return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        }
        if (num > 100000) {
          const d = new Date(num > 1e11 ? num : num * 1000);
          if (!isNaN(d.getTime())) return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        }
      }

      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
      return str;
    } catch {
      return String(input || '');
    }
  };

  // Guestbook KPIs & Filtering
  const guestTotalFiles = guestUploads.reduce((sum, u) => sum + (u.fileCount || u.files?.length || 0), 0);
  const guestNotesCount = guestUploads.filter(u => Boolean(u.caption && u.caption.trim())).length;

  const filteredGuestUploads = guestUploads.filter(u => {
    const term = guestSearchTerm.toLowerCase();
    const matchesSearch = 
      (u.uploaderName || '').toLowerCase().includes(term) ||
      (u.caption || '').toLowerCase().includes(term) ||
      (u.files || []).some(f => (f.name || '').toLowerCase().includes(term));
    
    const matchesNotes = !onlyWithNotes || Boolean(u.caption && u.caption.trim());
    return matchesSearch && matchesNotes;
  });

  return (
    <div style={styles.container}>
      {/* Scoped Responsive CSS for Mobile Optimization */}
      <style>{`
        .photo-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .photo-header-actions {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .photo-kpi-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.875rem;
        }
        .photo-kpi-item {
          background-color: var(--color-surface);
          border: 1px solid var(--color-muted);
          border-radius: var(--border-radius-md);
          padding: 0.875rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          box-shadow: var(--box-shadow-subtle);
        }
        .photo-kpi-value {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 700;
        }
        .photo-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .photo-search-wrapper {
          position: relative;
          flex: 1 1 240px;
        }
        .photo-filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .photo-shots-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        .photo-shot-card {
          background-color: var(--color-surface);
          border: 1.5px solid var(--color-muted);
          border-radius: var(--border-radius-md);
          padding: 0.875rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: var(--box-shadow-subtle);
          transition: var(--transition-smooth);
        }
        .photo-shot-card:hover {
          border-color: var(--color-primary);
          box-shadow: var(--box-shadow-medium);
        }
        .photo-shot-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .photo-shot-badges {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
          min-width: 0;
        }
        .photo-shot-main-row {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
        }
        .photo-shot-content {
          flex: 1;
          min-width: 0;
        }
        .photo-shot-title {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1.35;
          margin: 0;
          color: var(--color-text);
          word-break: break-word;
        }
        .photo-shot-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-top: 0.35rem;
          border-top: 1px dashed var(--color-muted);
          font-size: 0.75rem;
        }
        @media (max-width: 768px) {
          .photo-add-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .photo-header-container {
            flex-direction: column;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .photo-header-actions {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          .photo-header-actions button {
            justify-content: center !important;
            width: 100% !important;
          }
          .photo-kpi-bar {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
          .photo-kpi-item {
            padding: 0.6rem 0.75rem !important;
          }
          .photo-kpi-value {
            font-size: 1.1rem !important;
          }
          .photo-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
          }
          .photo-search-wrapper {
            width: 100% !important;
            flex: 1 1 auto !important;
          }
          .photo-filter-group {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          .photo-filter-group select {
            width: 100% !important;
          }
          .photo-shots-list {
            grid-template-columns: 1fr !important;
            gap: 0.625rem !important;
          }
          .photo-shot-card {
            padding: 0.7rem 0.8rem !important;
            gap: 0.4rem !important;
          }
          .photo-shot-title {
            font-size: 0.88rem !important;
          }
          .photo-shot-meta-row {
            font-size: 0.72rem !important;
            gap: 0.35rem !important;
          }
        }
        .photo-tab-full-title {
          display: inline;
        }
        .photo-tab-short-title {
          display: none;
        }
        @media (max-width: 640px) {
          .photo-tab-full-title {
            display: none !important;
          }
          .photo-tab-short-title {
            display: inline !important;
          }
          .photo-view-switcher {
            display: flex !important;
            flex-direction: row !important;
            width: 100% !important;
            gap: 0.35rem !important;
            padding: 0.25rem !important;
            background-color: var(--color-surface) !important;
            border: 1px solid var(--color-muted) !important;
            border-radius: 9999px !important;
            overflow-x: visible !important;
          }
          .photo-view-tab {
            flex: 1 !important;
            width: auto !important;
            justify-content: center !important;
            padding: 0.45rem 0.5rem !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            border-radius: 9999px !important;
            border: none !important;
            gap: 0.35rem !important;
          }
        }
      `}</style>



      {/* Standardized Header Card with Integrated View Switcher */}
      <PageHeaderCard
        title={activeView === 'shotlist' ? "Photo Shot List" : "Guestbook & Photos"}
        subtitle={activeView === 'shotlist' ? "Manage required photography moments, VIP group poses, and shot progress for your photographer." : "Heartfelt messages, guest candid photo uploads, and shared digital memories."}
        badge={activeView === 'shotlist' ? `${photos.length} Shots` : `${guestUploads.length} Messages`}
        segmentSwitcher={{
          activeKey: activeView,
          onChange: (key) => setActiveView(key as 'shotlist' | 'guestbook'),
          segments: [
            { key: 'shotlist', label: 'SHOT LIST', icon: <Camera size={14} /> },
            { key: 'guestbook', label: 'GUESTBOOK', icon: <MessageSquare size={14} /> },
          ],
        }}
        actionButtons={
          activeView === 'shotlist' ? (
            <>
              <button 
                type="button"
                className="s2v-header-btn s2v-header-btn-secondary"
                onClick={handleSharePhotos}
                title="Email shot list to Photographer"
              >
                <Mail size={14} />
                <span>EMAIL LIST</span>
              </button>

              <button
                type="button"
                className="s2v-header-btn s2v-header-btn-primary photo-add-btn"
                onClick={startAddShot}
                disabled={isSyncing}
                title="Add Photo Shot"
              >
                <Plus size={14} />
                <span>ADD SHOT</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="s2v-header-btn s2v-header-btn-secondary"
                onClick={fetchGuestUploads}
                disabled={isLoadingGuestUploads}
                title="Refresh submissions"
              >
                <RefreshCw size={14} className={isLoadingGuestUploads ? 'spin' : ''} />
                <span>REFRESH</span>
              </button>

              <button
                type="button"
                className="s2v-header-btn s2v-header-btn-primary"
                onClick={() => setIsUploadSetupOpen(true)}
                title="Share Guest Photo Upload Portal Link"
              >
                <UploadCloud size={14} />
                <span>UPLOAD SETUP</span>
              </button>
            </>
          )
        }
      />

      {/* SHOT LIST VIEW */}
      {activeView === 'shotlist' && (
        <>
          {/* Monarch-Style Hero Metric Strip */}
          <PageMetricStrip
            style={{ marginBottom: '1.25rem' }}
            metrics={[
              {
                id: 'total',
                label: 'TOTAL REQUIRED',
                value: totalShots,
                subtext: 'Shot list moments',
                statusBadge: `${totalShots} Moments`,
                statusColor: 'blue',
                onClick: () => { setStatusFilter('All'); setPriorityFilter('All'); },
                isActive: statusFilter === 'All' && priorityFilter === 'All',
              },
              {
                id: 'captured',
                label: 'CAPTURED SHOTS',
                value: `${capturedShots} / ${totalShots}`,
                progress: totalShots > 0 ? Math.round((capturedShots / totalShots) * 100) : 0,
                statusBadge: capturedShots === totalShots && totalShots > 0 ? '100% Captured' : `${totalShots > 0 ? Math.round((capturedShots / totalShots) * 100) : 0}%`,
                statusColor: capturedShots === totalShots && totalShots > 0 ? 'green' : 'blue',
                onClick: () => setStatusFilter('Captured'),
                isActive: statusFilter === 'Captured',
              },
              {
                id: 'pending',
                label: 'PENDING SHOTS',
                value: pendingShots,
                subtext: 'Awaiting photographer cue',
                statusColor: pendingShots > 0 ? 'amber' : 'neutral',
                onClick: () => setStatusFilter('Pending'),
                isActive: statusFilter === 'Pending',
              },
              {
                id: 'must-have',
                label: 'ESSENTIAL VIP SHOTS',
                value: mustHaveShots,
                subtext: 'High-priority VIP poses',
                statusBadge: 'Must Have',
                statusColor: 'purple',
                onClick: () => setPriorityFilter('Must Have'),
                isActive: priorityFilter === 'Must Have',
              },
            ]}
          />

          {/* Filters Bar */}
          <div className="photo-filter-bar">
            <PageSearchInput
              placeholder="Search description, location, or people..."
              value={searchTerm}
              onChange={setSearchTerm}
              resultCount={filteredPhotos.length}
              style={{ flex: '1 1 240px' }}
            />

            <div className="photo-filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Captured">Captured</option>
              </select>

              <select 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="All">All Priorities</option>
                <option value="Must Have">Must Have</option>
                <option value="Nice To Have">Nice To Have</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
          </div>

          {/* Photo Shot List Grid */}
          <div className="photo-shots-list">
            {filteredPhotos.map(shot => {
              const isCaptured = (shot.status || '').toLowerCase() === 'captured' || (shot.status || '').toLowerCase() === 'completed';
              const isMustHave = shot.priority === 'Must Have' || (shot.priority as any) === 'High';
              const isOptional = shot.priority === 'Optional' || (shot.priority as any) === 'Low';
              const displayPriority = isMustHave ? 'Must Have' : isOptional ? 'Optional' : 'Nice To Have';

              return (
                <div 
                  key={shot.shotId} 
                  className="photo-shot-card"
                  style={{
                    borderColor: isCaptured ? 'var(--color-green)' : 'var(--color-muted)',
                    opacity: isCaptured ? 0.8 : 1
                  }}
                >
                  {/* Top Row: Badges (ID, Priority, Location) & Actions */}
                  <div className="photo-shot-top-row">
                    <div className="photo-shot-badges">
                      <span style={{ ...styles.shotIdBadge, color: 'var(--color-text)', borderColor: 'var(--color-muted)' }}>
                        {shot.shotId}
                      </span>
                      {shot.priority && (
                        <span style={{
                          ...styles.priorityBadge,
                          backgroundColor: isMustHave ? 'var(--color-gold-muted)' : isOptional ? 'var(--color-bg)' : 'var(--color-bg-subtle, rgba(59, 130, 246, 0.1))',
                          color: isMustHave ? 'var(--color-gold)' : isOptional ? 'var(--color-muted)' : 'var(--color-primary)',
                          borderColor: isMustHave ? 'var(--color-gold)' : 'var(--color-muted)'
                        }}>
                          {displayPriority}
                        </span>
                      )}
                      {shot.location && (
                        <span style={{ ...styles.metaBadge, border: '1px solid var(--color-muted)', padding: '0.15rem 0.4rem' }}>
                          <MapPin size={11} style={{ marginRight: '3px', flexShrink: 0 }} /> {shot.location}
                        </span>
                      )}
                    </div>

                    <div style={styles.actionGroup}>
                      <button style={styles.iconBtn} onClick={() => startEditShot(shot)} title="Edit Shot">
                        <Edit2 size={14} style={{ color: 'var(--color-text)' }} />
                      </button>
                      <button style={{ ...styles.iconBtn, color: 'var(--color-red)' }} onClick={() => setShotToDelete(shot)} title="Delete Shot">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Main Row: Checkbox + Description */}
                  <div className="photo-shot-main-row">
                    <button 
                      type="button"
                      style={{
                        ...styles.statusCheckBtn,
                        color: isCaptured ? 'var(--color-green)' : 'var(--color-text)',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                      onClick={() => toggleShotStatus(shot.shotId)}
                      title={isCaptured ? 'Mark as Pending' : 'Mark as Captured'}
                    >
                      {isCaptured ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>

                    <div className="photo-shot-content">
                      <h3 
                        className="photo-shot-title"
                        style={{
                          textDecoration: isCaptured ? 'line-through' : 'none',
                          opacity: isCaptured ? 0.7 : 1
                        }}
                      >
                        {shot.description}
                      </h3>

                      {shot.notes && (
                        <p style={{ ...styles.notesText, marginTop: '0.35rem', paddingTop: '0.35rem', fontSize: '0.72rem' }}>
                          💡 {shot.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Meta Row: People & Time (if either exists) */}
                  {(shot.people || shot.shotTime) && (
                    <div className="photo-shot-meta-row">
                      {shot.people ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0, flex: '1 1 auto' }}>
                          <Users size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {shot.people}
                          </span>
                        </div>
                      ) : <div />}

                      {shot.shotTime && (
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-muted)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--border-radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                          marginLeft: 'auto',
                          flexShrink: 0
                        }}>
                          <Clock size={11} style={{ marginRight: '4px' }} /> {shot.shotTime}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPhotos.length === 0 && (
              <div style={styles.emptyState}>
                <Camera size={40} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
                <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>No Photography Shots Found</h4>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  Add a new shot or adjust your search filters above.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* GUESTBOOK & PHOTO NOTES VIEW */}
      {activeView === 'guestbook' && (
        <>
          {/* Monarch-Style Hero Metric Strip */}
          <PageMetricStrip
            style={{ marginBottom: '1.25rem' }}
            metrics={[
              {
                id: 'submissions',
                label: 'GUEST SUBMISSIONS',
                value: guestUploads.length,
                subtext: 'Total guest entries',
                statusBadge: 'Guestbook',
                statusColor: 'blue',
              },
              {
                id: 'media',
                label: 'PHOTOS & VIDEOS',
                value: guestTotalFiles,
                subtext: 'Uploaded to Drive',
                statusBadge: `${guestTotalFiles} Files`,
                statusColor: 'amber',
              },
              {
                id: 'notes',
                label: 'WRITTEN NOTES',
                value: guestNotesCount,
                subtext: 'Heartfelt wishes',
                statusBadge: `${guestNotesCount} Messages`,
                statusColor: 'green',
                onClick: () => setOnlyWithNotes(prev => !prev),
                isActive: onlyWithNotes,
              },
              {
                id: 'album',
                label: 'DRIVE ALBUM',
                value: selectedFolder.name || 'Guest Uploads',
                subtext: 'Target cloud album',
                statusBadge: selectedFolder.id ? 'Connected' : 'Default',
                statusColor: selectedFolder.id ? 'green' : 'neutral',
                onClick: () => setIsUploadSetupOpen(true),
              },
            ]}
          />

          {/* Guestbook Search & Filter Toolbar */}
          <div className="photo-filter-bar">
            <PageSearchInput
              placeholder="Search guest name, heartfelt note, or uploaded file..."
              value={guestSearchTerm}
              onChange={setGuestSearchTerm}
              resultCount={filteredGuestUploads.length}
              style={{ flex: '1 1 240px' }}
            />

            <div className="photo-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
                border: onlyWithNotes ? '1.5px solid var(--color-gold, #cda250)' : '1px solid var(--color-muted)',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--border-radius-sm)',
                transition: 'var(--transition-smooth)',
              }}>
                <input
                  type="checkbox"
                  checked={onlyWithNotes}
                  onChange={(e) => setOnlyWithNotes(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: 'var(--color-gold, #cda250)' }}
                />
                <span>With Written Notes Only</span>
              </label>

              {/* View Mode Toggle: Cards vs Table */}
              <div style={{
                display: 'inline-flex',
                border: '1px solid var(--color-muted)',
                borderRadius: 'var(--border-radius-sm)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface)',
              }}>
                <button
                  type="button"
                  onClick={() => setGuestViewMode('card')}
                  style={{
                    border: 'none',
                    padding: '0.42rem 0.65rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: guestViewMode === 'card' ? 'var(--color-primary)' : 'transparent',
                    color: guestViewMode === 'card' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                    transition: 'var(--transition-smooth)',
                  }}
                  title="Card View (Multi-column)"
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGuestViewMode('table')}
                  style={{
                    border: 'none',
                    borderLeft: '1px solid var(--color-muted)',
                    padding: '0.42rem 0.65rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: guestViewMode === 'table' ? 'var(--color-primary)' : 'transparent',
                    color: guestViewMode === 'table' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                    transition: 'var(--transition-smooth)',
                  }}
                  title="Table View (Spreadsheet / List)"
                >
                  <List size={14} />
                  <span>Table</span>
                </button>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-muted)',
                whiteSpace: 'nowrap',
              }}>
                Showing {filteredGuestUploads.length} of {guestUploads.length}
              </div>
            </div>
          </div>

          {/* Guestbook Content: Cards or Table */}
          {guestViewMode === 'card' ? (
            <div 
              className="guestbook-cards-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '1.25rem',
                alignItems: 'stretch',
              }}
            >
              {filteredGuestUploads.map((upload) => {
                const initials = (upload.uploaderName || 'Guest')
                  .trim()
                  .split(/\s+/)
                  .map(n => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                const hasCaption = Boolean(upload.caption && upload.caption.trim());

                return (
                  <div
                    key={upload.id}
                    className="photo-shot-card"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1.5px solid var(--color-muted)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.95rem',
                      boxShadow: 'var(--box-shadow-subtle)',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {/* Top Row: Avatar + Name + Date + Photo Count + Delete */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: hasCaption ? 'linear-gradient(135deg, var(--color-gold, #cda250), #b38636)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                          }}>
                            {initials || 'G'}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <h3 style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: 'var(--color-text)',
                                wordBreak: 'break-word',
                              }}>
                                {upload.uploaderName || 'Anonymous Guest'}
                              </h3>

                              {hasCaption && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  backgroundColor: 'var(--color-gold-muted, rgba(205, 162, 80, 0.15))',
                                  color: 'var(--color-gold, #cda250)',
                                  border: '1px solid var(--color-gold, #cda250)',
                                  borderRadius: '10px',
                                  padding: '0.1rem 0.45rem',
                                  fontSize: '0.68rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                }}>
                                  <Heart size={10} fill="currentColor" /> Guest Note
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', color: 'var(--color-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                              <Clock size={11} style={{ flexShrink: 0 }} />
                              <span>{formatUploadTime(upload.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-muted)',
                            borderRadius: 'var(--border-radius-sm)',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            color: 'var(--color-text)',
                          }}>
                            <ImageIcon size={12} style={{ color: 'var(--color-primary)' }} />
                            <span>{upload.fileCount || upload.files?.length || 1} file(s)</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setUploadToDelete(upload)}
                            style={{
                              ...styles.iconBtn,
                              color: 'var(--color-muted)',
                              padding: '0.35rem',
                            }}
                            title="Remove guestbook entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Message Quote Box */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {hasCaption ? (
                        <div style={{
                          backgroundColor: 'var(--color-bg)',
                          borderLeft: '3.5px solid var(--color-gold, #cda250)',
                          borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0',
                          padding: '0.85rem 1rem',
                          position: 'relative',
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '10px',
                            opacity: 0.15,
                            color: 'var(--color-gold, #cda250)',
                          }}>
                            <MessageSquare size={22} />
                          </div>
                          <p style={{
                            margin: 0,
                            fontStyle: 'italic',
                            fontSize: '0.9rem',
                            lineHeight: 1.55,
                            color: 'var(--color-text)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}>
                            &ldquo;{upload.caption.trim()}&rdquo;
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-muted)',
                          fontStyle: 'italic',
                          padding: '0.35rem 0',
                        }}>
                          (Uploaded without a written note)
                        </div>
                      )}
                    </div>

                    {/* Uploaded Files Links & Target Google Drive Folder */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                      paddingTop: '0.65rem',
                      borderTop: '1px dashed var(--color-muted)',
                      marginTop: 'auto',
                    }}>
                      {/* File Pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0 }}>
                        {(upload.files || []).slice(0, 4).map((file, fIdx) => (
                          <a
                            key={file.id || fIdx}
                            href={file.webViewLink || (upload.folderId ? `https://drive.google.com/drive/folders/${upload.folderId}` : '#')}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.28rem',
                              padding: '0.2rem 0.5rem',
                              backgroundColor: 'var(--color-bg)',
                              border: '1px solid var(--color-muted)',
                              borderRadius: 'var(--border-radius-sm)',
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--color-text)',
                              textDecoration: 'none',
                              transition: 'var(--transition-smooth)',
                            }}
                            title={file.name || 'View photo in Google Drive'}
                          >
                            <ImageIcon size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {file.name || `Photo ${fIdx + 1}`}
                            </span>
                            <ExternalLink size={10} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                          </a>
                        ))}
                        {(upload.files || []).length > 4 && (
                          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                            +{upload.files.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Target Folder Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginLeft: 'auto' }}>
                        <FolderOpen size={11} style={{ color: 'var(--color-primary)' }} />
                        <span>Album: {upload.folderName || selectedFolder.name || 'Guest Uploads'}</span>
                        {upload.folderId && (
                          <a
                            href={`https://drive.google.com/drive/folders/${upload.folderId}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center' }}
                            title="Open album in Google Drive"
                          >
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table / List View */
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>GUEST</th>
                    <th style={styles.th}>DATE & TIME</th>
                    <th style={styles.th}>MESSAGE / WISHES</th>
                    <th style={styles.th}>PHOTOS & FILES</th>
                    <th style={styles.th}>ALBUM</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuestUploads.map((upload) => {
                    const initials = (upload.uploaderName || 'Guest')
                      .trim()
                      .split(/\s+/)
                      .map(n => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    const hasCaption = Boolean(upload.caption && upload.caption.trim());

                    return (
                      <tr key={upload.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: hasCaption ? 'linear-gradient(135deg, var(--color-gold, #cda250), #b38636)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontFamily: 'var(--font-serif)',
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}>
                              {initials || 'G'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.88rem' }}>
                                {upload.uploaderName || 'Anonymous Guest'}
                              </div>
                              {hasCaption && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  color: 'var(--color-gold, #cda250)',
                                  fontSize: '0.65rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  marginTop: '2px',
                                }}>
                                  <Heart size={9} fill="currentColor" /> Guest Note
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                            <Clock size={12} style={{ flexShrink: 0 }} />
                            <span>{formatUploadTime(upload.uploadedAt) || '-'}</span>
                          </div>
                        </td>

                        <td style={{ ...styles.td, maxWidth: '320px' }}>
                          {hasCaption ? (
                            <div style={{
                              fontSize: '0.85rem',
                              fontStyle: 'italic',
                              color: 'var(--color-text)',
                              lineHeight: 1.45,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}>
                              &ldquo;{upload.caption.trim()}&rdquo;
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                              (No note)
                            </span>
                          )}
                        </td>

                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {(upload.files || []).slice(0, 3).map((file, fIdx) => (
                              <a
                                key={file.id || fIdx}
                                href={file.webViewLink || (upload.folderId ? `https://drive.google.com/drive/folders/${upload.folderId}` : '#')}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.15rem 0.45rem',
                                  backgroundColor: 'var(--color-bg)',
                                  border: '1px solid var(--color-muted)',
                                  borderRadius: 'var(--border-radius-sm)',
                                  fontSize: '0.7rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--color-text)',
                                  textDecoration: 'none',
                                }}
                                title={file.name || 'View photo in Google Drive'}
                              >
                                <ImageIcon size={10} style={{ color: 'var(--color-primary)' }} />
                                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {file.name || `Photo ${fIdx + 1}`}
                                </span>
                                <ExternalLink size={9} style={{ color: 'var(--color-muted)' }} />
                              </a>
                            ))}
                            {(upload.files || []).length > 3 && (
                              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                                +{upload.files.length - 3}
                              </span>
                            )}
                            {(!upload.files || upload.files.length === 0) && (
                              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                                {upload.fileCount || 1} file(s)
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                            <FolderOpen size={12} style={{ color: 'var(--color-primary)' }} />
                            <span>{upload.folderName || selectedFolder.name || 'Guest Uploads'}</span>
                            {upload.folderId && (
                              <a
                                href={`https://drive.google.com/drive/folders/${upload.folderId}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center' }}
                                title="Open album in Google Drive"
                              >
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </td>

                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setUploadToDelete(upload)}
                            style={{
                              ...styles.iconBtn,
                              color: 'var(--color-muted)',
                              padding: '0.35rem',
                            }}
                            title="Remove guestbook entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

            {/* Empty State */}
            {filteredGuestUploads.length === 0 && (
              <div style={{
                ...styles.emptyState,
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px dashed var(--color-muted)',
                borderRadius: 'var(--border-radius-md)',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-gold-muted, rgba(205, 162, 80, 0.15))',
                  color: 'var(--color-gold, #cda250)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}>
                  <Heart size={28} />
                </div>

                <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-text)' }}>
                  {guestUploads.length === 0 ? 'No Guest Photos or Notes Yet' : 'No Submissions Match Search'}
                </h4>

                <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', maxWidth: '460px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                  {guestUploads.length === 0 
                    ? 'Share your wedding upload portal link or print table QR codes so guests can upload pictures and write heartfelt wishes directly into your Google Drive album.'
                    : `No guest submissions matched "${guestSearchTerm}". Clear your search or filter to see all submissions.`
                  }
                </p>

                {guestUploads.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsUploadSetupOpen(true)}
                    style={{
                      ...styles.addButton,
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.8rem',
                      boxShadow: 'var(--box-shadow-subtle)',
                      margin: '0 auto',
                    }}
                  >
                    <UploadCloud size={16} style={{ marginRight: '8px' }} />
                    SHARE GUEST UPLOAD PORTAL & QR CODE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setGuestSearchTerm(''); setOnlyWithNotes(false); }}
                    style={{
                      ...styles.addButton,
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-muted)',
                      padding: '0.5rem 1rem',
                      margin: '0 auto',
                    }}
                  >
                    RESET FILTERS
                  </button>
                )}
              </div>
            )}
        </>
      )}

      {/* MONARCH SLIDE-OVER DRAWER FOR ADD / EDIT PHOTO SHOT */}
      <SlideOverDrawer
        isOpen={Boolean(isAddingShot || editingShot)}
        onClose={() => { setIsAddingShot(false); setEditingShot(null); }}
        title={isAddingShot ? 'Add Photo Shot' : 'Edit Photo Shot'}
        subtitle={
          editingShot
            ? `${editingShot.shotId || 'Shot'} • ${editingShot.location || 'Venue'}`
            : 'Capture meaningful wedding moments'
        }
        badge={editingShot ? (editingShot.shotId || 'SHOT') : 'NEW SHOT'}
        width="540px"
        onPrev={
          editingShot && currentEditingShotIndex > 0
            ? () => handleNavigateAdjacentShot('prev')
            : undefined
        }
        onNext={
          editingShot && currentEditingShotIndex < filteredPhotos.length - 1
            ? () => handleNavigateAdjacentShot('next')
            : undefined
        }
        footer={
          (() => {
            const isShotFormValid = Boolean((formData.description || '').trim());
            const isDisabled = !isShotFormValid || Boolean(isSyncing);
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem', flexWrap: 'wrap' }}>
                {editingShot ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShotToDelete(editingShot);
                      setIsAddingShot(false);
                      setEditingShot(null);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-red, #dc2626)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '6px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <Trash2 size={15} />
                    Delete Shot
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => { setIsAddingShot(false); setEditingShot(null); }}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #e2e8f0)',
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-text, #1a202c)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Cancel
                  </button>

                  {isAddingShot && (
                    <button
                      type="button"
                      disabled={isDisabled}
                      title={!isShotFormValid ? 'Enter Shot Description to enable saving' : undefined}
                      onClick={(e) => handleSaveShot(e, true)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isDisabled ? 'var(--color-border, #cbd5e1)' : 'var(--color-primary)'}`,
                        backgroundColor: 'var(--color-surface, #ffffff)',
                        color: isDisabled ? 'var(--color-muted, #94a3b8)' : 'var(--color-primary)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.45 : 1,
                        minHeight: '44px',
                      }}
                    >
                      Save & Add Another
                    </button>
                  )}

                  <button
                    type="submit"
                    form="photo-shot-form"
                    disabled={isDisabled}
                    title={!isShotFormValid ? 'Enter Shot Description to enable saving' : undefined}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isDisabled ? 'var(--color-muted, #94a3b8)' : 'var(--color-primary, #6366f1)',
                      color: isDisabled ? '#ffffff' : 'var(--color-on-primary, #ffffff)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.45 : 1,
                      boxShadow: isDisabled ? 'none' : '0 2px 6px rgba(0,0,0,0.12)',
                      minHeight: '44px',
                    }}
                  >
                    {isAddingShot ? 'Save Shot' : 'Save Changes'}
                  </button>
                </div>
              </div>
            );
          })()
        }
      >
        <form id="photo-shot-form" onSubmit={handleSaveShot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Section 1: Shot Details */}
          <DrawerSection title="Shot Details" description="Core description and priority level for the photographer">
            <DrawerField label="Shot Description" required hint="Specific pose or family grouping">
              <input
                type="text"
                required
                placeholder="e.g. Couple with Grandparents & VIPs"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  color: 'var(--color-text, #1a202c)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </DrawerField>

            <DrawerField label="Priority Level">
              <PriorityPills
                options={PHOTO_PRIORITY_OPTIONS}
                value={formData.priority || 'Must Have'}
                onChange={(val) => setFormData({ ...formData, priority: val as any })}
              />
            </DrawerField>

            <DrawerField label="Capture Status">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['Pending', 'Captured'] as const).map((st) => {
                  const isActive = (formData.status || 'Pending') === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: st })}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border, #e2e8f0)',
                        backgroundColor: isActive ? 'var(--color-primary-subtle, rgba(99, 102, 241, 0.08))' : 'var(--color-surface, #ffffff)',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted, #718096)',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '40px',
                      }}
                    >
                      {st === 'Captured' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      {st}
                    </button>
                  );
                })}
              </div>
            </DrawerField>
          </DrawerSection>

          {/* Section 2: Location & Timing */}
          <DrawerSection title="Timing & Location" description="Where and when the photographer should be ready">
            <DrawerRow columns={2}>
              <DrawerField label="Location" hint="Where the shot takes place">
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #718096)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Main Chapel Altar"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #e2e8f0)',
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-text, #1a202c)',
                      fontSize: '1rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </DrawerField>

              <DrawerField label="Estimated Time" hint="Schedule anchor">
                <div style={{ position: 'relative' }}>
                  <Clock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #718096)' }} />
                  <input
                    type="text"
                    placeholder="e.g. 03:30 PM (Post-Ceremony)"
                    value={formData.shotTime || ''}
                    onChange={(e) => setFormData({ ...formData, shotTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #e2e8f0)',
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-text, #1a202c)',
                      fontSize: '1rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </DrawerField>
            </DrawerRow>
          </DrawerSection>

          {/* Section 3: VIPs & Notes */}
          <DrawerSection title="Subjects & Instructions" description="People to round up and framing requirements">
            <DrawerField label="Included People / VIPs" hint="Names of relatives or wedding party members">
              <div style={{ position: 'relative' }}>
                <Users size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #718096)' }} />
                <input
                  type="text"
                  placeholder="e.g. Sarah, John, Grandma Mary"
                  value={formData.people || ''}
                  onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    color: 'var(--color-text, #1a202c)',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </DrawerField>

            <DrawerField label="Posing / Lighting Notes" hint="Special instructions for camera crew">
              <textarea
                rows={3}
                placeholder="e.g. Golden hour lighting preferred, wide-angle lens, couple portrait"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  color: 'var(--color-text, #1a202c)',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                }}
              />
            </DrawerField>
          </DrawerSection>
        </form>
      </SlideOverDrawer>

      {/* IN-APP DELETE SHOT CONFIRMATION MODAL */}
      {shotToDelete && (
        <div style={styles.modalOverlay} onClick={() => setShotToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE PHOTO SHOT CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setShotToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{shotToDelete.description}"</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShotToDelete(null)}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  style={styles.confirmDeleteBtn}
                  onClick={confirmDeleteShot}
                >
                  DELETE SHOT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE GUEST ENTRY CONFIRMATION MODAL */}
      {uploadToDelete && (
        <div style={styles.modalOverlay} onClick={() => setUploadToDelete(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  REMOVE GUESTBOOK ENTRY
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setUploadToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to remove the guestbook entry from <strong style={{ color: 'var(--color-red)' }}>&ldquo;{uploadToDelete.uploaderName || 'Anonymous Guest'}&rdquo;</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
                This removes the note and submission record from your in-app activity feed. Any photos or videos already uploaded to Google Drive will remain safe in your album folder.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setUploadToDelete(null)}
                  disabled={isDeletingUpload}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  style={styles.confirmDeleteBtn}
                  onClick={confirmDeleteUpload}
                  disabled={isDeletingUpload}
                >
                  {isDeletingUpload ? 'REMOVING...' : 'REMOVE ENTRY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GUEST PHOTO UPLOAD SETUP MODAL (Disabled for Initial Launch) */}
      {false && isUploadSetupOpen && (
        <div 
          className="photo-modal-overlay" 
          style={styles.modalOverlay} 
          onClick={() => setIsUploadSetupOpen(false)}
        >
          <div 
            className="photo-modal-content photo-setup-modal-content" 
            style={{
              ...styles.modalContent,
              maxWidth: '580px',
              maxHeight: '92vh',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{
                ...styles.modalHeader,
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-gold-muted, rgba(205, 162, 80, 0.15))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gold, #cda250)',
                    flexShrink: 0
                  }}
                >
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 style={{ ...styles.modalTitle, color: 'var(--color-text)', fontSize: '1rem' }}>
                    GUEST PHOTO UPLOAD SETUP
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                    Direct-to-Drive Wedding Guest Gallery & QR Portal
                  </p>
                </div>
              </div>
              <button 
                style={{ ...styles.closeBtn, color: 'var(--color-muted)' }} 
                onClick={() => setIsUploadSetupOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={styles.modalBodyScroll}>
              {/* Feature Intro Banner */}
              <div 
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-muted)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <Sparkles size={18} style={{ color: 'var(--color-gold, #cda250)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: '1.4', color: 'var(--color-text)' }}>
                  Give guests instant access to upload pictures & videos from their phones directly to your private Google Drive folder — no app install or account required!
                </p>
              </div>

              {/* Google Drive Account Connection Banner */}
              {effectiveUserEmail || googleToken ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                    <span>Google Drive Connected {effectiveUserEmail ? `(${effectiveUserEmail})` : ''}</span>
                  </div>
                  {onOpenGoogleAuth && (
                    <button
                      type="button"
                      onClick={onOpenGoogleAuth}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        padding: 0,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      Reconnect account
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-text)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                      Connect Google Drive to save guest uploads directly to your Drive.
                    </span>
                  </div>
                  {onOpenGoogleAuth && (
                    <button
                      type="button"
                      onClick={onOpenGoogleAuth}
                      style={{
                        backgroundColor: '#0B57D0',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      CONNECT GOOGLE DRIVE
                    </button>
                  )}
                </div>
              )}

              {/* 1. Destination Folder Selector */}
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>1. GOOGLE DRIVE DESTINATION FOLDER</label>
                <div 
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1.5px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0, flex: '1 1 200px' }}>
                    <HardDrive size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedFolder.name || 'Guest Uploads'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedFolder.path}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDrivePickerOpen(true)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-muted)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.4rem 0.75rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="Select a different Google Drive folder or create a new one"
                  >
                    <FolderOpen size={14} style={{ color: 'var(--color-primary)' }} /> CHANGE FOLDER
                  </button>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                  Photos and videos submitted by guests will be saved into this Drive folder.
                </span>
              </div>

              {/* 2. Expiration Duration Selector */}
              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <label style={styles.fieldLabel}>2. LINK EXPIRATION DURATION</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-gold, #cda250)', fontWeight: 600 }}>
                    {getFormattedExpirationText(expirationDays)}
                  </span>
                </div>

                <div 
                  className="photo-duration-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem',
                  }}
                >
                  {[
                    { label: '7 Days', days: 7 },
                    { label: '14 Days', days: 14 },
                    { label: '30 Days', days: 30 },
                    { label: '60 Days', days: 60 },
                    { label: '90 Days', days: 90, recommended: true },
                    { label: '180 Days', days: 180 },
                    { label: '1 Year', days: 365 },
                    { label: 'Permanent', days: 0 },
                  ].map(opt => {
                    const isSelected = expirationDays === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => handleExpirationChange(opt.days)}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: isSelected ? 700 : 500,
                          padding: '0.5rem 0.25rem',
                          textAlign: 'center',
                          borderRadius: 'var(--border-radius-sm)',
                          backgroundColor: isSelected ? 'var(--color-btn-selected-bg)' : 'var(--color-bg)',
                          color: isSelected ? 'var(--color-btn-selected-text)' : 'var(--color-text)',
                          border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-muted)',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                          position: 'relative',
                        }}
                      >
                        {opt.label}
                        {opt.recommended && !isSelected && (
                          <span 
                            style={{
                              display: 'block',
                              fontSize: '0.55rem',
                              color: 'var(--color-gold, #cda250)',
                              fontWeight: 700,
                              marginTop: '2px',
                            }}
                          >
                            RECOMMENDED
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                  Once expired, submissions are automatically closed to prevent unwanted uploads.
                </span>
              </div>

              {/* 3. Live Generated Guest Upload Link */}
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>3. GUEST UPLOAD WEB LINK</label>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg)',
                    border: '1.5px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.35rem 0.5rem',
                    gap: '0.5rem',
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    value={guestUploadUrl}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-text)',
                      outline: 'none',
                      userSelect: 'all',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyGuestUploadUrl}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: copiedLink ? 'var(--color-green)' : 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.45rem 0.75rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                    {copiedLink ? 'COPIED!' : 'COPY'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(guestUploadUrl, '_blank')}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-muted)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.4rem 0.55rem',
                      cursor: 'pointer',
                      color: 'var(--color-text)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    title="Open live guest portal in a new tab"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* 4. Instant QR Code for Table Displays */}
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>4. INSTANT QR CODE (PRINT ON PLACE CARDS & TABLES)</label>
                <div 
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div 
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '6px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&format=png&data=${encodeURIComponent(guestUploadUrl)}`} 
                      alt="Guest Upload QR Code"
                      width={120}
                      height={120}
                      style={{ display: 'block', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <h4 style={{ margin: '0 0 0.35rem 0', fontFamily: 'var(--font-serif)', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      Scan to Upload Photos
                    </h4>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: '1.4' }}>
                      Guests point their phone camera at this QR code to open your upload portal instantly.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <a
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&data=${encodeURIComponent(guestUploadUrl)}`}
                        download="Wedding_Guest_Photo_Upload_QR.png"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-muted)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.35rem 0.65rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <QrCode size={13} style={{ color: 'var(--color-primary)' }} /> DOWNLOAD HI-RES QR
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.formActions}>
              <button 
                type="button" 
                style={{
                  ...styles.saveBtn,
                  backgroundColor: 'var(--color-btn-selected-bg)',
                  color: 'var(--color-btn-selected-text)'
                }} 
                onClick={() => setIsUploadSetupOpen(false)}
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Picker Modal Integration */}
      {isDrivePickerOpen && (
        <GoogleDrivePickerModal
          isOpen={isDrivePickerOpen}
          accessToken={googleToken}
          spreadsheetId={spreadsheetId}
          initialPath={selectedFolder.path}
          onClose={() => setIsDrivePickerOpen(false)}
          onSelectFolder={handleFolderSelect}
        />
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <MobileFAB onClick={startAddShot} label="Add Photo Shot" disabled={isSyncing} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    margin: 0,
    color: 'var(--color-primary)',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: '0.25rem 0 0 0',
  },
  addButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-btn-selected-bg)',
    color: 'var(--color-btn-selected-text)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  kpiBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.875rem',
  },
  kpiItem: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.875rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  kpiLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  kpiValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 240px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '10px',
    color: 'var(--color-muted)',
  },
  searchInput: {
    width: '100%',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterSelect: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  shotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  shotCard: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: 'var(--box-shadow-subtle)',
    transition: 'var(--transition-smooth)',
  },
  shotHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  statusCheckBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  shotIdBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-muted)',
  },
  priorityBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
  },
  shotTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0.25rem 0 0 0',
    lineHeight: 1.3,
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  metaBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  notesText: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    margin: 0,
    fontStyle: 'italic',
    borderTop: '1px dashed var(--color-muted)',
    paddingTop: '0.5rem',
  },
  emptyState: {
    gridColumn: '1 / -1',
    backgroundColor: 'var(--color-surface)',
    border: '1px dashed var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '3rem 1rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--box-shadow-heavy)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  modalBodyScroll: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
    overflowY: 'auto',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  fieldLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  inputField: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
  },
  selectInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    borderTop: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-surface)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-btn-selected-bg)',
    color: 'var(--color-btn-selected-text)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  confirmDeleteBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-red)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  tableWrapper: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    overflowX: 'auto',
    border: '1.5px solid var(--color-muted)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '760px',
  },
  th: {
    textAlign: 'left',
    padding: '0.85rem 1rem',
    borderBottom: '2px solid var(--color-muted)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: 'var(--color-bg)',
  },
  tr: {
    borderBottom: '1px solid var(--color-muted)',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.85rem',
    color: 'var(--color-text)',
    verticalAlign: 'middle',
  },
};
