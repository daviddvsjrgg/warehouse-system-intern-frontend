/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'img.daisyui.com',
          },
        ],
      },
};

export default nextConfig;
