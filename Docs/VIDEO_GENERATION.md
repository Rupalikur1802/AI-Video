# Sochitra — Video generation implementation

Implemented and locally verified: 3 November 2026. This supersedes the earlier “rendering is pending” status in the upload-workspace handoff.

## User experience

The existing four steps remain **Describe → Review → Refine → Share**. Start from the dashboard's **Create video** or **Upload material** action. Review an up-to-date script, choose narration language/motion style/captions, then press **Generate video**. Long scripts are rejected before narration requests. The accepted script and settings are immutable inputs to that job.

Refine shows actual stages: Preparing narration → Synchronizing captions → Animating scenes → Rendering video → Preparing preview. It has no invented percentages or time estimates. Generation continues if the user leaves the workspace; returning to a processing project opens Refine. Polling reconciles job completion and failures. Editing is disabled while the project has an active job, and another generation request cannot start concurrently for that project.

Ready videos have native playback, seeking, volume, fullscreen, revision selection, and authenticated MP4 download. Preview errors offer a fresh playback link. Conversational changes still propose a script for approval; applying a proposal does not modify the already-rendered video. Generate a new version to apply it. A failed replacement leaves the previous ready video intact and downloadable.

Dashboard cards show the actual processing stage, failure message, ready duration, and actions to continue/view progress/open the video. Processing lists refresh in the background. Instagram remains a disabled **Coming soon** card; nothing is posted or scheduled.

## Runtime

| Component | Implementation |
|---|---|
| Generation request | `POST /api/projects/:id/generate` with `{expectedVersion}` and an `Idempotency-Key` |
| Authorization | Better Auth session, approved membership, same-origin mutation check, project ownership |
| Job orchestration | Inngest function `generate-video`, event `sochitra/video.requested` containing only a job ID |
| Narration | ElevenLabs with timestamps, configured English/Hindi voice ID (Sarah fallback), multilingual v2 |
| Captions | Existing Unicode-safe alignment-to-caption code; malformed timings rejected |
| Animation | Generic Remotion highlight, steps, and comparison scenes; keyword cues use narration timestamps where matched |
| Local renderer | Remotion/Chromium, one rendering worker, H.264 + AAC, 1080 × 1920 |
| Hosted adapter | Remotion-created Vercel Sandbox; detached custom render/upload runner and durable polling |
| Storage | Authenticated Cloudinary audio/video assets; no public delivery URL stored in the workspace |
| Playback/download | Owner-protected `/api/assets/:id/playback`, redirecting to a short-lived signed download URL |

Render duration follows actual audio, with a closing hold if it finishes before 30 seconds. Outputs above 90 seconds are rejected rather than cutting off speech. Target duration is a script-writing target, not a guarantee. The current templates are clean animated text/cards/diagram elements; they do not generate photorealistic scenes or reproduce uploaded slide layouts.

## Local setup

The configured development address is **http://localhost:3001** for both app and Google callback.

```powershell
npm install
npm run build
npm start
```

In a second terminal:

```powershell
npm run workflow:dev
```

`workflow:dev` starts Inngest on loopback port 8288 with persisted state in `.inngest/`. It syncs `http://localhost:3001/api/inngest`; no cloud event/signing keys are needed locally. `.env.local` has `INNGEST_DEV=1`. Both services must remain running. For interactive development, use `npm run dev` instead of `npm start` after preparing the Remotion bundle (`npm run video:bundle`).

Required local provider configuration: `MONGODB_URI`, auth variables, ElevenLabs key/use confirmation, and Cloudinary cloud name/key/secret. Existing credentials were reused; billing and paid services were not enabled. Provider allowance errors fail safely and preserve the script.

## Job and revision records

- `projects`: `activeJobId`, `lastJobId`, monotonically increasing `renderNumber`, actual state/stage, `currentReadyRevisionId`, ready duration, and safe failure message. Enqueue and completion use MongoDB transactions with optimistic project versions.
- `jobs`: owner/project, request key/version, immutable script/draft/source snapshot, input hash, revision ID/number, state/stage, timestamps, safe error, and optional sandbox handle/command ID.
- `sceneAudio`: owner-scoped content hash of narration, language, voice/model/settings and timing version; pending request owner/job, verified alignment/captions, private asset ID, duration, and status. Completed narration is reused across visual/script revisions when its spoken text/settings match. A narration request with an unknown result is not blindly repeated within the same job. An explicit new attempt can retry it after the earlier job has failed.
- `revisions`: immutable approved script/settings/source, input hash, version number, ready video asset ID, duration, owner/project, creation timestamp.
- `assets`: private Cloudinary identifiers and verified media metadata. Ready status is committed only for portrait 1080 × 1920 video containing audio and a 30–90 second duration.

Job errors preserve safe provider messages without exposing raw response bodies or credentials. Automatic provider retries are disabled; the user controls new attempts. Inngest checkpoints completed steps, and narration has a persistent application-level cache. A five-minute recovery function marks jobs interrupted after 30 minutes of inactivity and releases their project lock. Retries retain the script and any prior ready revision.

## Hosted deployment boundary

The Vercel adapter is implemented and type-checked, but **has not been exercised against a live Vercel Sandbox** because its credentials are absent. This work did not deploy or enable a paid sandbox service. Configure `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `VERCEL_TEAM_ID`, then verify the hosted path before treating deployment as ready. The runtime disables the local generation fallback on Vercel.

The build produces `.video-bundle/`, and Next's Inngest route tracing includes it. A sandbox receives only that public renderer bundle, input props with temporary audio delivery links, and a signed upload capability for one output asset—not account secrets. It uploads directly to authenticated Cloudinary storage; Vercel Blob is not required. Sandbox handles are retained for completion/error cleanup, with a VM timeout as a fallback.

Third-party dependency audit still reports advisories in the compatible Inngest/Vercel SDK dependency trees (Zod) and the local CLI installer (adm-zip), plus transitive telemetry utilities. Compatible automatic patches were attempted. Do not apply npm's suggested force downgrades or a Zod major override without SDK compatibility testing. Uploaded documents continue to use bounded `yauzl`, not the CLI's ZIP library. Review and resolve these dependencies before a broader hosted release.

## Validation performed

- Production build and TypeScript validation.
- Existing unit tests for approval, inputs, document extraction, source evidence, and timing.
- `npm run check:video-jobs`: isolated MongoDB tests for ownership, stale/long scripts, idempotency, duplicate requests, editing locks, immutable snapshots, cached narration reuse, ready completion, and preserving an older video on failure. No provider calls.
- `npm run check:generation`: desktop/mobile progress, previous-version preservation after a proposed revision, download, failure recovery, responsive overflow, and anonymous generation denial.
- Existing workspace and dashboard browser checks, including upload entry/navigation.
- Live local Inngest → ElevenLabs → Remotion → private Cloudinary → downloadable MP4 verification in English and Hindi. Both outputs are 30-second 1080 × 1920 narrated videos. FFprobe confirmed H.264/AAC, and rendered English/Hindi frames were visually inspected. Temporary test records/private assets were removed after saving local review artifacts in `out/generation/`.

Live verification script (consumes provider allowance; not part of the default test suite):

```powershell
node --conditions=react-server --import tsx scripts/check-video-live.ts en
node --conditions=react-server --import tsx scripts/check-video-live.ts hi
```

Preview states at `/preview/workspace?state=progress|ready|revised|failed|share` are explicitly illustrative. Their ready player uses the earlier water-cycle sample, not a video generated from changes made in the preview.
