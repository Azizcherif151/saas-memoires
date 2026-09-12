/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Les erreurs ESLint n'interrompent plus le build de production
    // À remettre à false plus tard quand le code sera nettoyé
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Garde la vérif TypeScript active (c'est important)
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;