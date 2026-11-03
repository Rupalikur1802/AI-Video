'use client';

import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Download,
  Wand2,
  BookOpen,
  ArrowRight,
  Menu,
  X,
  Globe,
  Link2,
} from 'lucide-react';

/* ─── Background video ───────────────────────────────────────────── */
const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4';

/* ─── Flower thumbnail (existing asset) ──────────────────────────── */
const FLOWER_IMG = '/images/design-1.png';

/* ─── Logo SVG ───────────────────────────────────────────────────── */
function BloomLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="5" fill="white" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="11"
          rx="3.5"
          ry="8"
          fill="rgba(255,255,255,0.5)"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
    </svg>
  );
}

/* ─── Instagram SVG (not in this lucide-react version) ──────────── */
function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────────── */
export function BloomHero() {
  const router = useRouter();
  const goToApp = () => router.push('/login');

  return (
    <div className="bloom-root">
      {/* ── Video background ──────────────────────────────────────── */}
      <video
        className="bloom-video-bg"
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* ── Two-panel flex row ─────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100dvh',
        }}
      >
        {/* ══════════════════════════════════════════════════════════
            LEFT PANEL  —  w-[52%]
            ══════════════════════════════════════════════════════════ */}
        <div
          style={{
            flex: '0 0 52%',
            position: 'relative',
            padding: '1rem',
          }}
        >
          {/* liquid-glass-strong overlay — absolute inset-4 lg:inset-6 rounded-3xl */}
          <div
            className="liquid-glass-strong bloom-panel-inner"
          >
            {/* ── Nav ─────────────────────────────────────────────── */}
            <nav className="bloom-nav">
              {/* Logo + brand */}
              <a href="#" className="bloom-brand" aria-label="Bloom home">
                <BloomLogo size={32} />
                <span className="bloom-brand-name">bloom</span>
              </a>

              {/* Menu button — liquid-glass pill */}
              <button
                className="liquid-glass bloom-menu-pill"
                aria-label="Open menu"
                onClick={goToApp}
              >
                <Menu size={15} strokeWidth={1.8} />
                <span>Menu</span>
              </button>
            </nav>

            {/* ── Hero centre ─────────────────────────────────────── */}
            <div className="bloom-hero-center">
              {/* Big logo */}
              <BloomLogo size={80} />

              {/* h1 — text-6xl lg:text-7xl tracking-[-0.05em] */}
              <h1 className="bloom-h1">
                Innovating the<br />
                <em className="bloom-h1-em">spirit of bloom</em>{' '}
                <span style={{ fontStyle: 'normal' }}>AI</span>
              </h1>

              {/* CTA — liquid-glass-strong rounded-full */}
              <button
                className="liquid-glass-strong bloom-cta"
                onClick={goToApp}
              >
                {/* Download icon in w-7 h-7 rounded-full bg-white/15 */}
                <span className="bloom-icon-circle">
                  <Download size={14} strokeWidth={2} />
                </span>
                Explore Now
              </button>

              {/* Feature pills — liquid-glass rounded-full */}
              <div className="bloom-pills-row">
                {['Artistic Gallery', 'AI Generation', '3D Structures'].map((label) => (
                  <span key={label} className="liquid-glass bloom-pill">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Bottom quote ─────────────────────────────────────── */}
            <div className="bloom-quote-section" role="complementary" aria-label="Design philosophy">
              {/* Eyebrow */}
              <p className="bloom-eyebrow">VISIONARY DESIGN</p>

              {/* Quote */}
              <blockquote className="bloom-quote">
                <span className="bloom-quote-display">&#8220;We imagined a realm </span>
                <em className="bloom-quote-serif">with no ending.</em>
                <span className="bloom-quote-display">&#8221;</span>
              </blockquote>

              {/* Author with ruled lines */}
              <div className="bloom-author-row">
                <span className="bloom-rule" aria-hidden="true" />
                <span className="bloom-author-name">MARCUS AURELIO</span>
                <span className="bloom-rule" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PANEL  —  hidden mobile, lg:flex w-[48%]
            ══════════════════════════════════════════════════════════ */}
        <div className="bloom-right-panel" aria-label="Community and platform features">

          {/* ── Top bar ─────────────────────────────────────────────── */}
          <div className="bloom-topbar">
            {/* Social icons pill — liquid-glass */}
            <div className="liquid-glass bloom-social-pill">
              {/* Twitter / X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="bloom-social-link">
                <span className="bloom-icon-sm"><X size={13} strokeWidth={2} /></span>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="bloom-social-link">
                <span className="bloom-icon-sm"><Link2 size={13} strokeWidth={2} /></span>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bloom-social-link">
                <span className="bloom-icon-sm"><InstagramIcon size={13} /></span>
              </a>
              <span className="bloom-social-sep" aria-hidden="true" />
              <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
            </div>

            {/* Account button — liquid-glass */}
            <button
              className="liquid-glass bloom-account-btn"
              aria-label="Account"
              onClick={goToApp}
            >
              <Sparkles size={15} strokeWidth={1.8} />
            </button>
          </div>

          {/* ── Community card — w-56 liquid-glass ──────────────────── */}
          <div className="liquid-glass bloom-community-card">
            <p className="bloom-community-title">Enter our ecosystem</p>
            <p className="bloom-community-desc">
              Join a growing creative space where floral design and AI
              intelligence intersect.
            </p>
          </div>

          {/* ── Feature section — mt-auto, liquid-glass rounded-[2.5rem] ── */}
          <div className="liquid-glass bloom-features-outer">

            {/* Two side-by-side cards — liquid-glass rounded-3xl */}
            <div className="bloom-features-row">
              <div className="liquid-glass bloom-feature-card">
                {/* w-8 h-8 rounded-full bg-white/10 */}
                <span className="bloom-icon-md">
                  <Wand2 size={16} strokeWidth={1.8} />
                </span>
                <p className="bloom-feature-title">Processing</p>
                <p className="bloom-feature-desc">Real-time AI rendering and style transfer for botanical forms.</p>
              </div>

              <div className="liquid-glass bloom-feature-card">
                <span className="bloom-icon-md">
                  <BookOpen size={16} strokeWidth={1.8} />
                </span>
                <p className="bloom-feature-title">Growth Archive</p>
                <p className="bloom-feature-desc">Your full design history, organised and searchable.</p>
              </div>
            </div>

            {/* Bottom flower card — liquid-glass */}
            <div className="liquid-glass bloom-flower-card">
              {/* Thumbnail 96×64 */}
              <img
                src={FLOWER_IMG}
                alt="Artistic floral composition"
                className="bloom-flower-thumb"
                loading="lazy"
              />
              <div className="bloom-flower-text">
                <p className="bloom-flower-title">Advanced Plant Sculpting</p>
                <p className="bloom-flower-desc">
                  Craft intricate botanical forms with AI-guided layering tools.
                </p>
              </div>
              {/* + button — liquid-glass */}
              <button
                className="liquid-glass bloom-plus-btn"
                aria-label="Explore Advanced Plant Sculpting"
                onClick={goToApp}
              >
                +
              </button>
            </div>

          </div>{/* /features-outer */}
        </div>{/* /right panel */}

      </div>{/* /panels */}
    </div>
  );
}
