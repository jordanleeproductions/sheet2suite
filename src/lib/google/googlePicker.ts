'use client';

export interface PickedDriveFolder {
  id: string;
  name: string;
  path: string;
  url?: string;
}

interface OpenGooglePickerOptions {
  accessToken: string;
  appId?: string;
  clientId?: string;
  onSelect: (folder: PickedDriveFolder) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

let isGapiLoading = false;
let isGapiLoaded = false;

function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window is undefined'));
    if ((window as any).gapi && (window as any).google?.picker) {
      isGapiLoaded = true;
      return resolve();
    }

    if (isGapiLoaded && (window as any).gapi) {
      return resolve();
    }

    const existingScript = document.getElementById('google-api-script');
    if (existingScript) {
      if ((window as any).gapi) {
        (window as any).gapi.load('picker', () => {
          isGapiLoaded = true;
          resolve();
        });
      } else {
        existingScript.addEventListener('load', () => {
          (window as any).gapi.load('picker', () => {
            isGapiLoaded = true;
            resolve();
          });
        });
      }
      return;
    }

    isGapiLoading = true;
    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGapiLoading = false;
      if ((window as any).gapi) {
        (window as any).gapi.load('picker', () => {
          isGapiLoaded = true;
          resolve();
        });
      } else {
        resolve();
      }
    };
    script.onerror = (err) => {
      isGapiLoading = false;
      reject(err);
    };
    document.body.appendChild(script);
  });
}

/**
 * Launches the official native Google Drive Picker popup to select a folder
 */
export async function openGoogleDriveNativePicker({
  accessToken,
  appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID || '767186406651',
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  onSelect,
  onCancel,
  onError,
}: OpenGooglePickerOptions): Promise<boolean> {
  try {
    if (!accessToken) {
      throw new Error('No Google OAuth access token provided. Please connect your Google account.');
    }

    await loadGapiScript();

    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!google?.picker) {
      await new Promise<void>((resolve, reject) => {
        gapi.load('picker', {
          callback: () => resolve(),
          onerror: (err: any) => reject(err),
        });
      });
    }

    const docsView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes('application/vnd.google-apps.folder');

    const builder = new google.picker.PickerBuilder()
      .setOAuthToken(accessToken)
      .addView(docsView)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setCallback(async (data: any) => {
        if (
          data[google.picker.Response.ACTION] === google.picker.Action.PICKED ||
          data.action === 'picked' ||
          data.action === google.picker.Action.PICKED
        ) {
          const docs = data[google.picker.Response.DOCUMENTS] || data.docs || [];
          const doc = docs[0];
          if (doc) {
            const folderName = doc[google.picker.Document.NAME] || doc.name || 'Selected Folder';
            const folderId = doc[google.picker.Document.ID] || doc.id || '';
            const docUrl = doc[google.picker.Document.URL] || doc.url;

            let fullPath = folderName.toLowerCase() === 'my drive' ? 'My Drive' : `My Drive / ${folderName}`;

            if (folderId && folderId !== 'root') {
              try {
                const res = await fetch(`/api/drive/resolve-path?folderId=${encodeURIComponent(folderId)}&name=${encodeURIComponent(folderName)}`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
                if (res.ok) {
                  const pathData = await res.json();
                  if (pathData.fullPath) {
                    fullPath = pathData.fullPath;
                  }
                }
              } catch (e) {
                console.warn('Failed to resolve nested parent path:', e);
              }
            }

            onSelect({
              id: folderId,
              name: folderName,
              path: fullPath,
              url: docUrl,
            });
          }
        } else if (data.action === google.picker.Action.CANCEL || data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
          if (onCancel) onCancel();
        }
      });

    if (appId) {
      builder.setAppId(appId);
    }

    const picker = builder.build();
    picker.setVisible(true);
    return true;
  } catch (error) {
    console.error('Failed to open Google Drive Picker:', error);
    if (onError) onError(error);
    return false;
  }
}
