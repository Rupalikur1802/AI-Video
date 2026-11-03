# Sochitra — Google Stitch UI Handoff

Date: 2 November 2026  
Companion contracts: [API](API_DESIGN.md), [Database](DATABASE_DESIGN.md), [PRD](PRD.md)

## Product and style

Sochitra turns topics into educational motion-graphics videos with English/Hindi narration and captions. Create a modern, clear web application for an approved team. The video visual language is clean diagrams, icons, and text. The application should be easy to navigate and keep the video preview central.

Design the interface independently of cloud/provider configuration. Avoid billing, credit counters, budget screens, complex team administration, and timeline editing. Do not add features simply to fill the dashboard.

## Screens to design

1. Public login page, including unauthorized-team and expired-session messages.
2. Dashboard with Create video, recent projects, empty state, and real generation/publication statuses.
3. Project workspace with a compact four-step indicator:
   - Describe: topic/notes, English or Hindi, audience, 30/60/90 seconds, optional Suggest ideas.
   - Review: editable script, compact voice/style selectors, Generate button.
   - Generate and refine: stage-based loading, playable portrait video, one revision chat, change summary/apply, and Undo.
   - Download or publish: MP4 download, connected account, editable post caption, Publish now or Schedule with visible timezone.
4. Connections page with Instagram account identity, connect/reconnect, and disconnect.

Steps belong to one workspace rather than four disconnected dashboards. Include responsive layouts and keyboard/focus behavior. Hindi text needs Devanagari-capable typography and enough line height.

## Required states

- Empty dashboard, saved draft, autosaving, save failure, and stale-edit conflict.
- Generating script, review ready, queued, narrating, synchronizing, rendering, uploading, ready, and recoverable failure.
- Chat clarification, proposed change, regeneration, failed change with previous video intact, and restored version.
- Not connected, reauthorization required, publication processing, scheduled, published with link, missed, failed, and unknown outcome requiring attention.
- Scheduled video shows its pinned version; editing later must not silently replace it.
- Cancel action unavailable once publishing starts; no false “cancelled” result.

## UI-to-API mapping

Use project endpoints for autosave, job endpoints for active progress, revision/proposal endpoints for conversational changes, and publication endpoints for posting/scheduling. Show actual states rather than fixed success timers. Button clicks that start jobs remain pending until accepted and reuse their request key after network retries.

Google Stitch produces design references; production React implementation, authorization, provider integration, and workflow behavior will be built in the Next.js project. Do not put API keys or real private project data into design prompts. Stitch designs must be reconciled with these contracts before implementation.

This file is a handoff brief, not an instruction that changes V1 scope or a claim that Stitch designs have already been generated.
