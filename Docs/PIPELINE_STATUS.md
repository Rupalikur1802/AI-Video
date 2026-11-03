# Sochitra — Video pipeline proof

Date: 2 November 2026

## Implemented and exercised

- Gemini script and scene-plan generation for the water-cycle example in English and Hindi.
- ElevenLabs narration with returned character alignment for five scenes per language.
- Timestamp-derived captions and phrase-anchored animation cues.
- Remotion portrait video composition and local MP4 rendering.
- Cloudinary uploads; returned metadata confirmed 30 seconds for both language outputs.
- A saved-script narration command to avoid another Gemini request when only narration needs retrying.
- Sanitized provider error messages and a sample-frame rendering command.

## Commands

```sh
npm run doctor
npm run generate -- en
npm run generate -- hi
npm run narrate -- en
npm run render -- en
npm run render -- hi
npm run upload -- en
npm run upload -- hi
npx tsx scripts/pipeline.ts still hi
```

Generation and narration commands make real provider requests. Re-running narration regenerates all scene audio. Silent fixture commands remain available for development and are visibly labeled; they are not real narrated samples.

## Findings

- The configured Gemini 2.5 Flash model rejected new-user access. Gemini 3.8 Flash timed out, and 3.1 Flash Lite returned a temporary 503. Gemini 3.5 Flash succeeded for both scripts, with a temporary 503 requiring one Hindi retry.
- The original English ElevenLabs voice required a paid library-voice API subscription; the Hindi voice setting failed validation. The built-in Sarah voice worked with the multilingual model for both language samples. Hindi pronunciation still needs a fluent listener's review.
- Narration ending before 30 seconds is followed by a closing-scene hold. Speech is not time-stretched or truncated.
- Hindi sample-frame inspection confirmed visible Devanagari labels and captions. A debug timestamp found in the header was removed.
- TypeScript checking and all four alignment tests passed. These checks do not certify full-video perceptual synchronization or educational accuracy.

## Output locations

- English: `out/en/water-cycle.mp4`
- Hindi: `out/hi/water-cycle.mp4`
- Plans, alignments, composition data, and Cloudinary upload metadata: corresponding `out/<language>/` directories.
- Credentials and generated files are excluded from Git.

## Still to validate or build

- Listen to both videos and review explanation quality, pronunciation, scene joins, and end-to-end cue drift.
- Improve the water-cycle wording: rain occurs when droplets grow large enough to fall; avoid implying that an entire cloud becomes heavy.
- Validate multiple frames and topics, duration fitting beyond this example, and caption layout for longer text.
- Next.js dashboard, approved-team Better Auth, MongoDB persistence, Inngest orchestration, Vercel Sandbox rendering, and Instagram integration remain future phases. This milestone proves a local command-line pipeline, not the complete product.
- Uploads create new Cloudinary assets; repeated upload commands are not deduplicated yet.

The source of truth for credentials is the project `.env.local`; editing an earlier Desktop copy does not update it automatically.
