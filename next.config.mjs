/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.ufs.sh",   // allow all UploadThing CDNs
    },
  ],
},
};

export default nextConfig;
