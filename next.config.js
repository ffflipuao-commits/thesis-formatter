/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['docx', 'mammoth'],
  },
};

module.exports = nextConfig;
