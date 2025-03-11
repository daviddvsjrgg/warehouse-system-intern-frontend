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
  output: 'export',
};

export default nextConfig;
