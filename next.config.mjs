/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img.daisyui.com',
        },
      ],
  },
  output: 'export', // Full static export
  trailingSlash: true, // Needed for static routing
};

export default nextConfig;
