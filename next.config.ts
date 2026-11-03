import type {NextConfig} from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  turbopack: {root: process.cwd()},
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
};
export default config;
