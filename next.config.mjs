import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const withNextIntl = require('next-intl/plugin')(
  './lib/i18n/i18n.ts'
);

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    instrumentationHook: true
  }
};

export default withNextIntl(nextConfig);
