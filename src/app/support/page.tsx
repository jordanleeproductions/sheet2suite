'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Zap,
  Users,
  Table,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  CheckCircle2,
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle,
  Info,
  Lightbulb,
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { PageSearchInput } from '@/components/PageSearchInput';
import {
  SUPPORT_ARTICLES,
  SUPPORT_CATEGORIES,
  SupportArticle,
  SupportCategory
} from '@/data/supportArticles';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SupportCategory>('all');
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  // Contact form state
  const [contactCategory, setContactCategory] = useState('Activation & Order');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);

  // Diagnostic telemetry
  const [telemetry, setTelemetry] = useState({
    userAgent: '',
    platform: '',
    screenResolution: '',
    timestamp: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTelemetry({
        userAgent: navigator.userAgent,
        platform: navigator.platform || 'Unknown',
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // Handle URL hash deep-linking on initial mount and hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setExpandedSlugs(prev => new Set(prev).add(hash));
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleArticle = (slug: string) => {
    setExpandedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  // Filter articles based on active category and keyword search
  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SUPPORT_ARTICLES.filter(article => {
      const matchesCategory =
        activeCategory === 'all' || article.category === activeCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      const titleMatch = article.title.toLowerCase().includes(q);
      const summaryMatch = article.summary.toLowerCase().includes(q);
      const keywordMatch = article.keywords.some(k => k.toLowerCase().includes(q));
      const contentMatch = article.content.some(c => c.toLowerCase().includes(q));

      return titleMatch || summaryMatch || keywordMatch || contentMatch;
    });
  }, [searchQuery, activeCategory]);

  // Compute live counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SUPPORT_ARTICLES.length };
    SUPPORT_CATEGORIES.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = SUPPORT_ARTICLES.filter(a => a.category === cat.id).length;
      }
    });
    return counts;
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap size={15} />;
      case 'Users':
        return <Users size={15} />;
      case 'Table':
        return <Table size={15} />;
      case 'ShieldCheck':
        return <ShieldCheck size={15} />;
      case 'HelpCircle':
        return <HelpCircle size={15} />;
      default:
        return <BookOpen size={15} />;
    }
  };

  const getCalloutIcon = (type: 'tip' | 'info' | 'warning') => {
    switch (type) {
      case 'tip':
        return <Lightbulb size={16} className="text-amber-500 shrink-0" />;
      case 'warning':
        return <AlertCircle size={16} className="text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info size={16} className="text-indigo-500 shrink-0" />;
    }
  };

  // Generate mailto link with formatted diagnostic telemetry
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Support Inquiry] ${contactCategory}`);
    const bodyText = [
      `Category: ${contactCategory}`,
      contactEmail ? `User Email: ${contactEmail}` : '',
      '',
      '--- Issue Description ---',
      contactMessage || '(Please describe your question or issue here)',
      '',
      '--- System Diagnostics ---',
      `Timestamp: ${telemetry.timestamp || new Date().toISOString()}`,
      `User Agent: ${telemetry.userAgent}`,
      `Platform: ${telemetry.platform}`,
      `Screen: ${telemetry.screenResolution}`
    ]
      .filter(Boolean)
      .join('\n');

    const mailtoUrl = `mailto:support@sheet2suite.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyDiagnostics = () => {
    const diagnosticText = [
      `Timestamp: ${telemetry.timestamp}`,
      `User Agent: ${telemetry.userAgent}`,
      `Platform: ${telemetry.platform}`,
      `Screen: ${telemetry.screenResolution}`
    ].join('\n');

    navigator.clipboard.writeText(diagnosticText);
    setCopiedDiagnostics(true);
    setTimeout(() => setCopiedDiagnostics(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#090D16] text-slate-800 dark:text-slate-200 transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group text-slate-900 dark:text-white font-medium hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-[3px] bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet size={18} />
              </div>
              <span className="font-serif text-xl tracking-tight">Sheet2Suite</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-[3px]">
              Help Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/activate"
              className="text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Activate Order ➔
            </Link>
            <Link
              href="/"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Hub
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Editorial Masthead */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-mono uppercase tracking-wider mb-4">
            <Sparkles size={13} />
            Official Knowledge Base
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-3">
            Help Center & User Guides
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Everything you need to know about activating your order, connecting Google Drive, collaborating with your partner, and managing two-way spreadsheet sync.
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-xl mx-auto">
            <PageSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search guides, topics, order activation, formulas..."
              size="lg"
              resultCount={searchQuery ? filteredArticles.length : undefined}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar scroll-smooth">
          {SUPPORT_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[3px] text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.2 rounded-[2px] ${
                    isActive
                      ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Articles List / Empty State */}
        <div className="space-y-4 mb-14">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-[3px] border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/30">
              <HelpCircle size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="font-serif text-lg text-slate-900 dark:text-white mb-1">
                No guides found matching &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                Try searching for broader keywords like &quot;order&quot;, &quot;sync&quot;, &quot;drive&quot;, or &quot;invite&quot;.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-mono font-semibold uppercase rounded-[3px]"
                >
                  Clear Search
                </button>
                <a
                  href="#contact-support"
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold uppercase rounded-[3px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Contact Support
                </a>
              </div>
            </div>
          ) : (
            filteredArticles.map(article => {
              const isExpanded = expandedSlugs.has(article.slug);
              return (
                <div
                  key={article.id}
                  id={article.slug}
                  className="rounded-[3px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs transition-colors overflow-hidden"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleArticle(article.slug)}
                    aria-expanded={isExpanded}
                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors focus:outline-hidden"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-[2px]">
                          {article.categoryLabel}
                        </span>
                      </div>
                      <h2 className="font-serif text-lg sm:text-xl text-slate-900 dark:text-white font-medium">
                        {article.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="mt-1 text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
                      {article.content.map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}

                      {article.callout && (
                        <div className="mt-4 p-4 rounded-[3px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                          {getCalloutIcon(article.callout.type)}
                          <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            {article.callout.text}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/40">
                        <span>Anchor: #{article.slug}</span>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/support#${article.slug}`;
                            navigator.clipboard.writeText(url);
                          }}
                          className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Copy Article Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* In-Page Diagnostic Contact Card */}
        <section
          id="contact-support"
          className="rounded-[3px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
        >
          <div className="max-w-2xl mx-auto text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Mail size={12} /> Direct Contact
            </div>
            <h2 className="font-serif text-2xl text-slate-900 dark:text-white">
              Still Need Help? Contact Support
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Have a specific question about your order or spreadsheet? Send a message directly to our engineering team with pre-filled diagnostics.
            </p>
          </div>

          <form onSubmit={handleSendEmail} className="max-w-xl mx-auto space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Category
              </label>
              <select
                value={contactCategory}
                onChange={e => setContactCategory(e.target.value)}
                className="w-full min-h-[46px] text-sm px-3 py-2 rounded-[3px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Activation & Order">Activation & Order Receipt</option>
                <option value="Google Drive & Sync">Google Drive & Sync Health</option>
                <option value="Sharing & Collaborators">Sharing & Partner Collaboration</option>
                <option value="Feature Request">Feature Request or Feedback</option>
                <option value="Other Question">Other General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Email Address (Optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[46px] text-base sm:text-sm px-3 py-2 rounded-[3px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Describe Your Issue or Question
              </label>
              <textarea
                rows={4}
                value={contactMessage}
                onChange={e => setContactMessage(e.target.value)}
                placeholder="Include your order number or describe what happened..."
                className="w-full text-base sm:text-sm p-3 rounded-[3px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Diagnostic Telemetry Reassurance */}
            <div className="p-3.5 rounded-[3px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>Auto-Attached Diagnostics</span>
                <button
                  type="button"
                  onClick={handleCopyDiagnostics}
                  className="hover:text-emerald-600 flex items-center gap-1 text-[10px]"
                >
                  {copiedDiagnostics ? <Check size={12} /> : <Copy size={12} />}
                  {copiedDiagnostics ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="truncate">Browser: {telemetry.userAgent || 'Detecting...'}</p>
              <p>Platform: {telemetry.platform} • Screen: {telemetry.screenResolution}</p>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-mono font-semibold text-xs uppercase tracking-wider rounded-[3px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send size={15} /> Open Email Client (support@sheet2suite.com)
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] py-8 text-center text-xs font-mono text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sheet2Suite. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
              Terms of Service
            </Link>
            <Link href="/activate" className="hover:text-slate-900 dark:hover:text-white">
              Activate Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
