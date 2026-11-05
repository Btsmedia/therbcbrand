/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

// Where the browser may load things from. Anything else (scripts or trackers injected from another site) is refused.
const sb = supabaseHost ? `https://${supabaseHost}` : '';
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",                        // Next.js needs its own inline boot script
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${sb}`,
  `media-src 'self' blob: ${sb}`,
  `connect-src 'self' ${sb} ${sb.replace('https://', 'wss://')}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

// Browser safety settings sent with every page.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }, // always HTTPS
  { key: 'X-Frame-Options', value: 'DENY' },                    // the store can't be embedded in another site (clickjacking)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig = {
  poweredByHeader: false,
  images: { remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [], dangerouslyAllowSVG: false },
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
export default nextConfig;
