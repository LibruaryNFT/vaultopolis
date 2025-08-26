/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://vaultopolis.com",
  generateRobotsTxt: true, // also writes robots.txt for you
  changefreq: "weekly",
  priority: 0.7,
  
  // Additional sitemap configuration
  sitemapSize: 7000,
  
  // Transform function to customize URLs
  transform: async (config, path) => {
    // Custom priorities for different page types
    let priority = config.priority;
    let changefreq = config.changefreq;
    
    // Main pages
    if (path === '/') {
      priority = 1.0;
      changefreq = 'weekly';
    }
    
    // About page
    if (path === '/about') {
      priority = 0.8;
      changefreq = 'monthly';
    }
    
    // Guides main page
    if (path === '/guides') {
      priority = 0.9;
      changefreq = 'weekly';
    }
    
    // Individual guide pages
    if (path.startsWith('/guides/')) {
      priority = 0.7;
      changefreq = 'monthly';
    }
    
    // Quick start guide (higher priority as entry point)
    if (path === '/guides/quick-start') {
      priority = 0.8;
      changefreq = 'monthly';
    }
    
    // Core platform pages
    if (['/swap', '/tshot'].includes(path)) {
      priority = 0.8;
      changefreq = 'daily';
    }
    
    // Other important pages
    if (['/transfer', '/stats'].includes(path)) {
      priority = 0.6;
      changefreq = 'weekly';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  
  // Additional paths to include
  additionalPaths: async (config) => {
    const result = [];
    
    // Add guide pages with custom metadata
    const guides = [
      '/guides/quick-start',
      '/guides/dapper-wallet',
      '/guides/flow-wallet',
      '/guides/account-linking',
      '/guides/nft-to-tshot',
      '/guides/tshot-to-nft'
    ];
    
    guides.forEach(guide => {
      result.push({
        loc: guide,
        changefreq: 'monthly',
        priority: guide === '/guides/quick-start' ? 0.8 : 0.7,
        lastmod: new Date().toISOString(),
      });
    });
    
    return result;
  },
  
  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/private/', '/api/', '/_next/', '/static/'],
      },
    ],
    additionalSitemaps: [
      'https://vaultopolis.com/sitemap.xml',
    ],
  },
};
