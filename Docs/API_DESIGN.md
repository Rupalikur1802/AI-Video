# Sochitra — API Design

Implemented upload/workspace routes and current boundaries: [Material-to-video API additions](UPLOAD_WORKSPACE.md#api-and-storage-additions). Proposed routes elsewhere in this document are not automatically implemented.

Implemented generation endpoint: `POST /api/projects/:id/generate`, body `{expectedVersion}`, header `Idempotency-Key`, returns the reconciled workspace (202 on first enqueue, 200 for an idempotent replay). Requires ownership/current script and blocks simultaneous generation or editing. Inngest serves signed hosted events at `/api/inngest` (local development mode uses the loopback service). See [generation implementation](VIDEO_GENERATION.md).

Version: 1.0 draft · 2 November 2026  
Basis: [System architecture](SYSTEM_ARCHITECTURE.md) · [Database design](DATABASE_DESIGN.md)

## 1. Conventions

Next.js App Router route handlers run in the Node.js runtime. JSON application endpoints live under `/api`. This is the first-party V1 API; a public developer API and API-key product are outside scope.

All application endpoints require a Better Auth session, current approved-team membership, and ownership checks. Exceptions are login/auth callbacks and signed service integration endpoints. A publicly accessible login page does not grant public project access.

Use opaque string IDs externally and UTC ISO-8601 timestamps. Store IANA timezone names alongside scheduled instants. Validate requests and provider responses with Zod. Clients must never send Cloudinary secrets, Meta access tokens, or authoritative owner IDs.

### Responses

```json
{"data":{"id":"project-id","version":2}}
```

```json
{"data":{"jobId":"job-id","state":"queued"}}
```

```json
{"error":{"code":"STALE_VERSION","message":"This project changed. Reload before saving.","requestId":"trace-id","retryable":false}}
```

Use 200 for reads/updates, 201 for synchronous creation, 202 for accepted background work, and 204 for successful empty responses. Use 400 for invalid input, 401 for missing/expired session, 403 for unapproved access, 404 for absent or non-owned resources, 409 for version/state conflicts, 429 for application throttling, and 503 when a dependency prevents accepting work. Provider errors after acceptance appear on the job, not as a retroactive HTTP failure.

Collection reads use opaque cursor pagination: `?cursor=...&limit=20`, maximum 50. Return `nextCursor` or null. Sort with a stable timestamp-and-ID ordering.

### Idempotency and concurrency

Require `Idempotency-Key` on job creation, retry, proposal application, and publication creation. Scope keys to owner and operation. Persist a canonical request hash; same key/same payload returns the original result, while same key/different payload returns 409 `IDEMPOTENCY_CONFLICT`. Do not blindly create another job if the response is lost.

Draft mutations require `expectedVersion`. Updates conditionally match that version and increment it. Job input snapshots are immutable. Allow one active project mutation job; conflicting mutations return 409 `PROJECT_BUSY`. Independent status reads and downloads remain available.

## 2. Endpoint contracts

| Method and path | Request | Response / behavior |
|---|---|---|
| `/api/auth/[...all]` | Better Auth SDK contract | Identity/session handling; approval restriction applies |
| `GET /api/me` | None | Safe user profile, preferred language, connected-account summary |
| `GET /api/projects` | Cursor/limit | Own project summaries, generation state, publication summary |
| `POST /api/projects` | `title?`, `language` | 201 draft project, version, ID; owner derives from session |
| `GET /api/projects/:id` | None | Brief, settings, draft, latest ready revision, active job, version |
| `PATCH /api/projects/:id` | `expectedVersion`, permitted brief/script/settings fields | Updated project; cannot change ownership or job state |
| `DELETE /api/projects/:id` | `expectedVersion`, `cancelScheduledPosts: true` when applicable | 202 deletion job; 409 if publication already dispatching |
| `POST /api/projects/:id/ideas` | `expectedVersion`, optional seed | 202 job returning topic suggestions; does not overwrite brief automatically |
| `POST /api/projects/:id/script` | `expectedVersion` | 202 script job using saved brief; result returns to Review |
| `POST /api/projects/:id/generate` | `expectedVersion`, `scriptHash` | 202 job and immutable revision ID; server verifies hash against reviewed draft |
| `POST /api/projects/:id/revisions` | `expectedVersion`, `baseRevisionId`, `message` | 202 change-proposal job; no publication side effects |
| `POST /api/projects/:id/revisions/:revisionId/apply` | `expectedVersion`, `proposalId`, `proposalVersion`, optional reviewed narration | 202 regeneration job; only apply reviewed supported changes |
| `POST /api/projects/:id/restore` | `expectedVersion`, `readyRevisionId` | 200 selected previous ready version; existing schedules unchanged |
| `GET /api/projects/:id/revisions` | Cursor/limit | Revision history and readiness |
| `GET /api/projects/:id/messages` | Cursor/limit | Revision conversation and proposal status |
| `GET /api/jobs/:id` | None | Stage, state, result references, safe error, allowed recovery actions |
| `POST /api/jobs/:id/retry` | None beyond request key | 202 recovery job linked to failed job, reusing valid checkpoints; rejects terminal non-retryable conditions |
| `GET /api/assets/:id/playback` | None | Authorized delivery URL and expiry where supported |
| `GET /api/assets/:id/download` | None | Authorized attachment delivery/redirect for ready media |
| `GET /api/instagram/connect` | Validated same-origin return path | Redirect to Meta OAuth with server-generated state |
| `GET /api/instagram/callback` | Provider code/state | Validate and exchange server-side; redirect with safe status, never token values |
| `GET /api/instagram/connection` | None | Account name/ID and health; no access token |
| `DELETE /api/instagram/connection` | `cancelScheduledPosts` | Disconnect and cancel eligible undispatched posts; 409 if unresolved dispatch requires reconciliation |
| `POST /api/publications` | Ready revision, connection, caption, mode/timezone/time | 202 publication plus operation job ID |
| `GET /api/publications` | Project filter, cursor/limit | Own scheduled/past publication summaries |
| `GET /api/publications/:id` | None | State, pinned revision, account, schedule, provider post link if confirmed |
| `PATCH /api/publications/:id` | `expectedVersion`, time/caption/replacement ready revision | Update only before dispatch; increment schedule generation |
| `POST /api/publications/:id/cancel` | `expectedVersion` | Cancel if conditional state transition wins; otherwise conflict |
| `/api/inngest` | SDK event/signature contract | Signed internal workflow execution; not browser-authenticated |

The revision path identifies the base revision; proposal IDs are separate. Apply creates a new revision instead of mutating an existing ready one. Duplicate project creation may use idempotency as well to tolerate client retries.

## 3. Main input schemas

### Project draft

```ts
type ProjectDraft = {
  title?: string;
  topic: string;             // 1–500 characters when requesting a script
  notes?: string;            // maximum 10,000 characters
  language: 'en' | 'hi';
  audience: string;          // bounded to 200 characters
  targetSeconds: 30 | 60 | 90;
  voicePresetId: string;     // server-maintained allowed preset
  stylePresetId: string;     // known template/palette
  captionsEnabled: boolean; // defaults true
};
```

Draft creation may be incomplete. Generation requires complete valid inputs and an explicitly reviewed script. The server resolves voice/model IDs and renderer component types; clients cannot supply arbitrary providers, code, URLs, or file paths.

### Publication

```ts
type CreatePublication = {
  revisionId: string;
  connectionId: string;
  caption: string; // validate against current supported Meta constraints
  mode: 'now' | 'scheduled';
  scheduledAt?: string; // UTC ISO timestamp; required for scheduled mode
  timezone?: string;    // valid IANA name; required for scheduled mode
};
```

Publication requires an owned ready revision, eligible asset rights, healthy owned connection, and explicit submission from Publish. Scheduling checks the PRD minimum lead time and effective Inngest plan horizon. Post text and burned-in captions are independent.

## 4. Job and UI contract

```ts
type JobView = {
  id: string;
  operation: 'ideas' | 'script' | 'proposal' | 'generate' | 'delete' | 'publish';
  state: 'queued' | 'running' | 'succeeded' | 'failed' | 'needs_attention' | 'cancelled';
  stage?: 'planning' | 'narrating' | 'synchronizing' | 'rendering' | 'uploading' | 'publishing';
  progress?: number; // only when measured; otherwise omit
  result?: { revisionId?: string; proposalId?: string; publicationId?: string };
  error?: { code: string; message: string; retryable: boolean };
  updatedAt: string;
};
```

Poll active jobs approximately every 2–3 seconds with backoff when appropriate. Stop at terminal state, pause in hidden tabs, and restore status after reload. Never infer success from elapsed time. A `needs_attention` publication may still have an unknown provider outcome; Retry must not create a new publish operation blindly.

## 5. Error vocabulary

| Code | UI action |
|---|---|
| `NOT_APPROVED` | Explain team-only access |
| `STALE_VERSION` / `PROJECT_BUSY` | Refresh or wait; preserve unsaved text |
| `INVALID_INPUT` | Field-level errors |
| `SCRIPT_REVIEW_REQUIRED` / `DURATION_REVIEW_REQUIRED` | Open Review with explanation |
| `UNSUPPORTED_CHANGE` / `CLARIFICATION_REQUIRED` | Clarify in revision chat |
| `PROVIDER_RATE_LIMIT` | Wait/retry when allowed |
| `PROVIDER_ACCESS` / `VOICE_UNAVAILABLE` | Correct configuration or choose a supported voice |
| `ALIGNMENT_INVALID` / `RENDER_FAILED` | Recover affected stage |
| `CONNECTION_REAUTH_REQUIRED` | Reconnect Instagram |
| `PUBLISH_OUTCOME_UNKNOWN` | Reconcile/show Needs attention; no automatic repost |
| `SCHEDULE_MISSED` / `ALREADY_DISPATCHING` | Reschedule or display current outcome |

Keep internal provider details and tokens out of client errors. Log trace/job IDs with sanitized technical context.

## 6. Internal events

Use small versioned events: `sochitra/script.requested`, `sochitra/video.requested`, `sochitra/revision.requested`, `sochitra/publication.requested`, and `sochitra/publication.cancelled`. Data contains `schemaVersion`, `jobId` or `publicationId`, and `scheduleGeneration` when relevant. Load authoritative inputs from MongoDB. Event arrival alone is not permission to execute side effects.

## 7. Contract verification

Test ownership and approval, request-key reuse/mismatch, optimistic concurrency, duplicate dispatch, script hash mismatch, unsupported proposals, deleted assets, stale schedule generations, and uncertain publication responses. Provider integration endpoints follow their official SDK contracts rather than our JSON envelope.

This document is a design contract. Routes are not implemented yet.
