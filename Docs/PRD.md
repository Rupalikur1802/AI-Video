# Product Requirements Document: Sochitra

**3 November implementation addendum:** idea input now also supports one PDF/PPTX/TXT source, extraction review, English/Hindi output, and source-referenced scripts in the existing four-step flow. See [upload workspace scope and status](UPLOAD_WORKSPACE.md); this supersedes earlier exclusions of document input. Hosted rendering and Instagram remain pending integration.

Version: 1.4 draft for review  
Date: 2 November 2026  
Product name: Sochitra  
Tagline: To be confirmed  
Status: Product scope agreed; implementation defaults and launch dependencies identified below.

Confirmed decisions: Publicly accessible login on a Vercel-deployed app, with authentication restricted to approved team members through Better Auth, without subscriptions, usage accounting, or budget dashboards. Support English and Hindi; build a zero-spend prototype; use clean animated diagrams, icons, and text as the primary visual style. These decisions supersede earlier proposed defaults.

## 1. Product definition

Help educators and educational creators turn a topic or teaching notes into a 30–90 second educational explainer with motion graphics, AI narration, synchronized captions, conversational editing, and Instagram publishing.

The core promise is: **Describe a topic, review the explanation, refine the generated video through chat, and publish.**

Creators and brands are potential later audiences. V1 serves educational explainers rather than cinematic videos, advertising, avatars, or a general-purpose video editor.

## 2. Goals and measures

### Goals

- Produce an understandable educational video without requiring animation or editing skills.
- Keep the main creation journey within four visible steps.
- Give users control over educational accuracy before narration and rendering.
- Keep animation, captions, and narration synchronized after every revision.
- Support download, immediate Instagram publishing, and scheduled publishing.
- Limit unnecessary provider calls and preserve completed work after failures.

### Success measures

Track these from the first pilot; numeric business targets are to be set after baseline measurement.

| Measure | Definition |
|---|---|
| Activation | Percentage of new users completing their first video |
| Completion | Percentage of started projects reaching a ready video |
| Time to first video | Topic submission to first successful preview, separating user time and processing time |
| Revision burden | Number of revisions before download or publication |
| Repeat use | Users creating another video within seven days |
| Educational usefulness | Pilot educator rating of clarity, correctness, and visual relevance |
| Generation reliability | Successful generation jobs divided by accepted jobs |
| Publishing reliability | Confirmed successful posts divided by accepted publish requests |

## 3. Users and primary use cases

Primary users are independent educators, tutors, course creators, and educational social-media creators.

- Explain a concept using a simple example and animated diagram.
- Convert pasted lesson notes into a short recap.
- Brainstorm a topic when the user has no specific idea.
- Simplify an explanation for a younger or beginner audience.
- Produce an educational Reel and publish it immediately or later.

Example: A tutor enters “Explain the water cycle to students aged 10–12 in 60 seconds.” The resulting video narrates evaporation, condensation, and precipitation while corresponding arrows, clouds, labels, and captions appear.

## 4. Scope and product decisions

### Included in V1

- Publicly accessible login, logout, account recovery, and project ownership through Better Auth, restricted to approved team members. Registration, if enabled, must enforce the same approval restriction.
- Simple dashboard with Create video, saved projects, job status.
- Topic entry, pasted notes, and optional AI topic suggestions.
- Audience selection and 30/60/90-second target durations.
- Editable AI script and automatic scene planning.
- A small curated library of educational animation templates.
- ElevenLabs narration and timing data.
- Burned-in captions enabled by default.
- Preview, conversational revisions, revision history, and MP4 download.
- One connected Instagram professional account per user as a proposed V1 limit.
- Publish now, schedule, reschedule, cancel, and publishing status.
- Simple generation and publishing status, with actionable errors when something fails. No usage accounting, budgets, billing, or monitoring dashboards.

### Proposed implementation defaults

These are planning assumptions, not additional user-approved constraints. Change them before implementation if necessary.

