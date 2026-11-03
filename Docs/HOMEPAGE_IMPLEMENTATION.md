# Sochitra homepage implementation

Reference: Stitch project `10281477488436873845`, desktop `661f9d22dfb046878b540290eaa27d93`, mobile `1b0322c7b38f4af7bef98b1b964044f9`.

Implemented with Next.js App Router and Node.js runtime support, TypeScript, Tailwind CSS, Lucide icons, and custom CSS design tokens. Existing CLI generation commands remain available.

## Included

- Charcoal/violet homepage matching the reference's main hierarchy and artwork.
- Responsive navigation, hero, showcase, idea/script/scene sequence, conversational demo, four-step workflow, closing CTA, and footer.
- Local copies of five reference images and a replacement SVG wordmark symbol for the reference's broken logo image.
- Concept-art previews separated from the real 30-second English sample video.
- Native modal dialogs with close controls, Escape handling, focus restoration, and background-scroll locking.
- Clearly labeled revision demonstration with a reversible visual change; no fake API generation.
- Access information dialog for sign-in/create actions until Better Auth and the creation workspace are built.
- Reduced-motion styles, skip link, English-only text, and keyboard focus styles.

## Deliberate corrections to the reference

Removed invented audio-visual accuracy percentages, fixed generation-speed claims, diffusion-render claims, 60 fps labels, and “Made with Sochitra” labels on concept artwork. Preserved the visual direction while keeping content consistent with the working prototype.

## Setup notes

`npm run dev` starts local development. `npm run build` creates a production build; `npm run start` serves it. If port 3000 is in use, launch `node node_modules/next/dist/bin/next start -p 3001`.

No production deployment or provider generation is triggered by viewing the homepage. The sample player loads the previously generated English video from Cloudinary. Provider credentials are never imported into the client component.

Existing Remotion dependencies were updated together from 4.0.539 to 4.0.540 and Zod to 4.6.7 to resolve the installation audit; the existing four timing tests passed afterward. The optional Rspack dependency reports a Node engine warning on local Node 22.11; Webpack and the existing pipeline checks run successfully. Use a supported current Node LTS version for deployment.

## Remaining application work

Better Auth, MongoDB persistence, the creation dashboard, Inngest, Sandbox hosted rendering, and Instagram publishing remain the next implementation phases described in the architecture documents.

## Verification

Production build and TypeScript checking passed. All four existing timing tests passed. Browser checks passed at 1440px and 390px for page load, image availability, horizontal overflow, access dialog, Escape dismissal, revision preview/reset, artwork modal, sample player opening, and mobile navigation. Both viewport screenshots were visually reviewed. These checks verify the player opens, not a full audio-quality review of the existing sample. The final dependency installation reported zero known audit vulnerabilities.
