import { SEO_HUBS_DATA } from '../data/seoHubs';

export const DOMAIN = 'https://www.floate.xyz';

export function generateSitemapXML(): string {
  const currentDate = new Date().toISOString().split('T')[0];

  const mainPages = [
    { url: `${DOMAIN}/`, priority: '1.0', changefreq: 'daily' },
    { url: `${DOMAIN}/blog/how-to-get-buying-customers-for-your-whatsapp-business`, priority: '0.8', changefreq: 'monthly' }
  ];

  const hubPages = SEO_HUBS_DATA.map((hub) => ({
    url: `${DOMAIN}/solutions/${hub.slug}`,
    priority: '0.9',
    changefreq: 'weekly'
  }));

  const allUrls = [...mainPages, ...hubPages];

  const xmlUrls = allUrls.map((item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlUrls}
</urlset>`;
}

export function generateRobotsTxt(): string {
  return `# FLOATE AI Robots.txt — Market Operating System for Africa
User-agent: *
Allow: /
Allow: /solutions/*
Allow: /marketplace/*

# AI Search & Scraping Bots Allowed
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Bytespider
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
}
