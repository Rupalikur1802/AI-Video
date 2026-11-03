# Sochitra — Team login and dashboard

Date: 3 November 2026

Local sign-in uses **http://localhost:3001/login**, matching `BETTER_AUTH_URL` and the registered Google callback `http://localhost:3001/api/auth/callback/google`. `npm run dev` now uses port 3001. Local login requests on another address redirect to the configured address before starting OAuth, so cookies are not split between `127.0.0.1` and `localhost`. Stop an older Sochitra server on this port before starting a new one.

## Design references

Stitch project `10281477488436873845`:

- Sign-in desktop: `9cf1ab0e31a24fe6b429502ddbb81fb0`.
- Sign-in mobile: `5544a16e05ee40feb9881ec6db5e441a`.
- Dashboard desktop: `db21b8538f454d37808d97aa514e8337`.
- Dashboard mobile: `3a89464b72964bb2b2d46742033e64cc`.

The implementation preserves the charcoal/violet visual system and locally saved artwork. It omits the reference's fake build numbers, 4K/60 fps claims, enterprise-plan labels, and credit statements. State-preview controls are isolated to public sample-data pages rather than the authenticated dashboard.

## Routes

| Route | Behavior |
|---|---|
| `/login` | Google sign-in UI; shows setup-pending information if configuration is missing |
| `/dashboard` | Server-validated Better Auth session, verified allowlisted email, then own-project dashboard |
| `/preview/dashboard` | Public visual preview with fixed illustrative sample projects; never reads real projects or sessions |
| `/preview/login?state=error` | Disabled-auth visual state preview; other examples: `unapproved`, `expired` |
| `/api/auth/[...all]` | Better Auth handler using MongoDB Atlas |
| `GET /api/projects` | Own active project summaries; initial implementation caps results at 100 |
| `POST /api/projects` | Create an owned draft; request-key deduplication |
| `PATCH /api/projects/:id` | Rename with expected-version concurrency check |
| `DELETE /api/projects/:id` | Soft-delete a draft without generated media or active publishing |
| `POST /api/projects/:id/duplicate` | Copy title/brief into a new draft, without media or schedules |

The initial draft API is a subset of the complete API design. Cursor pagination, script/revision endpoints, asynchronous cleanup, and actual publishing remain future work. Do not treat placeholder buttons as a connected generation service.

## Security boundaries

- Empty approval list means no access, not open registration.
- Approvals match exact normalized email addresses and require verified identity.
- User creation and new sessions check approval through Better Auth hooks.
- Every protected page and project request rechecks approval, including existing sessions after membership removal.
- Email/password login and account linking are disabled; verified identity changes through profile APIs are blocked.
- Project owner comes from the server session; input schemas reject injected owner fields.
- All database operations include owner filters; IDs are validated.
- Mutation endpoints validate the request origin against `BETTER_AUTH_URL`.
- MongoDB uses a cached connection pool; database/provider credentials never reach browser modules.
- Real APIs do not return or accept preview identities as authorization. Preview edits exist only in React state and reset on reload.

## Setup

Add these values to the project's `.env.local`, never to chat or committed files:

```dotenv
MONGODB_URI=
MONGODB_DB=sochitra
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPROVED_EMAILS=
```

An initial random local Better Auth secret and local URL/database defaults were generated without printing the secret. Preserve it across local restarts. If changed, existing sessions will need reauthentication.

For Google Cloud OAuth, choose a Web application client and register the exact authorized redirect URI:

```text
http://localhost:3001/api/auth/callback/google
```

If your local port is different, change both `BETTER_AUTH_URL` and Google's redirect URI. The production domain needs its own exact callback. Configure consent-screen test users when required by the Google application's publishing status. The app's approval list remains a separate restriction.

`APPROVED_EMAILS` is a comma-separated list of exact Google account emails. Do not enter wildcards or domain names.

For MongoDB Atlas, use a database access user and its password, not the Atlas website account password. Percent-encode special characters in the username/password portions of the URI. Configure Atlas Network Access for the deployment environment and grant appropriate privileges on the intended application database.

Restart Next.js after changing environment values. `npm run dev` runs development; `npm run build` then `node node_modules/next/dist/bin/next start -p 3001` runs this local production preview.

Once Atlas credentials work, run `npm run db:setup` to create the authentication and project indexes. This setup is idempotent; it does not delete or seed user data. Then sign in with an approved Google account and verify persistence on the real dashboard.

## Verification and current limitation

- Production build and TypeScript checks passed.
- All nine unit tests passed: email approval normalization, fail-closed behavior, removed approval, strict project input/concurrency validation, and existing narration-timing tests.
- Browser checks passed at 1440px and 390px for sign-in layout, anonymous dashboard rejection, project API access rejection, wrong-origin mutation rejection, preview search/filter/sort controls, view modes, create/rename/duplicate/delete interactions, loading/empty/error states, and mobile navigation.
- Homepage regression checks passed after routing its sign-in/create actions to `/login`.
- Desktop and mobile dashboard screenshots plus desktop login were visually inspected.
- After the database credentials were corrected, Atlas authentication succeeded and `npm run db:setup` initialized authentication/project indexes. The app was restarted with the corrected environment. The Google sign-in endpoint returned HTTP 200 with an `accounts.google.com` authorization redirect. Completing the Google callback, creating an approved session, and authenticated project persistence/isolation still require real-user sign-in verification.

No authentication bypass or substitute local database was introduced to hide this blocker.

## Remaining product work

The dashboard saves basic drafts once authentication/database access work. It does not yet implement the four-step video workspace, generation jobs, revision services, Meta connections, or scheduled publication. Those remain the next architecture phases. A new live account starts empty; sample projects are never seeded into real accounts.
