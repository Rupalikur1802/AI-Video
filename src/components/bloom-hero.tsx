'use client';

import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Download,
  Wand2,
  BookOpen,
  ArrowRight,
  Globe,
  Share2,
  AtSign,
  Menu,
} from 'lucide-react';

/* ─── Video Background URL ──────────────────────────────────────────── */
const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4';

/* ─── Flower thumbnail – use one of the existing project images ─────── */
const FLOWER_IMG = '/images/design-0.png';

/* ─── Logo ──────────────────────────────────────────────────────────── */
function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      {/* Simple flower / bloom glyph */}
      <circle cx="16" cy="16" r="4" fill="white" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse
          key={deg}
          cx="16"
          cy="16"
          rx="3"
          ry="7"
          fill="rgba(255,255,255,0.55)"
          transform={`rotate(${deg} 16 16) translate(0,-6)`}
        />
      ))}
    </svg>
  );
}

/* ─── Icon pill container ───────────────────────────────────────────── */
function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="bloom-icon-box">
      {children}
    </span>
  );
}

/* ─── Pill chips ────────────────────────────────────────────────────── */
function FeaturePill({ label }: { label: string }) {
  return (
    <span className="bloom-pill liquid-glass">
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────────── */
export function BloomHero() {
  const router = useRouter();
  const goToLogin = () => router.push('/login');

  return (
    <div className="bloom-root">
      {/* ── Video background ── */}
      <video
        className="bloom-video-bg"
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* ── Two-panel layout ── */}
      <div className="bloom-panels">

        {/* ════════════════════════════════════════════
            LEFT PANEL
            ════════════════════════════════════════════ */}
        <div className="bloom-left-panel">
          {/* Glass overlay card */}
          <div className="bloom-left-glass liquid-glass-strong">

            {/* Nav */}
            <nav className="bloom-nav" aria-label="Main navigation">
              <a href="#" className="bloom-brand" aria-label="Bloom home">
                <Logo size={32} />
                <span className="bloom-brand-text">bloom</span>
              </a>
              <button
                className="bloom-menu-btn liquid-glass"
                aria-label="Open menu"
                onClick={goToLogin}
              >
                <Menu size={16} />
                <span>Menu</span>
              </button>
            </nav>

            {/* Hero centre */}
            <div className="bloom-hero-center">
              <Logo size={80} />

              <h1 className="bloom-h1">
                Innovating the<br />
                <em>spirit of bloom</em> AI
              </h1>

              {/* CTA */}
              <button
                className="bloom-cta liquid-glass-strong"
                onClick={goToLogin}
              >
                <IconBox>
                  <Download size={15} />
                </IconBox>
                Explore Now
              </button>

              {/* Feature pills */}
              <div className="bloom-pills">
                <FeaturePill label="Artistic Gallery" />
                <FeaturePill label="AI Generation" />
                <FeaturePill label="3D Structures" />
              </div>
            </div>

            {/* Bottom quote */}
            <footer className="bloom-quote-block" aria-label="Design philosophy">
              <p className="bloom-quote-eyebrow">VISIONARY DESIGN</p>
              <blockquote className="bloom-quote">
                <span className="font-display">&#8220;We imagined a realm </span>
                <em className="font-serif">with no ending.</em>
                <span className="font-display">&#8221;</span>
              </blockquote>
              <div className="bloom-author">
                <span className="bloom-author-line" aria-hidden="true" />
                <span className="bloom-author-name">MARCUS AURELIO</span>
                <span className="bloom-author-line" aria-hidden="true" />
              </div>
            </footer>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT PANEL  (desktop only)
            ════════════════════════════════════════════ */}
        <div className="bloom-right-panel" aria-label="Community and features">

          {/* Top bar */}
          <div className="bloom-right-topbar">
            {/* Social icons pill */}
            <div className="bloom-social-pill liquid-glass">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="bloom-social-link"
              >
                <IconBox><Globe size={14} /></IconBox>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="bloom-social-link"
              >
                <IconBox><Share2 size={14} /></IconBox>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="bloom-social-link"
              >
                <IconBox><AtSign size={14} /></IconBox>
              </a>
              <span className="bloom-social-divider" aria-hidden="true" />
              <ArrowRight size={14} className="text-white/50" aria-hidden="true" />
            </div>

            {/* Account button */}
            <button
              className="bloom-account-btn liquid-glass"
              aria-label="Account"
              onClick={goToLogin}
            >
              <Sparkles size={15} />
            </button>
          </div>

          {/* Community card */}
          <div className="bloom-community-card liquid-glass">
            <p className="bloom-community-title">Enter our ecosystem</p>
            <p className="bloom-community-desc">
              Join a growing space where designers and AI intersect to shape
              the future of floral creation.
            </p>
          </div>

          {/* Feature section */}
          <div className="bloom-feature-outer liquid-glass" aria-label="Platform features">
            {/* Two side-by-side mini cards */}
            <div className="bloom-feature-row">
              <div className="bloom-feature-card liquid-glass">
                <IconBox><Wand2 size={16} /></IconBox>
                <p className="bloom-feature-title">Processing</p>
                <p className="bloom-feature-desc">
                  Real-time AI rendering and style transfer.
                </p>
              </div>
              <div className="bloom-feature-card liquid-glass">
                <IconBox><BookOpen size={16} /></IconBox>
                <p className="bloom-feature-title">Growth Archive</p>
                <p className="bloom-feature-desc">
                  Your full design history, organised and searchable.
                </p>
              </div>
            </div>

            {/* Bottom flower card */}
            <div className="bloom-flower-card liquid-glass">
              <img
                src={FLOWER_IMG}
                alt="Artistic floral composition"
                className="bloom-flower-thumb"
                loading="lazy"
              />
              <div className="bloom-flower-info">
                <p className="bloom-flower-title">Advanced Plant Sculpting</p>
                <p className="bloom-flower-desc">
                  Craft intricate botanical forms using AI-guided layering and
                  composition tools.
                </p>
              </div>
              <button
                className="bloom-flower-plus liquid-glass"
                aria-label="Explore Advanced Plant Sculpting"
                onClick={goToLogin}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
