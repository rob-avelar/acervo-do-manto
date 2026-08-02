/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "photo.yupoo.com" },
    ],
  },
};
module.exports = nextConfig;
