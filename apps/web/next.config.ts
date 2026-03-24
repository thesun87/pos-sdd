import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@pos-sdd/ui', '@pos-sdd/shared', '@pos-sdd/database'],
};

export default nextConfig;
