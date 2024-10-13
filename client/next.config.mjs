/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/HomePage', // Redirects the root (/) to /homePage
          permanent: true,           // Set to true for a permanent redirect (HTTP 301)
        },
      ]
    },
  };
  
  export default nextConfig;
  