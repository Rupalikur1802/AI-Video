# Sochitra — Development Roadmap

Date: 2 November 2026  
Status: Implementation plan based on the approved V1 PRD  
Related document: [Product Requirements Document](PRD.md)

## Objective

Build Sochitra in small, verifiable stages, beginning with the educational video pipeline. Prove that narration, motion graphics, and captions work together in English and Hindi before building the complete dashboard.

The final product keeps the approved four-step experience:

**Describe → Review → Generate and refine → Download or publish.**

## Agreed stack

| Area | Technology |
|---|---|
| Web app and backend endpoints | Next.js, TypeScript, Node.js runtime |
| Authentication | Better Auth, restricted to approved team members |
| Database | MongoDB Atlas |
| Video, audio, and asset storage | Cloudinary |
| Web hosting | Vercel |
| Background workflows and scheduling | Inngest |
| Ideas, scripts, scene plans, and revisions | Google Gemini API |
| Narration and alignment | ElevenLabs API |
| Captions and visual synchronization | Our own timing and rendering logic |
| Animation, composition, and preview | Remotion |
| Hosted rendering | Remotion in Vercel Sandbox |
| Media processing | FFmpeg where required |
| Instagram publishing | Meta's official Instagram API |

## Working rules

- Keep the product simple: no subscriptions, checkout, credits, usage accounting, or budget dashboards.
- Keep the prototype zero-spend. Do not buy services or enable paid overages.
- Use real integrations only when their available access and terms permit the intended use. Clearly identify mocked output; it does not count as integration validation.
- Keep provider credentials on the server and out of source control.
- Build one working path before adding options and additional templates.
- Record actual blockers and unresolved decisions rather than treating them as completed work.

## Phase 1 — Prove the video pipeline

### Deliverable

Two playable 30-second educational MP4s explaining the water cycle: one in English and one in Hindi, with clean animated diagrams, narration, and synchronized captions.

### Work

1. Set up a minimal TypeScript project and Remotion composition.
2. Define a scene schema containing narration, diagram parameters, caption text, and visual cue anchors. Use approved reusable components rather than generated executable code.
3. Integrate Gemini to produce a script and structured scene plan. Validate the response before rendering.
4. Review the script before generating narration.
5. Integrate an ElevenLabs voice/model combination that supports the selected language and timing output.
6. Generate narration and retain alignment data, including normalized spoken text where supplied.
7. Convert character alignment into readable caption chunks and timed visual cues. Derive scene durations from actual audio rather than estimated reading speed.
8. Animate evaporation arrows, cloud formation, precipitation, and corresponding labels at the relevant narration points.
9. Render locally, verify the MP4, and upload the completed media to Cloudinary.
10. Repeat for Hindi with correct Devanagari fonts, shaping, and caption wrapping.

### Completion checks

- Both language outputs contain audible narration, readable captions, and relevant motion graphics.
- No narration is cut off; the output meets the PRD's proposed duration tolerance.
- Captions and phrase-anchored visual cues meet the PRD's proposed maximum 200 ms drift on the sample checks.
- Hindi vowel marks and conjuncts display correctly and are not broken across caption chunks.
- Cloudinary output plays and downloads successfully.
- Document provider/model settings, generation time, rendering time, and any quality problems.

### Provider dependencies

Gemini and ElevenLabs credentials are required for real integration checks. ElevenLabs free-plan restrictions must be checked for the intended use; private access alone does not establish noncommercial use. If permitted access is unavailable, prepare the adapter and labeled fixtures, but mark real voice integration as blocked rather than claiming completion.

## Phase 2 — Validate hosted execution

### Deliverable

The same validated video composition renders through Vercel Sandbox, with Inngest coordinating the job and Cloudinary storing the output.

### Work

- Create a minimal Next.js Node.js endpoint that records a job in MongoDB Atlas and dispatches an Inngest event.
- Split orchestration into durable, bounded steps. Store identifiers and checkpoints rather than passing large audio/video payloads in events.
- Start a Vercel Sandbox render and persist its identifier before checking progress.
- Include renderer dependencies, required assets, and English/Hindi fonts in the hosted environment.
- Upload output to Cloudinary before stopping the ephemeral sandbox.
- Update job status in MongoDB and return progress through a simple status endpoint.
- Recover dispatch failures, sandbox errors, and interrupted status checks without blindly creating duplicate renders.

### Completion checks

- Hosted English and Hindi renders match the local composition behavior.
- The request returns a job identifier promptly instead of waiting for the entire render.
- Repeated requests and orchestration retries do not create duplicate logical jobs.
- A failed render produces an actionable error and leaves saved work intact.
- Completed output remains available after sandbox termination.
- Confirm actual account access and free allowances before running hosted tests. If zero-spend hosted access is unavailable, record that dependency and continue local development.

