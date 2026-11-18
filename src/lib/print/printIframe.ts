/**
 * Isolated hidden-iframe print utility.
 * Solves DEFECT-001 where printing from inside fixed/overflow-hidden React modals
 * causes Chromium/Blink/WebKit print previews to repeat Page 1 across all pages.
 */
export function printElementInIframe(
  element: HTMLElement | null,
  options?: {
    title?: string;
    extraCss?: string;
  }
): void {
  if (!element || typeof window === 'undefined' || typeof document === 'undefined') {
    window?.print?.();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc || !iframe.contentWindow) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  // Clone stylesheets and inline styles from the parent document
  const headNodes = Array.from(
    document.head.querySelectorAll('link[rel="stylesheet"], style')
  )
    .map((node) => node.outerHTML)
    .join('\n');

  const safeTitle = (options?.title || document.title || 'Print Document')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html data-theme="light">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    ${headNodes}
    <style>
      @page {
        margin: 0.5in;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .escort-modal-printable,
      .dossier-modal-printable,
      .catering-modal-printable,
      #print-studio-paper-content {
        position: static !important;
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        background: #ffffff !important;
        color: #0f172a !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      /* Unconstrain any inner scroll containers inside the cloned modal */
      .escort-modal-printable > div,
      .dossier-modal-printable > div,
      .catering-modal-printable > div,
      #print-studio-paper-content > div {
        max-height: none !important;
        overflow: visible !important;
      }
      .escort-no-print,
      .dossier-no-print,
      .catering-no-print,
      .print-no-print {
        display: none !important;
      }
      .escort-print-columns {
        column-count: 2 !important;
        column-gap: 2rem !important;
      }
      .escort-group-break,
      .dossier-page-break-avoid,
      .catering-table-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      ${options?.extraCss || ''}
    </style>
  </head>
  <body>
    ${element.outerHTML}
  </body>
</html>`;

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 300);
  };

  const triggerPrint = () => {
    try {
      const win = iframe.contentWindow;
      if (!win) {
        cleanup();
        return;
      }
      win.addEventListener('afterprint', cleanup, { once: true });
      win.focus();
      win.print();
      // Fallback cleanup in case afterprint does not fire
      setTimeout(cleanup, 60000);
    } catch {
      cleanup();
    }
  };

  // Allow cloned stylesheets & layout a brief tick to paint before printing
  setTimeout(triggerPrint, 200);
}