| Item | Proposed default |
|---|---|
| Supported languages — confirmed | English and Hindi, selected per video; Hinglish and automatic bilingual videos are outside V1 |
| Output | Vertical 9:16, 1080 × 1920, 30 fps, MP4 with H.264 video and AAC audio |
| Durations | 30 or 60 seconds within ±3 seconds; 90-second selection produces 87–90 seconds |
| Input size | Topic up to 500 characters; notes up to 10,000 characters |
| Visual style — confirmed | One clean visual system using animated diagrams, icons, and text; a few restrained color presets may share the same components |
| Voices | Three approved provider voices; no voice cloning |
| Concurrent generation | One active video generation or revision per project |
| Schedule window | At least five minutes ahead and at most 30 days ahead |
| Background music | Omitted initially to keep narration clear and licensing simple |
| Access and billing | Better Auth with approved-team access; no subscriptions, checkout, credits, or usage accounting |

Selected duration is a target, not permission to truncate narration. If timing cannot meet the target after one bounded adjustment, ask the user to shorten the script or select a longer duration. Never silently change an approved explanation.

### Excluded

Full timeline editing, arbitrary AI-generated code, cinematic text-to-video generation, avatars, voice cloning, uploaded audio/video, document uploads, URL ingestion, team workspaces, batch generation, other social platforms, recurring publishing, automatic topic-to-post campaigns, and performance analytics dashboards.

## 5. Information architecture and four-step journey

Main navigation: Dashboard, Create video, Connections, Account. Connections and account settings are utilities rather than extra creation steps.

### Step 1 — Describe

User enters a topic or notes, chooses English or Hindi, an audience, and duration, and selects Create explanation. Optional Suggest topics returns a short list the user can select or edit. Duration defaults to 60 seconds; audience defaults to beginners. Empty or oversized inputs receive inline validation. Language selection stays inside this step and does not add another screen.

### Step 2 — Review

Show the proposed title and editable script. Provide quick actions such as Simplify and Add an example. Voice and style have defaults and compact selectors on this same screen. Show the selected duration and estimated fit. A short notice asks the educator to review facts before generating.

Selecting Generate video approves the current script and settings, saves a revision, and starts generation. No storyboard approval screen is required. If the script changes afterward, that approval becomes stale.

### Step 3 — Generate and refine

While processing, display real stages: Preparing scenes, Creating narration, Synchronizing visuals, Rendering video. Avoid invented percentage completion or fixed time promises.

When ready, show a playable preview and a single revision chat. Example prompts: “Explain it more simply,” “Make the arrows slower,” “Change the voice,” and “Make captions larger.” Show a short summary of the proposed change and an Apply change action. Unambiguous quick actions may apply immediately; script or voice changes show a concise change summary before regeneration. No cost or credit confirmation screen is required.

After a revision, show the new preview, keep the prior ready version, and support Undo by restoring it. An educational-content revision exposes the updated script in this same step for review; it does not introduce a fifth screen.

### Step 4 — Download or publish

Download MP4, Publish now, or Schedule. Instagram connection is requested only if needed. The user reviews the video, destination account, and editable post caption before submitting. The on-screen subtitles and Instagram post caption are separate fields.

Scheduling shows the date, time, named timezone, and final confirmation. Publishing continues in the background. Show the confirmed Instagram post link when available. A queued request is not presented as a published post.

## 6. Detailed user flows

### UF-01: First visit and authentication

1. An approved team member logs in through Better Auth on the publicly accessible app. Proposed simple approval mechanism: an owner-maintained email allowlist, with verified email identity before access is granted. No team-management dashboard is required.
2. Complete identity verification; preserve any safe unsaved topic through authentication. Reject unapproved identities server-side before granting application access. Recheck approval for protected actions so removing approval also removes access for an existing session.
3. Open the dashboard with Create video and a simple example.
4. Returning users see their projects and current statuses.
5. Account recovery returns to the application without revealing whether another person's account exists.