## Phase 3 — Build the application foundation

### Deliverable

A deployed Next.js application with approved-member authentication, project persistence, and a simple dashboard.

### Work

- Configure Better Auth with MongoDB Atlas.
- Use a simple owner-maintained approval mechanism, such as a verified-email allowlist; no team administration dashboard is required.
- Provide public login access while restricting application actions to approved members.
- Add project creation, autosave, listing, and reopening.
- Protect project records and media operations by owner.
- Deploy the web app on Vercel and configure server-side secrets.

### Completion checks

- Approved members can log in; unapproved users cannot access protected actions.
- Removing approval blocks protected actions even for an existing session.
- One user cannot read or change another user's projects.
- Reloading restores acknowledged saved work.
- Provider secrets do not appear in browser code or routine logs.

## Phase 4 — Build the four-step creation experience

### Deliverable

A user can create, preview, and download a video through the complete application.

| Step | User experience |
|---|---|
| Describe | Topic or notes, English/Hindi, audience, and 30/60/90-second duration; optional idea suggestions |
| Review | Editable explanation with compact voice and style choices; approve and generate |
| Generate and refine | Accurate progress stages, video preview, and revision chat area |
| Download or publish | MP4 download and publishing controls, enabled as their integrations become available |

### Completion checks

- Test all three target durations and both languages.
- Validate input size, unsupported requests, provider errors, and scripts that do not fit the selected duration.
- Preserve the script for review rather than silently rewriting approved educational content to fit.
- Browser closure does not lose a server-side job; reopening restores its status.
- Users never need to approve a separate storyboard or learn a timeline editor.
- Publishing controls remain clearly unavailable until the publishing phase is implemented; no simulated success messages.

## Phase 5 — Add conversational revisions

### Deliverable

Users request supported changes in plain language and receive a new video revision while retaining the previous ready version.

### Supported initial requests

- Simplify the explanation or change the example.
- Adjust captions, colors, or visual emphasis.
- Slow down a diagram animation within the available scene timing.
- Change the voice or supported output language.

### Work and completion checks

- Gemini returns validated structured changes against a specific base revision.
- Ask one concise clarification when a request is ambiguous.
- Review changed narration before generating it.
- Reuse audio for visual-only changes; regenerate affected narration and downstream timing when speech changes.
- Preserve immutable ready versions and provide Undo.
- Reject stale revisions rather than overwriting newer work.
- Chat requests cannot publish content, connect accounts, or execute arbitrary code.
- A failed revision leaves the last ready video playable and downloadable.

## Phase 6 — Add Instagram publishing and scheduling

### Deliverable

An approved member connects an eligible Instagram account, publishes a ready video, or schedules it through Inngest.

### Early preparation

Investigate Meta login options, required permissions, account eligibility, and review requirements during the initial integration work. Approval dependencies may take time even though full publishing implementation happens in this phase.

### Work

- Add official Meta authorization and show the connected destination account.
- Keep the Instagram post caption separate from burned-in video captions.
- Validate media and rights before publication.
- Create/process the media container and confirm publication before showing success.
- Store provider identifiers so uncertain responses can be reconciled before retrying.
- Save each schedule with its exact ready video revision, caption, account, UTC instant, and displayed timezone.
- Use Inngest for scheduled execution. Recheck current MongoDB state at dispatch so cancelled or superseded schedules do not publish.
- Support rescheduling, cancellation, reconnect-required states, and missed schedules.

### Completion checks

- Publish and schedule successfully with a permitted test account.
- Repeated clicks do not create duplicate posts.
- Token expiry produces a reconnect action rather than false success.
- Editing a video does not silently replace a scheduled version.
- Verify cancellation races, timezone display, and delayed execution against PRD rules.
- Explain clearly when Meta permissions, provider terms, or account eligibility prevent real publication.

## Phase 7 — Team pilot and V1 completion

### Deliverable

A usable V1 deployed for the approved team, with all required creation and publishing workflows verified.

### Validation

- Have team members create real explainers in English and Hindi.
- Review educational clarity, narration pronunciation, visual relevance, and caption readability.
- Test generation failures, provider throttling, save failures, interrupted rendering, duplicate actions, and publishing recovery.
- Verify access control and sensitive-data handling.
- Benchmark actual generation and rendering times before setting expectations in the UI.
- Resolve critical defects and document remaining external limitations.

V1 is complete when the PRD's required features and release checks pass, not merely when the dashboard is finished.

## Immediate next action

Begin Phase 1 with the 30-second water-cycle example. Its first concrete result is an English MP4, followed by the Hindi version. Then validate the same rendering path in Vercel Sandbox before expanding the interface.

No calendar deadline is assumed. Estimate delivery dates after the initial pipeline and hosted-rendering proof reveal actual integration complexity.
