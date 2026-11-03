# Sochitra — Material-to-video workspace

Implemented 3 November 2026. This expands the original idea-only input scope. Related: [PRD](PRD.md), [API design](API_DESIGN.md), [database](DATABASE_DESIGN.md).

## Available now

The approved-team dashboard opens a real project at `/projects/:id`. New drafts open the same workspace immediately after creation. The responsive workspace follows **Describe → Review → Refine → Share**, based on Stitch project `10281477488436873845`, uploaded-material screen `1e75414ba3d347cea920607581e5f664`.

The dashboard and workspace share `StudioSidebar` and `StudioTopbar` from `src/components/studio-chrome.tsx`. Brand artwork, navigation labels/icons, active states, account controls, sidebar widths, collapse, mobile drawer, and topbar geometry come from the existing dashboard styles. Workspace cards and heading spacing follow the same visual system. Preview draft creation and the sample draft's Continue action open the workspace; sample data remains explicitly labeled. Account and Connections actions open the dashboard's existing panels.

The dashboard also exposes **Upload material** beside **Create video** (and in the empty-project state). In the live app, this creates a private “Untitled upload” draft and opens its upload tab directly, without a naming dialog. `POST /api/projects` accepts optional `inputMode: "idea" | "upload"` (default `idea`) and persists the initial `workspaceDraft`; the upload entry therefore survives a reload. The preview action opens the labeled workspace preview without creating a database record.

1. **Describe:** enter an idea or upload one PDF, PPTX, or UTF-8 TXT file. Choose English/Hindi narration, 30/60/90 second target, audience, and summary/specific-topic focus. Review extracted text before requesting a script.
2. **Review:** Gemini creates a scene-based script. Edit narration and title; inspect source references and exact supporting quotations; select a motion style and captions. Sarah is the existing ElevenLabs multilingual voice preset, rather than the invented voices in the mockup.
3. **Refine:** request a conversational script revision, review the complete proposed script, and explicitly apply or discard it. Applying changes saves the script; it does not replace an existing video.
4. **Share:** a ready media revision can be downloaded through an authenticated asset route. Without a completed render, the screen explains what remains. Instagram publishing is unavailable until its integration is implemented.

Changes are saved explicitly with **Save changes** and before progressing. Responses use optimistic version checks; conflicts retain local edits for review. Topic, language, focus, duration, audience, or source changes invalidate the prior script. Regenerate it before continuing.

## Source processing and boundaries

- One source per project, up to **4 MB**, **60 PDF pages/PPTX slides**, and **100,000 extracted characters**. This intentionally replaces the design's 50 MB placeholder to stay below Vercel's function request limit.
- PDF text extraction: `unpdf`; PPTX text extraction: bounded `yauzl` streaming plus `fast-xml-parser`; TXT: strict UTF-8 decoding.
- PPTX archive expansion is limited to 25 MB, 2,500 entries, and 2 MB per slide XML. Duplicate slide IDs and entity/doctype declarations are rejected. Archive contents are never extracted onto disk.
- Password-protected PDFs, malformed files, binary notes, unsupported extensions, and files with no useful text get actionable errors.
- OCR, handwriting, images, diagrams embedded as images, speaker notes, legacy `.ppt`, DOCX, and reproduction of original slide layouts are not implemented. The result is intended to be a new motion-graphics explainer.
- Files use authenticated Cloudinary raw storage; extracted text lives in MongoDB. No original-file delivery URL is exposed to the browser. Text is sent to Gemini only when the user requests generation/revision.
- References must identify actual extracted units, and evidence quotations must match their text exactly. This validates provenance, not semantic truth: users still review the explanation and any manual edits.
- Script-generation reliability update: Gemini receives a JSON Schema and bounded, server-created source snippets. It selects snippet IDs; the server derives page/slide references and copies exact quotations from those snippets. Model-written quotations are not trusted. This avoids brittle character-by-character copying of PDF whitespace while retaining strict evidence validation. Incomplete, blocked, malformed, and unknown-reference responses have distinct error codes.
- Previously attached private sources are retained for revision history. Full source retention/cleanup policy and account deletion are future work; removing a source detaches it rather than immediately destroying its storage record.

## API and storage additions

All project APIs require an approved session and ownership. Mutations require the configured same-origin header. Responses follow `{data: ...}` / `{error: {code, message, requestId}}`.

| Endpoint | Request | Behavior |
|---|---|---|
| `GET /api/projects/:id/workspace` | — | Project, editable draft, extracted source, script, revision summaries |
| `PATCH /api/projects/:id/workspace` | `{expectedVersion, draft}` | Save validated draft with compare-and-swap version |
| `POST /api/projects/:id/source` | Multipart `file`, `expectedVersion` | Bound request, extract, privately store file, atomically attach source |
| `DELETE /api/projects/:id/source` | `{expectedVersion}` | Detach source; retain historical private record |
| `POST /api/projects/:id/script` | `{action: "generate", expectedVersion}` | Generate and validate a script, then save it |
| Same | `{action: "save", expectedVersion, script}` | Validate references and save manual/applied revision |
| Same | `{action: "propose", expectedVersion, instruction}` | Return proposed script + baseVersion without changing saved script |
| `GET /api/assets/:id/playback` | Optional `download=1` | Check owner + project and redirect to an expiring private MP4 URL |

`projects` adds `workspaceDraft`, `workspaceScript`, `scriptContextHash`, `sourceId`, and a temporary `scriptLock {id, expiresAt}`. Successful edits increment `version`. Script-generation locks expire and are recovered on project reads. Existing generated-media jobs prevent workspace mutations.

`sources` stores `_id`, `ownerId`, `projectId`, original `name`, `kind`, byte count, unit count, extracted `units [{id,label,text}]`, extraction warnings, private Cloudinary `publicId`, `createdAt`, and `schemaVersion`. File upload happens before a MongoDB transaction; failed attachment destroys the newly uploaded orphan. Unit IDs are `page-N`, `slide-N`, or `notes-1`. New collection uses only `_id` lookups scoped by owner/project; additional indexes can be added when list/cleanup queries are introduced.

## Remaining integration work

Local source/idea → approved script → narration/render → private preview/download is now connected and verified in English and Hindi. See [Video generation implementation](VIDEO_GENERATION.md) for current behavior and running instructions.

The hosted Vercel Sandbox adapter is implemented but requires credentials and live verification before deployment. Instagram OAuth, publishing, scheduling, and retry/reconciliation remain pending. No paid services or billing were enabled.

## Verification

- `npm run check`, `npm test`, `npm run check:script`, `npm run build`.
- `node scripts/check-workspace.mjs` against `PREVIEW_URL`: desktop/mobile UI, TXT upload and validation, narration settings, script edits, illustrative proposal/apply, share gating, ownership/login guards, and overflow checks.
- `node scripts/check-studio-chrome.mjs`: compare sidebar/topbar geometry and brand at 1440/900/768/390 px; verify collapse, mobile drawer, Connections, and Account navigation.
- `/preview/workspace` is explicitly labeled and saves no data. It reads local TXT notes, uses illustrative scripts, and never calls Gemini. Live PDF/PPTX processing and Gemini require an approved signed-in account.
- A full human Google OAuth session and a live private upload/Gemini request were not automated in this verification. Parser and provider contract checks use fixtures/mocks; the preview is not evidence of a live AI video render.
