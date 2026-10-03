/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Tối ưu hoá bundling đồ hoạ 3D & shared packages
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "@wrapfit/shared"],
  // Tắt source maps trong production để tiết kiệm RAM build
  productionBrowserSourceMaps: false,
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