Session expiry prompts login while preserving the last autosaved project. Authorization is rechecked on all reads, downloads, and mutations.

### UF-02: Topic to first video

1. Complete Describe and Review.
2. System checks script validity and provider readiness.
3. Generate narration, calculate timing, create animations, and render.
4. User previews the ready output.
5. User downloads, revises, or publishes.

Closing the browser does not cancel a server job. Reopening the project restores current progress or its ready output.

### UF-03: Conversational revision

1. User requests a change in the project chat.
2. Gemini converts it into a validated structured change against the current revision.
3. If ambiguous, ask one concise question inside the same chat.
4. Show a concise summary of what will change.
5. Apply the change and regenerate only affected dependencies.
6. User compares or restores the previous ready revision.

Unsupported requests receive a clear explanation and a supported alternative. Chat cannot execute arbitrary code, delete projects, connect accounts, or publish videos. Publication always uses explicit publishing controls.

### UF-04: Connect Instagram

1. User selects Connect Instagram from publishing or Connections.
2. Redirect through Meta's official authorization flow with minimum required permissions.
3. Validate callback state, permissions, account eligibility, and account identity server-side.
4. Show the connected account and return to the pending publishing form.

Denied permission, abandoned login, or ineligible personal account leaves the project intact and explains the next action. Do not ask for Instagram passwords. Facebook Page requirements depend on the selected Meta login integration; do not impose one login path's requirements on another.

### UF-05: Publish immediately

1. User reviews a ready immutable video revision, account, and post caption.
2. Backend validates connection, media specifications, publication rights, and existing requests.
3. Queue publication and prepare media delivery for Meta.
4. Create/upload the media container, monitor processing, and publish when ready.
5. Save provider IDs and confirm publication before reporting success.

Repeated clicks return the existing operation. If the provider outcome is uncertain, reconcile before attempting another publish. An explicit intentional repost requires a fresh user action after showing prior publication details.

### UF-06: Schedule, reschedule, and cancel

1. User selects a future local time and reviews its timezone.
2. Store the UTC instant, timezone, account, post caption, and exact ready video revision.
3. At the scheduled instant, the worker revalidates eligibility and uses the publishing flow.
4. Before dispatch, users can update the time or caption or cancel.

If dispatch has begun, explain that cancellation may no longer prevent publication. A late worker dispatches within a proposed 15-minute grace period; beyond that, mark Missed and ask the user to reschedule. Never silently publish hours later.

### UF-07: Edit a scheduled video

Creating a new revision does not change an existing schedule. Show “This schedule uses version X.” Offer Replace scheduled version only after a new version is ready and the user explicitly confirms. Replacement is atomic and refused once publishing has started.

### UF-08: Saved projects and deletion

Dashboard cards show title, thumbnail when ready, updated time, and independent generation/publishing states. Opening a card restores the latest saved work. Duplicating a project creates a new draft without copying schedules or publication operations.

Deletion requires confirmation and cancels undispatched schedules. If a publish operation is already in flight, wait for its outcome before final deletion. Deleting a local project does not delete a published Instagram post; state this in the dialog. Remove local assets according to the documented retention policy.

## 7. Functional requirements and acceptance criteria

