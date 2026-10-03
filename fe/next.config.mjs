/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Tối ưu hoá bundling đồ hoạ 3D
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  // Tắt source maps trong production để tiết kiệm RAM build
  productionBrowserSourceMaps: false,
};

export default nextConfig;
