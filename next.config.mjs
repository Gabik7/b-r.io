import nextMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  outputFileTracingIncludes: {
    '/posts/*': ['./src/app/posts/**/*.{mdx,png,jpg,jpeg,webp,gif}'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/articles/:path*',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/videos/:path*',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/posts/:path+',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/gear',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/favicon.ico',
        destination: '/favicon/favicon.ico',
        permanent: true,
      },
    ]
  },
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ['remark-gfm', 'remark-code-filename'],
    rehypePlugins: ['rehype-prism-plus'],
  },
})

export default withMDX(nextConfig)