| ID | Requirement | Acceptance condition |
|---|---|---|
| FR-01 | Save drafts automatically | Reload restores the last acknowledged save; unsaved changes are visibly indicated |
| FR-02 | Generate editable scripts | Topic, audience, duration, and user notes are reflected; invalid outputs never reach rendering |
| FR-03 | Review before generation | Narration jobs reference an explicitly approved script revision |
| FR-04 | Create educational visuals | Only supported, validated scene components render; no arbitrary model-generated code runs |
| FR-05 | Generate voice and timing | Selected supported voice returns playable audio and valid alignment for each scene |
| FR-06 | Synchronize captions | Visible captions follow spoken text and preserve normalized spoken forms such as numbers |
| FR-07 | Synchronize animation | Labels, arrows, and emphasis can anchor to named spoken phrases or timed scene segments |
| FR-08 | Revise conversationally | Supported requests produce a specific change; ambiguous requests trigger clarification |
| FR-09 | Preserve versions | Failed revisions leave the previous ready output usable; Undo restores a prior ready version |
| FR-10 | Export | Ready video downloads as a playable MP4 matching the preview revision |
| FR-11 | Publish to Instagram | Correct account and pinned video revision are used; success requires provider confirmation |
| FR-12 | Schedule | Date/time/timezone persist and due jobs dispatch once logically, with reconciliation on ambiguity |
| FR-13 | Keep actions simple | No credit, budget, billing, or usage screens appear; repeated clicks return the existing job |
| FR-14 | Secure projects | Users cannot access another user's project, media, connection, or job |

## 8. Generation workflow and synchronization design

### Pipeline

1. Validate user input and save the project brief.
2. Gemini produces a structured script and scene plan using a constrained schema.
3. Validate the output against allowed scene types, text limits, supported assets, and duration estimates. Retry invalid structured output at most once, then show a recoverable error.
4. User approves the script and settings.
5. Create an idempotent generation job.
6. Generate ElevenLabs narration with timestamps per scene using shared voice/model settings and continuity context where supported.
7. Validate audio, alignment array lengths, monotonic timestamps, text coverage, and audio bounds.
8. Derive words and readable caption chunks from character alignment. Account for normalized speech, punctuation, abbreviations, numbers, and whitespace.
9. Map each visual cue to an aligned phrase or scene segment. Calculate scene offsets from actual audio duration, including deliberate pauses and transitions.
10. Render reusable Remotion components on this timeline; use FFmpeg for required encoding, muxing, and verification.
11. Verify media metadata, duration, playable audio, expected dimensions, and caption presence before marking Ready.
12. Persist assets and expose preview/download.

ElevenLabs timestamps are character alignment data, not automatically finished caption blocks or animation direction. Our logic creates those layers. If a timing anchor is absent, use a validated scene-level fallback only when it preserves the explanation; otherwise request regeneration. Never silently label an unsynchronized output Ready.

### Supported scene vocabulary

- Intro/title and takeaway cards.
- Text emphasis and sequential bullet reveals.
- Labeled process diagrams with arrows.
- Side-by-side comparisons.
- Simple timelines and ordered steps.
- Icon-based examples and simple quantity comparisons.

Use a stable visual system with readable fonts, sufficient contrast, and caption-safe layouts. Complex illustrations outside this vocabulary require a simpler supported explanation or a clear unsupported message.

### English and Hindi requirements

- Generate scripts, narration, captions, and diagram labels in the selected language. Hindi uses Devanagari by default; commonly used technical terms may remain in English when appropriate to the explanation.
- Preserve the selected language during conversational revisions unless the user explicitly requests a supported language change. Changing language invalidates the script approval and regenerates narration, alignment, captions, labels, and video after review.
- Offer only voices tested with the chosen language and timestamp-capable model. Do not assume an English voice performs equally well in Hindi.
- Use fonts with Devanagari coverage and correct shaping. Caption wrapping must preserve grapheme clusters, vowel marks, and conjuncts rather than splitting raw Unicode characters.
- Validate caption alignment for Hindi punctuation, numerals, normalized spoken numbers, and occasional English technical terms. Character alignment indices must be reconciled with the provider's text representation before grouping captions.
- If input notes differ from the selected output language, show that the explanation will be generated in the selected language. Ask for clarification when translation would change an ambiguous term.

### Revision dependency rules

| Change | Work required |
|---|---|
| Post caption or schedule only | No narration or video regeneration |
| Caption font, color, or placement | Re-render affected video; reuse audio and timing |
| Visual style, arrow speed, or diagram layout | Re-render; reuse narration unless the request also changes speech |
| Narration text or pronunciation | Regenerate affected scene audio and alignment; recalculate downstream offsets and re-render |
| Voice | Regenerate all narration, timing, captions, and video |
| Duration | Revise pacing/script as needed, review changed script, then regenerate dependencies |
| Audience or topic | Generate a new explanation for approval; preserve the previous ready version |

