import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDirectory = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-router'],
  turbopack: {
    root: appDirectory,
  },
}

export default nextConfig
