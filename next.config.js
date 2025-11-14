/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/nerima-school-gym-calender',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
