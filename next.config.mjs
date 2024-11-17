/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ["res.cloudinary.com"],
    },
    experimental: {
        missingSuspenseWithCSRBailout: false, // useSearchParam error was suppresed with this
      },
    
};

export default nextConfig;