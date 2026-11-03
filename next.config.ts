import type {NextConfig} from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  experimental: {cpus: 2},
  turbopack: {root: process.cwd()},
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler', '@remotion/vercel', '@vercel/sandbox'],
  outputFileTracingIncludes: {'/api/inngest': ['./.video-bundle/**/*']},
};
export default config;
