import {bundle} from '@remotion/bundler';
import path from 'node:path';
await bundle({entryPoint:path.resolve('src/video/generic-index.tsx'),publicDir:path.resolve('public/render-assets'),outDir:path.resolve('.video-bundle')});
console.log('Sochitra renderer bundle is ready.');
