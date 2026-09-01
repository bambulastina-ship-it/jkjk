/** @type {import('next').NextConfig} */

// STATIC_EXPORT=1 switches the build to a fully static export, used to produce
// the single-file shareable preview (see scripts/build-preview.mjs). The normal
// build is unaffected.
const isExport = process.env.STATIC_EXPORT === '1';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isExport ? { output: 'export' } : {}),
  images: {
    formats: ['image/avif', 'image/webp'],
    // The export target has no image optimiser, so ship the sources as-is.
    ...(isExport ? { unoptimized: true } : {}),
  },
};

export default nextConfig;
