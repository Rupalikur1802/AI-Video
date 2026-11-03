'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Download,
  Wand2,
  BookOpen,
  ArrowRight,
  Menu,
  Play,
  X,
  FileText,
  Volume2,
} from 'lucide-react';

/* ── Video background ─────────────────────────────────────────────── */
const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4';

/* ── Real Sochitra sample video ───────────────────────────────────── */
const SAMPLE_VIDEO =
  'https://res.cloudinary.com/v20abvna/video/upload/v1793612284/sochitra/poc/nkcovimpb3hfl3derbfr.mp4';

/* ── Thumbnail asset from project ─────────────────────────────────── */
const THUMB_IMG = '/images/design-0.png';

/* ──────────────────────────────────────────────────────────────────
   Logo SVG — geometric flower/prism motif
   ────────────────────────────────────────────────────────────────── */
function BrandLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="12"
          rx="4"
          ry="9"
          fill="rgba(255,255,255,0.45)"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="5.5" fill="white" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Inline Social SVGs
   ────────────────────────────────────────────────────────────────── */
const TwitterSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const InstagramSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════════
   HERO COMPONENT (Liquid Glass + Sochitra Platform Features)
   ══════════════════════════════════════════════════════════════════ */
export function BloomHero() {
  const router = useRouter();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const goToLogin = () => router.push('/login');
  const goToPreview = () => router.push('/preview/workspace');

  return (
    <div className="bloom-root">
      {/* ── Background Video: covers entire viewport, z-0 ────── */}
      <video
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── Two-Panel Split Layout: min-h-screen, z-10 ───────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          minHeight: '100dvh',
        }}
      >
        {/* ══════════════════════════════════════════════════════
            LEFT PANEL  w-[52%] (full width on mobile)
            ══════════════════════════════════════════════════════ */}
        <div style={{ flex: '0 0 52%', position: 'relative' }} className="bloom-left-container">

          {/* Liquid Glass Strong Overlay (inset-4 lg:inset-6 rounded-3xl) */}
          <div className="liquid-glass-strong bloom-left-card">

            {/* ── Nav ─────────────────────────────────────────── */}
            <nav className="bloom-nav">
              <a href="#" className="bloom-brand" aria-label="Sochitra home">
                <BrandLogo size={32} />
                <span className="bloom-brand-text">sochitra</span>
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  className="liquid-glass bloom-menu-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Toggle menu"
                >
                  <Menu size={15} strokeWidth={1.8} />
                  <span>Menu</span>
                </button>
              </div>
            </nav>

            {/* Mobile Dropdown Menu if toggled */}
            {menuOpen && (
              <div
                className="liquid-glass-strong"
                style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                }}
              >
                <button
                  onClick={goToLogin}
                  style={{ background: 'transparent', color: '#fff', textAlign: 'left', cursor: 'pointer' }}
                >
                  Sign In (Approved Team Members)
                </button>
                <button
                  onClick={goToPreview}
                  style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', textAlign: 'left', cursor: 'pointer' }}
                >
                  Workspace Studio Preview
                </button>
                <button
                  onClick={() => { setShowVideoModal(true); setMenuOpen(false); }}
                  style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', textAlign: 'left', cursor: 'pointer' }}
                >
                  Watch Sample Explainer
                </button>
              </div>
            )}

            {/* ── Hero Centre ─────────────────────────────────── */}
            <div className="bloom-center">
              {/* Logo (80×80) */}
              <BrandLogo size={80} />

              {/* H1: text-6xl lg:text-7xl, tracking-[-0.05em] */}
              <h1 className="bloom-h1">
                Innovating the<br />
                <em className="bloom-h1-em">spirit of AI video</em> creation
              </h1>

              {/* CTA Button: liquid-glass-strong, rounded-full */}
              <button
                className="liquid-glass-strong bloom-cta"
                onClick={goToLogin}
                aria-label="Start creating educational videos"
              >
                <span className="bloom-dl-circle">
                  <Download size={14} strokeWidth={2} />
                </span>
                Explore Studio
              </button>

              {/* Three Feature Pills: liquid-glass, rounded-full, text-xs text-white/80 */}
              <div className="bloom-pills">
                <span className="liquid-glass bloom-pill">Document to Video</span>
                <span className="liquid-glass bloom-pill">AI Narration &amp; Sync</span>
                <span className="liquid-glass bloom-pill">English &amp; Hindi</span>
              </div>
            </div>

            {/* ── Bottom Quote ─────────────────────────────────── */}
            <footer className="bloom-quote-block">
              <p className="bloom-eyebrow">VISIONARY EDUCATION</p>

              <blockquote className="bloom-quote">
                <span className="bloom-qd">&#8220;We turn complex ideas </span>
                <em className="bloom-qs">into motion and clarity.</em>
                <span className="bloom-qd">&#8221;</span>
              </blockquote>

              <div className="bloom-author">
                <span className="bloom-rule" />
                <span className="bloom-author-name">SOCHITRA ENGINE</span>
                <span className="bloom-rule" />
              </div>
            </footer>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANEL  w-[48%] (Desktop only)
            ══════════════════════════════════════════════════════ */}
        <div className="bloom-right">

          {/* ── Top Bar ───────────────────────────────────────── */}
          <div className="bloom-topbar">
            {/* Social Icons Pill */}
            <div className="liquid-glass bloom-social-pill">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="bloom-social-link">
                <span className="bloom-icon-wrap"><TwitterSVG /></span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="bloom-social-link">
                <span className="bloom-icon-wrap"><LinkedinSVG /></span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bloom-social-link">
                <span className="bloom-icon-wrap"><InstagramSVG /></span>
              </a>
              <span className="bloom-social-sep" aria-hidden="true" />
              <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
            </div>

            {/* Account / Studio Button */}
            <button
              className="liquid-glass bloom-acct-btn"
              onClick={goToLogin}
              aria-label="Account Login"
            >
              <Sparkles size={15} strokeWidth={1.8} />
            </button>
          </div>

          {/* ── Community / Ecosystem Card (w-56) ─────────────── */}
          <div className="liquid-glass bloom-community">
            <p className="bloom-comm-title">Enter our ecosystem</p>
            <p className="bloom-comm-desc">
              Turn PDF/PPTX notes and teaching topics into 30–90 second
              educational explainers with motion graphics and synchronized voice.
            </p>
          </div>

          {/* ── Bottom Feature Section (rounded-[2.5rem], mt-auto) ─ */}
          <div className="liquid-glass bloom-features">

            {/* Two Side-by-Side Cards: rounded-3xl */}
            <div className="bloom-cards-row">
              {/* Card 1: Processing / Document Extraction */}
              <div className="liquid-glass bloom-mini-card">
                <span className="bloom-icon-wrap">
                  <Wand2 size={16} strokeWidth={1.8} />
                </span>
                <p className="bloom-mini-title">Processing</p>
                <p className="bloom-mini-desc">
                  PDF &amp; PPTX parsing with structured Gemini scene scripts and source citations.
                </p>
              </div>

              {/* Card 2: Growth Archive / Synchronized Audio */}
              <div className="liquid-glass bloom-mini-card">
                <span className="bloom-icon-wrap">
                  <BookOpen size={16} strokeWidth={1.8} />
                </span>
                <p className="bloom-mini-title">Growth Archive</p>
                <p className="bloom-mini-desc">
                  ElevenLabs narration, word-level caption alignment, and revision history.
                </p>
              </div>
            </div>

            {/* Bottom Card: Thumbnail, Title, Desc, Plus Button */}
            <div className="liquid-glass bloom-thumb-card">
              <img
                src={THUMB_IMG}
                alt="Sochitra Video Scene"
                className="bloom-thumb"
                loading="lazy"
              />

              <div className="bloom-thumb-text">
                <p className="bloom-thumb-title">Conversational Studio</p>
                <p className="bloom-thumb-desc">
                  Refine pacing, visual emphasis, and script in real-time through natural chat.
                </p>
              </div>

              {/* "+" Button: Launches interactive video sample modal */}
              <button
                className="liquid-glass bloom-plus"
                onClick={() => setShowVideoModal(true)}
                aria-label="Watch real video sample"
              >
                +
              </button>
            </div>

          </div>{/* /bloom-features */}
        </div>{/* /bloom-right */}

      </div>{/* /flex */}

      {/* ── Video Sample Dialog Modal ───────────────────────── */}
      {showVideoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            padding: '1.5rem',
          }}
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="liquid-glass-strong"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                  SAMPLE EXPLAINER
                </p>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#fff', margin: 0 }}>
                  The Water Cycle
                </h2>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <video
              src={SAMPLE_VIDEO}
              controls
              autoPlay
              playsInline
              style={{
                width: '100%',
                borderRadius: '1rem',
                aspectRatio: '9/16',
                maxHeight: '60dvh',
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                English • 30s • Burned-in captions
              </span>
              <button
                className="liquid-glass bloom-menu-btn"
                onClick={goToLogin}
                style={{ fontSize: '0.75rem' }}
              >
                Start Creating <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
