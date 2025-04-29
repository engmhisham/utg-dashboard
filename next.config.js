// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // allow any port on localhost:
        domains: ['localhost'],
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '38.242.251.48',
            port: '5000',
            pathname: '/uploads/**',
          },
        ],
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

