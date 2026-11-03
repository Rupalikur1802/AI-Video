# Sochitra

## Team login and dashboard

Visit `/login` for approved-team Google sign-in and `/dashboard` for the protected project list. `/preview/dashboard` contains explicitly labelled, isolated sample data for reviewing the design without authentication. See [authentication/dashboard setup and verification](Docs/AUTH_AND_DASHBOARD.md) for environment variables, Google callback URL, implemented project APIs, and remaining integration checks.

## Homepage implementation

The Next.js homepage implements the desktop and mobile Stitch reference from project `10281477488436873845` (desktop screen `661f9d22dfb046878b540290eaa27d93`). It uses TypeScript, Tailwind CSS, custom responsive components, and Lucide icons. Reference artwork is stored locally under `public/images`.

```sh
npm run dev
npm run build
npm run start
```

The page includes mobile navigation, artwork previews, a real narrated sample player, keyboard-dismissable dialogs, and an explicitly illustrative revision interaction. Sign-in and creation actions navigate to the team sign-in page. The creation workspace is a subsequent phase.

Run `node scripts/check-homepage.mjs` against a production preview on port 3001, or set `PREVIEW_URL` to another local address. The browser check uses the existing Remotion Chrome Headless Shell installation. It validates desktop/mobile overflow, images, dialogs, navigation, revision interaction, and sample-player opening, and writes screenshots under ignored `out/homepage`.

The scripts use Webpack because the default Turbopack worker failed to start in this Windows execution environment. Fonts load from Google Fonts with system fallbacks. Vercel deployment and hosted generation workflows remain subsequent phases.

## Video pipeline proof of concept

Planning documents: [PRD](Docs/PRD.md), [System architecture](Docs/SYSTEM_ARCHITECTURE.md), [Development roadmap](DEVELOPMENT_ROADMAP.md), and [Pipeline status](Docs/PIPELINE_STATUS.md).

Implementation contracts: [API design](Docs/API_DESIGN.md), [Database design](Docs/DATABASE_DESIGN.md), and [Google Stitch UI handoff](Docs/UI_HANDOFF.md).

English and Hindi water-cycle explainers using Gemini, ElevenLabs character alignment, Remotion, and Cloudinary. This is the core pipeline, not the full Next.js dashboard.

## Setup

Use Node.js 22+, run `npm install`, copy `.env.example` to `.env.local`, and fill credentials locally. Never commit credentials. Confirm that your intended ElevenLabs use is permitted before setting `ELEVENLABS_USE_CONFIRMED=true`. No paid subscriptions or overages are enabled by this code; provider requests can still consume existing account credits.

## Commands

```sh
npm run doctor
npm run check
npm test
npm run sample -- en
npm run render -- en
npm run sample -- hi
npm run render -- hi
```

Sample mode is a **silent fixture with estimated timing**, visibly watermarked. It does not claim to test AI narration or real synchronization.

For real provider output, replace sample with `npm run generate -- en` or `npm run generate -- hi`, then render. Use `npm run upload -- en` or `-- hi` to upload the finished MP4 to Cloudinary. Output metadata is saved in `out/<language>`. Provider operations are not automatically retried. Re-running generation makes fresh requests and can consume more quota.

If a script was saved but narration failed, use `npm run narrate -- en` (or `-- hi`) to reuse `out/<language>/plan.json` without another Gemini request. This regenerates narration for all five scenes. Built-in ElevenLabs voices may be needed when a free account cannot access library voices through the API. Choose an available Gemini model for your account; the original 2.5 Flash model rejected new-user access during this prototype.

Short narration holds the closing scene to reach 30 seconds. Longer narration is never truncated; duration still needs review. Credentials are loaded from this project's `.env.local`, not from a Desktop copy.

Each narration scene is aligned separately. Word/caption blocks derive from returned characters, including Hindi marks. Animation cues anchor to a verbatim phrase; missing anchors fail explicitly. Render length follows actual narration and is reported; this proof does not yet guarantee the PRD's 30-second tolerance. Scene-to-scene prosody and final timing require listening review.

Local previews use installed Nirmala UI or Noto Sans Devanagari fonts. Hosted rendering must package a Devanagari font. Hosted Sandbox execution, Inngest orchestration, authentication, and publishing remain subsequent integrations; no cloud deployment is performed by these commands.
