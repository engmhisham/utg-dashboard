// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // allow any port on localhost:
        domains: ['localhost'],
        // OR for more control, use remotePatterns:
        // remotePatterns: [
        //   {
        //     protocol: 'http',
        //     hostname: 'localhost',
        //     port: '5000',
        //     pathname: '/api/uploads/**',
        //   },
        // ],
      },
}

module.exports = nextConfig

