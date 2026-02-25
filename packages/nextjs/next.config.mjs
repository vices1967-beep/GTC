/** @type {import('next').NextConfig} */
import webpack from "webpack";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  logging: { incomingRequests: false },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "identicon.starknet.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.starkurabu.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  // ✅ Proxy para ambos endpoints del backend ZK
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://miniature-palm-tree-pjqg75xvjjrjfggr-3001.app.github.dev';
    return [
      // Endpoint de selección (finalización)
      {
        source: '/api/zk-proof',
        destination: `${backendUrl}/api/zk-proof`,
      },
      {
        source: '/api/zk-proof/:path*',
        destination: `${backendUrl}/api/zk-proof/:path*`,
      },
      // Endpoint de pago
      {
        source: '/api/zk-payment',
        destination: `${backendUrl}/api/zk-payment`,
      },
      {
        source: '/api/zk-payment/:path*',
        destination: `${backendUrl}/api/zk-payment/:path*`,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:(.*)$/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      }),
    );
    if (dev && !isServer) {
      config.infrastructureLogging = { level: "error" };
    }
    return config;
  },
};

export default withPWA(nextConfig);