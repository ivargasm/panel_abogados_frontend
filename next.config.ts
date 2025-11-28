import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Usamos remotePatterns en lugar del obsoleto 'domains'.
    // Esto es más seguro y flexible.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Permite cualquier ruta de imagen desde este host.
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // <-- AÑADIR ESTE BLOQUE
        port: '',
        pathname: '/**',
      },
    ],
    // Permitimos que Next.js procese SVGs.
    // Lo necesitamos porque placehold.co genera las imágenes en este formato.
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
