import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output bundles the Next.js server for use in Electron.
  // Only enable in production builds — dev mode must NOT use standalone
  // because it breaks CSS/HMR injection in the Next.js dev server.
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    serverActions: {
      bodySizeLimit: "4mb",
    },
    // Ensure Prisma's generated client (native engine) is included in standalone
    outputFileTracingIncludes: {
      "/**": ["./node_modules/.prisma/client/**/*"],
    },
  },
};

export default withPWA(nextConfig);
