import type { NextConfig } from 'next';
const apiOrigin = process.env.API_ORIGIN || 'http://127.0.0.1:8000';
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return [{source: '/media/:path*', destination: `${apiOrigin}/media/:path*`}];
  },
  async headers() {
    return [{source: '/:path*', headers: [
      {key:'X-Content-Type-Options', value:'nosniff'},
      {key:'Referrer-Policy', value:'strict-origin-when-cross-origin'},
      {key:'X-Frame-Options', value:'DENY'},
      {key:'Permissions-Policy', value:'camera=(), microphone=(), geolocation=()'},
    ]}];
  },
};
export default config;
