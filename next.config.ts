import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Force logging to verify config is loaded
  ...(console.log("[NEXT-CONFIG] Standalone output enabled at:", 
    new Date().toISOString()), {}),
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-c7dbc73a-aebc-4bb8-8242-925e881ddff1.space-z.ai",
    "*.space-z.ai",
  ],
};

export default nextConfig;
