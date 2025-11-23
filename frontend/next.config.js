/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable SWC minification to avoid React import issues
  experimental: {
    forceSwcTransforms: false,
  },
  // Ensure static export works properly
  distDir: "out",
  // Skip API routes for static export
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