## 9. State and data model

Generation states: Draft → Script preparing → Review ready → Queued → Planning → Narrating → Synchronizing → Rendering → Ready. Active stages may enter Failed or Cancelled. Retrying starts from the last valid checkpoint. Generation cancellation is best effort; completed provider calls may still consume provider quota.

Publication states are separate: Unscheduled, Scheduled, Queued, Processing, Published, Failed, Needs attention, Missed, Cancelled. A project can have a Ready video while its post is Failed.

Core records:

- User: authentication identity and preferences.
- Project: owner, topic, notes, audience, target duration, current revision.
- Revision: immutable approved script, scene plan, style, voice/model settings, parent revision, readiness.
- Scene: narration, supported visual component parameters, audio and alignment references, caption cues, duration.
- Asset: storage key, owner, checksum, media metadata, generating revision, rights/provenance status.
- Job: stage, attempts, idempotency key, checkpoint, error, provider request identifiers.
- Conversation: messages and structured changes tied to a base revision.
- Instagram connection: account identity, encrypted token references, permissions, connection health.
- Publication: pinned revision, account, post caption, schedule instant/timezone, status, container/media IDs.

Do not overwrite files referenced by a schedule or publication. Concurrent edits use revision checks; stale writes receive a reload/reapply action rather than overwriting newer work.

## 10. Corner cases and recovery

| Case | Required behavior |
|---|---|
| Empty, too long, or unsupported-language input | Inline guidance; no provider call |
| Notes contain instructions to override the system | Treat notes as content; enforce schema and server-side permissions |
| Topic has uncertain or time-sensitive facts | Ask for reliable notes or qualify uncertainty; never invent sources or claim verified accuracy |
| AI output is misleading or unsupported by notes | Allow correction before generation; do not promise automatic factual verification |
| Model refusal or safety restriction | Explain briefly; preserve input and allow a revised topic |
| Script cannot fit duration | Explain the conflict; offer shorter script or longer target before generating more audio |
| ElevenLabs normalizes “12” into spoken words | Use normalized alignment for timing while preserving correct readable caption text |
| Missing, malformed, or partial alignment | Retry the affected scene once; otherwise fail synchronization with recovery action |
| Voice becomes unavailable | Preserve draft; ask user to choose another supported voice |
| Caption is too long or overlaps diagram | Reflow into shorter chunks and safe regions; reject layouts that still fail |
| Provider quota or rate limit reached | Backoff within retry budget; show waiting/retry time when known; never switch to paid usage automatically |
| Provider timeout with uncertain completion | Reconcile supported provider status; avoid blind retries of potentially chargeable work |
| Render worker crashes or device goes offline | Recover from stored checkpoints; keep previous ready revision |
| User closes browser or loses connection | Server job continues; reconnect restores authoritative state |
| Repeated Generate clicks | Return one job using the request idempotency key |
| User revises during an active generation | Save requested draft changes; serialize mutation jobs and reject stale application |
| Unsupported or ambiguous chat revision | Ask one targeted question or offer supported changes |
| Instagram permission denied or personal account | Keep download available; explain connection requirements |
| Instagram token expires before scheduled post | Mark Needs attention and prompt reconnect; do not claim success |
| Instagram processing or rate limits delay posting | Retry within the publish deadline and provider constraints; otherwise show failure/attention |
| Network timeout after publish request | Check stored media/container state before retry; unknown outcome remains Needs attention |
| Media URL inaccessible or expired | Renew controlled delivery access and retry preparation; do not expose private storage broadly |
| Schedule time is past or ambiguous due to timezone rules | Reject past times; require selection of a valid unambiguous instant |
| User changes profile timezone | Existing schedules keep their stored UTC instant and show their original scheduling timezone |
| Cancel races with dispatch | Use an atomic state transition; if dispatch won, show that cancellation is no longer guaranteed |
| Video edited after scheduling | Existing schedule stays pinned until explicit replacement |
| Account disconnected | Cancel undispatched schedules with confirmation; in-flight outcomes are reconciled |
| App is offline at scheduled time | Apply the grace-period policy; show Missed if exceeded |
| Rights or licensing status is unsuitable | Block commercial distribution for that asset; explain regeneration requirements |

