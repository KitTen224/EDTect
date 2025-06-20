/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile images
      'images.unsplash.com',       // If using Unsplash images
      'maps.googleapis.com',       // Google Maps images
    ],
  },
}

module.exports = nextConfig