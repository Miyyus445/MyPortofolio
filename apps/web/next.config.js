/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "evaluasi-html-css-azmi.vercel.app" },
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