## 11. Infrastructure, security, and operational requirements

- Separate web requests from durable generation and publishing workers; store jobs and schedules persistently.
- Host the Next.js web app and Node.js backend endpoints on Vercel. Inngest orchestrates durable generation and scheduled publication. Run hosted Remotion rendering inside Vercel Sandbox, not inside a long-lived ordinary API request. Persist final media in Cloudinary before terminating the ephemeral sandbox.
- Keep Gemini, ElevenLabs, and Meta credentials server-side. Encrypt connected-account tokens and rotate secrets when needed.
- Scope storage and database access by authenticated owner; use expiring media links where suitable.
- Validate Meta authorization callbacks and restrict worker network access to intended services. Do not fetch arbitrary user URLs in V1.
- Use structured model outputs validated by our application. Never execute model-generated JavaScript, shell commands, or filesystem paths.
- Do not include tokens, private notes, full scripts, or raw audio in routine logs. Provide trace IDs and stage/error codes for debugging.
- Retry transient errors with bounded exponential backoff and jitter; proposed maximum is three attempts per stage except where a stricter rule is stated. Do not retry permanent authentication or validation failures.
- Persist schedules in UTC and use a timezone-aware UI. Atomic job claiming prevents two workers from dispatching the same operation.
- Autosave after a short edit debounce; show Saved, Saving, or Save failed accurately.
- Target accessible keyboard navigation, labeled controls, readable captions, and reduced-motion dashboard behavior. Video animation remains part of the generated product.
- Define storage retention and account deletion timing before launch; recommended draft default is asset removal within 30 days of deletion, with backup expiry disclosed separately.
- Pilot performance targets: normal saved-project loads within two seconds at p95 and acceptance of queued actions within two seconds excluding provider processing. Establish generation latency targets only after representative 30/60/90-second benchmarks on selected hardware.

## 12. Simple access and provider setup

The app is deployed on Vercel with a publicly accessible Better Auth login restricted to approved team members. Keep authentication simple and keep each user’s projects protected. A public login page does not grant public application access. No customer plans, subscriptions, checkout, credits, usage ledger, budget controls, or monitoring dashboards are required. The prototype remains zero-spend. Do not purchase services or enable paid overages.

When an API returns a quota or rate-limit error, show a simple message and a retry action where appropriate. Basic job status and technical error logs are sufficient for troubleshooting; no separate operations product is required.

Provider setup notes: Gemini free-tier limits and data treatment still apply. ElevenLabs free-plan commercial-use restrictions apply even to internal tools if their use is commercial; verify permitted use before real narration/publication. Keep this as a setup dependency rather than adding approval screens to the video flow. Remotion licensing depends on team size. These external conditions do not require building internal accounting features.

References: [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [ElevenLabs use guidance](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform), [Remotion licensing](https://www.remotion.dev/docs/license/faq), [FFmpeg licensing](https://ffmpeg.org/legal.html).

## 13. Technology and integration contracts

### Confirmed application stack

| Layer | Selected technology |
|---|---|
| Web app and backend endpoints | Next.js App Router, TypeScript, Node.js runtime |
| Authentication | Better Auth, restricted to approved team members |
| Database | MongoDB Atlas, including Better Auth records through its MongoDB adapter |
| Video, audio, and asset storage | Cloudinary |
| Web hosting | Vercel |
| Background workflows and scheduling | Inngest |
| Animation and preview | Remotion components and player |
| Hosted rendering | Remotion inside Vercel Sandbox; FFmpeg for required processing |

### Hosted execution workflow

1. An approved user submits a generation or revision request to an authenticated Next.js endpoint using the Node.js runtime.
2. The endpoint validates ownership and input, stores a job in MongoDB Atlas, sends an Inngest event, and returns the job ID promptly. Recover event-dispatch failures with a retryable pending-dispatch state keyed by that job ID.
3. Inngest executes bounded durable steps for Gemini planning, ElevenLabs narration/alignment, and our synchronization logic. Persist outputs/checkpoints in MongoDB and media in Cloudinary; events carry identifiers rather than large audio/video payloads.
4. Inngest starts or resumes tracking a render in Vercel Sandbox. The sandbox receives only validated composition data, required assets, and minimum scoped credentials. Install/package required renderer dependencies and Devanagari fonts.
5. Persist the sandbox/render identifier before polling. Use separate bounded Inngest steps to check completion; retries reconcile the existing render before creating another sandbox.
6. Upload the verified MP4 and required generated media to Cloudinary, store version-specific asset identifiers in MongoDB, and mark the revision Ready only after upload succeeds. Sandbox files are temporary and are not durable storage.
7. Stop the sandbox after durable output is confirmed, or after terminal failure/cancellation. Clean up orphaned renders without deleting assets referenced by a ready revision or scheduled post.
8. For scheduled publishing, Inngest wakes at the stored time, reads the current MongoDB publication record, atomically claims it, rechecks cancellation/account access, and publishes the pinned revision. Rescheduling invalidates the earlier schedule generation so an old wake-up becomes a no-op.

Cloudinary uploads must be authenticated server-side or use narrowly scoped signed upload authorization. Keep API secrets out of the browser. Use controlled media delivery for previews/downloads and a provider-accessible delivery URL valid for Meta's entire processing window. Store scripts, alignment, and scene metadata in MongoDB rather than using Cloudinary as a database.

No separate Express backend, Redis queue, Vercel Cron scheduler, or always-on custom worker is required for the intended architecture. Inngest orchestrates work; Vercel Sandbox performs the rendering compute. Exact SDK versions and account entitlements must be verified during setup.

Hosted rendering is selected, but it is not assumed to be unlimited or free. Verify included Vercel Sandbox capacity and the selected services' free allowances before running hosted tests. No paid upgrades are authorized; if hosted access is unavailable within the zero-spend constraint, document the blocker and use local rendering for development until resolved.

References: [Inngest Next.js integration](https://www.inngest.com/docs/getting-started/nextjs-quick-start), [Remotion on Vercel Sandbox](https://www.remotion.dev/docs/vercel), [Vercel Sandbox quotas and pricing](https://vercel.com/docs/sandbox/pricing), [Better Auth installation and adapters](https://better-auth.com/docs/installation).

### AI and publishing contracts

| Component | Selected tool | Contract |
|---|---|---|
| Ideas, scripts, scene plans, revisions | Google Gemini API | Return schema-validated content and edits; model ID configurable, not embedded throughout application |
| Narration and alignment | ElevenLabs API | Use an endpoint/model combination verified to return timing; preserve original and normalized alignment where supplied |
| Caption and animation timing | Our application | Derive caption chunks, cue anchors, scene offsets, and frame timings from audio alignment |
| Composition | Remotion in Vercel Sandbox | Render approved reusable components and validated parameters; persist outputs to Cloudinary |
| Encoding/processing | FFmpeg | Produce and validate the required output format |
| Instagram publishing | Meta official API | Official account authorization, upload/container processing, publication, and outcome reconciliation |
| Scheduling | Inngest + MongoDB Atlas | Durable UTC schedule, retries, locking, cancellation, and status |

ElevenLabs documents character-level timestamps for its speech-with-timing endpoint. Model compatibility must be tested before selecting the production voice/model. [Speech with timing](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps).

Gemini supports structured output using a subset of JSON Schema; schema validity does not guarantee factual correctness. [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).

Meta's publishing supports professional accounts and requires the appropriate authorization path and permissions. Confirm current media specifications, app review/access requirements, login path, token lifecycle, container lifetime, and rate limits during the integration spike. Do not hard-code unverified limits into the UI. General-public publishing is gated on required Meta approvals. [Meta's official Instagram API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api).

## 14. Validation and release gates

### Required end-to-end checks

1. Create, preview, and download 30-, 60-, and 90-second explainers.
2. Test numbers, abbreviations, punctuation, long words, and scene transitions for alignment.
3. Check captions and phrase-anchored visuals against audio; proposed maximum cue drift is 200 ms on the release test set.
4. Exercise script, voice, style, caption, and timing revisions and verify dependency invalidation.
5. Confirm Undo and a failed revision retain the previous downloadable video.
6. Publish and schedule with an authorized Meta test account; verify the actual posted account and content.
7. Simulate duplicate clicks, expired tokens, provider throttling, worker restarts, ambiguous publish outcomes, and cancellation races.
8. Verify cross-user access denial and absence of provider secrets in browser bundles/logs.
9. Validate portrait layout at mobile display sizes, including caption-safe areas and long labels.
10. Confirm a scheduled revision does not change after subsequent edits without explicit replacement.
11. Repeat creation, revision, timing, and export checks in both English and Hindi, including Devanagari labels, conjuncts, spoken numbers, and English technical terms inside Hindi explanations.

### Release gates

- Educator review confirms the pilot videos are understandable and visually relevant.
- All critical flows and recovery cases above pass on the selected deployment environment.
- No known critical/high-severity ownership, credential, or duplicate-publication defects remain.
- Provider failures are understandable and automatic retries are bounded.
- Commercial rights, user-facing data treatment, retention policy, and infrastructure funding are resolved for the intended release type.
- Required Meta access/approvals are obtained for the intended team accounts; otherwise publishing stays limited to permitted test users.

## 15. Delivery milestones

1. **Integration proof:** Verify Gemini structured scenes, ElevenLabs voice/timing compatibility, and a narrated animated sample. In parallel planning, establish the chosen Meta login path and review prerequisites; no additional agents are required.
2. **Creation MVP:** Dashboard and four-step flow, script approval, visual components, synchronized narration/captions, preview, and download.
3. **Revision workflow:** Chat-based structured changes, dependency-aware regeneration, version history, and recovery.
4. **Publishing workflow:** Instagram authorization, publish now, durable scheduling, rescheduling/cancellation, and reconciliation.
5. **Pilot readiness:** Approved-member authentication and project access checks, failure recovery, performance benchmarks, and team feedback.

Milestones organize implementation; captions, chat revisions, Instagram publishing, and scheduling all remain in V1 scope.

## 16. Decisions still needed before implementation or launch

| Decision | Proposed direction / consequence |
|---|---|
| Product name — resolved | Sochitra |
| Tagline | To be confirmed for Sochitra |
| Launch language — resolved | English and Hindi, selected per video |
| Prototype vs commercial launch — resolved | Zero-spend prototype with public login restricted to approved team members; verify permitted free-plan use, with commercial launch deferred |
| Main visual style — resolved | Clean animated diagrams, icons, and text |
| Gemini and ElevenLabs model/voice IDs | Select after quality, timing, quota, and terms checks |
| Application stack — resolved | Next.js/TypeScript/Node.js, Better Auth, MongoDB Atlas, Cloudinary, Vercel, Inngest, and Remotion on Vercel Sandbox |
| Subscription pricing and checkout — removed | Not required for V1 |
| Retention policy and operational deadlines | Confirm proposed values before public release |
| Duration and synchronization tolerances | Validate proposed targets with representative educational videos |

This PRD defines the complete intended V1 while keeping the customer-facing creation process to four steps.
